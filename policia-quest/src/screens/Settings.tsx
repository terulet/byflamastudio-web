/** Fonts i ajustos: transparència del contingut i control total de les dades. */
import { useRef, useState, type ReactNode } from 'react'
import { pack, useActions, useApp } from '../app/store.tsx'
import { dict } from '../i18n/index.ts'
import { Disclaimer, ScreenHeader } from '../components/ui.tsx'
import { backupFileName, createBackup, parseBackup } from '../persistence/backup.ts'
import { navigate } from '../app/router.ts'
import type { Lang, Settings as SettingsType } from '../domain/types.ts'

export function Settings(): ReactNode {
  const { settings, progress, reviews, sessions, attempts } = useApp()
  const { updateSettings, resetProgress, applyBackup } = useActions()
  const lang = settings.explanationLang
  const t = dict(lang)

  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null)
  const [resetText, setResetText] = useState('')
  const [showReset, setShowReset] = useState(false)

  const exportBackup = (): void => {
    const backup = createBackup(
      {
        settings,
        progress,
        reviews: [...reviews.values()],
        sessions,
        attempts,
      },
      Date.now(),
    )
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(Date.now())
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (file: File): Promise<void> => {
    const text = await file.text()
    const result = parseBackup(text)
    if (!result.ok) {
      setMessage({
        tone: 'warn',
        text: t.settings.importErrors[result.error as keyof typeof t.settings.importErrors] ?? result.error,
      })
      return
    }
    await applyBackup(result.backup.payload)
    setMessage({ tone: 'ok', text: t.settings.importOk })
  }

  const doReset = async (): Promise<void> => {
    await resetProgress()
    setShowReset(false)
    setResetText('')
    setMessage({ tone: 'ok', text: t.settings.resetDone })
  }

  const set = <K extends keyof SettingsType>(key: K, value: SettingsType[K]): void => {
    updateSettings({ [key]: value } as Partial<SettingsType>)
  }

  return (
    <main className="screen" data-testid="settings">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => navigate({ name: 'home' })}
        style={{ marginBottom: 'var(--sp-3)' }}
      >
        ← {t.nav.home}
      </button>

      <ScreenHeader title={t.settings.title} />

      <div className="stack stack--loose">
        {message ? (
          <p className={message.tone === 'ok' ? 'notice notice--info' : 'notice notice--warn'} role="status">
            {message.text}
          </p>
        ) : null}

        <Disclaimer text={t.disclaimer} />

        {/* Aparença */}
        <section className="stack">
          <h2 className="section-title">{t.settings.appearance}</h2>

          <div className="field">
            <span className="field__label">{t.settings.theme}</span>
            <div className="choice-group">
              {(['dark', 'light', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className="choice"
                  aria-pressed={settings.theme === theme}
                  onClick={() => set('theme', theme)}
                  data-testid={`theme-${theme}`}
                >
                  {t.settings.themes[theme]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">{t.settings.language}</span>
            <div className="choice-group">
              {(['ca', 'es'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="choice"
                  aria-pressed={settings.explanationLang === value}
                  onClick={() => set('explanationLang', value as Lang)}
                  data-testid={`lang-${value}`}
                >
                  {t.settings.languages[value]}
                </button>
              ))}
            </div>
            <p className="screen__subtitle">{t.settings.languageNote}</p>
          </div>
        </section>

        {/* Estudi */}
        <section className="stack">
          <h2 className="section-title">{t.settings.study}</h2>

          <div className="field">
            <span className="field__label">{t.settings.dailyGoal}</span>
            <div className="choice-group">
              {([5, 10, 20] as const).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className="choice"
                  aria-pressed={settings.dailyGoal === goal}
                  onClick={() => set('dailyGoal', goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="settings-exam-date">
              {t.settings.examDate}
            </label>
            <input
              id="settings-exam-date"
              className="input"
              type="date"
              value={settings.examDate ?? ''}
              onChange={(e) => set('examDate', e.target.value === '' ? null : e.target.value)}
            />
          </div>
        </section>

        {/* So i moviment */}
        <section className="stack">
          <h2 className="section-title">{t.settings.feedback}</h2>
          {([
            ['sound', t.settings.sound],
            ['haptics', t.settings.haptics],
            ['reducedMotion', t.settings.reducedMotion],
          ] as const).map(([key, label]) => (
            <div key={key} className="switch-row">
              <label className="field__label" htmlFor={`toggle-${key}`}>
                {label}
              </label>
              <button
                id={`toggle-${key}`}
                type="button"
                className="choice"
                style={{ flex: '0 0 auto', minWidth: 72 }}
                aria-pressed={settings[key]}
                onClick={() => set(key, !settings[key])}
              >
                {settings[key] ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </section>

        {/* Dades */}
        <section className="stack">
          <h2 className="section-title">{t.settings.data}</h2>

          <button type="button" className="btn btn--block" onClick={exportBackup} data-testid="export-backup">
            {t.settings.exportBackup}
          </button>

          <button
            type="button"
            className="btn btn--block"
            onClick={() => fileInput.current?.click()}
            data-testid="import-backup"
          >
            {t.settings.importBackup}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importBackup(file)
              e.target.value = ''
            }}
          />

          {!showReset ? (
            <button
              type="button"
              className="btn btn--danger btn--block"
              onClick={() => setShowReset(true)}
              data-testid="reset-progress"
            >
              {t.settings.reset}
            </button>
          ) : (
            <div className="card" style={{ borderColor: 'var(--danger)' }}>
              <p className="card__body" style={{ marginTop: 0 }}>
                {t.settings.resetWarning}
              </p>
              <div className="field" style={{ marginTop: 'var(--sp-3)' }}>
                <label className="field__label" htmlFor="reset-confirm">
                  {t.settings.resetConfirm}
                </label>
                <input
                  id="reset-confirm"
                  className="input"
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowReset(false)
                    setResetText('')
                  }}
                >
                  {t.common.cancel}
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  style={{ flex: 1 }}
                  disabled={resetText !== t.settings.resetWord}
                  onClick={() => void doReset()}
                  data-testid="reset-confirm-button"
                >
                  {t.settings.reset}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Fonts */}
        <section className="stack">
          <h2 className="section-title">{t.settings.sourcesTitle}</h2>
          <p className="screen__subtitle">{t.settings.sourcesNote}</p>

          <div className="stack stack--tight">
            {pack.sources.map((source) => (
              <article key={source.sourceId} className="card card--flat">
                <div className="row row--between">
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', flex: 1, minWidth: 0 }}>
                    {source.title}
                  </span>
                  <span
                    className={
                      source.fetchStatus === 'downloaded' ? 'pill pill--ok' : 'pill pill--warn'
                    }
                  >
                    {t.settings.sourceStatus[source.fetchStatus]}
                  </span>
                </div>
                <div className="source__id" style={{ marginTop: 4 }}>
                  {source.issuer} · {t.settings.consulted} {source.consultedAt}
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}
                >
                  {source.url}
                </a>
              </article>
            ))}
          </div>
        </section>

        {/* Sobre */}
        <section className="stack">
          <h2 className="section-title">{t.settings.aboutTitle}</h2>
          <div className="card card--flat">
            <div className="card__body" style={{ marginTop: 0 }}>
              {t.settings.contentVersion}: {pack.version.packVersion} · {pack.version.builtAt}
            </div>
            <div className="card__body">
              {pack.syllabus.topics.length} {t.common.topics} ·{' '}
              {pack.questions.filter((q) => q.status === 'active').length} {t.common.questions} ·{' '}
              {pack.sources.length} {t.common.sources.toLowerCase()}
            </div>
            <p className="card__body">{t.settings.coverageNote}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
