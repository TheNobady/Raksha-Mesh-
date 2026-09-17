import { sound } from '../audio/soundManager'
import { AMBIENT_EVENTS } from '../data/content'
import { getState, setSilent, useStore, type Screen } from './scenarioStore'
import { absoluteAt, ORDERED_STEPS, type Step } from './timeline'

let running = false
let last = 0
let ambientAcc = 0
let ambientIdx = 0
let storeSync = 0

/**
 * The scenario clock lives outside React: map animations read it every frame,
 * while the store (and therefore every subscribed component) is updated ~5×/s.
 */
export const clock = { t: 0 }
export function setClock(t: number) {
  clock.t = t
  useStore.setState({ elapsed: t })
}

function fire(step: Step) {
  const s = getState()
  if (s.fired[step.id]) return
  step.run()
  useStore.setState((st) => ({ fired: { ...st.fired, [step.id]: true }, lastStepId: step.id }))
}

function tick(now: number) {
  const dt = Math.min(0.25, (now - last) / 1000)
  last = now
  const s = getState()

  if (s.started) {
    // ambient events keep the dashboard alive even when paused at the gate
    ambientAcc += dt
    if (ambientAcc > 3.4) {
      ambientAcc = 0
      const e = AMBIENT_EVENTS[ambientIdx++ % AMBIENT_EVENTS.length]
      s.pushFeed(e.sev, 'system', e.text)
    }
  }

  if (s.started && s.isPlaying) {
    let elapsed = clock.t + dt * s.speed
    const gate = ORDERED_STEPS.find((x) => x.gate)!
    if (s.broadcastAt === null && elapsed >= gate.at) {
      elapsed = gate.at
      if (s.lastStepId !== gate.id && ORDERED_STEPS.filter((x) => !x.afterBroadcast && !x.gate).every((x) => s.fired[x.id])) {
        useStore.setState({ lastStepId: gate.id })
      }
    }
    clock.t = elapsed
    if (now - storeSync > 200) {
      storeSync = now
      useStore.setState({ elapsed })
    }
    const st = getState()
    // an early broadcast (official acted before the script) silently catches up the pre-broadcast story
    const catchUp = st.broadcastAt !== null && ORDERED_STEPS.some((x) => !x.afterBroadcast && !x.gate && !st.fired[x.id])
    if (catchUp) {
      setSilent(true)
      ORDERED_STEPS.forEach((x) => !x.afterBroadcast && !x.gate && fire(x))
      setSilent(false)
    }
    for (const step of ORDERED_STEPS) {
      if (step.gate || getState().fired[step.id]) continue
      if (absoluteAt(step, getState().broadcastAt) <= elapsed) fire(step)
    }
  }

  // unit arrivals are driven by the scenario clock so they replay deterministically
  const st = getState()
  for (const u of st.units) {
    if (!u.arrived && clock.t >= u.startAt + u.duration) st.arriveUnit(u.id)
  }

  requestAnimationFrame(tick)
}

export function startEngine() {
  if (running) return
  running = true
  last = performance.now()
  requestAnimationFrame(tick)
}

// ------------------------------------------------------------------ controls

export function currentStepIndex() {
  const id = getState().lastStepId
  return id ? ORDERED_STEPS.findIndex((x) => x.id === id) : -1
}

export function stepLabel() {
  const s = getState()
  const idx = currentStepIndex()
  if (idx < 0) return s.started ? 'Starting…' : 'Not started'
  return ORDERED_STEPS[idx].label
}

export function play() {
  useStore.setState({ isPlaying: true })
}
export function pause() {
  useStore.setState({ isPlaying: false })
}
export function togglePlay() {
  useStore.setState((s) => ({ isPlaying: !s.isPlaying }))
}
export function setSpeed(speed: number) {
  useStore.setState({ speed })
}

export function next() {
  const s = getState()
  const step = ORDERED_STEPS.find((x) => !s.fired[x.id])
  if (!step) return
  if (step.gate) return skipToBroadcast()
  const at = absoluteAt(step, s.broadcastAt)
  // fire every earlier pending step too, in order
  setClock(Math.max(clock.t, at))
  for (const x of ORDERED_STEPS) {
    if (x === step) break
    if (!x.gate && !getState().fired[x.id]) fire(x)
  }
  fire(step)
  if (getState().autoNavigate && step.screen) getState().setScreen(step.screen)
}

export function prev() {
  const idx = currentStepIndex()
  jumpTo(Math.max(0, idx - 1))
}

export function skipToBroadcast() {
  const s = getState()
  if (s.broadcastAt !== null) return
  const gate = ORDERED_STEPS.find((x) => x.gate)!
  setSilent(true)
  for (const x of ORDERED_STEPS) {
    if (x.gate) break
    fire(x)
  }
  setSilent(false)
  setClock(gate.at)
  useStore.setState({ isPlaying: true })
  if (!getState().zone) getState().suggestZone()
  getState().broadcast()
}

/** Deterministic replay: reset, then silently apply every step up to `index`. */
export function jumpTo(index: number) {
  const playing = getState().isPlaying
  const speed = getState().speed
  sound.stopAll()
  const intro = getState().introNonce
  getState().reset()
  setClock(0)
  useStore.setState({ introNonce: intro, isPlaying: playing, speed })
  setSilent(true)
  let screen: Screen = 'command'
  for (let i = 0; i <= index && i < ORDERED_STEPS.length; i++) {
    const step = ORDERED_STEPS[i]
    if (step.screen) screen = step.screen
    if (step.gate) {
      setClock(step.at)
      getState().suggestZone()
      getState().broadcast()
      continue
    }
    setClock(absoluteAt(step, getState().broadcastAt))
    fire(step)
  }
  setSilent(false)
  useStore.setState({ screen })
}

export function resetAll() {
  sound.stopAll()
  getState().reset()
  setClock(0)
  useStore.setState({ isPlaying: true })
}
