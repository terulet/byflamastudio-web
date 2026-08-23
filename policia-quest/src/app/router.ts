/**
 * Encaminador mínim basat en el fragment d'URL.
 *
 * Un router complet seria una dependència gran per a una app de cinc
 * destinacions que ha de funcionar sense connexió. Amb el hash n'hi ha prou i,
 * a més, funciona en obrir el fitxer directament i en mode PWA sense servidor.
 */
import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'route' }
  | { name: 'train' }
  | { name: 'exams' }
  | { name: 'progress' }
  | { name: 'settings' }
  | { name: 'topic'; topicId: string }
  | { name: 'study'; mode: string; topicIds?: string[]; filters?: StudyRouteFilters }
  | { name: 'exam'; blueprintId: string }
  | { name: 'result'; attemptId: string }

/** Filtres que viatgen a la URL perquè una sessió es pugui recrear i compartir. */
export interface StudyRouteFilters {
  difficulty?: 'facil' | 'mitjana' | 'dificil'
  origin?: 'authored' | 'official'
  state?: 'new' | 'failed' | 'due'
}

const DIFFICULTIES = ['facil', 'mitjana', 'dificil'] as const
const ORIGINS = ['authored', 'official'] as const
const STATES = ['new', 'failed', 'due'] as const

function readFilters(params: URLSearchParams): StudyRouteFilters | undefined {
  const difficulty = params.get('difficulty')
  const origin = params.get('origin')
  const state = params.get('state')
  const filters: StudyRouteFilters = {
    ...(DIFFICULTIES.includes(difficulty as never) ? { difficulty: difficulty as 'facil' } : {}),
    ...(ORIGINS.includes(origin as never) ? { origin: origin as 'authored' } : {}),
    ...(STATES.includes(state as never) ? { state: state as 'new' } : {}),
  }
  return Object.keys(filters).length > 0 ? filters : undefined
}

const DEFAULT: Route = { name: 'home' }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '')
  if (raw === '') return DEFAULT
  const [path, query] = raw.split('?')
  const parts = (path ?? '').split('/').filter(Boolean)
  const params = new URLSearchParams(query ?? '')

  switch (parts[0]) {
    case 'route':
      return { name: 'route' }
    case 'train':
      return { name: 'train' }
    case 'exams':
      return { name: 'exams' }
    case 'progress':
      return { name: 'progress' }
    case 'settings':
      return { name: 'settings' }
    case 'topic':
      return parts[1] ? { name: 'topic', topicId: parts[1] } : DEFAULT
    case 'study': {
      if (!parts[1]) return DEFAULT
      const topics = params.get('topics')
      const filters = readFilters(params)
      return {
        name: 'study',
        mode: parts[1],
        ...(topics ? { topicIds: topics.split(',').filter(Boolean) } : {}),
        ...(filters ? { filters } : {}),
      }
    }
    case 'exam':
      return parts[1] ? { name: 'exam', blueprintId: parts[1] } : DEFAULT
    case 'result':
      return parts[1] ? { name: 'result', attemptId: parts[1] } : DEFAULT
    default:
      return DEFAULT
  }
}

export function toHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/'
    case 'topic': return `#/topic/${route.topicId}`
    case 'study': {
      const params = new URLSearchParams()
      if (route.topicIds && route.topicIds.length > 0) params.set('topics', route.topicIds.join(','))
      if (route.filters?.difficulty) params.set('difficulty', route.filters.difficulty)
      if (route.filters?.origin) params.set('origin', route.filters.origin)
      if (route.filters?.state) params.set('state', route.filters.state)
      const query = params.toString()
      return query ? `#/study/${route.mode}?${query}` : `#/study/${route.mode}`
    }
    case 'exam': return `#/exam/${route.blueprintId}`
    case 'result': return `#/result/${route.attemptId}`
    default: return `#/${route.name}`
  }
}

export function navigate(route: Route): void {
  window.location.hash = toHash(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))

  const onChange = useCallback(() => {
    setRoute(parseHash(window.location.hash))
    // En canviar de pantalla es torna a dalt, com faria una app nativa.
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [onChange])

  return route
}
