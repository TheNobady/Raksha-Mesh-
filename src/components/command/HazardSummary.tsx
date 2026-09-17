import { CloudLightning, Mountain, Sun, Tornado, Waves, type LucideIcon } from 'lucide-react'
import { useStore } from '../../store/scenarioStore'
import { GlassPanel } from '../ui/GlassPanel'
import { StatusDot } from '../ui/StatusDot'

export function HazardSummary() {
  const flood = useStore((s) => s.floodStage)
  const slide = useStore((s) => s.landslideActive)
  const items: { name: string; icon: LucideIcon; status: string; level: 'red' | 'amber' | 'green' | 'cyan'; trend: '▲' | '▼' | '■'; detail: string }[] = [
    { name: 'Cyclone', icon: Tornado, status: 'EXTREME', level: 'red', trend: '▲', detail: 'ESCS · 185 km/h' },
    { name: 'Flood', icon: Waves, status: flood >= 3 ? 'SEVERE' : flood > 0 ? 'RISING' : 'WATCH', level: flood >= 2 ? 'red' : 'amber', trend: flood > 0 ? '▲' : '■', detail: `Mahanadi delta · stage ${flood}` },
    { name: 'Landslide', icon: Mountain, status: slide ? 'HIGH' : 'MODERATE', level: slide ? 'amber' : 'cyan', trend: slide ? '▲' : '■', detail: 'Gajapati · Kandhamal ghats' },
    { name: 'Heatwave', icon: Sun, status: 'LOW', level: 'green', trend: '▼', detail: 'Western Odisha · 36°C' },
    { name: 'Lightning', icon: CloudLightning, status: 'ACTIVE', level: 'amber', trend: '▲', detail: '1,284 strikes / hr' },
  ]
  const color = { red: 'text-red-300', amber: 'text-amber-300', green: 'text-green-300', cyan: 'text-cyan-300' }
  return (
    <GlassPanel title="Multi-Hazard Summary" icon={CloudLightning}>
      <div className="grid grid-cols-1 gap-1 p-2">
        {items.map((h) => (
          <div key={h.name} className="flex items-center gap-2.5 rounded-md border border-sky-400/5 bg-slate-950/30 px-2 py-1.5">
            <h.icon size={16} className={color[h.level]} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-100">{h.name}</span>
                <StatusDot color={h.level} size={6} pulse={h.level === 'red'} />
              </div>
              <div className="truncate font-mono text-[10px] text-slate-500">{h.detail}</div>
            </div>
            <span className={`font-hud text-[11px] font-bold tracking-wider ${color[h.level]}`}>{h.status}</span>
            <span className={`w-3 text-xs ${h.trend === '▲' ? 'text-red-400' : h.trend === '▼' ? 'text-green-400' : 'text-slate-500'}`}>{h.trend}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
