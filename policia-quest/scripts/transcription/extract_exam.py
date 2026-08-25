"""
Extractor d'exàmens oficials de Roses.

Fa la seva pròpia extracció del PDF amb PyMuPDF, independent dels
`text-extracts/` del paquet, i conserva el **senyal de resposta** que porta el
document. Els quadernets de Roses no fan servir un sol conveni:

  - la majoria marquen la resposta oficial amb un asterisc al final de l'opció;
  - els de 2019 i alguns altres la marquen **acolorint** l'opció;
  - el de 2024 interins la marca amb **negreta sintètica**: el mateix text
    dibuixat dues vegades, una d'omplerta i una de resseguida. No hi ha cap
    tipografia negreta ni cap indicador als flags, de manera que només es veu
    mirant la traça de dibuix;
  - algun no porta cap marca, i aleshores no hi ha clau.

No dedueix mai una resposta. Si un enunciat no té exactament una marca, es
reporta com a ambigu i queda per a revisió visual.
"""
import re, collections, pymupdf
from dataclasses import dataclass, field

# El punt no pot anar seguit d'un altre punt: un enunciat que acaba en
# «…va nèixer a…» —un buit per completar, format habitual als quadernets
# antics— es llegiria com «opció a) amb el text «..»» si el separador
# acceptés qualsevol punt. Els punts suspensius no separen una opció.
OPTION_RE = re.compile(r'^([a-d])\s*(?:\)|\.(?!\.))\s*(.*)$', re.S)
QNUM_RE = re.compile(r'^(\d{1,2})\s*[\.\)]\s*(.*)$', re.S)
BOLD_FLAG = 2 ** 4


@dataclass
class Option:
    letter: str
    text: str = ''
    asterisk: bool = False
    colored: bool = False
    bold: bool = False
    stroked: bool = False

    @property
    def marks(self):
        m = []
        if self.asterisk: m.append('asterisc')
        if self.colored: m.append('color')
        if self.bold: m.append('negreta')
        if self.stroked: m.append('ressaltat')
        return m


@dataclass
class Question:
    number: int
    page: int
    stem: str = ''
    options: list = field(default_factory=list)
    reserve: bool = False

    def marked(self):
        return [o for o in self.options if o.marks]

    @property
    def answer(self):
        m = self.marked()
        return m[0].letter if len(m) == 1 else None


def stroked_boxes(doc):
    """Rectangles de text **resseguit**, que és com es fa la negreta sintètica.

    Un PDF pot simular negreta dibuixant el mateix text dues vegades: una amb
    farciment (`type` 0) i una amb traç (`type` 1 o 2). Ni la tipografia ni els
    flags ho diuen; només la traça de dibuix.
    """
    boxes = {}
    for pno in range(doc.page_count):
        page_boxes = []
        for span in doc[pno].get_texttrace():
            if span.get('type') in (1, 2) and span.get('linewidth'):
                page_boxes.append(pymupdf.Rect(span['bbox']))
        boxes[pno + 1] = page_boxes
    return boxes


def visual_lines(doc):
    """Línies visuals: spans agrupats per pàgina i alçada, ordenats per x."""
    buckets = {}
    for pno in range(doc.page_count):
        for block in doc[pno].get_text('dict')['blocks']:
            for line in block.get('lines', []):
                for s in line['spans']:
                    if not s['text'].strip():
                        continue
                    key = (pno + 1, round(line['bbox'][1] / 3) * 3)
                    buckets.setdefault(key, []).append({
                        'text': s['text'],
                        'color': s['color'],
                        'bold': bool(s['flags'] & BOLD_FLAG) or 'bold' in s['font'].lower(),
                        'x': s['bbox'][0],
                        'bbox': s['bbox'],
                        'page': pno + 1,
                    })
    for key in sorted(buckets):
        parts = sorted(buckets[key], key=lambda s: s['x'])
        yield key[0], ''.join(p['text'] for p in parts).strip(), parts


def repeated_lines(doc, min_share=0.5):
    """Text de capçalera i peu, detectat perquè **es repeteix a les pàgines**.

    Els quadernets porten a cada pàgina l'expedient, el procés selectiu, la
    prova i l'adreça de l'Ajuntament. Sense treure'ls, l'última opció de cada
    pàgina se'ls empassava: «d) El 1945. Exp.: 2025/010339 Procés selectiu…».
    No es filtren per posició —els marges varien— sinó per repetició, que és el
    que els defineix.
    """
    seen = {}
    pages = doc.page_count
    for pno in range(pages):
        for line in {l.strip() for l in doc[pno].get_text().split('\n') if l.strip()}:
            # Una lletra d'opció sola («a)», «b)»…) es repeteix legítimament
            # moltes vegades quan un quadernet posa el text de l'opció a la
            # línia següent: no és mai capçalera ni peu, i comptar-la aquí
            # l'esborraria abans que la lògica de `pending_letter` la vegi.
            if re.fullmatch(r'[a-d]\s*[\)\.]', line):
                continue
            seen[line] = seen.get(line, 0) + 1
    return {line for line, n in seen.items() if n >= max(2, pages * min_share)}


def document_profile(doc):
    """Color i pes dominants del cos del document, per detectar què és marca."""
    colors, bolds = collections.Counter(), collections.Counter()
    for _, _, parts in visual_lines(doc):
        for p in parts:
            n = len(p['text'].strip())
            colors[p['color']] += n
            bolds[p['bold']] += n
    total = sum(colors.values()) or 1
    body_color = colors.most_common(1)[0][0]
    # Un color marca si és **cromàtic** i minoritari. Els documents de Roses
    # barregen negre pur amb grisos quasi negres (#00000a, #222222) que no
    # marquen res: prendre'ls per marca donava falsos positius a mitja
    # convocatòria. Les marques reals són blaus i vermells saturats.
    def saturation(c):
        r, g, b = (c >> 16) & 255, (c >> 8) & 255, c & 255
        return max(r, g, b) - min(r, g, b)
    mark_colors = {
        c for c, n in colors.items()
        if c != body_color and saturation(c) > 60 and n / total < 0.30
    }
    body_bold = bolds.most_common(1)[0][0]
    return body_color, mark_colors, body_bold


def parse(path, force_stroke_marks=False):
    doc = pymupdf.open(path)
    body_color, mark_colors, body_bold = document_profile(doc)
    boilerplate = repeated_lines(doc)

    def is_boilerplate_part(t):
        if t in boilerplate:
            return True
        # El número de pàgina sol i les restes d'adreça que no es repeteixen
        # literalment perquè hi canvia un espai.
        if re.fullmatch(r'\d{1,3}', t):
            return True
        return any(t.startswith(b[:24]) for b in boilerplate if len(b) >= 24)

    def is_boilerplate(text):
        t = text.strip()
        if is_boilerplate_part(t):
            return True
        # Capçaleres a dues columnes: «Exp.: ...» i «Ampliació...» cauen al
        # mateix bucket vertical de `visual_lines()` i s'ajunten sense
        # separador en una sola línia que no coincideix literalment amb cap
        # entrada del repertori ni hi comença («Exp.: 2018/000391» és massa
        # curt per al llindar de 24 caràcters). Sense això, la línia sencera
        # es colava com a continuació de l'última opció de la pàgina
        # anterior. Si totes les parts separades pel buit entre columnes són
        # per separat capçalera coneguda, la línia sencera també ho és.
        parts = [p for p in re.split(r'\s{2,}', t) if p.strip()]
        return len(parts) > 1 and all(is_boilerplate_part(p.strip()) for p in parts)
    strokes = stroked_boxes(doc)
    stroked_total = sum(len(v) for v in strokes.values())
    all_spans = sum(1 for _ in visual_lines(doc))
    # Si tot el document va resseguit, el traç no marca res.
    # Alguns quadernets marquen la resposta amb negreta sintètica (el mateix
    # text dibuixat dues vegades) però amb tanta densitat de traç a tota la
    # pàgina que el recompte total ja no distingeix res: aleshores es descarta
    # aquest senyal, perquè un document tot resseguit no marca res en concret.
    # `force_stroke_marks` el torna a activar quan `parse_with_fallback` ha
    # comprovat que, sense ell, el document no dona ni una sola resposta.
    strokes_are_marks = force_stroke_marks or (0 < stroked_total < max(4, all_spans * 0.5))

    def is_stroked(parts):
        """Si el text d'una opció està resseguit: negreta sintètica.

        No n'hi ha prou de mirar si **una** capsa de traç cobreix la part: en
        alguns quadernets el traç ve trossejat per glif —una capsa minúscula
        per lletra—, i cap d'elles sola arriba mai al 40% d'una paraula
        sencera encara que la paraula estigui resseguida de cap a cap. Per
        això se suma la cobertura de totes les capses que hi solapen i es
        compara la suma amb l'àrea de la part, no cada capsa per separat.
        """
        if not strokes_are_marks:
            return False
        total_area = sum(pymupdf.Rect(p['bbox']).get_area() for p in parts)
        if total_area == 0:
            return False
        covered = 0.0
        for p in parts:
            rect = pymupdf.Rect(p['bbox'])
            for box in strokes.get(p['page'], ()):  # solapament real, no proximitat
                inter = rect & box
                if not inter.is_empty:
                    covered += inter.get_area()
        return covered > total_area * 0.4

    questions, current, current_opt = [], None, None
    pending_letter = None
    # Les preguntes de reserva van al final sota un títol propi i **tornen a
    # numerar des d'1**. Sense detectar-ho, la darrera pregunta del cos
    # s'empassava tota la reserva i semblava tenir dues respostes marcades.
    in_reserve = False
    # «RESERVA» a seques es queda curt: alguns quadernets diuen «PREGUNTES
    # RESERVES» (plural-plural), no «PREGUNTA DE RESERVA». Sense aquesta
    # variant, la capçalera no es reconeix com a frontera i tota la secció de
    # reserva —amb el seu propi asterisc— s'envola cap a l'última opció de
    # l'última pregunta ordinària.
    reserve_re = re.compile(r'^\s*PREGUNT\w*\s+(DE\s+)?RESERV\w*', re.I)
    just_entered_reserve = False
    # Després de l'última opció, els quadernets de cultura general reprodueixen
    # el text de les bases («El primer exercici és obligatori i eliminatori…»).
    # No es repeteix a cada pàgina, així que el filtre de repetició no el veu, i
    # sense això s'enganxava sencer a l'opció d) de la pregunta de reserva.
    trailer_re = re.compile(r'^(el|la)\s+\S+\s+exercici\b.*\bobligatori\b.*\beliminatori', re.I)

    def start_option(letter, body, parts):
        nonlocal current_opt
        content = [p for p in parts if p['text'].strip().rstrip(').') != letter]
        content = content or parts
        opt = Option(
            letter=letter,
            text=body.rstrip().rstrip('*').strip(),
            asterisk=body.rstrip().endswith('*'),
            # Majoria de caràcters, no «n'hi ha prou amb un». Un sol
            # caràcter perdut amb el color de marca —una resta d'edició, un
            # glifo mal llegit— no converteix tota l'opció en marcada.
            colored=(
                sum(len(p['text']) for p in content if p['color'] in mark_colors)
                > sum(len(p['text']) for p in content) * 0.5
            ),
            bold=(not body_bold) and any(p['bold'] for p in content),
            stroked=is_stroked(content),
        )
        current.options.append(opt)
        current_opt = opt

    for page, text, parts in visual_lines(doc):
        if not text or is_boilerplate(text):
            continue

        if reserve_re.match(text):
            in_reserve = True
            just_entered_reserve = True
            current, current_opt, pending_letter = None, None, None
            continue

        # Una lletra d'opció sola: el cos ve a la línia següent.
        if re.fullmatch(r'[a-d]\s*[\)\.]', text) and current is not None:
            pending_letter = (text[0], parts)
            continue

        if pending_letter and current is not None:
            letter, letter_parts = pending_letter
            pending_letter = None
            start_option(letter, text, letter_parts + parts)
            continue

        m = OPTION_RE.match(text)
        if m and current is not None and len(current.options) < 4:
            start_option(m.group(1), m.group(2), parts)
            continue

        m = QNUM_RE.match(text)
        if m:
            n = int(m.group(1))
            expected = 1 if current is None else current.number + 1
            # Després del títol de reserva, uns quadernets tornen a numerar des
            # d'1 i d'altres continuen (21, 41…). S'accepten totes dues.
            if just_entered_reserve:
                expected = n
            # Només s'accepta el número que toca: així un any o un import a
            # principi de línia no obre una pregunta fantasma.
            if n == expected or (current is not None and len(current.options) == 4 and n == expected):
                current = Question(number=n, page=page, stem=m.group(2).strip(), reserve=in_reserve)
                just_entered_reserve = False
                questions.append(current)
                current_opt = None
                continue

        # El text de bases posterior a una pregunta completa tanca l'opció: el
        # que vingui després ja no és contingut de la pregunta.
        if current is not None and len(current.options) == 4 and trailer_re.match(text):
            current_opt = None
            continue

        # Continuació d'una opció o de l'enunciat.
        if current_opt is not None and current.options and len(current.options) <= 4:
            current_opt.text = (current_opt.text + ' ' + text.rstrip().rstrip('*')).strip()
            if text.rstrip().endswith('*'):
                current_opt.asterisk = True
            if any(p['color'] in mark_colors for p in parts):
                current_opt.colored = True
        elif current is not None and not current.options:
            current.stem = (current.stem + ' ' + text).strip()

    # Algun quadernet repeteix una lletra per una errata del propi tribunal
    # («b) 10.000 habitants. / b) 15.000 habitants.», saltant-se la c). El
    # text i la marca de cada opció es respecten íntegres; només es corregeix
    # l'etiqueta perquè torni a ser a, b, c, d en l'ordre físic en què surten
    # impreses, que és l'única manera de fer-les seleccionables a l'app.
    for q in questions:
        if len(q.options) == 4 and [o.letter for o in q.options] != ['a', 'b', 'c', 'd']:
            for o, letter in zip(q.options, ['a', 'b', 'c', 'd']):
                o.letter = letter

    doc.close()
    return questions, {'body_color': body_color, 'mark_colors': mark_colors, 'body_bold': body_bold}


def parse_with_fallback(path):
    """Com `parse`, però amb un segon intent quan el primer no troba res.

    Alguns quadernets antics no porten cap asterisc ni cap color de marca: la
    resposta hi és només per negreta sintètica, i el llindar de
    `strokes_are_marks` la descarta perquè el document sencer és dens de traç.
    Quan això deixa gairebé **totes** les preguntes sense resposta es torna a
    intentar forçant el senyal de traç. El llindar és baix a propòsit —una de
    cada cinc, com a molt— perquè un document que ja funciona per un altre
    mètode i només en té una o dues de dubtoses no ha de passar mai per aquí:
    forçar el traç allà podria confondre soroll de renderització amb una marca
    de veritat i espatllar respostes que ja eren bones.
    """
    questions, meta = parse(path)
    answered = sum(1 for q in questions if q.answer)
    if questions and answered / len(questions) >= 0.2:
        return questions, meta
    retry, retry_meta = parse(path, force_stroke_marks=True)
    retry_answered = sum(1 for q in retry if q.answer)
    if retry_answered > answered:
        retry_meta['stroke_fallback'] = True
        return retry, retry_meta
    return questions, meta
