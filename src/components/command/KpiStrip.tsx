import { motion } from 'framer-motion'
import { Activity, Building2, CalendarCheck, HeartPulse, Landmark, RadioTower, ShieldCheck, Siren, Truck, Users, UsersRound, type LucideIcon } from 'lucide-react'
import { fmtCompact } from '../../lib/format'
import { riseIn, stagger } from '../../lib/motion'
import { useStore } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'

interface Kpi {
  label: string
  value: number
  icon: LucideIcon
  tone: 'red' | 'amber' | 'cyan' | 'green' | 'rose'
  format?: 'in' | 'compact' | ((n: number) => string)
  sub: string
}

const TONE = {
  red: { text: 'text-red-300 text-glow-red', icon: 'text-red-400', bar: 'from-red-500' },
  rose: { text: 'text-rose-200 text-glow-red', icon: 'text-rose-400', bar: 'from-rose-500' },
  amber: { text: 'text-amber-200 text-glow-amber', icon: 'text-amber-400', bar: 'from-amber-400' },
  cyan: { text: 'text-cyan-100 text-glow-cyan', icon: 'text-cyan-300', bar: 'from-cyan-400' },
  green: { text: 'text-green-200 text-glow-green', icon: 'text-green-400', bar: 'from-green-400' },
}

export function KpiStrip() {
  const calm = useStore((s) => s.phase === 'calm')
  const kpi = useStore((s) => s.kpi)
  const channelsFailed = useStore((s) => (s.channels.data.state === 'failed' || Object.keys(s.towersDown).length > 20 ? 1 : 0))
  const sosOpen = useStore((s) => s.sos.filter((x) => x.status !== 'rescued').length)

  const calmItems: Kpi[] = [
    { label: 'Network Uptime', value: 99.2, icon: Activity, tone: 'green', format: (n) => `${n.toFixed(1)}%`, sub: 'Rolling 30 days' },
    { label: 'Nodes Online', value: 1320, icon: RadioTower, tone: 'cyan', format: 'in', sub: 'Towers · mesh · sirens' },
    { label: 'Channels Ready', value: 10, icon: Siren, tone: 'green', format: (n) => `${Math.round(n)}/10`, sub: 'All paths tested' },
    { label: 'Shelters Ready', value: 879, icon: Building2, tone: 'cyan', format: 'in', sub: 'Capacity 1,04,500' },
    { label: 'Volunteers On Duty', value: 1142, icon: UsersRound, tone: 'cyan', format: 'in', sub: 'Aapda Mitra available' },
    { label: 'Active Alerts', value: 0, icon: Landmark, tone: 'green', format: 'in', sub: 'No live warnings' },
    { label: 'Districts Monitored', value: 30, icon: ShieldCheck, tone: 'cyan', format: 'in', sub: 'Odisha · all districts' },
    { label: 'Days Since Incident', value: 12, icon: CalendarCheck, tone: 'green', format: 'in', sub: 'Last: sq. depression' },
  ]

  const alertItems: Kpi[] = [
    { label: 'People in Danger Zone', value: kpi.peopleInDanger, icon: Users, tone: 'red', format: (n) => fmtCompact(n), sub: 'Live polygon estimate' },
    { label: 'Districts on Alert', value: kpi.districts, icon: Landmark, tone: 'amber', format: 'in', sub: 'of 30 · coastal belt' },
    { label: 'Active Alerts', value: kpi.activeAlerts, icon: Siren, tone: 'rose', format: 'in', sub: 'Watch · Warning · Evac' },
    { label: 'Shelters Open', value: kpi.sheltersOpen, icon: Building2, tone: 'cyan', format: 'in', sub: 'Capacity 1,04,500' },
    { label: 'Channels Online', value: 10 - channelsFailed, icon: RadioTower, tone: channelsFailed ? 'amber' : 'green', format: (n) => `${Math.round(n)}/10`, sub: channelsFailed ? 'Mobile data degraded' : 'All paths healthy' },
    { label: 'Volunteers Deployed', value: kpi.volunteers, icon: UsersRound, tone: 'cyan', format: 'in', sub: 'Aapda Mitra on duty' },
    { label: 'Evacuated', value: kpi.evacuated, icon: Truck, tone: 'green', format: (n) => fmtCompact(n), sub: 'Moved to shelters' },
    { label: 'Rescued', value: kpi.rescued, icon: HeartPulse, tone: 'green', format: 'in', sub: sosOpen ? `${sosOpen} SOS open` : 'No open SOS' },
  ]

  const items = calm ? calmItems : alertItems

  return (
    <motion.div key={calm ? 'calm' : 'alert'} variants={stagger(0.04)} initial="hidden" animate="show" className="grid grid-cols-4 min-[1500px]:grid-cols-8 gap-2">
      {items.map((k) => {
        const t = TONE[k.tone]
        const Icon = k.icon
        return (
          <motion.div key={k.label} variants={riseIn} className="glass pointer-events-auto relative overflow-hidden rounded-xl px-3 py-2">
            <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${t.bar} to-transparent opacity-80`} />
            <div className="flex items-center gap-1.5">
              <Icon size={13} className={t.icon} />
              <span className="font-hud text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 truncate">{k.label}</span>
            </div>
            <CountUp value={k.value} format={k.format} className={`mt-0.5 block text-[22px] leading-tight ${t.text}`} />
            <div className="truncate font-mono text-[10px] text-slate-500">{k.sub}</div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
