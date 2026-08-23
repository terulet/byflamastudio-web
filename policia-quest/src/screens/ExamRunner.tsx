/**
 * Simulacre.
 *
 * Diferències clau respecte al mode estudi:
 *  - No hi ha correcció fins al final.
 *  - Hi ha temporitzador visible i navegació lliure entre preguntes.
 *  - L'intent es desa a cada canvi, de manera que tancar l'app no el perd.
 *  - En finalitzar amb preguntes en blanc, es demana confirmació.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { pack, useActions, useApp } from '../app/store.tsx'
import { useActiveQuestions } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, fill, pick } from '../i18n/index.ts'
import { buildExamPaper } from '../engines/selection.ts'
import { scoreExam, type ScoredItem } from '../engines/scoring.ts'
import { formatClock } from '../util/date.ts'
import type { ExamAttempt, OptionId, Question } from '../domain/types.ts'

export function ExamRunner({ blueprintId }: { blueprintId: string }): ReactNode {
  const { settings, attempts } = useApp()
  const { saveAttempt } = useActions()
  const lang = settings.explanationLang
  const t = dict(lang)
  const active = useActiveQuestions()

  const blueprint = pack.blueprints.find((b) => b.blueprintId === blueprintId)

  /** Recupera l'intent en curs d'aquest plànol, o en crea un de nou. */
  const [attempt, setAttempt] = useState<ExamAttempt | null>(() => {
    const resumable = attempts.find(
      (a) => a.status === 'in-progress' && a.blueprintIds[0] === blueprintId,
    )
    if (resumable) return resumable
    if (!blueprint) return null

    const paper = buildExamPaper({
      pool: active,
      track: blueprint.track,
      count: blueprint.questionCount,
      seed: `${blueprintId}-${Date.now()}`,
    })
    return {
      attemptId: `a-${Date.now()}`,
      blueprintIds: [blueprintId],
      questionIds: paper.map((q) => q.questionId),
      responses: paper.map(() => null),
      flagged: paper.map(() => false),
      startedAt: Date.now(),
      durationMs: blueprint.durationMinutes * 60_000,
      elapsedMsAtPause: 0,
      status: 'in-progress',
      currentIndex: 0,
    }
  })

  const [index, setIndex] = useState(attempt?.currentIndex ?? 0)
  const [showNavigator, setShowNavigator] = useState(false)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [now, setNow] = useState(Date.now())
  const resumedAt = useRef(Date.now())

  const questionsById = useMemo(
    () => new Map(pack.questions.map((q) => [q.questionId, q])),
    [],
  )
  const questions = useMemo(
    () => (attempt?.questionIds ?? []).map((id) => questionsById.get(id)).filter(Boolean) as Question[],
    [attempt?.questionIds, questionsById],
  )

  const elapsedMs = (attempt?.elapsedMsAtPause ?? 0) + (now - resumedAt.current)
  const remainingMs = Math.max(0, (attempt?.durationMs ?? 0) - elapsedMs)

  /** Desa l'intent amb el temps consumit fins ara. */
  const persist = useCallback(
    (patch: Partial<ExamAttempt>) => {
      setAttempt((current) => {
        if (!current) return current
        const next: ExamAttempt = {
          ...current,
          elapsedMsAtPause: current.elapsedMsAtPause + (Date.now() - resumedAt.current),
          ...patch,
        }
        resumedAt.current = Date.now()
        saveAttempt(next)
        return next
      })
    },
    [saveAttempt],
  )

  const finish = useCallback(() => {
    setAttempt((current) => {
      if (!current || !blueprint) return current
      const items: ScoredItem[] = current.questionIds.map((id, i) => {
        const question = questionsById.get(id)
        return {
          chosen: current.responses[i] ?? null,
          correct: question?.correct ?? 'a',
          reserve: false,
        }
      })
      const breakdown = scoreExam(items, blueprint.scoring)
      const next: ExamAttempt = {
        ...current,
        elapsedMsAtPause: current.elapsedMsAtPause + (Date.now() - resumedAt.current),
        status: 'finished',
        finishedAt: Date.now(),
        scoreMilli: breakdown.scoreMilli,
      }
      saveAttempt(next)
      navigate({ name: 'result', attemptId: next.attemptId })
      return next
    })
  }, [blueprint, questionsById, saveAttempt])

  // Rellotge: un tic per segon, prou per a un temporitzador d'examen.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Guardat d'emergència: si l'app es tanca, el temps consumit queda desat.
  useEffect(() => {
    const onHide = (): void => {
      if (attempt?.status === 'in-progress') persist({ currentIndex: index })
    }
    window.addEventListener('pagehide', onHide)
    return () => window.removeEventListener('pagehide', onHide)
  }, [attempt?.status, index, persist])

  // En esgotar-se el temps, el simulacre es tanca sol.
  useEffect(() => {
    if (attempt?.status === 'in-progress' && remainingMs <= 0) finish()
  }, [remainingMs, attempt?.status, finish])

  if (!blueprint || !attempt) {
    return (
      <main className="screen screen--full">
        <p className="empty">{t.common.loading}</p>
      </main>
    )
  }

  const question = questions[index]
  const answeredCount = attempt.responses.filter((r) => r !== null).length
  const blankCount = attempt.responses.length - answeredCount
  const flaggedCount = attempt.flagged.filter(Boolean).length
  const urgent = remainingMs < 120_000

  const choose = (optionId: OptionId): void => {
    const responses = [...attempt.responses]
    responses[index] = responses[index] === optionId ? null : optionId
    persist({ responses, currentIndex: index })
  }

  const toggleFlagged = (): void => {
    const flagged = [...attempt.flagged]
    flagged[index] = !flagged[index]
    persist({ flagged, currentIndex: index })
  }

  return (
    <main className="screen screen--full" data-testid="exam-runner">
      <div className="exam-bar">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => {
            persist({ currentIndex: index })
            navigate({ name: 'exams' })
          }}
          data-testid="pause-exam"
        >
          {t.exams.pause}
        </button>

        <span
          className={urgent ? 'clock clock--urgent' : 'clock'}
          role="timer"
          aria-live="off"
          data-testid="exam-clock"
        >
          {formatClock(remainingMs)}
        </span>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setShowNavigator((v) => !v)}
          aria-expanded={showNavigator}
          data-testid="toggle-navigator"
        >
          {index + 1}/{questions.length}
        </button>
      </div>

      {showNavigator ? (
        <section className="stack" style={{ marginBottom: 'var(--sp-5)' }}>
          <div className="row row--wrap" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span>{answeredCount} {t.exams.answered}</span>
            <span>· {blankCount} {t.exams.blank}</span>
            <span>· {flaggedCount} {t.exams.flagged}</span>
          </div>
          <div className="grid-nav" aria-label={t.exams.navigator}>
            {attempt.questionIds.map((id, i) => {
              const classes = ['grid-nav__cell']
              if (attempt.responses[i]) classes.push('grid-nav__cell--answered')
              if (attempt.flagged[i]) classes.push('grid-nav__cell--flagged')
              if (i === index) classes.push('grid-nav__cell--current')
              return (
                <button
                  key={id}
                  type="button"
                  className={classes.join(' ')}
                  onClick={() => {
                    setIndex(i)
                    setShowNavigator(false)
                  }}
                  aria-label={`${t.common.question} ${i + 1}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      {question ? (
        <section className="stack" key={question.questionId}>
          <h2 className="question__stem" lang="ca">
            {question.stem}
          </h2>

          <fieldset className="options">
            <legend className="visually-hidden">{question.stem}</legend>
            {question.options.map((option, i) => (
              <button
                key={option.optionId}
                type="button"
                className={
                  attempt.responses[index] === option.optionId ? 'option option--selected' : 'option'
                }
                aria-pressed={attempt.responses[index] === option.optionId}
                onClick={() => choose(option.optionId)}
                data-testid={`exam-option-${option.optionId}`}
              >
                <span className="option__letter" aria-hidden="true">
                  {String.fromCharCode(97 + i)}
                </span>
                <span lang="ca">{option.text}</span>
              </button>
            ))}
          </fieldset>

          <div className="row row--between">
            <button
              type="button"
              className="btn btn--sm"
              onClick={toggleFlagged}
              aria-pressed={attempt.flagged[index] ?? false}
            >
              {attempt.flagged[index] ? `★ ${t.exams.marked}` : `☆ ${t.exams.markReview}`}
            </button>
          </div>

          <div className="row">
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              ← {t.common.previous}
            </button>
            {index + 1 < questions.length ? (
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => setIndex((i) => i + 1)}
                data-testid="exam-next"
              >
                {t.common.next} →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                style={{ flex: 1 }}
                onClick={() => (blankCount > 0 ? setConfirmFinish(true) : finish())}
                data-testid="exam-finish"
              >
                {t.common.finish}
              </button>
            )}
          </div>

          <button
            type="button"
            className="btn btn--ghost btn--block btn--sm"
            onClick={() => (blankCount > 0 ? setConfirmFinish(true) : finish())}
            data-testid="exam-finish-early"
          >
            {t.exams.confirmFinish}
          </button>
        </section>
      ) : null}

      {confirmFinish ? (
        <div
          className="card"
          role="alertdialog"
          aria-label={t.exams.confirmFinish}
          style={{
            position: 'fixed',
            left: 'var(--sp-4)',
            right: 'var(--sp-4)',
            bottom: 'calc(env(safe-area-inset-bottom) + var(--sp-4))',
            maxWidth: 640,
            margin: '0 auto',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 30,
          }}
          data-testid="confirm-finish"
        >
          <div className="card__title">{t.exams.confirmFinish}</div>
          <p className="card__body">{fill(t.exams.blanksWarning, { n: blankCount })}</p>
          <div className="row" style={{ marginTop: 'var(--sp-4)' }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              onClick={() => setConfirmFinish(false)}
            >
              {t.exams.keepGoing}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              style={{ flex: 1 }}
              onClick={finish}
              data-testid="confirm-finish-yes"
            >
              {t.exams.finishAnyway}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export function blueprintTitle(blueprintId: string, lang: 'ca' | 'es'): string {
  const bp = pack.blueprints.find((b) => b.blueprintId === blueprintId)
  return bp ? pick(bp.title, lang) : blueprintId
}
