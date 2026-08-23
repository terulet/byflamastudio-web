/**
 * Tests de contingut.
 *
 * Cobreixen les mateixes invariants que `npm run content:validate`, però com a
 * tests perquè fallin dins la suite i no només al pas de validació. Si algú
 * afegeix una pregunta sense font o trenca la numeració del temari, això es
 * posa vermell.
 */
import { describe, expect, it } from 'vitest'
import { ROSES_PACK } from '../../content/municipalities/roses/index.ts'
import { Lesson, Question, SourceManifest, Syllabus } from '../../content/schemas/index.ts'
import manifestJson from '../../sources/source-manifest.json' with { type: 'json' }
import { dedupeHash } from '../../scripts/lib/dedupe.ts'
import { CONEIXEMENTS_SCORING, CULTURA_GENERAL_SCORING } from '../../src/engines/scoring.ts'

const { syllabus, questions, lessons, exams, sources, blueprints, currentAffairs } = ROSES_PACK
const active = questions.filter((q) => q.status === 'active')
const sourceIds = new Set(sources.map((s) => s.sourceId))
const topicIds = new Set(syllabus.topics.map((t) => t.topicId))

describe('temari', () => {
  it('té exactament 40 temes', () => {
    expect(syllabus.topics).toHaveLength(40)
  })

  it('valida contra l’esquema', () => {
    expect(Syllabus.safeParse(syllabus).success).toBe(true)
  })

  it('està numerat de l’1 al 40 sense salts ni repeticions', () => {
    const numbers = syllabus.topics.map((t) => t.number).sort((a, b) => a - b)
    expect(numbers).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
  })

  it('registra l’equivalència amb la numeració de 2025', () => {
    const map = new Map(syllabus.topics.map((t) => [t.number, t.number2025]))
    // Els temes de pressupostos i règim disciplinari van invertits el 2025.
    expect(map.get(10)).toBe(11)
    expect(map.get(11)).toBe(10)
    // La resta coincideix.
    for (const [n, n2025] of map) {
      if (n !== 10 && n !== 11) expect(n2025).toBe(n)
    }
    // I l'equivalència és una bijecció.
    expect(new Set(map.values()).size).toBe(40)
  })

  it('reparteix els temes en els quatre blocs oficials', () => {
    const byBlock = new Map<string, number[]>()
    for (const t of syllabus.topics) {
      byBlock.set(t.block, [...(byBlock.get(t.block) ?? []), t.number])
    }
    expect([...(byBlock.get('institucions') ?? [])].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 20 }, (_, i) => i + 1),
    )
    expect([...(byBlock.get('seguretat-i-penal') ?? [])].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 10 }, (_, i) => i + 21),
    )
    expect([...(byBlock.get('roses-transit-convivencia') ?? [])].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 6 }, (_, i) => i + 31),
    )
    expect([...(byBlock.get('actuacio-i-proteccio') ?? [])].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 4 }, (_, i) => i + 37),
    )
  })

  it('cita la convocatòria de 2026 com a font canònica i la de 2025 com a contrast', () => {
    expect(syllabus.callSourceId).toBe('roses-bases-2026-interins')
    expect(syllabus.contrastSourceId).toBe('roses-bases-2025-propietat')
    expect(sourceIds.has(syllabus.callSourceId)).toBe(true)
  })
})

describe('microlliçons', () => {
  it('n’hi ha una per a cada tema', () => {
    const covered = new Set(lessons.map((l) => l.topicId))
    for (const topic of syllabus.topics) {
      expect(covered.has(topic.topicId), `falta la lliçó del tema ${topic.number}`).toBe(true)
    }
  })

  it('totes validen i tenen referències resolubles', () => {
    for (const lesson of lessons) {
      expect(Lesson.safeParse(lesson).success, lesson.lessonId).toBe(true)
      expect(lesson.references.length).toBeGreaterThan(0)
      for (const ref of lesson.references) {
        expect(sourceIds.has(ref.sourceId), `${lesson.lessonId} → ${ref.sourceId}`).toBe(true)
      }
    }
  })

  it('duren entre 3 i 7 minuts i no són murs de text', () => {
    for (const lesson of lessons) {
      expect(lesson.minutes).toBeGreaterThanOrEqual(3)
      expect(lesson.minutes).toBeLessThanOrEqual(7)
      expect(lesson.cards.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('ofereixen explicació en castellà a totes les targetes', () => {
    for (const lesson of lessons) {
      for (const card of lesson.cards) {
        if (card.kind === 'compare') {
          expect(card.leftHeader.es, lesson.lessonId).toBeTruthy()
          expect(card.rightHeader.es, lesson.lessonId).toBeTruthy()
        } else if (card.kind === 'checkpoint') {
          expect(card.prompt.es, lesson.lessonId).toBeTruthy()
          expect(card.answer.es, lesson.lessonId).toBeTruthy()
        } else {
          expect(card.body.es, lesson.lessonId).toBeTruthy()
        }
      }
    }
  })
})

describe('banc de preguntes', () => {
  it('supera el mínim de 200 preguntes actives', () => {
    expect(active.length).toBeGreaterThanOrEqual(200)
  })

  it('cada tema té almenys 4 preguntes actives', () => {
    const byTopic = new Map<string, number>()
    for (const q of active) byTopic.set(q.topicId, (byTopic.get(q.topicId) ?? 0) + 1)
    for (const topic of syllabus.topics) {
      const n = byTopic.get(topic.topicId) ?? 0
      expect(n, `tema ${topic.number} només té ${n} preguntes`).toBeGreaterThanOrEqual(4)
    }
  })

  it('no hi ha identificadors duplicats', () => {
    const ids = questions.map((q) => q.questionId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('no hi ha enunciats duplicats', () => {
    const hashes = questions.map((q) => dedupeHash(q.stem))
    expect(new Set(hashes).size).toBe(hashes.length)
  })

  it('totes validen contra l’esquema', () => {
    for (const q of questions) {
      const parsed = Question.safeParse(q)
      expect(parsed.success, `${q.questionId}: ${parsed.error?.issues[0]?.message ?? ''}`).toBe(true)
    }
  })

  it('cada pregunta té les opcions a, b, c i d i una resposta correcta present', () => {
    for (const q of questions) {
      expect(q.options.map((o) => o.optionId).sort()).toEqual(['a', 'b', 'c', 'd'])
      expect(q.options.some((o) => o.optionId === q.correct), q.questionId).toBe(true)
    }
  })

  it('cada pregunta activa té explicació i referència resoluble', () => {
    for (const q of active) {
      expect(q.explanation.ca.length, q.questionId).toBeGreaterThan(20)
      expect(q.references.length, q.questionId).toBeGreaterThan(0)
      for (const ref of q.references) {
        expect(sourceIds.has(ref.sourceId), `${q.questionId} → ${ref.sourceId}`).toBe(true)
        expect(ref.locator.length, q.questionId).toBeGreaterThan(0)
      }
    }
  })

  it('cada pregunta activa ofereix explicació en castellà', () => {
    for (const q of active) {
      expect(q.explanation.es, q.questionId).toBeTruthy()
    }
  })

  it('cada pregunta apunta a un tema que existeix', () => {
    for (const q of questions) {
      expect(topicIds.has(q.topicId), `${q.questionId} → ${q.topicId}`).toBe(true)
    }
  })

  it('les preguntes dinàmiques actives tenen data de revisió', () => {
    for (const q of active) {
      if (q.dynamic) expect(q.reviewBy, q.questionId).toBeTruthy()
    }
  })

  it('les preguntes d’examen oficial conserven any, prova i número original', () => {
    for (const q of questions.filter((x) => x.origin === 'official')) {
      expect(q.officialExam, q.questionId).toBeDefined()
      expect(q.officialExam?.year).toBeGreaterThan(2000)
      expect(q.officialExam?.originalNumber).toBeGreaterThan(0)
      expect(['cultura-general', 'coneixements-professionals']).toContain(q.officialExam?.testType)
    }
  })

  it('les preguntes d’examen històric no entren al banc actiu', () => {
    for (const q of active) {
      expect(q.origin, `${q.questionId} és oficial i està activa`).toBe('authored')
    }
  })
})

describe('fonts', () => {
  it('el manifest valida', () => {
    const parsed = SourceManifest.safeParse(manifestJson)
    expect(parsed.success).toBe(true)
  })

  it('no hi ha identificadors de font duplicats', () => {
    const ids = sources.map((s) => s.sourceId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('totes les fonts tenen una URL absoluta', () => {
    for (const source of sources) {
      expect(() => new URL(source.url), source.sourceId).not.toThrow()
      expect(source.url.startsWith('https://'), source.sourceId).toBe(true)
    }
  })

  it('les fonts no descarregades expliquen per què', () => {
    for (const source of sources) {
      if (source.fetchStatus === 'pending-download') {
        expect(source.fetchNote, source.sourceId).toBeTruthy()
      }
      if (source.fetchStatus === 'downloaded') {
        expect(source.sha256, source.sourceId).toMatch(/^[a-f0-9]{64}$/)
        expect(source.cacheFile, source.sourceId).toBeTruthy()
      }
    }
  })

  it('registra les quatre bases i quadernets de prioritat P0 de Roses', () => {
    for (const id of [
      'roses-bases-2026-interins',
      'roses-bases-2025-propietat',
      'roses-examen-2025-propietat-cg',
      'roses-examen-2025-propietat-cp',
      'roses-examen-2026-interins-cg',
      'roses-examen-2026-interins-cp',
      'roses-ordenanca-circulacio',
      'roses-ordenanca-convivencia',
    ]) {
      expect(sourceIds.has(id), `falta la font ${id}`).toBe(true)
    }
  })
})

describe('exàmens oficials', () => {
  it('registra els quatre exàmens de prioritat P0', () => {
    const p0 = exams.filter((e) => e.priority === 'P0')
    expect(p0).toHaveLength(4)
    for (const exam of p0) {
      expect(exam.expectedQuestionCount, exam.examId).toBeGreaterThan(0)
      expect(sourceIds.has(exam.sourceId), exam.examId).toBe(true)
    }
  })

  it('un examen pendent d’importar no conté preguntes i explica el motiu', () => {
    for (const exam of exams.filter((e) => e.importStatus === 'pending-source')) {
      expect(exam.questionIds, exam.examId).toHaveLength(0)
      expect(exam.note, exam.examId).toBeTruthy()
    }
  })

  it('un examen importat té les preguntes al banc amb metadades coherents', () => {
    const byId = new Map(questions.map((q) => [q.questionId, q]))
    for (const exam of exams.filter((e) => e.importStatus === 'imported')) {
      expect(exam.questionIds.length, exam.examId).toBeGreaterThan(0)
      for (const qid of exam.questionIds) {
        const q = byId.get(qid)
        expect(q, `${exam.examId} → ${qid}`).toBeDefined()
        expect(q?.officialExam?.examId).toBe(exam.examId)
        expect(q?.officialExam?.year).toBe(exam.year)
        expect(q?.officialExam?.testType).toBe(exam.testType)
      }
    }
  })

  it('no hi ha identificadors d’examen duplicats', () => {
    const ids = exams.map((e) => e.examId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('plànols de simulacre', () => {
  it('cultura general segueix les regles de Roses', () => {
    const cg = blueprints.find((b) => b.blueprintId === 'roses-cultura-general')
    expect(cg).toBeDefined()
    expect(cg?.questionCount).toBe(20)
    expect(cg?.durationMinutes).toBe(20)
    expect(cg?.reserveCount).toBe(1)
    expect(cg?.scoring).toEqual(CULTURA_GENERAL_SCORING)
    // 20 encerts han de donar exactament la nota màxima declarada.
    expect((cg?.questionCount ?? 0) * (cg?.scoring.correctMilli ?? 0)).toBe(cg?.scoring.maxScoreMilli)
  })

  it('coneixements professionals segueix les regles de Roses', () => {
    const cp = blueprints.find((b) => b.blueprintId === 'roses-coneixements-professionals')
    expect(cp).toBeDefined()
    expect(cp?.questionCount).toBe(40)
    expect(cp?.durationMinutes).toBe(60)
    expect(cp?.reserveCount).toBe(2)
    expect(cp?.scoring).toEqual(CONEIXEMENTS_SCORING)
    expect((cp?.questionCount ?? 0) * (cp?.scoring.correctMilli ?? 0)).toBe(cp?.scoring.maxScoreMilli)
  })

  it('el banc pot omplir tots els simulacres', () => {
    for (const bp of blueprints) {
      const available = active.filter((q) => q.track === bp.track).length
      expect(available, `${bp.blueprintId} necessita ${bp.questionCount}`).toBeGreaterThanOrEqual(
        bp.questionCount,
      )
    }
  })
})

describe('actualitat', () => {
  it('els paquets actius tenen data de caducitat posterior a la de creació', () => {
    for (const packItem of currentAffairs) {
      expect(packItem.expiresAt > packItem.createdAt, packItem.packId).toBe(true)
    }
  })

  it('un paquet buit explica per què ho és', () => {
    for (const packItem of currentAffairs) {
      if (packItem.questionIds.length === 0) expect(packItem.note, packItem.packId).toBeTruthy()
    }
  })

  it('les preguntes d’un paquet d’actualitat estan marcades com a dinàmiques', () => {
    const byId = new Map(questions.map((q) => [q.questionId, q]))
    for (const packItem of currentAffairs) {
      for (const qid of packItem.questionIds) {
        const q = byId.get(qid)
        expect(q, `${packItem.packId} → ${qid}`).toBeDefined()
        expect(q?.dynamic, qid).toBe(true)
        expect(q?.reviewBy, qid).toBeTruthy()
      }
    }
  })
})

describe('contingut específic de Roses', () => {
  it('el tema 31 parla de Roses i no de municipis en general', () => {
    const lesson = lessons.find((l) => l.topicId === 'roses-t31')
    expect(lesson).toBeDefined()
    const text = JSON.stringify(lesson)
    for (const term of ['Alt Empordà', 'Ciutadella', 'Cap de Creus', 'Aiguamolls']) {
      expect(text.includes(term), `la lliçó del tema 31 no esmenta "${term}"`).toBe(true)
    }
    const topicQuestions = active.filter((q) => q.topicId === 'roses-t31')
    expect(topicQuestions.length).toBeGreaterThanOrEqual(4)
  })

  it('els temes 35 i 36 citen les ordenances municipals de Roses', () => {
    for (const [topicId, sourceId] of [
      ['roses-t35', 'roses-ordenanca-circulacio'],
      ['roses-t36', 'roses-ordenanca-convivencia'],
    ] as const) {
      const lesson = lessons.find((l) => l.topicId === topicId)
      expect(lesson?.references.some((r) => r.sourceId === sourceId), topicId).toBe(true)
      const cites = active.filter(
        (q) => q.topicId === topicId && q.references.some((r) => r.sourceId === sourceId),
      )
      expect(cites.length, `${topicId} no té cap pregunta que citi ${sourceId}`).toBeGreaterThan(0)
    }
  })
})
