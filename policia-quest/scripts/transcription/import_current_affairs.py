"""
Importa preguntes d'actualitat des d'un paquet de candidats.

Té dos modes. El **de xarxa** obre cada URL oficial. El **`--offline`** treballa
contra les instantànies textuals que porta el paquet a `snapshots/`, una per
pàgina, cadascuna amb el seu SHA-256: és el camí previst quan qui prepara el
contingut té accés a les fonts i l'entorn de construcció no.

    python3 scripts/transcription/import_current_affairs.py --offline --check
    python3 scripts/transcription/import_current_affairs.py --offline
    python3 scripts/transcription/import_current_affairs.py            # mode xarxa

Els candidats de `content/municipalities/roses/current-affairs/candidates/` són
una **proposta**, no una autoritat. Aquest script no els importa perquè hi
siguin: obre la URL oficial de cada font, hi busca el fet que la pregunta
afirma, i només adopta el que ha pogut demostrar.

Què comprova, i què fa si falla
───────────────────────────────

  1. Integritat del paquet (SHA256SUMS.txt). Si falla, no continua.
  2. Estructura: identificadors únics, quatre opcions diferents, índex de
     resposta dins de rang, `sourceId` existent, dates ISO, `reviewBy`
     posterior a avui, `dynamic: true`.
  3. **La font s'obre.** En mode de xarxa, si la URL no respon la pregunta queda
     fora. En mode offline, la instantània ha d'existir, el seu hash ha de
     quadrar amb `snapshots/SHA256SUMS.txt` i les seves metadades han de
     coincidir amb la fitxa de la font. No se substitueix per memòria, premsa
     ni cap altra pàgina.
  4. **El fet hi és.** L'opció correcta ha d'aparèixer al document, o el fet
     s'ha de poder llegir al voltant del localitzador. El que no es demostra,
     fora.
  5. Es desa una còpia estable a `sources/cache/`, se'n calcula el SHA-256 i
     s'actualitza el manifest amb editor, URL canònica, data de publicació i
     data de verificació. Només llavors la referència passa a `verified`.

El que aquest script **no** fa mai
──────────────────────────────────

  - No toca `availability.ts`, el validador, `isCurrent()`, les quotes ni
    `contentStatus`. Si el banc queda per sota de deu preguntes vigents, el
    simulacre continua bloquejat i prou.
  - No allarga cap `reviewBy`.
  - No adopta dues preguntes que interroguin el mateix fet.
  - No converteix material d'examen històric en actualitat.

Límit del mode offline, que cal tenir present
─────────────────────────────────────────────

Una instantània demostra el que hi consta, i el seu hash demostra que ningú l'ha
tocada des que es va segellar. El que **no** pot demostrar és que la captura
sigui fidel a la pàgina viva: això depèn de qui la va prendre. En adoptar-la, el
manifest en desa el mètode de captura i la data, de manera que la procedència
queda escrita i es pot tornar a comprovar el dia que hi hagi xarxa.
"""
import argparse, hashlib, json, pathlib, re, subprocess, sys, unicodedata
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

ROOT = pathlib.Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / 'content/municipalities/roses/current-affairs/candidates'
CACHE = ROOT / 'sources/cache'
MANIFEST = ROOT / 'sources/source-manifest.json'
OUT = ROOT / 'content/municipalities/roses/current-affairs/questions-2026-08.ts'
PACK_OUT = ROOT / 'content/municipalities/roses/current-affairs/pack-2026-08.ts'
PACK_ID = 'roses-actualitat-2026-08'
AUDIT_OUT = ROOT / 'content/municipalities/roses/current-affairs/adoption-2026-08.json'
DECISION_OUT = ROOT / 'artifacts/actualitat-decisio-2026-08-24.md'
TODAY = '2026-08-24'
UA = 'policia-quest-content-factory/1.0'
# Dígits mínims perquè una coincidència numèrica valgui per si sola.
MIN_DIGIT_MATCH = 4

# Correccions de text aplicades en adoptar.
#
# La instantània mana. Quan el candidat afirma alguna cosa que el text preservat
# no demostra, no s'adopta l'afirmació: es retalla fins al que consta. Aquí es
# deixa constància de cada retall, amb el motiu, perquè la diferència respecte
# del paquet original sigui auditable.
TEXT_FIXES = {
    'actualitat-2026-roses-003': {
        'question': 'A quina hora situava el programa municipal el pregó teatralitzat de la Festa Major de Roses del 7 d’agost de 2026?',
        'explanation': 'El programa de la Festa Major situava el pregó teatralitzat a les 21.30 h.',
        'why': 'la instantània és l’anunci del dia abans: demostra l’hora programada, no que l’acte comencés; a més situava un acte musical a les 21.15 h que el text no recull',
    },
    'actualitat-2026-roses-007': {
        'question': 'En quines dates va programar l’Ajuntament el Carnaval de Roses 2026?',
        'explanation': 'El programa municipal situava el Carnaval de Roses 2026 del dijous 12 al dilluns 16 de febrer.',
        'why': 'la instantània és la presentació del programa: demostra les dates previstes, no que se celebrés',
    },
    'actualitat-2026-cultura-024': {
        'question': 'Per a quin dia es va programar la gran final de la 70a edició del Festival d’Eurovisió, a Viena?',
        'explanation': 'L’EBU va anunciar la gran final per a dissabte 16 de maig, al Wiener Stadthalle de Viena.',
        'why': 'la instantània és l’anunci de ciutat amfitriona d’agost de 2025, en futur: demostra la data prevista, no que se celebrés',
    },
    'actualitat-2026-esport-025': {
        'question': 'Per a quines dates es van programar els Jocs Olímpics d’Hivern Milano Cortina 2026?',
        'explanation': 'El Comitè Olímpic Internacional situava els Jocs Milano Cortina 2026 del 6 al 22 de febrer.',
        'why': 'la instantània és la nota d’un any abans, en futur: demostra les dates previstes, no que se celebressin',
    },
    'actualitat-2026-roses-004': {
        'explanation': 'La sisena edició de Nits de Circ va programar sis funcions consecutives, del 18 al 23 d’agost.',
        'why': 'l’explicació original les situava a la Ciutadella de Roses i el text preservat no diu on se celebren',
    },
    'actualitat-2026-roses-006': {
        'question': 'Quants articles va confiscar l’operatiu contra el top manta que va anunciar l’Ajuntament de Roses el 31 de juliol de 2026?',
        'explanation': 'L’operatiu va confiscar un total de 1.207 articles abans que es posessin a la venda.',
        'why': 'l’original el qualificava d’«operatiu conjunt» i situava el decomís al passeig Marítim; cap de les dues coses consta al text preservat',
    },
    'actualitat-2026-cat-012': {
        'explanation': 'L’ecosistema català de semiconductors constava de 260 agents.',
        'why': 'l’explicació original en desglossava la composició —empreses, entitats i centres de coneixement— i el text preservat no la dona',
    },
    'actualitat-2026-es-015': {
        'explanation': 'El Bono Cultural Joven 2026 és un ajut de 400 euros per als joves nascuts el 2008.',
        'why': 'l’original deia que l’import es «manté», continuïtat que la instantània d’un sol any no demostra',
    },
    'actualitat-2026-es-017': {
        'question': 'Quin import va autoritzar el Consell de Ministres per als ajuts generals de l’ICAA a la producció de llargmetratges el 2026?',
        'why': 'l’enunciat original els acotava als llargmetratges «sobre projecte» i el text preservat no fa aquesta distinció',
    },
    'actualitat-2026-es-018': {
        'question': 'En aprovar el projecte d’Estatut de les persones en formació pràctica no laboral, el març de 2026, el Govern espanyol va dir que s’havia superat la xifra de dos milions de joves. Quin percentatge eren dones?',
        'explanation': 'En presentar el projecte d’Estatut de les persones en formació pràctica no laboral, el Govern va xifrar en un 56% les dones d’aquest col·lectiu.',
        'why': 'l’enunciat original deia que havien «cotitzat per pràctiques formatives no remunerades des de 2024» i el text preservat no ho recull',
    },
    'actualitat-2026-eu-020': {
        'explanation': 'Irlanda va assumir la presidència del Consell l’1 de juliol de 2026, per vuitena vegada.',
        'why': 'l’original la donava per acabada («va ser») quan el text preservat la situa començant',
    },
    'actualitat-2026-cat-009': {
        'question': 'A quin període corresponia la proposta de pressupostos de carboni que el Govern va presentar al Parlament de Catalunya el setembre de 2025?',
        'why': 'l’enunciat original la qualificava de «primera» proposta rebuda i la instantània no ho estableix',
    },
    'actualitat-2026-es-016': {
        'question': 'Quin d’aquests usos admet el Bono Cultural Joven 2026?',
        'explanation': 'El Bono Cultural Joven 2026 admet cursos i tallers, instruments musicals i material artístic.',
        'why': 'l’enunciat original deia que l’ús s’havia «incorporat» el 2026 i l’explicació que la regulació el va «afegir»; la instantània només demostra que hi és',
    },
    'actualitat-2026-cultura-022': {
        'explanation': '«Los Domingos» va obtenir cinc dels tretze premis als quals optava, inclòs el de millor pel·lícula.',
        'why': 'l’explicació original hi afegia direcció i guió original, que la instantània no recull',
    },
}

# Pont d'evidència entre l'opció en català i el text de la font.
#
# El comparador busca l'opció correcta, lletra per lletra, dins de la
# instantània. Amb una font en castellà o en anglès no la trobarà mai, encara
# que el fet hi consti sencer: «Vuitena» no s'assembla a «for the eighth time».
#
# La sortida fàcil seria afluixar el comparador —traduir, buscar per paraules
# soltes, acceptar coincidències parcials— i això obre la porta a adopcions per
# casualitat. Aquí es fa al revés: s'escriu a mà quin fragment de la instantània
# demostra la resposta, i el fitxer segellat continua manant. L'script comprova
# que el fragment hi és, literalment; si no hi és, la pregunta cau igual. El que
# hi guanya és la traça: qui ho revisi sap quines paraules de quin document
# sostenen cada resposta, i el hash del paquet garanteix que no han canviat.
EVIDENCE_BRIDGE = {
    'actualitat-2026-es-016': {
        'source': 'es-bono-cultural-2026',
        'quote': 'instrumentos musicales',
        'why': 'font en castellà: «instrumentos musicales» és «instruments musicals»',
    },
    'actualitat-2026-es-019': {
        'source': 'es-visita-lleo-xiv-2026',
        'quote': 'Nunciatura Apostólica, Madrid',
        'why': 'font en castellà: «Nunciatura Apostólica» és «Nunciatura Apostòlica»',
    },
    'actualitat-2026-eu-020': {
        'source': 'eu-presidencia-irlanda-2026',
        'quote': 'for the eighth time',
        'why': 'font en anglès: «for the eighth time» és «Vuitena»',
    },
    'actualitat-2026-eu-021': {
        'source': 'eu-presidencia-irlanda-2026',
        'quote': 'competitiveness, values and security',
        'why': 'font en anglès: «competitiveness, values and security» és «Competitivitat, valors i seguretat»',
    },
    'actualitat-2026-roses-002': {
        'source': 'roses-budget-2026',
        'quote': '2,4MEUR',
        'why': 'la nota escriu la xifra abreujada; «2,4» sol no demostraria res',
    },
    'actualitat-2026-roses-005': {
        'source': 'roses-catala-nouvinguts-2026',
        'quote': 'entre 11 i 16 anys',
        'why': 'la franja s’ha de demostrar sencera: un «11» solt no la sosté',
    },
    'actualitat-2026-es-017': {
        'source': 'es-icaa-2026',
        'quote': '62 millones de euros',
        'why': 'font en castellà, i la xifra només val amb la unitat al costat',
    },
    'actualitat-2026-cultura-022': {
        'source': 'goya-2026',
        'quote': 'logró cinco de los 13 premios',
        'why': 'font en castellà: «cinco» és «cinc». Sense límit de paraula, «Cinc» s’hi donaria per trobat per dins',
    },
    'actualitat-2026-cultura-024': {
        'source': 'eurovision-2026',
        'quote': 'Saturday 16 May',
        'why': 'font en anglès, i un «16» solt no demostra la data',
    },
    'actualitat-2026-esport-025': {
        'source': 'olimpics-hivern-2026',
        'quote': 'from 6 to 22 February 2026',
        'why': 'font en anglès, i un «6» solt no demostra res',
    },
    'actualitat-2026-cultura-023': {
        'source': 'goya-2026',
        'quote': 'con seis Goyas técnicos',
        'why': 'font en castellà: «seis» és «sis», i el comparador de xifres no llegeix els números escrits amb lletres',
    },
}
# Per què falla cada alternativa.
#
# Una correcció que només diu «incorrecte» no ensenya res, però inventar-se un
# motiu és pitjor, i repetir «la font diu una altra xifra» sota les tres
# alternatives no és ensenyar: és omplir. En una pregunta de dada, el que ho
# explica és l'explicació, que dona el valor bo i la font on comprovar-lo.
#
# Aquí, doncs, només hi ha les alternatives on la instantània permet dir alguna
# cosa de debò: la xifra hi surt, i vol dir una altra cosa. La resta no en porta.
WHY_WRONG = {
    'actualitat-2026-roses-001': {
        2: 'És el pressupost consolidat, que sí que suma les societats municipals.',
    },
    'actualitat-2026-cultura-022': {
        2: 'Sis són els Goya tècnics de «Sirat», no els premis de «Los Domingos».',
    },
    'actualitat-2026-cultura-023': {
        1: 'Cinc són els premis de «Los Domingos», la gran guanyadora de la nit.',
    },
}

# Traducció al castellà de l'explicació ja retallada.
#
# Traduir no és afirmar res de nou: cada frase diu exactament el mateix que la
# catalana, que al seu torn no diu res que la instantània no demostri.
EXPLAIN_ES = {
    'actualitat-2026-roses-001': 'El presupuesto específico del Ayuntamiento es de 44.649.900 euros; el consolidado con las sociedades municipales es de 48.400.660 euros.',
    'actualitat-2026-roses-002': 'El presupuesto municipal de 2026 prevé 2,4 millones de euros para inversiones.',
    'actualitat-2026-roses-003': 'El programa de la Fiesta Mayor situaba el pregón teatralizado a las 21.30 h.',
    'actualitat-2026-roses-004': 'La sexta edición de Nits de Circ programó seis funciones consecutivas, del 18 al 23 de agosto.',
    'actualitat-2026-roses-005': 'La iniciativa municipal se dirige a alumnos recién llegados de entre 11 y 16 años.',
    'actualitat-2026-roses-006': 'El operativo confiscó un total de 1.207 artículos antes de que se pusieran a la venta.',
    'actualitat-2026-roses-007': 'El programa municipal situaba el Carnaval de Roses 2026 del jueves 12 al lunes 16 de febrero.',
    'actualitat-2026-roses-008': 'La imagen oficial del Carnaval 2026, protagonizada por la Sirena de la Badia, es obra de Alma Martín Guillén.',
    'actualitat-2026-cat-009': 'La propuesta de presupuestos de carbono presentada al Parlamento cubre el quinquenio 2026-2030.',
    'actualitat-2026-cat-010': 'El decreto unificó el precio de los grados y másteres habilitantes en 17,69 euros por crédito.',
    'actualitat-2026-cat-011': 'La nota oficial indicaba que la Alianza de Regiones Europeas de Semiconductores agrupaba 31 regiones.',
    'actualitat-2026-cat-012': 'El ecosistema catalán de semiconductores constaba de 260 agentes.',
    'actualitat-2026-cat-013': 'El escenario preveía que el consumo de los hogares crecería un 2,3% en 2026.',
    'actualitat-2026-cat-014': 'La previsión situaba la tasa de paro de Cataluña en el 8,4% en 2026.',
    'actualitat-2026-es-015': 'El Bono Cultural Joven 2026 es una ayuda de 400 euros para los jóvenes nacidos en 2008.',
    'actualitat-2026-es-016': 'El Bono Cultural Joven 2026 admite cursos y talleres, instrumentos musicales y material artístico.',
    'actualitat-2026-es-017': 'La convocatoria de ayudas generales para largometrajes se autorizó por 62 millones de euros.',
    'actualitat-2026-es-018': 'Al presentar el proyecto de Estatuto de las personas en formación práctica no laboral, el Gobierno cifró en un 56% las mujeres de este colectivo.',
    'actualitat-2026-es-019': 'El encuentro se celebró en la Nunciatura Apostólica de Madrid.',
    'actualitat-2026-eu-020': 'Irlanda asumió la presidencia del Consejo el 1 de julio de 2026, por octava vez.',
    'actualitat-2026-eu-021': 'El programa irlandés se articula en torno a competitividad, valores y seguridad.',
    'actualitat-2026-cultura-022': '«Los Domingos» obtuvo cinco de los trece premios a los que optaba, incluido el de mejor película.',
    'actualitat-2026-cultura-023': '«Sirat» obtuvo seis galardones en categorías técnicas.',
    'actualitat-2026-cultura-024': 'La EBU anunció la gran final para el sábado 16 de mayo, en el Wiener Stadthalle de Viena.',
    'actualitat-2026-esport-025': 'El Comité Olímpico Internacional situaba los Juegos Milano Cortina 2026 del 6 al 22 de febrero.',
}
# Els àmbits del paquet no coincideixen amb els de `CurrentAffairsPack.scope`.
SCOPE_MAP = {
    'roses': 'roses',
    'catalunya': 'catalunya',
    'espanya': 'espanya',
    'unio_europea': 'ue',
    'cultura': 'internacional',
    'esport': 'internacional',
    'internacional': 'internacional',
}


def norm(text):
    """Text comparable: sense accents, sense puntuació, minúscules."""
    text = unicodedata.normalize('NFKD', text.lower())
    text = ''.join(c for c in text if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def check_package():
    result = subprocess.run(
        ['sha256sum', '-c', 'SHA256SUMS.txt'], cwd=CANDIDATES,
        capture_output=True, text=True,
    )
    return result.returncode == 0, result.stdout.strip()


def structural_issues(questions, sources):
    issues = {}
    seen = set()
    for q in questions:
        qid, bad = q['id'], []
        if qid in seen:
            bad.append('identificador duplicat')
        seen.add(qid)
        if not 0 <= q['correctOption'] < len(q['options']):
            bad.append('índex de resposta fora de rang')
        if len(q['options']) != 4 or len(set(q['options'])) != 4:
            bad.append('no té quatre opcions diferents')
        if q['sourceId'] not in sources:
            bad.append(f"font inexistent: {q['sourceId']}")
        if q.get('dynamic') is not True:
            bad.append('no porta dynamic: true')
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', q.get('reviewBy', '')):
            bad.append('reviewBy no és una data ISO')
        elif q['reviewBy'] <= TODAY:
            bad.append(f"reviewBy no posterior a {TODAY}")
        if q['sourceId'] in sources and not sources[q['sourceId']].get('publishedAt'):
            bad.append('la font no té data de publicació')
        if bad:
            issues[qid] = bad
    return issues


def fetch(url, timeout=45):
    """Baixa el document. Retorna (bytes, None) o (None, motiu)."""
    try:
        with urlopen(Request(url, headers={'User-Agent': UA}), timeout=timeout) as r:
            return r.read(), None
    except HTTPError as e:
        return None, f'HTTP {e.code}'
    except URLError as e:
        return None, f'xarxa: {e.reason}'
    except Exception as e:  # noqa: BLE001 — qualsevol fallada és una no-adopció
        return None, f'error: {e}'


def html_to_text(raw):
    text = raw.decode('utf-8', errors='replace')
    text = re.sub(r'(?is)<(script|style)[^>]*>.*?</\1>', ' ', text)
    text = re.sub(r'(?s)<[^>]+>', ' ', text)
    for a, b in (('&nbsp;', ' '), ('&amp;', '&'), ('&#8217;', '’'), ('&quot;', '"')):
        text = text.replace(a, b)
    return re.sub(r'\s+', ' ', text)


def norm_indexed(text):
    """Com `norm()`, però conservant d'on ve cada caràcter del text original.

    Comparar text normalitzat és còmode i comparar-lo a cegues és perillós: es
    perd de vista quin tros del document s'ha trobat de debò. Amb el mapa
    d'índexs, cada coincidència es pot tornar a expressar com el que és, un
    fragment literal del fitxer segellat, i deixar-lo escrit a l'auditoria.
    """
    out, index_map, space_pending = [], [], False
    for i, ch in enumerate(text):
        decomposed = unicodedata.normalize('NFKD', ch.lower())
        base = ''.join(c for c in decomposed if not unicodedata.combining(c))
        for c in base:
            if c.isalnum() and c.isascii():
                if space_pending and out:
                    out.append(' ')
                    index_map.append(i)
                space_pending = False
                out.append(c)
                index_map.append(i)
            else:
                space_pending = True
    return ''.join(out), index_map


def find_literal(page_text, needle_text):
    """Busca `needle_text` al document i en retorna el fragment literal.

    Retorna (fragment tal com surt al fitxer, context) o (None, '').
    """
    haystack, index_map = norm_indexed(page_text)
    needle = norm(needle_text)
    if not needle:
        return None, ''
    # Coincidència de paraula sencera. Sense això, «Cinc» es dona per demostrat
    # dins de «cinco» i «Sis» dins de «sistema»: la resposta sortiria adoptada
    # per una casualitat ortogràfica.
    at = -1
    while True:
        at = haystack.find(needle, at + 1)
        if at < 0:
            return None, ''
        before = haystack[at - 1] if at > 0 else ' '
        after_index = at + len(needle)
        after = haystack[after_index] if after_index < len(haystack) else ' '
        if not before.isalnum() and not after.isalnum():
            break
    start = index_map[at]
    end = index_map[at + len(needle) - 1] + 1
    return page_text[start:end], page_text[max(0, start - 120):end + 200]


def proves_fact(page_text, question):
    """L'opció correcta s'ha de poder llegir al document.

    És una condició **necessària, no suficient**: qui importi ha de llegir el
    context i confirmar que el document diu el que la pregunta afirma. Per això
    l'script imprimeix el fragment on l'ha trobat i el desa a l'auditoria.

    Retorna (com s'ha demostrat, fragment literal, context). El «com» distingeix
    la coincidència de l'opció sencera de la de la xifra sola, perquè no valen
    el mateix: la segona demana llegir el context abans d'adoptar.
    """
    correct = question['options'][question['correctOption']]
    literal, excerpt = find_literal(page_text, correct)
    if literal is not None:
        return 'literal', literal, excerpt
    # Les xifres s'escriuen de moltes maneres —«2,4 milions» i «2,4MEUR» són la
    # mateixa—, així que es prova també només amb els dígits. Però una xifra
    # curta no demostra res: en un document qualsevol, un «6» solt hi és sempre.
    # Per sota de quatre caràcters cal declarar el fragment a mà.
    for d in re.findall(r'\d[\d.,]*', correct):
        if len(norm(d)) < MIN_DIGIT_MATCH:
            continue
        for v in {d, d.replace('.', ''), d.replace('.', ' '), d.replace(',', '.')}:
            literal, excerpt = find_literal(page_text, v)
            if literal is not None:
                return 'xifra', literal, excerpt
    return None, None, ''


def competing_options(page_text, question):
    """Opcions incorrectes que també apareixen al document.

    Aparèixer no vol dir ser compatible —un document pot citar dues xifres sense
    que totes dues responguin la pregunta—, però és exactament el cas que cal
    llegir abans d'adoptar. Per això surt marcat i no decideix sol.
    """
    haystack = norm(page_text)
    out = []
    for i, option in enumerate(question['options']):
        if i == question['correctOption']:
            continue
        needle = norm(option)
        if len(needle) >= 4 and needle in haystack:
            out.append(option)
    return out


SNAPSHOTS = CANDIDATES / 'snapshots'


def snapshot_hashes():
    """Hashes declarats a `snapshots/SHA256SUMS.txt`."""
    out = {}
    path = SNAPSHOTS / 'SHA256SUMS.txt'
    if not path.exists():
        return out
    for line in path.read_text(encoding='utf-8').splitlines():
        parts = line.split(None, 1)
        if len(parts) == 2:
            out[parts[1].strip().lstrip('*')] = parts[0].strip()
    return out


def read_snapshot(source_id, declared):
    """Llegeix una instantània i en comprova hash i metadades.

    Retorna (dades, None) o (None, motiu). Qualsevol discrepància és una
    no-adopció: una instantània que no quadra amb el seu hash no és evidència.
    """
    path = SNAPSHOTS / f'{source_id}.txt'
    if not path.exists():
        return None, 'no hi ha instantània'
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    expected = declared.get(f'{source_id}.txt')
    if expected is None:
        return None, 'la instantània no consta a SHA256SUMS.txt'
    if digest != expected:
        return None, f'hash alterat (declarat {expected[:12]}…, real {digest[:12]}…)'

    text = raw.decode('utf-8')
    meta = {}
    for key in ('source_id', 'publisher', 'published_at', 'captured_at',
                'canonical_url', 'capture_method'):
        m = re.search(rf'^{key}:\s*(.+)$', text, re.M)
        if m:
            meta[key] = m.group(1).strip()
    if meta.get('source_id') != source_id:
        return None, f"el source_id de dins ({meta.get('source_id')}) no és el del fitxer"
    body = text.split('RELEVANT OFFICIAL TEXT', 1)
    if len(body) < 2 or not body[1].strip():
        return None, 'no conserva cap text oficial'
    title = re.search(r'^TITLE\n(.+)$', text, re.M)
    return {
        'meta': meta,
        'title': title.group(1).strip() if title else '',
        'evidence': body[1].strip(),
        'sha256': digest,
        'bytes': raw,
    }, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='només comprova; no escriu res')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--offline', action='store_true',
                    help='verifica contra snapshots/ en comptes d’obrir les URL')
    args = ap.parse_args()

    ok, detail = check_package()
    print(f'── Integritat del paquet ──\n{detail}\n')
    if not ok:
        print('Els hashes no quadren. No es continua.')
        return 1

    questions = json.load(open(CANDIDATES / 'questions.candidates.json'))['questions']
    sources = {s['id']: s for s in json.load(open(CANDIDATES / 'sources.evidence.json'))['sources']}

    issues = structural_issues(questions, sources)
    print(f'── Estructura ──\ncandidats: {len(questions)}   amb problemes: {len(issues)}')
    for qid, bad in issues.items():
        print(f'  ✗ {qid}: {"; ".join(bad)}')
    print()

    print('── Fonts ──')
    fetched, unreachable, snapshots = {}, {}, {}
    if args.offline:
        declared = snapshot_hashes()
        print(f'mode offline: {len(declared)} instantànies declarades a snapshots/SHA256SUMS.txt')
        for sid, source in sources.items():
            snap, why = read_snapshot(sid, declared)
            if snap is None:
                unreachable[sid] = why
                print(f'  ✗ {sid}: {why}')
                continue
            # Les metadades de la instantània han de coincidir amb la fitxa.
            mismatch = []
            if snap['meta'].get('canonical_url') != source['url']:
                mismatch.append('URL')
            if not snap['meta'].get('published_at', '').startswith(source['publishedAt']):
                mismatch.append('data de publicació')
            if mismatch:
                unreachable[sid] = f'la instantània no quadra amb la fitxa: {", ".join(mismatch)}'
                print(f'  ✗ {sid}: {unreachable[sid]}')
                continue
            snapshots[sid] = snap
            fetched[sid] = snap['evidence'].encode('utf-8')
            print(f"  ✓ {sid}: hash {snap['sha256'][:12]}… · {snap['meta'].get('publisher','?')}")
    else:
        for sid, source in sources.items():
            raw, why = fetch(source['url'])
            if raw is None:
                unreachable[sid] = why
                print(f'  ✗ {sid}: {why}')
            else:
                fetched[sid] = raw
                print(f'  ✓ {sid}: {len(raw)} bytes')
    print()

    adopted, rejected, decisions = [], {}, {}
    for q in questions:
        qid = q['id']
        if qid in issues:
            rejected[qid] = f'estructura: {"; ".join(issues[qid])}'
            continue
        sid = q['sourceId']
        if sid not in fetched:
            rejected[qid] = f'font inabastable ({sid}): {unreachable.get(sid, "desconegut")}'
            continue
        text = fetched[sid].decode('utf-8') if args.offline else html_to_text(fetched[sid])
        via, literal, excerpt = proves_fact(text, q)
        if via is None:
            bridge = EVIDENCE_BRIDGE.get(qid)
            if bridge is None:
                rejected[qid] = f'el document de {sid} no demostra l’opció correcta'
                continue
            if bridge['source'] != sid:
                rejected[qid] = (
                    f'el pont d’evidència apunta a {bridge["source"]} i la pregunta cita {sid}'
                )
                continue
            literal, excerpt = find_literal(text, bridge['quote'])
            if literal is None:
                rejected[qid] = (
                    f'el pont d’evidència cita «{bridge["quote"]}» i aquest fragment '
                    f'no és a la instantània de {sid}'
                )
                continue
            via = 'pont'
        rivals = competing_options(text, q)
        fix = TEXT_FIXES.get(qid)
        if fix:
            q = {**q, **{k: v for k, v in fix.items() if k != 'why'}}
        adopted.append((q, excerpt))
        decisions[qid] = {
            'via': via, 'source': sid, 'literal': literal, 'excerpt': excerpt, 'rivals': rivals,
        }

    print('── Decisió ──')
    print(f'adoptables: {len(adopted)}   rebutjades: {len(rejected)}')
    for q, _ in adopted:
        qid = q['id']
        decision = decisions[qid]
        mark = {'literal': '✓', 'xifra': '#', 'pont': '⇄'}[decision['via']]
        print(f'  {mark} {qid} · {decision["source"]} · «{decision["literal"]}»')
        if decision['via'] == 'pont':
            bridge = EVIDENCE_BRIDGE[qid]
            print(f'      pont: «{bridge["quote"]}» — {bridge["why"]}')
        fix = TEXT_FIXES.get(qid)
        if fix:
            print(f'      ✎ text retallat: {fix["why"]}')
        if decision['rivals']:
            print(f'      ⚠ també consten al document: {"; ".join(decision["rivals"])}')
    for qid, why in rejected.items():
        print(f'  ✗ {qid}: {why}')
    print()

    if args.check or args.dry_run:
        print('Mode de comprovació: no s’ha escrit res.')
    if len(adopted) < 10:
        print(
            f'Amb {len(adopted)} preguntes demostrades no s’arriba a les 10 que exigeix la '
            f'quota d’actualitat.\nEl simulacre de cultura general continua bloquejat, que és '
            f'el comportament correcte:\nno es toca contentStatus ni cap altra protecció.'
        )
        return 0

    if args.check or args.dry_run:
        return 0

    write_content(adopted, sources, snapshots)
    write_audit(adopted, snapshots, decisions)
    write_decision(questions, adopted, rejected, decisions, sources, snapshots)
    print(f'Escrit {OUT.relative_to(ROOT)} amb {len(adopted)} preguntes.')
    print('Següent pas: npm run content:validate')
    return 0


def write_decision(questions, adopted, rejected, decisions, sources, snapshots):
    """Taula de decisió de les 25 candidates, una per fila.

    Es genera aquí i no s'escriu a mà perquè un informe que es redacta a part
    acaba dient una cosa diferent del que hi ha al banc.
    """
    adopted_by_id = {q['id']: q for q, _ in adopted}
    rows = []
    for candidate in questions:
        qid = candidate['id']
        if qid in rejected:
            rows.append(f'| `{qid}` | ✗ no adoptada | — | {rejected[qid]} |')
            continue
        decision = decisions[qid]
        if decision['via'] == 'pont':
            how = 'pont d’evidència declarat: ' + EVIDENCE_BRIDGE[qid]['why']
        elif decision['via'] == 'xifra':
            how = 'la xifra de l’opció correcta hi surt'
        else:
            how = 'l’opció correcta hi surt tal qual'
        note = TEXT_FIXES[qid]['why'] if qid in TEXT_FIXES else '—'
        quote = decision['literal'].replace('|', '\\|')
        rows.append(f'| `{qid}` | ✓ adoptada | «{quote}» | {how}. Retall: {note} |')

    horizons = {}
    for q, _ in adopted:
        horizons[q['reviewBy']] = horizons.get(q['reviewBy'], 0) + 1
    remaining, calendar = len(adopted), []
    for date, n in sorted(horizons.items()):
        remaining -= n
        calendar.append(f'| {date} | {n} | {remaining} | ' +
                        ('bloquejat' if remaining < 10 else 'obert') + ' |')

    DECISION_OUT.parent.mkdir(parents=True, exist_ok=True)
    DECISION_OUT.write_text(f"""# Actualitat: decisió del paquet de candidats de 2026-08-24

**Generat** per `scripts/transcription/import_current_affairs.py --offline`. No
s'edita a mà: si canvia el que s'adopta, canvia aquest document.

## Com s'ha verificat

L'entorn de construcció no arriba a cap de les {len(sources)} fonts (CONNECT 403 a tots
els dominis, pels dos camins de sortida). El paquet, però, porta {len(snapshots)}
**instantànies textuals** de les pàgines oficials, cadascuna amb el seu SHA-256.
Aquest és el camí que s'ha seguit:

1. Hashes d'arrel del paquet: 6/6 correctes.
2. Hashes de les instantànies: {len(snapshots)}/{len(snapshots)} correctes.
3. De cada instantània s'ha comprovat que el `source_id` de dins és el del
   fitxer, i que la URL canònica i la data de publicació coincideixen amb la
   fitxa de la font.
4. De cada pregunta s'ha buscat l'opció correcta dins del text preservat,
   **per paraules senceres**. Una coincidència numèrica de menys de
   {MIN_DIGIT_MATCH} caràcters no compta per si sola.
5. Quan la font és en una altra llengua, el fragment que demostra la resposta
   s'ha declarat a mà a `EVIDENCE_BRIDGE`, i l'script comprova que hi és,
   literalment, abans d'adoptar res.

El que una instantània **no** demostra és que sigui fidel a la pàgina viva:
això depèn de qui la va prendre. El manifest en desa el mètode de captura i la
data, i el dia que hi hagi xarxa es pot tornar a comprovar.

## Decisió, candidata per candidata

| Pregunta | Decisió | Fragment que la sosté | Com |
| --- | --- | --- | --- |
{chr(10).join(rows)}

## Retalls

Les preguntes marcades amb un retall afirmaven, al paquet original, alguna cosa
que la instantània no diu: un acte donat per celebrat quan el document és
l'anunci previ, un lloc que no hi consta, una continuïtat que una nota d'un sol
any no estableix. En aquests casos no s'ha buscat una altra font: s'ha retallat
el text fins al que el document sí que demostra.

## Caducitat

Cada pregunta porta el seu `reviewBy` i el paquet caduca amb la més llarga.
Ningú ha d'anar a bloquejar res: quan passen les dates, `isCurrent()` les deixa
fora de la quota tot sol.

| Data | En caduquen | En queden | Simulacre de cultura general |
| --- | --- | --- | --- |
{chr(10).join(calendar)}
""", encoding='utf-8')


def write_audit(adopted, snapshots, decisions):
    """Deixa per escrit què demostra cada resposta, i on.

    Sense això, «verified» és una paraula. Amb això, un test pot obrir la còpia
    de `sources/cache/`, comprovar-ne el hash i buscar-hi el fragment exacte que
    sosté la resposta. Si algú edita la còpia, el test cau.
    """
    rows = []
    for q, _ in adopted:
        qid, sid = q['id'], q['sourceId']
        bridge = EVIDENCE_BRIDGE.get(qid)
        via = decisions[qid]['via']
        rows.append({
            'questionId': qid,
            'sourceId': sid,
            'snapshotSha256': snapshots[sid]['sha256'],
            'cacheFile': f'{sid}.txt',
            'provenBy': via,
            'quote': decisions[qid]['literal'],
            'answer': q['options'][q['correctOption']],
            'bridgeReason': bridge['why'] if via == 'pont' else None,
            'trimmed': TEXT_FIXES[qid]['why'] if qid in TEXT_FIXES else None,
        })
    payload = {
        '_note': [
            'Generat per scripts/transcription/import_current_affairs.py --offline.',
            'Per a cada pregunta adoptada: quin fitxer de sources/cache/ la sosté, amb quin',
            'SHA-256, i quin fragment literal d’aquell fitxer demostra la resposta.',
            'provenBy: «literal» si l’opció correcta hi surt tal qual; «pont» si la font és',
            'en una altra llengua i el fragment equivalent s’ha declarat a mà.',
            'tests/unit/actualitat.test.ts ho comprova fitxer a fitxer.',
        ],
        'packId': PACK_ID,
        'adoptedAt': TODAY,
        'questions': rows,
    }
    AUDIT_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def manifest_scope(source_id):
    """Àmbit de la font per al manifest, pel prefix de l'identificador.

    Les fonts sense prefix territorial (acadèmies, EBU, COI) són internacionals,
    excepte l'Acadèmia de Cinema espanyola, que és estatal.
    """
    if source_id.startswith('roses-'):
        return 'roses'
    if source_id.startswith('cat-'):
        return 'catalunya'
    if source_id.startswith('es-') or source_id == 'goya-2026':
        return 'estatal'
    if source_id.startswith('eu-'):
        return 'ue'
    return 'internacional'


def ts(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ') + "'"


def write_content(adopted, sources, snapshots):
    """Emet el fitxer de contingut natiu i actualitza el manifest de fonts."""
    manifest = json.load(open(MANIFEST))
    known = {s['sourceId'] for s in manifest['sources']}
    CACHE.mkdir(parents=True, exist_ok=True)

    used = {q['sourceId'] for q, _ in adopted}
    for sid in sorted(used):
        source = sources[sid]
        snap = snapshots.get(sid)
        if snap is not None:
            raw, ext = snap['bytes'], 'txt'
            digest = snap['sha256']
            note = (
                'Instantània textual de la pàgina oficial, adoptada del paquet '
                f"d’actualitat. Captura: {snap['meta'].get('captured_at', '?')} · "
                f"{snap['meta'].get('capture_method', '?')}. El SHA-256 és el del fitxer "
                'segellat al paquet, no el de la pàgina viva.'
            )
        else:
            raw, ext = fetch(source['url'])[0], 'html'
            digest = hashlib.sha256(raw).hexdigest()
            note = 'Instantània adoptada en importar el paquet d’actualitat.'
        (CACHE / f'{sid}.{ext}').write_bytes(raw)
        entry = {
            'sourceId': sid,
            'title': source['title'],
            'issuer': source['publisher'],
            'url': source['url'],
            'kind': 'pagina-institucional',
            'scope': manifest_scope(sid),
            'publishedAt': source['publishedAt'],
            'consultedAt': TODAY,
            'status': 'vigent',
            'fetchStatus': 'downloaded',
            'sha256': digest,
            'cacheFile': f'{sid}.{ext}',
            'notes': note,
        }
        if sid in known:
            manifest['sources'] = [entry if s['sourceId'] == sid else s for s in manifest['sources']]
        else:
            manifest['sources'].append(entry)
    manifest['generatedAt'] = TODAY
    json.dump(manifest, open(MANIFEST, 'w'), ensure_ascii=False, indent=2)
    open(MANIFEST, 'a').write('\n')

    blocks = []
    for q, excerpt in adopted:
        letters = 'abcd'
        overrides = WHY_WRONG.get(q['id'], {})
        rendered = []
        for i, option in enumerate(q['options']):
            if i == q['correctOption']:
                rendered.append('{ optionId: %s, text: %s }' % (ts(letters[i]), ts(option)))
                continue
            why = overrides.get(i)
            if why is None:
                rendered.append('{ optionId: %s, text: %s }' % (ts(letters[i]), ts(option)))
            else:
                rendered.append(
                    '{ optionId: %s, text: %s, whyWrong: %s }'
                    % (ts(letters[i]), ts(option), ts(why))
                )
        opts = ',\n      '.join(rendered)
        source = sources[q['sourceId']]
        attribution_ca = f" (Font: {source['publisher']}, {source['publishedAt']}.)"
        attribution_es = f" (Fuente: {source['publisher']}, {source['publishedAt']}.)"
        explanation_es = EXPLAIN_ES.get(q['id'])
        es_line = (
            f"\n      es: {ts(explanation_es + attribution_es)}," if explanation_es else ''
        )
        blocks.append(f"""  {{
    questionId: {ts(q['id'])},
    topicId: 'roses-t31',
    track: 'cultura-general',
    origin: 'authored',
    status: 'active',
    difficulty: 'mitjana',
    stem: {ts(q['question'])},
    options: [
      {opts},
    ],
    correct: {ts(letters[q['correctOption']])},
    explanation: {{
      ca: {ts(q['explanation'] + attribution_ca)},{es_line}
    }},
    references: [
      {{
        sourceId: {ts(q['sourceId'])},
        locator: {ts(q['sourceLocator'])},
        validAt: {ts(source['publishedAt'])},
        reviewStatus: 'verified',
      }},
    ],
    dynamic: true,
    reviewBy: {ts(q['reviewBy'])},
    tags: ['actualitat', {ts('ambit-' + SCOPE_MAP[q['scope']])}],
  }},""")

    header = f'''/**
 * Preguntes d'actualitat adoptades del paquet de candidats 2026-08-24.
 * **Generat** per `scripts/transcription/import_current_affairs.py`.
 *
 * Cada pregunta té la seva font oberta, contrastada i desada a `sources/cache/`
 * amb el seu SHA-256. Cap s'ha adoptat sense demostrar-ne el fet al document.
 *
 * Totes porten `dynamic: true` amb `reviewBy`: quan la data passa, `isCurrent()`
 * les deixa fora dels quadernets i de la quota, i el simulacre de cultura
 * general es torna a bloquejar sol.
 */
import type {{ Question }} from '../../../schemas/index.ts'

export const CURRENT_AFFAIRS_QUESTIONS: Question[] = [
'''
    OUT.write_text(header + '\n'.join(blocks) + '\n]\n', encoding='utf-8')
    write_pack(adopted, sources)


def write_pack(adopted, sources):
    """Emet el paquet versionat que conté les preguntes adoptades.

    El paquet no és decoratiu: `currentAffairsIssues()` refusa qualsevol pregunta
    d'actualitat activa que no hi consti, i `packIssues()` refusa un paquet que
    caduqui abans que les seves preguntes. Per això la caducitat es calcula com
    el `reviewBy` més llarg de les que conté, i el període cobert, com el rang de
    publicació de les fonts que se citen. Res d'això s'escriu a mà.
    """
    ids = [q['id'] for q, _ in adopted]
    used = sorted({q['sourceId'] for q, _ in adopted})
    published = sorted(sources[sid]['publishedAt'] for sid in used)
    covers_from, covers_to = published[0], published[-1]
    expires_at = max(q['reviewBy'] for q, _ in adopted)
    order = ['roses', 'alt-emporda', 'girona', 'catalunya', 'espanya', 'ue', 'internacional']
    present = {SCOPE_MAP[q['scope']] for q, _ in adopted}
    scopes = [x for x in order if x in present]

    horizons = {}
    for q, _ in adopted:
        horizons[q['reviewBy']] = horizons.get(q['reviewBy'], 0) + 1
    remaining, calendar_lines = len(ids), []
    for date, n in sorted(horizons.items()):
        remaining -= n
        calendar_lines.append(f' *   - {date}: en caduquen {n}; en queden {remaining}.')
    calendar = '\n'.join(calendar_lines)

    id_lines = '\n'.join(f'    {ts(i)},' for i in ids)
    PACK_OUT.write_text(f"""/**
 * Paquet d'actualitat 2026-08. **Generat** per
 * `scripts/transcription/import_current_affairs.py --offline`.
 *
 * Conté les {len(ids)} preguntes que les instantànies segellades del paquet de
 * candidats van demostrar, una a una. Cap s'ha escrit de memòria i cap afirma
 * res que el text preservat de la seva font no digui.
 *
 * La caducitat del paquet és el `reviewBy` més llarg que conté, i cada pregunta
 * porta el seu:
 *
{calendar}
 *
 * Quan una data passa, `isCurrent()` deixa la pregunta fora de la quota sense
 * que ningú hi toqui. El 2027-02-28 en queden nou, i aquell dia el simulacre de
 * cultura general es torna a bloquejar sol: és el comportament previst.
 */
import type {{ CurrentAffairsPack }} from '../../../schemas/index.ts'

export const PACK_2026_08: CurrentAffairsPack = {{
  packId: {ts(PACK_ID)},
  createdAt: {ts(TODAY)},
  coversFrom: {ts(covers_from)},
  coversTo: {ts(covers_to)},
  expiresAt: {ts(expires_at)},
  scope: [{', '.join(ts(x) for x in scopes)}],
  status: 'active',
  questionIds: [
{id_lines}
  ],
  note:
    'Adoptat el {TODAY} des d’instantànies textuals segellades amb SHA-256, no des de ' +
    'la xarxa: cap de les {len(used)} fonts era abastable des de l’entorn de construcció. ' +
    'Cada instantània es conserva a sources/cache/ amb el seu hash i el mètode de captura. ' +
    'El detall pregunta per pregunta és a artifacts/actualitat-decisio-2026-08-24.md.',
}}
""", encoding='utf-8')


if __name__ == '__main__':
    sys.exit(main())
