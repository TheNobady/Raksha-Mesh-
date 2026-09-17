import { animate } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { fmtCompact, fmtIN } from '../../lib/format'

type Format = 'in' | 'compact' | 'plain' | ((n: number) => string)

const apply = (n: number, f: Format) =>
  typeof f === 'function' ? f(n) : f === 'in' ? fmtIN(n) : f === 'compact' ? fmtCompact(n) : String(Math.round(n))

/** Animated number that writes straight to the DOM (no React re-render per frame). */
export function CountUp({ value, format = 'in', duration = 1.2, className = '' }: { value: number; format?: Format; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const current = useRef(0)
  const fmt = useRef(format)
  fmt.current = format

  useEffect(() => {
    const controls = animate(current.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        current.current = v
        if (ref.current) ref.current.textContent = apply(v, fmt.current)
      },
    })
    return () => controls.stop()
  }, [value, duration])

  return <span ref={ref} className={`num ${className}`}>{apply(current.current, format)}</span>
}
