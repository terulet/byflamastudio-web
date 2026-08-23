import { describe, expect, it } from 'vitest'
import {
  BACKUP_FORMAT_VERSION,
  MAX_BACKUP_BYTES,
  checksum,
  createBackup,
  parseBackup,
  type BackupPayload,
} from '../../src/persistence/backup.ts'
import {
  DEFAULT_SETTINGS,
  PROGRESS_VERSION,
  defaultProgress,
  migrateExamAttempt,
  migrateProgress,
  migrateReviewState,
  migrateSettings,
} from '../../src/persistence/migrations.ts'
import { initialReviewState } from '../../src/engines/srs.ts'

function samplePayload(): BackupPayload {
  return {
    settings: { ...DEFAULT_SETTINGS, onboarded: true, dailyGoal: 20, explanationLang: 'es' },
    progress: { ...defaultProgress(), xp: 420, streakDays: 7, totalAnswered: 88, totalCorrect: 61 },
    reviews: [
      { ...initialReviewState('q1'), reps: 3, intervalStep: 2, dueDay: 20_100 },
      { ...initialReviewState('q2'), reps: 1, lapses: 1 },
    ],
    sessions: [
      {
        sessionId: 's1', mode: 'missio-del-dia', topicIds: [], questionIds: ['q1', 'q2'],
        answers: [], startedAt: 1_700_000_000_000, xpEarned: 20,
      },
    ],
    attempts: [],
  }
}

describe('migració de progrés', () => {
  it('crea un progrés per defecte si no hi ha res guardat', () => {
    const p = migrateProgress(null)
    expect(p.progressVersion).toBe(PROGRESS_VERSION)
    expect(p.xp).toBe(0)
    expect(p.dailyCounts).toEqual({})
  })

  it('conserva el progrés existent en pujar de versió', () => {
    const v1 = { progressVersion: 1, xp: 300, streakDays: 5, totalAnswered: 40, totalCorrect: 30 }
    const migrated = migrateProgress(v1)
    expect(migrated.xp).toBe(300)
    expect(migrated.streakDays).toBe(5)
    expect(migrated.totalAnswered).toBe(40)
    expect(migrated.progressVersion).toBe(PROGRESS_VERSION)
  })

  it('v1 → v2 deriva la ratxa més llarga de la ratxa actual', () => {
    const migrated = migrateProgress({ progressVersion: 1, streakDays: 9 })
    expect(migrated.longestStreak).toBe(9)
  })

  it('és idempotent', () => {
    const once = migrateProgress({ progressVersion: 1, xp: 120, streakDays: 4 })
    const twice = migrateProgress(once)
    expect(twice).toEqual(once)
  })

  it('descarta valors corruptes sense perdre la resta', () => {
    const migrated = migrateProgress({
      progressVersion: 2, xp: 'molt', streakDays: 3,
      dailyCounts: { '20000': 5 }, achievements: ['constancia', 42],
    })
    expect(migrated.xp).toBe(0)
    expect(migrated.streakDays).toBe(3)
    expect(migrated.dailyCounts).toEqual({ '20000': 5 })
    expect(migrated.achievements).toEqual(['constancia'])
  })
})

describe('migració d’ajustos', () => {
  it('aplica els valors per defecte quan no hi ha res', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS)
  })

  it('conserva els valors vàlids i rebutja els invàlids', () => {
    const s = migrateSettings({
      explanationLang: 'es', theme: 'light', dailyGoal: 20,
      examDate: '2026-11-15', sound: true, haptics: false,
      municipality: 'roses', onboarded: true,
    })
    expect(s.explanationLang).toBe('es')
    expect(s.theme).toBe('light')
    expect(s.dailyGoal).toBe(20)
    expect(s.examDate).toBe('2026-11-15')

    // Els valors invàlids cauen al valor per defecte, sigui quin sigui.
    const bad = migrateSettings({ theme: 'neon', dailyGoal: 7, examDate: 'demà' })
    expect(bad.theme).toBe(DEFAULT_SETTINGS.theme)
    expect(bad.dailyGoal).toBe(DEFAULT_SETTINGS.dailyGoal)
    expect(bad.examDate).toBeNull()
  })
})

describe('migració d’estats de repàs', () => {
  it('rebutja registres sense identificador', () => {
    expect(migrateReviewState({ reps: 3 })).toBeNull()
    expect(migrateReviewState(null)).toBeNull()
  })

  it('normalitza els valors fora de rang', () => {
    const s = migrateReviewState({
      questionId: 'q1', intervalStep: -4, lapses: -1, reps: 2,
      streak: 3, phase: 'inventada', lastOutcome: 'boh',
    })
    expect(s).not.toBeNull()
    expect(s!.intervalStep).toBe(0)
    expect(s!.lapses).toBe(0)
    expect(s!.phase).toBe('new')
    expect(s!.lastOutcome).toBeUndefined()
    expect(s!.reps).toBe(2)
  })
})

describe('migració d’intents de simulacre', () => {
  it('rebutja registres sense identificador o sense plànol', () => {
    expect(migrateExamAttempt({ blueprintIds: ['x'], questionIds: [] })).toBeNull()
    expect(migrateExamAttempt({ attemptId: 'a1', questionIds: [] })).toBeNull()
    expect(migrateExamAttempt(null)).toBeNull()
  })

  it('deriva una secció única per als intents anteriors al simulacre complet', () => {
    // Format antic: sense sections, sense currentSection i sense puntuacions
    // per prova. Un simulacre a mitges d'abans s'ha de poder reprendre igual.
    const legacy = {
      attemptId: 'a1',
      blueprintIds: ['roses-cultura-general'],
      questionIds: ['q1', 'q2', 'q3'],
      responses: ['a', null, 'c'],
      flagged: [false, true, false],
      startedAt: 1_700_000_000_000,
      durationMs: 1_200_000,
      elapsedMsAtPause: 300_000,
      status: 'in-progress',
      currentIndex: 1,
    }
    const migrated = migrateExamAttempt(legacy)
    expect(migrated).not.toBeNull()
    expect(migrated!.sections).toHaveLength(1)
    expect(migrated!.sections[0]).toMatchObject({
      blueprintId: 'roses-cultura-general',
      count: 3,
      durationMs: 1_200_000,
      elapsedMs: 300_000,
      finished: false,
    })
    expect(migrated!.currentSection).toBe(0)
    expect(migrated!.responses).toEqual(['a', null, 'c'])
    expect(migrated!.currentIndex).toBe(1)
  })

  it('conserva les seccions d’un intent de simulacre complet', () => {
    const attempt = {
      attemptId: 'a2',
      blueprintIds: ['roses-cultura-general', 'roses-coneixements-professionals'],
      compositionId: 'roses-simulacre-complet',
      questionIds: ['q1', 'q2'],
      responses: [null, 'b'],
      flagged: [false, false],
      startedAt: 1,
      durationMs: 4_800_000,
      elapsedMsAtPause: 60_000,
      sections: [
        { blueprintId: 'roses-cultura-general', count: 1, durationMs: 1_200_000, elapsedMs: 60_000, finished: true },
        { blueprintId: 'roses-coneixements-professionals', count: 1, durationMs: 3_600_000, elapsedMs: 0, finished: false },
      ],
      currentSection: 1,
      status: 'in-progress',
      sectionScoresMilli: [],
      currentIndex: 1,
    }
    const migrated = migrateExamAttempt(attempt)
    expect(migrated!.sections).toHaveLength(2)
    expect(migrated!.currentSection).toBe(1)
    expect(migrated!.compositionId).toBe('roses-simulacre-complet')
    expect(migrated!.sections[0]!.finished).toBe(true)
  })

  it('normalitza respostes i marques al nombre de preguntes', () => {
    const migrated = migrateExamAttempt({
      attemptId: 'a3',
      blueprintIds: ['roses-cultura-general'],
      questionIds: ['q1', 'q2', 'q3'],
      responses: ['z', 'b'],
      flagged: [true],
      startedAt: 1,
      durationMs: 1_000,
      status: 'in-progress',
    })
    expect(migrated!.responses).toEqual([null, 'b', null])
    expect(migrated!.flagged).toEqual([true, false, false])
  })

  it('és idempotent', () => {
    const once = migrateExamAttempt({
      attemptId: 'a4',
      blueprintIds: ['roses-cultura-general'],
      questionIds: ['q1'],
      responses: ['a'],
      flagged: [false],
      startedAt: 5,
      durationMs: 1_000,
      status: 'finished',
      scoreMilli: 1_000,
    })
    expect(migrateExamAttempt(once)).toEqual(once)
  })

  it('la secció d’un intent acabat queda tancada', () => {
    const migrated = migrateExamAttempt({
      attemptId: 'a5',
      blueprintIds: ['roses-cultura-general'],
      questionIds: ['q1'],
      responses: ['a'],
      flagged: [false],
      startedAt: 5,
      durationMs: 1_000,
      status: 'finished',
    })
    expect(migrated!.sections[0]!.finished).toBe(true)
  })
})

describe('exportació i importació', () => {
  it('exporta amb versió i suma de comprovació', () => {
    const backup = createBackup(samplePayload(), 1_700_000_000_000)
    expect(backup.format).toBe('policia-quest-backup')
    expect(backup.formatVersion).toBe(BACKUP_FORMAT_VERSION)
    expect(backup.checksum).toMatch(/^[a-f0-9]{16}$/)
  })

  it('fa un cicle complet sense perdre dades', () => {
    const payload = samplePayload()
    const text = JSON.stringify(createBackup(payload, 1_700_000_000_000))
    const result = parseBackup(text)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.backup.payload.progress.xp).toBe(420)
    expect(result.backup.payload.reviews).toHaveLength(2)
    expect(result.backup.payload.settings.explanationLang).toBe('es')
  })

  it('la suma no depèn de l’ordre dels registres', () => {
    const payload = samplePayload()
    const reversed: BackupPayload = { ...payload, reviews: [...payload.reviews].reverse() }
    expect(createBackup(payload, 1).checksum).toBe(createBackup(reversed, 1).checksum)
  })

  it('la suma no depèn de l’ordre de les claus dels objectes', () => {
    // Zod reconstrueix els objectes en l'ordre de l'esquema en validar-los.
    // Si la suma depengués de l'ordre de claus, tota còpia legítima es
    // rebutjaria com a manipulada en importar-la.
    const payload = samplePayload()
    const reordered: BackupPayload = {
      ...payload,
      reviews: payload.reviews.map((review) => {
        const flipped: Record<string, unknown> = {}
        for (const key of Object.keys(review).reverse()) {
          flipped[key] = (review as unknown as Record<string, unknown>)[key]
        }
        return flipped as unknown as (typeof payload.reviews)[number]
      }),
    }
    expect(createBackup(reordered, 1).checksum).toBe(createBackup(payload, 1).checksum)
  })

  it('un camp opcional absent i un camp opcional undefined donen la mateixa suma', () => {
    const payload = samplePayload()
    const withUndefined: BackupPayload = {
      ...payload,
      reviews: payload.reviews.map((review) => ({ ...review, lastAnsweredDay: undefined })),
    }
    expect(createBackup(withUndefined, 1).checksum).toBe(createBackup(payload, 1).checksum)
  })

  it('rebutja un JSON no vàlid', () => {
    const result = parseBackup('{no és json')
    expect(result).toEqual({ ok: false, error: 'json-no-valid' })
  })

  it('rebutja una estructura que no compleix l’esquema', () => {
    const result = parseBackup(JSON.stringify({ format: 'una-altra-cosa' }))
    expect(result).toEqual({ ok: false, error: 'estructura-no-valida' })
  })

  it('rebutja un fitxer manipulat', () => {
    const backup = createBackup(samplePayload(), 1_700_000_000_000)
    backup.payload.progress.xp = 999_999
    const result = parseBackup(JSON.stringify(backup))
    expect(result).toEqual({ ok: false, error: 'suma-no-coincideix' })
  })

  it('rebutja una còpia d’una versió futura', () => {
    const backup = createBackup(samplePayload(), 1)
    const bumped = { ...backup, formatVersion: BACKUP_FORMAT_VERSION + 1 }
    // Cal recalcular la suma perquè el fallo sigui el de versió i no el de suma.
    const text = JSON.stringify(bumped)
    expect(parseBackup(text)).toEqual({ ok: false, error: 'versio-mes-nova' })
  })

  it('rebutja un fitxer massa gran abans de processar-lo', () => {
    const huge = 'x'.repeat(MAX_BACKUP_BYTES + 1)
    expect(parseBackup(huge)).toEqual({ ok: false, error: 'fitxer-massa-gran' })
  })

  it('la suma canvia si canvia el contingut', () => {
    expect(checksum('a')).not.toBe(checksum('b'))
    expect(checksum('hola')).toBe(checksum('hola'))
  })
})
