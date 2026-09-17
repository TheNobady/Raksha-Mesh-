import { MapboxOverlay } from '@deck.gl/mapbox'
import { Map as MLMap, type StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { CHILIKA, DISTRICTS, RIVERS } from '../../data/geography'
import { FLOOD_STAGES } from '../../data/hazards'
import { INDIA_RING, STATE_LINES } from '../../data/indiaOutline'
import { SEVERITIES } from '../../data/content'
import { mapRefs, useMapUi } from '../../lib/mapInstance'
import { getState, useStore } from '../../store/scenarioStore'
import { buildLayers } from './deckLayers'

const CARTO = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

export const VIEW_INDIA = { center: [81.5, 22.5] as [number, number], zoom: 3.7, pitch: 20, bearing: 0 }
export const VIEW_ODISHA = { center: [86.25, 19.75] as [number, number], zoom: 7.1, pitch: 52, bearing: -12 }

const SKY = {
  'sky-color': '#040b18',
  'horizon-color': '#0b2a4a',
  'fog-color': '#06142a',
  'sky-horizon-blend': 0.6,
  'horizon-fog-blend': 0.7,
  'fog-ground-blend': 0.85,
  'atmosphere-blend': 0.4,
}

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#050d1c' } }],
}

async function loadStyle(): Promise<{ style: StyleSpecification; fallback: boolean }> {
  try {
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(CARTO, { signal: ctrl.signal })
    window.clearTimeout(timer)
    if (!res.ok) throw new Error(String(res.status))
    const style = (await res.json()) as StyleSpecification
    // Restyle toward deep navy and drop all third-party boundary / country layers:
    // only our own India outline is drawn.
    style.layers = style.layers
      .filter((l) => !/boundary|country|disputed|admin/i.test(l.id))
      .map((l) => {
        const paint = { ...(('paint' in l && l.paint) || {}) } as Record<string, unknown>
        if (l.type === 'background') paint['background-color'] = '#040b18'
        if (l.type === 'fill' && /water/i.test(l.id)) paint['fill-color'] = '#07182f'
        if (l.type === 'fill' && /landcover|landuse|park/i.test(l.id)) paint['fill-opacity'] = 0.25
        if (l.type === 'line' && /waterway|river/i.test(l.id)) paint['line-color'] = '#0d3257'
        if (l.type === 'line' && /road|highway|rail|tunnel|bridge/i.test(l.id)) {
          paint['line-color'] = '#12243d'
        }
        if (l.type === 'symbol') {
          paint['text-color'] = /place_city|place_capital|place_town/i.test(l.id) ? '#7f93ad' : '#4b5d75'
          paint['text-halo-color'] = '#030712'
        }
        return { ...l, paint } as typeof l
      })
    return { style, fallback: false }
  } catch {
    return { style: FALLBACK_STYLE, fallback: true }
  }
}

function addOwnLayers(map: MLMap) {
  const ring = INDIA_RING.map((p) => [p[0], p[1]])
  map.addSource('india', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } } })
  map.addSource('states', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: STATE_LINES.map((s) => ({ type: 'Feature', properties: { name: s.name }, geometry: { type: 'LineString', coordinates: s.path } })) },
  })
  map.addSource('districts', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: DISTRICTS.map((d) => ({ type: 'Feature', properties: { name: d.name, risk: d.risk }, geometry: { type: 'Polygon', coordinates: [d.ring] } })) },
  })
  map.addSource('rivers', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: RIVERS.map((r) => ({ type: 'Feature', properties: { name: r.name }, geometry: { type: 'LineString', coordinates: r.path } })) },
  })
  map.addSource('chilika', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [CHILIKA] } } })
  FLOOD_STAGES.forEach((stage, i) =>
    map.addSource(`flood-${i}`, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: stage.map((ringF) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ringF] } })) },
    }),
  )
  map.addSource('zone', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })

  // India land tint + glow outline
  map.addLayer({ id: 'india-fill', type: 'fill', source: 'india', paint: { 'fill-color': '#0a1d36', 'fill-opacity': 0.35 } })
  map.addLayer({ id: 'india-glow-wide', type: 'line', source: 'india', paint: { 'line-color': '#22d3ee', 'line-width': 14, 'line-blur': 12, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.35, 7, 0.12] } })
  map.addLayer({ id: 'india-glow', type: 'line', source: 'india', paint: { 'line-color': '#22d3ee', 'line-width': 4, 'line-blur': 3, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.7, 7, 0.2] } })
  map.addLayer({ id: 'india-line', type: 'line', source: 'india', paint: { 'line-color': '#a5f3fc', 'line-width': 1.2, 'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.95, 7, 0.25] } })

  map.addLayer({ id: 'states-glow', type: 'line', source: 'states', paint: { 'line-color': '#38bdf8', 'line-width': 5, 'line-blur': 4, 'line-opacity': 0.25 } })
  map.addLayer({ id: 'states-line', type: 'line', source: 'states', paint: { 'line-color': '#7dd3fc', 'line-width': 1, 'line-opacity': 0.5, 'line-dasharray': [3, 2] } })

  map.addLayer({
    id: 'districts-fill',
    type: 'fill',
    source: 'districts',
    minzoom: 5.5,
    paint: {
      'fill-color': ['match', ['get', 'risk'], 'Extreme', '#f43f5e', 'Very High', '#f97316', 'High', '#f59e0b', '#22d3ee'],
      'fill-opacity': 0.06,
    },
  })
  map.addLayer({ id: 'districts-line', type: 'line', source: 'districts', minzoom: 5.5, paint: { 'line-color': '#38bdf8', 'line-width': 0.8, 'line-opacity': 0.35 } })

  map.addLayer({ id: 'chilika', type: 'fill', source: 'chilika', paint: { 'fill-color': '#07182f', 'fill-opacity': 0.9 } })

  map.addLayer({ id: 'rivers-glow', type: 'line', source: 'rivers', paint: { 'line-color': '#38bdf8', 'line-width': 5, 'line-blur': 4, 'line-opacity': 0.25, 'line-width-transition': { duration: 2000, delay: 0 } } })
  map.addLayer({ id: 'rivers', type: 'line', source: 'rivers', paint: { 'line-color': '#7dd3fc', 'line-width': 1.4, 'line-opacity': 0.7, 'line-width-transition': { duration: 2000, delay: 0 } } })

  FLOOD_STAGES.forEach((_, i) => {
    map.addLayer({
      id: `flood-${i}`,
      type: 'fill',
      source: `flood-${i}`,
      paint: { 'fill-color': i < 2 ? '#1d4ed8' : '#2563eb', 'fill-opacity': 0, 'fill-opacity-transition': { duration: 1800, delay: i * 250 } },
    })
    map.addLayer({
      id: `flood-edge-${i}`,
      type: 'line',
      source: `flood-${i}`,
      paint: { 'line-color': '#60a5fa', 'line-width': 1, 'line-opacity': 0, 'line-opacity-transition': { duration: 1800, delay: i * 250 } },
    })
  })

  map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zone', paint: { 'fill-color': '#f43f5e', 'fill-opacity': 0.16 } })
  map.addLayer({ id: 'zone-glow', type: 'line', source: 'zone', paint: { 'line-color': '#f43f5e', 'line-width': 10, 'line-blur': 8, 'line-opacity': 0.55 } })
  map.addLayer({ id: 'zone-line', type: 'line', source: 'zone', paint: { 'line-color': '#fecdd3', 'line-width': 2.2, 'line-dasharray': [2, 2] } })
}

function addTerrain(map: MLMap) {
  const tiles = ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']
  if (!map.getSource('terrain-dem')) {
    map.addSource('terrain-dem', { type: 'raster-dem', tiles, encoding: 'terrarium', tileSize: 256, maxzoom: 11 })
    map.addSource('hillshade-dem', { type: 'raster-dem', tiles, encoding: 'terrarium', tileSize: 256, maxzoom: 11 })
    const firstOwn = map.getLayer('india-fill') ? 'india-fill' : undefined
    map.addLayer(
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'hillshade-dem',
        paint: {
          'hillshade-shadow-color': '#010409',
          'hillshade-highlight-color': '#1e4a73',
          'hillshade-accent-color': '#0b2a4a',
          'hillshade-exaggeration': 0.55,
        },
      },
      firstOwn,
    )
  }
}

export function setTerrainEnabled(on: boolean) {
  const map = mapRefs.map
  if (!map || !map.getSource('terrain-dem')) return
  map.setTerrain(on ? { source: 'terrain-dem', exaggeration: 1.6 } : null)
  if (map.getLayer('hillshade')) map.setLayoutProperty('hillshade', 'visibility', on ? 'visible' : 'none')
}

export function MapView() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let raf = 0
    let dashTimer = 0

    ;(async () => {
      const { style, fallback } = await loadStyle()
      if (disposed || !ref.current) return
      style.sky = SKY as StyleSpecification['sky']
      const map = new MLMap({
        container: ref.current,
        style,
        center: VIEW_INDIA.center,
        zoom: VIEW_INDIA.zoom,
        pitch: VIEW_INDIA.pitch,
        bearing: VIEW_INDIA.bearing,
        maxPitch: 78,
        attributionControl: { compact: true },
        fadeDuration: 150,
        canvasContextAttributes: { antialias: true },
      })
      mapRefs.map = map
      if (import.meta.env.DEV) (window as unknown as { __map: MLMap }).__map = map
      useMapUi.setState({ styleFallback: fallback })

      map.on('error', (e) => {
        // tile failures should never crash the demo – just keep going
        if (import.meta.env.DEV) console.debug('[map]', e.error?.message)
      })

      map.on('load', () => {
        addOwnLayers(map)
        try {
          addTerrain(map)
          setTerrainEnabled(getState().layers.terrain)
        } catch {
          /* terrain optional */
        }
        const overlay = new MapboxOverlay({ interleaved: false, layers: [] })
        map.addControl(overlay)
        mapRefs.overlay = overlay
        useMapUi.setState({ ready: true })

        // slow rotation behind the start overlay
        const idleSpin = () => {
          if (getState().started || disposed) return
          map.rotateTo((map.getBearing() + 12) % 360, { duration: 6000, easing: (x) => x })
        }
        map.on('moveend', idleSpin)
        idleSpin()

        const loop = (now: number) => {
          raf = requestAnimationFrame(loop)
          if (!mapRefs.visible || !mapRefs.overlay) return
          try {
            mapRefs.overlay.setProps({ layers: buildLayers(getState(), now) })
          } catch (err) {
            if (import.meta.env.DEV) console.warn(err)
          }
        }
        raf = requestAnimationFrame(loop)

        // marching-ants dash on the drawn zone
        const dashes: [number, number, number, number][] = [[0, 2, 2, 0], [0.5, 2, 1.5, 0], [1, 2, 1, 0], [1.5, 2, 0.5, 0], [2, 2, 0, 0], [0, 0.5, 2, 1.5], [0, 1, 2, 1], [0, 1.5, 2, 0.5]]
        let di = 0
        dashTimer = window.setInterval(() => {
          if (!mapRefs.visible || !map.getLayer('zone-line')) return
          di = (di + 1) % dashes.length
          map.setPaintProperty('zone-line', 'line-dasharray', dashes[di])
        }, 90)

        syncWorld()
        if (getState().started) runIntro()
      })
    })()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.clearInterval(dashTimer)
    }
  }, [])

  // push store → maplibre paint state (not via React renders)
  useEffect(() => {
    const unsub = useStore.subscribe((s, prev) => {
      const map = mapRefs.map
      if (!map || !useMapUi.getState().ready) return
      if (s.floodStage !== prev.floodStage || s.layers.flood !== prev.layers.flood || s.zone !== prev.zone || s.severity !== prev.severity || s.screen !== prev.screen) syncWorld()
      if (s.layers.terrain !== prev.layers.terrain) setTerrainEnabled(s.layers.terrain)
      if (s.introNonce !== prev.introNonce || (s.started && !prev.started)) runIntro()
      if (s.focus && s.focus !== prev.focus) {
        map.flyTo({ center: s.focus.center, zoom: s.focus.zoom, pitch: s.focus.pitch ?? map.getPitch(), bearing: s.focus.bearing ?? map.getBearing(), duration: 2200, essential: true })
      }
    })
    return unsub
  }, [])

  // inline style: maplibre's unlayered CSS (position: relative) would beat Tailwind's layered utilities
  return <div ref={ref} style={{ position: 'absolute', inset: 0 }} />
}

function syncWorld() {
  const map = mapRefs.map
  if (!map) return
  const s = getState()
  FLOOD_STAGES.forEach((_, i) => {
    const on = s.layers.flood && i < s.floodStage + 1 && s.floodStage > 0
    if (!map.getLayer(`flood-${i}`)) return
    map.setPaintProperty(`flood-${i}`, 'fill-opacity', on ? 0.22 + i * 0.03 : 0)
    map.setPaintProperty(`flood-edge-${i}`, 'line-opacity', on ? 0.6 : 0)
  })
  if (map.getLayer('rivers')) {
    map.setPaintProperty('rivers', 'line-width', 1.4 + s.floodStage * 0.8)
    map.setPaintProperty('rivers-glow', 'line-width', 5 + s.floodStage * 3)
    map.setPaintProperty('rivers-glow', 'line-opacity', 0.25 + s.floodStage * 0.08)
  }
  const src = map.getSource('zone') as import('maplibre-gl').GeoJSONSource | undefined
  const showZone = !!s.zone
  src?.setData(showZone ? { type: 'Feature', properties: {}, geometry: s.zone! } : { type: 'FeatureCollection', features: [] })
  const sev = SEVERITIES.find((x) => x.id === s.severity)!
  if (map.getLayer('zone-fill')) {
    map.setPaintProperty('zone-fill', 'fill-color', sev.color)
    map.setPaintProperty('zone-glow', 'line-color', sev.color)
  }
}

let introTimer = 0
export function runIntro() {
  const map = mapRefs.map
  if (!map) return
  window.clearTimeout(introTimer)
  map.stop()
  map.jumpTo({ center: VIEW_INDIA.center, zoom: VIEW_INDIA.zoom, pitch: 0, bearing: -20 })
  map.easeTo({ bearing: 0, pitch: 25, duration: 1800, easing: (x) => x })
  introTimer = window.setTimeout(() => {
    map.flyTo({ ...VIEW_ODISHA, duration: 5200, curve: 1.6, essential: true })
  }, 1700)
}

export function resetView() {
  mapRefs.map?.flyTo({ ...VIEW_ODISHA, duration: 1800, essential: true })
}
