import { CalendarClock, CloudLightning, Droplets, Factory, Flame, Mountain, Sun, Tornado, Waves, type LucideIcon } from 'lucide-react'
import { AUDIENCES, HAZARDS, SEVERITIES, type HazardId } from '../../data/content'
import { useStore } from '../../store/scenarioStore'
import { Segmented } from '../ui/Segmented'

const HAZARD_ICON: Record<HazardId, LucideIcon> = {
  cyclone: Tornado, flood: Droplets, landslide: Mountain, tsunami: Waves, heatwave: Sun, lightning: CloudLightning, dam: Factory, gas: Flame,
}

export function Section({ n, title, children, right }: { n: number; title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="border-b border-sky-400/10 px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full border border-cyan-400/40 font-mono text-[10px] text-cyan-300">{n}</span>
        <span className="label">{title}</span>
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </div>
  )
}

export function AlertConfig() {
  const hazard = useStore((s) => s.hazard)
  const severity = useStore((s) => s.severity)
  const audience = useStore((s) => s.audience)
  const timing = useStore((s) => s.timing)
  const staged = useStore((s) => s.staged)
  const set = useStore((s) => s.set)

  const toggleAudience = (a: string) => set({ audience: audience.includes(a) ? audience.filter((x) => x !== a) : [...audience, a] })

  return (
    <>
      <Section n={1} title="Hazard type">
        <div className="grid grid-cols-4 gap-1.5">
          {HAZARDS.map((h) => {
            const Icon = HAZARD_ICON[h.id]
            const on = hazard === h.id
            return (
              <button
                key={h.id}
                onClick={() => set({ hazard: h.id })}
                className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 cursor-pointer transition-all ${on ? 'border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.3)]' : 'border-sky-400/10 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-sky-400/30'}`}
              >
                <Icon size={18} className={on ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]' : ''} />
                <span className="font-hud text-[10.5px] font-semibold uppercase tracking-wider">{h.name}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section n={2} title="Severity">
        <Segmented size="lg" value={severity} onChange={(v) => set({ severity: v })} options={SEVERITIES.map((s) => ({ id: s.id, label: s.label, color: s.color }))} />
      </Section>

      <Section n={3} title="Audience" right={<span className="font-mono text-[10px] text-slate-500">{audience.length} selected</span>}>
        <div className="flex flex-wrap gap-1.5">
          {AUDIENCES.map((a) => {
            const on = audience.includes(a)
            return (
              <button
                key={a}
                onClick={() => toggleAudience(a)}
                className={`rounded-full border px-2.5 py-1 text-[11.5px] cursor-pointer transition-colors ${on ? 'border-amber-300/60 bg-amber-400/15 text-amber-100' : 'border-sky-400/15 text-slate-400 hover:text-slate-200'}`}
              >
                {on ? '✓ ' : ''}
                {a}
              </button>
            )
          })}
        </div>
      </Section>

      <Section n={4} title="Timing">
        <div className="flex items-center gap-3">
          <div className="w-44">
            <Segmented size="sm" value={timing} onChange={(v) => set({ timing: v })} options={[{ id: 'now', label: 'Send now' }, { id: 'schedule', label: 'Schedule' }]} />
          </div>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-sky-400/10 bg-slate-950/40 px-2 py-1.5">
            <span onClick={() => set({ staged: !staged })} className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${staged ? 'bg-cyan-500/70' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${staged ? 'left-3.5' : 'left-0.5'}`} />
            </span>
            <CalendarClock size={13} className="text-cyan-400" />
            <span className="text-[11px] text-slate-300">Staged: 72h heads-up → 24h warning → evacuation</span>
          </label>
        </div>
      </Section>
    </>
  )
}
