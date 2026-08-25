/** Ruta: els 40 temes en quatre blocs, sense bloquejos artificials. */
import { useMemo, type ReactNode } from 'react'
import { pack, useApp } from '../app/store.tsx'
import { useDashboard } from '../app/selectors.ts'
import { navigate } from '../app/router.ts'
import { dict, pick } from '../i18n/index.ts'
import { ScreenHeader } from '../components/ui.tsx'
import type { BlockId, SyllabusTopic } from '../domain/types.ts'

const BLOCK_ORDER: BlockId[] = [
  'institucions',
  'seguretat-i-penal',
  'roses-transit-convivencia',
  'actuacio-i-proteccio',
]

export function RouteScreen(): ReactNode {
  const { settings } = useApp()
  const t = dict(settings.explanationLang)
  const dash = useDashboard()

  const byBlock = useMemo(() => {
    const map = new Map<BlockId, SyllabusTopic[]>()
    for (const block of BLOCK_ORDER) map.set(block, [])
    for (const topic of [...pack.syllabus.topics].sort((a, b) => a.number - b.number)) {
      map.get(topic.block)?.push(topic)
    }
    return map
  }, [])

  return (
    <main className="screen" data-testid="route">
      <ScreenHeader title={t.route.title} subtitle={t.route.subtitle} />

      <div className="stack stack--loose">
        {BLOCK_ORDER.map((block) => {
          const topics = byBlock.get(block) ?? []
          const first = topics[0]?.number ?? 0
          const last = topics[topics.length - 1]?.number ?? 0
          return (
            <section key={block}>
              <div className="row row--between" style={{ marginBottom: 'var(--sp-2)' }}>
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  {t.route.blocks[block]}
                </h2>
                <span className="pill">
                  {first}–{last}
                </span>
              </div>

              <div className="stack stack--tight">
                {topics.map((topic) => {
                  const mastery = dash.masteryByTopic.get(topic.topicId)
                  const band = mastery?.band ?? 'sense-dades'
                  return (
                    <button
                      key={topic.topicId}
                      type="button"
                      className="topic"
                      onClick={() => navigate({ name: 'topic', topicId: topic.topicId })}
                      data-testid={`topic-${topic.number}`}
                    >
                      <span className={`topic__num topic__num--${band}`} aria-hidden="true">
                        {topic.number}
                      </span>
                      <span className="topic__main">
                        <span className="topic__title">
                          {pick(topic.title, settings.explanationLang)}
                        </span>
                        <span className="topic__meta">
                          {mastery && mastery.mastery !== null
                            ? `${t.progress.bands[band]} · ${mastery.mastery}% · ${mastery.seen}/${mastery.total} ${t.route.practiced}`
                            : `${t.route.noData} · ${mastery?.total ?? 0} ${t.common.questions}`}
                          {mastery && mastery.due > 0 ? ` · ${mastery.due} ${t.home.dueReviews.toLowerCase()}` : ''}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}
