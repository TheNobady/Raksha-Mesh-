import { AnimatePresence, motion } from 'framer-motion'
import { Accessibility, Baby, Beef, Building2, GraduationCap, Hospital, House, RadioTower, Siren, Users, UsersRound, type LucideIcon } from 'lucide-react'
import { districtName, VILLAGE_BY_ID } from '../../data/villages'
import { fmtCompact, fmtIN } from '../../lib/format'
import { useStore } from '../../store/scenarioStore'
import { CountUp } from '../ui/CountUp'
import { LiveTag } from '../ui/LiveTag'

function Tile({ icon: Icon, label, value, sub, tone = 'text-slate-100', format }: { icon: LucideIcon; label: string; value: number; sub?: string; tone?: string; format?: 'in' | 'compact' }) {
  return (
    <div className="rounded-lg border border-sky-400/10 bg-slate-950/55 px-2.5 py-1.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={12} className="text-cyan-400" />
        <span className="font-hud text-[10px] uppercase tracking-wider truncate">{label}</span>
      </div>
      <CountUp value={value} format={format ?? 'in'} duration={0.7} className={`block text-lg leading-tight ${tone}`} />
      {sub && <div className="font-mono text-[9.5px] text-slate-500 truncate">{sub}</div>}
    </div>
  )
}

export function ImpactStrip() {
  const impact = useStore((s) => s.impact)
  const down = useStore((s) => s.towersDown)
  const i = impact
  const towersDown = i ? i.towers.filter((t) => down[t]).length : 0
  return (
    <div className="glass brackets pointer-events-auto rounded-xl p-2.5">
      <span className="bk tl" />
      <span className="bk tr" />
      <span className="bk bl" />
      <span className="bk br" />
      <div className="mb-2 flex items-center gap-2">
        <Users size={13} className="text-amber-300" />
        <span className="label text-amber-200">Live Impact · Inside Danger Zone</span>
        <LiveTag label="TURF LIVE" color="cyan" />
        <span className="ml-auto font-mono text-[10.5px] text-slate-400">{i ? `${fmtIN(i.areaKm2)} km² · point-in-polygon` : 'Draw a zone to compute impact'}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        <Tile icon={Users} label="Population" value={i?.population ?? 0} format="compact" tone="text-amber-200 text-glow-amber" sub={i ? `${fmtIN(i.households)} households` : '—'} />
        <Tile icon={House} label="Villages" value={i?.villages ?? 0} />
        <Tile icon={GraduationCap} label="Schools" value={i?.schools ?? 0} />
        <Tile icon={Hospital} label="Hospitals" value={i?.hospitals ?? 0} />
        <Tile icon={Building2} label="Shelters" value={i?.shelters ?? 0} sub={i ? `cap. ${fmtCompact(i.shelterCapacity)}` : '—'} />
        <Tile icon={RadioTower} label="Mobile towers" value={i?.towers.length ?? 0} tone={towersDown ? 'text-red-300' : 'text-slate-100'} sub={i ? `${towersDown} down` : '—'} />
        <Tile icon={Siren} label="Sirens / PA hubs" value={(i?.sirens ?? 0) + (i?.speakers ?? 0)} sub={i ? `${i.sirens} sirens · ${i.speakers} PA` : '—'} />
        <Tile icon={UsersRound} label="Volunteers" value={i?.volunteers ?? 0} tone="text-orange-200" />
        <Tile icon={Accessibility} label="Vulnerable" value={(i?.elderly ?? 0) + (i?.pregnant ?? 0) + (i?.disabled ?? 0)} tone="text-rose-200" sub={i ? `${fmtIN(i.elderly)} eld · ${fmtIN(i.pregnant)} preg · ${fmtIN(i.disabled)} PwD` : '—'} />
        <Tile icon={Beef} label="Livestock" value={i?.livestock ?? 0} format="compact" sub="estimated" />
      </div>
    </div>
  )
}

export function TopVillages() {
  const impact = useStore((s) => s.impact)
  const flyTo = useStore((s) => s.flyTo)
  if (!impact || impact.topVillages.length === 0) return null
  const max = impact.topVillages[0].population
  return (
    <div className="glass pointer-events-auto hidden w-60 rounded-xl p-2.5 min-[1600px]:block">
      <div className="mb-1.5 flex items-center gap-2">
        <Baby size={12} className="text-amber-300" />
        <span className="label">Top villages in zone</span>
      </div>
      <AnimatePresence initial={false}>
        {impact.topVillages.map((v) => (
          <motion.button
            layout
            key={v.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => flyTo(VILLAGE_BY_ID[v.id].lngLat, 10, 35)}
            className="block w-full rounded px-1 py-1 text-left hover:bg-amber-400/5 cursor-pointer"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-slate-100">{v.name}</span>
              <span className="font-mono text-[11px] text-amber-200">{fmtIN(v.population)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded bg-slate-800">
                <div className="h-full rounded bg-gradient-to-r from-amber-500 to-rose-500" style={{ width: `${(v.population / max) * 100}%` }} />
              </div>
              <span className="font-hud text-[9px] uppercase tracking-wider text-slate-500">{districtName(v.district)}</span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
