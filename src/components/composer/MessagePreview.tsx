import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Building2, Droplet, FileText, Hand, House, Pill, Play, ShieldCheck, Square, Tornado } from 'lucide-react'
import { useEffect, useState } from 'react'
import { sound } from '../../audio/soundManager'
import { ALL_LANGUAGE_CHIPS, LANGUAGES, SEVERITIES, TEMPLATES } from '../../data/content'
import { useStore } from '../../store/scenarioStore'
import { Section } from './AlertConfig'

export function Waveform({ active, bars = 28, color = '#22D3EE' }: { active: boolean; bars?: number; color?: string }) {
  return (
    <div className="flex h-6 items-center gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            background: color,
            opacity: active ? 0.95 : 0.3,
            transformOrigin: 'center',
            animation: active ? `wave-bar ${0.5 + ((i * 13) % 7) / 10}s ease-in-out ${i * 0.03}s infinite` : 'none',
            transform: active ? undefined : 'scaleY(0.35)',
          }}
        />
      ))}
    </div>
  )
}

export function MessagePreview() {
  const templateId = useStore((s) => s.templateId)
  const lang = useStore((s) => s.lang)
  const severity = useStore((s) => s.severity)
  const set = useStore((s) => s.set)
  const [playing, setPlaying] = useState(false)
  const [lit, setLit] = useState(0)
  const tpl = TEMPLATES.find((t) => t.id === templateId)!
  const sev = SEVERITIES.find((s) => s.id === severity)!
  const L = LANGUAGES.find((l) => l.id === lang)!

  useEffect(() => {
    if (lit >= ALL_LANGUAGE_CHIPS.length) return
    const t = window.setTimeout(() => setLit((n) => n + 1), 220)
    return () => window.clearTimeout(t)
  }, [lit])

  useEffect(() => {
    setPlaying(false)
    sound.stopVoice()
  }, [lang, templateId])

  useEffect(() => () => sound.stopVoice(), [])

  const play = () => {
    if (playing) {
      sound.stopVoice()
      setPlaying(false)
      return
    }
    setPlaying(true)
    const stop = window.setTimeout(() => setPlaying(false), 14000)
    sound.speak(tpl.text[lang], L.voice, () => {
      window.clearTimeout(stop)
      setPlaying(false)
    }, lang === 'hi' || lang === 'en' ? undefined : { text: tpl.text.hi, lang: 'hi-IN' })
  }

  return (
    <>
      <Section n={5} title="Impact-based message">
        <select
          value={templateId}
          onChange={(e) => set({ templateId: e.target.value })}
          className="mb-2 w-full rounded-lg border border-sky-400/20 bg-slate-950/70 px-2.5 py-2 text-[12.5px] text-slate-100 outline-none focus:border-cyan-400/60"
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950/80 to-slate-900/60 p-3" style={{ borderColor: `${sev.color}66`, boxShadow: `0 0 24px ${sev.color}22, inset 0 0 30px ${sev.color}11` }}>
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: sev.color, boxShadow: `0 0 12px ${sev.color}` }} />
          <div className="flex items-center gap-2">
            <span className="rounded px-1.5 py-0.5 font-hud text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: `${sev.color}` }}>
              {sev.label}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-green-400/40 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-300">
              <BadgeCheck size={11} /> Verified sender · Govt. of Odisha SEOC
            </span>
            <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-cyan-300">
              <ShieldCheck size={12} /> Digitally signed
            </span>
          </div>

          <div className="mt-2.5 flex gap-1 overflow-x-auto thin-scroll pb-1">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => set({ lang: l.id })}
                className={`shrink-0 rounded-md border px-2 py-1 text-[11px] cursor-pointer transition-colors ${lang === l.id ? 'border-cyan-300/60 bg-cyan-400/15 text-cyan-50' : 'border-sky-400/10 text-slate-400 hover:text-slate-100'}`}
              >
                <span className="mr-1">{l.native}</span>
                {l.dialect && <span className="font-hud text-[9px] uppercase text-amber-300">dialect</span>}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={lang + templateId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-2 min-h-[84px] text-[14px] leading-relaxed text-slate-50"
            >
              {tpl.text[lang]}
            </motion.p>
          </AnimatePresence>

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={play}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-hud text-xs font-bold uppercase tracking-wider cursor-pointer ${playing ? 'border-cyan-300 bg-cyan-400/25 text-cyan-50' : 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20'}`}
            >
              {playing ? <Square size={12} /> : <Play size={12} />} {playing ? 'Stop' : 'Play voice'}
            </button>
            <Waveform active={playing} />
            <span className="ml-auto font-mono text-[10px] text-slate-500">{L.voice} · 0:{playing ? '18' : '00'}</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="rounded-md bg-gradient-to-r from-cyan-500/25 to-green-500/20 px-2 py-1 font-hud text-[11px] font-bold uppercase tracking-wider text-cyan-100">
            Available in 12 languages & dialects
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ALL_LANGUAGE_CHIPS.map((c, i) => (
            <span
              key={c}
              className={`rounded border px-1.5 py-0.5 text-[10.5px] transition-all duration-500 ${i < lit ? 'border-green-400/50 bg-green-500/10 text-green-200 shadow-[0_0_8px_rgba(74,222,128,0.25)]' : 'border-slate-700 text-slate-600'}`}
            >
              {i < lit ? '✓ ' : ''}
              {c}
            </span>
          ))}
        </div>
      </Section>

      <Section n={6} title="Accessibility previews">
        <div className="grid grid-cols-[1fr_128px] gap-2">
          <div className="rounded-xl border border-sky-400/10 bg-slate-950/50 p-2.5">
            <div className="mb-1.5 font-hud text-[10px] uppercase tracking-widest text-slate-500">Pictogram alert</div>
            <div className="flex items-center justify-between">
              {[
                { I: Tornado, c: 'text-rose-300 bg-rose-500/15 border-rose-400/40' },
                { I: House, c: 'text-amber-300 bg-amber-500/15 border-amber-400/40' },
                { I: ArrowRight, c: 'text-slate-300 border-transparent' },
                { I: Building2, c: 'text-green-300 bg-green-500/15 border-green-400/40' },
              ].map(({ I, c }, i) => (
                <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 * i, type: 'spring' }} className={`grid h-11 w-11 place-items-center rounded-lg border ${c}`}>
                  <I size={22} />
                </motion.span>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-slate-400">
              <Pill size={15} /> <Droplet size={15} /> <FileText size={15} />
              <span className="text-[10px]">take medicines · water · documents</span>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl border border-sky-400/10 bg-gradient-to-b from-indigo-950/60 to-slate-950/70 p-2">
            <div className="font-hud text-[10px] uppercase tracking-widest text-slate-500">Sign language</div>
            <svg viewBox="0 0 100 90" className="mx-auto mt-1 h-[74px]">
              <circle cx="50" cy="26" r="13" fill="#94A3B8" />
              <path d="M28 88 Q30 48 50 44 Q70 48 72 88 Z" fill="#475569" />
              <g style={{ transformOrigin: '34px 58px', animation: 'wave-bar 1.1s ease-in-out infinite' }}>
                <line x1="34" y1="58" x2="22" y2="36" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
              </g>
              <g style={{ transformOrigin: '66px 58px', animation: 'wave-bar 0.9s ease-in-out 0.3s infinite' }}>
                <line x1="66" y1="58" x2="80" y2="40" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
              </g>
            </svg>
            <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-300">
              <Hand size={11} /> ISL avatar
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
