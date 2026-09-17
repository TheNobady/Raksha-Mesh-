import { LANDFALL_T, TRACK_PATH } from '../data/hazards'
import { alongPath } from './geo'

/** Deterministic cyclone progress from the scenario clock (never quite makes landfall during the demo). */
export function cycloneT(elapsed: number) {
  return 0.4 + (LANDFALL_T - 0.43) * (1 - Math.exp(-elapsed / 80))
}

export function cyclonePosition(elapsed: number) {
  return alongPath(TRACK_PATH, cycloneT(elapsed)).p
}

/** Landfall countdown in seconds; each scenario second ≈ 40 s of storm time. */
export function landfallSeconds(elapsed: number) {
  return Math.max(0, 6 * 3600 + 42 * 60 + 15 - elapsed * 40)
}
