/** Progrés: domini, semàfor per temes, confiança i activitat, sense mètriques enganyoses. */
import type { ReactNode } from 'react'
import { pack, levelFor, useApp } from '../app/store.tsx'
import {
  useActivityCalendar,
  useConfidenceStats,
  useDashboard,
  useExamResultsByTopic,
  useRecurringErrors,
} from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, pick } from '../i18n/index.ts'
import { Meter, ScreenHeader, Stat } from '../components/ui.tsx'
import { formatDuration, epochDayToIso } from '../util/date.ts'
import { MIN_ANSWERS_FOR_ACCURACY, MIN_ANSWERS_FOR_MASTERY } from '../engines/mastery.ts'

export function Progress(): ReactNode {
  const { settings, progress } = useApp()
  const lang = settings.explanationLang
  const t = dict(lang)
  const dash = useDashboard()
  const errors = useRecurringErrors()
  const confidence = useConfidenceStats()
  const calendar = useActivityCalendar()
  const examByTopic = useExamResultsByTopic()
  const level = levelFor(progress.xp)

  // Amb poques respostes, l'exactitud no és informativa: es mostra un guió.
  const recentAccuracy =
    progress.totalAnswered >= MIN_ANSWERS_FOR_ACCURACY
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : null

  const maxDaily = Math.max(1, ...calendar.map((d) => d.count))

  return (
    <main className="screen" data-testid="progress">
      <ScreenHeader title={t.progress.title} />

      <div className="stack stack--loose">
        <section className="card card--accent">
          <div className="row row--between">
            <div>
              <div className="card__label">{t.progress.globalMastery}</div>
              <div className="score__value" style={{ fontSize: '2.25rem', marginTop: 4 }} data-testid="global-mastery">
                {dash.global === null ? '—' : `${dash.global}%`}
              </div>
            </div>
            <span className="pill pill--accent">
              {t.levels[level.id]}
            </span>
          </div>

          {level.nextXp !== null ? (
            <div className="stack stack--tight" style={{ marginTop: 'var(--sp-4)' }}>
              <div className="row row--between" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>{progress.xp} {t.home.xp}</span>
                <span>{level.nextXp} {t.home.xp}</span>
              </div>
              <Meter value={progress.xp} max={level.nextXp} label={t.home.level} />
            </div>
          ) : null}
        </section>

        <section className="stats">
          <Stat value={recentAccuracy === null ? '—' : `${recentAccuracy}%`} label={t.progress.recentAccuracy} />
          <Stat value={progress.totalAnswered} label={t.progress.answered} />
          <Stat value={formatDuration(progress.totalStudyMs, lang)} label={t.progress.studyTime} />
          <Stat value={progress.longestStreak} label={t.home.streak} />
        </section>

        {/* Semàfor per temes */}
        <section className="stack">
          <h2 className="section-title">{t.progress.byTopic}</h2>
          <div className="stack stack--tight">
            {[...pack.syllabus.topics]
              .sort((a, b) => a.number - b.number)
              .map((topic) => {
                const mastery = dash.masteryByTopic.get(topic.topicId)
                const band = mastery?.band ?? 'sense-dades'
                const examResult = examByTopic.get(topic.topicId)
                return (
                  <button
                    key={topic.topicId}
                    type="button"
                    className="row row--between"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 0,
                      padding: 'var(--sp-2) 0',
                      textAlign: 'left',
                      minHeight: 'var(--tap)',
                    }}
                    onClick={() => navigate({ name: 'topic', topicId: topic.topicId })}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        flex: '0 0 auto',
                        background:
                          band === 'alt' ? 'var(--ok)'
                          : band === 'mitja' ? 'var(--warn)'
                          : band === 'baix' ? 'var(--danger)'
                          : 'var(--surface-3)',
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }}>
                      {topic.number}. {pick(topic.title, lang)}
                    </span>

                    {/*
                      El blau del simulacre va a part del semàfor de domini:
                      són dues mesures diferents i barrejar-les amagaria els
                      temes que van bé estudiant i malament sota pressió.
                    */}
                    {examResult ? (
                      <span
                        className="pill pill--info"
                        title={`${t.progress.examMarker}: ${examResult.correct}/${examResult.total}`}
                        data-testid={`exam-marker-${topic.number}`}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--info)',
                          }}
                        />
                        {examResult.correct}/{examResult.total}
                      </span>
                    ) : null}

                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
                      {mastery?.mastery === null || mastery === undefined
                        ? t.progress.bands['sense-dades']
                        : `${mastery.mastery}%`}
                    </span>
                  </button>
                )
              })}
          </div>
          <p className="screen__subtitle">
            {`${t.progress.bands['sense-dades']}: menys de ${MIN_ANSWERS_FOR_MASTERY} respostes al tema. `}
            {`L’exactitud recent apareix a partir de ${MIN_ANSWERS_FOR_ACCURACY} respostes.`}
          </p>
          {examByTopic.size > 0 ? (
            <p className="screen__subtitle">{t.progress.examMarkerNote}</p>
          ) : null}
        </section>

        {/* Confiança i precisió */}
        <section className="stack">
          <h2 className="section-title">{t.progress.confidenceVsAccuracy}</h2>
          {confidence.total === 0 ? (
            <p className="empty">{t.progress.notEnoughData}</p>
          ) : (
            <>
              <div className="stats">
                <Stat value={confidence.sureCorrect} label={t.progress.sureCorrect} />
                <Stat value={confidence.sureWrong} label={t.progress.sureWrong} />
                <Stat value={confidence.unsureCorrect} label={t.progress.unsureCorrect} />
              </div>
              <p className="screen__subtitle">{t.progress.confidenceNote}</p>
            </>
          )}
        </section>

        {/* Errors recurrents */}
        <section className="stack">
          <h2 className="section-title">{t.progress.recurringErrors}</h2>
          {errors.length === 0 ? (
            <p className="empty">{t.progress.noErrors}</p>
          ) : (
            <div className="stack stack--tight">
              {errors.map(({ question, lapses }) => (
                <div key={question.questionId} className="card card--flat">
                  <div className="row row--between">
                    <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }} lang="ca">
                      {question.stem}
                    </span>
                    <span className="pill pill--danger">{lapses}</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn--block"
                onClick={() => navigate({ name: 'study', mode: 'errors' })}
              >
                {t.train.modes.errors}
              </button>
            </div>
          )}
        </section>

        {/* Calendari d'activitat */}
        <section className="stack">
          <h2 className="section-title">{t.progress.calendar}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
            }}
          >
            {calendar.map(({ day, count }) => (
              <div
                key={day}
                title={`${epochDayToIso(day)} · ${count}`}
                aria-label={`${epochDayToIso(day)}: ${count} ${t.common.questions}`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 4,
                  background:
                    count === 0
                      ? 'var(--surface-2)'
                      : `color-mix(in srgb, var(--accent) ${Math.round((count / maxDaily) * 80) + 20}%, var(--surface-2))`,
                  border: '1px solid var(--border)',
                }}
              />
            ))}
          </div>
        </section>

        {/* Recomanació */}
        {dash.recommendedTopic ? (
          <section className="card">
            <div className="card__label">{t.progress.recommendation}</div>
            <div className="card__title">
              {dash.due > 0
                ? `${t.train.modes.repassos} · ${dash.due}`
                : `${dash.recommendedTopic.number}. ${pick(dash.recommendedTopic.title, lang)}`}
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              style={{ marginTop: 'var(--sp-3)' }}
              onClick={() =>
                dash.due > 0
                  ? navigate({ name: 'study', mode: 'repassos' })
                  : navigate({
                      name: 'study',
                      mode: 'per-tema',
                      topicIds: [dash.recommendedTopic!.topicId],
                    })
              }
            >
              {t.common.start}
            </button>
          </section>
        ) : null}

        {/* Assoliments */}
        {progress.achievements.length > 0 ? (
          <section className="stack">
            <h2 className="section-title">{t.progress.achievements}</h2>
            <div className="row row--wrap">
              {progress.achievements.map((id) => (
                <span key={id} className="pill pill--accent">
                  {t.achievements[id as keyof typeof t.achievements] ?? id}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
