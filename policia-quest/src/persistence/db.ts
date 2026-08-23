/**
 * Capa de persistència.
 *
 *  - **IndexedDB** guarda el volum: estats de repàs, sessions, intents de
 *    simulacre, registre de respostes i el progrés agregat.
 *  - **localStorage** només guarda els ajustos (petits) i el punter de versió
 *    del contingut, tal com marca l'arquitectura.
 *
 * Tot passa pel mòdul de migracions en llegir, de manera que una base de dades
 * escrita per una versió antiga de l'app sempre es llegeix bé.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type {
  AnswerRecord,
  ExamAttempt,
  ReviewState,
  Settings,
  StudySession,
  UserProgress,
} from '../domain/types.ts'
import {
  DEFAULT_SETTINGS,
  defaultProgress,
  migrateProgress,
  migrateReviewState,
  migrateSettings,
} from './migrations.ts'

const DB_NAME = 'policia-quest'
/** Puja quan canvia l'estructura dels magatzems d'IndexedDB. */
const DB_VERSION = 1

const SETTINGS_KEY = 'pq.settings'
const CONTENT_VERSION_KEY = 'pq.contentVersion'

interface PQSchema extends DBSchema {
  reviews: { key: string; value: ReviewState }
  sessions: { key: string; value: StudySession; indexes: { byStart: number } }
  attempts: { key: string; value: ExamAttempt; indexes: { byStart: number } }
  answers: { key: number; value: AnswerRecord; indexes: { byTopic: string; byTime: number } }
  progress: { key: string; value: UserProgress }
}

let dbPromise: Promise<IDBPDatabase<PQSchema>> | null = null

export function getDb(): Promise<IDBPDatabase<PQSchema>> {
  dbPromise ??= openDB<PQSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Les creacions són idempotents: només es crea el que encara no hi és.
      if (oldVersion < 1) {
        db.createObjectStore('reviews', { keyPath: 'questionId' })
        const sessions = db.createObjectStore('sessions', { keyPath: 'sessionId' })
        sessions.createIndex('byStart', 'startedAt')
        const attempts = db.createObjectStore('attempts', { keyPath: 'attemptId' })
        attempts.createIndex('byStart', 'startedAt')
        const answers = db.createObjectStore('answers', { autoIncrement: true })
        answers.createIndex('byTopic', 'topicId')
        answers.createIndex('byTime', 'answeredAt')
        db.createObjectStore('progress')
      }
    },
  })
  return dbPromise
}

/** Només per als tests: força una reconnexió neta. */
export function resetDbHandle(): void {
  dbPromise = null
}

/* ---------------------------------------------------------------- */
/* Ajustos (localStorage)                                            */
/* ---------------------------------------------------------------- */

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return migrateSettings(JSON.parse(raw))
  } catch {
    // Un localStorage inaccessible (mode privat, permisos) no pot trencar l'app.
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* sense emmagatzematge: l'app continua funcionant en memòria */
  }
}

export function loadContentVersion(): number | null {
  try {
    const raw = localStorage.getItem(CONTENT_VERSION_KEY)
    return raw === null ? null : Number(raw)
  } catch {
    return null
  }
}

export function saveContentVersion(version: number): void {
  try {
    localStorage.setItem(CONTENT_VERSION_KEY, String(version))
  } catch {
    /* ignorat a propòsit */
  }
}

/* ---------------------------------------------------------------- */
/* Progrés                                                           */
/* ---------------------------------------------------------------- */

export async function loadProgress(): Promise<UserProgress> {
  const db = await getDb()
  const stored = await db.get('progress', 'current')
  return stored ? migrateProgress(stored) : defaultProgress()
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  const db = await getDb()
  await db.put('progress', progress, 'current')
}

/* ---------------------------------------------------------------- */
/* Estats de repàs                                                   */
/* ---------------------------------------------------------------- */

export async function loadReviews(): Promise<Map<string, ReviewState>> {
  const db = await getDb()
  const all = await db.getAll('reviews')
  const map = new Map<string, ReviewState>()
  for (const raw of all) {
    const migrated = migrateReviewState(raw)
    if (migrated) map.set(migrated.questionId, migrated)
  }
  return map
}

export async function saveReviews(states: readonly ReviewState[]): Promise<void> {
  if (states.length === 0) return
  const db = await getDb()
  const tx = db.transaction('reviews', 'readwrite')
  await Promise.all(states.map((s) => tx.store.put(s)))
  await tx.done
}

/* ---------------------------------------------------------------- */
/* Respostes, sessions i intents                                     */
/* ---------------------------------------------------------------- */

export async function appendAnswers(records: readonly AnswerRecord[]): Promise<void> {
  if (records.length === 0) return
  const db = await getDb()
  const tx = db.transaction('answers', 'readwrite')
  await Promise.all(records.map((r) => tx.store.add(r)))
  await tx.done
}

export async function loadAnswers(): Promise<AnswerRecord[]> {
  const db = await getDb()
  return db.getAll('answers')
}

export async function saveSession(session: StudySession): Promise<void> {
  const db = await getDb()
  await db.put('sessions', session)
}

export async function loadSessions(): Promise<StudySession[]> {
  const db = await getDb()
  const all = await db.getAll('sessions')
  return all.sort((a, b) => b.startedAt - a.startedAt)
}

export async function saveAttempt(attempt: ExamAttempt): Promise<void> {
  const db = await getDb()
  await db.put('attempts', attempt)
}

export async function loadAttempts(): Promise<ExamAttempt[]> {
  const db = await getDb()
  const all = await db.getAll('attempts')
  return all.sort((a, b) => b.startedAt - a.startedAt)
}

/** Recupera el simulacre interromput, si n'hi ha cap. */
export async function loadResumableAttempt(): Promise<ExamAttempt | null> {
  const attempts = await loadAttempts()
  return attempts.find((a) => a.status === 'in-progress') ?? null
}

/* ---------------------------------------------------------------- */
/* Restabliment i restauració                                        */
/* ---------------------------------------------------------------- */

export async function clearAllProgress(): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['reviews', 'sessions', 'attempts', 'answers', 'progress'], 'readwrite')
  await Promise.all([
    tx.objectStore('reviews').clear(),
    tx.objectStore('sessions').clear(),
    tx.objectStore('attempts').clear(),
    tx.objectStore('answers').clear(),
    tx.objectStore('progress').clear(),
  ])
  await tx.done
}

/**
 * Restaura una còpia validada. Substitueix el contingut dels magatzems en una
 * sola transacció: o s'aplica tot o no s'aplica res.
 */
export async function restoreBackup(payload: {
  settings: Settings
  progress: UserProgress
  reviews: readonly ReviewState[]
  sessions: readonly StudySession[]
  attempts: readonly ExamAttempt[]
}): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(['reviews', 'sessions', 'attempts', 'progress'], 'readwrite')
  const reviews = tx.objectStore('reviews')
  const sessions = tx.objectStore('sessions')
  const attempts = tx.objectStore('attempts')
  const progress = tx.objectStore('progress')

  await Promise.all([reviews.clear(), sessions.clear(), attempts.clear(), progress.clear()])
  await Promise.all([
    ...payload.reviews.map((r) => reviews.put(r)),
    ...payload.sessions.map((s) => sessions.put(s)),
    ...payload.attempts.map((a) => attempts.put(a)),
    progress.put(migrateProgress(payload.progress), 'current'),
  ])
  await tx.done

  saveSettings(migrateSettings(payload.settings))
}
