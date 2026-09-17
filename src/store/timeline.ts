import { sound } from '../audio/soundManager'
import { CHANNELS } from '../data/content'
import { SOS_SEEDS } from '../data/rescue'
import { STORY_VILLAGES, VILLAGE_BY_ID } from '../data/villages'
import { fmtCompact } from '../lib/format'
import { getState, isSilent, type Screen } from './scenarioStore'

export interface Step {
  id: string
  label: string
  /** seconds on the scenario clock; relative to the broadcast when `afterBroadcast` */
  at: number
  afterBroadcast?: boolean
  /** timeline pauses here until the official broadcasts */
  gate?: boolean
  screen?: Screen
  run: () => void
}

const s = getState

const channelSteps: Step[] = CHANNELS.filter((c) => c.id !== 'data').map((c, i) => ({
  id: `channel-${c.id}`,
  label: `Channel online · ${c.name}`,
  at: 4.2 + i * 0.6,
  afterBroadcast: true,
  screen: 'routing' as Screen,
  run: () => {
    s().setChannel(c.id, 'operational')
    if (!isSilent()) sound.play('chime')
    s().pushFeed('ok', 'channel', `${c.name} operational · ${c.desc.split('.')[0].toLowerCase()}`)
    if (i === 8) {
      s().set({ failoverPhase: 4 })
      s().pushFeed('ok', 'channel', 'Failover complete · 9 of 10 channels delivering')
    }
  },
}))

export const TIMELINE: Step[] = [
  {
    id: 'intro',
    label: 'Intro · fly to Odisha coast',
    at: 0,
    screen: 'command',
    run: () => {
      s().pushFeed('info', 'system', 'Raksha Mesh command centre online · 1,248 nodes connected')
    },
  },
  {
    id: 'cyclone-form',
    label: 'Cyclone VAYU-26 intensifies',
    at: 5,
    run: () => {
      s().pushFeed('warn', 'alert', 'IMD: VAYU-26 intensified into Extremely Severe Cyclonic Storm · 185 km/h')
      s().toast('warn', 'IMD Bulletin 14', 'VAYU-26 now Extremely Severe Cyclonic Storm')
      s().set({ kpi: { ...s().kpi, peopleInDanger: 248600, districts: 6 } })
    },
  },
  {
    id: 'cone',
    label: 'Forecast cone published',
    at: 11,
    run: () => {
      s().set({ layers: { ...s().layers, cone: true }, kpi: { ...s().kpi, peopleInDanger: 312900, districts: 7, activeAlerts: 5 } })
      s().pushFeed('warn', 'alert', 'Forecast cone updated · landfall between Paradip and Puri in ~42h')
    },
  },
  {
    id: 'towers-1',
    label: 'Coastal towers failing',
    at: 18,
    run: () => {
      s().failTowers(12)
      s().pushFeed('crit', 'system', '12 mobile towers offline near Ersama & Kujang · power loss')
      s().toast('crit', 'Tower outage', '12 BTS offline in Jagatsinghpur')
      s().pulse([86.4, 20.1], [239, 68, 68], 45)
    },
  },
  {
    id: 'flood-rise',
    label: 'Flood water rising in delta',
    at: 24,
    run: () => {
      s().set({ floodStage: 2, landslideActive: true })
      s().pushFeed('warn', 'alert', 'Mahanadi delta: flood extent expanding · Kathajodi above danger mark')
      s().pushFeed('warn', 'alert', 'Landslide risk HIGH · Daringbadi ghat road blocked')
    },
  },
  {
    id: 'towers-2',
    label: 'Mobile data backbone degraded',
    at: 30,
    run: () => {
      s().failTowers(34)
      s().set({ floodStage: 3 })
      s().pushFeed('crit', 'system', '34 towers down · mobile data backhaul lost across 3 districts')
      s().pulse([86.55, 20.4], [239, 68, 68], 60)
    },
  },
  {
    id: 'gate-broadcast',
    label: 'Awaiting official: draw zone & broadcast',
    at: 36,
    gate: true,
    screen: 'composer',
    run: () => {
      // Released by broadcast(); "Next" in the presenter auto-broadcasts with the suggested zone.
    },
  },
  {
    id: 'failover-attempt',
    label: 'Mobile Data attempting delivery',
    at: 0.3,
    afterBroadcast: true,
    screen: 'routing',
    run: () => {
      s().setChannel('data', 'attempting')
      s().set({ failoverPhase: 1 })
      s().pushFeed('info', 'channel', `Mobile Data: pushing to ${fmtCompact(s().impact?.population ?? 420000)} people via app…`)
    },
  },
  {
    id: 'phone-smart',
    label: 'Smartphone receives alert',
    at: 1.2,
    afterBroadcast: true,
    run: () => s().smartAlert(),
  },
  {
    id: 'failover-fail',
    label: 'Mobile Data FAILED',
    at: 2.5,
    afterBroadcast: true,
    screen: 'routing',
    run: () => {
      s().setChannel('data', 'failed')
      s().set({ failoverPhase: 2 })
      if (!isSilent()) sound.play('error')
      s().pushFeed('crit', 'channel', 'Mobile Data FAILED · cell latency timeout · delivered 0%')
    },
  },
  {
    id: 'failover-reroute',
    label: 'Intelligent failover active',
    at: 3.4,
    afterBroadcast: true,
    screen: 'routing',
    run: () => {
      s().set({ failoverPhase: 3 })
      if (!isSilent()) sound.play('whoosh')
      s().pushFeed('warn', 'channel', 'Intelligent failover: rerouting via CB, SMS, IVR, FM, TV, sirens, PA, satellite, mesh')
    },
  },
  ...channelSteps,
  {
    id: 'phone-keypad',
    label: 'Keypad phone rings (IVR)',
    at: 5,
    afterBroadcast: true,
    run: () => s().keypadRing(),
  },
  {
    id: 'ack-1',
    label: 'Acknowledgements · wave 1',
    at: 11,
    afterBroadcast: true,
    screen: 'reach',
    run: () => {
      s().ackWave(0.3)
      s().pushFeed('ok', 'alert', 'Acknowledgements arriving · app taps, IVR Press-1, missed calls')
    },
  },
  {
    id: 'ack-2',
    label: 'Acknowledgements · wave 2',
    at: 15,
    afterBroadcast: true,
    run: () => {
      s().ackWave(0.62)
      s().pushFeed('info', 'channel', 'Sirens activated in 48 zones · loudspeakers in 64 places of worship & markets')
    },
  },
  {
    id: 'ack-3',
    label: 'Acknowledgements · wave 3 + unreached',
    at: 19,
    afterBroadcast: true,
    run: () => {
      s().ackWave(0.86)
      s().markUnreached()
    },
  },
  {
    id: 'volunteer-task',
    label: 'Volunteer dispatched to Kantiapada',
    at: 21,
    afterBroadcast: true,
    run: () => {
      s().addSOS(SOS_SEEDS.kantiapada)
      s().volunteerTask()
    },
  },
  {
    id: 'sos-1',
    label: 'SOS · Balijhari (pregnant woman)',
    at: 25,
    afterBroadcast: true,
    screen: 'rescue',
    run: () => s().addSOS(SOS_SEEDS.balijhari),
  },
  {
    id: 'sos-2',
    label: 'SOS · Nuagaon (merged ×3)',
    at: 28,
    afterBroadcast: true,
    run: () => {
      s().addSOS(SOS_SEEDS.nuagaon)
      s().addSOS(SOS_SEEDS.nuagaonDup)
      s().addSOS(SOS_SEEDS.nuagaonDup)
      s().addSOS(SOS_SEEDS.livestock)
    },
  },
  {
    id: 'drone-detect',
    label: 'Drone detects people on rooftop',
    at: 32,
    afterBroadcast: true,
    screen: 'rescue',
    run: () => {
      s().droneDetect()
      s().addSOS(SOS_SEEDS.disability)
    },
  },
  {
    id: 'drone-mark',
    label: 'Rooftop marked for rescue',
    at: 37,
    afterBroadcast: true,
    run: () => s().markForRescue(),
  },
  {
    id: 'boat-dispatch',
    label: 'Boat dispatched to top priority',
    at: 41,
    afterBroadcast: true,
    screen: 'rescue',
    run: () => {
      if (s().units.length === 0) s().dispatchBoat()
    },
  },
  {
    id: 'volunteer-auto',
    label: 'Volunteer completes Kantiapada',
    at: 50,
    afterBroadcast: true,
    run: () => {
      const v = s().volunteer
      if (v.stage === 'task') s().volunteerAccept()
      // only auto-finish if the presenter hasn't started ticking manually
      if (!s().volunteer.checked.some(Boolean)) s().volunteerComplete()
    },
  },
  {
    id: 'boat-2',
    label: 'Second boat dispatched',
    at: 58,
    afterBroadcast: true,
    run: () => {
      const open = s().sos.filter((x) => x.status === 'open' || x.status === 'assigned')
      if (open.length) s().dispatchBoat()
    },
  },
  {
    id: 'summary',
    label: 'Final summary',
    at: 76,
    afterBroadcast: true,
    run: () => {
      s().ackWave(0.97)
      const v = VILLAGE_BY_ID[STORY_VILLAGES.nuagaon]
      if (s().villageAck[v.id] === 'unreached') s().ackVillage(v.id, 'partial')
      s().pushFeed('ok', 'system', 'Situation summary: 96% delivered · 88% acknowledged · all unreached villages contacted')
      s().toast('ok', 'Mission update', 'Every village in the zone has been contacted')
    },
  },
]

export const absoluteAt = (step: Step, broadcastAt: number | null) =>
  step.afterBroadcast ? (broadcastAt === null ? Infinity : broadcastAt + step.at) : step.at

/** Steps in firing order (post-broadcast steps sorted by relative time). */
export const ORDERED_STEPS: Step[] = [
  ...TIMELINE.filter((x) => !x.afterBroadcast),
  ...TIMELINE.filter((x) => x.afterBroadcast).sort((a, b) => a.at - b.at),
]
