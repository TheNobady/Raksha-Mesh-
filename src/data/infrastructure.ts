import { arc3d, inRing, km, type LngLat } from '../lib/geo'
import { int, mulberry32, pick, range } from '../lib/prng'
import { DISTRICTS, districtOf, onLand } from './geography'
import { INDIA_RING } from './indiaOutline'

export type NodeType =
  | 'command'
  | 'tower'
  | 'fm'
  | 'tv'
  | 'siren'
  | 'speaker'
  | 'satellite'
  | 'lora'
  | 'shelter'
  | 'hospital'
  | 'school'
  | 'volunteer'

export interface InfraNode {
  id: string
  type: NodeType
  name: string
  lngLat: LngLat
  district?: string
  region: 'odisha' | 'india'
  uptime: number
  capacity?: number
  occupancy?: number
  beds?: number
}

export const NODE_META: Record<NodeType, { label: string; color: [number, number, number]; radius: number }> = {
  command: { label: 'Command Centre', color: [34, 211, 238], radius: 7 },
  tower: { label: 'Mobile Tower', color: [74, 222, 128], radius: 3 },
  fm: { label: 'FM / Radio Station', color: [192, 132, 252], radius: 5 },
  tv: { label: 'TV Relay Station', color: [129, 140, 248], radius: 5 },
  siren: { label: 'Smart Siren', color: [251, 191, 36], radius: 3 },
  speaker: { label: 'Loudspeaker Hub', color: [253, 164, 175], radius: 2.5 },
  satellite: { label: 'Satellite Ground Station', color: [56, 189, 248], radius: 7 },
  lora: { label: 'LoRa Village Mesh Node', color: [45, 212, 191], radius: 2 },
  shelter: { label: 'Cyclone Shelter', color: [96, 165, 250], radius: 4 },
  hospital: { label: 'Hospital', color: [248, 113, 113], radius: 4 },
  school: { label: 'School', color: [148, 163, 184], radius: 3 },
  volunteer: { label: 'Aapda Mitra Volunteer', color: [251, 146, 60], radius: 3 },
}

const rand = mulberry32(20260917)

const CITIES: { name: string; at: LngLat; national?: boolean }[] = [
  { name: 'NEOC New Delhi', at: [77.21, 28.61], national: true },
  { name: 'SEOC Bhubaneswar', at: [85.82, 20.29], national: true },
  { name: 'Kolkata ERC', at: [88.36, 22.57], national: true },
  { name: 'Mumbai WRC', at: [72.88, 19.07], national: true },
  { name: 'Chennai SRC', at: [80.27, 13.08], national: true },
  { name: 'Nagpur Central Hub', at: [79.09, 21.15], national: true },
  { name: 'Guwahati NERC', at: [91.74, 26.14], national: true },
  { name: 'Hyderabad Hub', at: [78.48, 17.38] },
  { name: 'Bengaluru Hub', at: [77.59, 12.97] },
  { name: 'Visakhapatnam Coastal Hub', at: [83.22, 17.69] },
  { name: 'Ahmedabad Hub', at: [72.57, 23.02] },
  { name: 'Lucknow Hub', at: [80.95, 26.85] },
  { name: 'Patna Hub', at: [85.14, 25.6] },
  { name: 'Bhopal Hub', at: [77.41, 23.26] },
  { name: 'Jaipur Hub', at: [75.79, 26.91] },
  { name: 'Thiruvananthapuram Hub', at: [76.94, 8.52] },
  { name: 'Srinagar Hub', at: [74.8, 34.08] },
  { name: 'Leh Hub', at: [77.58, 34.15] },
  { name: 'Ranchi Hub', at: [85.3, 23.34] },
  { name: 'Raipur Hub', at: [81.63, 21.25] },
  { name: 'Dehradun Hub', at: [78.03, 30.32] },
  { name: 'Chandigarh Hub', at: [76.78, 30.73] },
  { name: 'Pune Hub', at: [73.86, 18.52] },
  { name: 'Kochi Hub', at: [76.27, 9.93] },
  { name: 'Itanagar Hub', at: [93.61, 27.08] },
  { name: 'Cuttack DEOC', at: [85.88, 20.46] },
  { name: 'Kendrapara DEOC', at: [86.42, 20.5] },
  { name: 'Balasore DEOC', at: [86.93, 21.49] },
  { name: 'Berhampur DEOC', at: [84.79, 19.31] },
  { name: 'Puri DEOC', at: [85.83, 19.82] },
]

const SUFFIX: Partial<Record<NodeType, string[]>> = {
  tower: ['BTS', 'Macro Cell', 'Small Cell', 'Tower'],
  siren: ['Siren Point', 'Warning Siren'],
  speaker: ['Temple PA', 'Mosque PA', 'Gurudwara PA', 'Church PA', 'Market PA', 'Panchayat PA'],
  lora: ['Mesh Node', 'LoRa Relay'],
  shelter: ['MPCS Shelter', 'Govt. High School Shelter', 'Cyclone Shelter'],
  hospital: ['CHC', 'District HQ Hospital', 'PHC', 'Sub-Divisional Hospital'],
  school: ['UP School', 'Govt. High School', 'Nodal School', 'Primary School'],
  volunteer: ['Aapda Mitra'],
  fm: ['Akashvani FM', 'Community Radio'],
  tv: ['TV Relay'],
  satellite: ['VSAT Ground Station'],
}

const PLACE_STEMS = [
  'Paradip', 'Ersama', 'Kujang', 'Tirtol', 'Mahakalapada', 'Rajnagar', 'Pattamundai', 'Aul', 'Marshaghai',
  'Chandbali', 'Basudevpur', 'Dhamnagar', 'Remuna', 'Baliapal', 'Bhograi', 'Jaleswar', 'Soro', 'Nilgiri',
  'Konark', 'Gop', 'Nimapara', 'Brahmagiri', 'Krishnaprasad', 'Satyabadi', 'Balipatna', 'Jatni', 'Tangi',
  'Banki', 'Salepur', 'Mahanga', 'Niali', 'Chhatrapur', 'Ganjam', 'Rambha', 'Khallikote', 'Aska', 'Hinjili',
  'Dharmasala', 'Binjharpur', 'Korai', 'Udala', 'Baripada', 'Betnoti', 'Rasgovindpur', 'Kakatpur', 'Astaranga',
]

function sampleInDistricts(type: NodeType, n: number, opts: { coastalBias?: number; margin?: number } = {}): InfraNode[] {
  const out: InfraNode[] = []
  let guard = 0
  while (out.length < n && guard++ < n * 400) {
    const d = pick(rand, DISTRICTS)
    const xs = d.ring.map((p) => p[0])
    const ys = d.ring.map((p) => p[1])
    const p: LngLat = [range(rand, Math.min(...xs), Math.max(...xs)), range(rand, Math.min(...ys), Math.max(...ys))]
    if (!inRing(p, d.ring) || !onLand(p, opts.margin ?? 0.05)) continue
    if (opts.coastalBias) {
      // prefer points near the landfall coast
      const dist = km(p, [86.45, 20.1])
      if (rand() < Math.min(0.85, (dist / 220) * opts.coastalBias)) continue
    }
    out.push(makeNode(type, p, d.id, 'odisha'))
  }
  return out
}

let counter = 0
function makeNode(type: NodeType, p: LngLat, district: string | undefined, region: 'odisha' | 'india', name?: string): InfraNode {
  counter++
  const stem = pick(rand, PLACE_STEMS)
  const suf = SUFFIX[type] ? pick(rand, SUFFIX[type]!) : ''
  const node: InfraNode = {
    id: `${type}-${counter}`,
    type,
    name: name ?? `${stem} ${suf}`.trim(),
    lngLat: [Number(p[0].toFixed(4)), Number(p[1].toFixed(4))],
    district,
    region,
    uptime: Number(range(rand, 97.2, 99.99).toFixed(2)),
  }
  if (type === 'shelter') {
    node.capacity = pick(rand, [500, 800, 1000, 1200, 1500, 2000])
    node.occupancy = int(rand, 5, 40)
  }
  if (type === 'hospital') node.beds = pick(rand, [30, 50, 100, 150, 300])
  return node
}

function sampleIndia(type: NodeType, n: number): InfraNode[] {
  const out: InfraNode[] = []
  let guard = 0
  while (out.length < n && guard++ < n * 60) {
    const p: LngLat = [range(rand, 68.5, 97), range(rand, 8.2, 36.5)]
    if (!inRing(p, INDIA_RING)) continue
    out.push(makeNode(type, p, undefined, 'india', `${NODE_META[type].label} ${String(counter).padStart(4, '0')}`))
  }
  return out
}

// ---------------------------------------------------------------------------

export const COMMAND_CENTRES: InfraNode[] = CITIES.map((c) =>
  makeNode('command', c.at, districtOf(c.at)?.id, districtOf(c.at) ? 'odisha' : 'india', c.name),
)

export const TOWERS: InfraNode[] = [...sampleInDistricts('tower', 150, { coastalBias: 0.6 }), ...sampleIndia('tower', 170)]
export const SIRENS: InfraNode[] = sampleInDistricts('siren', 48, { coastalBias: 1.6, margin: 0.03 })
export const SPEAKERS: InfraNode[] = sampleInDistricts('speaker', 64, { coastalBias: 0.8 })
export const LORA: InfraNode[] = sampleInDistricts('lora', 140, { coastalBias: 0.9 })
export const SHELTERS: InfraNode[] = sampleInDistricts('shelter', 72, { coastalBias: 1.0 })
export const HOSPITALS: InfraNode[] = sampleInDistricts('hospital', 38)
export const SCHOOLS: InfraNode[] = sampleInDistricts('school', 160)
export const VOLUNTEERS: InfraNode[] = sampleInDistricts('volunteer', 230, { coastalBias: 0.7 })
export const FM: InfraNode[] = [...sampleInDistricts('fm', 9), ...sampleIndia('fm', 26)]
export const TV: InfraNode[] = [...sampleInDistricts('tv', 6), ...sampleIndia('tv', 18)]
export const SATELLITE: InfraNode[] = [
  makeNode('satellite', [85.6, 20.2], 'khordha', 'odisha', 'Khordha VSAT Ground Station'),
  makeNode('satellite', [86.9, 21.35], 'balasore', 'odisha', 'Chandipur VSAT Ground Station'),
  ...sampleIndia('satellite', 9),
]

export const ALL_NODES: InfraNode[] = [
  ...COMMAND_CENTRES, ...TOWERS, ...SIRENS, ...SPEAKERS, ...LORA, ...SHELTERS, ...HOSPITALS,
  ...SCHOOLS, ...VOLUNTEERS, ...FM, ...TV, ...SATELLITE,
]

export const NODE_BY_ID: Record<string, InfraNode> = Object.fromEntries(ALL_NODES.map((n) => [n.id, n]))

/** Nodes rendered as the "network" (schools/volunteers are only used in impact counts / reach). */
export const NETWORK_NODES = ALL_NODES.filter((n) => n.type !== 'school' && n.type !== 'volunteer')

// ---------------------------------------------------------------------------
// Links

export interface Link {
  id: string
  kind: 'backbone' | 'regional' | 'local' | 'mesh'
  from: string
  to: string
  path: [number, number, number][]
  length: number
}

function nearest(from: InfraNode, pool: InfraNode[], k: number) {
  return pool
    .filter((n) => n.id !== from.id)
    .map((n) => ({ n, d: km(from.lngLat, n.lngLat) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
}

const links: Link[] = []
const seen = new Set<string>()
function addLink(kind: Link['kind'], a: InfraNode, b: InfraNode, height: number) {
  const key = [a.id, b.id].sort().join('|')
  if (seen.has(key)) return
  seen.add(key)
  const segs = kind === 'backbone' ? 40 : kind === 'regional' ? 20 : 2
  links.push({
    id: key,
    kind,
    from: a.id,
    to: b.id,
    path: arc3d(a.lngLat, b.lngLat, segs, height),
    length: km(a.lngLat, b.lngLat),
  })
}

const national = COMMAND_CENTRES.filter((c) => CITIES.find((x) => x.name === c.name)?.national)
const neoc = COMMAND_CENTRES[0]
const seoc = COMMAND_CENTRES[1]
national.forEach((c) => c !== neoc && addLink('backbone', neoc, c, 0.18))
COMMAND_CENTRES.forEach((c) => {
  if (national.includes(c)) return
  const hub = nearest(c, national, 1)[0]
  addLink(c.region === 'odisha' ? 'regional' : 'backbone', hub.n, c, c.region === 'odisha' ? 0.35 : 0.15)
})
SATELLITE.forEach((s) => addLink('backbone', s, nearest(s, COMMAND_CENTRES, 1)[0].n, 0.3))
;[...FM, ...TV].filter((n) => n.region === 'odisha').forEach((n) => addLink('regional', seoc, n, 0.3))

const odishaTowers = TOWERS.filter((t) => t.region === 'odisha')
const deocs = COMMAND_CENTRES.filter((c) => c.region === 'odisha')
odishaTowers.forEach((t) => {
  nearest(t, odishaTowers, 2).forEach(({ n, d }) => d < 30 && addLink('local', t, n, 0))
  if (rand() < 0.18) addLink('regional', nearest(t, deocs, 1)[0].n, t, 0.25)
})
;[...SIRENS, ...SPEAKERS].forEach((s) => addLink('local', s, nearest(s, odishaTowers, 1)[0].n, 0))
LORA.forEach((l) => nearest(l, LORA, 2).forEach(({ n, d }) => d < 25 && addLink('mesh', l, n, 0)))
TOWERS.filter((t) => t.region === 'india').forEach((t) => {
  const near = nearest(t, COMMAND_CENTRES, 1)[0]
  if (near.d < 420) addLink('local', t, near.n, 0)
})

export const LINKS = links

/** Towers that will fail as the cyclone approaches, ordered by distance to landfall. */
export const FAILING_TOWERS: string[] = odishaTowers
  .map((t) => ({ id: t.id, d: km(t.lngLat, [86.45, 20.1]) }))
  .sort((a, b) => a.d - b.d)
  .slice(0, 34)
  .map((t) => t.id)
