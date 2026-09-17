import { Howl, Howler } from 'howler'

export type SoundId = 'click' | 'confirm' | 'siren' | 'error' | 'chime' | 'ringtone' | 'vibrate' | 'alert' | 'sos' | 'success' | 'whoosh'

/**
 * Sound manager: tries /audio/<id>.mp3 via Howler, and if that file is missing
 * synthesises the sound with the Web Audio API so the demo never goes silent.
 */
class SoundManager {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private howls = new Map<SoundId, Howl | 'missing'>()
  private loops = new Map<string, () => void>()
  muted = false

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctx()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.55
      this.master.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    const ids: SoundId[] = ['siren', 'ringtone', 'error', 'chime', 'vibrate']
    ids.forEach((id) => this.preload(id))
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.master) this.master.gain.value = m ? 0 : 0.55
    Howler.mute(m)
    if (m) {
      window.speechSynthesis?.cancel()
    }
  }

  private preload(id: SoundId) {
    if (this.howls.has(id)) return
    const h = new Howl({
      src: [`/audio/${id}.mp3`],
      preload: true,
      volume: 0.8,
      onloaderror: () => this.howls.set(id, 'missing'),
    })
    this.howls.set(id, h)
  }

  play(id: SoundId) {
    if (this.muted || !this.ctx) return
    const h = this.howls.get(id)
    if (h && h !== 'missing' && h.state() === 'loaded') {
      h.play()
      return
    }
    this.synth(id)
  }

  /** Start a repeating sound; returns nothing, stop with stopLoop(key). */
  loop(key: string, id: SoundId, everyMs: number) {
    this.stopLoop(key)
    this.play(id)
    const t = window.setInterval(() => this.play(id), everyMs)
    this.loops.set(key, () => window.clearInterval(t))
  }

  stopLoop(key: string) {
    this.loops.get(key)?.()
    this.loops.delete(key)
  }

  stopAll() {
    this.loops.forEach((stop) => stop())
    this.loops.clear()
    window.speechSynthesis?.cancel()
  }

  // ------------------------------------------------------------------ synth

  private tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.3, endFreq?: number) {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + dur)
    g.gain.setValueAtTime(0.0001, ctx.currentTime + start)
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + start + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur)
    osc.connect(g).connect(this.master!)
    osc.start(ctx.currentTime + start)
    osc.stop(ctx.currentTime + start + dur + 0.05)
  }

  private synth(id: SoundId) {
    const ctx = this.ctx!
    switch (id) {
      case 'click':
        this.tone(1800, 0, 0.04, 'square', 0.05)
        break
      case 'confirm':
        this.tone(880, 0, 0.09, 'sine', 0.18)
        this.tone(1320, 0.08, 0.14, 'sine', 0.16)
        break
      case 'chime':
        this.tone(1046, 0, 0.35, 'sine', 0.14)
        this.tone(1568, 0.06, 0.4, 'sine', 0.1)
        break
      case 'success':
        ;[523, 659, 784, 1046].forEach((f, i) => this.tone(f, i * 0.08, 0.3, 'triangle', 0.16))
        break
      case 'error':
        this.tone(160, 0, 0.18, 'sawtooth', 0.22)
        this.tone(120, 0.2, 0.32, 'sawtooth', 0.22)
        break
      case 'alert':
        ;[0, 0.18, 0.36].forEach((s) => this.tone(1400, s, 0.12, 'square', 0.12))
        break
      case 'sos':
        this.tone(740, 0, 0.12, 'square', 0.12)
        this.tone(988, 0.14, 0.18, 'square', 0.12)
        break
      case 'whoosh': {
        const len = 0.5
        const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate)
        const data = buf.getChannelData(0)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
        const src = ctx.createBufferSource()
        src.buffer = buf
        const f = ctx.createBiquadFilter()
        f.type = 'bandpass'
        f.frequency.setValueAtTime(400, ctx.currentTime)
        f.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + len)
        const g = ctx.createGain()
        g.gain.value = 0.25
        src.connect(f).connect(g).connect(this.master!)
        src.start()
        break
      }
      case 'siren': {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'sawtooth'
        const t0 = ctx.currentTime
        for (let i = 0; i < 4; i++) {
          osc.frequency.setValueAtTime(520, t0 + i * 0.9)
          osc.frequency.linearRampToValueAtTime(1150, t0 + i * 0.9 + 0.45)
          osc.frequency.linearRampToValueAtTime(520, t0 + i * 0.9 + 0.9)
        }
        g.gain.setValueAtTime(0.0001, t0)
        g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.1)
        g.gain.setValueAtTime(0.12, t0 + 3.3)
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.6)
        const lp = ctx.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = 2400
        osc.connect(lp).connect(g).connect(this.master!)
        osc.start(t0)
        osc.stop(t0 + 3.7)
        break
      }
      case 'ringtone':
        // classic dual-tone ring: two short bursts
        ;[0, 0.45].forEach((s) => {
          for (let k = 0; k < 6; k++) {
            this.tone(k % 2 ? 1320 : 1760, s + k * 0.05, 0.05, 'square', 0.07)
          }
        })
        break
      case 'vibrate':
        ;[0, 0.28].forEach((s) => this.tone(70, s, 0.22, 'sawtooth', 0.28))
        break
    }
  }

  // ------------------------------------------------------------------ voice

  speak(text: string, lang: string, onEnd?: () => void, fallback?: { text: string; lang: string }) {
    if (this.muted) return
    // Prefer a recorded clip if present, e.g. /audio/alert-or-IN.mp3
    const clip = new Howl({
      src: [`/audio/alert-${lang}.mp3`],
      onend: () => onEnd?.(),
      onloaderror: () => this.tts(text, lang, onEnd, fallback),
    })
    clip.once('load', () => clip.play())
  }

  /**
   * Fallback: browser SpeechSynthesis. Odia (or-IN) voices are rarely installed,
   * so we fall back to Hindi, then Indian English, then whatever is available.
   */
  private tts(text: string, lang: string, onEnd?: () => void, fallback?: { text: string; lang: string }): void {
    const synth = window.speechSynthesis
    if (!synth) return
    synth.cancel()
    const voices = synth.getVoices()
    const exact = voices.find((v) => v.lang.replace('_', '-').startsWith(lang.slice(0, 2)))
    // No voice for this script (common for Odia) – speak the fallback text instead of garbling it
    if (!exact && fallback && fallback.lang !== lang) return this.tts(fallback.text, fallback.lang, onEnd)
    const pickVoice =
      voices.find((v) => v.lang === lang) ??
      voices.find((v) => v.lang.startsWith(lang.slice(0, 2))) ??
      voices.find((v) => v.lang === 'hi-IN') ??
      voices.find((v) => v.lang === 'en-IN') ??
      voices.find((v) => v.lang.startsWith('en'))
    const u = new SpeechSynthesisUtterance(text)
    if (pickVoice) {
      u.voice = pickVoice
      u.lang = pickVoice.lang
    }
    u.rate = 0.95
    u.onend = () => onEnd?.()
    synth.speak(u)
  }

  stopVoice() {
    window.speechSynthesis?.cancel()
  }
}

export const sound = new SoundManager()
