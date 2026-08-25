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
import { officialVerdict } from '../engines/official-evidence.ts'
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
            chosen={chosen}
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
  const today = useToday()
  const t = dict(settings.explanationLang)
  const verdict = officialVerdict(question, epochDayToIso(today))
  const conflict = verdict.notice === 'key-conflict'
  const lawAnswer = verdict.currentLawAnswer

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
            /*
             * En una pregunta on la plantilla del tribunal i la normativa
             * verificada no diuen el mateix, «correcte» i «incorrecte» no
             * signifiquen res: hi ha dues respostes, cada una en el seu marc.
             * Marcar-les amb ✓ i ✕ contradiria el bloc que ve just a sota, i
             * seria l'app dient dues coses oposades a la mateixa pantalla.
             */
            if (conflict && isRight) {
              className += ' option--correct'
              mark = t.study.officialKeyLabel
            } else if (conflict && option.optionId === lawAnswer) {
              className += ' option--selected'
              mark = t.study.lawLabel
            } else if (conflict) {
              // La resta d'opcions no porten marca: cap dels dos marcs les dona.
            } else if (isRight) {
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
              {mark ? (
                <span className={conflict ? 'option__mark option__mark--wide' : 'option__mark'}>{mark}</span>
              ) : null}
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
  chosen,
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
  chosen: OptionId | null
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
  const official = question.officialExam !== undefined
  const today = useToday()
  const verdict = officialVerdict(question, epochDayToIso(today))
  const queues = verdict.canGenerateReview
  const conflict = verdict.notice === 'key-conflict'

  /*
   * En una pregunta on la plantilla i la norma no diuen el mateix, un
   * «Incorrecte» a dalt i un «has triat el que sosté la norma» a sota són dos
   * missatges oposats a la mateixa pantalla. El titular diu llavors només què
   * ha passat respecte de la plantilla, que és un fet, i el detall el donen els
   * blocs de sota.
   */
  const verdictClass = dontKnow
    ? 'verdict verdict--unknown'
    : conflict
      ? 'verdict verdict--unknown'
      : isCorrect
        ? 'verdict verdict--ok'
        : 'verdict verdict--wrong'
  const verdictText = dontKnow
    ? t.study.unknown
    : conflict
      ? isCorrect
        ? t.study.verdictByKeyMatch
        : t.study.verdictByKeyMiss
      : isCorrect
        ? t.study.correct
        : t.study.wrong

  return (
    <section className="stack fade-up" data-testid="correction">
      {/* El resultat no es comunica només amb color: hi ha símbol i text. */}
      <p className={verdictClass} role="status">
        <span aria-hidden="true">{dontKnow ? '?' : conflict ? '≠' : isCorrect ? '✓' : '✕'}</span>
        {verdictText}
      </p>

      {official ? <OfficialStatus question={question} chosen={chosen} lang={lang} /> : null}

      <div className="card">
        <div className="card__label">{t.study.why}</div>
        <p style={{ marginTop: 'var(--sp-2)', lineHeight: 1.6 }}>{pick(question.explanation, lang)}</p>
      </div>

      {official ? <OfficialLawToday question={question} lang={lang} /> : null}

      {/*
       * Nota tècnica de transcripció, quan n'hi ha. És una altra cosa que
       * l'estat jurídic: aquí hi van les correccions d'extracció del quadernet.
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

      {/*
       * Prometre un repàs que no es programarà seria mentir sobre el que farà
       * l'app demà. Les preguntes que no poden entrar a la cua no en porten.
       */}
      {queues ? (
        <p className="notice">
          {nextInterval === 1 ? t.study.scheduledOne : fill(t.study.scheduled, { n: nextInterval })}
        </p>
      ) : null}

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

/**
 * Estat jurídic d'una pregunta d'examen oficial, abans de l'explicació.
 *
 * L'ordre importa. Qui acaba de respondre vol saber, per aquest ordre: de quin
 * examen era, què va marcar el tribunal, i si això segueix sent dret. Posar
 * l'avís al final —on estava— feia que la persona memoritzés la resposta i
 * llegís l'advertència després, si la llegia.
 *
 * Les dues veritats van amb etiqueta pròpia i separada: «Plantilla del
 * tribunal» i «Normativa verificada». Mai un segon missatge d'«incorrecte» que
 * contradigui el primer.
 */
function OfficialStatus({
  question,
  chosen,
  lang,
}: {
  question: Question
  chosen: OptionId | null
  lang: 'ca' | 'es'
}): ReactNode {
  const t = dict(lang)
  const today = useToday()
  const verdict = officialVerdict(question, epochDayToIso(today))
  const meta = question.officialExam!
  const exam = pack.exams.find((e) => e.examId === meta.examId)

  const noticeText: Record<string, { title: string; body: string } | null> = {
    none: null,
    superseded: { title: t.study.noticeSuperseded, body: t.study.noticeSupersededBody },
    'key-conflict': { title: t.study.noticeConflict, body: t.study.noticeConflictBody },
    pending: { title: t.study.officialNote, body: t.study.noticePending },
    historical: { title: t.study.officialNote, body: t.study.noticeHistorical },
  }
  const notice = noticeText[verdict.notice]
  const conflict = verdict.notice === 'key-conflict'

  return (
    <div className="stack stack--tight" data-testid="official-status">
      {exam ? (
        <p className="source__id" data-testid="official-held">
          {fill(t.study.officialHeld, { date: exam.heldOn ?? '', exam: meta.examId })}
        </p>
      ) : null}

      <div className="card">
        <div className="card__label">{t.study.officialKeyLabel}</div>
        <p style={{ marginTop: 'var(--sp-2)', fontWeight: 600 }} data-testid="official-key">
          {verdict.scoringAnswer}){' '}
          {question.options.find((o) => o.optionId === verdict.scoringAnswer)?.text}
        </p>
        {conflict && verdict.currentLawAnswer ? (
          <>
            <div className="card__label" style={{ marginTop: 'var(--sp-3)' }}>
              {t.study.lawLabel}
            </div>
            <p style={{ marginTop: 'var(--sp-2)', fontWeight: 600 }} data-testid="law-answer">
              {verdict.currentLawAnswer === 'cap'
                ? t.study.lawSaysNone
                : `${verdict.currentLawAnswer}) ${question.options.find((o) => o.optionId === verdict.currentLawAnswer)?.text ?? ''}`}
            </p>
          </>
        ) : null}
      </div>

      {notice ? (
        <div className={conflict ? 'notice notice--warn' : 'notice'} data-testid={`notice-${verdict.notice}`}>
          <strong>{notice.title}</strong>
          <p style={{ margin: 'var(--sp-2) 0 0', lineHeight: 1.6 }}>{notice.body}</p>
        </div>
      ) : null}

      {/*
       * Qui tria l'opció que sosté la norma no s'ha equivocat de dret. Dir-li
       * només «incorrecte» seria ensenyar-li a respondre malament.
       */}
      {conflict && chosen !== null && chosen === verdict.currentLawAnswer ? (
        <div className="notice" data-testid="chose-law">
          {t.study.chosenMatchesLaw}
        </div>
      ) : null}
    </div>
  )
}

/** El dret vigent avui, quan difereix del que deia el dia de l'examen. */
function OfficialLawToday({ question, lang }: { question: Question; lang: 'ca' | 'es' }): ReactNode {
  const t = dict(lang)
  const evidence = question.officialExam?.evidence
  if (!evidence?.lawAtExam && !evidence?.lawToday) return null

  return (
    <div className="card" data-testid="law-today">
      <div className="card__label">{t.study.lawLabel}</div>
      {evidence.lawAtExam ? (
        <p style={{ marginTop: 'var(--sp-2)', lineHeight: 1.6 }}>
          <strong>{t.study.lawAtExamLabel}:</strong> {evidence.lawAtExam}
        </p>
      ) : null}
      {evidence.lawToday ? (
        <p style={{ marginTop: 'var(--sp-2)', lineHeight: 1.6 }}>
          <strong>{t.study.lawTodayLabel}:</strong> {evidence.lawToday}
        </p>
      ) : null}
      {evidence.changedOn ? (
        <p className="source__id" style={{ marginTop: 'var(--sp-2)' }}>
          {fill(t.study.lawChangedOn, { date: evidence.changedOn })}
        </p>
      ) : null}
    </div>
  )
}
