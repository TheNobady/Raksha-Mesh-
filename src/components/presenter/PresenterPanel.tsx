import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, GripHorizontal, Pause, Play, RotateCcw, Smartphone, Volume2, VolumeX, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { currentStepIndex, jumpTo, next, prev, resetAll, setSpeed, skipToBroadcast, togglePlay } from '../../store/engine'
import { useStore } from '../../store/scenarioStore'
import { ORDERED_STEPS } from '../../store/timeline'

export function usePresenterKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return
      const s = useStore.getState()
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') || e.key === '`') {
        e.preventDefault()
        s.set({ presenterOpen: !s.presenterOpen })
        return
      }
      if (!s.started || e.ctrlKey || e.metaKey || e.altKey) return
      // keypad phone captures digits while hovered/focused
      if ((window as unknown as { __keypadActive?: boolean }).__keypadActive && /^[0-9*#]$|^Enter$|^Backspace$/.test(e.key)) return
      if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowRight') {
        next()
      } else if (e.key === 'ArrowLeft' && s.presenterOpen) {
        prev()
      } else if (e.key === 'r' || e.key === 'R') {
        resetAll()
      } else if (e.key === 'p' || e.key === 'P') {
        s.setPhonesVisible(!s.phonesVisible)
      } else if (e.key === 'b' || e.key === 'B') {
        skipToBroadcast()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export function PresenterPanel() {
  const open = useStore((s) => s.presenterOpen)
  const isPlaying = useStore((s) => s.isPlaying)
  const speed = useStore((s) => s.speed)
  const muted = useStore((s) => s.muted)
  const phones = useStore((s) => s.phonesVisible)
  const autoNav = useStore((s) => s.autoNavigate)
  const elapsed = useStore((s) => Math.floor(s.elapsed))
  const lastStep = useStore((s) => s.lastStepId)
  const broadcastAt = useStore((s) => s.broadcastAt)
  const set = useStore((s) => s.set)
  const [, force] = useState(0)

  useEffect(() => {
    if (!open) return
    const t = window.setInterval(() => force((x) => x + 1), 500)
    return () => window.clearInterval(t)
  }, [open])

  const idx = currentStepIndex()
  const step = idx >= 0 ? ORDERED_STEPS[idx] : null
  const waiting = step?.gate && broadcastAt === null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          className="fixed bottom-12 left-24 z-[150] w-[360px] rounded-xl border border-fuchsia-400/40 bg-[#0b0718]/92 p-3 shadow-[0_0_40px_rgba(217,70,239,0.25)] backdrop-blur-xl"
        >
          <div className="mb-2 flex cursor-grab items-center gap-2 active:cursor-grabbing">
            <GripHorizontal size={14} className="text-fuchsia-300/60" />
            <span className="font-hud text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-200">Presenter</span>
            <span className="font-mono text-[10px] text-slate-500">t={elapsed}s</span>
            <button onClick={() => set({ presenterOpen: false })} className="ml-auto text-slate-500 hover:text-white cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className={`mb-2 rounded-lg border px-3 py-2 ${waiting ? 'border-amber-400/50 bg-amber-500/10' : 'border-fuchsia-400/20 bg-fuchsia-500/5'}`}>
            <div className="font-mono text-[10px] text-slate-500">
              STEP {Math.max(0, idx) + 1}/{ORDERED_STEPS.length} {lastStep ? `· ${lastStep}` : ''}
            </div>
            <div className={`text-sm font-semibold ${waiting ? 'text-amber-200' : 'text-white'}`}>{step ? step.label : 'Not started'}</div>
          </div>

          <div className="mb-2 grid grid-cols-4 gap-1.5">
            <PBtn onClick={prev} title="Previous step">
              <ChevronLeft size={16} />
            </PBtn>
            <PBtn onClick={togglePlay} title="Play / pause (Space)" active={isPlaying}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </PBtn>
            <PBtn onClick={next} title="Next step (→)">
              <ChevronRight size={16} />
            </PBtn>
            <PBtn onClick={resetAll} title="Reset everything (R)">
              <RotateCcw size={15} />
            </PBtn>
          </div>

          <select
            value={idx}
            onChange={(e) => jumpTo(Number(e.target.value))}
            className="mb-2 w-full rounded-md border border-fuchsia-400/20 bg-slate-950 px-2 py-1.5 font-mono text-[11px] text-slate-200 outline-none"
          >
            <option value={-1} disabled>
              Jump to step…
            </option>
            {ORDERED_STEPS.map((s, i) => (
              <option key={s.id} value={i}>
                {String(i + 1).padStart(2, '0')} · {s.label}
              </option>
            ))}
          </select>

          <div className="mb-2 flex items-center gap-1.5">
            <span className="font-hud text-[10px] uppercase tracking-widest text-slate-500">Speed</span>
            {[0.5, 1, 2].map((v) => (
              <button
                key={v}
                onClick={() => setSpeed(v)}
                className={`rounded px-2 py-0.5 font-mono text-[11px] cursor-pointer ${speed === v ? 'bg-fuchsia-500/30 text-fuchsia-100' : 'text-slate-400 hover:text-white'}`}
              >
                {v}×
              </button>
            ))}
            <label className="ml-auto flex items-center gap-1 font-hud text-[10px] uppercase tracking-widest text-slate-400 cursor-pointer">
              <input type="checkbox" checked={autoNav} onChange={(e) => set({ autoNavigate: e.target.checked })} className="accent-fuchsia-400" />
              Auto-nav
            </label>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <PBtn onClick={skipToBroadcast} title="Skip to broadcast (B)" wide disabled={broadcastAt !== null}>
              <Zap size={13} /> Broadcast
            </PBtn>
            <PBtn onClick={() => useStore.getState().setPhonesVisible(!phones)} title="Show/hide phones (P)" wide active={phones}>
              <Smartphone size={13} /> Phones
            </PBtn>
            <PBtn onClick={() => useStore.getState().setMuted(!muted)} title="Mute" wide active={!muted}>
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />} Sound
            </PBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PBtn({ children, onClick, title, active, wide, disabled }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean; wide?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onPointerDown={(e) => e.stopPropagation()}
      className={`flex items-center justify-center gap-1.5 rounded-md border py-1.5 cursor-pointer transition-colors disabled:opacity-30 ${wide ? 'font-hud text-[11px] font-semibold uppercase tracking-wider' : ''} ${active ? 'border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-100' : 'border-fuchsia-400/15 text-slate-300 hover:bg-fuchsia-500/10 hover:text-white'}`}
    >
      {children}
    </button>
  )
}
