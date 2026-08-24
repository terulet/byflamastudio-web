/**
 * Sessió d'estudi.
 *
 * El bucle és: pregunta → resposta (o "No ho sé") → nivell de seguretat →
 * correcció raonada amb font → programació del proper repàs. La correcció és
 * immediata, a diferència del mode simulacre.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { pack, useActions, useApp, XP_BY_OUTCOME } from '../app/store.tsx'
import { useActiveQuestions, useToday } from '../app/selectors.ts'
import { navigate, type StudyRouteFilters } from '../app/router.ts'
import { dict, fill, pick } from '../i18n/index.ts'
import { Meter } from '../components/ui.tsx'
import { selectSession } from '../engines/selection.ts'
import { applyOutcome, getOrInit, intervalDays, outcomeFor } from '../engines/srs.ts'
import { playCorrect, playWrong, vibrate } from '../app/feedback.ts'
import { epochDayToIso } from '../util/date.ts'
import type { Confidence, OptionId, Outcome, Question, StudyMode } from '../domain/types.ts'

const VALID_MODES: StudyMode[] = [
  'no-tinc-ganes', 'sessio-expres', 'missio-del-dia', 'patrulla',
  'per-tema', 'errors', 'repassos', 'preguntes-noves',
]

function isMode(value: string): value is StudyMode {
  return (VALID_MODES as string[]).includes(value)
}

interface Tally {
  correct: number
  wrong: number
  dontKnow: number
  xp: number
}

/**
 * Data del quadernet d'on surt una pregunta oficial, en format DD/MM/AAAA.
 *
 * Es pren del registre d'exàmens, que és on viu la data oficial; si no hi fos,
 * de la referència, que porta el mateix dia com a `validAt`.
 */
function examDateOf(question: Question): string {
  const examId = question.officialExam?.examId
  const iso =
    pack.exams.find((e) => e.examId === examId)?.heldOn ?? question.references[0]?.validAt ?? ''
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

export function StudyRunner({
  mode,
  topicIds,
  filters,
}: {
  mode: string
  topicIds?: string[]
  filters?: StudyRouteFilters
}): ReactNode {
  const { settings, reviews } = useApp()
  const { recordAnswer, toggleFlag, saveSession } = useActions()
  const lang = settings.explanationLang
  const t = dict(lang)
  const active = useActiveQuestions()
  const today = useToday()

  const studyMode: StudyMode = isMode(mode) ? mode : 'missio-del-dia'

  // La selecció es congela en muntar: si canviés a cada resposta, la sessió
  // es reordenaria sota els peus de qui l'està fent.
  const sessionId = useRef(`s-${Date.now()}`)
  const questions = useMemo(
    () =>
      selectSession({
        todayIso: epochDayToIso(today),
        mode: studyMode,
        pool: active,
        reviews,
        today,
        ...(topicIds && topicIds.length > 0 ? { topicIds } : {}),
        ...(filters ? { filters } : {}),
        seed: sessionId.current,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- congelat a propòsit
    [],
  )

  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<OptionId | null>(null)
  const [confidence, setConfidence] = useState<Confidence | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [dontKnow, setDontKnow] = useState(false)
  const [tally, setTally] = useState<Tally>({ correct: 0, wrong: 0, dontKnow: 0, xp: 0 })
  const [done, setDone] = useState(false)
  const startedAt = useRef(Date.now())
  const questionStart = useRef(Date.now())
  const [missedIds, setMissedIds] = useState<string[]>([])

  const question = questions[index]
  const total = questions.length

  const reveal = useCallback(
    (answer: OptionId | null, unknown: boolean) => {
      if (!question || revealed) return
      const isCorrect = !unknown && answer === question.correct
      const outcome: Outcome = outcomeFor(isCorrect, unknown, confidence)
      const msSpent = Date.now() - questionStart.current

      recordAnswer({
        question,
        outcome,
        chosen: unknown ? null : answer,
        msSpent,
        confidence: unknown ? null : confidence,
      })
      setRevealed(true)
      if (!isCorrect) setMissedIds((current) => [...current, question.questionId])
      setTally((current) => ({
        correct: current.correct + (isCorrect ? 1 : 0),
        wrong: current.wrong + (!isCorrect && !unknown ? 1 : 0),
        dontKnow: current.dontKnow + (unknown ? 1 : 0),
        xp: current.xp + XP_BY_OUTCOME[outcome],
      }))

      if (isCorrect) {
        playCorrect(settings.sound)
        vibrate(settings.haptics, 12)
      } else {
        playWrong(settings.sound)
        vibrate(settings.haptics, [10, 40, 10])
      }
    },
    [question, revealed, confidence, recordAnswer, settings.sound, settings.haptics],
  )

  const goNext = useCallback(() => {
    if (index + 1 >= total) {
      saveSession({
        sessionId: sessionId.current,
        mode: studyMode,
        topicIds: topicIds ?? [],
        questionIds: questions.map((q) => q.questionId),
        answers: [],
        startedAt: startedAt.current,
        finishedAt: Date.now(),
        xpEarned: tally.xp,
      })
      setDone(true)
      return
    }
    setIndex((i) => i + 1)
    setChosen(null)
    setConfidence(null)
    setRevealed(false)
    setDontKnow(false)
    questionStart.current = Date.now()
  }, [index, total, questions, saveSession, studyMode, topicIds, tally.xp])

  // Atallar amb el teclat: 1-4 tria opció, Enter comprova o avança.
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (done || !question) return
      if (event.key === 'Enter') {
        if (revealed) goNext()
        else if (chosen) reveal(chosen, false)
        return
      }
      const n = Number(event.key)
      if (!revealed && n >= 1 && n <= 4) {
        setChosen((['a', 'b', 'c', 'd'] as const)[n - 1]!)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, question, revealed, chosen, reveal, goNext])

  if (total === 0) {
    return (
      <main className="screen screen--full">
        <p className="empty">{t.train.noQuestions}</p>
        <button type="button" className="btn btn--block" onClick={() => navigate({ name: 'train' })}>
          {t.common.back}
        </button>
      </main>
    )
  }

  if (done) {
    const dueTomorrow = missedIds.filter(
      (id) => reviews.get(id)?.dueDay === today + 1,
    ).length
    return (
      <SessionSummary
        tally={tally}
        total={total}
        lang={lang}
        missedCount={missedIds.length}
        dueTomorrow={dueTomorrow}
      />
    )
  }

  if (!question) return null

  const state = getOrInit(reviews, question.questionId)
  const isCorrect = !dontKnow && chosen === question.correct
  const nextInterval = revealed
    ? intervalDays(
        applyOutcome(state, outcomeFor(isCorrect, dontKnow, confidence), today).intervalStep,
      )
    : 0

  return (
    <main className="screen screen--full" data-testid="study">
      <div className="exam-bar">
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => navigate({ name: 'home' })}
          aria-label={t.common.close}
        >
          ✕
        </button>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 650 }} data-testid="study-progress">
          {index + 1} {t.common.of} {total}
        </span>
        <span className="pill">{t.train.modes[studyMode]}</span>
      </div>

      <Meter value={index + (revealed ? 1 : 0)} max={total} label={t.train.title} />

      <div className="stack" style={{ marginTop: 'var(--sp-5)' }}>
        <QuestionView
          question={question}
          chosen={chosen}
          revealed={revealed}
          dontKnow={dontKnow}
          onChoose={setChosen}
        />

        {!revealed ? (
          <>
            <div className="field">
              <span className="field__label">{t.study.confidence}</span>
              <div className="choice-group">
                {(['unsure', 'sure'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    className="choice"
                    aria-pressed={confidence === level}
                    onClick={() => setConfidence(level)}
                    data-testid={`confidence-${level}`}
                  >
                    {level === 'unsure' ? t.study.unsure : t.study.sure}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary btn--lg btn--block"
              disabled={chosen === null}
              onClick={() => reveal(chosen, false)}
              data-testid="check-answer"
            >
              {t.study.check}
            </button>

            <button
              type="button"
              className="btn btn--block"
              onClick={() => {
                setDontKnow(true)
                setChosen(null)
                reveal(null, true)
              }}
              data-testid="dont-know"
            >
              {t.study.dontKnow}
            </button>
          </>
        ) : (
          <Correction
            question={question}
            isCorrect={isCorrect}
            dontKnow={dontKnow}
            nextInterval={nextInterval}
            lang={lang}
            flagged={getOrInit(reviews, question.questionId).flagged}
            onFlag={() => toggleFlag(question.questionId)}
            onNext={goNext}
            isLast={index + 1 >= total}
          />
        )}
      </div>
    </main>
  )
}

/* ---------------- Pregunta ---------------- */

function QuestionView({
  question,
  chosen,
  revealed,
  dontKnow,
  onChoose,
}: {
  question: Question
  chosen: OptionId | null
  revealed: boolean
  dontKnow: boolean
  onChoose: (id: OptionId) => void
}): ReactNode {
  const { settings } = useApp()
  const t = dict(settings.explanationLang)

  return (
    <section
      className="stack fade-up"
      key={question.questionId}
      data-testid="study-question"
      data-question-id={question.questionId}
    >
      {/* L'enunciat sempre en català: és la llengua de l'examen. */}
      {/*
       * Una pregunta d'examen oficial es llegeix amb la seva data al davant.
       * «Qui és l'actual regidor/a?» vol dir una cosa el dia de l'examen i una
       * altra avui: sense la data, l'app estaria afirmant el present.
       */}
      {question.officialExam ? (
        <p className="pill pill--accent" style={{ alignSelf: 'flex-start' }} data-testid="official-badge">
          {fill(t.study.officialFrom, { date: examDateOf(question) })}
        </p>
      ) : null}

      <h2 className="question__stem" lang="ca">
        {question.stem}
      </h2>

      <fieldset className="options">
        <legend className="visually-hidden">{question.stem}</legend>
        {question.options.map((option, i) => {
          const isChosen = chosen === option.optionId
          const isRight = option.optionId === question.correct
          let className = 'option'
          let mark: string | null = null

          if (revealed) {
            if (isRight) {
              className += ' option--correct'
              mark = `✓ ${t.study.correct}`
            } else if (isChosen) {
              className += ' option--wrong'
              mark = `✕ ${t.study.wrong}`
            }
          } else if (isChosen) {
            className += ' option--selected'
          }

          return (
            <button
              key={option.optionId}
              type="button"
              className={className}
              disabled={revealed}
              aria-pressed={isChosen}
              onClick={() => onChoose(option.optionId)}
              data-testid={`option-${option.optionId}`}
            >
              <span className="option__letter" aria-hidden="true">
                {String.fromCharCode(97 + i)}
              </span>
              <span lang="ca">
                {option.text}
                {revealed && !isRight && option.whyWrong ? (
                  <span className="option__why">{option.whyWrong}</span>
                ) : null}
              </span>
              {mark ? <span className="option__mark">{mark}</span> : null}
            </button>
          )
        })}
      </fieldset>

    </section>
  )
}

/* ---------------- Correcció ---------------- */

function Correction({
  question,
  isCorrect,
  dontKnow,
  nextInterval,
  lang,
  flagged,
  onFlag,
  onNext,
  isLast,
}: {
  question: Question
  isCorrect: boolean
  dontKnow: boolean
  nextInterval: number
  lang: 'ca' | 'es'
  flagged: boolean
  onFlag: () => void
  onNext: () => void
  isLast: boolean
}): ReactNode {
  const t = dict(lang)
  const verdictClass = dontKnow ? 'verdict verdict--unknown' : isCorrect ? 'verdict verdict--ok' : 'verdict verdict--wrong'
  const verdictText = dontKnow ? t.study.unknown : isCorrect ? t.study.correct : t.study.wrong

  return (
    <section className="stack fade-up" data-testid="correction">
      {/* El resultat no es comunica només amb color: hi ha símbol i text. */}
      <p className={verdictClass} role="status">
        <span aria-hidden="true">{dontKnow ? '?' : isCorrect ? '✓' : '✕'}</span>
        {verdictText}
      </p>

      <div className="card">
        <div className="card__label">{t.study.why}</div>
        <p style={{ marginTop: 'var(--sp-2)', lineHeight: 1.6 }}>{pick(question.explanation, lang)}</p>
      </div>

      {/*
       * Avís de revisió d'una pregunta d'examen oficial.
       *
       * La resposta del tribunal es conserva sempre tal com es va publicar,
       * però de vegades la norma ha canviat després de l'examen. Callar-ho
       * seria ensenyar com a vigent una redacció derogada, que és pitjor que
       * no oferir la pregunta.
       */}
      {question.officialExam?.transcriptionNotes ? (
        <div className="notice notice--warn" data-testid="official-note">
          <strong>{t.study.officialNote}</strong>
          <p style={{ margin: 'var(--sp-2) 0 0', lineHeight: 1.6 }}>
            {question.officialExam.transcriptionNotes}
          </p>
        </div>
      ) : null}

      <div className="stack stack--tight">
        <div className="card__label">{t.study.source}</div>
        {question.references.map((reference, i) => {
          const source = pack.sources.find((s) => s.sourceId === reference.sourceId)
          return (
            <div key={i} className="source">
              <div style={{ color: 'var(--text)', fontWeight: 600 }}>
                {source?.title ?? reference.sourceId}
              </div>
              <div>{reference.locator}</div>
              {source ? (
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.issuer}
                </a>
              ) : null}
              {reference.reviewStatus === 'pending-source-verification' ? (
                <div className="source__id" style={{ marginTop: 4 }}>
                  ⚠ {t.study.pendingVerification}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <p className="notice">
        {nextInterval === 1 ? t.study.scheduledOne : fill(t.study.scheduled, { n: nextInterval })}
      </p>

      <div className="row">
        <button
          type="button"
          className="btn btn--sm"
          onClick={onFlag}
          aria-pressed={flagged}
          data-testid="review-later"
        >
          {flagged ? `★ ${t.study.reviewLaterDone}` : `☆ ${t.study.reviewLater}`}
        </button>
      </div>

      <button
        type="button"
        className="btn btn--primary btn--lg btn--block"
        onClick={onNext}
        data-testid="next-question"
      >
        {isLast ? t.study.finishSession : t.study.nextQuestion}
      </button>
    </section>
  )
}

/* ---------------- Resum ---------------- */

function SessionSummary({
  tally,
  total,
  lang,
  missedCount,
  dueTomorrow,
}: {
  tally: Tally
  total: number
  lang: 'ca' | 'es'
  missedCount: number
  dueTomorrow: number
}): ReactNode {
  const t = dict(lang)
  return (
    <main className="screen screen--full" data-testid="session-summary">
      <div className="stack stack--loose" style={{ paddingTop: 'var(--sp-6)' }}>
        <div className="score">
          <div className="card__label">{t.study.sessionDone}</div>
          <div className="score__value score__value--pass" style={{ marginTop: 'var(--sp-3)' }}>
            {tally.correct}
            <span className="score__max"> / {total}</span>
          </div>
        </div>

        <div className="stats">
          <Stat value={tally.correct} label={t.study.correctCount} />
          <Stat value={tally.wrong} label={t.study.wrongCount} />
          <Stat value={tally.dontKnow} label={t.study.unknownCount} />
          <Stat value={`+${tally.xp}`} label={t.study.xpEarned} />
        </div>

        {/*
          * El que un resum ha de dir a qui acaba de fallar: què passa ara amb
          * allò que ha fallat. La resposta honesta és la de l'SRS: ja és a la
          * cua, i si torna demà, aquí diu quantes l'esperen.
          */}
        {missedCount > 0 ? (
          <p className="notice" data-testid="summary-review-note">
            {dueTomorrow > 0
              ? fill(t.study.missedDueTomorrow, { n: missedCount, m: dueTomorrow })
              : fill(t.study.missedScheduled, { n: missedCount })}
          </p>
        ) : null}

        {missedCount > 0 ? (
          <button
            type="button"
            className="btn btn--lg btn--block"
            onClick={() => navigate({ name: 'study', mode: 'errors' })}
            data-testid="summary-retry-errors"
          >
            {t.study.retryErrorsNow}
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={() => navigate({ name: 'home' })}
        >
          {t.study.backHome}
        </button>
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: ReactNode; label: string }): ReactNode {
  return (
    <div className="stat">
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}
