import { blob, chaikin, closeRing, type LngLat } from '../lib/geo'
import { mulberry32, range } from '../lib/prng'

const rand = mulberry32(777)

// ---------------------------------------------------------------------------
// Cyclone VAYU-26 (fictional)

export const CYCLONE = {
  name: 'VAYU-26',
  fullName: 'Severe Cyclonic Storm VAYU-26',
  category: 'Extremely Severe Cyclonic Storm',
  maxWindKmh: 185,
  gustKmh: 205,
  pressureHpa: 952,
  movementKmh: 17,
  movementDir: 'NNW',
  rainfallMm: '250–320',
  surgeM: '2.5–3.0',
}

/** Forecast track control points with hours from now. */
export const TRACK_POINTS: { at: LngLat; label: string }[] = [
  { at: [89.6, 14.6], label: 'Now' },
  { at: [88.75, 16.35], label: '+12h' },
  { at: [87.75, 18.1], label: '+24h' },
  { at: [86.95, 19.4], label: '+36h' },
  { at: [86.45, 20.08], label: 'Landfall +42h' },
  { at: [86.1, 20.85], label: '+54h' },
  { at: [85.9, 21.8], label: '+66h' },
]

export const TRACK_PATH: LngLat[] = chaikin(TRACK_POINTS.map((p) => p.at), 3)
export const LANDFALL: LngLat = [86.45, 20.08]
/** Fraction along TRACK_PATH where the eye is at landfall (approx). */
export const LANDFALL_T = 0.77

function conePolygon(): LngLat[] {
  const pts = TRACK_PATH
  const left: LngLat[] = []
  const right: LngLat[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const w = 0.12 + (i / (pts.length - 1)) * 0.95
    left.push([pts[i][0] + nx * w, pts[i][1] + ny * w])
    right.push([pts[i][0] - nx * w, pts[i][1] - ny * w])
  }
  const end = pts[pts.length - 1]
  const cap: LngLat[] = []
  const last = left[left.length - 1]
  const r = Math.hypot(last[0] - end[0], last[1] - end[1])
  const a0 = Math.atan2(last[1] - end[1], last[0] - end[0])
  for (let k = 1; k < 12; k++) {
    const a = a0 - (k / 12) * Math.PI
    cap.push([end[0] + Math.cos(a) * r, end[1] + Math.sin(a) * r])
  }
  return closeRing([...left, ...cap, ...right.reverse()])
}

export const CONE: LngLat[] = conePolygon()

/** Suggested alert zone drawn from the forecast cone near landfall. */
export const SUGGESTED_ZONE: LngLat[] = closeRing([
  [85.72, 19.74], [86.18, 19.8], [86.62, 20.02], [86.98, 20.5], [87.12, 20.92], [86.75, 21.12],
  [86.28, 20.95], [86.0, 20.62], [85.78, 20.3], [85.62, 20.02],
])

// ---------------------------------------------------------------------------
// Flood – progressively larger extents across the Mahanadi / Brahmani delta

const floodCenters: LngLat[] = [
  [86.45, 20.3], [86.3, 20.2], [86.55, 20.5], [86.2, 20.05], [86.7, 20.7],
]
export const FLOOD_STAGES: LngLat[][][] = [0, 1, 2, 3, 4].map((stage) => {
  const r = mulberry32(100 + stage)
  const scale = 0.35 + stage * 0.2
  return floodCenters.slice(0, 2 + Math.min(3, stage)).map((c, i) =>
    blob(c, 0.09 * scale * (1 + i * 0.1) + 0.03, 0.07 * scale + 0.025, r, 32, 0.35),
  )
})

// ---------------------------------------------------------------------------
// Landslide – hill districts (Gajapati / Kandhamal / Rayagada)

export const LANDSLIDE_ZONES: { name: string; ring: LngLat[]; level: 'high' | 'moderate' }[] = [
  { name: 'R. Udayagiri ghat', ring: blob([84.13, 19.2], 0.09, 0.07, rand), level: 'high' },
  { name: 'Daringbadi slopes', ring: blob([84.14, 19.9], 0.1, 0.08, rand), level: 'high' },
  { name: 'Paralakhemundi hills', ring: blob([84.05, 18.8], 0.08, 0.06, rand), level: 'moderate' },
  { name: 'Kalinga ghat', ring: blob([84.35, 20.12], 0.07, 0.05, rand), level: 'moderate' },
]

export const SLIDE_PATH: LngLat[] = chaikin([[84.1, 19.95], [84.14, 19.9], [84.17, 19.86], [84.2, 19.83]], 2)
export const BLOCKED_ROAD: LngLat[] = chaikin([[84.1, 19.78], [84.2, 19.83], [84.33, 19.85], [84.45, 19.8]], 2)

// ---------------------------------------------------------------------------
// Light forecast layers

export const RAIN_POINTS: { at: LngLat; w: number }[] = Array.from({ length: 420 }, () => {
  const cx = 86.4 + (rand() - 0.5) * 3.2
  const cy = 20.2 + (rand() - 0.5) * 2.8
  const d = Math.hypot(cx - 86.4, cy - 20.1)
  return { at: [cx, cy] as LngLat, w: Math.max(0.05, 1 - d / 1.8) * range(rand, 0.6, 1) }
})

export const HEATWAVE_ZONES: LngLat[][] = [
  blob([79.2, 25.2], 2.2, 1.6, rand, 30, 0.3),
  blob([75.2, 26.8], 1.8, 1.4, rand, 30, 0.3),
  blob([82.2, 23.9], 1.2, 0.9, rand, 30, 0.3),
]

export const LIGHTNING_POINTS: LngLat[] = []
while (LIGHTNING_POINTS.length < 60) {
  const p: LngLat = [range(rand, 84.2, 88.2), range(rand, 18.8, 22.2)]
  LIGHTNING_POINTS.push(p)
}

export const SURGE_COAST: LngLat[] = [
  [87.05, 20.72], [86.86, 20.55], [86.76, 20.36], [86.68, 20.26], [86.47, 20.06], [86.32, 19.96], [86.02, 19.84], [85.83, 19.79],
]

