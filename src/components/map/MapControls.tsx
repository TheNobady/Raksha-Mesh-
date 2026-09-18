import { Box, Crosshair, Layers, Map as MapIcon, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { mapRefs } from '../../lib/mapInstance'
import { useStore } from '../../store/scenarioStore'
import { LayerPanel } from './LayerPanel'
import { resetView } from './camera'

export function MapControls({ className = '' }: { className?: string }) {
  const terrain = useStore((s) => s.layers.terrain)
  const toggle = useStore((s) => s.toggleLayer)
  const [layersOpen, setLayersOpen] = useState(false)

  const btn = 'grid h-9 w-9 place-items-center text-slate-300 hover:text-cyan-200 hover:bg-cyan-400/10 transition-colors cursor-pointer'
  const set3D = () => {
    const map = mapRefs.map
    if (!map) return
    const next = !terrain
    toggle('terrain')
    map.easeTo({ pitch: next ? 55 : 0, bearing: next ? -14 : 0, duration: 900 })
  }

  return (
    <div className={`pointer-events-auto flex flex-col items-end gap-2 ${className}`}>
      <div className="glass flex flex-col overflow-hidden rounded-lg divide-y divide-sky-400/10">
        <button className={btn} title="Zoom in" onClick={() => mapRefs.map?.zoomIn()}>
          <Plus size={16} />
        </button>
        <button className={btn} title="Zoom out" onClick={() => mapRefs.map?.zoomOut()}>
          <Minus size={16} />
        </button>
        <button className={btn} title="Reset view" onClick={resetView}>
          <Crosshair size={16} />
        </button>
        <button className={`${btn} ${terrain ? 'text-cyan-300' : ''}`} title={terrain ? 'Switch to 2D' : 'Switch to 3D'} onClick={set3D}>
          {terrain ? <Box size={16} /> : <MapIcon size={16} />}
        </button>
        <button className={`${btn} ${layersOpen ? 'bg-cyan-400/15 text-cyan-200' : ''}`} title="Layers" onClick={() => setLayersOpen((v) => !v)}>
          <Layers size={16} />
        </button>
      </div>
      {layersOpen && <LayerPanel onClose={() => setLayersOpen(false)} />}
    </div>
  )
}
