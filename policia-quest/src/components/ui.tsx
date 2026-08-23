/** Peces visuals compartides. */
import type { ReactNode } from 'react'
import type { MasteryBand } from '../engines/mastery.ts'

/* ---------------- Marca ---------------- */

/**
 * Símbol propi i neutre: una brúixola geomètrica dins un escut abstracte.
 * No fa servir cap escut municipal ni emblema policial protegit.
 */
export function BrandMark({ size = 40 }: { size?: number }): ReactNode {
  return (
    <svg
      className="brand__mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Policia Quest"
      style={{ width: size, height: size }}
    >
      <defs>
        <linearGradient id="pq-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-strong)" />
        </linearGradient>
      </defs>
      <path
        d="M24 3 42 9v16c0 10-7.4 17.6-18 20C13.4 42.6 6 35 6 25V9L24 3Z"
        fill="none"
        stroke="url(#pq-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="24" r="9" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />
      <path d="M29.5 18.5 26 26l-7.5 3.5L22 22l7.5-3.5Z" fill="url(#pq-grad)" />
      <circle cx="24" cy="24" r="1.6" fill="var(--bg)" />
    </svg>
  )
}

/* ---------------- Icones de navegació ---------------- */

type IconName = 'home' | 'route' | 'train' | 'exams' | 'progress'

const ICON_PATHS: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  // El punt final va a y=20, no a y=22: amb radi 2 i traç 1,8 el cercle sortiria
  // del viewBox i es veuria tallat per sota.
  route: 'M6 4v8a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4M6 4a2 2 0 1 0 0-.001M18 20a2 2 0 1 0 0-.001',
  train: 'M12 3v18M4.5 7.5v9M19.5 7.5v9M8.25 5.5v13M15.75 5.5v13',
  exams: 'M6 3h9l4 4v14H6V3Zm9 0v4h4M9 12h7M9 16h7',
  progress: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
}

export function NavIcon({ name }: { name: IconName }): ReactNode {
  return (
    <svg className="nav__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ICON_PATHS[name]}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------------- Barra de progrés ---------------- */

export function Meter({
  value,
  max = 100,
  tone = 'accent',
  label,
}: {
  value: number
  max?: number
  tone?: 'accent' | 'ok' | 'warn' | 'danger'
  label?: string
}): ReactNode {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      className="meter"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      {...(label ? { 'aria-label': label } : {})}
    >
      <div
        className={`meter__fill${tone === 'accent' ? '' : ` meter__fill--${tone}`}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ---------------- Insígnia de domini ---------------- */

const BAND_TONE: Record<MasteryBand, string> = {
  'sense-dades': 'pill',
  baix: 'pill pill--danger',
  mitja: 'pill pill--warn',
  alt: 'pill pill--ok',
}

export function BandPill({ band, children }: { band: MasteryBand; children: ReactNode }): ReactNode {
  return <span className={BAND_TONE[band]}>{children}</span>
}

/* ---------------- Estadística ---------------- */

export function Stat({ value, label }: { value: ReactNode; label: string }): ReactNode {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

/* ---------------- Capçalera de pantalla ---------------- */

export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}): ReactNode {
  return (
    <header className="screen__header">
      <div className="row row--between">
        <div>
          <h1 className="screen__title">{title}</h1>
          {subtitle ? <p className="screen__subtitle">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  )
}

/* ---------------- Avís legal ---------------- */

export function Disclaimer({ text }: { text: string }): ReactNode {
  return (
    <p className="disclaimer" role="note">
      {text}
    </p>
  )
}
