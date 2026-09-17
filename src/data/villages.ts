import { inRing, km, type LngLat } from '../lib/geo'
import { int, mulberry32, pick, range } from '../lib/prng'
import { DISTRICTS, DISTRICT_BY_ID, onLand } from './geography'
import { SHELTERS } from './infrastructure'

export interface Village {
  id: string
  name: string
  district: string
  lngLat: LngLat
  population: number
  households: number
  elderly: number
  pregnant: number
  disabled: number
  children: number
  livestock: number
  shelterId: string
  shelterName: string
  shelterKm: number
}

const rand = mulberry32(4459)

const PRE = [
  'Nua', 'Bada', 'Sana', 'Kanti', 'Bali', 'Gopi', 'Kakat', 'Ranga', 'Jaga', 'Deuli', 'Kusu', 'Pata', 'Bera',
  'Chanda', 'Sati', 'Hari', 'Kendu', 'Bhanja', 'Mahi', 'Tala', 'Kaima', 'Khara', 'Banda', 'Amba', 'Rama',
  'Siali', 'Sunu', 'Nari', 'Paika', 'Gada', 'Pipi', 'Kona', 'Tira', 'Barimu', 'Jamu', 'Kasi', 'Bhitara',
  'Nimi', 'Olasi', 'Padma', 'Raghu', 'Sura', 'Tanda', 'Ukhu', 'Bhoi', 'Dhenka', 'Gundi', 'Hatia', 'Jhadi',
  'Kaudi', 'Mangala', 'Nali', 'Puri', 'Sialia', 'Taranga', 'Bahada', 'Chhenda', 'Durga', 'Gobara',
]
const SUF = [
  'pada', 'gaon', 'pur', 'patna', 'jhari', 'sahi', 'garh', 'khandi', 'bandha', 'nagar', 'kuda', 'palli',
  'tangi', 'bahal', 'mundi', 'sasan', 'dihi', 'ghati', 'kote', 'hata', 'pokhari', 'bila', 'chak', 'singh',
]

/** Scripted villages the demo story references. */
export const STORY_VILLAGES = {
  astaranga: 'v-astaranga',
  kantiapada: 'v-kantiapada',
  balijhari: 'v-balijhari',
  nuagaon: 'v-nuagaon',
  siali: 'v-sialia',
} as const

const FIXED: { id: string; name: string; district: string; at: LngLat; population: number; households: number }[] = [
  { id: STORY_VILLAGES.astaranga, name: 'Astaranga', district: 'puri', at: [86.24, 19.99], population: 4820, households: 1012 },
  { id: STORY_VILLAGES.kantiapada, name: 'Kantiapada', district: 'kendrapara', at: [86.66, 20.5], population: 612, households: 12 * 11 },
  { id: STORY_VILLAGES.balijhari, name: 'Balijhari', district: 'jagatsinghpur', at: [86.4, 20.17], population: 1340, households: 286 },
  { id: STORY_VILLAGES.nuagaon, name: 'Nuagaon', district: 'kendrapara', at: [86.46, 20.4], population: 2210, households: 468 },
  { id: STORY_VILLAGES.siali, name: 'Sialia', district: 'jagatsinghpur', at: [86.5, 20.24], population: 1890, households: 402 },
]

const PER_DISTRICT: Record<string, number> = {
  kendrapara: 58, jagatsinghpur: 52, puri: 55, bhadrak: 46, balasore: 48, khordha: 40, cuttack: 44,
  jajpur: 38, ganjam: 55, mayurbhanj: 30,
}

function nearestShelter(p: LngLat) {
  let best = SHELTERS[0]
  let bd = Infinity
  for (const s of SHELTERS) {
    const d = km(p, s.lngLat)
    if (d < bd) {
      bd = d
      best = s
    }
  }
  return { id: best.id, name: best.name, km: Number(Math.max(0.4, bd).toFixed(1)) }
}

function build(): Village[] {
  const names = new Set<string>(FIXED.map((f) => f.name))
  const out: Village[] = []

  const withDetails = (id: string, name: string, district: string, p: LngLat, population: number, households?: number): Village => {
    const sh = nearestShelter(p)
    return {
      id,
      name,
      district,
      lngLat: p,
      population,
      households: households ?? Math.round(population / range(rand, 4.2, 5.1)),
      elderly: Math.round(population * range(rand, 0.07, 0.12)),
      pregnant: Math.round(population * range(rand, 0.012, 0.022)),
      disabled: Math.round(population * range(rand, 0.018, 0.03)),
      children: Math.round(population * range(rand, 0.2, 0.28)),
      livestock: Math.round(population * range(rand, 0.25, 0.7)),
      shelterId: sh.id,
      shelterName: sh.name,
      shelterKm: sh.km,
    }
  }

  FIXED.forEach((f) => out.push(withDetails(f.id, f.name, f.district, f.at, f.population, f.households)))

  for (const d of DISTRICTS) {
    const n = PER_DISTRICT[d.id]
    const xs = d.ring.map((p) => p[0])
    const ys = d.ring.map((p) => p[1])
    let made = 0
    let guard = 0
    while (made < n && guard++ < 20000) {
      const p: LngLat = [range(rand, Math.min(...xs), Math.max(...xs)), range(rand, Math.min(...ys), Math.max(...ys))]
      if (!inRing(p, d.ring) || !onLand(p, 0.045)) continue
      if (out.some((v) => km(v.lngLat, p) < 2.2)) continue
      let name = ''
      for (let k = 0; k < 20 && (!name || names.has(name)); k++) name = pick(rand, PRE) + pick(rand, SUF)
      if (names.has(name)) name = `${name} ${int(rand, 2, 9)}`
      names.add(name)
      const population = Math.round(Math.pow(rand(), 1.6) * 5200 + 650)
      out.push(withDetails(`v-${out.length}`, name, d.id, [Number(p[0].toFixed(4)), Number(p[1].toFixed(4))], population))
      made++
    }
  }
  return out
}

export const VILLAGES: Village[] = build()
export const VILLAGE_BY_ID: Record<string, Village> = Object.fromEntries(VILLAGES.map((v) => [v.id, v]))
export const districtName = (id: string) => DISTRICT_BY_ID[id]?.name ?? id

export const KANTIAPADA_HOUSEHOLDS = [
  'Sahoo', 'Behera', 'Mallick', 'Jena', 'Das', 'Swain', 'Nayak', 'Rout', 'Pradhan', 'Barik', 'Sethi', 'Mohanty',
].map((surname, i) => ({
  id: `kh-${i}`,
  label: `House ${i + 1} · ${surname} family`,
  note: i === 2 ? '2 elderly' : i === 6 ? 'pregnant woman' : i === 9 ? 'infant' : `${2 + ((i * 7) % 5)} members`,
}))
