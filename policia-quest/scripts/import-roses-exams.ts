/**
 * Importació dels exàmens oficials de Roses. `npm run exams:import`
 *
 * Llegeix el text extret de sources/extracted/ i genera un esborrany de
 * transcripció per a cada quadernet registrat a content/municipalities/roses/exams.ts.
 *
 * ─── Principi innegociable ───────────────────────────────────────────────
 *
 * Aquest script **no inventa cap pregunta**. Si el text d'origen no hi és,
 * l'examen queda com a `pending-source` i es reporta. Un examen oficial només
 * es pot transcriure del document oficial.
 *
 * ─── Què fa quan sí que hi ha text ───────────────────────────────────────
 *
 * 1. Detecta blocs numerats "1.", "2."… seguits d'opcions "a)", "b)", "c)", "d)".
 * 2. Cerca el full de respostes publicat pel tribunal al final del document.
 * 3. Escriu un esborrany a content/municipalities/roses/exams/<examId>.draft.json
 *    amb `status: 'historical'` i `origin: 'official'`.
 *
 * L'esborrany **sempre** requereix revisió humana abans d'entrar al banc:
 * l'extracció de PDF trenca accents, parteix línies i confon columnes. Les
 * correccions tècniques s'han de documentar a `transcriptionNotes`.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROSES_EXAMS } from '../content/municipalities/roses/exams.ts'
import type { OfficialExamMeta, Question } from '../content/schemas/index.ts'

const EXTRACTED_DIR = 'sources/extracted'
const DRAFT_DIR = 'content/municipalities/roses/exams'

mkdirSync(DRAFT_DIR, { recursive: true })

interface ParsedItem {
  number: number
  stem: string
  options: string[]
}

/** Extreu preguntes numerades amb quatre opcions etiquetades a) b) c) d). */
export function parseExamText(text: string): ParsedItem[] {
  const normalized = text.replace(/\r/g, '').replace(/ /g, ' ')
  const items: ParsedItem[] = []

  // Talla el document en blocs que comencen per "<número>." o "<número>)".
  const blocks = normalized.split(/\n(?=\s*\d{1,3}\s*[.)]\s)/)
  for (const block of blocks) {
    const header = /^\s*(\d{1,3})\s*[.)]\s*([\s\S]*)$/.exec(block)
    if (!header) continue
    const number = Number(header[1])
    const body = header[2] ?? ''

    const optionMatches = [...body.matchAll(/(?:^|\n)\s*([a-dA-D])\s*[).]\s*([^\n]*)/g)]
    if (optionMatches.length < 4) continue

    const firstOptionIndex = body.indexOf(optionMatches[0]![0])
    const stem = body.slice(0, firstOptionIndex).replace(/\s+/g, ' ').trim()
    if (stem.length < 8) continue

    const options = optionMatches.slice(0, 4).map((m) => (m[2] ?? '').replace(/\s+/g, ' ').trim())
    if (options.some((o) => o.length === 0)) continue

    items.push({ number, stem, options })
  }
  return items
}

/** Cerca un full de respostes del tipus "1-a 2-c 3-b" o "1. A". */
export function parseAnswerKey(text: string): Map<number, 'a' | 'b' | 'c' | 'd'> {
  const key = new Map<number, 'a' | 'b' | 'c' | 'd'>()
  for (const match of text.matchAll(/\b(\d{1,3})\s*[-.:)]?\s*([abcdABCD])\b/g)) {
    const n = Number(match[1])
    const letter = (match[2] ?? '').toLowerCase() as 'a' | 'b' | 'c' | 'd'
    if (n >= 1 && n <= 200 && !key.has(n)) key.set(n, letter)
  }
  return key
}

let imported = 0
const pending: string[] = []

for (const exam of ROSES_EXAMS) {
  const textPath = join(EXTRACTED_DIR, `${exam.sourceId}.txt`)
  if (!existsSync(textPath)) {
    pending.push(`${exam.examId} — falta ${textPath}`)
    continue
  }

  const text = readFileSync(textPath, 'utf8')
  const items = parseExamText(text)
  if (items.length === 0) {
    pending.push(`${exam.examId} — text present però no s’hi van reconèixer preguntes`)
    continue
  }

  const answers = parseAnswerKey(text.slice(text.length >> 1))
  const questions: Question[] = items.map((item) => {
    const officialAnswer = answers.get(item.number)
    const meta: OfficialExamMeta = {
      examId: exam.examId,
      year: exam.year,
      placeType: exam.placeType,
      testType: exam.testType,
      originalNumber: item.number,
      officialAnswer: officialAnswer ?? 'anullada',
      reserve: exam.expectedQuestionCount ? item.number > exam.expectedQuestionCount : false,
      ...(officialAnswer
        ? {}
        : { transcriptionNotes: 'Resposta oficial no localitzada al full de respostes: cal revisió humana.' }),
    }
    return {
      questionId: `q-${exam.examId}-${String(item.number).padStart(3, '0')}`,
      topicId: 'roses-t01', // provisional: cal assignar-lo a la revisió humana
      track: exam.testType,
      origin: 'official',
      // Els exàmens històrics no entren al banc actiu fins que es revisen.
      status: 'draft',
      difficulty: 'mitjana',
      stem: item.stem,
      options: (['a', 'b', 'c', 'd'] as const).map((letter, i) => ({
        optionId: letter,
        text: item.options[i] ?? '',
      })),
      correct: officialAnswer ?? 'a',
      explanation: {
        ca: 'Pendent de redactar la correcció raonada durant la revisió humana.',
      },
      references: [
        {
          sourceId: exam.sourceId,
          locator: `pregunta ${item.number} del quadernet original`,
          validAt: exam.heldOn ?? `${exam.year}-01-01`,
          reviewStatus: 'pending-source-verification',
        },
      ],
      dynamic: false,
      officialExam: meta,
      tags: ['examen-oficial', `any-${exam.year}`],
    }
  })

  writeFileSync(
    join(DRAFT_DIR, `${exam.examId}.draft.json`),
    JSON.stringify({ examId: exam.examId, generatedAt: new Date().toISOString().slice(0, 10), questions }, null, 2) + '\n',
  )
  console.log(`  ✓ ${exam.examId}: ${questions.length} preguntes en esborrany`)
  imported++
}

console.log(`\n${imported} exàmens amb esborrany generat; ${pending.length} pendents.`)
if (pending.length > 0) {
  console.log('\nPendents:')
  for (const p of pending) console.log(`  · ${p}`)
  console.log('\nExecuteu `npm run sources:download` i `npm run sources:extract` des d’una xarxa amb accés.')
}
if (imported > 0) {
  console.log('\nEls esborranys queden en estat "draft" i NO es mostren a l’usuari fins que una')
  console.log('persona els revisi: assigni el tema, comprovi la transcripció i redacti la correcció.')
}
