import type { Polygon } from 'geojson'
import { useCallback, useEffect, useRef } from 'react'
import { TerraDraw, TerraDrawCircleMode, TerraDrawPolygonMode, TerraDrawSelectMode, type GeoJSONStoreFeatures } from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import { SUGGESTED_ZONE } from '../../data/hazards'
import { mapRefs, useMapUi } from '../../lib/mapInstance'
import { getState, useStore } from '../../store/scenarioStore'

type Mode = 'polygon' | 'circle' | 'select'

const HEX = { evacuate: '#F43F5E', warning: '#FB923C', watch: '#F59E0B' } as const

/**
 * The one genuinely interactive piece: Terra Draw on the shared MapLibre map.
 * Every create/edit pushes the polygon to the store, which runs the real turf impact computation.
 */
export function useTerraDraw() {
  const ready = useMapUi((s) => s.ready)
  const drawRef = useRef<TerraDraw | null>(null)
  const pending = useRef(0)
  const severity = useStore((s) => s.severity)

  const pushZone = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    cancelAnimationFrame(pending.current)
    pending.current = requestAnimationFrame(() => {
      const polys = draw.getSnapshot().filter((f) => f.geometry.type === 'Polygon')
      const last = polys[polys.length - 1]
      getState().setZone(last ? (last.geometry as Polygon) : null)
    })
  }, [])

  useEffect(() => {
    const map = mapRefs.map
    if (!ready || !map) return
    const color = HEX[getState().severity]
    const draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map }),
      modes: [
        new TerraDrawPolygonMode({
          styles: { fillColor: color, fillOpacity: 0.12, outlineColor: '#FECDD3', outlineWidth: 2, closingPointColor: '#22D3EE', closingPointWidth: 6, closingPointOutlineColor: '#ECFEFF', closingPointOutlineWidth: 2 },
        }),
        new TerraDrawCircleMode({ styles: { fillColor: color, fillOpacity: 0.12, outlineColor: '#FECDD3', outlineWidth: 2 } }),
        new TerraDrawSelectMode({
          flags: {
            polygon: { feature: { draggable: true, coordinates: { midpoints: true, draggable: true, deletable: true } } },
            circle: { feature: { draggable: true, coordinates: { resizable: 'center' } } },
          },
          styles: {
            selectedPolygonColor: color,
            selectedPolygonFillOpacity: 0.16,
            selectedPolygonOutlineColor: '#FFE4E6',
            selectedPolygonOutlineWidth: 2,
            selectionPointColor: '#22D3EE',
            selectionPointWidth: 6,
            selectionPointOutlineColor: '#ECFEFF',
            selectionPointOutlineWidth: 2,
            midPointColor: '#F59E0B',
            midPointWidth: 4,
            midPointOutlineColor: '#FFFBEB',
            midPointOutlineWidth: 1,
          },
        }),
      ],
    })
    draw.start()
    drawRef.current = draw

    const onReady = () => {
      const zone = getState().zone
      if (zone) loadPolygon(draw, zone)
      const want = getState().drawMode
      draw.setMode(want === 'polygon' || want === 'circle' ? want : 'select')
      map.flyTo({ center: [86.3, 20.25], zoom: want === 'polygon' ? 8 : 7.6, pitch: 20, bearing: 0, duration: 1400 })
    }
    draw.on('ready', onReady)

    draw.on('finish', (id) => {
      // keep a single danger zone: remove older features
      const others = draw.getSnapshot().filter((f) => f.id !== id).map((f) => f.id!)
      if (others.length) draw.removeFeatures(others)
      pushZone()
      draw.setMode('select')
      try {
        draw.selectFeature(id)
      } catch {
        /* ignore */
      }
      getState().set({ drawMode: 'select' })
      getState().pushFeed('info', 'alert', 'Danger zone drawn · impact recomputed')
    })
    draw.on('change', (_ids, type) => {
      if (type === 'update' || type === 'delete') pushZone()
    })

    return () => {
      cancelAnimationFrame(pending.current)
      try {
        draw.stop()
      } catch {
        /* map may be gone */
      }
      drawRef.current = null
    }
  }, [ready, pushZone])

  // restyle when severity changes
  useEffect(() => {
    const draw = drawRef.current
    if (!draw) return
    const c = HEX[severity]
    try {
      draw.updateModeOptions<typeof TerraDrawPolygonMode>('polygon', { styles: { fillColor: c, fillOpacity: 0.12, outlineColor: '#FECDD3', outlineWidth: 2 } })
    } catch {
      /* ignore */
    }
  }, [severity])

  const setMode = useCallback((mode: Mode) => {
    const draw = drawRef.current
    if (!draw) return
    if (mode !== 'select') {
      draw.clear()
      getState().setZone(null)
    }
    draw.setMode(mode)
    getState().set({ drawMode: mode })
  }, [])

  const suggest = useCallback(() => {
    const draw = drawRef.current
    if (!draw) return
    const zone: Polygon = { type: 'Polygon', coordinates: [SUGGESTED_ZONE] }
    draw.clear()
    loadPolygon(draw, zone)
    draw.setMode('select')
    getState().set({ drawMode: 'select' })
    getState().setZone(zone)
    mapRefs.map?.flyTo({ center: [86.35, 20.35], zoom: 8.1, pitch: 30, bearing: 0, duration: 1400 })
    getState().pushFeed('info', 'alert', 'Zone suggested from IMD forecast cone (landfall ±60 km)')
  }, [])

  const clear = useCallback(() => {
    drawRef.current?.clear()
    getState().setZone(null)
  }, [])

  // external zone changes (presenter skip-to-broadcast) → reflect in the editor
  useEffect(
    () =>
      useStore.subscribe((s, prev) => {
        const draw = drawRef.current
        if (!draw || s.zone === prev.zone || !s.zone) return
        const snap = draw.getSnapshot()
        const cur = snap[snap.length - 1]
        if (cur && JSON.stringify(cur.geometry) === JSON.stringify(s.zone)) return
        if (snap.length === 0) loadPolygon(draw, s.zone)
      }),
    [],
  )

  return { setMode, suggest, clear }
}

function loadPolygon(draw: TerraDraw, zone: Polygon) {
  const round = (n: number) => Math.round(n * 1e6) / 1e6
  const feature: GeoJSONStoreFeatures = {
    type: 'Feature',
    id: crypto.randomUUID(),
    geometry: { type: 'Polygon', coordinates: [zone.coordinates[0].map((p) => [round(p[0]), round(p[1])])] },
    properties: { mode: 'polygon' },
  }
  const res = draw.addFeatures([feature])
  if (res[0] && !res[0].valid && import.meta.env.DEV) console.warn('terra-draw rejected zone', res[0].reason)
}

