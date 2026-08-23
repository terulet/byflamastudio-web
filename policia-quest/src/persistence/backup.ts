/**
 * Còpia de seguretat: exportació i importació validades.
 *
 * El fitxer porta versió de format i suma de comprovació. En importar es
 * valida l'estructura sencera amb l'esquema Zod i es comprova la mida abans
 * de tocar res: un fitxer manipulat o truncat no pot corrompre el progrés.
 *
 * ─── Què inclou i què no ─────────────────────────────────────────────────
 *
 * Inclou tot allò que és **progrés real**: ajustos, XP, ratxa, comptadors
 * diaris, estats de repetició espaiada, sessions i intents de simulacre.
 *
 * NO inclou el registre detallat de respostes (`answers`), que és un log
 * analític que creix sense límit i que només alimenta estadístiques derivades
 * com l'exactitud recent. Incloure'l faria que una còpia de mesos d'ús
 * superés el límit de mida. Després d'una restauració, aquestes estadístiques
 * es reconstrueixen a mesura que es continua estudiant; el progrés que governa
 * què toca repassar i quina és la ratxa es restaura sencer.
 */
import {
  BackupFileSchema,
  type BackupFile,
  type ExamAttempt,
  type ReviewState,
  type Settings,
  type StudySession,
  type UserProgress,
} from '../domain/types.ts'

export const BACKUP_FORMAT_VERSION = 1

/** Mida màxima acceptada en importar (2 MB de JSON és molt més del necessari). */
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024

export interface BackupPayload {
  settings: Settings
  progress: UserProgress
  reviews: ReviewState[]
  sessions: StudySession[]
  attempts: ExamAttempt[]
}

/**
 * Suma de comprovació determinista (FNV-1a de 64 bits en dues meitats de 32).
 * No és criptogràfica: serveix per detectar corrupció i edicions accidentals,
 * no per autenticar. Es documenta així a CONTENT.md.
 */
export function checksum(text: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    h1 ^= c
    h1 = Math.imul(h1, 0x01000193)
    h2 = Math.imul(h2 ^ c, 0x85ebca6b)
  }
  return ((h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0'))
}

/**
 * Serialització canònica: ordena les claus de tots els objectes de manera
 * recursiva.
 *
 * És imprescindible i no una floritura. En exportar, els objectes tenen l'ordre
 * de claus que els ha donat el codi en temps d'execució; en importar, la
 * validació amb Zod els reconstrueix en l'ordre de l'esquema. Si la suma
 * depengués de l'ordre, tota còpia legítima es rebutjaria com a manipulada.
 */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(source).sort()) {
      // Els camps opcionals absents i els presents amb `undefined` han de
      // produir la mateixa suma.
      if (source[key] === undefined) continue
      out[key] = canonical(source[key])
    }
    return out
  }
  return value
}

/** Serialitza el payload de manera estable perquè la suma sigui reproduïble. */
function stablePayload(payload: BackupPayload): string {
  return JSON.stringify(
    canonical({
      settings: payload.settings,
      progress: payload.progress,
      reviews: [...payload.reviews].sort((a, b) => a.questionId.localeCompare(b.questionId)),
      sessions: [...payload.sessions].sort((a, b) => a.sessionId.localeCompare(b.sessionId)),
      attempts: [...payload.attempts].sort((a, b) => a.attemptId.localeCompare(b.attemptId)),
    }),
  )
}

export function createBackup(payload: BackupPayload, now: number): BackupFile {
  return {
    format: 'policia-quest-backup',
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: now,
    checksum: checksum(stablePayload(payload)),
    payload: {
      settings: payload.settings,
      progress: payload.progress,
      reviews: payload.reviews,
      sessions: payload.sessions,
      attempts: payload.attempts,
    },
  }
}

export type ImportResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; error: string }

/**
 * Valida un fitxer de còpia. Mai llança: retorna un resultat explicat perquè
 * la interfície pugui dir exactament què falla.
 */
export function parseBackup(text: string): ImportResult {
  if (text.length > MAX_BACKUP_BYTES) {
    return { ok: false, error: 'fitxer-massa-gran' }
  }

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'json-no-valid' }
  }

  const parsed = BackupFileSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: 'estructura-no-valida' }
  }

  const backup = parsed.data
  if (backup.formatVersion > BACKUP_FORMAT_VERSION) {
    return { ok: false, error: 'versio-mes-nova' }
  }

  const expected = checksum(stablePayload(backup.payload))
  if (expected !== backup.checksum) {
    return { ok: false, error: 'suma-no-coincideix' }
  }

  return { ok: true, backup }
}

/** Nom de fitxer suggerit per a l'exportació. */
export function backupFileName(now: number): string {
  const d = new Date(now)
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `policia-quest-copia-${stamp}.json`
}
