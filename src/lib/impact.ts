import { booleanPointInPolygon } from '@turf/turf'
import type { Feature, Polygon } from 'geojson'
import { HOSPITALS, SCHOOLS, SHELTERS, SIRENS, SPEAKERS, TOWERS, VOLUNTEERS, type InfraNode } from '../data/infrastructure'
import { VILLAGES } from '../data/villages'
import type { LngLat } from './geo'

export interface Impact {
  population: number
  households: number
  villages: number
  villageIds: string[]
  schools: number
  hospitals: number
  shelters: number
  shelterCapacity: number
  towers: string[]
  sirens: number
  speakers: number
  volunteers: number
  elderly: number
  pregnant: number
  disabled: number
  livestock: number
  areaKm2: number
  topVillages: { id: string; name: string; population: number; district: string }[]
  nodeIds: string[]
}

export const EMPTY_IMPACT: Impact = {
  population: 0, households: 0, villages: 0, villageIds: [], schools: 0, hospitals: 0, shelters: 0, shelterCapacity: 0,
  towers: [], sirens: 0, speakers: 0, volunteers: 0, elderly: 0, pregnant: 0, disabled: 0, livestock: 0, areaKm2: 0,
  topVillages: [], nodeIds: [],
}

function bbox(ring: LngLat[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of ring) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return { minX, minY, maxX, maxY }
}

function areaKm2(ring: LngLat[]) {
  // shoelace on an equirectangular projection around the polygon's latitude
  const lat0 = (ring.reduce((s, p) => s + p[1], 0) / ring.length) * (Math.PI / 180)
  let a = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0] * Math.cos(lat0) * 111.32
    const yi = ring[i][1] * 111.32
    const xj = ring[j][0] * Math.cos(lat0) * 111.32
    const yj = ring[j][1] * 111.32
    a += xj * yi - xi * yj
  }
  return Math.abs(a / 2)
}

/** The one genuinely real computation: what lies inside the drawn danger zone. */
export function computeImpact(polygon: Polygon): Impact {
  const ring = polygon.coordinates[0] as LngLat[]
  const b = bbox(ring)
  const feature: Feature<Polygon> = { type: 'Feature', geometry: polygon, properties: {} }
  const inside = (p: LngLat) =>
    p[0] >= b.minX && p[0] <= b.maxX && p[1] >= b.minY && p[1] <= b.maxY && booleanPointInPolygon(p, feature)

  const out: Impact = { ...EMPTY_IMPACT, villageIds: [], towers: [], topVillages: [], nodeIds: [] }
  const vs = VILLAGES.filter((v) => inside(v.lngLat))
  for (const v of vs) {
    out.population += v.population
    out.households += v.households
    out.elderly += v.elderly
    out.pregnant += v.pregnant
    out.disabled += v.disabled
    out.livestock += v.livestock
    out.villageIds.push(v.id)
  }
  out.villages = vs.length
  out.topVillages = [...vs]
    .sort((a, b2) => b2.population - a.population)
    .slice(0, 6)
    .map((v) => ({ id: v.id, name: v.name, population: v.population, district: v.district }))

  const count = (nodes: InfraNode[]) => {
    const hit = nodes.filter((n) => inside(n.lngLat))
    hit.forEach((n) => out.nodeIds.push(n.id))
    return hit
  }
  out.schools = count(SCHOOLS).length
  out.hospitals = count(HOSPITALS).length
  const sh = count(SHELTERS)
  out.shelters = sh.length
  out.shelterCapacity = sh.reduce((s, n) => s + (n.capacity ?? 0), 0)
  out.towers = count(TOWERS).map((t) => t.id)
  out.sirens = count(SIRENS).length
  out.speakers = count(SPEAKERS).length
  out.volunteers = count(VOLUNTEERS).length
  out.areaKm2 = Math.round(areaKm2(ring))
  return out
}
