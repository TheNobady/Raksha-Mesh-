import { motion } from 'framer-motion'
import { fmtIN, pct } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'

const STAGES = [
  { key: 'sent', label: 'Sent', color: ['#22D3EE', '#0E7490'] },
  { key: 'delivered', label: 'Delivered', color: ['#38BDF8', '#1D4ED8'] },
  { key: 'heard', label: 'Heard', color: ['#818CF8', '#4338CA'] },
  { key: 'ack', label: 'Acknowledged', color: ['#4ADE80', '#15803D'] },
  { key: 'evac', label: 'Evacuated', color: ['#FACC15', '#B45309'] },
] as const

export function Funnel() {
  const broadcast = useStore((s) => s.broadcastAt !== null)
  const target = useStore((s) => s.impact?.population ?? 420000)
  const reach = useStore((s) => s.reach)
  const values: Record<string, number> = broadcast ? { sent: target, ...reach } : { sent: 0, delivered: 0, heard: 0, ack: 0, evac: 0 }

  const W = 340
  const rowH = 46
  return (
    <div className="flex gap-3">
      <svg viewBox={`0 0 ${W} ${rowH * 5}`} className="h-[230px] flex-1">
        <defs>
          {STAGES.map((s) => (
            <linearGradient key={s.key} id={`fun-${s.key}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={s.color[1]} />
              <stop offset="0.5" stopColor={s.color[0]} />
              <stop offset="1" stopColor={s.color[1]} />
            </linearGradient>
          ))}
        </defs>
        {STAGES.map((s, i) => {
          const v = values[s.key]
          const f = target ? v / target : 0
          const next = i < 4 ? values[STAGES[i + 1].key] / (target || 1) : f * 0.92
          const top = Math.max(0.08, f) * W
          const bot = Math.max(0.06, next) * W
          const y = i * rowH
          const d = `M ${(W - top) / 2} ${y + 2} L ${(W + top) / 2} ${y + 2} L ${(W + bot) / 2} ${y + rowH - 2} L ${(W - bot) / 2} ${y + rowH - 2} Z`
          return (
            <g key={s.key}>
              <motion.path animate={{ d }} initial={false} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} fill={`url(#fun-${s.key})`} opacity={broadcast ? 0.9 : 0.15} stroke={s.color[0]} strokeWidth="1.5" />
              <text x={W / 2} y={y + rowH / 2 + 5} textAnchor="middle" fontSize="15" fill="#fff" fontFamily="Orbitron" fontWeight="700" style={{ textShadow: '0 1px 4px #000' }}>
                {fmtIN(v)}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex w-[120px] flex-col">
        {STAGES.map((s) => (
          <div key={s.key} className="flex h-[46px] flex-col justify-center">
            <span className="font-hud text-[12px] font-bold uppercase tracking-wider" style={{ color: s.color[0] }}>
              {s.label}
            </span>
            <CountUp value={pct(values[s.key], target)} format={(n) => `${Math.round(n)}%`} className="text-[13px] text-slate-300" />
          </div>
        ))}
      </div>
    </div>
  )
}
