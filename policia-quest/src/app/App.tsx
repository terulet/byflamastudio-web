/** Arrel de l'aplicació: tema, encaminament i barra de navegació. */
import type { ReactNode } from 'react'
import { useApp } from './store.tsx'
import { useTheme } from './theme.ts'
import { navigate, useRoute, type Route } from './router.ts'
import { dict } from '../i18n/index.ts'
import { NavIcon } from '../components/ui.tsx'
import { Onboarding } from '../screens/Onboarding.tsx'
import { Home } from '../screens/Home.tsx'
import { RouteScreen } from '../screens/RouteScreen.tsx'
import { TopicDetail } from '../screens/TopicDetail.tsx'
import { Train } from '../screens/Train.tsx'
import { StudyRunner } from '../screens/StudyRunner.tsx'
import { Exams } from '../screens/Exams.tsx'
import { ExamRunner } from '../screens/ExamRunner.tsx'
import { ExamResult } from '../screens/ExamResult.tsx'
import { Progress } from '../screens/Progress.tsx'
import { Settings } from '../screens/Settings.tsx'

const TABS = [
  { name: 'home', icon: 'home' },
  { name: 'route', icon: 'route' },
  { name: 'train', icon: 'train' },
  { name: 'exams', icon: 'exams' },
  { name: 'progress', icon: 'progress' },
] as const

/** Les pantalles immersives amaguen la barra per no distreure. */
const IMMERSIVE = new Set(['study', 'exam'])

export function App(): ReactNode {
  const { ready, settings } = useApp()
  const route = useRoute()
  const t = dict(settings.explanationLang)
  useTheme(settings.theme, settings.reducedMotion)

  if (!ready) {
    return (
      <div className="app">
        <main className="screen screen--full">
          <p className="empty">{t.common.loading}</p>
        </main>
      </div>
    )
  }

  if (!settings.onboarded) {
    return (
      <div className="app">
        <Onboarding />
      </div>
    )
  }

  return (
    <div className="app">
      {renderRoute(route)}
      {IMMERSIVE.has(route.name) ? null : (
        <nav className="nav" aria-label={t.appName}>
          {TABS.map((tab) => (
            <button
              key={tab.name}
              type="button"
              className="nav__item"
              aria-current={route.name === tab.name ? 'page' : undefined}
              onClick={() => navigate({ name: tab.name } as Route)}
              data-testid={`nav-${tab.name}`}
            >
              <NavIcon name={tab.icon} />
              <span>{t.nav[tab.name]}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

function renderRoute(route: Route): ReactNode {
  switch (route.name) {
    case 'home': return <Home />
    case 'route': return <RouteScreen />
    case 'train': return <Train />
    case 'exams': return <Exams />
    case 'progress': return <Progress />
    case 'settings': return <Settings />
    case 'topic': return <TopicDetail topicId={route.topicId} />
    case 'study':
      return (
        <StudyRunner
          key={`${route.mode}-${(route.topicIds ?? []).join(',')}`}
          mode={route.mode}
          {...(route.topicIds ? { topicIds: route.topicIds } : {})}
        />
      )
    case 'exam': return <ExamRunner key={route.blueprintId} blueprintId={route.blueprintId} />
    case 'result': return <ExamResult attemptId={route.attemptId} />
    default: return <Home />
  }
}
