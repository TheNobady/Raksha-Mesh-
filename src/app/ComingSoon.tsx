import { motion } from 'framer-motion'
import { FileText, HeartHandshake, House, Lock, Settings, Users, type LucideIcon } from 'lucide-react'
import { SHELTERS, VOLUNTEERS } from '../data/infrastructure'
import { districtName } from '../data/villages'
import { fmtIN } from '../lib/format'
import type { Screen } from '../store/scenarioStore'
import { GlassPanel } from '../components/ui/GlassPanel'

const META: Partial<Record<Screen, { title: string; icon: LucideIcon; blurb: string }>> = {
  shelters: { title: 'Shelter Management', icon: House, blurb: 'Live occupancy, supplies and medical desks across 879 cyclone shelters.' },
  volunteers: { title: 'Volunteer Network', icon: Users, blurb: 'Roster, skills and live tasking for 1,142 Aapda Mitra volunteers on duty.' },
  recovery: { title: 'Recovery & Relief', icon: HeartHandshake, blurb: 'Damage assessment, relief distribution and restoration tracking.' },
  reports: { title: 'Reports & After-Action', icon: FileText, blurb: 'Auto-generated situation reports for NDMA, SEOC and district collectors.' },
  settings: { title: 'Platform Settings', icon: Settings, blurb: 'Channel gateways, signing keys, templates and access control.' },
}

function Preview({ screen }: { screen: Screen }) {
  if (screen === 'shelters') {
    return (
      <div className="grid grid-cols-2 gap-2 min-[1600px]:grid-cols-3">
        {SHELTERS.slice(0, 9).map((s, i) => {
          const occ = Math.min(98, (s.occupancy ?? 20) + i * 7)
          return (
            <div key={s.id} className="rounded-lg border border-sky-400/10 bg-slate-950/50 p-2.5">
              <div className="truncate text-[12.5px] text-slate-100">{s.name}</div>
              <div className="font-mono text-[10px] text-slate-500">{districtName(s.district ?? '')} · cap {fmtIN(s.capacity ?? 0)}</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-slate-800">
                <div className={`h-full rounded ${occ > 85 ? 'bg-red-500' : occ > 60 ? 'bg-amber-400' : 'bg-green-400'}`} style={{ width: `${occ}%` }} />
              </div>
              <div className="mt-0.5 text-right font-mono text-[10px] text-slate-400">{occ}% full</div>
            </div>
          )
        })}
      </div>
    )
  }
  if (screen === 'volunteers') {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {VOLUNTEERS.slice(0, 12).map((v, i) => (
          <div key={v.id} className="flex items-center gap-2 rounded-lg bg-slate-950/50 px-2 py-1.5 text-[12px]">
            <span className={`h-2 w-2 rounded-full ${i % 4 === 0 ? 'bg-amber-400' : 'bg-green-400'}`} />
            <span className="flex-1 truncate text-slate-200">Aapda Mitra #{2200 + i * 7}</span>
            <span className="font-mono text-[10px] text-slate-500">{districtName(v.district ?? '')}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {[0.8, 0.55, 0.7, 0.4].map((w, i) => (
        <div key={i} className="h-10 rounded-lg bg-slate-800/40 shimmer" style={{ width: `${w * 100}%` }} />
      ))}
    </div>
  )
}

export function ComingSoon({ screen }: { screen: Screen }) {
  const m = META[screen]
  if (!m) return null
  return (
    <div className="pointer-events-auto absolute inset-0 grid place-items-center p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[860px]">
        <GlassPanel title={m.title} icon={m.icon} right={<span className="flex items-center gap-1 rounded border border-amber-400/40 px-1.5 py-0.5 font-hud text-[10px] font-bold uppercase tracking-wider text-amber-300"><Lock size={10} /> Phase 2</span>}>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
                <m.icon size={26} className="text-cyan-300" />
              </div>
              <div>
                <div className="font-display text-xl font-bold tracking-wider text-white">Coming soon</div>
                <div className="text-[13px] text-slate-400">{m.blurb}</div>
              </div>
            </div>
            <div className="relative mt-5">
              <div className="pointer-events-none opacity-70">
                <Preview screen={screen} />
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  )
}
