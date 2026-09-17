import { chaikin, type LngLat } from '../lib/geo'
import { STORY_VILLAGES, VILLAGE_BY_ID } from './villages'

export type SOSSource = 'SOS app' | 'IVR' | 'Missed call' | 'Drone detection' | 'Unreached'

export interface SOSSeed {
  id: string
  villageId: string
  people: number
  tags: string[]
  source: SOSSource
  urgency: number
}

export const TAG_STYLE: Record<string, string> = {
  'Pregnant woman': 'bg-pink-500/15 text-pink-300 border-pink-400/30',
  'Water rising': 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  Elderly: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  'Child trapped': 'bg-rose-500/20 text-rose-300 border-rose-400/40',
  'Medical emergency': 'bg-red-500/20 text-red-300 border-red-400/40',
  'Person with disability': 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  'Roof collapse': 'bg-orange-500/15 text-orange-300 border-orange-400/30',
  'No response to alert': 'bg-slate-500/20 text-slate-300 border-slate-400/30',
  'Livestock stranded': 'bg-lime-500/15 text-lime-300 border-lime-400/30',
  'People on rooftop': 'bg-yellow-500/15 text-yellow-300 border-yellow-400/40',
}

export const SOS_SEEDS: Record<string, SOSSeed> = {
  balijhari: { id: 'sos-balijhari', villageId: STORY_VILLAGES.balijhari, people: 5, tags: ['Pregnant woman', 'Water rising'], source: 'SOS app', urgency: 91 },
  nuagaon: { id: 'sos-nuagaon', villageId: STORY_VILLAGES.nuagaon, people: 7, tags: ['Elderly', 'Roof collapse', 'Medical emergency'], source: 'IVR', urgency: 84 },
  nuagaonDup: { id: 'sos-nuagaon', villageId: STORY_VILLAGES.nuagaon, people: 7, tags: ['Elderly', 'Roof collapse'], source: 'Missed call', urgency: 84 },
  kantiapada: { id: 'sos-kantiapada', villageId: STORY_VILLAGES.kantiapada, people: 58, tags: ['No response to alert', 'Elderly', 'Pregnant woman'], source: 'Unreached', urgency: 72 },
  livestock: { id: 'sos-livestock', villageId: 'v-40', people: 3, tags: ['Livestock stranded', 'Water rising'], source: 'Missed call', urgency: 46 },
  disability: { id: 'sos-disability', villageId: 'v-120', people: 2, tags: ['Person with disability', 'Water rising'], source: 'IVR', urgency: 77 },
  drone: { id: 'sos-drone', villageId: STORY_VILLAGES.siali, people: 3, tags: ['People on rooftop', 'Water rising', 'Child trapped'], source: 'Drone detection', urgency: 97 },
  smartphone: { id: 'sos-smartphone', villageId: STORY_VILLAGES.astaranga, people: 4, tags: ['Medical emergency', 'Elderly'], source: 'SOS app', urgency: 80 },
  keypad: { id: 'sos-keypad', villageId: STORY_VILLAGES.astaranga, people: 6, tags: ['Elderly', 'Water rising'], source: 'IVR', urgency: 79 },
}

export const RESCUE_BASE: { name: string; at: LngLat } = { name: 'NDRF Base · Kujang', at: [86.22, 20.3] }

/** A plausible waterborne route from base to a village. */
export function boatRoute(villageId: string): LngLat[] {
  const v = VILLAGE_BY_ID[villageId]
  const target = v ? v.lngLat : ([86.4, 20.2] as LngLat)
  const [bx, by] = RESCUE_BASE.at
  const mid: LngLat = [(bx + target[0]) / 2 + 0.05, (by + target[1]) / 2 - 0.04]
  const mid2: LngLat = [(mid[0] + target[0]) / 2 - 0.03, (mid[1] + target[1]) / 2 + 0.02]
  return chaikin([RESCUE_BASE.at, mid, mid2, target], 3)
}

export const PATROL_ROUTES: { id: string; kind: 'heli' | 'drone' | 'ndrf'; name: string; path: LngLat[]; period: number }[] = [
  { id: 'heli-1', kind: 'heli', name: 'IAF Chetak H-12', path: chaikin([[85.82, 20.25], [86.2, 20.15], [86.55, 20.4], [86.3, 20.6], [85.95, 20.45], [85.82, 20.25]], 3), period: 60 },
  { id: 'drone-1', kind: 'drone', name: 'Drone D-3 (thermal)', path: chaikin([[86.45, 20.2], [86.55, 20.28], [86.52, 20.18], [86.45, 20.2]], 3), period: 24 },
  { id: 'drone-2', kind: 'drone', name: 'Drone D-7', path: chaikin([[86.55, 20.45], [86.7, 20.52], [86.62, 20.4], [86.55, 20.45]], 3), period: 30 },
  { id: 'ndrf-1', kind: 'ndrf', name: 'NDRF 3rd Bn · Team 7', path: chaikin([[85.88, 20.46], [86.05, 20.38], [86.25, 20.28], [86.3, 20.12]], 2), period: 80 },
  { id: 'ndrf-2', kind: 'ndrf', name: 'ODRAF Unit 2', path: chaikin([[86.5, 21.05], [86.55, 20.85], [86.5, 20.62]], 2), period: 70 },
]

export const RESCUE_TEAMS = [
  { name: 'NDRF 3rd Bn · Team 7', status: 'On site', place: 'Ersama' },
  { name: 'ODRAF Unit 2', status: 'En route', place: 'Rajnagar' },
  { name: 'Fire & Emergency · Kujang', status: 'On site', place: 'Kujang' },
  { name: 'Coast Guard · ICGS Paradip', status: 'Standby', place: 'Paradip' },
  { name: 'NDRF 3rd Bn · Team 11', status: 'Returning', place: 'Mahakalapada' },
]
