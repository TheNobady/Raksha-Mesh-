import type { MapboxOverlay } from '@deck.gl/mapbox'
import type { Map as MLMap } from 'maplibre-gl'
import { create } from 'zustand'

/** Singleton handles to the one persistent map so other modules (draw, controls) can reach it. */
export const mapRefs: { map: MLMap | null; overlay: MapboxOverlay | null; visible: boolean } = {
  map: null,
  overlay: null,
  visible: true,
}

interface MapUi {
  ready: boolean
  styleFallback: boolean
  hover: { x: number; y: number; id: string; kind: 'node' | 'village' | 'sos' | 'unit' } | null
  slot: HTMLElement | null
  is3D: boolean
}

export const useMapUi = create<MapUi>(() => ({ ready: false, styleFallback: false, hover: null, slot: null, is3D: true }))
