/**
 * So i vibració.
 *
 * L'àudio és procedural (WebAudio), de manera que no hi ha cap fitxer amb
 * llicència dubtosa. El context d'àudio només es crea després d'una
 * interacció de l'usuari, mai en carregar la pàgina.
 */
let context: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context ??= new Ctor()
  return context
}

function tone(frequency: number, durationMs: number, gainValue: number): void {
  const ctx = getContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  const now = ctx.currentTime
  const duration = durationMs / 1000
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain).connect(ctx.destination)
  oscillator.start(now)
  oscillator.stop(now + duration + 0.02)
}

export function playCorrect(enabled: boolean): void {
  if (!enabled) return
  tone(660, 110, 0.06)
  setTimeout(() => tone(880, 140, 0.05), 90)
}

export function playWrong(enabled: boolean): void {
  if (!enabled) return
  tone(300, 170, 0.05)
}

export function vibrate(enabled: boolean, pattern: number | number[]): void {
  if (!enabled) return
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* dispositius que no ho suporten */
  }
}
