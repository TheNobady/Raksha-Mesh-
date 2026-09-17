import { motion } from 'framer-motion'
import { Phone, PhoneOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sound } from '../../audio/soundManager'
import { IVR_TRANSCRIPT, TEMPLATES } from '../../data/content'
import { useStore } from '../../store/scenarioStore'
import { useClock } from './PhoneFrame'

function mmss(ms: number) {
  const s = Math.floor(ms / 1000)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

export function KeypadPhone() {
  const keypad = useStore((s) => s.keypad)
  const press = useStore((s) => s.keypadKey)
  const time = useClock()
  const [now, setNow] = useState(performance.now())
  const [lines, setLines] = useState(0)
  const hover = useRef(false)

  // call timer + transcript
  useEffect(() => {
    if (keypad.stage === 'idle' || keypad.stage === 'ringing' || keypad.stage === 'ended') return
    const t = window.setInterval(() => setNow(performance.now()), 500)
    return () => window.clearInterval(t)
  }, [keypad.stage])

  useEffect(() => {
    if (keypad.stage !== 'call') return
    setLines(1)
    const t = window.setInterval(() => setLines((l) => Math.min(IVR_TRANSCRIPT.length, l + 1)), 1800)
    const tpl = TEMPLATES[0]
    sound.speak(tpl.text.or, 'or-IN', undefined, { text: tpl.text.hi, lang: 'hi-IN' })
    return () => window.clearInterval(t)
  }, [keypad.stage])

  // physical keyboard while the pointer is over the phone
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!hover.current) return
      const map: Record<string, string> = { Enter: 'call', Backspace: 'end', Escape: 'end' }
      const k = map[e.key] ?? (/^[0-9*#]$/.test(e.key) ? e.key : null)
      if (!k) return
      e.preventDefault()
      press(k)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const setActive = (v: boolean) => {
    hover.current = v
    ;(window as unknown as { __keypadActive?: boolean }).__keypadActive = v
  }

  const ringing = keypad.stage === 'ringing'
  const inCall = keypad.stage === 'call' || keypad.stage === 'confirmed' || keypad.stage === 'shelter' || keypad.stage === 'help'
  const dur = keypad.callStartedAt ? mmss(now - keypad.callStartedAt) : '00:00'

  const Key = ({ k, label, sub, className = '' }: { k: string; label: React.ReactNode; sub?: string; className?: string }) => (
    <button
      onClick={() => press(k)}
      className={`flex h-[30px] flex-col items-center justify-center rounded-[10px] bg-gradient-to-b from-[#3a3f4a] to-[#23272f] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_0_#0b0d11] active:translate-y-[1px] active:shadow-none cursor-pointer ${className}`}
    >
      <span className="text-[13px] font-semibold leading-none">{label}</span>
      {sub && <span className="text-[6.5px] leading-none tracking-wider text-slate-400">{sub}</span>}
    </button>
  )

  return (
    <motion.div
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`relative flex h-[440px] w-[196px] flex-col rounded-[30px] bg-gradient-to-b from-[#2b3038] via-[#1b1f26] to-[#101318] p-3 shadow-[0_30px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(148,163,184,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] ${ringing ? 'buzz' : ''}`}
    >
      <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-black/70 shadow-[inset_0_1px_1px_rgba(0,0,0,0.9)]" />
      {/* LCD */}
      <div className="lcd relative h-[150px] overflow-hidden rounded-md border-4 border-[#0d0f12] bg-[#a9c49a] px-2 py-1 text-[#1c2a17] shadow-[inset_0_0_14px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between text-[9px] font-bold">
          <span className="flex items-end gap-[1px]">
            <span className="h-[4px] w-[2px] bg-[#1c2a17]" />
            <span className="h-[6px] w-[2px] bg-[#1c2a17]/25" />
            <span className="h-[8px] w-[2px] bg-[#1c2a17]/25" />
            <span className="ml-1">No data</span>
          </span>
          <span>{time}</span>
        </div>
        <div className="mt-1 h-px bg-[#1c2a17]/40" />
        {keypad.stage === 'idle' && (
          <div className="mt-6 text-center">
            <div className="text-[26px] font-bold leading-none">{time}</div>
            <div className="mt-2 text-[10px]">NET: IN-OD</div>
            <div className="mt-3 text-[9px]">Menu&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Contacts</div>
          </div>
        )}
        {ringing && (
          <div className="mt-3 text-center">
            <div className="blink text-[11px] font-bold">INCOMING CALL</div>
            <div className="mt-2 text-[15px] font-bold leading-tight">RAKSHA ALERT</div>
            <div className="text-[10px]">+91 1078 (Govt)</div>
            <div className="mt-3 text-[9px]">Answer&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Reject</div>
          </div>
        )}
        {inCall && (
          <div className="mt-1 text-[9.5px] leading-[12px]">
            <div className="flex justify-between font-bold">
              <span>RAKSHA ALERT</span>
              <span>{dur}</span>
            </div>
            {keypad.stage === 'call' && (
              <div className="mt-1 space-y-[2px]">
                {IVR_TRANSCRIPT.slice(Math.max(0, lines - 5), lines).map((l, i) => (
                  <motion.div key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={i === Math.min(lines, 5) - 1 ? 'font-bold' : 'opacity-70'}>
                    {l}
                  </motion.div>
                ))}
                {lines >= IVR_TRANSCRIPT.length - 1 && <div className="blink font-bold">1 Confirm 2 Shelter 3 Help</div>}
              </div>
            )}
            {keypad.stage === 'confirmed' && (
              <div className="mt-3 text-center">
                <div className="text-[18px] font-bold">✓</div>
                <div className="font-bold">Thank you.</div>
                <div>Go to School Shelter.</div>
                <div className="mt-1 text-[8.5px]">Your family is marked as informed.</div>
              </div>
            )}
            {keypad.stage === 'shelter' && (
              <div className="mt-2">
                <div className="font-bold">Govt High School</div>
                <div>1.2 km · north of Jagannath temple</div>
                <div className="mt-1">180 places free</div>
                <div className="mt-2 font-bold">Press 1 to confirm</div>
              </div>
            )}
            {keypad.stage === 'help' && (
              <div className="mt-2 text-center">
                <div className="font-bold">HELP REQUESTED</div>
                <div>Rescue team notified.</div>
                <div>Stay on high ground.</div>
              </div>
            )}
          </div>
        )}
        {keypad.stage === 'ended' && (
          <div className="mt-8 text-center">
            <div className="text-[12px] font-bold">Call ended</div>
            <div className="text-[10px]">{dur}</div>
          </div>
        )}
      </div>
      <div className="mt-1 text-center font-hud text-[8px] tracking-[0.35em] text-slate-500">RAKSHA · BASIC</div>

      {/* nav cluster */}
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button
          onClick={() => press('call')}
          className={`grid h-7 place-items-center rounded-full bg-gradient-to-b from-green-600 to-green-800 text-white shadow-[0_2px_0_#052e16] cursor-pointer ${ringing ? 'blink shadow-[0_0_16px_rgba(34,197,94,0.9)]' : ''}`}
        >
          <Phone size={13} />
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-[#3a3f4a] to-[#1d2027] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="h-5 w-5 rounded-full bg-[#2b2f37] ring-1 ring-black/60" />
        </div>
        <button onClick={() => press('end')} className="grid h-7 place-items-center rounded-full bg-gradient-to-b from-red-600 to-red-800 text-white shadow-[0_2px_0_#450a0a] cursor-pointer">
          <PhoneOff size={13} />
        </button>
      </div>

      {/* keypad */}
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[
          ['1', '.,?'], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', '+'], ['0', '␣'], ['#', '⇧'],
        ].map(([k, sub]) => (
          <Key key={k} k={k} label={k} sub={sub} className={inCall && (k === '1' || k === '2' || k === '3') ? 'ring-1 ring-amber-300/60' : ''} />
        ))}
      </div>
    </motion.div>
  )
}
