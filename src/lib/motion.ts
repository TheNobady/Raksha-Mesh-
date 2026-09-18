import type { Transition, Variants } from 'framer-motion'

/**
 * One motion language for the whole command centre.
 * Everything that moves should pull its easing/timing from here.
 */

/** expo-out: fast start, long settle — the house curve */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const
export const easeInOut = [0.65, 0, 0.35, 1] as const

export const springSoft: Transition = { type: 'spring', stiffness: 170, damping: 26, mass: 0.9 }
export const springSnap: Transition = { type: 'spring', stiffness: 420, damping: 34 }
export const springPop: Transition = { type: 'spring', stiffness: 520, damping: 22 }

export const dur = { fast: 0.18, base: 0.32, slow: 0.55, cinematic: 0.9 }

export const fade = (d = dur.base): Transition => ({ duration: d, ease: easeOutExpo })

/** Parent that cascades its children in, used for the event assembly. */
export const stagger = (each = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
})

/** Panels that fly in from an edge. Transform + opacity only (no layout work). */
export const slideIn = (from: 'left' | 'right' | 'top' | 'bottom', distance = 28): Variants => {
  const horizontal = from === 'left' || from === 'right'
  const sign = from === 'left' || from === 'top' ? -1 : 1
  const off = sign * distance
  return {
    hidden: { opacity: 0, x: horizontal ? off : 0, y: horizontal ? 0 : off },
    show: { opacity: 1, x: 0, y: 0, transition: springSoft },
    exit: {
      opacity: 0,
      x: horizontal ? off * 0.6 : 0,
      y: horizontal ? 0 : off * 0.6,
      transition: { duration: dur.fast, ease: easeInOut },
    },
  }
}

/** Cards/tiles that scale up as they appear. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: springSoft },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: { duration: dur.fast } },
}

/** Screen-to-screen cross-fade. */
export const screenIn: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.995 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.base, ease: easeOutExpo } },
  exit: { opacity: 0, y: -6, scale: 0.997, transition: { duration: dur.fast, ease: easeInOut } },
}
