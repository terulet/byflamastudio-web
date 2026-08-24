"""
Genera `content/municipalities/roses/questions/official-exams.ts` a partir dels
quadernets oficials adoptats a `sources/cache/`.

Es fa servir una sola vegada per convocatòria, no en cada build: el resultat es
revisa i es versiona com a contingut. Necessita Python i PyMuPDF
(`pip install pymupdf`), que no són dependències de l'aplicació.

    python3 scripts/transcription/generate_official_questions.py

Regles que aquest generador **no** pot saltar-se:

  - La resposta surt de la marca del quadernet (asterisc, color o traç), mai
    d'inferir-la. Una pregunta sense marca inequívoca s'importa sense clau.
  - L'enunciat i les opcions es transcriuen literalment.
  - Les preguntes de cultura general s'importen com a **contingut històric**:
    porten `dynamic: true` amb `reviewBy` igual a la data de l'examen, que ja ha
    passat. Això les manté fora dels simulacres i de la quota d'actualitat, on
    afirmarien com a vigent l'estat del món del dia de l'examen.
"""
import json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import extract_exam as E

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / 'sources/cache'
OUT = ROOT / 'content/municipalities/roses/questions/official-exams.ts'

# Noms de les marques d'extracció en castellà, per a la versió es del text.
MARKS_ES = {
    'asterisc': 'asterisco',
    'color': 'color',
    'negreta': 'negrita',
    'ressaltat': 'resaltado',
}

# Quadernets a importar: sourceId → metadades de l'examen.
EXAMS = [
    ('roses-examen-2026-interins-cg', 'roses-2026-interins-cg', 2026, 'interina', 'cultura-general', '2026-04-15'),
    ('roses-examen-2026-interins-cp', 'roses-2026-interins-cp', 2026, 'interina', 'coneixements-professionals', '2026-04-15'),
    ('roses-examen-2025-propietat-cg', 'roses-2025-propietat-cg', 2025, 'propietat', 'cultura-general', '2025-12-03'),
    ('roses-examen-2025-propietat-cp', 'roses-2025-propietat-cp', 2025, 'propietat', 'coneixements-professionals', '2025-12-03'),
    ('roses-examen-2025-interins-cg', 'roses-2025-interins-cg', 2025, 'interina', 'cultura-general', '2025-04-16'),
    ('roses-examen-2025-interins-cp', 'roses-2025-interins-cp', 2025, 'interina', 'coneixements-professionals', '2025-04-16'),
]

# Notes de revisió humana, per questionId.
#
# Aquí només hi entra el que s'ha comprovat mirant el document oficial i
# contrastant-lo amb la norma vigent. Una resposta oficial **no es canvia mai**:
# el que va publicar el tribunal es conserva. El que sí que es fa és avisar quan
# ha quedat enrere, perquè qui estudia no aprengui una redacció derogada.
#
# Vegeu artifacts/auditoria-visual-p0.md.
REVIEW_NOTES = {
    'q-of-roses-2025-interins-cp-036': (
        'La resposta del tribunal (greu, 750 €) és la qualificació del text de 2019. '
        'La modificació de l’Ordenança de convivència aprovada el 24 de febrer de 2021 '
        '(BOP de Girona núm. 54, de 19-03-2021, modificació cinquena) va rebaixar '
        'l’article 11.2 a infracció lleu amb 500 €. La resposta oficial es conserva tal '
        'com es va publicar; el dret vigent avui, però, és l’altre.'
    ),
}

# El tribunal no etiqueta les preguntes per tema. La classificació que porta
# cada pregunta és **editorial**: viu a `official-topic-map.json`, revisada
# pregunta a pregunta contra l'àmbit publicat de cada tema, amb el motiu de
# cada decisió. El que aquell mapa no assigna es queda en aquest contenidor:
# no s'endevina mai un tema per paraules clau.
CONTAINER_TOPIC = 'roses-examen-oficial'
CLASSIFICATION_REPORT = ROOT / 'artifacts/classificacio-oficials.md'
TOPIC_MAP_PATH = ROOT / 'content/municipalities/roses/questions/official-topic-map.json'


def load_topic_map():
    """Mapa de classificació, amb validació estricta.

    Cada quadernet importat ha de tenir una decisió per a **cada** pregunta:
    una classificació incompleta fallaria en silenci deixant preguntes al
    contenidor sense que ningú ho hagués decidit.
    """
    data = json.loads(TOPIC_MAP_PATH.read_text(encoding='utf-8'))
    assert data['container'] == CONTAINER_TOPIC
    for exam_id, entries in data['exams'].items():
        for number, entry in entries.items():
            topic = entry['topic']
            if topic is not None and not (1 <= topic <= 40):
                raise SystemExit(f'{exam_id} #{number}: tema fora de rang: {topic}')
            if not entry.get('why'):
                raise SystemExit(f'{exam_id} #{number}: decisió sense motiu')
    return data['exams']


def ts(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ') + "'"


def clean(s: str) -> str:
    s = re.sub(r'\s+', ' ', s).strip()
    return s.rstrip('*').strip()



def write_classification_report(topic_map, rows):
    """Informe llegible de la classificació, generat del mateix mapa.

    Un informe redactat a part acabaria dient una cosa diferent del banc; aquest
    surt de les mateixes decisions que s'acaben d'aplicar.
    """
    import json as _json
    syllabus = _json.loads(
        (ROOT / 'content/municipalities/roses/syllabus.json').read_text(encoding='utf-8')
    )
    titles = {t['topicId']: f"{t['number']}. {t['title']['ca']}" for t in syllabus['topics']}
    titles[CONTAINER_TOPIC] = 'Contenidor dels quadernets (fora del temari)'

    by_topic = {}
    for topic_id, qid, stem, why in rows:
        by_topic.setdefault(topic_id, []).append((qid, stem, why))

    classified = sum(len(v) for t, v in by_topic.items() if t != CONTAINER_TOPIC)
    container = len(by_topic.get(CONTAINER_TOPIC, []))

    def order_key(topic_id):
        return (topic_id == CONTAINER_TOPIC, topic_id)

    lines = [
        '# Classificació temàtica de les preguntes d\'examen oficial',
        '',
        '**Generat** per `scripts/transcription/generate_official_questions.py` a partir',
        'd\'`official-topic-map.json`, el mapa revisat pregunta a pregunta. No s\'edita a mà.',
        '',
        'El tribunal no etiqueta les preguntes per tema: aquesta classificació és',
        '**editorial**, feta contra l\'àmbit publicat de cada tema del temari, i cada',
        'decisió porta el seu motiu. Una pregunta s\'assigna només si cau dins d\'un',
        'àmbit; el que cap tema cobreix (cultura general, actualitat del dia de',
        'l\'examen, matèria fora de temari) queda al contenidor, també amb motiu.',
        '',
        f'**{classified + container} preguntes revisades: {classified} classificades '
        f'en {sum(1 for t in by_topic if t != CONTAINER_TOPIC)} temes, {container} al contenidor.**',
        '',
    ]
    for topic_id in sorted(by_topic, key=order_key):
        entries = by_topic[topic_id]
        lines.append(f'## {titles[topic_id]} — {len(entries)}')
        lines.append('')
        for qid, stem, why in entries:
            short = stem if len(stem) <= 110 else stem[:107] + '…'
            lines.append(f'- `{qid}` — {short}')
            lines.append(f'  - *{why}*')
        lines.append('')
    CLASSIFICATION_REPORT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Escrit {CLASSIFICATION_REPORT.relative_to(ROOT)}')

def main():
    topic_map = load_topic_map()
    blocks, stats, rows_for_report = [], [], []
    for source_id, exam_id, year, place, test, held in EXAMS:
        pdf = CACHE / f'{source_id}.pdf'
        questions, _ = E.parse(pdf)
        full = [q for q in questions if len(q.options) == 4]
        kept = blocked = 0
        for q in full:
            answer = q.answer
            stem = clean(q.stem)
            if len(stem) < 8:
                continue
            qid = f'q-of-{exam_id}-{q.number:03d}'
            opts = ',\n      '.join(
                '{ optionId: %s, text: %s }' % (ts(o.letter), ts(clean(o.text)))
                for o in q.options
            )
            is_cg = test == 'cultura-general'
            if answer is None:
                blocked += 1
            else:
                kept += 1
            marks = sorted({m for o in q.marked() for m in o.marks}) or ['cap']
            # El text sota «Per què» ha de dir la veritat sobre el que sap. El
            # tribunal publica la clau, no el fonament, i aquesta app no
            # redacta fonaments de memòria: en lloc de vestir la procedència
            # d'explicació, es diu què hi ha (la clau del tribunal, amb la
            # marca que la fa llegible al PDF) i què pot fer qui estudia amb
            # el dubte (el tema del temari i el quadernet enllaçat a la font).
            ca = ((f'El tribunal va marcar la {answer}) com a bona (al quadernet, amb '
                   + ' i '.join(marks) + '). No en va publicar el fonament i aquesta app '
                   'no l’inventa: si el perquè no et surt, busca’l al tema corresponent '
                   'del temari i contrasta’l amb el quadernet enllaçat a la font.')
                  if answer else
                  (f'Pregunta {q.number} del quadernet oficial de {held}. El quadernet '
                   'no porta cap marca de resposta inequívoca, de manera que la pregunta '
                   'queda sense clau oficial.'))
            note = REVIEW_NOTES.get(qid)
            es = ((f'El tribunal marcó la {answer}) como buena (en el cuadernillo, con '
                   + ' y '.join(MARKS_ES.get(m, m) for m in marks) + '). No publicó el '
                   'fundamento y esta app no lo inventa: si el porqué no te sale, '
                   'búscalo en el tema correspondiente del temario y contrástalo con el '
                   'cuadernillo enlazado en la fuente.')
                  if answer else
                  (f'Pregunta {q.number} del cuadernillo oficial de {held}. El cuadernillo '
                   'no lleva ninguna marca de respuesta inequívoca, por lo que la pregunta '
                   'queda sin clave oficial.'))
            entry = topic_map.get(exam_id, {}).get(str(q.number))
            if entry is None:
                raise SystemExit(
                    f'{exam_id} #{q.number}: sense decisió a official-topic-map.json. '
                    'La classificació es revisa a mà; no es deixa cap pregunta sense decidir.'
                )
            topic_id = CONTAINER_TOPIC if entry['topic'] is None else f"roses-t{entry['topic']:02d}"
            rows_for_report.append((topic_id, qid, q.stem, entry['why']))
            block = f"""  {{
    questionId: {ts(qid)},
    topicId: {ts(topic_id)},
    track: {ts(test)},
    origin: 'official',
    status: {ts('active' if answer else 'draft')},
    difficulty: 'mitjana',
    stem: {ts(stem)},
    options: [
      {opts},
    ],
    correct: {ts(answer or 'a')},
    explanation: {{
      ca: {ts(ca)},
      es: {ts(es)},
    }},
    references: [
      {{
        sourceId: {ts(source_id)},
        locator: {ts(f'pregunta {q.number}, pàgina {q.page} del PDF')},
        validAt: {ts(held)},
        reviewStatus: {ts('verified' if answer else 'pending-source-verification')},
      }},
    ],
    dynamic: {'true' if is_cg else 'false'},
{f"    reviewBy: {ts(held)}," if is_cg else ''}    officialExam: {{
      examId: {ts(exam_id)},
      year: {year},
      placeType: {ts(place)},
      testType: {ts(test)},
      originalNumber: {q.number},
      officialAnswer: {ts(answer or 'anullada')},
      reserve: {'true' if q.reserve else 'false'},
{f"      transcriptionNotes: {ts(note)}," if note else (f"      transcriptionNotes: {ts('Sense marca de resposta al quadernet: importada sense clau.')}," if not answer else '')}    }},
    tags: [{ts('examen-oficial')}, {ts(f'examen-{year}')}],
  }},"""
            blocks.append(block)
        stats.append((exam_id, len(full), kept, blocked))

    header = '''/**
 * Preguntes transcrites dels quadernets oficials publicats per l'Ajuntament de
 * Roses. **Generat** per `scripts/transcription/generate_official_questions.py`
 * a partir dels PDF adoptats a `sources/cache/`; no s'edita a mà.
 *
 * La resposta de cada pregunta és la que porta marcada el quadernet oficial
 * (asterisc, color o traç, segons la convocatòria) i no s'ha deduït mai. El que
 * va publicar el tribunal es conserva tal com es va publicar.
 *
 * ─── Per què les de cultura general no entren als simulacres ─────────────
 *
 * Les proves de cultura general de Roses reserven la meitat de les preguntes a
 * l'actualitat: «Qui és l'actual ministre/a de Defensa?», «Qui ha guanyat
 * l'Òscar l'any 2026?». Són certes el dia de l'examen i deixen de ser-ho
 * després. S'importen amb `dynamic: true` i `reviewBy` igual a la data de
 * l'examen —una data ja passada— de manera que `isCurrent()` les exclou dels
 * quadernets i de la quota d'actualitat. Segueixen sent consultables com a
 * material històric, amb la seva data.
 *
 * El `topicId` de cada pregunta és una **classificació editorial**: el
 * tribunal no etiqueta les preguntes per tema. L'assignació viu a
 * `official-topic-map.json`, revisada pregunta a pregunta contra l'àmbit
 * publicat de cada tema i amb el motiu de cada decisió. Les que cap tema del
 * temari cobreix (cultura general, actualitat del dia de l'examen) queden al
 * contenidor `roses-examen-oficial`.
 */
import type { Question } from '../../../schemas/index.ts'

export const OFFICIAL_EXAM_QUESTIONS: Question[] = [
'''
    OUT.write_text(header + '\n'.join(blocks) + '\n]\n', encoding='utf-8')
    write_classification_report(topic_map, rows_for_report)
    print(f'Escrit {OUT.relative_to(ROOT)}')
    print(f"{'examen':28} {'preg':>5} {'amb clau':>9} {'sense clau':>11}")
    for e, n, k, b in stats:
        print(f'{e:28} {n:>5} {k:>9} {b:>11}')
    print(f"{'TOTAL':28} {sum(s[1] for s in stats):>5} {sum(s[2] for s in stats):>9} {sum(s[3] for s in stats):>11}")


if __name__ == '__main__':
    main()
