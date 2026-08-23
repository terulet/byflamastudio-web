/**
 * Tipus del domini. Deriven sempre dels esquemes Zod de content/schemas per
 * evitar duplicar definicions a mà: si l'esquema canvia, el tipus també.
 */
export type {
  Bilingual,
  Source,
  SourceManifest,
  SourceReference,
  SyllabusTopic,
  Syllabus,
  BlockId,
  Lesson,
  LessonCard,
  Question,
  QuestionOption,
  OfficialExamMeta,
  OfficialExam,
  ExamBlueprint,
  ExamComposition,
  ExamSection,
  ScoringRules,
  CurrentAffairsPack,
  ContentVersion,
  MunicipalityPack,
  ReviewState,
  AnswerRecord,
  StudyMode,
  StudySession,
  ExamAttempt,
  Settings,
  UserProgress,
  BackupFile,
} from '../../content/schemas/index.ts'

export {
  Source as SourceSchema,
  SourceManifest as SourceManifestSchema,
  Syllabus as SyllabusSchema,
  Lesson as LessonSchema,
  Question as QuestionSchema,
  OfficialExam as OfficialExamSchema,
  ExamBlueprint as ExamBlueprintSchema,
  CurrentAffairsPack as CurrentAffairsPackSchema,
  MunicipalityPack as MunicipalityPackSchema,
  Settings as SettingsSchema,
  UserProgress as UserProgressSchema,
  ReviewState as ReviewStateSchema,
  StudySession as StudySessionSchema,
  ExamAttempt as ExamAttemptSchema,
  BackupFile as BackupFileSchema,
} from '../../content/schemas/index.ts'

/** Llengua de les explicacions i de la interfície. */
export type Lang = 'ca' | 'es'

/** Identificador d'opció de resposta. */
export type OptionId = 'a' | 'b' | 'c' | 'd'

/** Com ha respost la persona una pregunta en mode estudi. */
export type Outcome = 'correct-sure' | 'correct-unsure' | 'wrong' | 'dont-know'

/** Nivell de seguretat declarat abans de corregir. */
export type Confidence = 'unsure' | 'sure'
