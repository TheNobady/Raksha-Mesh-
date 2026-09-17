import type { Polygon } from 'geojson'
import { create } from 'zustand'
import { sound, type SoundId } from '../audio/soundManager'
import { CHANNELS, type ChannelId, type HazardId, type LangId, type Severity } from '../data/content'
import { FAILING_TOWERS } from '../data/infrastructure'
import { boatRoute, SOS_SEEDS, type SOSSeed, type SOSSource } from '../data/rescue'
import { KANTIAPADA_HOUSEHOLDS, STORY_VILLAGES, VILLAGE_BY_ID, VILLAGES } from '../data/villages'
import { SUGGESTED_ZONE } from '../data/hazards'
import { istClock } from '../lib/format'
import { computeImpact, type Impact } from '../lib/impact'
import type { LngLat } from '../lib/geo'
import { hashString } from '../lib/prng'

export type Screen =
  | 'command'
  | 'composer'
  | 'routing'
  | 'reach'
  | 'rescue'
  | 'shelters'
  | 'volunteers'
  | 'recovery'
  | 'reports'
  | 'settings'

export type AckState = 'pending' | 'ack' | 'partial' | 'unreached'
export type Sev = 'info' | 'ok' | 'warn' | 'crit'
export type FeedCat = 'system' | 'channel' | 'rescue' | 'alert'
export type ChannelState = 'standby' | 'attempting' | 'failed' | 'operational'
export type PhoneId = 'smart' | 'keypad' | 'volunteer'

export interface FeedEvent {
  id: number
  time: string
  sev: Sev
  cat: FeedCat
  text: string
}

export interface Toast {
  id: number
  sev: Sev
  title: string
  body?: string
}

export interface SOSItem extends SOSSeed {
  place: string
  lngLat: LngLat
  createdAt: number
  merged: number
  status: 'open' | 'assigned' | 'dispatched' | 'rescued'
  team?: string
}

export interface RescueUnit {
  id: string
  sosId: string
  name: string
  path: LngLat[]
  startAt: number
  duration: number
  arrived: boolean
}

export interface MapPulse {
  id: number
  at: LngLat
  color: [number, number, number]
  t0: number
  radiusKm: number
}

export type LayerKey =
  | 'network'
  | 'packets'
  | 'cyclone'
  | 'cone'
  | 'windRings'
  | 'rain'
  | 'flood'
  | 'landslide'
  | 'rainfall'
  | 'heatwave'
  | 'lightning'
  | 'surge'
  | 'villages'
  | 'terrain'

let feedId = 1
let toastId = 1
let pulseId = 1

/** When true (during jump/replay) actions skip sounds, toasts and flashes. */
let silent = false
export const setSilent = (v: boolean) => {
  silent = v
}
export const isSilent = () => silent
const sfx = (id: SoundId) => {
  if (!silent) sound.play(id)
}

const channelInit = () =>
  Object.fromEntries(CHANNELS.map((c) => [c.id, { state: 'standby' as ChannelState }])) as Record<ChannelId, { state: ChannelState }>

export interface ScenarioData {
  started: boolean
  screen: Screen
  // engine
  elapsed: number
  isPlaying: boolean
  speed: number
  fired: Record<string, true>
  lastStepId: string | null
  broadcastAt: number | null
  autoNavigate: boolean
  // world
  towersDown: Record<string, true>
  floodStage: number
  landslideActive: boolean
  channels: Record<ChannelId, { state: ChannelState }>
  failoverPhase: 0 | 1 | 2 | 3 | 4
  villageAck: Record<string, AckState>
  zoneVillageIds: string[]
  // composer
  zone: Polygon | null
  impact: Impact | null
  hazard: HazardId
  severity: Severity
  audience: string[]
  templateId: string
  lang: LangId
  timing: 'now' | 'schedule'
  staged: boolean
  approved: boolean
  approvalOpen: boolean
  broadcastLang: LangId
  drawMode: 'polygon' | 'circle' | 'select' | 'idle'
  // kpis
  kpi: {
    peopleInDanger: number
    districts: number
    activeAlerts: number
    sheltersOpen: number
    volunteers: number
    evacuated: number
    rescued: number
  }
  reach: { delivered: number; heard: number; ack: number; evac: number }
  // rescue
  sos: SOSItem[]
  units: RescueUnit[]
  droneDetected: boolean
  droneMarked: boolean
  // phones
  phonesVisible: boolean
  phoneMin: Record<PhoneId, boolean>
  smart: { stage: 'lock' | 'alert' | 'app'; tab: 'status' | 'shelter' | 'mesh'; safe: boolean; sos: boolean; mesh: boolean; english: boolean }
  keypad: { stage: 'idle' | 'ringing' | 'call' | 'confirmed' | 'shelter' | 'help' | 'ended'; callStartedAt: number | null }
  volunteer: { stage: 'idle' | 'task' | 'accepted' | 'done'; checked: boolean[]; onDuty: boolean }
  // ui
  feed: FeedEvent[]
  toasts: Toast[]
  layers: Record<LayerKey, boolean>
  muted: boolean
  flashNonce: number
  introNonce: number
  focus: { center: LngLat; zoom: number; pitch?: number; bearing?: number; nonce: number } | null
  pulses: MapPulse[]
  presenterOpen: boolean
  feedOpen: boolean
  panelsHidden: boolean
  selectedNodeId: string | null
}

const initialData = (): ScenarioData => ({
  started: false,
  screen: 'command',
  elapsed: 0,
  isPlaying: false,
  speed: 1,
  fired: {},
  lastStepId: null,
  broadcastAt: null,
  autoNavigate: false,
  towersDown: {},
  floodStage: 0,
  landslideActive: false,
  channels: channelInit(),
  failoverPhase: 0,
  villageAck: {},
  zoneVillageIds: [],
  zone: null,
  impact: null,
  hazard: 'cyclone',
  severity: 'evacuate',
  audience: ['Everyone', 'Fishermen', 'Elderly', 'Pregnant women'],
  templateId: 'cyclone-evac',
  lang: 'or',
  timing: 'now',
  staged: true,
  approved: false,
  approvalOpen: false,
  broadcastLang: 'or',
  drawMode: 'idle',
  kpi: { peopleInDanger: 186400, districts: 4, activeAlerts: 3, sheltersOpen: 38, volunteers: 842, evacuated: 0, rescued: 0 },
  reach: { delivered: 0, heard: 0, ack: 0, evac: 0 },
  sos: [],
  units: [],
  droneDetected: false,
  droneMarked: false,
  phonesVisible: false,
  phoneMin: { smart: false, keypad: false, volunteer: false },
  smart: { stage: 'lock', tab: 'status', safe: false, sos: false, mesh: false, english: false },
  keypad: { stage: 'idle', callStartedAt: null },
  volunteer: { stage: 'idle', checked: KANTIAPADA_HOUSEHOLDS.map(() => false), onDuty: true },
  feed: [],
  toasts: [],
  layers: {
    network: true, packets: true, cyclone: true, cone: false, windRings: true, rain: true, flood: true, landslide: true,
    rainfall: false, heatwave: false, lightning: true, surge: true, villages: true, terrain: true,
  },
  muted: false,
  flashNonce: 0,
  introNonce: 0,
  focus: null,
  pulses: [],
  presenterOpen: false,
  feedOpen: true,
  panelsHidden: false,
  selectedNodeId: null,
})

export interface ScenarioActions {
  set: (patch: Partial<ScenarioData>) => void
  reset: () => void
  setScreen: (s: Screen) => void
  pushFeed: (sev: Sev, cat: FeedCat, text: string) => void
  toast: (sev: Sev, title: string, body?: string) => void
  dismissToast: (id: number) => void
  toggleLayer: (k: LayerKey) => void
  setMuted: (m: boolean) => void
  flyTo: (center: LngLat, zoom: number, pitch?: number, bearing?: number) => void
  pulse: (at: LngLat, color: [number, number, number], radiusKm?: number) => void
  // world
  failTowers: (count: number) => void
  setChannel: (id: ChannelId, state: ChannelState) => void
  ackVillage: (id: string, state: AckState, via?: string) => void
  ackWave: (fraction: number) => void
  markUnreached: () => void
  // composer
  setZone: (poly: Polygon | null) => void
  suggestZone: () => void
  broadcast: () => void
  // phones
  setPhonesVisible: (v: boolean) => void
  togglePhoneMin: (id: PhoneId) => void
  smartAlert: () => void
  smartPatch: (p: Partial<ScenarioData['smart']>) => void
  smartSafe: () => void
  smartSOS: () => void
  keypadRing: () => void
  keypadAnswer: () => void
  keypadKey: (key: string) => void
  keypadEnd: () => void
  volunteerTask: () => void
  volunteerAccept: () => void
  volunteerTick: (i: number) => void
  volunteerComplete: () => void
  // rescue
  addSOS: (seed: SOSSeed, source?: SOSSource) => void
  assignTeam: (sosId: string) => void
  dispatchBoat: (sosId?: string) => void
  arriveUnit: (unitId: string) => void
  droneDetect: () => void
  markForRescue: () => void
}

export type ScenarioState = ScenarioData & ScenarioActions

const TEAMS = ['NDRF Team 7', 'ODRAF Unit 2', 'Fire & ES Kujang', 'NDRF Team 11', 'Coast Guard Boat 4']

export const useStore = create<ScenarioState>()((set, get) => ({
  ...initialData(),

  set: (patch) => set(patch),

  reset: () => {
    sound.stopAll()
    const keep = { muted: get().muted, presenterOpen: get().presenterOpen, started: get().started, feedOpen: get().feedOpen }
    set({ ...initialData(), ...keep, introNonce: get().introNonce + 1 })
  },

  setScreen: (screen) => {
    if (get().screen === screen) return
    sfx('click')
    set({ screen })
  },

  pushFeed: (sev, cat, text) =>
    set((s) => ({ feed: [{ id: feedId++, time: istClock(), sev, cat, text }, ...s.feed].slice(0, 140) })),

  toast: (sev, title, body) => {
    if (silent) return
    const id = toastId++
    set((s) => ({ toasts: [...s.toasts, { id, sev, title, body }].slice(-4) }))
    window.setTimeout(() => get().dismissToast(id), 4200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),

  setMuted: (muted) => {
    sound.setMuted(muted)
    set({ muted })
  },

  flyTo: (center, zoom, pitch, bearing) => set({ focus: { center, zoom, pitch, bearing, nonce: Date.now() } }),

  pulse: (at, color, radiusKm = 40) => {
    if (silent) return
    const p: MapPulse = { id: pulseId++, at, color, t0: performance.now(), radiusKm }
    set((s) => ({ pulses: [...s.pulses.filter((x) => performance.now() - x.t0 < 4000), p] }))
  },

  // ---------------------------------------------------------------- world

  failTowers: (count) => {
    const down = { ...get().towersDown }
    FAILING_TOWERS.slice(0, count).forEach((id) => (down[id] = true))
    set({ towersDown: down })
  },

  setChannel: (id, state) => set((s) => ({ channels: { ...s.channels, [id]: { state } } })),

  ackVillage: (id, state, via) => {
    const prev = get().villageAck[id]
    if (prev === state) return
    set((s) => ({ villageAck: { ...s.villageAck, [id]: state } }))
    const v = VILLAGE_BY_ID[id]
    if (via && v) {
      get().pushFeed(state === 'ack' ? 'ok' : 'warn', 'alert', `${via} — ${v.name}`)
      if (state === 'ack') get().pulse(v.lngLat, [74, 222, 128], 8)
    }
  },

  ackWave: (fraction) => {
    const s = get()
    const ids = s.zoneVillageIds.length ? s.zoneVillageIds : defaultZoneVillages()
    const story = new Set<string>(Object.values(STORY_VILLAGES))
    const ordered = ids.filter((id) => !story.has(id)).sort((a, b) => hashString(a) - hashString(b))
    const nAck = Math.floor(ordered.length * fraction)
    const nPartial = Math.floor(ordered.length * Math.min(0.08, 1 - fraction))
    const next = { ...s.villageAck }
    ordered.forEach((id, i) => {
      if (next[id] === 'ack') return
      if (i < nAck) next[id] = 'ack'
      else if (i < nAck + nPartial) next[id] = 'partial'
    })
    const target = s.impact?.population ?? 420000
    const reach = {
      delivered: Math.round(target * 0.958),
      heard: Math.round(target * (0.62 + 0.27 * fraction)),
      ack: Math.round(target * (0.35 + 0.46 * fraction)),
      evac: Math.round(target * (0.2 + 0.5 * fraction)),
    }
    set({ villageAck: next, reach, kpi: { ...s.kpi, evacuated: reach.evac } })
  },

  markUnreached: () => {
    const s = get()
    const next = { ...s.villageAck }
    ;[STORY_VILLAGES.kantiapada, STORY_VILLAGES.balijhari, STORY_VILLAGES.nuagaon].forEach((id) => {
      if (next[id] !== 'ack' && next[id] !== 'partial') next[id] = 'unreached'
    })
    if (next[STORY_VILLAGES.astaranga] !== 'ack') next[STORY_VILLAGES.astaranga] = 'ack'
    if (next[STORY_VILLAGES.siali] !== 'ack') next[STORY_VILLAGES.siali] = 'partial'
    set({ villageAck: next })
    get().pushFeed('crit', 'alert', 'No acknowledgement from Kantiapada, Balijhari, Nuagaon — flagged UNREACHED')
  },

  // ---------------------------------------------------------------- composer

  setZone: (zone) => {
    if (!zone) {
      set({ zone: null, impact: null })
      return
    }
    const impact = computeImpact(zone)
    set((s) => ({
      zone,
      impact,
      kpi: { ...s.kpi, peopleInDanger: Math.max(impact.population, 1) },
    }))
  },

  suggestZone: () => {
    get().setZone({ type: 'Polygon', coordinates: [SUGGESTED_ZONE] })
  },

  broadcast: () => {
    const s = get()
    if (s.broadcastAt !== null) return
    if (!s.zone) get().suggestZone()
    const impact = get().impact
    const zoneIds = new Set(impact?.villageIds ?? [])
    Object.values(STORY_VILLAGES).forEach((id) => zoneIds.add(id))
    const pending: Record<string, AckState> = {}
    set((st) => ({
      broadcastAt: st.elapsed,
      fired: { ...st.fired, 'gate-broadcast': true },
      lastStepId: 'gate-broadcast',
      approved: true,
      approvalOpen: false,
      zoneVillageIds: [...zoneIds],
      villageAck: pending,
      screen: 'routing',
      phonesVisible: true,
      flashNonce: silent ? st.flashNonce : st.flashNonce + 1,
      kpi: { ...st.kpi, activeAlerts: st.kpi.activeAlerts + 1, districts: 10, sheltersOpen: 72 },
      reach: { delivered: 0, heard: 0, ack: 0, evac: 0 },
    }))
    sfx('siren')
    get().pushFeed('crit', 'alert', `EVACUATE alert broadcast · ${(impact?.villages ?? 0) + 0} villages · digitally signed`)
    get().toast('crit', 'Alert broadcast', 'Evacuation order issued to the danger zone')
  },

  // ---------------------------------------------------------------- phones

  setPhonesVisible: (phonesVisible) => set({ phonesVisible }),
  togglePhoneMin: (id) => set((s) => ({ phoneMin: { ...s.phoneMin, [id]: !s.phoneMin[id] } })),

  smartAlert: () => {
    if (get().smart.stage !== 'lock') return
    set((s) => ({ smart: { ...s.smart, stage: 'alert' } }))
    sfx('alert')
  },
  smartPatch: (p) => set((s) => ({ smart: { ...s.smart, ...p } })),
  smartSafe: () => {
    if (get().smart.safe) return
    set((s) => ({ smart: { ...s.smart, safe: true } }))
    sfx('success')
    get().ackVillage(STORY_VILLAGES.astaranga, 'ack', 'App check-in "I\'M SAFE" received')
  },
  smartSOS: () => {
    if (get().smart.sos) return
    set((s) => ({ smart: { ...s.smart, sos: true } }))
    get().addSOS(SOS_SEEDS.smartphone)
  },

  keypadRing: () => {
    if (get().keypad.stage !== 'idle') return
    set({ keypad: { stage: 'ringing', callStartedAt: null } })
    if (!silent) sound.loop('ring', 'ringtone', 1600)
  },
  keypadAnswer: () => {
    if (get().keypad.stage !== 'ringing') return
    sound.stopLoop('ring')
    set({ keypad: { stage: 'call', callStartedAt: performance.now() } })
    get().pushFeed('info', 'channel', 'IVR call connected — Astaranga (Odia voice)')
  },
  keypadKey: (key) => {
    const k = get().keypad
    if (k.stage === 'ringing' && (key === 'call' || key === 'enter')) return get().keypadAnswer()
    if (key === 'end') return get().keypadEnd()
    if (k.stage !== 'call' && k.stage !== 'shelter' && k.stage !== 'confirmed' && k.stage !== 'help') return
    sfx('click')
    if (key === '1') {
      set({ keypad: { ...k, stage: 'confirmed' } })
      sound.stopVoice()
      sfx('confirm')
      get().ackVillage(STORY_VILLAGES.astaranga, 'ack', 'IVR acknowledgement received')
    } else if (key === '2') {
      set({ keypad: { ...k, stage: 'shelter' } })
    } else if (key === '3') {
      set({ keypad: { ...k, stage: 'help' } })
      get().addSOS(SOS_SEEDS.keypad)
    }
  },
  keypadEnd: () => {
    sound.stopLoop('ring')
    sound.stopVoice()
    const k = get().keypad
    if (k.stage === 'idle' || k.stage === 'ended') return
    set({ keypad: { ...k, stage: 'ended' } })
  },

  volunteerTask: () => {
    if (get().volunteer.stage !== 'idle') return
    set((s) => ({ volunteer: { ...s.volunteer, stage: 'task' }, phonesVisible: true, phoneMin: { ...s.phoneMin, volunteer: false } }))
    sfx('vibrate')
    get().pushFeed('warn', 'rescue', 'Volunteer task auto-assigned: Kantiapada (12 households) → Aapda Mitra Sunita Behera')
  },
  volunteerAccept: () => {
    if (get().volunteer.stage !== 'task') return
    set((s) => ({ volunteer: { ...s.volunteer, stage: 'accepted' }, kpi: { ...s.kpi, volunteers: s.kpi.volunteers + 1 } }))
    sfx('confirm')
    get().pushFeed('info', 'rescue', 'Volunteer accepted task · ETA Kantiapada 14 min')
  },
  volunteerTick: (i) => {
    const v = get().volunteer
    if (v.stage !== 'accepted' || v.checked[i]) return
    const checked = v.checked.map((c, k) => (k === i ? true : c))
    set({ volunteer: { ...v, checked } })
    sfx('click')
    const n = checked.filter(Boolean).length
    const id = STORY_VILLAGES.kantiapada
    get().ackVillage(id, n >= checked.length ? 'ack' : 'partial')
    if (n === 1 || n === 6 || n === checked.length) {
      get().pushFeed(n === checked.length ? 'ok' : 'info', 'rescue', `Door-to-door: Kantiapada ${n}/${checked.length} households warned`)
    }
    if (n === checked.length) {
      set((s) => ({ sos: s.sos.map((x) => (x.villageId === id ? { ...x, status: 'rescued' } : x)) }))
      get().pulse(VILLAGE_BY_ID[id].lngLat, [74, 222, 128], 10)
    }
  },
  volunteerComplete: () => {
    const v = get().volunteer
    if (v.stage === 'done') return
    const checked = v.checked.map(() => true)
    set({ volunteer: { ...v, stage: 'done', checked } })
    get().ackVillage(STORY_VILLAGES.kantiapada, 'ack')
    set((s) => ({ sos: s.sos.map((x) => (x.villageId === STORY_VILLAGES.kantiapada ? { ...x, status: 'rescued' } : x)) }))
    sfx('success')
    get().pushFeed('ok', 'rescue', 'Volunteer task complete · Kantiapada all 12 households warned · volunteer safe')
    get().toast('ok', 'Kantiapada reached', 'All 12 households warned by volunteer')
  },

  // ---------------------------------------------------------------- rescue

  addSOS: (seed, source) => {
    const s = get()
    const existing = s.sos.find((x) => x.id === seed.id)
    if (existing) {
      set({ sos: s.sos.map((x) => (x.id === seed.id ? { ...x, merged: x.merged + 1 } : x)) })
      get().pushFeed('info', 'rescue', `Duplicate SOS merged · ${existing.place} (×${existing.merged + 1})`)
      return
    }
    const v = VILLAGE_BY_ID[seed.villageId] ?? VILLAGES[0]
    const item: SOSItem = {
      ...seed,
      source: source ?? seed.source,
      place: v.name,
      lngLat: v.lngLat,
      createdAt: s.elapsed,
      merged: 1,
      status: 'open',
    }
    set({ sos: [...s.sos, item] })
    sfx('sos')
    get().pushFeed('crit', 'rescue', `SOS · ${v.name} · ${seed.people} people · ${seed.tags.join(', ')} (${item.source})`)
    get().toast('crit', `SOS — ${v.name}`, `${seed.people} people · ${seed.tags[0]}`)
    get().pulse(v.lngLat, [239, 68, 68], 12)
  },

  assignTeam: (sosId) => {
    const s = get()
    const idx = s.sos.findIndex((x) => x.id === sosId)
    if (idx < 0 || s.sos[idx].status !== 'open') return
    set({ sos: s.sos.map((x) => (x.id === sosId ? { ...x, status: 'assigned', team: TEAMS[idx % TEAMS.length] } : x)) })
    sfx('confirm')
    get().pushFeed('info', 'rescue', `${TEAMS[idx % TEAMS.length]} assigned → ${s.sos[idx].place}`)
  },

  dispatchBoat: (sosId) => {
    const s = get()
    const target =
      (sosId ? s.sos.find((x) => x.id === sosId) : undefined) ??
      [...s.sos].filter((x) => x.status === 'open' || x.status === 'assigned').sort((a, b) => b.urgency - a.urgency)[0]
    if (!target || target.status === 'dispatched' || target.status === 'rescued') return
    const unit: RescueUnit = {
      id: `boat-${target.id}`,
      sosId: target.id,
      name: `NDRF Boat ${s.units.length + 3}`,
      path: boatRoute(target.villageId),
      startAt: s.elapsed,
      duration: 14,
      arrived: false,
    }
    set({
      units: [...s.units, unit],
      sos: s.sos.map((x) => (x.id === target.id ? { ...x, status: 'dispatched', team: x.team ?? unit.name } : x)),
    })
    sfx('whoosh')
    get().pushFeed('warn', 'rescue', `${unit.name} dispatched → ${target.place} · ETA 14 min`)
    get().toast('info', 'Boat dispatched', `${unit.name} → ${target.place}`)
  },

  arriveUnit: (unitId) => {
    const s = get()
    const u = s.units.find((x) => x.id === unitId)
    if (!u || u.arrived) return
    const target = s.sos.find((x) => x.id === u.sosId)
    set({
      units: s.units.map((x) => (x.id === unitId ? { ...x, arrived: true } : x)),
      sos: s.sos.map((x) => (x.id === u.sosId ? { ...x, status: 'rescued' } : x)),
      kpi: { ...s.kpi, rescued: s.kpi.rescued + (target?.people ?? 0) },
    })
    if (target) {
      get().ackVillage(target.villageId, 'ack')
      sfx('success')
      get().pushFeed('ok', 'rescue', `Rescued: ${target.people} people from ${target.place} · moving to shelter`)
      get().toast('ok', `Rescued: ${target.people} people`, `${target.place} · ${u.name}`)
      get().pulse(target.lngLat, [74, 222, 128], 14)
    }
  },

  droneDetect: () => {
    if (get().droneDetected) return
    set({ droneDetected: true })
    sfx('alert')
    get().pushFeed('crit', 'rescue', 'Drone D-3 thermal: 3 persons detected on rooftop · Sialia')
  },

  markForRescue: () => {
    if (get().droneMarked) return
    set({ droneMarked: true, droneDetected: true })
    get().addSOS(SOS_SEEDS.drone)
  },
}))

export function defaultZoneVillages() {
  return computeImpact({ type: 'Polygon', coordinates: [SUGGESTED_ZONE] }).villageIds
}

export const getState = () => useStore.getState()
