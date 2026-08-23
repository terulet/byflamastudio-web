/** Pantalla d'inici: la missió del dia i tot el que és urgent, a dos tocs. */
import { useMemo, type ReactNode } from 'react'
import { pack, levelFor, useApp } from '../app/store.tsx'
import { useDashboard, useToday } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, pick, plural } from '../i18n/index.ts'
import { BrandMark, Meter, Stat } from '../components/ui.tsx'
import { formatMilli } from '../engines/scoring.ts'
import { isoToEpochDay } from '../util/date.ts'

export function Home(): ReactNode {
  const { settings, progress, attempts } = useApp()
  const t = dict(settings.explanationLang)
  const dash = useDashboard()
  const today = useToday()

  const level = levelFor(progress.xp)
  const goalProgress = Math.min(dash.answeredToday, settings.dailyGoal)
  const resumable = attempts.find((a) => a.status === 'in-progress')
  const lastFinished = attempts.find((a) => a.status === 'finished')

  const daysToExam = useMemo(() => {
    if (!settings.examDate) return null
    return isoToEpochDay(settings.examDate) - today
  }, [settings.examDate, today])

  const recommendedTitle = dash.recommendedTopic
    ? `${dash.recommendedTopic.number}. ${pick(dash.recommendedTopic.title, settings.explanationLang)}`
    : null

  return (
    <main className="screen" data-testid="home">
      <header className="screen__header">
        <div className="row row--between">
          <div className="brand">
            <BrandMark size={34} />
            <div>
              <div className="brand__name">{t.appName}</div>
              <div className="brand__sub">{t.appSubtitle}</div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => navigate({ name: 'settings' })}
            aria-label={t.common.settings}
          >
            ⚙
          </button>
        </div>
      </header>

      <div className="stack">
        {/* Ratxa, objectiu i nivell */}
        <section className="card card--accent">
          <div className="row row--between">
            <div>
              <div className="card__label">{t.home.greeting}</div>
              <div className="card__title" style={{ fontSize: 'var(--text-lg)' }}>
                {/* Etiqueta primer i xifra després: «0 dies · Ratxa» es llegia
                    del revés. I «1 dies» no existeix: cal el singular. */}
                {t.home.streak} · {progress.streakDays}{' '}
                {plural(progress.streakDays, t.home.day, t.home.days)}
              </div>
            </div>
            <span className="pill pill--accent">
              {t.levels[level.id]} · {progress.xp} {t.home.xp}
            </span>
          </div>

          <div className="stack stack--tight" style={{ marginTop: 'var(--sp-4)' }}>
            <div className="row row--between">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {t.home.goal}
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 650 }} data-testid="goal-progress">
                {goalProgress} / {settings.dailyGoal}
              </span>
            </div>
            <Meter
              value={goalProgress}
              max={settings.dailyGoal}
              tone={goalProgress >= settings.dailyGoal ? 'ok' : 'accent'}
              label={t.home.goal}
            />
          </div>

          {daysToExam !== null && daysToExam >= 0 ? (
            <p className="card__body">
              {t.home.examIn} <strong>{daysToExam}</strong> {daysToExam === 1 ? t.home.day : t.home.days}
            </p>
          ) : null}
        </section>

        {/* CTA principal */}
        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={() => navigate({ name: 'study', mode: 'missio-del-dia' })}
          data-testid="start-mission"
        >
          {t.home.startMission}
        </button>

        {/* Simulacre a mitges */}
        {resumable ? (
          <section className="card" data-testid="resumable-exam">
            <div className="row row--between">
              <div>
                <div className="card__label">{t.home.resumeExam}</div>
                <div className="card__title">
                  {pack.blueprints.find((b) => b.blueprintId === resumable.blueprintIds[0])
                    ? pick(
                        pack.blueprints.find((b) => b.blueprintId === resumable.blueprintIds[0])!.title,
                        settings.explanationLang,
                      )
                    : t.exams.title}
                </div>
              </div>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => navigate({ name: 'exam', blueprintId: resumable.blueprintIds[0]! })}
              >
                {t.home.resume}
              </button>
            </div>
          </section>
        ) : null}

        {/* Repassos i errors */}
        <section className="stats">
          <Stat value={dash.due} label={t.home.dueReviews} />
          <Stat value={dash.failed} label={t.study.wrongCount} />
          <Stat value={progress.totalAnswered} label={t.progress.answered} />
        </section>

        {dash.due > 0 ? (
          <button
            type="button"
            className="btn btn--block"
            onClick={() => navigate({ name: 'study', mode: 'repassos' })}
            data-testid="start-reviews"
          >
            {t.train.modes.repassos} · {dash.due}
          </button>
        ) : (
          <p className="empty" style={{ padding: 'var(--sp-3)' }}>
            {t.home.noDue}
          </p>
        )}

        {/* Tema recomanat */}
        {recommendedTitle && dash.recommendedTopic ? (
          <section className="card">
            <div className="card__label">{t.home.nextTopic}</div>
            <div className="card__title">{recommendedTitle}</div>
            <div className="row" style={{ marginTop: 'var(--sp-3)' }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => navigate({ name: 'topic', topicId: dash.recommendedTopic!.topicId })}
              >
                {t.route.readLesson}
              </button>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() =>
                  navigate({
                    name: 'study',
                    mode: 'per-tema',
                    topicIds: [dash.recommendedTopic!.topicId],
                  })
                }
              >
                {t.route.practiceTopic}
              </button>
            </div>
          </section>
        ) : null}

        {/* Sessió mínima */}
        <button
          type="button"
          className="btn btn--block"
          onClick={() => navigate({ name: 'study', mode: 'no-tinc-ganes' })}
          data-testid="low-energy"
        >
          {t.home.lowEnergy} · {t.home.lowEnergyNote}
        </button>

        {/* Últim simulacre */}
        {lastFinished ? (
          <section className="card">
            <div className="row row--between">
              <div>
                <div className="card__label">{t.home.lastExam}</div>
                <div className="card__title">
                  {formatMilli(lastFinished.scoreMilli ?? 0, settings.explanationLang)} / 20
                </div>
              </div>
              <span
                className={
                  (lastFinished.scoreMilli ?? 0) >= 10_000 ? 'pill pill--ok' : 'pill pill--danger'
                }
              >
                {(lastFinished.scoreMilli ?? 0) >= 10_000 ? t.result.passed : t.result.failed}
              </span>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
