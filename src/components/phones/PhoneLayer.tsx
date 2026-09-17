import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Smartphone as PhoneIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useStore, type PhoneId } from '../../store/scenarioStore'
import { KeypadPhone } from './KeypadPhone'
import { Smartphone } from './Smartphone'
import { VolunteerPhone } from './VolunteerPhone'

const PHONES: { id: PhoneId; label: string; sub: string; el: () => ReactNode }[] = [
  { id: 'smart', label: 'Citizen · Smartphone', sub: 'App · no internet', el: () => <Smartphone /> },
  { id: 'keypad', label: 'Citizen · Keypad phone', sub: 'IVR voice call', el: () => <KeypadPhone /> },
  { id: 'volunteer', label: 'Volunteer · Aapda Mitra', sub: 'Field app', el: () => <VolunteerPhone /> },
]

export function PhoneLayer() {
  const visible = useStore((s) => s.phonesVisible)
  const min = useStore((s) => s.phoneMin)
  const toggleMin = useStore((s) => s.togglePhoneMin)
  const feedOpen = useStore((s) => s.feedOpen)
  const started = useStore((s) => s.started)

  const shown = PHONES.filter((p) => visible && !min[p.id])
  const right = feedOpen ? 'right-[284px] min-[1600px]:right-[334px]' : 'right-14'

  if (!started) return null

  return (
    <>
      <div className={`pointer-events-none fixed bottom-11 z-[90] flex items-end gap-4 ${right}`} style={{ perspective: 1400 }}>
        <AnimatePresence>
          {shown.map((p, i) => (
            <motion.div
              key={p.id}
              drag
              dragMomentum={false}
              initial={{ opacity: 0, x: 260, y: 160, rotateY: -35, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, y: 0, rotateY: -6 + i * 3, scale: 1 }}
              exit={{ opacity: 0, y: 200, scale: 0.7, transition: { duration: 0.3 } }}
              transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.12 * i }}
              whileHover={{ rotateY: 0, scale: 1.02 }}
              className="pointer-events-auto relative cursor-grab active:cursor-grabbing"
            >
              <div className="mb-1.5 flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-2 py-1 ring-1 ring-sky-400/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <div className="leading-tight">
                  <div className="font-hud text-[11px] font-bold uppercase tracking-wider text-slate-100">{p.label}</div>
                  <div className="font-mono text-[9px] text-slate-500">{p.sub}</div>
                </div>
                <button onPointerDown={(e) => e.stopPropagation()} onClick={() => toggleMin(p.id)} className="ml-auto text-slate-400 hover:text-white cursor-pointer" title="Minimise">
                  <Minus size={13} />
                </button>
              </div>
              <div className="phone-scale" onPointerDownCapture={(e) => (e.target as HTMLElement).closest('button') && e.stopPropagation()}>{p.el()}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </>
  )
}

/** Phone dock in the top bar: restore minimised phones or toggle all of them. */
export function PhoneDock() {
  const visible = useStore((s) => s.phonesVisible)
  const min = useStore((s) => s.phoneMin)
  const toggleMin = useStore((s) => s.togglePhoneMin)
  const setVisible = useStore((s) => s.setPhonesVisible)
  const alerts = useStore((s) => (s.smart.stage === 'alert' ? 1 : 0) + (s.keypad.stage === 'ringing' ? 1 : 0) + (s.volunteer.stage === 'task' ? 1 : 0))
  return (
    <div className="relative flex items-center gap-0.5 rounded-lg border border-sky-400/20 bg-slate-900/40 p-0.5">
      {PHONES.map((p) => {
        const on = visible && !min[p.id]
        return (
          <button
            key={p.id}
            onClick={() => {
              if (!visible) {
                setVisible(true)
                if (min[p.id]) toggleMin(p.id)
              } else toggleMin(p.id)
            }}
            title={p.label}
            className={`relative grid h-8 w-8 place-items-center rounded-md cursor-pointer transition-colors ${on ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <PhoneIcon size={15} />
            <span className="absolute bottom-0 font-mono text-[6.5px] leading-none">{p.id === 'smart' ? 'APP' : p.id === 'keypad' ? 'IVR' : 'VOL'}</span>
          </button>
        )
      })}
      {alerts > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white blink">{alerts}</span>}
    </div>
  )
}
