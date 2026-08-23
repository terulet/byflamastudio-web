/** Resultat del simulacre: desglossament, domini per temes i revisió pregunta a pregunta. */
import { useMemo, useState, type ReactNode } from 'react'
import { pack, useActions, useApp } from '../app/store.tsx'
import { navigate } from '../app/router.ts'
import { dict, fill, pick, plural } from '../i18n/index.ts'
import { Stat } from '../components/ui.tsx'
import { formatMilli, scoreExam, type ScoreBreakdown, type ScoredItem } from '../engines/scoring.ts'
import { sectionOffsets } from './ExamRunner.tsx'
import { formatDuration } from '../util/date.ts'
import type { Question } from '../domain/types.ts'

export function ExamResult({ attemptId }: { attemptId: string }): ReactNode {
  const { settings, attempts } = useApp()
  const { sendToReview } = useActions()
  const lang = settings.explanationLang
  const t = dict(lang)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const attempt = attempts.find((a) => a.attemptId === attemptId)
  const composition = pack.compositions.find((c) => c.compositionId === attempt?.compositionId)

  const questionsById = useMemo(() => new Map(pack.questions.map((q) => [q.questionId, q])), [])

  const analysis = useMemo(() => {
    if (!attempt || attempt.sections.length === 0) return null

    const rows = attempt.questionIds.map((id, i) => {
      const question = questionsById.get(id)
      const chosen = attempt.responses[i] ?? null
      return { question, chosen, index: i }
    })

    // Cada prova es puntua amb les seves pròpies regles i es reporta a part.
    const offsets = sectionOffsets(attempt.sections)
    const sections = attempt.sections.map((section, i) => {
      const bp = pack.blueprints.find((b) => b.blueprintId === section.blueprintId)
      const from = offsets[i] ?? 0
      const items: ScoredItem[] = rows.slice(from, from + section.count).map((row) => ({
        chosen: row.chosen,
        correct: row.question?.correct ?? 'a',
      }))
      return {
        section,
        blueprint: bp,
        from,
        breakdown: bp ? scoreExam(items, bp.scoring) : null,
      }
    })

    // El veredicte global exigeix aprovar totes les proves, no fer-ne mitjana.
    const breakdown: ScoreBreakdown = sections.reduce<ScoreBreakdown>(
      (acc, part) => {
        const b = part.breakdown
        if (!b) return acc
        return {
          counted: acc.counted + b.counted,
          correct: acc.correct + b.correct,
          wrong: acc.wrong + b.wrong,
          blank: acc.blank + b.blank,
          reserved: acc.reserved + b.reserved,
          annulled: acc.annulled + b.annulled,
          rawMilli: acc.rawMilli + b.rawMilli,
          penaltyMilli: acc.penaltyMilli + b.penaltyMilli,
          scoreMilli: acc.scoreMilli + b.scoreMilli,
          displayMilli: acc.displayMilli + b.displayMilli,
          maxScoreMilli: acc.maxScoreMilli + b.maxScoreMilli,
          passMarkMilli: acc.passMarkMilli + b.passMarkMilli,
          passed: acc.passed && b.passed,
        }
      },
      {
        counted: 0, correct: 0, wrong: 0, blank: 0, reserved: 0, annulled: 0,
        rawMilli: 0, penaltyMilli: 0, scoreMilli: 0, displayMilli: 0,
        maxScoreMilli: 0, passMarkMilli: 0, passed: true,
      },
    )

    const byTopic = new Map<string, { correct: number; total: number }>()
    for (const row of rows) {
      if (!row.question) continue
      const bucket = byTopic.get(row.question.topicId) ?? { correct: 0, total: 0 }
      bucket.total++
      if (row.chosen === row.question.correct) bucket.correct++
      byTopic.set(row.question.topicId, bucket)
    }

    const wrongIds = rows
      .filter((row) => row.question && row.chosen !== null && row.chosen !== row.question.correct)
      .map((row) => row.question!.questionId)

    return { rows, breakdown, byTopic, wrongIds, sections }
  }, [attempt, questionsById])

  if (!attempt || !analysis) {
    return (
      <main className="screen">
        <p className="empty">{t.common.loading}</p>
      </main>
    )
  }

  const { breakdown, rows, byTopic, wrongIds, sections } = analysis
  const isMultiSection = sections.length > 1
  const title = composition
    ? pick(composition.title, lang)
    : sections[0]?.blueprint
      ? pick(sections[0]!.blueprint!.title, lang)
      : t.exams.title

  return (
    <main className="screen" data-testid="exam-result">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => navigate({ name: 'exams' })}
        style={{ marginBottom: 'var(--sp-3)' }}
      >
        ← {t.exams.title}
      </button>

      <div className="stack stack--loose">
        {/*
          Amb dues proves no es mostra cap suma: sumar 20 + 20 convidaria a
          llegir-ho com una mitjana, i a l'examen real cada prova s'aprova per
          separat. Es mostren les dues notes i el veredicte.
        */}
        <section className="score">
          <div className="card__label">{title}</div>

          {isMultiSection ? (
            <div
              className="row"
              style={{ justifyContent: 'center', gap: 'var(--sp-5)', marginTop: 'var(--sp-4)' }}
              data-testid="exam-score"
            >
              {sections.map((part, i) => (
                <div key={i}>
                  <div
                    className={`score__value ${part.breakdown?.passed ? 'score__value--pass' : 'score__value--fail'}`}
                    style={{ fontSize: '2.25rem' }}
                  >
                    {formatMilli(part.breakdown?.displayMilli ?? 0, lang)}
                    <span className="score__max" style={{ fontSize: 'var(--text-md)' }}>
                      {' '}/ 20
                    </span>
                  </div>
                  <div className="stat__label">
                    {part.blueprint?.track === 'cultura-general' ? t.exams.cultura : t.exams.professional}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`score__value ${breakdown.passed ? 'score__value--pass' : 'score__value--fail'}`}
              style={{ marginTop: 'var(--sp-3)' }}
              data-testid="exam-score"
            >
              {formatMilli(breakdown.displayMilli, lang)}
              <span className="score__max"> / {formatMilli(breakdown.maxScoreMilli, lang)}</span>
            </div>
          )}

          <p style={{ marginTop: 'var(--sp-3)' }}>
            <span className={breakdown.passed ? 'pill pill--ok' : 'pill pill--danger'} data-testid="exam-verdict">
              {breakdown.passed ? t.result.passed : t.result.failed}
            </span>
          </p>
          {isMultiSection ? (
            <p className="screen__subtitle" style={{ marginTop: 'var(--sp-2)' }}>
              {t.exams.completeVerdictNote}
            </p>
          ) : null}
        </section>

        <section className="stats">
          <Stat value={breakdown.correct} label={t.study.correctCount} />
          <Stat value={breakdown.wrong} label={t.study.wrongCount} />
          <Stat value={breakdown.blank} label={t.exams.blank} />
          <Stat
            value={formatDuration(attempt.elapsedMsAtPause, lang)}
            label={t.result.time}
          />
        </section>

        {isMultiSection ? (
          <section className="stack" data-testid="section-results">
            <h2 className="section-title">{t.exams.sectionResults}</h2>
            {sections.map((part, i) => (
              <article key={i} className="card card--flat">
                <div className="row row--between">
                  <span style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                    {part.blueprint ? pick(part.blueprint.title, lang) : part.section.blueprintId}
                  </span>
                  <span
                    className={part.breakdown?.passed ? 'pill pill--ok' : 'pill pill--danger'}
                    data-testid={`section-score-${i}`}
                  >
                    {formatMilli(part.breakdown?.displayMilli ?? 0, lang)} / 20
                  </span>
                </div>
                <div className="card__body">
                  {part.breakdown?.correct ?? 0}{' '}
                  {plural(part.breakdown?.correct ?? 0, t.study.correctCountOne, t.study.correctCountMany)} ·{' '}
                  {part.breakdown?.wrong ?? 0}{' '}
                  {plural(part.breakdown?.wrong ?? 0, t.study.wrongCountOne, t.study.wrongCountMany)} ·{' '}
                  {part.breakdown?.blank ?? 0} {t.exams.blank} ·{' '}
                  {formatDuration(part.section.elapsedMs, lang)}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <section className="card">
          <h2 className="section-title">{t.exams.rules}</h2>
          <dl className="stack stack--tight" style={{ fontSize: 'var(--text-sm)' }}>
            <div className="row row--between">
              <dt style={{ color: 'var(--text-muted)' }}>{t.result.raw}</dt>
              <dd style={{ margin: 0, fontWeight: 650 }}>+{formatMilli(breakdown.rawMilli, lang)}</dd>
            </div>
            <div className="row row--between">
              <dt style={{ color: 'var(--text-muted)' }}>{t.result.penalty}</dt>
              <dd style={{ margin: 0, fontWeight: 650, color: 'var(--danger)' }}>
                −{formatMilli(breakdown.penaltyMilli, lang)}
              </dd>
            </div>
            <div
              className="row row--between"
              style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--sp-2)' }}
            >
              <dt style={{ fontWeight: 650 }}>{t.result.net}</dt>
              <dd style={{ margin: 0, fontWeight: 700 }} data-testid="exam-net">
                {formatMilli(breakdown.scoreMilli, lang)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="stack">
          <h2 className="section-title">{t.result.byTopic}</h2>
          <div className="stack stack--tight">
            {[...byTopic.entries()]
              .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
              .map(([topicId, bucket]) => {
                const topic = pack.syllabus.topics.find((x) => x.topicId === topicId)
                const ratio = bucket.correct / bucket.total
                return (
                  <div key={topicId} className="row row--between" style={{ fontSize: 'var(--text-sm)' }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      {topic ? `${topic.number}. ${pick(topic.title, lang)}` : topicId}
                    </span>
                    <span
                      className={
                        ratio >= 0.7 ? 'pill pill--ok' : ratio >= 0.4 ? 'pill pill--warn' : 'pill pill--danger'
                      }
                    >
                      {bucket.correct}/{bucket.total}
                    </span>
                  </div>
                )
              })}
          </div>
        </section>

        {wrongIds.length > 0 ? (
          <button
            type="button"
            className="btn btn--block"
            onClick={() => {
              sendToReview(wrongIds)
              setSentCount(wrongIds.length)
            }}
            disabled={sentCount !== null}
            data-testid="send-errors-review"
          >
            {sentCount !== null
              ? fill(t.result.errorsSent, { n: sentCount })
              : t.result.sendErrorsToReview}
          </button>
        ) : null}

        <section className="stack">
          <h2 className="section-title">{t.result.review}</h2>
          <div className="stack stack--tight">
            {rows.map((row) => {
              if (!row.question) return null
              const isOpen = openIndex === row.index
              const isCorrect = row.chosen === row.question.correct
              const isBlank = row.chosen === null
              return (
                <div key={row.question.questionId} className="card card--flat">
                  <button
                    type="button"
                    className="row row--between"
                    style={{ width: '100%', background: 'none', border: 0, padding: 0, textAlign: 'left' }}
                    onClick={() => setOpenIndex(isOpen ? null : row.index)}
                    aria-expanded={isOpen}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      {row.index + 1}. {row.question.stem}
                    </span>
                    <span
                      className={
                        isBlank ? 'pill' : isCorrect ? 'pill pill--ok' : 'pill pill--danger'
                      }
                    >
                      {isBlank ? '–' : isCorrect ? '✓' : '✕'}
                    </span>
                  </button>

                  {isOpen ? (
                    <ReviewDetail question={row.question} chosen={row.chosen} lang={lang} />
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

function ReviewDetail({
  question,
  chosen,
  lang,
}: {
  question: Question
  chosen: 'a' | 'b' | 'c' | 'd' | null
  lang: 'ca' | 'es'
}): ReactNode {
  const t = dict(lang)
  return (
    <div className="stack stack--tight" style={{ marginTop: 'var(--sp-3)' }}>
      <div className="options">
        {question.options.map((option, i) => {
          const isRight = option.optionId === question.correct
          const isChosen = option.optionId === chosen
          let className = 'option'
          if (isRight) className += ' option--correct'
          else if (isChosen) className += ' option--wrong'
          return (
            <div key={option.optionId} className={className}>
              <span className="option__letter" aria-hidden="true">
                {String.fromCharCode(97 + i)}
              </span>
              <span lang="ca">
                {option.text}
                {!isRight && option.whyWrong ? (
                  <span className="option__why">{option.whyWrong}</span>
                ) : null}
              </span>
              {isRight ? (
                <span className="option__mark">✓ {t.result.correctAnswer}</span>
              ) : isChosen ? (
                <span className="option__mark">✕ {t.result.yourAnswer}</span>
              ) : null}
            </div>
          )
        })}
      </div>

      {chosen === null ? <p className="notice">{t.result.leftBlank}</p> : null}

      <div className="card">
        <div className="card__label">{t.study.why}</div>
        <p style={{ marginTop: 'var(--sp-2)' }}>{pick(question.explanation, lang)}</p>
      </div>

      {question.references.map((reference, i) => {
        const source = pack.sources.find((s) => s.sourceId === reference.sourceId)
        return (
          <div key={i} className="source">
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>
              {source?.title ?? reference.sourceId}
            </div>
            <div>{reference.locator}</div>
          </div>
        )
      })}
    </div>
  )
}
