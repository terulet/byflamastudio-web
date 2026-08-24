/** Entrenar: tots els modes i els filtres del banc. */
import { useMemo, useState, type ReactNode } from 'react'
import { pack, useApp } from '../app/store.tsx'
import { useActiveQuestions, useDashboard, useToday } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict } from '../i18n/index.ts'
import { ScreenHeader } from '../components/ui.tsx'
import { MODE_SIZE, selectSession, type SessionFilters } from '../engines/selection.ts'
import type { BlockId, StudyMode } from '../domain/types.ts'
import { epochDayToIso } from '../util/date.ts'

const MODES: StudyMode[] = [
  'no-tinc-ganes',
  'sessio-expres',
  'missio-del-dia',
  'patrulla',
  'errors',
  'repassos',
  'preguntes-noves',
]

const BLOCKS: BlockId[] = [
  'institucions',
  'seguretat-i-penal',
  'roses-transit-convivencia',
  'actuacio-i-proteccio',
]

export function Train(): ReactNode {
  const { settings, reviews } = useApp()
  const t = dict(settings.explanationLang)
  const dash = useDashboard()
  const active = useActiveQuestions()
  const today = useToday()

  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [block, setBlock] = useState<BlockId | 'all'>('all')
  const [difficulty, setDifficulty] = useState<'facil' | 'mitjana' | 'dificil' | 'all'>('all')
  const [origin, setOrigin] = useState<'authored' | 'official' | 'all'>('all')
  const [state, setState] = useState<'new' | 'failed' | 'due' | 'all'>('all')

  /** Els filtres triats, en la forma que espera el motor de selecció. */
  const filters = useMemo<SessionFilters>(
    () => ({
      ...(difficulty === 'all' ? {} : { difficulty }),
      ...(origin === 'all' ? {} : { origin }),
      ...(origin === 'official' ? { onlyOfficialExam: true } : {}),
      ...(state === 'all' ? {} : { state }),
    }),
    [difficulty, origin, state],
  )

  /** Hi ha alguna pregunta d'examen oficial importada al banc? */
  const hasOfficialQuestions = useMemo(
    () => active.some((q) => q.origin === 'official'),
    [active],
  )

  const topicsInBlock = useMemo(
    () =>
      [...pack.syllabus.topics]
        .filter((x) => block === 'all' || x.block === block)
        .sort((a, b) => a.number - b.number),
    [block],
  )

  /** Quantes preguntes retornaria cada mode ara mateix. */
  const counts = useMemo(() => {
    const map = new Map<StudyMode, number>()
    for (const mode of MODES) {
      map.set(
        mode,
        selectSession({ mode, pool: active, reviews, today, todayIso: epochDayToIso(today), seed: 'preview' }).length,
      )
    }
    return map
  }, [active, reviews, today])

  /*
   * Amb el filtre «D'examen oficial», la selecció de temes s'ignora: aquestes
   * preguntes viuen al tema contenidor dels quadernets, que no és al selector,
   * i exigir un tema faria que el botó digués «0 disponibles» per sempre. La
   * nota sota el filtre ho explica.
   */
  const officialDrill = origin === 'official'
  const topicPool = useMemo(() => {
    if (!officialDrill && selectedTopics.length === 0) return 0
    return selectSession({
      todayIso: epochDayToIso(today),
      mode: 'per-tema',
      pool: active,
      reviews,
      today,
      ...(officialDrill ? {} : { topicIds: selectedTopics }),
      size: 999,
      seed: 'preview',
      filters,
    }).length
  }, [active, reviews, today, selectedTopics, filters, officialDrill])

  const toggleTopic = (topicId: string): void => {
    setSelectedTopics((current) =>
      current.includes(topicId) ? current.filter((x) => x !== topicId) : [...current, topicId],
    )
  }

  return (
    <main className="screen" data-testid="train">
      <ScreenHeader title={t.train.title} subtitle={t.train.subtitle} />

      <div className="stack stack--loose">
        <section className="stack stack--tight">
          {MODES.map((mode) => {
            const n = counts.get(mode) ?? 0
            const empty = n === 0
            return (
              <button
                key={mode}
                type="button"
                className="topic"
                disabled={empty}
                style={empty ? { opacity: 0.5 } : undefined}
                onClick={() => navigate({ name: 'study', mode })}
                data-testid={`mode-${mode}`}
              >
                <span className="topic__main">
                  <span className="topic__title">{t.train.modes[mode]}</span>
                  <span className="topic__meta">{t.train.modeNotes[mode]}</span>
                </span>
                <span className={empty ? 'pill' : 'pill pill--accent'}>
                  {n} / {MODE_SIZE[mode]}
                </span>
              </button>
            )
          })}
        </section>

        {/* Entrenament per tema */}
        <section className="stack">
          <h2 className="section-title">{t.train.modes['per-tema']}</h2>

          <div className="field">
            <span className="field__label">{t.train.filterBlock}</span>
            <div className="choice-group">
              <button
                type="button"
                className="choice"
                aria-pressed={block === 'all'}
                onClick={() => setBlock('all')}
              >
                {t.common.all}
              </button>
              {BLOCKS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className="choice"
                  aria-pressed={block === b}
                  onClick={() => setBlock(b)}
                >
                  {t.route.blocks[b]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">{t.train.filterDifficulty}</span>
            <div className="choice-group">
              <button
                type="button"
                className="choice"
                aria-pressed={difficulty === 'all'}
                onClick={() => setDifficulty('all')}
              >
                {t.common.all}
              </button>
              {(['facil', 'mitjana', 'dificil'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className="choice"
                  aria-pressed={difficulty === d}
                  onClick={() => setDifficulty(d)}
                >
                  {t.train.difficulty[d]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">{t.train.filterOrigin}</span>
            <div className="choice-group">
              <button
                type="button"
                className="choice"
                aria-pressed={origin === 'all'}
                onClick={() => setOrigin('all')}
              >
                {t.common.all}
              </button>
              {(['authored', 'official'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="choice"
                  aria-pressed={origin === value}
                  onClick={() => setOrigin(value)}
                  data-testid={`filter-origin-${value}`}
                >
                  {t.train.origin[value]}
                </button>
              ))}
            </div>
            {origin === 'official' ? (
              <p className={hasOfficialQuestions ? 'notice' : 'notice notice--warn'}>
                {hasOfficialQuestions ? t.train.officialDrillNote : t.train.officialUnavailable}
              </p>
            ) : null}
          </div>

          <div className="field">
            <span className="field__label">{t.train.filterState}</span>
            <div className="choice-group">
              <button
                type="button"
                className="choice"
                aria-pressed={state === 'all'}
                onClick={() => setState('all')}
              >
                {t.common.all}
              </button>
              {(['new', 'failed', 'due'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="choice"
                  aria-pressed={state === value}
                  onClick={() => setState(value)}
                  data-testid={`filter-state-${value}`}
                >
                  {t.train.state[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <span className="field__label">
              {t.train.selectTopics} · {selectedTopics.length} {t.train.selected}
            </span>
            <div className="stack stack--tight" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {topicsInBlock.map((topic) => {
                const mastery = dash.masteryByTopic.get(topic.topicId)
                const on = selectedTopics.includes(topic.topicId)
                return (
                  <button
                    key={topic.topicId}
                    type="button"
                    className="topic"
                    aria-pressed={on}
                    onClick={() => toggleTopic(topic.topicId)}
                    style={on ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)' } : undefined}
                    data-testid={`select-topic-${topic.number}`}
                  >
                    <span className={`topic__num topic__num--${mastery?.band ?? 'sense-dades'}`} aria-hidden="true">
                      {topic.number}
                    </span>
                    <span className="topic__main">
                      <span className="topic__title">
                        {settings.explanationLang === 'es' && topic.title.es ? topic.title.es : topic.title.ca}
                      </span>
                      <span className="topic__meta">
                        {mastery?.total ?? 0} {t.common.questions}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ color: on ? 'var(--accent)' : 'var(--text-faint)' }}>
                      {on ? '✓' : '+'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn btn--primary btn--lg btn--block"
            disabled={(!officialDrill && selectedTopics.length === 0) || topicPool === 0}
            onClick={() =>
              navigate({
                name: 'study',
                mode: 'per-tema',
                ...(officialDrill ? {} : { topicIds: selectedTopics }),
                ...(difficulty === 'all' && origin === 'all' && state === 'all'
                  ? {}
                  : {
                      filters: {
                        ...(difficulty === 'all' ? {} : { difficulty }),
                        ...(origin === 'all' ? {} : { origin }),
                        ...(state === 'all' ? {} : { state }),
                      },
                    }),
              })
            }
            data-testid="start-topic-session"
          >
            {t.common.start} · {topicPool} {t.train.available}
          </button>

          {selectedTopics.length > 0 && topicPool === 0 ? (
            <p className="notice notice--warn">{t.train.noQuestions}</p>
          ) : null}
        </section>
      </div>
    </main>
  )
}
