import { motion } from 'framer-motion'
import { ChevronDown, Cpu, MapPin, ShieldCheck, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { istClock, istDate } from '../../lib/format'
import { springSnap } from '../../lib/motion'
import { useStore } from '../../store/scenarioStore'
import { PhoneDock } from '../phones/PhoneLayer'
import { Logo } from '../ui/Logo'
import { StatusDot } from '../ui/StatusDot'

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  return (
    <div className="flex flex-col items-center leading-none">
      <span className="num text-xl text-cyan-100 text-glow-cyan">{istClock(now)}</span>
      <span className="mt-1 font-hud text-[10px] uppercase tracking-[0.2em] text-slate-400">{istDate(now)} · IST</span>
    </div>
  )
}

export function TopBar() {
  const muted = useStore((s) => s.muted)
  const setMuted = useStore((s) => s.setMuted)
  const failover = useStore((s) => s.failoverPhase)
  const towersDown = useStore((s) => Object.keys(s.towersDown).length)
  const broadcast = useStore((s) => s.broadcastAt !== null)
  const calm = useStore((s) => s.phase === 'calm')

  const degraded = towersDown > 0
  const health = failover >= 2 ? { label: 'Failover Active', color: 'amber' as const } : degraded ? { label: `${towersDown} Towers Down`, color: 'red' as const } : { label: 'All Systems Nominal', color: 'green' as const }

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-4 border-b border-sky-400/15 bg-gradient-to-b from-[#0b1a33]/95 to-[#071224]/90 px-4 backdrop-blur-md">
      <div className="flex items-center gap-3 min-w-0">
        <Logo size={40} animated />
        <div className="leading-tight min-w-0">
          <div className="font-display text-lg font-bold tracking-[0.18em] text-white">
            RAKSHA<span className="text-cyan-300 text-glow-cyan"> MESH</span>
          </div>
          <div className="font-hud text-[11px] uppercase tracking-[0.2em] text-slate-400 truncate">Integrated Disaster Management Platform</div>
        </div>
      </div>

      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6">
        <Clock />
        <motion.div
          layout
          layoutId="threat-pill"
          transition={springSnap}
          className={`flex items-center gap-2.5 rounded-full border px-4 py-1.5 ${calm ? 'border-green-400/50 bg-green-500/10' : broadcast ? 'border-rose-400/70 bg-rose-500/20 glow-red' : 'border-amber-400/60 bg-amber-500/15 glow-amber'}`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${calm ? 'bg-green-400 pulse-dot' : broadcast ? 'bg-rose-400 blink' : 'bg-amber-400 blink'}`} />
          <span className={`font-hud text-sm font-bold uppercase tracking-[0.18em] ${calm ? 'text-green-200' : broadcast ? 'text-rose-100 text-glow-red' : 'text-amber-100 text-glow-amber'}`}>
            {calm ? 'No Active Threat — Monitoring' : broadcast ? 'Cyclone Evacuation — Active' : 'Cyclone Alert — Active'}
          </span>
        </motion.div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {!calm && <button className="hidden min-[1600px]:flex items-center gap-2 rounded-lg border border-sky-400/20 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-200 cursor-pointer hover:border-cyan-400/50">
          <MapPin size={14} className="text-cyan-300" />
          <span className="font-hud font-semibold uppercase tracking-wider">Odisha Coast</span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>}
        <div className="flex items-center gap-2 rounded-lg border border-sky-400/20 bg-slate-900/40 px-3 py-1.5">
          <StatusDot color={health.color} />
          <span className={`font-hud text-xs font-semibold uppercase tracking-wider ${health.color === 'green' ? 'text-green-300' : health.color === 'amber' ? 'text-amber-300' : 'text-red-300'}`}>
            {health.label}
          </span>
          <Cpu size={13} className="text-slate-500" />
        </div>
        {!calm && <PhoneDock />}
        <button
          onClick={() => setMuted(!muted)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-sky-400/20 bg-slate-900/40 text-slate-300 hover:text-cyan-200 hover:border-cyan-400/50 cursor-pointer"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <div className="flex items-center gap-2.5 border-l border-sky-400/15 pl-3">
          <div className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 font-hud text-sm font-bold text-white ring-2 ring-cyan-400/40">
            DC
            <ShieldCheck size={13} className="absolute -bottom-1 -right-1 rounded-full bg-[#071224] text-green-400" />
          </div>
          <div className="hidden 2xl:block leading-tight">
            <div className="text-xs font-semibold text-slate-100">District Control Officer</div>
            <div className="font-hud text-[10px] uppercase tracking-wider text-slate-400">SEOC Odisha · Level 3</div>
          </div>
        </div>
      </div>
    </header>
  )
}
