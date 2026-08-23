/** Onboarding: menys d'un minut, sense registre i amb opció d'ometre. */
import { useState, type ReactNode } from 'react'
import { useActions, useApp } from '../app/store.tsx'
import { dict } from '../i18n/index.ts'
import { BrandMark, Disclaimer } from '../components/ui.tsx'
import type { Lang, Settings } from '../domain/types.ts'

const STEPS = 3

export function Onboarding(): ReactNode {
  const { settings } = useApp()
  const { updateSettings } = useActions()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Settings>(settings)
  const t = dict(draft.explanationLang)

  const finish = (): void => updateSettings({ ...draft, onboarded: true })

  return (
    <main className="screen screen--full" data-testid="onboarding">
      <div className="stack stack--loose">
        <div className="brand">
          <BrandMark />
          <div>
            <div className="brand__name">{t.appName}</div>
            <div className="brand__sub">{t.appSubtitle}</div>
          </div>
        </div>

        {/* Un `div` sense rol no pot portar `aria-label` (axe: aria-prohibited-attr).
            `progressbar` és el rol que descriu de debò què és aquesta barra i,
            a més, deixa anunciar el pas actual amb valors, no només amb text. */}
        <div
          className="row"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={step + 1}
          aria-label={`${t.onboarding.step} ${step + 1} ${t.common.of} ${STEPS}`}
        >
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 999,
                background: i <= step ? 'var(--accent)' : 'var(--surface-3)',
                transition: 'background var(--motion) var(--ease)',
              }}
            />
          ))}
        </div>

        {step === 0 ? (
          <section className="stack fade-up">
            <h1 className="screen__title">{t.onboarding.welcome}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t.onboarding.intro}</p>

            <div className="card card--accent">
              <div className="card__label">{t.onboarding.municipality}</div>
              <div className="card__title">Roses · Alt Empordà</div>
              <div className="card__body">{t.onboarding.municipalityNote}</div>
            </div>

            <Disclaimer text={t.disclaimer} />
          </section>
        ) : null}

        {step === 1 ? (
          <section className="stack fade-up">
            <div className="field">
              <span className="field__label">{t.onboarding.langTitle}</span>
              <div className="choice-group">
                {(['ca', 'es'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    className="choice"
                    aria-pressed={draft.explanationLang === lang}
                    onClick={() => setDraft((d) => ({ ...d, explanationLang: lang as Lang }))}
                  >
                    {t.settings.languages[lang]}
                  </button>
                ))}
              </div>
              <p className="screen__subtitle">{t.onboarding.langNote}</p>
            </div>

            <div className="field">
              <span className="field__label">{t.onboarding.goalTitle}</span>
              <div className="choice-group">
                {([5, 10, 20] as const).map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    className="choice"
                    aria-pressed={draft.dailyGoal === goal}
                    onClick={() => setDraft((d) => ({ ...d, dailyGoal: goal }))}
                  >
                    {goal} {t.common.questions}
                  </button>
                ))}
              </div>
              <p className="screen__subtitle">{t.onboarding.goalNote}</p>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="stack fade-up">
            <div className="field">
              <label className="field__label" htmlFor="exam-date">
                {t.onboarding.examDateTitle}
              </label>
              <input
                id="exam-date"
                className="input"
                type="date"
                value={draft.examDate ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, examDate: e.target.value === '' ? null : e.target.value }))
                }
              />
              <p className="screen__subtitle">{t.onboarding.examDateNote}</p>
            </div>

            <div className="card">
              <div className="card__label">{t.onboarding.municipality}</div>
              <div className="card__title">Roses</div>
              <div className="card__body">
                40 {t.common.topics} · {t.settings.languages[draft.explanationLang]} ·{' '}
                {draft.dailyGoal} {t.common.questions}/{t.home.day}
              </div>
            </div>
          </section>
        ) : null}

        <div className="stack stack--tight">
          {step < STEPS - 1 ? (
            <button type="button" className="btn btn--primary btn--lg btn--block" onClick={() => setStep((s) => s + 1)}>
              {t.common.continue}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--lg btn--block"
              onClick={finish}
              data-testid="onboarding-finish"
            >
              {t.onboarding.begin}
            </button>
          )}

          <div className="row row--between">
            {step > 0 ? (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep((s) => s - 1)}>
                {t.common.back}
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="btn btn--ghost btn--sm" onClick={finish} data-testid="onboarding-skip">
              {t.onboarding.skip}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
