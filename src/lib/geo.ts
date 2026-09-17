export type LngLat = [number, number]

/** Ray-casting point in polygon for a simple ring (fast path used during data generation). */
export function inRing(p: LngLat, ring: LngLat[]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export const closeRing = (ring: LngLat[]): LngLat[] => {
  const a = ring[0]
  const b = ring[ring.length - 1]
  return a[0] === b[0] && a[1] === b[1] ? ring : [...ring, a]
}

/** Approx distance in km (equirectangular – plenty for a demo). */
export function km(a: LngLat, b: LngLat) {
  const x = (b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * (Math.PI / 180))
  const y = b[1] - a[1]
  return Math.sqrt(x * x + y * y) * 111.32
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

/** Position along a polyline at fraction t (by length). */
export function alongPath(path: LngLat[], t: number): { p: LngLat; bearing: number } {
  if (path.length < 2) return { p: path[0], bearing: 0 }
  const seg: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const d = km(path[i - 1], path[i])
    seg.push(d)
    total += d
  }
  let target = clamp(t) * total
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i] || i === seg.length - 1) {
      const f = seg[i] === 0 ? 0 : clamp(target / seg[i])
      const a = path[i]
      const b = path[i + 1]
      const bearing = (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI
      return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], bearing }
    }
    target -= seg[i]
  }
  return { p: path[path.length - 1], bearing: 0 }
}

/** Smooth a polyline with Chaikin's algorithm. */
export function chaikin(path: LngLat[], iterations = 2): LngLat[] {
  let pts = path
  for (let k = 0; k < iterations; k++) {
    const out: LngLat[] = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i]
      const [x1, y1] = pts[i + 1]
      out.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1])
      out.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1])
    }
    out.push(pts[pts.length - 1])
    pts = out
  }
  return pts
}

/** Build a 3D arc (lng, lat, altitude m) between two points for arcs + packets. */
export function arc3d(a: LngLat, b: LngLat, segments = 32, heightFactor = 0.22): [number, number, number][] {
  const d = km(a, b) * 1000
  const out: [number, number, number][] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t), Math.sin(Math.PI * t) * d * heightFactor])
  }
  return out
}

/** Irregular blob polygon around a centre (radius in degrees). */
export function blob(center: LngLat, rx: number, ry: number, rand: () => number, points = 28, jitter = 0.28): LngLat[] {
  const ring: LngLat[] = []
  const phase = rand() * Math.PI * 2
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const wob = 1 + jitter * (Math.sin(a * 3 + phase) * 0.5 + (rand() - 0.5) * 0.6)
    ring.push([center[0] + Math.cos(a) * rx * wob, center[1] + Math.sin(a) * ry * wob])
  }
  return closeRing(ring)
}
