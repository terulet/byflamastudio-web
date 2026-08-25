/** Aplica el tema triat a l'element arrel i el manté sincronitzat amb el sistema. */
import { useEffect } from 'react'
import type { Settings } from '../domain/types.ts'

export function useTheme(theme: Settings['theme'], reducedMotion: boolean): void {
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: light)')

    const apply = (): void => {
      const resolved = theme === 'system' ? (media.matches ? 'light' : 'dark') : theme
      root.setAttribute('data-theme', resolved)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', resolved === 'light' ? '#f2f5f9' : '#0a1420')
    }

    apply()
    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
    return undefined
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--motion',
      reducedMotion ? '0ms' : '200ms',
    )
    document.documentElement.style.setProperty(
      '--motion-fast',
      reducedMotion ? '0ms' : '120ms',
    )
  }, [reducedMotion])
}
