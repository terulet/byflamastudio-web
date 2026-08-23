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
import { examAvailability, isCurrent } from '../../src/engines/availability.ts'
import { CONEIXEMENTS_SCORING, CULTURA_GENERAL_SCORING } from '../../src/engines/scoring.ts'

const { syllabus, questions, lessons, exams, sources, blueprints, currentAffairs } = ROSES_PACK
const active = questions.filter((q) => q.status === 'active')
const sourceIds = new Set(sources.map((s) => s.sourceId))
const topicIds = new Set(syllabus.topics.map((t) => t.topicId))

/** El contingut dinàmic caduca: la capacitat es mesura contra el dia d'avui. */
const TODAY = new Date().toISOString().slice(0, 10)

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

  it('no hi ha enunciats duplicats entre les preguntes pròpies', () => {
    // Que el tribunal repetís una pregunta el 2025 i el 2026 és un fet del
    // document i cada instància és un registre històric propi. Duplicar-ne una
    // de collita pròpia, en canvi, és feina repetida.
    const own = questions.filter((q) => q.origin !== 'official')
    const hashes = own.map((q) => dedupeHash(q.stem))
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
    // Les preguntes d'examen oficial van a un contenidor propi: el tribunal no
    // les etiqueta per tema i assignar-los-en un seria afirmar el que el
    // quadernet no diu.
    const allowed = new Set([...topicIds, 'roses-examen-oficial'])
    for (const q of questions) {
      expect(allowed.has(q.topicId), `${q.questionId} → ${q.topicId}`).toBe(true)
    }
    for (const q of questions.filter((x) => x.topicId === 'roses-examen-oficial')) {
      expect(q.origin, `${q.questionId} no és oficial però és al contenidor`).toBe('official')
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

  /*
   * La regla que protegeix l'estudiant de les preguntes d'actualitat antigues.
   *
   * Les proves de cultura general de Roses reserven la meitat de les preguntes
   * a l'actualitat: «Qui és l'actual ministre/a de Defensa?». Eren certes el
   * dia de l'examen. Presentar-les avui com a vigents seria afirmar com a cert
   * l'estat del món d'una altra data.
   *
   * S'importen amb `dynamic: true` i `reviewBy` igual a la data de l'examen,
   * que ja ha passat, de manera que `isCurrent()` les deixa fora dels
   * quadernets i de la quota d'actualitat. Segueixen consultables com a
   * material històric.
   */
  it('cap pregunta d’examen oficial no pot passar per actualitat vigent', () => {
    const today = new Date().toISOString().slice(0, 10)
    for (const q of questions.filter((x) => x.origin === 'official')) {
      expect(q.tags, `${q.questionId} etiquetada com a actualitat`).not.toContain('actualitat')
      if (q.track === 'cultura-general') {
        expect(q.dynamic, `${q.questionId} de cultura general sense caducitat`).toBe(true)
        expect(isCurrent(q, today), `${q.questionId} encara compta com a vigent`).toBe(false)
      }
    }
  })

  /*
   * L'auditoria visual dels sis quadernets P0 (artifacts/auditoria-visual-p0.md)
   * va trobar una resposta oficial que ja no reflecteix el dret vigent: el
   * tribunal la va publicar amb la qualificació del text de 2019 i la norma es
   * va modificar el 2021. La resposta es conserva; l'avís ha d'arribar a qui
   * estudia.
   */
  it('avisa quan una resposta oficial ha quedat enrere respecte del dret vigent', () => {
    const q = questions.find((x) => x.questionId === 'q-of-roses-2025-interins-cp-036')
    expect(q, 'falta la pregunta auditada').toBeDefined()
    expect(q!.correct, 'la resposta del tribunal no es toca').toBe('b')
    expect(q!.officialExam?.officialAnswer).toBe('b')
    expect(q!.officialExam?.transcriptionNotes, 'sense nota de revisió').toMatch(/2021/)
  })

  /*
   * L'última opció de cada pàgina s'empassava la capçalera de la següent:
   * «d) El 1945. Exp.: 2025/010339 Procés selectiu…». Cinquanta-una de les 189.
   * L'auditoria visual no ho va veure perquè mirava la lletra marcada, no el
   * text; ho va destapar obrir l'app i llegir una pregunta.
   */
  it('cap enunciat ni cap opció arrossega capçaleres del quadernet', () => {
    const boilerplate =
      /Exp\.:|Plaça de Catalunya|Procés selectiu|Primer exercici|Segon exercici|informacio@roses|www\.roses\.cat/
    for (const q of questions) {
      expect(boilerplate.test(q.stem), `${q.questionId}: enunciat amb capçalera`).toBe(false)
      for (const option of q.options) {
        expect(
          boilerplate.test(option.text),
          `${q.questionId} opció ${option.optionId}: «${option.text.slice(0, 70)}»`,
        ).toBe(false)
      }
    }
  })

  it('les preguntes d’examen oficial conserven la resposta del tribunal', () => {
    for (const q of questions.filter((x) => x.origin === 'official')) {
      const meta = q.officialExam!
      if (meta.officialAnswer !== 'anullada') {
        // Canviar en silenci una resposta oficial és la línia que no es creua.
        expect(meta.officialAnswer, `${q.questionId} divergeix del tribunal`).toBe(q.correct)
      }
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
  it('registra els sis exàmens de prioritat P0 i els importa sencers', () => {
    // 2025 en propietat, 2025 interins i 2026 interins, cultura general i
    // coneixements professionals de cadascun.
    const p0 = exams.filter((e) => e.priority === 'P0')
    expect(p0).toHaveLength(6)
    for (const exam of p0) {
      expect(exam.expectedQuestionCount, exam.examId).toBeGreaterThan(0)
      expect(sourceIds.has(exam.sourceId), exam.examId).toBe(true)
      expect(exam.importStatus, exam.examId).toBe('imported')
      // 20 + 1 de reserva a cultura general; 40 + 2 a professionals.
      expect(exam.questionIds.length, exam.examId).toBe(exam.expectedQuestionCount)
    }
  })

  it('els 24 exàmens històrics estan registrats amb la seva font adoptada', () => {
    const p1 = exams.filter((e) => e.priority === 'P1')
    expect(p1).toHaveLength(24)
    for (const exam of p1) {
      expect(sourceIds.has(exam.sourceId), exam.examId).toBe(true)
      expect(exam.heldOn, exam.examId).toBeTruthy()
      expect(exam.url, exam.examId).toMatch(/^https:\/\//)
    }
  })

  it('cada pregunta importada apareix al registre del seu examen', () => {
    const registered = new Set(exams.flatMap((e) => e.questionIds))
    for (const q of questions.filter((x) => x.origin === 'official')) {
      expect(registered.has(q.questionId), `${q.questionId} no consta a cap examen`).toBe(true)
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

  it('la composició declarada suma exactament la prova', () => {
    for (const bp of blueprints) {
      if (!bp.composition || bp.composition.length === 0) continue
      const declared = bp.composition.reduce((sum, slot) => sum + slot.count, 0)
      expect(declared, `${bp.blueprintId}: la composició ha de sumar la prova`).toBe(
        bp.questionCount,
      )
    }
  })

  /*
   * La regla que impedeix que això torni a passar desapercebut.
   *
   * Un plànol només es pot oferir si el banc pot muntar la prova que descriuen
   * les bases. Si no pot, el plànol ho ha de declarar amb el motiu. I si ja pot
   * i encara ho declara, el marcador s'ha quedat enganxat: també falla. Els dos
   * sentits, perquè amagar el dèficit i oblidar-se de treure'l quan s'arregla
   * són el mateix error.
   */
  it('cap plànol pot amagar que el banc no el pot muntar', () => {
    for (const bp of blueprints) {
      const status = examAvailability(questions, bp, TODAY)
      const declaredBlocked = bp.contentStatus === 'blocked-missing-content'

      if (!status.ok) {
        expect(
          declaredBlocked,
          `${bp.blueprintId} no es pot muntar i no ho declara: ${JSON.stringify(status.quotas)}`,
        ).toBe(true)
        expect(bp.contentNote, `${bp.blueprintId} ha de dir per què està bloquejat`).toBeTruthy()
      } else {
        expect(
          declaredBlocked,
          `${bp.blueprintId} ja es pot muntar: treu el marcador de bloqueig`,
        ).toBe(false)
      }
    }
  })

  it('el banc pot omplir els simulacres que no estan bloquejats', () => {
    for (const bp of blueprints) {
      const status = examAvailability(questions, bp, TODAY)
      if (!status.ok) continue
      expect(
        status.missingBody,
        `${bp.blueprintId} necessita ${bp.questionCount} preguntes`,
      ).toBe(0)
    }
  })

  it('avui el simulacre de cultura general està bloquejat per manca d’actualitat', () => {
    // Aquesta versió no té cap pregunta d'actualitat: cap font periodística era
    // accessible. El test documenta l'estat real i cau quan s'arregli, que és
    // exactament quan cal revisar-lo.
    const cg = blueprints.find((b) => b.blueprintId === 'roses-cultura-general')!
    const status = examAvailability(questions, cg, TODAY)
    expect(status.ok).toBe(false)
    expect(status.quotas.find((q) => q.tag === 'actualitat')?.available).toBe(0)
    expect(cg.contentNote).toMatch(/actualitat/i)
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
