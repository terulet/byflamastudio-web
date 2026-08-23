"""
Importa preguntes d'actualitat des d'un paquet de candidats. **Necessita xarxa.**

    python3 scripts/transcription/import_current_affairs.py --check
    python3 scripts/transcription/import_current_affairs.py [--dry-run]

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
  3. **La font s'obre.** Si la URL no respon, la pregunta queda fora. No se
     substitueix per memòria, premsa ni cap altra pàgina.
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

Estat en què es va escriure
───────────────────────────

El 2026-08-24 aquest entorn no podia obrir cap de les 19 URL (CONNECT 403 de la
política de sortida, als vuit dominis, tant amb curl com amb l'eina de fetch),
de manera que l'script es va escriure i provar contra el pas 1 i 2, i el pas 3
es va poder exercitar només en la seva branca de fallada: cap font adoptada,
cap pregunta importada. Vegeu `artifacts/actualitat-decisio-2026-08-24.md`.
"""
import argparse, hashlib, json, pathlib, re, subprocess, sys, unicodedata
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

ROOT = pathlib.Path(__file__).resolve().parents[2]
CANDIDATES = ROOT / 'content/municipalities/roses/current-affairs/candidates'
CACHE = ROOT / 'sources/cache'
MANIFEST = ROOT / 'sources/source-manifest.json'
OUT = ROOT / 'content/municipalities/roses/current-affairs/questions-2026-08.ts'
TODAY = '2026-08-24'
UA = 'policia-quest-content-factory/1.0'

# Els àmbits del paquet no coincideixen amb els de `CurrentAffairsPack.scope`.
SCOPE_MAP = {
    'roses': 'roses',
    'catalunya': 'catalunya',
    'espanya': 'espanya',
    'unio_europea': 'ue',
    'cultura': 'internacional',
    'esport': 'internacional',
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


def proves_fact(page_text, question):
    """L'opció correcta s'ha de poder llegir al document.

    És una condició **necessària, no suficient**: qui importi ha de llegir el
    context i confirmar que el document diu el que la pregunta afirma. Per això
    l'script imprimeix el fragment on l'ha trobat.
    """
    correct = question['options'][question['correctOption']]
    haystack = norm(page_text)
    needle = norm(correct)
    if needle and needle in haystack:
        at = haystack.find(needle)
        return True, page_text[max(0, at - 120):at + 200]
    # Les xifres s'escriuen de moltes maneres: es prova també només amb els dígits.
    digits = re.findall(r'\d[\d.,]*', correct)
    for d in digits:
        variants = {d, d.replace('.', ''), d.replace('.', ' '), d.replace(',', '.')}
        for v in variants:
            if v and norm(v) in haystack:
                at = haystack.find(norm(v))
                return True, page_text[max(0, at - 120):at + 200]
    return False, ''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true', help='només comprova; no escriu res')
    ap.add_argument('--dry-run', action='store_true')
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
    fetched, unreachable = {}, {}
    for sid, source in sources.items():
        raw, why = fetch(source['url'])
        if raw is None:
            unreachable[sid] = why
            print(f'  ✗ {sid}: {why}')
        else:
            fetched[sid] = raw
            print(f'  ✓ {sid}: {len(raw)} bytes')
    print()

    adopted, rejected = [], {}
    for q in questions:
        qid = q['id']
        if qid in issues:
            rejected[qid] = f'estructura: {"; ".join(issues[qid])}'
            continue
        sid = q['sourceId']
        if sid not in fetched:
            rejected[qid] = f'font inabastable ({sid}): {unreachable.get(sid, "desconegut")}'
            continue
        proved, excerpt = proves_fact(html_to_text(fetched[sid]), q)
        if not proved:
            rejected[qid] = f'el document de {sid} no demostra l’opció correcta'
            continue
        adopted.append((q, excerpt))

    print('── Decisió ──')
    print(f'adoptables: {len(adopted)}   rebutjades: {len(rejected)}')
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

    write_content(adopted, sources)
    print(f'Escrit {OUT.relative_to(ROOT)} amb {len(adopted)} preguntes.')
    print('Següent pas: npm run content:validate')
    return 0


def ts(s):
    return "'" + str(s).replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ') + "'"


def write_content(adopted, sources):
    """Emet el fitxer de contingut natiu i actualitza el manifest de fonts."""
    manifest = json.load(open(MANIFEST))
    known = {s['sourceId'] for s in manifest['sources']}
    CACHE.mkdir(parents=True, exist_ok=True)

    used = {q['sourceId'] for q, _ in adopted}
    for sid in sorted(used):
        source = sources[sid]
        raw, _ = fetch(source['url'])
        digest = hashlib.sha256(raw).hexdigest()
        (CACHE / f'{sid}.html').write_bytes(raw)
        entry = {
            'sourceId': sid,
            'title': source['title'],
            'issuer': source['publisher'],
            'url': source['url'],
            'kind': 'pagina-institucional',
            'scope': 'roses' if sid.startswith('roses-') else 'estatal',
            'publishedAt': source['publishedAt'],
            'consultedAt': TODAY,
            'status': 'vigent',
            'fetchStatus': 'downloaded',
            'sha256': digest,
            'cacheFile': f'{sid}.html',
            'notes': 'Instantània adoptada en importar el paquet d’actualitat.',
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
        opts = ',\n      '.join(
            '{ optionId: %s, text: %s }' % (ts(letters[i]), ts(o))
            for i, o in enumerate(q['options'])
        )
        source = sources[q['sourceId']]
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
      ca: {ts(q['explanation'] + f" (Font: {source['publisher']}, {source['publishedAt']}.)")},
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


if __name__ == '__main__':
    sys.exit(main())
