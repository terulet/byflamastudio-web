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

# Quadernets a importar: sourceId → metadades de l'examen.
EXAMS = [
    ('roses-examen-2026-interins-cg', 'roses-2026-interins-cg', 2026, 'interina', 'cultura-general', '2026-04-15'),
    ('roses-examen-2026-interins-cp', 'roses-2026-interins-cp', 2026, 'interina', 'coneixements-professionals', '2026-04-15'),
    ('roses-examen-2025-propietat-cg', 'roses-2025-propietat-cg', 2025, 'propietat', 'cultura-general', '2025-12-03'),
    ('roses-examen-2025-propietat-cp', 'roses-2025-propietat-cp', 2025, 'propietat', 'coneixements-professionals', '2025-12-03'),
    ('roses-examen-2025-interins-cg', 'roses-2025-interins-cg', 2025, 'interina', 'cultura-general', '2025-04-16'),
    ('roses-examen-2025-interins-cp', 'roses-2025-interins-cp', 2025, 'interina', 'coneixements-professionals', '2025-04-16'),
]

# Contenidor per a preguntes d'examen oficial. El tribunal no etiqueta les
# preguntes per tema i inventar-ne un seria afirmar el que no consta.
CONTAINER_TOPIC = 'roses-examen-oficial'


def ts(s: str) -> str:
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', ' ') + "'"


def clean(s: str) -> str:
    s = re.sub(r'\s+', ' ', s).strip()
    return s.rstrip('*').strip()


def main():
    blocks, stats = [], []
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
            ca = (f'Pregunta {q.number} del quadernet oficial de {held}. '
                  + ('La resposta és la que va marcar el tribunal al quadernet publicat (marca: '
                     + ', '.join(marks) + ').' if answer else
                     'El quadernet no porta cap marca de resposta inequívoca, de manera que la '
                     'pregunta queda sense clau oficial.'))
            es = (f'Pregunta {q.number} del cuadernillo oficial de {held}. '
                  + ('La respuesta es la que marcó el tribunal en el cuadernillo publicado.'
                     if answer else
                     'El cuadernillo no lleva ninguna marca de respuesta inequívoca, por lo que la '
                     'pregunta queda sin clave oficial.'))
            block = f"""  {{
    questionId: {ts(qid)},
    topicId: {ts(CONTAINER_TOPIC)},
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
{f"      transcriptionNotes: {ts('Sense marca de resposta al quadernet: importada sense clau.')}," if not answer else ''}    }},
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
 * El tema `roses-examen-oficial` és un **contenidor**, no un tema del temari:
 * el tribunal no etiqueta les preguntes per tema i assignar-los-en un seria
 * afirmar el que el document no diu.
 */
import type { Question } from '../../../schemas/index.ts'

export const OFFICIAL_EXAM_QUESTIONS: Question[] = [
'''
    OUT.write_text(header + '\n'.join(blocks) + '\n]\n', encoding='utf-8')
    print(f'Escrit {OUT.relative_to(ROOT)}')
    print(f"{'examen':28} {'preg':>5} {'amb clau':>9} {'sense clau':>11}")
    for e, n, k, b in stats:
        print(f'{e:28} {n:>5} {k:>9} {b:>11}')
    print(f"{'TOTAL':28} {sum(s[1] for s in stats):>5} {sum(s[2] for s in stats):>9} {sum(s[3] for s in stats):>11}")


if __name__ == '__main__':
    main()
