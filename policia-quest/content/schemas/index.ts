/**
 * Policia Quest — esquemes de contingut (font única de veritat).
 *
 * Aquests esquemes es fan servir a tres llocs:
 *  1. Els scripts de la Content Factory (`scripts/*.ts`) en validar contingut.
 *  2. Els tests de contingut (`tests/content/*.test.ts`).
 *  3. L'aplicació, que en deriva els tipus TypeScript (no es dupliquen mai a mà).
 *
 * Regla d'or: cap contingut jurídic pot entrar al banc actiu sense una
 * referència resoluble a una font registrada. Vegeu CONTENT.md.
 */
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

/** Data ISO curta (YYYY-MM-DD). */
export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'ha de ser una data YYYY-MM-DD')

export const Slug = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'ha de ser un identificador en minúscules amb guions')

/** Text bilingüe: el català és obligatori, el castellà és opcional. */
export const Bilingual = z.object({
  ca: z.string().min(1),
  es: z.string().min(1).optional(),
})
export type Bilingual = z.infer<typeof Bilingual>

/* ------------------------------------------------------------------ */
/* Source — registre de fonts oficials                                 */
/* ------------------------------------------------------------------ */

export const SourceScope = z.enum(['estatal', 'catalunya', 'roses', 'internacional', 'ue'])
export const SourceKind = z.enum([
  'constitucio',
  'llei',
  'llei-organica',
  'reial-decret',
  'reial-decret-legislatiu',
  'decret',
  'ordenanca',
  'bases-convocatoria',
  'examen-oficial',
  'codi-etic',
  'tractat',
  'pagina-institucional',
  'altre',
])

/**
 * Estat de descàrrega de la còpia local.
 *  - `downloaded`      : hi ha còpia a sources/cache/ i el SHA-256 quadra.
 *  - `pending-download`: encara no s'ha pogut baixar (vegeu `fetchNote`).
 *  - `not-required`    : la font es cita però no cal còpia local.
 */
export const FetchStatus = z.enum(['downloaded', 'pending-download', 'not-required'])

/** Vigència de la font en si mateixa. */
export const SourceStatus = z.enum(['vigent', 'historica', 'substituida', 'pendent-revisar'])

export const Source = z.object({
  sourceId: Slug,
  title: z.string().min(3),
  issuer: z.string().min(2),
  url: z.string().url(),
  kind: SourceKind,
  scope: SourceScope,
  /** Data de publicació oficial del document. */
  publishedAt: IsoDate.optional(),
  /** Data en què l'equip va consultar la font per última vegada. */
  consultedAt: IsoDate,
  status: SourceStatus,
  fetchStatus: FetchStatus,
  /** SHA-256 de la còpia local, si existeix. */
  sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  /** Nom del fitxer dins sources/cache/. */
  cacheFile: z.string().optional(),
  /** Per què no s'ha pogut baixar, o notes de consolidació/versió. */
  fetchNote: z.string().optional(),
  notes: z.string().optional(),
})
export type Source = z.infer<typeof Source>

export const SourceManifest = z.object({
  manifestVersion: z.number().int().positive(),
  generatedAt: IsoDate,
  /** Notes globals: entorn de xarxa, bloquejos, etc. */
  environmentNotes: z.array(z.string()).default([]),
  sources: z.array(Source).min(1),
})
export type SourceManifest = z.infer<typeof SourceManifest>

/* ------------------------------------------------------------------ */
/* SourceReference — traçabilitat de lliçons i preguntes               */
/* ------------------------------------------------------------------ */

/**
 * Estat de revisió d'una referència concreta.
 *  - `verified`: contrastada contra la còpia local del text consolidat.
 *  - `pending-source-verification`: redactada a partir de la font citada,
 *     però encara sense contrast automàtic contra la còpia oficial.
 *  - `outdated`: se sap que la redacció ha canviat.
 */
export const ReviewStatus = z.enum(['verified', 'pending-source-verification', 'outdated'])

export const SourceReference = z.object({
  sourceId: Slug,
  /** Article, apartat, secció o pàgina exacta. */
  locator: z.string().min(1),
  /** Data a partir de la qual se sap vigent la redacció citada. */
  validAt: IsoDate,
  reviewStatus: ReviewStatus,
  note: z.string().optional(),
})
export type SourceReference = z.infer<typeof SourceReference>

/* ------------------------------------------------------------------ */
/* SyllabusTopic — els 40 temes                                        */
/* ------------------------------------------------------------------ */

export const BlockId = z.enum([
  'institucions',
  'seguretat-i-penal',
  'roses-transit-convivencia',
  'actuacio-i-proteccio',
])
export type BlockId = z.infer<typeof BlockId>

export const SyllabusTopic = z.object({
  topicId: Slug,
  /** Numeració canònica de la convocatòria 2026 (1..40). */
  number: z.number().int().min(1).max(40),
  /** Numeració equivalent a la convocatòria 2025, quan difereix. */
  number2025: z.number().int().min(1).max(40),
  block: BlockId,
  title: Bilingual,
  /** Descripció del contingut oficial del tema. */
  scope: Bilingual,
  /** Fonts normatives principals del tema. */
  primarySourceIds: z.array(Slug).min(1),
  /** Prova on sol aparèixer. */
  examTrack: z.enum(['coneixements-professionals', 'cultura-general', 'ambdues']),
})
export type SyllabusTopic = z.infer<typeof SyllabusTopic>

export const Syllabus = z.object({
  municipality: Slug,
  callId: z.string().min(3),
  callTitle: Bilingual,
  callSourceId: Slug,
  /** Convocatòria de contrast (places en propietat 2025). */
  contrastSourceId: Slug.optional(),
  topics: z.array(SyllabusTopic).length(40),
})
export type Syllabus = z.infer<typeof Syllabus>

/* ------------------------------------------------------------------ */
/* Lesson — microlliçons                                               */
/* ------------------------------------------------------------------ */

/** Un bloc de contingut dins d'una lliçó. Res de murs de text. */
export const LessonCard = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('idea'), title: Bilingual, body: Bilingual }),
  z.object({ kind: z.literal('explanation'), title: Bilingual, body: Bilingual }),
  z.object({ kind: z.literal('example'), title: Bilingual, body: Bilingual }),
  z.object({ kind: z.literal('pitfall'), title: Bilingual, body: Bilingual }),
  z.object({
    kind: z.literal('compare'),
    title: Bilingual,
    rows: z
      .array(z.object({ label: Bilingual, left: Bilingual, right: Bilingual }))
      .min(1),
    leftHeader: Bilingual,
    rightHeader: Bilingual,
  }),
  z.object({
    kind: z.literal('checkpoint'),
    title: Bilingual,
    prompt: Bilingual,
    answer: Bilingual,
  }),
])
export type LessonCard = z.infer<typeof LessonCard>

export const Lesson = z.object({
  lessonId: Slug,
  topicId: Slug,
  title: Bilingual,
  /** Minuts estimats de lectura activa (3–7 segons el model pedagògic). */
  minutes: z.number().int().min(2).max(9),
  cards: z.array(LessonCard).min(4),
  references: z.array(SourceReference).min(1),
  updatedAt: IsoDate,
})
export type Lesson = z.infer<typeof Lesson>

/* ------------------------------------------------------------------ */
/* Question                                                            */
/* ------------------------------------------------------------------ */

export const QuestionOption = z.object({
  optionId: z.enum(['a', 'b', 'c', 'd']),
  text: z.string().min(1),
  /** Per què aquesta alternativa falla (només per a les incorrectes). */
  whyWrong: z.string().optional(),
})
export type QuestionOption = z.infer<typeof QuestionOption>

/**
 * Origen de la pregunta.
 *  - `authored` : redactada per l'equip a partir de la norma citada.
 *  - `official` : transcrita literalment d'un examen oficial publicat.
 */
export const QuestionOrigin = z.enum(['authored', 'official'])

/**
 * Estat de publicació.
 *  - `active`    : entra a entrenaments i simulacres actuals.
 *  - `draft`     : no es mostra mai a l'usuari.
 *  - `historical`: només visible dins el seu examen oficial històric.
 *  - `archived`  : retirada (canvi normatiu o actualitat caducada).
 */
export const QuestionStatus = z.enum(['active', 'draft', 'historical', 'archived'])

export const QuestionTrack = z.enum(['cultura-general', 'coneixements-professionals'])

export const OfficialExamMeta = z.object({
  examId: Slug,
  year: z.number().int().min(2000).max(2100),
  placeType: z.enum(['propietat', 'interina']),
  testType: QuestionTrack,
  /** Número que la pregunta tenia al quadernet original. */
  originalNumber: z.number().int().positive(),
  /** Resposta publicada pel tribunal, tal com es va publicar. */
  officialAnswer: z.enum(['a', 'b', 'c', 'd', 'anullada']),
  /** Pregunta de reserva del quadernet. */
  reserve: z.boolean().default(false),
  /** Correccions tècniques d'extracció aplicades a la transcripció. */
  transcriptionNotes: z.string().optional(),
})
export type OfficialExamMeta = z.infer<typeof OfficialExamMeta>

export const Question = z
  .object({
    questionId: Slug,
    topicId: Slug,
    track: QuestionTrack,
    origin: QuestionOrigin,
    status: QuestionStatus,
    difficulty: z.enum(['facil', 'mitjana', 'dificil']),
    /** Enunciat. Sempre en català: és la llengua de l'examen. */
    stem: z.string().min(8),
    options: z.array(QuestionOption).length(4),
    correct: z.enum(['a', 'b', 'c', 'd']),
    /** Correcció raonada, no un simple "correcte/incorrecte". */
    explanation: Bilingual,
    references: z.array(SourceReference),
    /** Contingut que caduca: càrrecs, xifres, actualitat. */
    dynamic: z.boolean().default(false),
    /** Obligatori si `dynamic`. */
    reviewBy: IsoDate.optional(),
    officialExam: OfficialExamMeta.optional(),
    tags: z.array(Slug).default([]),
    /** Hash normalitzat de l'enunciat, per a deduplicació. */
    dedupeHash: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    if (q.dynamic && !q.reviewBy) {
      ctx.addIssue({
        code: 'custom',
        message: `la pregunta dinàmica ${q.questionId} necessita reviewBy`,
        path: ['reviewBy'],
      })
    }
    if (q.origin === 'official' && !q.officialExam) {
      ctx.addIssue({
        code: 'custom',
        message: `la pregunta oficial ${q.questionId} ha de conservar les metadades d'examen`,
        path: ['officialExam'],
      })
    }
    if (q.status === 'active' && q.references.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: `la pregunta activa ${q.questionId} no té cap referència`,
        path: ['references'],
      })
    }
    const correctOption = q.options.find((o) => o.optionId === q.correct)
    if (!correctOption) {
      ctx.addIssue({
        code: 'custom',
        message: `la pregunta ${q.questionId} no té l'opció correcta entre les opcions`,
        path: ['correct'],
      })
    }
    // Una resposta oficial no es pot canviar en silenci.
    if (q.officialExam && q.officialExam.officialAnswer !== 'anullada') {
      if (q.officialExam.officialAnswer !== q.correct && !q.officialExam.transcriptionNotes) {
        ctx.addIssue({
          code: 'custom',
          message:
            `la pregunta ${q.questionId} divergeix de la resposta oficial sense justificació documentada`,
          path: ['officialExam', 'officialAnswer'],
        })
      }
    }
  })
export type Question = z.infer<typeof Question>

/* ------------------------------------------------------------------ */
/* OfficialExam — quadernets publicats pel tribunal                    */
/* ------------------------------------------------------------------ */

/** Regles de puntuació en mil·lipunts, per evitar coma flotant. */
export const ScoringRules = z.object({
  /** Punts (×1000) per encert. */
  correctMilli: z.number().int(),
  /** Penalització (×1000) per error, en positiu. */
  wrongMilli: z.number().int().nonnegative(),
  /** Punts (×1000) per pregunta en blanc. */
  blankMilli: z.number().int(),
  /** Puntuació màxima teòrica (×1000) a què s'escala el resultat. */
  maxScoreMilli: z.number().int().positive(),
  /** Mínim per aprovar (×1000). */
  passMarkMilli: z.number().int().positive(),
})
export type ScoringRules = z.infer<typeof ScoringRules>

export const ExamBlueprint = z.object({
  blueprintId: Slug,
  title: Bilingual,
  track: QuestionTrack,
  questionCount: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  reserveCount: z.number().int().nonnegative(),
  scoring: ScoringRules,
  /** Composició per categoria, si la convocatòria la fixa. */
  composition: z
    .array(z.object({ label: Bilingual, tag: Slug, count: z.number().int().positive() }))
    .optional(),
  sourceId: Slug,
})
export type ExamBlueprint = z.infer<typeof ExamBlueprint>

/**
 * Un examen oficial concret. `importStatus` diu si el quadernet s'ha pogut
 * transcriure; mai s'inventa el contingut d'un examen no accessible.
 */
export const OfficialExam = z.object({
  examId: Slug,
  municipality: Slug,
  year: z.number().int().min(2000).max(2100),
  placeType: z.enum(['propietat', 'interina']),
  testType: QuestionTrack,
  heldOn: IsoDate.optional(),
  url: z.string().url(),
  sourceId: Slug,
  priority: z.enum(['P0', 'P1']),
  importStatus: z.enum(['imported', 'pending-source', 'partial']),
  /** Preguntes transcrites (buit si `pending-source`). */
  questionIds: z.array(Slug).default([]),
  expectedQuestionCount: z.number().int().positive().optional(),
  note: z.string().optional(),
})
export type OfficialExam = z.infer<typeof OfficialExam>

/* ------------------------------------------------------------------ */
/* CurrentAffairsPack — actualitat versionada                          */
/* ------------------------------------------------------------------ */

export const CurrentAffairsPack = z.object({
  packId: Slug,
  createdAt: IsoDate,
  coversFrom: IsoDate,
  coversTo: IsoDate,
  /** A partir d'aquesta data les preguntes deixen d'entrar a simulacres. */
  expiresAt: IsoDate,
  scope: z.array(z.enum(['roses', 'alt-emporda', 'girona', 'catalunya', 'espanya', 'ue', 'internacional'])),
  status: z.enum(['active', 'archived']),
  questionIds: z.array(Slug).default([]),
  note: z.string().optional(),
})
export type CurrentAffairsPack = z.infer<typeof CurrentAffairsPack>

/* ------------------------------------------------------------------ */
/* MunicipalityPack — unitat distribuïble                              */
/* ------------------------------------------------------------------ */

export const ContentVersion = z.object({
  /** Versió del format de contingut. Puja quan canvia l'esquema. */
  schemaVersion: z.number().int().positive(),
  /** Versió del paquet de contingut. Puja a cada publicació. */
  packVersion: z.number().int().positive(),
  builtAt: IsoDate,
})
export type ContentVersion = z.infer<typeof ContentVersion>

export const MunicipalityPack = z.object({
  municipality: Slug,
  name: Bilingual,
  subtitle: Bilingual,
  version: ContentVersion,
  syllabus: Syllabus,
  lessons: z.array(Lesson),
  questions: z.array(Question),
  exams: z.array(OfficialExam),
  blueprints: z.array(ExamBlueprint).min(1),
  currentAffairs: z.array(CurrentAffairsPack),
  sources: z.array(Source),
})
export type MunicipalityPack = z.infer<typeof MunicipalityPack>

/* ------------------------------------------------------------------ */
/* Estat de l'usuari (persistit al dispositiu)                         */
/* ------------------------------------------------------------------ */

export const ReviewPhase = z.enum(['new', 'learning', 'review', 'mastered'])

export const ReviewState = z.object({
  questionId: Slug,
  phase: ReviewPhase,
  /** Índex dins l'escala d'intervals (1,3,7,14,30,60). */
  intervalStep: z.number().int().min(0),
  /** Dia (epoch days) del proper repàs. */
  dueDay: z.number().int(),
  lapses: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  /** Ratxa d'encerts consecutius. */
  streak: z.number().int().nonnegative(),
  lastAnsweredDay: z.number().int().optional(),
  lastOutcome: z.enum(['correct-sure', 'correct-unsure', 'wrong', 'dont-know']).optional(),
  /** Prioritat manual: l'usuari ha demanat "Repassar després". */
  flagged: z.boolean().default(false),
})
export type ReviewState = z.infer<typeof ReviewState>

export const AnswerRecord = z.object({
  questionId: Slug,
  topicId: Slug,
  /** null = en blanc / no contestada. */
  chosen: z.enum(['a', 'b', 'c', 'd']).nullable(),
  correct: z.boolean(),
  dontKnow: z.boolean().default(false),
  confidence: z.enum(['unsure', 'sure']).nullable(),
  msSpent: z.number().int().nonnegative(),
  answeredAt: z.number().int(),
})
export type AnswerRecord = z.infer<typeof AnswerRecord>

export const StudyMode = z.enum([
  'no-tinc-ganes',
  'sessio-expres',
  'missio-del-dia',
  'patrulla',
  'per-tema',
  'errors',
  'repassos',
  'preguntes-noves',
])
export type StudyMode = z.infer<typeof StudyMode>

export const StudySession = z.object({
  sessionId: z.string().min(1),
  mode: StudyMode,
  topicIds: z.array(Slug).default([]),
  questionIds: z.array(Slug),
  answers: z.array(AnswerRecord).default([]),
  startedAt: z.number().int(),
  finishedAt: z.number().int().optional(),
  xpEarned: z.number().int().nonnegative().default(0),
})
export type StudySession = z.infer<typeof StudySession>

export const ExamAttempt = z.object({
  attemptId: z.string().min(1),
  blueprintIds: z.array(Slug).min(1),
  /** Examen oficial històric reproduït, si escau. */
  officialExamId: Slug.optional(),
  questionIds: z.array(Slug),
  /** Respostes per índex de pregunta; null = en blanc. */
  responses: z.array(z.enum(['a', 'b', 'c', 'd']).nullable()),
  flagged: z.array(z.boolean()),
  startedAt: z.number().int(),
  /** Temps límit en ms des de `startedAt`. */
  durationMs: z.number().int().positive(),
  /** Ms consumits abans de l'última pausa (per reprendre). */
  elapsedMsAtPause: z.number().int().nonnegative().default(0),
  status: z.enum(['in-progress', 'finished', 'abandoned']),
  finishedAt: z.number().int().optional(),
  /** Resultat en mil·lipunts, calculat en finalitzar. */
  scoreMilli: z.number().int().optional(),
  currentIndex: z.number().int().nonnegative().default(0),
})
export type ExamAttempt = z.infer<typeof ExamAttempt>

export const Settings = z.object({
  /** Llengua de les explicacions i la interfície. Les preguntes són en català. */
  explanationLang: z.enum(['ca', 'es']),
  theme: z.enum(['dark', 'light', 'system']),
  dailyGoal: z.union([z.literal(5), z.literal(10), z.literal(20)]),
  examDate: IsoDate.nullable(),
  sound: z.boolean(),
  haptics: z.boolean(),
  reducedMotion: z.boolean(),
  municipality: Slug,
  onboarded: z.boolean(),
})
export type Settings = z.infer<typeof Settings>

export const UserProgress = z.object({
  progressVersion: z.number().int().positive(),
  xp: z.number().int().nonnegative(),
  /** Ratxa actual en dies. */
  streakDays: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  /** Últim dia (epoch days) en què es va assolir l'objectiu diari. */
  lastGoalDay: z.number().int().nullable(),
  /** Preguntes respostes avui, per dia epoch. */
  dailyCounts: z.record(z.string(), z.number().int().nonnegative()).default({}),
  totalAnswered: z.number().int().nonnegative(),
  totalCorrect: z.number().int().nonnegative(),
  totalStudyMs: z.number().int().nonnegative(),
  achievements: z.array(Slug).default([]),
})
export type UserProgress = z.infer<typeof UserProgress>

/** Fitxer de còpia de seguretat exportable. */
export const BackupFile = z.object({
  format: z.literal('policia-quest-backup'),
  formatVersion: z.number().int().positive(),
  exportedAt: z.number().int(),
  checksum: z.string().min(8),
  payload: z.object({
    settings: Settings,
    progress: UserProgress,
    reviews: z.array(ReviewState),
    sessions: z.array(StudySession),
    attempts: z.array(ExamAttempt),
  }),
})
export type BackupFile = z.infer<typeof BackupFile>
