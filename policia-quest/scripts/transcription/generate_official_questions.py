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
#
# Els sis primers són els vigents (2025-2026); la resta, els 24 històrics
# (2016-2024), adoptats amb còpia local i SHA-256 comprovat però pendents de
# transcriure fins ara. Cap resposta s'hi ha deduït: surt sempre de la marca
# del quadernet, i on l'extractor no en troba cap d'inequívoca, la pregunta
# s'importa sense clau (`status: 'draft'`).
EXAMS = [
    ('roses-examen-2026-interins-cg', 'roses-2026-interins-cg', 2026, 'interina', 'cultura-general', '2026-04-15'),
    ('roses-examen-2026-interins-cp', 'roses-2026-interins-cp', 2026, 'interina', 'coneixements-professionals', '2026-04-15'),
    ('roses-examen-2025-propietat-cg', 'roses-2025-propietat-cg', 2025, 'propietat', 'cultura-general', '2025-12-03'),
    ('roses-examen-2025-propietat-cp', 'roses-2025-propietat-cp', 2025, 'propietat', 'coneixements-professionals', '2025-12-03'),
    ('roses-examen-2025-interins-cg', 'roses-2025-interins-cg', 2025, 'interina', 'cultura-general', '2025-04-16'),
    ('roses-examen-2025-interins-cp', 'roses-2025-interins-cp', 2025, 'interina', 'coneixements-professionals', '2025-04-16'),
    ('roses-examen-2024-propietat-cg', 'roses-2024-propietat-cg', 2024, 'propietat', 'cultura-general', '2024-06-19'),
    ('roses-examen-2024-propietat-cp', 'roses-2024-propietat-cp', 2024, 'propietat', 'coneixements-professionals', '2024-06-19'),
    ('roses-examen-2024-interins-cg', 'roses-2024-interins-cg', 2024, 'interina', 'cultura-general', '2024-04-03'),
    ('roses-examen-2024-interins-cp', 'roses-2024-interins-cp', 2024, 'interina', 'coneixements-professionals', '2024-04-03'),
    ('roses-examen-2023-interins-cg', 'roses-2023-interins-cg', 2023, 'interina', 'cultura-general', '2023-03-27'),
    ('roses-examen-2023-interins-cp', 'roses-2023-interins-cp', 2023, 'interina', 'coneixements-professionals', '2023-03-27'),
    ('roses-examen-2022-interins-cg', 'roses-2022-interins-cg', 2022, 'interina', 'cultura-general', '2022-04-19'),
    ('roses-examen-2022-interins-cp', 'roses-2022-interins-cp', 2022, 'interina', 'coneixements-professionals', '2022-04-19'),
    ('roses-examen-2021-propietat-cg', 'roses-2021-propietat-cg', 2021, 'propietat', 'cultura-general', '2021-04-13'),
    ('roses-examen-2021-propietat-cp', 'roses-2021-propietat-cp', 2021, 'propietat', 'coneixements-professionals', '2021-04-13'),
    ('roses-examen-2021-interins-cg', 'roses-2021-interins-cg', 2021, 'interina', 'cultura-general', '2021-04-27'),
    ('roses-examen-2021-interins-cp', 'roses-2021-interins-cp', 2021, 'interina', 'coneixements-professionals', '2021-04-27'),
    ('roses-examen-2019-propietat-cg', 'roses-2019-propietat-cg', 2019, 'propietat', 'cultura-general', '2019-06-25'),
    ('roses-examen-2019-propietat-cp', 'roses-2019-propietat-cp', 2019, 'propietat', 'coneixements-professionals', '2019-06-25'),
    ('roses-examen-2019-interins-cg', 'roses-2019-interins-cg', 2019, 'interina', 'cultura-general', '2019-05-20'),
    ('roses-examen-2019-interins-cp', 'roses-2019-interins-cp', 2019, 'interina', 'coneixements-professionals', '2019-05-20'),
    ('roses-examen-2018-propietat-cg', 'roses-2018-propietat-cg', 2018, 'propietat', 'cultura-general', '2018-07-31'),
    ('roses-examen-2018-propietat-cp', 'roses-2018-propietat-cp', 2018, 'propietat', 'coneixements-professionals', '2018-07-31'),
    ('roses-examen-2018-interins-cg', 'roses-2018-interins-cg', 2018, 'interina', 'cultura-general', '2018-05-09'),
    ('roses-examen-2018-interins-cp', 'roses-2018-interins-cp', 2018, 'interina', 'coneixements-professionals', '2018-05-09'),
    ('roses-examen-2017-interins-cg', 'roses-2017-interins-cg', 2017, 'interina', 'cultura-general', '2017-05-22'),
    ('roses-examen-2017-interins-cp', 'roses-2017-interins-cp', 2017, 'interina', 'coneixements-professionals', '2017-05-22'),
    ('roses-examen-2016-interins-cg', 'roses-2016-interins-cg', 2016, 'interina', 'cultura-general', '2016-04-15'),
    ('roses-examen-2016-interins-cp', 'roses-2016-interins-cp', 2016, 'interina', 'coneixements-professionals', '2016-04-15'),
]

# Notes de revisió humana, per questionId.
#
# Això és per a coses de la **transcripció**: una marca ambigua al PDF, una
# errata del quadernet, un detall que només es veu obrint el document. El que
# digui la norma, en canvi, ja no viu aquí: viu a `official-evidence-map.json`,
# amb la cita que ho sosté, i la pantalla en fa tres blocs. Repetir-ho en prosa
# en un quart lloc no informava més; només deia dues vegades el mateix amb
# paraules diferents.
REVIEW_NOTES: dict[str, str] = {}

# Preguntes que no s'importen, amb el motiu.
#
# No és «el tribunal es va equivocar»: és que el seu enunciat coincideix
# lletra a lletra amb una pregunta ja escrita a mà al banc, i el validador de
# duplicats —que tolera que dos exàmens oficials repeteixin la mateixa
# pregunta, però no que una d'oficial dupliqui una de pròpia— té raó de
# fer-ho fallar: la persona que estudia la veuria dues vegades com si fossin
# diferents. No es pot arreglar canviant l'enunciat oficial (mai s'inventa
# ni es retoca) ni el de la lliçó (és contingut previ i verificat pel seu
# compte); l'única sortida honesta és no duplicar-la.
SKIP = {
    ('roses-2024-interins-cp', 19): 'mateix enunciat que q-roses-t20-004 (dret a la protecció de dades personals)',
    ('roses-2021-interins-cp', 6): 'mateix enunciat que q-roses-t23-001 (presidència de la Junta Local de Seguretat)',
}

# El tribunal no etiqueta les preguntes per tema. La classificació que porta
# cada pregunta és **editorial**: viu a `official-topic-map.json`, revisada
# pregunta a pregunta contra l'àmbit publicat de cada tema, amb el motiu de
# cada decisió. El que aquell mapa no assigna es queda en aquest contenidor:
# no s'endevina mai un tema per paraules clau.
CONTAINER_TOPIC = 'roses-examen-oficial'
CLASSIFICATION_REPORT = ROOT / 'artifacts/classificacio-oficials.md'
TOPIC_MAP_PATH = ROOT / 'content/municipalities/roses/questions/official-topic-map.json'

# Matriu probatòria: què se sap de cada pregunta i amb quina cita. D'aquí surten
# les explicacions reals i la referència a la norma que les sosté. El que no hi
# tingui explicació es queda amb el text de procedència: dir «no ho sabem» és
# millor que redactar un fonament de memòria.
EVIDENCE_MAP_PATH = ROOT / 'content/municipalities/roses/questions/official-evidence-map.json'


def load_evidence_map():
    data = json.loads(EVIDENCE_MAP_PATH.read_text(encoding='utf-8'))
    for qid, entry in data['decisions'].items():
        explain = entry.get('explain')
        if explain is None:
            continue
        if not entry.get('citations'):
            raise SystemExit(
                f'{qid}: té explicació però cap cita. Una explicació sense font és '
                'exactament el que aquest projecte no escriu.'
            )
        for lang in ('ca', 'es'):
            if len(explain.get(lang, '')) < 80:
                raise SystemExit(f'{qid}: explicació {lang} massa curta per ensenyar res')
    return data['decisions'], data['reviewedOn']


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
    evidence_map, evidence_reviewed_on = load_evidence_map()
    blocks, stats, rows_for_report = [], [], []
    for source_id, exam_id, year, place, test, held in EXAMS:
        pdf = CACHE / f'{source_id}.pdf'
        questions, _ = E.parse_with_fallback(pdf)
        full = [q for q in questions if len(q.options) == 4]
        # Una reserva pot reprendre la numeració de l'examen o reiniciar-la
        # des d'1. Quan la reinicia, el seu número xoca amb el de la
        # pregunta ordinària homònima; quan la continua (21, 41…), no
        # col·lideix mai i l'identificador que ja porten els sis exàmens
        # vigents no s'ha de tocar. Només es distingeix amb un sufix «r»
        # —el mateix que `topic_key`, no un prefix— quan la col·lisió és
        # real, un examen a la vegada.
        regular_nums = {q.number for q in full if not q.reserve}
        kept = blocked = 0
        for q in full:
            if (exam_id, q.number) in SKIP and not q.reserve:
                continue
            answer = q.answer
            stem = clean(q.stem)
            if len(stem) < 8:
                continue
            colliding_reserve = q.reserve and q.number in regular_nums
            qid = f'q-of-{exam_id}-{q.number:03d}r' if colliding_reserve else f'q-of-{exam_id}-{q.number:03d}'
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
            # Si la matriu probatòria porta una explicació escrita contra
            # l'article, mana ella: és el que ensenya. El text de procedència
            # només es queda on no hi ha res demostrat.
            evidence = evidence_map.get(qid, {})
            explain = evidence.get('explain')
            if explain:
                ca, es = explain['ca'], explain['es']

            # Les preguntes de reserva a vegades reprenen la numeració
            # de l'examen (21, 41…) i a vegades la reinicien des d'1: en
            # els quadernets que la reinicien, una reserva #1 col·lidiria
            # amb la pregunta ordinària #1 si la clau fos només el número.
            # El sufix «r» les separa sempre, tant si calia com si no.
            topic_key = f'{q.number}r' if q.reserve else str(q.number)
            entry = topic_map.get(exam_id, {}).get(topic_key)
            if entry is None:
                raise SystemExit(
                    f'{exam_id} #{topic_key}: sense decisió a official-topic-map.json. '
                    'La classificació es revisa a mà; no es deixa cap pregunta sense decidir.'
                )
            topic_id = CONTAINER_TOPIC if entry['topic'] is None else f"roses-t{entry['topic']:02d}"
            # La norma citada entra com a referència pròpia: qui estudia ha de
            # poder anar de l'explicació al text, i el quadernet sol no hi porta.
            # `validAt` és el dia que es va contrastar la cita contra la còpia
            # local, no la data de l'examen: és el que se sap de debò.
            norm_refs = ''
            if explain:
                seen = []
                for cit in evidence['citations']:
                    key = (cit['sourceId'], cit['locator'])
                    if key in seen:
                        continue
                    seen.append(key)
                    norm_refs += (
                        '\n      {\n'
                        f'        sourceId: {ts(cit["sourceId"])},\n'
                        f'        locator: {ts(cit["locator"])},\n'
                        f'        validAt: {ts(evidence_reviewed_on)},\n'
                        "        reviewStatus: 'verified',\n"
                        '      },'
                    )
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
      }},{norm_refs}
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
