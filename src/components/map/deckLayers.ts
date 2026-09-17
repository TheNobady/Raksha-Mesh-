import type { Layer } from '@deck.gl/core'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
import { TripsLayer } from '@deck.gl/geo-layers'
import { IconLayer, LineLayer, PathLayer, ScatterplotLayer, SolidPolygonLayer, TextLayer } from '@deck.gl/layers'
import {
  BLOCKED_ROAD, CONE, HEATWAVE_ZONES, LANDFALL, LANDSLIDE_ZONES, LIGHTNING_POINTS, RAIN_POINTS, SLIDE_PATH, SURGE_COAST,
  TRACK_PATH, TRACK_POINTS,
} from '../../data/hazards'
import { INDIA_LABEL_POINTS } from '../../data/indiaOutline'
import { LINKS, NETWORK_NODES, NODE_BY_ID, NODE_META, type InfraNode, type Link } from '../../data/infrastructure'
import { PATROL_ROUTES, RESCUE_BASE } from '../../data/rescue'
import { VILLAGES, type Village } from '../../data/villages'
import { cyclonePosition, landfallSeconds } from '../../lib/cyclone'
import { hms } from '../../lib/format'
import { alongPath, clamp, type LngLat } from '../../lib/geo'
import { useMapUi } from '../../lib/mapInstance'
import { flags } from '../../lib/quality'
import { mulberry32 } from '../../lib/prng'
import type { ScenarioState, SOSItem } from '../../store/scenarioStore'
import { clock } from '../../store/engine'
import { getIconAtlas } from './icons'

type RGBA = [number, number, number, number]
const FONT = 'Rajdhani, "Segoe UI", sans-serif'
// Stable references: new objects/arrays every frame would make deck.gl rebuild atlases and attributes
const FONT_SETTINGS = { sdf: true }
const ONE = [0]
const TWO = [0, 0.5]
const FOUR = [0, 1, 2, 3]
const CONE_DATA = [CONE]
const TRACK_DATA = [TRACK_PATH]
const SURGE_DATA = [SURGE_COAST]
const ROAD_DATA = [BLOCKED_ROAD]
const ROAD_MID = [BLOCKED_ROAD[Math.floor(BLOCKED_ROAD.length / 2)]]
const BASE_DATA = [RESCUE_BASE]
const WIND_RINGS = [
  { r: 210000, c: [245, 158, 11] },
  { r: 120000, c: [249, 115, 22] },
  { r: 62000, c: [239, 68, 68] },
]
const RAIN_COLORS: [number, number, number][] = [[30, 58, 138], [37, 99, 235], [56, 189, 248], [34, 211, 238], [167, 243, 208], [250, 250, 250]]


// ------------------------------------------------------------------ static data

const LOOP = 1000
const rand = mulberry32(99)

interface Trip {
  path: [number, number, number][]
  timestamps: number[]
  color: [number, number, number]
}

function tripFor(link: Link, color: [number, number, number]): Trip {
  const n = link.path.length
  const dur = link.kind === 'backbone' ? 140 + link.length * 0.12 : link.kind === 'regional' ? 90 + link.length * 0.4 : 40 + link.length * 1.6
  const start = rand() * (LOOP - dur)
  return {
    path: link.path,
    timestamps: link.path.map((_, i) => start + (i / (n - 1)) * dur),
    color,
  }
}

const ARC_LINKS = LINKS.filter((l) => l.kind === 'backbone' || l.kind === 'regional')
const FLAT_LINKS = LINKS.filter((l) => l.kind === 'local' || l.kind === 'mesh')
const TRIPS: Trip[] = [
  ...ARC_LINKS.map((l) => tripFor(l, l.kind === 'backbone' ? [103, 232, 249] : [134, 239, 172])),
  ...ARC_LINKS.filter((l) => l.kind === 'backbone').map((l) => tripFor(l, [165, 243, 252])),
  ...FLAT_LINKS.map((l) => tripFor(l, l.kind === 'mesh' ? [94, 234, 212] : [74, 222, 128])),
]

const HALO_TYPES = new Set(['command', 'fm', 'tv', 'satellite', 'shelter', 'hospital'])
const HALO_NODES = NETWORK_NODES.filter((n) => HALO_TYPES.has(n.type))

interface RainParticle {
  r: number
  a0: number
  w: number
  size: number
  band: 'rain' | 'wind'
}
const RAIN_ALL: RainParticle[] = Array.from({ length: 900 }, () => ({ r: 25 + Math.pow(rand(), 0.7) * 260, a0: rand() * Math.PI * 2, w: 0.6 + rand() * 0.8, size: 1 + rand() * 1.6, band: 'rain' as const }))
const WIND_ALL: RainParticle[] = Array.from({ length: 420 }, () => ({ r: 280 + rand() * 520, a0: rand() * Math.PI * 2, w: 0.3 + rand() * 0.4, size: 1 + rand(), band: 'wind' as const }))

const SPIRAL_ARMS: { r: number; a0: number }[][] = [0, 1, 2].map((arm) =>
  Array.from({ length: 60 }, (_, i) => ({ r: 40 + i * 5.2, a0: (arm * Math.PI * 2) / 3 + i * 0.075 })),
)

const SPIRAL_DATA = SPIRAL_ARMS.flat()

function offsetKm(center: LngLat, xKm: number, yKm: number): [number, number] {
  return [center[0] + xKm / (111.32 * Math.cos((center[1] * Math.PI) / 180)), center[1] + yKm / 111.32]
}

// ------------------------------------------------------------------ helpers

const ACK_COLOR: Record<string, RGBA> = {
  pending: [148, 163, 184, 170],
  ack: [74, 222, 128, 235],
  partial: [245, 158, 11, 235],
  unreached: [239, 68, 68, 255],
}

let villageCache: { key: string; data: Village[] } = { key: '', data: [] }

/** memoise derived arrays on the identity of their source so deck.gl sees stable data */
function memo<K, T>(fn: (k: K) => T) {
  let lastK: K | undefined
  let lastV: T | undefined
  let init = false
  return (k: K) => {
    if (!init || k !== lastK) {
      lastK = k
      lastV = fn(k)
      init = true
    }
    return lastV as T
  }
}
const COMMANDS = NETWORK_NODES.filter((n) => n.type === 'command')
const downedTowers = memo((down: Record<string, true>) => NETWORK_NODES.filter((n) => down[n.id]))

interface BoatState { id: string; name: string; f: number; arrived: boolean; path: LngLat[] }
interface UnitLabel { p: LngLat; text: string }
let unitLabelCache: { key: string; data: UnitLabel[] } = { key: '', data: [] }
/**
 * Text layout is expensive, so the ETA label sits at the destination village
 * (not on the moving boat) and only changes when the ETA minute changes.
 */
function unitLabels(boats: BoatState[]): UnitLabel[] {
  const live = boats.filter((b) => !b.arrived)
  const key = live.map((b) => `${b.id}:${Math.ceil((1 - b.f) * 14)}`).join('|')
  if (unitLabelCache.key !== key) {
    unitLabelCache = {
      key,
      data: live.map((b) => ({ p: b.path[b.path.length - 1], text: `${b.name} · ETA ${Math.max(0, Math.ceil((1 - b.f) * 14))} min` })),
    }
  }
  return unitLabelCache.data
}
const zoneVillages = memo((ids: string[] | null) => {
  const set = new Set(ids ?? [])
  return VILLAGES.filter((v) => set.has(v.id))
})
const STORY_NAMES = ['Kantiapada', 'Balijhari', 'Nuagaon']
const unreachedOf = memo((ack: Record<string, string>) =>
  VILLAGES.filter((v) => ack[v.id] === 'unreached' || (ack[v.id] === 'partial' && STORY_NAMES.includes(v.name))),
)
const openSos = memo((sos: SOSItem[]) => sos.filter((x) => x.status !== 'rescued'))

function nodeColor(n: InfraNode, down: boolean, dim: number): RGBA {
  if (down) return [239, 68, 68, 230 * dim]
  const c = NODE_META[n.type].color
  return [c[0], c[1], c[2], 230 * dim]
}

// ------------------------------------------------------------------ build

export function buildLayers(s: ScenarioState, nowMs: number): Layer[] {
  const t = nowMs / 1000
  const L = s.layers
  const screen = s.screen
  const composer = screen === 'composer'
  const reach = screen === 'reach'
  const rescue = screen === 'rescue'
  const networkDim = composer ? 0.35 : reach || rescue ? 0.28 : 1
  const eye = cyclonePosition(clock.t)
  // Reach & Rescue zoom in on villages; the storm graphics would swamp them
  const stormView = !reach && !rescue
  const q = flags()
  const eyeCoarse: LngLat = [Math.round(eye[0] * 400) / 400, Math.round(eye[1] * 400) / 400]
  const layers: Layer[] = []
  const pulse = (speed: number, phase = 0) => 0.5 + 0.5 * Math.sin(t * speed + phase)

  // ---------- heatwave / rainfall (lowest)
  if (L.heatwave) {
    layers.push(
      new SolidPolygonLayer({
        id: 'heatwave',
        data: HEATWAVE_ZONES,
        getPolygon: (d: LngLat[]) => d,
        getFillColor: [249, 115, 22, 70],
        opacity: 0.6 + 0.3 * pulse(1.2),
      }),
    )
  }
  if (L.rainfall) {
    layers.push(
      new HeatmapLayer({
        id: 'rainfall',
        data: RAIN_POINTS,
        getPosition: (d: (typeof RAIN_POINTS)[number]) => d.at,
        getWeight: (d: (typeof RAIN_POINTS)[number]) => d.w,
        radiusPixels: 60,
        intensity: 1.2,
        threshold: 0.05,
        colorRange: RAIN_COLORS,
        opacity: 0.55,
      }),
    )
  }

  // ---------- cone + track
  if (L.cone && stormView) {
    layers.push(
      new SolidPolygonLayer({
        id: 'cone-fill',
        data: CONE_DATA,
        getPolygon: (d: LngLat[]) => d,
        getFillColor: [245, 158, 11, 38],
      }),
      new PathLayer({
        id: 'cone-edge',
        data: CONE_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [251, 191, 36, 150],
        getWidth: 1.5,
        widthUnits: 'pixels',
      }),
    )
  }
  if (L.cyclone && stormView) {
    layers.push(
      new PathLayer({
        id: 'track-glow',
        data: TRACK_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [244, 63, 94, 60],
        getWidth: 9,
        widthUnits: 'pixels',
      }),
      new PathLayer({
        id: 'track',
        data: TRACK_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [254, 205, 211, 220],
        getWidth: 2,
        widthUnits: 'pixels',
      }),
      new ScatterplotLayer({
        id: 'track-points',
        data: TRACK_POINTS,
        getPosition: (d: (typeof TRACK_POINTS)[number]) => d.at,
        getRadius: 5,
        radiusUnits: 'pixels',
        getFillColor: [3, 7, 18, 255],
        getLineColor: [251, 113, 133, 255],
        stroked: true,
        lineWidthMinPixels: 2,
      }),
      new TextLayer({
        id: 'track-labels',
        data: TRACK_POINTS,
        getPosition: (d: (typeof TRACK_POINTS)[number]) => d.at,
        getText: (d: (typeof TRACK_POINTS)[number]) => d.label,
        getSize: 13,
        getColor: [254, 226, 226, 235],
        getPixelOffset: [12, 0],
        getTextAnchor: 'start',
        fontFamily: FONT,
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [3, 7, 18, 255],
        fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
      }),
    )
  }

  // ---------- flood/landslide/surge
  if (L.landslide && s.landslideActive) {
    const p = pulse(2.2)
    layers.push(
      new SolidPolygonLayer({
        id: 'landslide',
        data: LANDSLIDE_ZONES,
        getPolygon: (d: (typeof LANDSLIDE_ZONES)[number]) => d.ring,
        getFillColor: (d: (typeof LANDSLIDE_ZONES)[number]) => (d.level === 'high' ? [239, 68, 68, 90] : [245, 158, 11, 80]),
        opacity: 0.5 + 0.5 * p,
      }),
      new PathLayer({
        id: 'landslide-edge',
        data: LANDSLIDE_ZONES,
        getPath: (d: (typeof LANDSLIDE_ZONES)[number]) => d.ring,
        getColor: (d: (typeof LANDSLIDE_ZONES)[number]) => (d.level === 'high' ? [248, 113, 113, 220] : [251, 191, 36, 200]),
        getWidth: 1.5,
        widthUnits: 'pixels',
      }),
      new TripsLayer({
        id: 'slide-flow',
        data: FOUR,
        getPath: () => SLIDE_PATH,
        getTimestamps: (d: number) => SLIDE_PATH.map((_, i) => d * 25 + (i / (SLIDE_PATH.length - 1)) * 60),
        getColor: [180, 110, 60],
        getWidth: 7,
        widthUnits: 'pixels',
        trailLength: 45,
        currentTime: (t * 40) % 160,
        capRounded: true,
      }),
      new PathLayer({
        id: 'blocked-road',
        data: ROAD_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [239, 68, 68, 150 + 100 * p],
        getWidth: 4,
        widthUnits: 'pixels',
      }),
      new IconLayer({
        id: 'blocked-icon',
        data: ROAD_MID,
        iconAtlas: getIconAtlas().canvas as unknown as string,
        iconMapping: getIconAtlas().mapping,
        getIcon: () => 'blocked',
        getPosition: (d: LngLat) => d,
        getSize: 20,
        sizeUnits: 'pixels',
      }),
      new TextLayer({
        id: 'blocked-text',
        data: ROAD_MID,
        getPosition: (d: LngLat) => d,
        getText: () => 'ROAD BLOCKED · LANDSLIDE',
        getSize: 12,
        getColor: [254, 202, 202, 255],
        getPixelOffset: [0, 20],
        fontFamily: FONT,
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [40, 0, 0, 255],
        fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
      }),
    )
  }
  if (L.surge) {
    layers.push(
      new PathLayer({
        id: 'surge-glow',
        data: SURGE_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [244, 63, 94, 90],
        getWidth: 16,
        widthUnits: 'pixels',
        opacity: 0.4 + 0.6 * pulse(1.6),
      }),
      new PathLayer({
        id: 'surge',
        data: SURGE_DATA,
        getPath: (d: LngLat[]) => d,
        getColor: [251, 113, 133, 230],
        getWidth: 2.5,
        widthUnits: 'pixels',
      }),
    )
  }

  // ---------- network
  if (L.network) {
    layers.push(
      new LineLayer({
        id: 'links-flat',
        data: FLAT_LINKS,
        getSourcePosition: (d: Link) => d.path[0],
        getTargetPosition: (d: Link) => d.path[d.path.length - 1],
        getColor: (d: Link) => {
          const down = s.towersDown[d.from] || s.towersDown[d.to]
          if (down) return [239, 68, 68, 60 * networkDim]
          return d.kind === 'mesh' ? [45, 212, 191, 70 * networkDim] : [74, 222, 128, 55 * networkDim]
        },
        getWidth: 1,
        widthUnits: 'pixels',
        updateTriggers: { getColor: [s.towersDown, networkDim] },
      }),
      ...(q.glowDuplicates
        ? [new PathLayer({
        id: 'arcs-glow',
        data: ARC_LINKS,
        getPath: (d: Link) => d.path,
        getColor: (d: Link) => (d.kind === 'backbone' ? [34, 211, 238, 40 * networkDim] : [74, 222, 128, 40 * networkDim]),
        getWidth: 5,
        widthUnits: 'pixels',
        updateTriggers: { getColor: networkDim },
      })]
        : []),
      new PathLayer({
        id: 'arcs',
        data: ARC_LINKS,
        getPath: (d: Link) => d.path,
        getColor: (d: Link) => (d.kind === 'backbone' ? [103, 232, 249, 150 * networkDim] : [134, 239, 172, 130 * networkDim]),
        getWidth: 1.2,
        widthUnits: 'pixels',
        updateTriggers: { getColor: networkDim },
      }),
    )
    if (L.packets && q.packets && !composer) {
      layers.push(
        new TripsLayer({
          id: 'packets',
          data: TRIPS,
          getPath: (d: Trip) => d.path,
          getTimestamps: (d: Trip) => d.timestamps,
          getColor: (d: Trip) => d.color,
          getWidth: 3,
          widthUnits: 'pixels',
          trailLength: 26,
          currentTime: (t * 42) % LOOP,
          capRounded: true,
          jointRounded: true,
          opacity: networkDim,
        }),
      )
    }
    if (q.haloNodes) {
      const p = pulse(2.4)
      layers.push(
        new ScatterplotLayer({
          id: 'halo',
          data: HALO_NODES,
          getPosition: (d: InfraNode) => d.lngLat,
          getRadius: (d: InfraNode) => NODE_META[d.type].radius * 2.2,
          radiusUnits: 'pixels',
          radiusScale: 0.8 + p * 0.9,
          getFillColor: (d: InfraNode) => {
            const c = NODE_META[d.type].color
            return [c[0], c[1], c[2], 55]
          },
          opacity: (1 - p * 0.7) * networkDim,
        }),
      )
    }
    // downed towers always keep their red warning halo
    const downList = downedTowers(s.towersDown)
    if (downList.length) {
      const p = pulse(3.2)
      layers.push(
        new ScatterplotLayer({
          id: 'halo-down',
          data: downList,
          getPosition: (d: InfraNode) => d.lngLat,
          getRadius: 9,
          radiusUnits: 'pixels',
          radiusScale: 0.7 + p * 0.8,
          getFillColor: [239, 68, 68, 70],
          opacity: (1 - p * 0.6) * networkDim,
        }),
      )
    }
    layers.push(
      new ScatterplotLayer({
        id: 'nodes',
        data: NETWORK_NODES,
        pickable: true,
        getPosition: (d: InfraNode) => d.lngLat,
        getRadius: (d: InfraNode) => NODE_META[d.type].radius,
        radiusUnits: 'pixels',
        radiusMinPixels: 2,
        getFillColor: (d: InfraNode) => nodeColor(d, !!s.towersDown[d.id], networkDim),
        getLineColor: (d: InfraNode) => (s.towersDown[d.id] ? [254, 202, 202, 255] : [236, 254, 255, 200 * networkDim]),
        stroked: true,
        lineWidthMinPixels: 0.6,
        onHover: (info) => {
          const o = info.object as InfraNode | undefined
          useMapUi.setState({ hover: o ? { x: info.x, y: info.y, id: o.id, kind: 'node' } : null })
        },
        onClick: (info) => {
          const o = info.object as InfraNode | undefined
          if (o) s.set({ selectedNodeId: o.id })
        },
        updateTriggers: { getFillColor: [s.towersDown, networkDim], getLineColor: [s.towersDown, networkDim] },
      }),
    )
    // command centres get a labelled beacon
    const commands = COMMANDS
    layers.push(
      new ScatterplotLayer({
        id: 'command-rings',
        data: commands,
        getPosition: (d: InfraNode) => d.lngLat,
        getRadius: 14,
        radiusUnits: 'pixels',
        radiusScale: 1 + pulse(3) * 0.6,
        stroked: true,
        filled: false,
        getLineColor: [34, 211, 238, 200],
        lineWidthMinPixels: 1.5,
        opacity: (1 - pulse(3) * 0.6) * networkDim,
      }),
    )
  }

  // ---------- villages
  const zoneSet = s.impact ? s.impact.villageIds : null
  const broadcast = s.broadcastAt !== null
  if (L.villages) {
    const key = `${zoneSet?.length ?? 0}-${broadcast}-${screen}`
    if (villageCache.key !== key) villageCache = { key, data: VILLAGES }
    const inZone = zoneSet ? new Set(zoneSet) : null
    const showStrong = composer || reach || rescue || broadcast
    layers.push(
      new ScatterplotLayer({
        id: 'villages',
        data: villageCache.data,
        pickable: showStrong,
        getPosition: (d: Village) => d.lngLat,
        getRadius: (d: Village) => 2.2 + Math.sqrt(d.population) / 22,
        radiusUnits: 'pixels',
        getFillColor: (d: Village): RGBA => {
          const st = s.villageAck[d.id]
          if (broadcast && (reach || rescue || screen === 'command')) {
            if (st) return ACK_COLOR[st]
            return s.zoneVillageIds.includes(d.id) ? [148, 163, 184, 140] : [71, 85, 105, 80]
          }
          if (composer || screen === 'command') {
            if (inZone) return inZone.has(d.id) ? [251, 191, 36, 245] : [71, 85, 105, 110]
            return composer ? [203, 213, 225, 170] : [148, 163, 184, 90]
          }
          return st ? ACK_COLOR[st] : [148, 163, 184, 110]
        },
        getLineColor: (d: Village): RGBA => {
          const st = s.villageAck[d.id]
          if (st === 'ack') return [187, 247, 208, 255]
          if (st === 'unreached') return [254, 202, 202, 255]
          if (inZone?.has(d.id)) return [254, 243, 199, 255]
          return [15, 23, 42, 120]
        },
        stroked: true,
        lineWidthMinPixels: 0.8,
        radiusScale: showStrong ? 1 : 0.8,
        transitions: { getFillColor: 600 },
        onHover: (info) => {
          const o = info.object as Village | undefined
          useMapUi.setState({ hover: o ? { x: info.x, y: info.y, id: o.id, kind: 'village' } : null })
        },
        updateTriggers: { getFillColor: [s.villageAck, key, s.zoneVillageIds], getLineColor: [s.villageAck, key] },
      }),
    )
    if (inZone && composer) {
      layers.push(
        new ScatterplotLayer({
          id: 'village-zone-glow',
          data: zoneVillages(zoneSet),
          getPosition: (d: Village) => d.lngLat,
          getRadius: (d: Village) => 6 + Math.sqrt(d.population) / 14,
          radiusUnits: 'pixels',
          getFillColor: [251, 191, 36, 50],
          radiusScale: 0.9 + pulse(3) * 0.4,
        }),
      )
    }
    // unreached villages pulse + label
    const unreached = unreachedOf(s.villageAck)
    if (unreached.length) {
      const p = (t * 0.8) % 1
      layers.push(
        new ScatterplotLayer({
          id: 'unreached-ring',
          data: unreached,
          getPosition: (d: Village) => d.lngLat,
          getRadius: 8 + p * 26,
          radiusUnits: 'pixels',
          stroked: true,
          filled: false,
          getLineColor: (d: Village) => (s.villageAck[d.id] === 'partial' ? [245, 158, 11, 255 * (1 - p)] : [239, 68, 68, 255 * (1 - p)]),
          lineWidthMinPixels: 2,
          updateTriggers: { getLineColor: [p, s.villageAck] },
        }),
        new TextLayer({
          id: 'unreached-label',
          data: unreached,
          getPosition: (d: Village) => d.lngLat,
          getText: (d: Village) => `${d.name.toUpperCase()} · ${s.villageAck[d.id] === 'partial' ? 'REACHING' : 'UNREACHED'}`,
          getSize: 12,
          getColor: (d: Village) => (s.villageAck[d.id] === 'partial' ? [253, 230, 138, 255] : [254, 202, 202, 255]),
          getPixelOffset: [0, -18],
          fontFamily: FONT,
          fontWeight: 700,
          outlineWidth: 3,
          outlineColor: [30, 0, 0, 255],
          fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
          updateTriggers: { getText: s.villageAck, getColor: s.villageAck },
        }),
      )
    }
  }

  // ---------- SOS markers + rescue units
  if (s.sos.length && (rescue || screen === 'command' || reach)) {
    const p = (t * 1.1) % 1
    layers.push(
      new ScatterplotLayer({
        id: 'sos-rings',
        data: openSos(s.sos),
        getPosition: (d: SOSItem) => d.lngLat,
        getRadius: 6 + p * 22,
        radiusUnits: 'pixels',
        stroked: true,
        filled: false,
        getLineColor: [248, 113, 113, 255 * (1 - p)],
        lineWidthMinPixels: 2,
        updateTriggers: { getLineColor: p },
      }),
      new ScatterplotLayer({
        id: 'sos-core',
        data: s.sos,
        pickable: true,
        getPosition: (d: SOSItem) => d.lngLat,
        getRadius: 6,
        radiusUnits: 'pixels',
        getFillColor: (d: SOSItem) => (d.status === 'rescued' ? [74, 222, 128, 255] : [239, 68, 68, 255]),
        getLineColor: [255, 255, 255, 230],
        stroked: true,
        lineWidthMinPixels: 1.5,
        updateTriggers: { getFillColor: s.sos },
        onHover: (info) => {
          const o = info.object as SOSItem | undefined
          useMapUi.setState({ hover: o ? { x: info.x, y: info.y, id: o.id, kind: 'sos' } : null })
        },
      }),
    )
  }

  if (rescue || screen === 'command') {
    const atlas = getIconAtlas()
    const patrols = PATROL_ROUTES.map((r) => {
      const f = ((t / r.period) % 1 + 1) % 1
      const { p, bearing } = alongPath(r.path, f)
      return { id: r.id, kind: r.kind, name: r.name, p, bearing }
    })
    const boats = s.units.map((u) => {
      const f = clamp((clock.t - u.startAt) / u.duration)
      const { p, bearing } = alongPath(u.path, f)
      return { id: u.id, kind: 'boat', name: u.name, p, bearing, f, arrived: u.arrived }
    })
    if (s.units.length) {
      layers.push(
        new PathLayer({
          id: 'boat-routes-glow',
          data: s.units,
          getPath: (d: ScenarioState['units'][number]) => d.path,
          getColor: [34, 211, 238, 50],
          getWidth: 10,
          widthUnits: 'pixels',
        }),
        new TripsLayer({
          id: 'boat-routes',
          data: s.units,
          getPath: (d: ScenarioState['units'][number]) => d.path,
          getTimestamps: (d: ScenarioState['units'][number]) => d.path.map((_, i) => (i / (d.path.length - 1)) * 100),
          getColor: [103, 232, 249],
          getWidth: 3,
          widthUnits: 'pixels',
          trailLength: 100,
          currentTime: 100,
        }),
      )
    }
    layers.push(
      new ScatterplotLayer({
        id: 'rescue-base',
        data: BASE_DATA,
        getPosition: (d: typeof RESCUE_BASE) => d.at,
        getRadius: 9,
        radiusUnits: 'pixels',
        getFillColor: [250, 204, 21, 230],
        getLineColor: [17, 24, 39, 255],
        stroked: true,
        lineWidthMinPixels: 2,
      }),
      new IconLayer({
        id: 'units',
        data: [...patrols, ...boats],
        iconAtlas: atlas.canvas as unknown as string,
        iconMapping: atlas.mapping,
        getIcon: (d: { kind: string }) => d.kind,
        getPosition: (d: { p: LngLat }) => d.p,
        getAngle: (d: { bearing: number; kind: string }) => (d.kind === 'ndrf' ? 0 : -d.bearing),
        getSize: (d: { kind: string }) => (d.kind === 'boat' ? 34 : d.kind === 'heli' ? 30 : d.kind === 'ndrf' ? 34 : 22),
        sizeUnits: 'pixels',
        billboard: false,
        updateTriggers: { getPosition: t, getAngle: t },
      }),
      new TextLayer({
        id: 'unit-labels',
        data: unitLabels(s.units.map((u) => ({ id: u.id, name: u.name, arrived: u.arrived, path: u.path, f: clamp((clock.t - u.startAt) / u.duration) }))),
        getPosition: (d: UnitLabel) => d.p,
        getText: (d: UnitLabel) => d.text,
        getSize: 11,
        getColor: [224, 242, 254, 240],
        getPixelOffset: [0, -24],
        fontFamily: FONT,
        fontWeight: 700,
        outlineWidth: 3,
        outlineColor: [3, 7, 18, 255],
        fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
      }),
    )
  }

  // ---------- cyclone (on top of land features)
  if (L.cyclone && stormView) {
    const spin = (t * 70) % 360
    if (L.windRings) {
      const p = pulse(2)
      layers.push(
        new ScatterplotLayer({
          id: 'wind-rings',
          data: WIND_RINGS,
          getPosition: () => eye,
          getRadius: (d: { r: number }) => d.r,
          radiusScale: 0.96 + p * 0.06,
          getFillColor: (d: { c: number[]; r: number }) => [d.c[0], d.c[1], d.c[2], d.r < 70000 ? 22 : 0],
          filled: true,
          getLineColor: (d: { c: number[] }) => [d.c[0], d.c[1], d.c[2], 190],
          stroked: true,
          lineWidthMinPixels: 1.5,
          updateTriggers: { getPosition: eye },
        }),
      )
    }
    if (L.rain && q.rainParticles) {
      const pts = [...RAIN_ALL.slice(0, q.rainParticles), ...WIND_ALL.slice(0, q.windParticles)].map((pp) => {
        const ang = pp.a0 + t * pp.w * (pp.band === 'rain' ? 140 / pp.r : 60 / pp.r) * 2
        const inward = pp.band === 'rain' ? ((t * 12 * pp.w + pp.a0 * 40) % 60) : 0
        const r = pp.r - inward
        return { p: offsetKm(eye, Math.cos(ang) * r, Math.sin(ang) * r), band: pp.band, size: pp.size, r }
      })
      layers.push(
        new ScatterplotLayer({
          id: 'rain',
          data: pts,
          getPosition: (d: { p: [number, number] }) => d.p,
          getRadius: (d: { size: number }) => d.size,
          radiusUnits: 'pixels',
          getFillColor: (d: { band: string; r: number }) =>
            d.band === 'rain' ? [191, 219, 254, Math.max(40, 200 - d.r * 0.6)] : [103, 232, 249, 70],
          updateTriggers: { getPosition: t, getFillColor: t },
        }),
      )
    }
    // spiral cloud bands drawn as rotating point streams (high quality only)
    layers.push(
      ...(q.spiralBands
        ? [new ScatterplotLayer({
        id: 'spiral-bands',
        data: SPIRAL_DATA,
        getPosition: (d: { r: number; a0: number }) => {
          const a = d.a0 + (spin * Math.PI) / 180
          return offsetKm(eye, Math.cos(a) * d.r, Math.sin(a) * d.r)
        },
        getRadius: (d: { r: number }) => 9000 + d.r * 40,
        getFillColor: (d: { r: number }) => [226, 242, 254, Math.max(10, 70 - d.r * 0.18)],
        updateTriggers: { getPosition: [t, eye] },
      })]
        : []),
      new IconLayer({
        id: 'cyclone',
        data: ONE,
        iconAtlas: getIconAtlas().canvas as unknown as string,
        iconMapping: getIconAtlas().mapping,
        getIcon: () => 'cyclone',
        getPosition: () => eye,
        getSize: 260000,
        sizeUnits: 'meters',
        sizeMinPixels: 70,
        sizeMaxPixels: composer ? 340 : 440,
        getAngle: spin,
        billboard: false,
        updateTriggers: { getPosition: eye, getAngle: spin },
      }),
      new TextLayer({
        id: 'cyclone-name',
        data: ONE,
        getPosition: () => eyeCoarse,
        getText: () => 'VAYU-26 · ESCS · 185 km/h',
        getSize: 14,
        getColor: [255, 255, 255, 255],
        getPixelOffset: [0, 64],
        fontFamily: FONT,
        fontWeight: 700,
        outlineWidth: 4,
        outlineColor: [127, 29, 29, 255],
        fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
        updateTriggers: { getPosition: eyeCoarse.join() },
      }),
    )
    // landfall marker
    const lp = (t * 0.9) % 1
    layers.push(
      new ScatterplotLayer({
        id: 'landfall-ring',
        data: TWO,
        getPosition: () => LANDFALL,
        getRadius: (d: number) => 6 + (((lp + d) % 1) * 30),
        radiusUnits: 'pixels',
        stroked: true,
        filled: false,
        getLineColor: (d: number) => [244, 63, 94, 255 * (1 - ((lp + d) % 1))],
        lineWidthMinPixels: 2,
        updateTriggers: { getRadius: lp, getLineColor: lp },
      }),
      new ScatterplotLayer({
        id: 'landfall-core',
        data: ONE,
        getPosition: () => LANDFALL,
        getRadius: 5,
        radiusUnits: 'pixels',
        getFillColor: [244, 63, 94, 255],
        getLineColor: [255, 255, 255, 255],
        stroked: true,
        lineWidthMinPixels: 1.5,
      }),
      new TextLayer({
        id: 'landfall-text',
        data: ONE,
        getPosition: () => LANDFALL,
        getText: () => `LANDFALL IN ${hms(landfallSeconds(clock.t))}`,
        getSize: 13,
        getColor: [255, 228, 230, 255],
        getPixelOffset: [16, 26],
        getTextAnchor: 'start',
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        outlineWidth: 4,
        outlineColor: [76, 5, 25, 255],
        fontSettings: FONT_SETTINGS,
        characterSet: 'auto',
        updateTriggers: { getText: Math.floor(clock.t) },
      }),
    )
  }

  // ---------- lightning
  if (L.lightning && q.lightning) {
    const slot = Math.floor(t / 0.37)
    const phase = (t / 0.37) % 1
    if (phase < 0.35) {
      const r = mulberry32(slot)
      const pts = [LIGHTNING_POINTS[Math.floor(r() * LIGHTNING_POINTS.length)], ...(r() < 0.4 ? [LIGHTNING_POINTS[Math.floor(r() * LIGHTNING_POINTS.length)]] : [])]
      const bolts = pts.map((p) => {
        const segs: LngLat[] = [[p[0], p[1] + 0.12]]
        for (let i = 1; i <= 4; i++) segs.push([p[0] + (r() - 0.5) * 0.05, p[1] + 0.12 - i * 0.03])
        return segs
      })
      layers.push(
        new ScatterplotLayer({
          id: 'lightning-flash',
          data: pts,
          getPosition: (d: LngLat) => d,
          getRadius: 16000,
          getFillColor: [216, 180, 254, 120 * (1 - phase / 0.35)],
          updateTriggers: { getFillColor: phase },
        }),
        new PathLayer({
          id: 'lightning-bolt',
          data: bolts,
          getPath: (d: LngLat[]) => d,
          getColor: [250, 245, 255, 255 * (1 - phase / 0.35)],
          getWidth: 2,
          widthUnits: 'pixels',
          updateTriggers: { getColor: phase },
        }),
      )
    }
  }

  // ---------- map pulses (action feedback)
  const live = s.pulses.filter((p) => nowMs - p.t0 < 3000)
  if (live.length) {
    const rings = live.flatMap((p) => [0, 0.33].map((off) => ({ p, f: clamp((nowMs - p.t0) / 3000 - off, 0, 1) })))
    layers.push(
      new ScatterplotLayer({
        id: 'pulses',
        data: rings,
        getPosition: (d: (typeof rings)[number]) => d.p.at,
        getRadius: (d: (typeof rings)[number]) => d.f * d.p.radiusKm * 1000,
        stroked: true,
        filled: true,
        getFillColor: (d: (typeof rings)[number]) => [...d.p.color, 40 * (1 - d.f)] as RGBA,
        getLineColor: (d: (typeof rings)[number]) => [...d.p.color, 255 * (1 - d.f)] as RGBA,
        lineWidthMinPixels: 2,
        updateTriggers: { getRadius: nowMs, getFillColor: nowMs, getLineColor: nowMs },
      }),
    )
  }

  // ---------- region labels
  layers.push(
    new TextLayer({
      id: 'region-labels',
      data: INDIA_LABEL_POINTS,
      getPosition: (d: (typeof INDIA_LABEL_POINTS)[number]) => d.at,
      getText: (d: (typeof INDIA_LABEL_POINTS)[number]) => d.name,
      getSize: (d: (typeof INDIA_LABEL_POINTS)[number]) => d.size,
      getColor: [125, 211, 252, 150],
      fontFamily: FONT,
      fontWeight: 700,
      characterSet: 'auto',
      fontSettings: FONT_SETTINGS,
      outlineWidth: 2,
      outlineColor: [3, 7, 18, 200],
    }),
  )

  return layers
}

export function hoverObject(h: { id: string; kind: string }) {
  if (h.kind === 'node') return NODE_BY_ID[h.id]
  return null
}
