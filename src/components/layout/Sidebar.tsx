import { motion } from 'framer-motion'
import {
  Activity, BarChart3, BellRing, FileText, HeartHandshake, House, LifeBuoy, Network, RadioTower, Settings, Users,
  type LucideIcon,
} from 'lucide-react'
import { useStore, type Screen } from '../../store/scenarioStore'

const MAIN: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'command', label: 'Command Centre', icon: Activity },
  { id: 'composer', label: 'Alert Composer', icon: BellRing },
  { id: 'routing', label: 'Routing & Channels', icon: Network },
  { id: 'reach', label: 'Reach & Ack', icon: RadioTower },
  { id: 'rescue', label: 'Rescue Ops', icon: LifeBuoy },
]
const MORE: { id: Screen; label: string; icon: LucideIcon }[] = [
  { id: 'shelters', label: 'Shelters', icon: House },
  { id: 'volunteers', label: 'Volunteers', icon: Users },
  { id: 'recovery', label: 'Recovery', icon: HeartHandshake },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const screen = useStore((s) => s.screen)
  const setScreen = useStore((s) => s.setScreen)
  const sosOpen = useStore((s) => s.sos.filter((x) => x.status !== 'rescued').length)
  const broadcast = useStore((s) => s.broadcastAt !== null)

  const Item = ({ id, label, icon: Icon, dim }: { id: Screen; label: string; icon: LucideIcon; dim?: boolean }) => {
    const active = screen === id
    const badge = id === 'rescue' && sosOpen > 0 ? sosOpen : id === 'routing' && broadcast ? '●' : null
    return (
      <button
        onClick={() => setScreen(id)}
        title={label}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left cursor-pointer transition-colors ${active ? 'text-white' : dim ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-100'}`}
      >
        {active && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-0 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-400/20 to-cyan-400/0 shadow-[0_0_22px_rgba(34,211,238,0.25)]"
            transition={{ type: 'spring', stiffness: 450, damping: 36 }}
          />
        )}
        {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />}
        <Icon size={18} className={`relative shrink-0 ${active ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]' : ''}`} />
        <span className="relative hidden min-[1600px]:block font-hud text-[13px] font-semibold uppercase tracking-wider truncate">{label}</span>
        {badge !== null && (
          <span className={`absolute right-1.5 top-1.5 min-[1600px]:static min-[1600px]:ml-auto relative grid min-w-5 h-5 place-items-center rounded-full px-1 text-[10px] font-bold ${id === 'rescue' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-green-400 blink'}`}>
            {badge}
          </span>
        )}
      </button>
    )
  }

  return (
    <nav className="relative z-20 flex w-[64px] min-[1600px]:w-[212px] shrink-0 flex-col gap-1 border-r border-sky-400/10 bg-[#060f20]/80 px-2 py-3 backdrop-blur-md">
      <div className="hidden min-[1600px]:block px-3 pb-1 label text-slate-500">Operations</div>
      {MAIN.map((m) => (
        <Item key={m.id} {...m} />
      ))}
      <div className="my-2 h-px bg-sky-400/10" />
      <div className="hidden min-[1600px]:block px-3 pb-1 label text-slate-500">Management</div>
      {MORE.map((m) => (
        <Item key={m.id} {...m} dim />
      ))}
      <div className="mt-auto hidden min-[1600px]:block rounded-lg border border-sky-400/10 bg-slate-900/40 p-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <BarChart3 size={13} className="text-cyan-400" /> Node uptime
        </div>
        <div className="num mt-1 text-lg text-green-300 text-glow-green">99.2%</div>
        <div className="mt-2 h-1 overflow-hidden rounded bg-slate-800">
          <div className="h-full w-[92%] rounded bg-gradient-to-r from-cyan-400 to-green-400" />
        </div>
        <div className="mt-2 font-mono text-[10px] text-slate-500">build rm-26.09 · secure</div>
      </div>
    </nav>
  )
}
