import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useQuality, type QualityLevel } from '../../lib/quality'
import { useStore, type LayerKey } from '../../store/scenarioStore'

const GROUPS: { title: string; items: { k: LayerKey; label: string; color: string }[] }[] = [
  {
    title: 'Cyclone',
    items: [
      { k: 'cyclone', label: 'Storm & track', color: '#f43f5e' },
      { k: 'cone', label: 'Forecast cone', color: '#f59e0b' },
      { k: 'windRings', label: 'Wind radii (34/50/64 kt)', color: '#f97316' },
      { k: 'rain', label: 'Rain & wind particles', color: '#93c5fd' },
      { k: 'surge', label: 'Storm surge coast', color: '#fb7185' },
    ],
  },
  {
    title: 'Hazards',
    items: [
      { k: 'flood', label: 'Flood extent', color: '#3b82f6' },
      { k: 'landslide', label: 'Landslide risk', color: '#b45309' },
      { k: 'rainfall', label: 'Heavy rainfall heat', color: '#22d3ee' },
      { k: 'heatwave', label: 'Heatwave zones', color: '#fb923c' },
      { k: 'lightning', label: 'Lightning strikes', color: '#d8b4fe' },
    ],
  },
  {
    title: 'Network',
    items: [
      { k: 'network', label: 'Nodes & links', color: '#4ade80' },
      { k: 'packets', label: 'Data flow packets', color: '#67e8f9' },
      { k: 'villages', label: 'Villages', color: '#cbd5e1' },
      { k: 'terrain', label: '3D terrain', color: '#38bdf8' },
    ],
  },
]

function fpsLabel() {
  const fps = useQuality.getState().fps
  return `${fps} fps`
}

function QualityBtn({ level }: { level: QualityLevel }) {
  const current = useQuality((s) => s.level)
  const setLevel = useQuality((s) => s.setLevel)
  return (
    <button
      onClick={() => setLevel(level)}
      className={`flex-1 rounded-md border px-1 py-1 font-hud text-[10px] font-bold uppercase tracking-wider cursor-pointer ${current === level ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-100' : 'border-sky-400/10 text-slate-400 hover:text-slate-200'}`}
      title={level === 'high' ? '3D terrain, particles, glows (needs a strong GPU)' : level === 'balanced' ? 'Recommended for laptops and projectors' : 'Minimal effects, maximum smoothness'}
    >
      {level === 'performance' ? 'Perf' : level}
    </button>
  )
}

export function LayerPanel({ onClose }: { onClose: () => void }) {
  const layers = useStore((s) => s.layers)
  const toggle = useStore((s) => s.toggleLayer)
  return (
    <motion.div
      initial={{ opacity: 0, x: 12, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="glass-strong w-60 rounded-xl p-3"
    >
      <div className="mb-2 flex items-center">
        <span className="label">Map Layers</span>
        <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white cursor-pointer">
          <X size={14} />
        </button>
      </div>
      <div className="mb-2 rounded-lg border border-sky-400/15 bg-slate-950/50 p-2">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-hud text-[10px] uppercase tracking-[0.2em] text-slate-500">Graphics</span>
          <span className="font-mono text-[10px] text-slate-500">{fpsLabel()}</span>
        </div>
        <div className="flex gap-1">
          {(['high', 'balanced', 'performance'] as QualityLevel[]).map((l) => (
            <QualityBtn key={l} level={l} />
          ))}
        </div>
      </div>
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-2">
          <div className="mb-1 font-hud text-[10px] uppercase tracking-[0.2em] text-slate-500">{g.title}</div>
          {g.items.map((it) => (
            <label key={it.k} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-slate-200 hover:bg-white/5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color, boxShadow: layers[it.k] ? `0 0 8px ${it.color}` : 'none', opacity: layers[it.k] ? 1 : 0.3 }} />
              <span className={layers[it.k] ? '' : 'text-slate-500'}>{it.label}</span>
              <span
                onClick={(e) => {
                  e.preventDefault()
                  toggle(it.k)
                }}
                className={`ml-auto relative h-4 w-7 rounded-full transition-colors ${layers[it.k] ? 'bg-cyan-500/70' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${layers[it.k] ? 'left-3.5' : 'left-0.5'}`} />
              </span>
            </label>
          ))}
        </div>
      ))}
    </motion.div>
  )
}
