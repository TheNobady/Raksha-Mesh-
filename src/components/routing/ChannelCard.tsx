import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Loader2 } from 'lucide-react'
import { forwardRef, useEffect, useState } from 'react'
import type { ChannelDef } from '../../data/content'
import { fmtCompact, fmtIN } from '../../lib/format'
import { useStore, type ChannelState } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'
import { CHANNEL_ICON } from './channelIcons'

const STYLE: Record<ChannelState, { border: string; bg: string; text: string; label: string }> = {
  standby: { border: 'border-slate-600/40', bg: 'from-slate-900/80 to-slate-950/80', text: 'text-slate-400', label: 'STANDBY' },
  attempting: { border: 'border-amber-400/70', bg: 'from-amber-950/60 to-slate-950/80', text: 'text-amber-300', label: 'ATTEMPTING…' },
  failed: { border: 'border-red-500/80', bg: 'from-red-950/80 to-red-950/40', text: 'text-red-300', label: 'FAILED' },
  operational: { border: 'border-green-400/60', bg: 'from-green-950/50 to-slate-950/80', text: 'text-green-300', label: 'OPERATIONAL' },
}

function MeshMini() {
  const nodes = [[14, 30], [40, 12], [62, 34], [36, 50], [86, 18], [84, 52], [110, 32]]
  const edges = [[0, 1], [1, 2], [0, 3], [3, 2], [2, 4], [2, 5], [4, 6], [5, 6], [1, 4]]
  return (
    <svg viewBox="0 0 124 62" className="h-10 w-full">
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#2DD4BF" strokeOpacity="0.5" strokeWidth="1" />
      ))}
      {edges.map(([a, b], i) => (
        <circle key={`p${i}`} r="1.8" fill="#A7F3D0">
          <animateMotion dur={`${1.2 + (i % 4) * 0.35}s`} repeatCount="indefinite" path={`M${nodes[a][0]},${nodes[a][1]} L${nodes[b][0]},${nodes[b][1]}`} />
        </circle>
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.2" fill="#0F172A" stroke="#5EEAD4" strokeWidth="1.5" />
      ))}
    </svg>
  )
}

export const ChannelCard = forwardRef<HTMLDivElement, { def: ChannelDef; big?: boolean }>(function ChannelCard({ def, big }, ref) {
  const state = useStore((s) => s.channels[def.id].state)
  const st = STYLE[state]
  const Icon = CHANNEL_ICON[def.id]
  const [latency, setLatency] = useState(120)

  useEffect(() => {
    if (state !== 'attempting') return
    setLatency(180)
    const t = window.setInterval(() => setLatency((l) => Math.round(l * 1.35 + 40)), 180)
    return () => window.clearInterval(t)
  }, [state])

  const failed = state === 'failed'
  const ok = state === 'operational'
  const deliveredText = (n: number) => (def.kind === 'units' ? `${Math.round(n)}/${def.total ?? def.delivered}` : def.kind === 'nodes' ? `${Math.round(n)} nodes` : n >= 1e5 ? fmtCompact(n) : fmtIN(n))

  return (
    <motion.div
      ref={ref}
      layout
      animate={{
        scale: failed ? [1, 1.08, 1.03] : state === 'attempting' ? [1, 1.02, 1] : 1,
        rotateY: failed ? [0, 90, 0] : 0,
      }}
      transition={{ duration: failed ? 0.7 : 0.6, repeat: state === 'attempting' ? Infinity : 0 }}
      style={{ transformPerspective: 800 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-xl border bg-gradient-to-b p-3 ${st.border} ${st.bg} ${failed ? 'glow-red z-10' : ok ? 'glow-green' : state === 'attempting' ? 'glow-amber' : ''}`}
    >
      {ok && <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent" />}
      {failed && <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(239,68,68,0.06)_0_8px,transparent_8px_16px)]" />}

      <div className="relative flex items-start justify-between">
        <div className={`relative grid place-items-center rounded-xl ${big ? 'h-16 w-16' : 'h-10 w-10'} ${failed ? 'bg-red-500/20' : ok ? 'bg-green-500/15' : state === 'attempting' ? 'bg-amber-500/15' : 'bg-slate-800/60'}`}>
          {failed && <span className="absolute inset-[-5px] rounded-full border-2 border-dashed border-red-400/70 spin-slow" style={{ animationDuration: '3s' }} />}
          {failed ? <AlertTriangle size={big ? 34 : 20} className="text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" /> : <Icon size={big ? 30 : 20} className={ok ? 'text-green-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]' : st.text} />}
        </div>
        <AnimatePresence>
          {ok && (
            <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="grid h-6 w-6 place-items-center rounded-full bg-green-400 text-slate-950 shadow-[0_0_14px_rgba(74,222,128,0.9)]">
              <Check size={15} strokeWidth={3} />
            </motion.span>
          )}
          {state === 'attempting' && <Loader2 size={18} className="spin text-amber-300" />}
        </AnimatePresence>
      </div>

      <div className={`relative mt-2 font-hud font-bold uppercase tracking-wide text-white ${big ? 'text-xl' : 'text-[14px] leading-tight'}`}>{def.name}</div>
      <div className={`relative font-hud font-bold tracking-[0.14em] ${st.text} ${big ? 'text-base' : 'text-[11px]'} ${failed ? 'text-glow-red' : ok ? 'text-glow-green' : ''} ${state === 'attempting' ? 'blink' : ''}`}>{st.label}</div>

      {big || failed ? (
        <div className="relative mt-2 space-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Cell latency</span>
            <span className={failed ? 'text-red-300' : state === 'attempting' ? 'text-amber-300' : 'text-slate-300'}>{failed ? 'timeout' : state === 'attempting' ? `${latency} ms` : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Delivered</span>
            <span className={failed ? 'text-red-300' : 'text-slate-300'}>{failed ? '0%' : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Backhaul</span>
            <span className={failed ? 'text-red-300' : 'text-slate-300'}>{failed ? '34 towers down' : 'checking'}</span>
          </div>
          {big && <p className="pt-1 font-sans text-[11px] leading-snug text-slate-400">{def.desc}</p>}
        </div>
      ) : (
        <div className="relative mt-auto pt-1.5">
          {def.id === 'mesh' && ok && <MeshMini />}
          {def.id !== 'mesh' && <p className="line-clamp-2 text-[10.5px] leading-snug text-slate-400">{def.desc}</p>}
          <div className="mt-1.5 flex items-end justify-between gap-1">
            <div>
              <div className="font-hud text-[9px] uppercase tracking-wider text-slate-500">Delivered</div>
              {ok ? <CountUp value={def.delivered} duration={2.4} format={deliveredText} className="text-[15px] text-green-200" /> : <span className="num text-[15px] text-slate-600">—</span>}
            </div>
            <div className="text-right font-mono text-[10px] leading-tight">
              <div className={ok ? 'text-slate-300' : 'text-slate-600'}>{ok ? def.latency : '—'}</div>
              <div className={ok ? 'text-green-300' : 'text-slate-600'}>{ok ? `${def.reach}% reach` : ''}</div>
            </div>
          </div>
          <button
            onClick={() => useStore.getState().toast('info', `${def.name}`, `${def.desc} · latency ${def.latency}`)}
            className="mt-1.5 w-full rounded-md border border-sky-400/15 py-0.5 font-hud text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:border-cyan-400/40 hover:text-cyan-200 cursor-pointer"
          >
            View details
          </button>
        </div>
      )}
    </motion.div>
  )
})
