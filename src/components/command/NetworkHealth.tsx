import { Activity } from 'lucide-react'
import { LORA, SIRENS, TOWERS } from '../../data/infrastructure'
import { useStore } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'
import { GlassPanel } from '../ui/GlassPanel'

const odishaTowers = TOWERS.filter((t) => t.region === 'odisha').length

function Ring({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const r = 22
  const c = 2 * Math.PI * r
  const f = total ? value / total : 0
  return (
    <div className="flex flex-col items-center">
      <svg width="58" height="58" viewBox="0 0 58 58">
        <circle cx="29" cy="29" r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth="5" />
        <circle
          cx="29" cy="29" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - f)} transform="rotate(-90 29 29)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)', filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x="29" y="33" textAnchor="middle" className="num" fontSize="12" fill="#e2e8f0">{Math.round(f * 100)}%</text>
      </svg>
      <span className="mt-0.5 font-hud text-[9.5px] uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  )
}

export function NetworkHealth() {
  const down = useStore((s) => Object.keys(s.towersDown).length)
  const meshOn = useStore((s) => (s.broadcastAt !== null ? LORA.length + 172 : LORA.length + 96))
  const online = odishaTowers - down
  return (
    <GlassPanel title="Network Health" icon={Activity} live>
      <div className="flex items-center justify-around px-2 pt-2">
        <Ring value={online} total={odishaTowers} color={down > 20 ? '#F59E0B' : '#4ADE80'} label="Towers" />
        <Ring value={meshOn} total={LORA.length + 180} color="#2DD4BF" label="Mesh" />
        <Ring value={SIRENS.length} total={SIRENS.length} color="#22D3EE" label="Sirens" />
      </div>
      <div className="grid grid-cols-3 gap-1.5 p-2">
        <div className="rounded-md bg-slate-950/40 px-2 py-1">
          <div className="font-hud text-[9px] uppercase tracking-wider text-slate-500">Online</div>
          <CountUp value={online} className="text-sm text-green-300" />
        </div>
        <div className="rounded-md bg-red-950/30 px-2 py-1 ring-1 ring-red-500/20">
          <div className="font-hud text-[9px] uppercase tracking-wider text-slate-500">Offline</div>
          <CountUp value={down} className="text-sm text-red-400 text-glow-red" />
        </div>
        <div className="rounded-md bg-slate-950/40 px-2 py-1">
          <div className="font-hud text-[9px] uppercase tracking-wider text-slate-500">Mesh</div>
          <CountUp value={meshOn} className="text-sm text-teal-300" />
        </div>
      </div>
    </GlassPanel>
  )
}
