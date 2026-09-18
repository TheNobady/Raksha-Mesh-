import { create } from 'zustand'
import { mapRefs } from './mapInstance'

export type QualityLevel = 'high' | 'balanced' | 'performance'

export interface QualityFlags {
  /** canvas pixel ratio cap — the single biggest win on HiDPI screens */
  pixelRatio: number
  terrain: boolean
  rainParticles: number
  windParticles: number
  spiralBands: boolean
  haloNodes: boolean
  glowDuplicates: boolean
  packets: boolean
  /** render every (frameSkip + 1)th frame — even skipping avoids judder */
  frameSkip: number
  lightning: boolean
}

export const QUALITY: Record<QualityLevel, QualityFlags> = {
  high: {
    pixelRatio: 2,
    terrain: true,
    rainParticles: 900,
    windParticles: 420,
    spiralBands: true,
    haloNodes: true,
    glowDuplicates: true,
    packets: true,
    frameSkip: 0,
    lightning: true,
  },
  balanced: {
    pixelRatio: 1.25,
    terrain: false,
    rainParticles: 420,
    windParticles: 160,
    spiralBands: false,
    haloNodes: true,
    glowDuplicates: false,
    packets: true,
    frameSkip: 0,
    lightning: true,
  },
  performance: {
    pixelRatio: 1,
    terrain: false,
    rainParticles: 160,
    windParticles: 0,
    spiralBands: false,
    haloNodes: false,
    glowDuplicates: false,
    packets: true,
    frameSkip: 1,
    lightning: false,
  },
}

interface QualityState {
  level: QualityLevel
  auto: boolean
  fps: number
  setLevel: (l: QualityLevel, auto?: boolean) => void
}

/** ?q=high|balanced|perf forces a level (handy on an unknown venue laptop). */
function initialLevel(): { level: QualityLevel; auto: boolean } {
  const q = new URLSearchParams(window.location.search).get('q')
  if (q === 'high') return { level: 'high', auto: false }
  if (q === 'balanced') return { level: 'balanced', auto: false }
  if (q === 'perf' || q === 'performance') return { level: 'performance', auto: false }
  return { level: 'balanced', auto: true }
}

export const useQuality = create<QualityState>((set) => ({
  ...initialLevel(),
  fps: 60,
  setLevel: (level, auto = false) => {
    set({ level, auto })
    applyQuality(level)
  },
}))

export const flags = () => QUALITY[useQuality.getState().level]

export function applyQuality(level: QualityLevel) {
  const q = QUALITY[level]
  const map = mapRefs.map
  const ratio = Math.min(window.devicePixelRatio || 1, q.pixelRatio)
  map?.setPixelRatio?.(ratio)
  mapRefs.overlay?.setProps({ useDevicePixels: ratio })
}

/**
 * Watches real frame times and keeps the demo smooth on its own: it steps the
 * quality down when frames get expensive, and up when there is headroom to
 * spare (so a strong laptop still gets 3D terrain and the full particle set).
 */
export function startQualityWatchdog() {
  let frames = 0
  let t0 = performance.now()
  let good = 0
  let bad = 0
  /** once a level proves too slow we never climb back to it mid-demo */
  let ceiling: QualityLevel = 'high'
  const tick = () => {
    requestAnimationFrame(tick)
    frames++
    const dt = performance.now() - t0
    if (dt < 2500) return
    const fps = Math.round((frames / dt) * 1000)
    frames = 0
    t0 = performance.now()
    useQuality.setState({ fps })
    const { level, auto } = useQuality.getState()
    if (!auto) return
    if (fps < 38) {
      good = 0
      bad++
      // one bad sample can just be a heavy moment (broadcast flash, fly-in)
      if (bad < 2) return
      if (level === 'high') {
        ceiling = 'balanced'
        useQuality.getState().setLevel('balanced', true)
      } else if (level === 'balanced') {
        ceiling = 'performance'
        useQuality.getState().setLevel('performance', true)
      }
      bad = 0
    } else if (fps >= 56 && level !== 'high' && ceiling !== level) {
      bad = 0
      good++
      // only climb after a couple of comfortable samples
      if (good >= 2) {
        good = 0
        const next = level === 'performance' ? 'balanced' : 'high'
        if (next !== ceiling || ceiling === 'high') useQuality.getState().setLevel(next, true)
      }
    } else {
      good = 0
      bad = 0
    }
  }
  requestAnimationFrame(tick)
}
