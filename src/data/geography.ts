import { chaikin, inRing, lerp, type LngLat } from '../lib/geo'

/** Odisha coastline north → south (lat strictly decreasing, so it can be interpolated). */
export const ODISHA_COAST: LngLat[] = [
  [87.47, 21.62], [87.1, 21.5], [86.95, 21.35], [86.86, 21.15], [86.95, 20.85], [87.03, 20.72],
  [86.86, 20.55], [86.76, 20.36], [86.68, 20.26], [86.47, 20.06], [86.32, 19.96], [86.02, 19.84],
  [85.83, 19.79], [85.62, 19.7], [85.45, 19.6], [85.22, 19.45], [85.05, 19.3], [84.9, 19.23],
  [84.76, 19.08],
]

/** Longitude of the coastline at a latitude (NaN outside the coast's range). */
export function coastLonAt(lat: number) {
  const c = ODISHA_COAST
  if (lat > c[0][1] || lat < c[c.length - 1][1]) return NaN
  for (let i = 1; i < c.length; i++) {
    if (lat >= c[i][1]) {
      const t = (c[i - 1][1] - lat) / (c[i - 1][1] - c[i][1])
      return lerp(c[i - 1][0], c[i][0], t)
    }
  }
  return NaN
}

export const CHILIKA: LngLat[] = [
  [85.08, 19.52], [85.2, 19.6], [85.36, 19.72], [85.5, 19.86], [85.55, 19.78], [85.47, 19.64],
  [85.3, 19.5], [85.15, 19.46], [85.08, 19.52],
]

/** Is a point on Odisha land (inland of the coast by a safety margin, not in Chilika)? */
export function onLand(p: LngLat, margin = 0.05) {
  const cl = coastLonAt(p[1])
  if (!Number.isNaN(cl) && p[0] > cl - margin) return false
  if (Number.isNaN(cl) && p[1] < 19.08 && p[0] > 84.6) return false
  if (inRing(p, CHILIKA)) return false
  return true
}

export interface District {
  id: string
  name: string
  ring: LngLat[]
  center: LngLat
  risk: 'Extreme' | 'Very High' | 'High' | 'Moderate'
  population: number
}

export const DISTRICTS: District[] = [
  {
    id: 'balasore', name: 'Balasore', risk: 'High', population: 2320529, center: [86.75, 21.4],
    ring: [[86.25, 21.25], [86.9, 21.12], [87.1, 21.5], [87.5, 21.66], [87.2, 21.92], [86.7, 21.85], [86.3, 21.6], [86.25, 21.25]],
  },
  {
    id: 'mayurbhanj', name: 'Mayurbhanj', risk: 'Moderate', population: 2519738, center: [86.35, 21.95],
    ring: [[85.75, 21.6], [86.3, 21.6], [86.7, 21.85], [87.05, 21.95], [86.75, 22.2], [86.1, 22.45], [85.7, 22.1], [85.75, 21.6]],
  },
  {
    id: 'bhadrak', name: 'Bhadrak', risk: 'Very High', population: 1506337, center: [86.6, 21.02],
    ring: [[86.2, 20.82], [86.95, 20.78], [86.9, 21.12], [86.25, 21.25], [86.2, 20.82]],
  },
  {
    id: 'jajpur', name: 'Jajpur', risk: 'High', population: 1827192, center: [86.15, 20.85],
    ring: [[85.7, 20.6], [86.25, 20.62], [86.2, 21.2], [85.8, 21.25], [85.55, 20.95], [85.7, 20.6]],
  },
  {
    id: 'kendrapara', name: 'Kendrapara', risk: 'Extreme', population: 1440361, center: [86.55, 20.52],
    ring: [[86.25, 20.35], [86.72, 20.3], [87.02, 20.7], [86.95, 20.8], [86.25, 20.65], [86.25, 20.35]],
  },
  {
    id: 'cuttack', name: 'Cuttack', risk: 'High', population: 2624470, center: [85.8, 20.45],
    ring: [[85.3, 20.3], [86.0, 20.3], [86.25, 20.36], [86.25, 20.62], [85.7, 20.6], [85.3, 20.55], [85.3, 20.3]],
  },
  {
    id: 'jagatsinghpur', name: 'Jagatsinghpur', risk: 'Extreme', population: 1136971, center: [86.25, 20.17],
    ring: [[86.0, 20.0], [86.3, 19.95], [86.5, 20.05], [86.72, 20.3], [86.25, 20.36], [86.0, 20.3], [86.0, 20.0]],
  },
  {
    id: 'puri', name: 'Puri', risk: 'Extreme', population: 1698730, center: [85.9, 19.93],
    ring: [[85.45, 19.62], [85.9, 19.8], [86.3, 19.95], [86.0, 20.0], [86.0, 20.12], [85.6, 20.1], [85.45, 19.9], [85.45, 19.62]],
  },
  {
    id: 'khordha', name: 'Khordha', risk: 'Very High', population: 2251673, center: [85.55, 20.2],
    ring: [[85.05, 19.9], [85.45, 19.9], [85.6, 20.1], [86.0, 20.12], [86.0, 20.3], [85.3, 20.3], [85.05, 20.15], [85.05, 19.9]],
  },
  {
    id: 'ganjam', name: 'Ganjam', risk: 'Very High', population: 3529031, center: [84.75, 19.55],
    ring: [[84.1, 19.2], [84.78, 19.05], [85.1, 19.35], [85.45, 19.62], [85.45, 19.9], [85.05, 19.9], [84.6, 20.1], [84.15, 19.8], [84.1, 19.2]],
  },
]

export const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]))

export function districtOf(p: LngLat): District | undefined {
  return DISTRICTS.find((d) => inRing(p, d.ring))
}

/** Main rivers (smoothed) — used for the flood layer. */
export const RIVERS: { name: string; path: LngLat[] }[] = [
  { name: 'Mahanadi', path: chaikin([[84.9, 20.5], [85.4, 20.42], [85.88, 20.47], [86.2, 20.38], [86.45, 20.3], [86.68, 20.27]], 3) },
  { name: 'Kathajodi', path: chaikin([[85.88, 20.47], [86.0, 20.33], [86.18, 20.18], [86.35, 20.02]], 3) },
  { name: 'Devi', path: chaikin([[85.9, 20.4], [86.05, 20.2], [86.2, 20.05], [86.37, 19.97]], 3) },
  { name: 'Brahmani', path: chaikin([[85.3, 21.0], [85.8, 20.85], [86.3, 20.7], [86.7, 20.62], [86.95, 20.75]], 3) },
  { name: 'Baitarani', path: chaikin([[85.9, 21.3], [86.35, 21.05], [86.7, 20.85], [86.95, 20.8]], 3) },
  { name: 'Subarnarekha', path: chaikin([[86.6, 22.1], [86.95, 21.9], [87.25, 21.75], [87.47, 21.62]], 3) },
  { name: 'Rushikulya', path: chaikin([[84.3, 19.75], [84.6, 19.5], [84.85, 19.38], [85.05, 19.3]], 3) },
]

export const ODISHA_CENTER: LngLat = [86.05, 20.25]
