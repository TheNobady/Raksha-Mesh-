import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { DISTRICTS } from '../../data/geography'
import { VILLAGES } from '../../data/villages'
import { fmtCompact } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { GlassPanel } from '../ui/GlassPanel'

const RISK = {
  Extreme: 'border-rose-400/60 bg-rose-500/20 text-rose-200',
  'Very High': 'border-orange-400/60 bg-orange-500/15 text-orange-200',
  High: 'border-amber-400/50 bg-amber-500/15 text-amber-200',
  Moderate: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
}
const ORDER = { Extreme: 0, 'Very High': 1, High: 2, Moderate: 3 }

const atRisk = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, VILLAGES.filter((v) => v.district === d.id).reduce((s, v) => s + v.population, 0) * (d.risk === 'Extreme' ? 1.9 : d.risk === 'Very High' ? 1.3 : 0.9)]),
)
const max = Math.max(...Object.values(atRisk))
const rows = [...DISTRICTS].sort((a, b) => ORDER[a.risk] - ORDER[b.risk] || atRisk[b.id] - atRisk[a.id])

export function DistrictTable() {
  const flyTo = useStore((s) => s.flyTo)
  const calm = useStore((s) => s.phase === 'calm')
  return (
    <GlassPanel
      title={calm ? 'District Status' : 'District Risk'}
      icon={Map}
      right={<span className="font-mono text-[10px] text-slate-500">{calm ? 'all normal' : '10 coastal'}</span>}
    >
      <div className="px-2 py-1.5">
        <div className="grid grid-cols-[1fr_78px_62px] gap-2 px-1.5 pb-1 font-hud text-[9.5px] uppercase tracking-widest text-slate-500">
          <span>District</span>
          <span>{calm ? 'Status' : 'Risk'}</span>
          <span className="text-right">{calm ? 'Population' : 'At risk'}</span>
        </div>
        {rows.map((d, i) => (
          <motion.button
            key={d.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * i }}
            onClick={() => flyTo(d.center, 9, 50)}
            className="grid w-full grid-cols-[1fr_78px_62px] items-center gap-2 rounded-md px-1.5 py-[5px] text-left hover:bg-cyan-400/5 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-slate-100">{d.name}</div>
              <div className="mt-0.5 h-1 overflow-hidden rounded bg-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(atRisk[d.id] / max) * 100}%` }}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.05 }}
                  className={`h-full rounded ${calm ? 'bg-slate-600' : d.risk === 'Extreme' ? 'bg-rose-500' : d.risk === 'Very High' ? 'bg-orange-500' : d.risk === 'High' ? 'bg-amber-400' : 'bg-cyan-400'}`}
                />
              </div>
            </div>
            <span className={`rounded border px-1 py-0.5 text-center font-hud text-[9.5px] font-bold uppercase tracking-wider ${calm ? 'border-green-400/40 bg-green-500/10 text-green-300' : RISK[d.risk]}`}>
              {calm ? 'Normal' : d.risk}
            </span>
            <span className="text-right font-mono text-[11.5px] text-slate-200">{fmtCompact(Math.round(calm ? d.population : atRisk[d.id]))}</span>
          </motion.button>
        ))}
      </div>
    </GlassPanel>
  )
}
