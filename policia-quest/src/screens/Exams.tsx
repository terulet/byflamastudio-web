/** Simulacres: plànols reals de Roses, històrics oficials i historial. */
import type { ReactNode } from 'react'
import { pack, useApp } from '../app/store.tsx'
import { useActiveQuestions } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, fill, pick } from '../i18n/index.ts'
import { ScreenHeader } from '../components/ui.tsx'
import { formatMilli } from '../engines/scoring.ts'
import { examAvailability } from '../engines/availability.ts'
import { epochDayToIso, formatDuration, toEpochDay } from '../util/date.ts'

/** Etiqueta llegible d'una quota, tal com la declara el plànol. */
function labelForTag(
  bp: { composition?: readonly { label: { ca: string; es?: string }; tag: string }[] },
  tag: string,
  lang: 'ca' | 'es',
): string {
  const slot = bp.composition?.find((c) => c.tag === tag)
  return slot ? pick(slot.label, lang) : tag
}

export function Exams(): ReactNode {
  const { settings, attempts } = useApp()
  const lang = settings.explanationLang
  const t = dict(lang)
  const active = useActiveQuestions()

  /*
   * Un simulacre no s'ofereix perquè hi hagi prou preguntes, sinó perquè es pot
   * muntar **la prova que descriuen les bases**. La de cultura general són 10
   * de cultura general i 10 d'actualitat: si el banc no té les d'actualitat
   * vigents, oferir-ne vint de cultura general seria ensenyar un format fals i
   * donar una nota que no vol dir res. Es bloqueja i es diu per què.
   */
  const todayIso = epochDayToIso(toEpochDay(Date.now()))
  const availability = new Map(
    pack.blueprints.map((bp) => [bp.blueprintId, examAvailability(active, bp, todayIso)]),
  )

  const importedExams = pack.exams.filter((e) => e.importStatus === 'imported')
  const pendingExams = pack.exams.filter((e) => e.importStatus !== 'imported')
  const finished = attempts.filter((a) => a.status === 'finished')

  return (
    <main className="screen" data-testid="exams">
      <ScreenHeader title={t.exams.title} subtitle={t.exams.subtitle} />

      <div className="stack stack--loose">
        <section className="stack">
          {pack.blueprints.map((bp) => {
            const status = availability.get(bp.blueprintId)
            const canRun = status?.ok ?? false
            return (
              <article key={bp.blueprintId} className="card card--accent">
                <div className="row row--between">
                  <div>
                    <div className="card__label">{bp.questionCount} {t.common.questions} · {bp.durationMinutes} min</div>
                    <div className="card__title">{pick(bp.title, lang)}</div>
                  </div>
                  <span className="pill pill--accent">/20</span>
                </div>

                <dl
                  className="stats"
                  style={{ marginTop: 'var(--sp-4)', gridTemplateColumns: 'repeat(4, 1fr)' }}
                >
                  <div className="stat">
                    <dt className="stat__label" style={{ order: 2 }}>{t.exams.correctPoints}</dt>
                    <dd className="stat__value" style={{ order: 1, margin: 0 }}>
                      +{formatMilli(bp.scoring.correctMilli, lang)}
                    </dd>
                  </div>
                  <div className="stat">
                    <dt className="stat__label" style={{ order: 2 }}>{t.exams.wrongPoints}</dt>
                    <dd className="stat__value" style={{ order: 1, margin: 0, color: 'var(--danger)' }}>
                      −{formatMilli(bp.scoring.wrongMilli, lang)}
                    </dd>
                  </div>
                  <div className="stat">
                    <dt className="stat__label" style={{ order: 2 }}>{t.exams.blankPoints}</dt>
                    <dd className="stat__value" style={{ order: 1, margin: 0 }}>0</dd>
                  </div>
                  <div className="stat">
                    <dt className="stat__label" style={{ order: 2 }}>{t.exams.passMark}</dt>
                    <dd className="stat__value" style={{ order: 1, margin: 0, color: 'var(--ok)' }}>
                      {formatMilli(bp.scoring.passMarkMilli, lang)}
                    </dd>
                  </div>
                </dl>

                {bp.composition ? (
                  <p className="card__body">
                    {bp.composition.map((c) => `${c.count} ${pick(c.label, lang).toLowerCase()}`).join(' · ')}
                  </p>
                ) : null}

                {bp.reserveCount > 0 ? (
                  <p className="card__body">
                    {bp.reserveCount} {bp.reserveCount === 1 ? t.exams.reserveOne : t.exams.reserve}
                  </p>
                ) : null}

                <button
                  type="button"
                  className="btn btn--primary btn--block"
                  style={{ marginTop: 'var(--sp-4)' }}
                  disabled={!canRun}
                  onClick={() => navigate({ name: 'exam', blueprintId: bp.blueprintId })}
                  data-testid={`start-exam-${bp.blueprintId}`}
                >
                  {t.exams.startExam}
                </button>

                {!canRun && status ? (
                  <div
                    className="notice notice--warn"
                    style={{ marginTop: 'var(--sp-3)' }}
                    data-testid={`blocked-${bp.blueprintId}`}
                  >
                    <strong>{t.exams.blockedTitle}</strong>
                    <p style={{ margin: 'var(--sp-2) 0 0' }}>{t.exams.blockedWhy}</p>
                    <ul style={{ margin: 'var(--sp-2) 0 0', paddingLeft: '1.1em' }}>
                      {status.quotas.length > 0 ? (
                        status.quotas
                          .filter((quota) => quota.missing > 0)
                          .map((quota) => (
                            <li key={quota.tag}>
                              {fill(t.exams.blockedQuota, {
                                label: labelForTag(bp, quota.tag, lang),
                                available: quota.available,
                                needed: quota.needed,
                              })}
                            </li>
                          ))
                      ) : (
                        <li>
                          {fill(t.exams.blockedQuota, {
                            label: pick(bp.title, lang),
                            available: status.poolSize,
                            needed: bp.questionCount,
                          })}
                        </li>
                      )}
                    </ul>
                    {/* Un bloqueig no pot ser un carreró sense sortida: les
                        preguntes que sí que hi ha segueixen sent útils. */}
                    <button
                      type="button"
                      className="btn btn--sm btn--block"
                      style={{ marginTop: 'var(--sp-3)' }}
                      onClick={() => navigate({ name: 'train' })}
                      data-testid={`blocked-fallback-${bp.blueprintId}`}
                    >
                      {t.exams.blockedFallback}
                    </button>
                  </div>
                ) : null}
              </article>
            )
          })}
        </section>

        {/* Simulacre complet: les dues proves seguides */}
        {pack.compositions.map((composition) => {
          const parts = composition.blueprintIds
            .map((id) => pack.blueprints.find((b) => b.blueprintId === id))
            .filter((b): b is NonNullable<typeof b> => b !== undefined)
          const totalQuestions = parts.reduce((sum, b) => sum + b.questionCount, 0)
          const totalMinutes = parts.reduce((sum, b) => sum + b.durationMinutes, 0)
          // El complet encadena les dues proves: si una es bloqueja, es bloqueja
          // el conjunt. No té sentit fer-ne mitja.
          const blockedParts = parts.filter((b) => !availability.get(b.blueprintId)?.ok)
          const canRun = blockedParts.length === 0
          return (
            <article key={composition.compositionId} className="card card--accent">
              <div className="row row--between">
                <div>
                  <div className="card__label">
                    {totalQuestions} {t.common.questions} · {totalMinutes} min
                  </div>
                  <div className="card__title">{pick(composition.title, lang)}</div>
                </div>
                <span className="pill pill--accent">2 × /20</span>
              </div>

              <p className="card__body">{pick(composition.subtitle, lang)}</p>
              <p className="card__body">{t.exams.completeVerdictNote}</p>

              <button
                type="button"
                className="btn btn--primary btn--block"
                style={{ marginTop: 'var(--sp-4)' }}
                disabled={!canRun}
                onClick={() => navigate({ name: 'exam', blueprintId: composition.compositionId })}
                data-testid={`start-exam-${composition.compositionId}`}
              >
                {t.exams.startExam}
              </button>

              {blockedParts.length > 0 ? (
                <p
                  className="notice notice--warn"
                  style={{ marginTop: 'var(--sp-3)' }}
                  data-testid={`blocked-${composition.compositionId}`}
                >
                  {t.exams.blockedComplete}{' '}
                  {blockedParts.map((b) => pick(b.title, lang)).join(' · ')}
                </p>
              ) : null}
            </article>
          )
        })}

        {/* Exàmens oficials històrics */}
        <section className="stack">
          <h2 className="section-title">{t.exams.historical}</h2>
          <p className="screen__subtitle">{t.exams.historicalNote}</p>

          {importedExams.length > 0 ? (
            <div className="stack stack--tight">
              {importedExams.map((exam) => (
                <button
                  key={exam.examId}
                  type="button"
                  className="topic"
                  onClick={() => navigate({ name: 'exam', blueprintId: exam.examId })}
                >
                  <span className="topic__main">
                    <span className="topic__title">
                      {exam.year} · {exam.placeType === 'propietat' ? 'propietat' : 'interins'}
                    </span>
                    <span className="topic__meta">
                      {exam.testType === 'cultura-general' ? t.exams.cultura : t.exams.professional} ·{' '}
                      {exam.questionIds.length} {t.common.questions}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="notice notice--info" data-testid="no-historical">
              <p>{t.exams.noHistorical}</p>
              <p style={{ marginTop: 'var(--sp-2)', fontWeight: 650 }}>
                {pendingExams.length} {t.exams.pendingExams}
              </p>
            </div>
          )}
        </section>

        {/* Historial d'intents */}
        <section className="stack">
          <h2 className="section-title">{t.exams.history}</h2>
          {finished.length === 0 ? (
            <p className="empty">{t.exams.noAttempts}</p>
          ) : (
            <div className="stack stack--tight">
              {finished.map((attempt) => {
                const attemptComposition = pack.compositions.find(
                  (c) => c.compositionId === attempt.compositionId,
                )
                const bp = pack.blueprints.find((b) => b.blueprintId === attempt.blueprintIds[0])
                // Amb dues proves, cal aprovar-les totes dues per separat.
                const passed =
                  attempt.sectionScoresMilli.length > 0
                    ? attempt.sectionScoresMilli.every((score, i) => {
                        const partBp = pack.blueprints.find(
                          (b) => b.blueprintId === attempt.sections[i]?.blueprintId,
                        )
                        return score >= (partBp?.scoring.passMarkMilli ?? 10_000)
                      })
                    : (attempt.scoreMilli ?? 0) >= (bp?.scoring.passMarkMilli ?? 10_000)
                return (
                  <button
                    key={attempt.attemptId}
                    type="button"
                    className="topic"
                    onClick={() => navigate({ name: 'result', attemptId: attempt.attemptId })}
                  >
                    <span className="topic__main">
                      <span className="topic__title">
                        {attemptComposition
                          ? pick(attemptComposition.title, lang)
                          : bp
                            ? pick(bp.title, lang)
                            : t.exams.title}
                      </span>
                      <span className="topic__meta">
                        {new Date(attempt.startedAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'ca-ES')} ·{' '}
                        {formatDuration(attempt.elapsedMsAtPause, lang)}
                      </span>
                    </span>
                    <span className={passed ? 'pill pill--ok' : 'pill pill--danger'}>
                      {formatMilli(attempt.scoreMilli ?? 0, lang)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
