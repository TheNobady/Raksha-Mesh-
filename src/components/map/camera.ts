import type { LngLat } from '../../lib/geo'
import { mapRefs } from '../../lib/mapInstance'
import { useQuality } from '../../lib/quality'

export const VIEW_INDIA = { center: [81.5, 22.5] as [number, number], zoom: 3.7, pitch: 20, bearing: 0 }
export const VIEW_ODISHA = { center: [86.25, 19.75] as [number, number], zoom: 7.1, pitch: 52, bearing: -12 }
/** Calm monitoring: wider, flatter, no drama. */
export const VIEW_CALM = { center: [85.95, 20.5] as [number, number], zoom: 6.7, pitch: 26, bearing: -6 }

/**
 * All camera moves go through here so they share easing and never fight each
 * other: a flight in progress wins until it lands (or is explicitly replaced).
 */
let flightEndsAt = 0
let driftTimer = 0

export const flightInProgress = () => performance.now() < flightEndsAt

function mark(duration: number) {
  flightEndsAt = performance.now() + duration
}

export function flyTo(
  target: { center: [number, number] | LngLat; zoom: number; pitch?: number; bearing?: number },
  duration = 2200,
  opts: { force?: boolean } = {},
) {
  const map = mapRefs.map
  if (!map) return
  if (!opts.force && flightInProgress()) return
  stopDrift()
  mark(duration)
  map.flyTo({
    center: target.center as [number, number],
    zoom: target.zoom,
    pitch: target.pitch ?? map.getPitch(),
    bearing: target.bearing ?? map.getBearing(),
    duration,
    curve: 1.5,
    essential: true,
  })
}

/** Padding changes must never cancel a flight, so they queue behind it. */
export function setPadding(padding: { left: number; right: number; top: number; bottom: number }, duration = 700) {
  const map = mapRefs.map
  if (!map) return
  const apply = () => map.easeTo({ padding, duration, essential: true })
  if (flightInProgress()) {
    window.setTimeout(apply, Math.max(0, flightEndsAt - performance.now()) + 60)
    return
  }
  apply()
}

/**
 * Calm mode breathes: a very slow bearing drift so the screen is never dead,
 * but slow enough that nobody notices it moving.
 */
export function startDrift() {
  const map = mapRefs.map
  if (!map || driftTimer) return
  // A moving camera repaints the entire map every frame, so the idle drift is a
  // luxury: only spend it where there is GPU headroom. The flowing packets keep
  // the screen alive at lower quality levels.
  if (useQuality.getState().level !== 'high') return
  const step = () => {
    if (!mapRefs.map || flightInProgress()) return
    mapRefs.map.easeTo({ bearing: (mapRefs.map.getBearing() + 6) % 360, duration: 12000, easing: (x) => x, essential: true })
  }
  step()
  driftTimer = window.setInterval(step, 12000)
}

export function stopDrift() {
  window.clearInterval(driftTimer)
  driftTimer = 0
}

export function resetView() {
  flyTo(VIEW_ODISHA, 1800, { force: true })
}
