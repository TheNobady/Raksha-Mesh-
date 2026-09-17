import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock, MapPin, Navigation, ShieldCheck } from 'lucide-react'
import { KANTIAPADA_HOUSEHOLDS } from '../../data/villages'
import { useStore } from '../../store/scenarioStore'
import { SmartFrame } from './PhoneFrame'

function Confetti() {
  const colors = ['#F97316', '#22D3EE', '#4ADE80', '#FACC15', '#F472B6']
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => (
        <span
          key={i}
          className="absolute top-8 h-2 w-1.5 rounded-sm"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            ['--dx' as string]: `${((i * 53) % 80) - 40}px`,
            animation: `confetti-fall ${1.6 + (i % 5) * 0.25}s ease-in ${(i % 8) * 0.08}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function VolunteerPhone() {
  const v = useStore((s) => s.volunteer)
  const accept = useStore((s) => s.volunteerAccept)
  const tick = useStore((s) => s.volunteerTick)
  const complete = useStore((s) => s.volunteerComplete)
  const set = useStore((s) => s.set)
  const done = v.checked.filter(Boolean).length
  const total = v.checked.length

  return (
    <SmartFrame shake={v.stage === 'task'} accent="#1f1307">
      <div className="absolute inset-0 flex flex-col bg-[#0b1018] pt-8 text-white">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-hud text-[14px] font-bold tracking-wider text-orange-950">AAPDA MITRA</span>
            <span className="rounded bg-orange-950/80 px-1.5 py-0.5 text-[9px] font-bold text-orange-200">VOLUNTEER</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-orange-950 text-[11px] font-bold text-orange-200">SB</div>
            <div className="leading-tight text-orange-950">
              <div className="text-[11px] font-bold">Sunita Behera</div>
              <div className="text-[9px]">ID AM-OD-2231 · Kendrapara</div>
            </div>
            <button onClick={() => set({ volunteer: { ...v, onDuty: !v.onDuty } })} className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold cursor-pointer ${v.onDuty ? 'bg-green-700 text-green-100' : 'bg-slate-700 text-slate-300'}`}>
              {v.onDuty ? '● ON DUTY' : 'OFF DUTY'}
            </button>
          </div>
        </div>

        <div className="thin-scroll relative flex-1 overflow-y-auto px-2.5 py-2">
          <AnimatePresence mode="wait">
            {v.stage === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-widest text-cyan-300">Task inbox</div>
                {['Shelter headcount · Ersama MPCS', 'Distribute ORS · Tirtol', 'Siren test · Kujang'].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-lg bg-white/5 px-2 py-2 text-[11px] text-slate-400">
                    <CheckCircle2 size={13} className="text-green-500" /> {t}
                  </div>
                ))}
                <div className="pt-6 text-center text-[11px] text-slate-500">No urgent tasks · standing by</div>
              </motion.div>
            )}

            {v.stage === 'task' && (
              <motion.div key="task" initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="rounded-2xl border-2 border-red-500 bg-red-950/60 p-3 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <div className="flex items-center gap-1.5 text-red-300">
                  <AlertTriangle size={16} className="blink" />
                  <span className="font-hud text-[15px] font-bold tracking-wider">URGENT</span>
                  <span className="ml-auto text-[9px] text-slate-400">just now</span>
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-snug">Kantiapada has not responded.</p>
                <p className="mt-1 text-[12px] leading-snug text-slate-200">12 households. 2 elderly, 1 pregnant woman.</p>
                <div className="mt-2 flex gap-2 text-[10.5px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> 2.4 km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> ETA 14 min
                  </span>
                </div>
                <button onClick={accept} className="mt-3 w-full rounded-xl bg-orange-500 py-2.5 font-hud text-[15px] font-bold tracking-wider text-orange-950 shadow-[0_0_18px_rgba(249,115,22,0.6)] cursor-pointer">
                  ACCEPT TASK
                </button>
                <button className="mt-1.5 w-full py-1 text-[10px] text-slate-400">Can't go — reassign</button>
              </motion.div>
            )}

            {(v.stage === 'accepted' || v.stage === 'done') && (
              <motion.div key="accepted" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <svg viewBox="0 0 200 86" className="w-full rounded-xl bg-[#101a2b]">
                  <path d="M0 70 Q70 40 200 60" stroke="#1d3557" strokeWidth="10" fill="none" />
                  <path d="M20 66 C60 50 100 58 170 22" stroke="#F97316" strokeWidth="3" strokeDasharray="6 5" fill="none" className="dash-flow" />
                  <circle cx="20" cy="66" r="5" fill="#22D3EE" stroke="#fff" strokeWidth="1.5" />
                  <circle cx="170" cy="22" r={done === total ? 9 : 7} fill={done === total ? '#22C55E' : done ? '#F59E0B' : '#EF4444'} />
                  <text x="150" y="44" fill="#E2E8F0" fontSize="9">Kantiapada</text>
                </svg>
                <div className="flex items-center gap-2 text-[11px]">
                  <Navigation size={12} className="text-orange-300" />
                  <span className="text-slate-300">{v.stage === 'done' ? 'Task complete' : 'On site · door-to-door'}</span>
                  <span className="ml-auto font-mono text-orange-200">
                    {done}/{total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded bg-slate-800">
                  <motion.div animate={{ width: `${(done / total) * 100}%` }} className="h-full bg-gradient-to-r from-orange-500 to-green-400" />
                </div>
                <div className="space-y-1">
                  {KANTIAPADA_HOUSEHOLDS.map((h, i) => (
                    <button
                      key={h.id}
                      onClick={() => tick(i)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10.5px] transition-colors cursor-pointer ${v.checked[i] ? 'bg-green-500/15 text-green-200' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                    >
                      <span className={`grid h-4 w-4 place-items-center rounded border ${v.checked[i] ? 'border-green-400 bg-green-500 text-green-950' : 'border-slate-500'}`}>{v.checked[i] ? '✓' : ''}</span>
                      <span className="flex-1 truncate">{h.label}</span>
                      <span className={`text-[9px] ${v.checked[i] ? 'text-green-300' : h.note.includes('pregnant') || h.note.includes('elderly') ? 'text-rose-300' : 'text-slate-500'}`}>{v.checked[i] ? 'Warned ✓' : h.note}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {(v.stage === 'accepted' || v.stage === 'done') && (
          <div className="px-2.5 pb-4 pt-1">
            <button
              onClick={complete}
              disabled={v.stage === 'done' || done < total}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 font-hud text-[13px] font-bold tracking-wider cursor-pointer ${v.stage === 'done' ? 'bg-green-800 text-green-200' : done === total ? 'bg-green-500 text-green-950 shadow-[0_0_18px_rgba(34,197,94,0.6)]' : 'bg-slate-800 text-slate-500'}`}
            >
              <ShieldCheck size={15} /> {v.stage === 'done' ? 'COMPLETED · SAFE' : "TASK COMPLETE · I'M SAFE"}
            </button>
          </div>
        )}
        {v.stage === 'done' && <Confetti />}
      </div>
    </SmartFrame>
  )
}
