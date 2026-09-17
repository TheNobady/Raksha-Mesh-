import { AnimatePresence, motion } from 'framer-motion'
import { Drone, LifeBuoy, PhoneCall, PhoneMissed, Ship, Smartphone, UserX, Users } from 'lucide-react'
import { TAG_STYLE, type SOSSource } from '../../data/rescue'
import { useStore, type SOSItem } from '../../store/scenarioStore'
import { GlassPanel } from '../ui/GlassPanel'

const SOURCE_ICON: Record<SOSSource, typeof Drone> = {
  'SOS app': Smartphone,
  IVR: PhoneCall,
  'Missed call': PhoneMissed,
  'Drone detection': Drone,
  Unreached: UserX,
}

const ORDER = { open: 0, assigned: 1, dispatched: 2, rescued: 3 }

function age(elapsed: number, created: number) {
  const m = Math.max(0, Math.floor((elapsed - created) * 0.5))
  return m < 1 ? 'just now' : `${m} min ago`
}

function Row({ x, rank }: { x: SOSItem; rank: number }) {
  const elapsed = useStore((s) => Math.floor(s.elapsed))
  const assign = useStore((s) => s.assignTeam)
  const dispatch = useStore((s) => s.dispatchBoat)
  const Icon = SOURCE_ICON[x.source]
  const rescued = x.status === 'rescued'
  const urgColor = x.urgency >= 90 ? 'from-red-500 to-rose-400' : x.urgency >= 75 ? 'from-orange-500 to-amber-400' : 'from-amber-500 to-yellow-300'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40, backgroundColor: 'rgba(239,68,68,0.35)' }}
      animate={{ opacity: rescued ? 0.55 : 1, x: 0, backgroundColor: rescued ? 'rgba(34,197,94,0.06)' : 'rgba(15,23,42,0.55)' }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ layout: { type: 'spring', stiffness: 380, damping: 34 }, backgroundColor: { duration: 1.4 } }}
      className={`relative overflow-hidden rounded-xl border p-2.5 ${rescued ? 'border-green-500/30' : x.urgency >= 90 ? 'border-red-500/50' : 'border-sky-400/15'}`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display text-sm font-bold ${rescued ? 'bg-green-500/15 text-green-300' : rank === 1 ? 'bg-red-500/25 text-red-200 shadow-[0_0_14px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-slate-300'}`}>
          #{rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-semibold text-white">{x.place}</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
              <Users size={11} /> {x.people}
            </span>
            {x.merged > 1 && <span className="rounded bg-violet-500/25 px-1.5 py-0.5 font-hud text-[9.5px] font-bold uppercase text-violet-200">Merged ×{x.merged}</span>}
            <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-slate-400">
              <Icon size={11} /> {x.source} · {age(elapsed, x.createdAt)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded bg-slate-800">
              <motion.div initial={{ width: 0 }} animate={{ width: `${x.urgency}%` }} transition={{ duration: 0.9 }} className={`h-full rounded bg-gradient-to-r ${urgColor}`} />
            </div>
            <span className="font-mono text-[10.5px] text-slate-300">{x.urgency}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {x.tags.map((t) => (
              <span key={t} className={`rounded border px-1.5 py-[1px] text-[10px] ${TAG_STYLE[t] ?? 'border-slate-500/30 text-slate-300'}`}>
                {t}
              </span>
            ))}
          </div>
          {!rescued && (
            <div className="mt-2 flex items-center gap-1.5">
              <button
                onClick={() => assign(x.id)}
                disabled={x.status !== 'open'}
                className="flex items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2 py-1 font-hud text-[10.5px] font-bold uppercase tracking-wider text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-40 cursor-pointer"
              >
                <LifeBuoy size={12} /> {x.team && x.status !== 'open' ? x.team : 'Assign team'}
              </button>
              <button
                onClick={() => dispatch(x.id)}
                disabled={x.status === 'dispatched'}
                className="flex items-center gap-1 rounded-md border border-orange-400/50 bg-orange-500/15 px-2 py-1 font-hud text-[10.5px] font-bold uppercase tracking-wider text-orange-100 hover:bg-orange-500/25 disabled:opacity-50 cursor-pointer"
              >
                <Ship size={12} /> {x.status === 'dispatched' ? 'Boat en route' : 'Dispatch boat'}
              </button>
              {x.status === 'dispatched' && <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400 blink" />}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {rescued && (
          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: -24 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-md border-[3px] border-green-400 px-3 py-0.5 font-display text-lg font-bold tracking-[0.2em] text-green-300 text-glow-green"
          >
            {x.source === 'Unreached' ? 'REACHED' : 'RESCUED'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function SOSBoard() {
  const sos = useStore((s) => s.sos)
  const sorted = [...sos].sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.urgency - a.urgency)
  const open = sos.filter((x) => x.status !== 'rescued').length
  const people = sos.filter((x) => x.status !== 'rescued').reduce((s, x) => s + x.people, 0)
  return (
    <GlassPanel
      title="SOS & Unreached · Priority Board"
      icon={LifeBuoy}
      live
      className="h-full"
      right={
        <span className="font-mono text-[10.5px] text-red-300">
          {open} open · {people} people
        </span>
      }
    >
      <div className="thin-scroll h-full space-y-2 overflow-y-auto p-2">
        <AnimatePresence initial={false}>
          {sorted.map((x, i) => (
            <Row key={x.id} x={x} rank={i + 1} />
          ))}
        </AnimatePresence>
        {sos.length === 0 && (
          <div className="grid h-40 place-items-center text-center text-[12px] text-slate-500">
            No SOS requests yet.
            <br />
            Requests from app, IVR, missed calls, drones and unreached villages will rank here.
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
