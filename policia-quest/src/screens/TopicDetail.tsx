/** Detall d'un tema: la microlliçó completa i l'accés a practicar-lo. */
import { useEffect, useState, type ReactNode } from 'react'
import { pack, useApp } from '../app/store.tsx'
import { loadLesson } from '../content/index.ts'
import { useDashboard } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, fill, pick } from '../i18n/index.ts'
import { Emphasised, Meter } from '../components/ui.tsx'
import type { Lesson, LessonCard } from '../domain/types.ts'

export function TopicDetail({ topicId }: { topicId: string }): ReactNode {
  const { settings } = useApp()
  const lang = settings.explanationLang
  const t = dict(lang)
  const dash = useDashboard()

  const topic = pack.syllabus.topics.find((x) => x.topicId === topicId)
  const mastery = dash.masteryByTopic.get(topicId)

  // Les microlliçons viuen en un paquet a part: no carreguen fins que cal.
  const [lesson, setLesson] = useState<Lesson | null>(null)
  useEffect(() => {
    let cancelled = false
    void loadLesson(topicId).then((result) => {
      if (!cancelled) setLesson(result)
    })
    return () => {
      cancelled = true
    }
  }, [topicId])

  if (!topic) {
    return (
      <main className="screen">
        <p className="empty">{t.common.loading}</p>
      </main>
    )
  }

  const sources = pack.sources.filter((s) => topic.primarySourceIds.includes(s.sourceId))

  return (
    <main className="screen" data-testid="topic-detail">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => navigate({ name: 'route' })}
        style={{ marginBottom: 'var(--sp-3)' }}
      >
        ← {t.route.title}
      </button>

      <header className="screen__header">
        <span className="pill pill--accent">
          {t.common.topic} {topic.number}
        </span>
        <h1 className="screen__title" style={{ marginTop: 'var(--sp-2)' }}>
          {pick(topic.title, lang)}
        </h1>
        <p className="screen__subtitle">{pick(topic.scope, lang)}</p>
        {topic.number2025 !== topic.number ? (
          <p className="screen__subtitle" style={{ marginTop: 'var(--sp-2)' }}>
            <span className="pill pill--warn">
              {fill(t.route.equivalence, { n: topic.number2025 })}
            </span>
          </p>
        ) : null}
      </header>

      <div className="stack stack--loose">
        {mastery ? (
          <section className="card">
            <div className="row row--between" style={{ marginBottom: 'var(--sp-2)' }}>
              <span className="card__label">{t.progress.topicMastery}</span>
              <span style={{ fontWeight: 650 }}>
                {mastery.mastery === null ? t.route.noData : `${mastery.mastery}%`}
              </span>
            </div>
            <Meter
              value={mastery.mastery ?? 0}
              tone={mastery.band === 'alt' ? 'ok' : mastery.band === 'mitja' ? 'warn' : 'danger'}
              label={t.progress.globalMastery}
            />
            <div className="card__body">
              {mastery.seen}/{mastery.total} {t.route.practiced}
              {mastery.due > 0 ? ` · ${mastery.due} ${t.home.dueReviews.toLowerCase()}` : ''}
            </div>
          </section>
        ) : null}

        {lesson ? (
          <section className="stack">
            <div className="row row--between">
              <h2 className="section-title" style={{ marginBottom: 0 }}>
                {t.route.readLesson}
              </h2>
              <span className="pill">
                {lesson.minutes} min
              </span>
            </div>
            {lesson.cards.map((card: LessonCard, i: number) => (
              <LessonCardView key={i} card={card} lang={lang} />
            ))}
          </section>
        ) : null}

        <button
          type="button"
          className="btn btn--primary btn--lg btn--block"
          onClick={() => navigate({ name: 'study', mode: 'per-tema', topicIds: [topicId] })}
          data-testid="practice-topic"
        >
          {t.route.practiceTopic}
        </button>

        <section>
          <h2 className="section-title">{t.study.source}</h2>
          <div className="stack stack--tight">
            {sources.map((source) => (
              <div key={source.sourceId} className="source">
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{source.title}</div>
                <div className="source__id">{source.issuer}</div>
                <a href={source.url} target="_blank" rel="noreferrer noopener">
                  {source.url}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function LessonCardView({ card, lang }: { card: LessonCard; lang: 'ca' | 'es' }): ReactNode {
  if (card.kind === 'compare') {
    return (
      <div className="lesson-card">
        <div className="lesson-card__title">{pick(card.title, lang)}</div>
        <div className="table-scroll">
          <table className="compare">
            <thead>
              <tr>
                <th />
                <th>{pick(card.leftHeader, lang)}</th>
                <th>{pick(card.rightHeader, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {card.rows.map((row, i) => (
                <tr key={i}>
                  <td>{pick(row.label, lang)}</td>
                  <td>{pick(row.left, lang)}</td>
                  <td>{pick(row.right, lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (card.kind === 'checkpoint') {
    return (
      <details className="lesson-card lesson-card--checkpoint">
        <summary style={{ cursor: 'pointer', minHeight: 'var(--tap)', display: 'flex', alignItems: 'center' }}>
          <span>
            <span className="lesson-card__title" style={{ marginBottom: 2 }}>
              {pick(card.title, lang)}
            </span>
            <span className="lesson-card__body">{pick(card.prompt, lang)}</span>
          </span>
        </summary>
        <p className="lesson-card__body" style={{ marginTop: 'var(--sp-3)', color: 'var(--ok)' }}>
          {pick(card.answer, lang)}
        </p>
      </details>
    )
  }

  return (
    <div className={`lesson-card lesson-card--${card.kind}`}>
      <div className="lesson-card__title">{pick(card.title, lang)}</div>
      <p className="lesson-card__body">
        <Emphasised text={pick(card.body, lang)} />
      </p>
    </div>
  )
}
