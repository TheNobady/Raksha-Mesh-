import { useEffect, useRef, useState, type ReactNode } from 'react'
import { mapRefs, useMapUi } from '../../lib/mapInstance'
import { MapView } from './MapView'

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

const same = (a: Rect | null, b: Rect | null) =>
  a === b ||
  (!!a && !!b && Math.abs(a.left - b.left) < 1 && Math.abs(a.top - b.top) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1)

/**
 * Hosts the single persistent map and moves it to whichever <MapSlot/> is mounted.
 *
 * The geometry is *snapped*, never tweened: animating width/height would resize
 * the WebGL canvas on every frame of the transition, which is the jankiest thing
 * this app can do. Instead the map cross-fades out, jumps to the new rect with a
 * single resize, and fades back in — which reads as deliberate rather than slow.
 */
export function MapHost({ children }: { children?: ReactNode }) {
  const slot = useMapUi((s) => s.slot)
  const hostRef = useRef<HTMLDivElement>(null)
  const [geom, setGeom] = useState<Rect | null>(null)
  const [swapping, setSwapping] = useState(false)
  const geomRef = useRef<Rect | null>(null)
  const swapTimer = useRef(0)

  useEffect(() => {
    const parent = hostRef.current?.parentElement
    if (!slot || !parent) {
      setGeom(null)
      geomRef.current = null
      return
    }
    const apply = (next: Rect) => {
      geomRef.current = next
      setGeom(next)
    }
    const measure = (immediate = false) => {
      const a = slot.getBoundingClientRect()
      const b = parent.getBoundingClientRect()
      const next: Rect = { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height }
      if (same(next, geomRef.current)) return
      if (immediate || !geomRef.current) {
        apply(next)
        return
      }
      // fade out → snap → fade back in
      setSwapping(true)
      window.clearTimeout(swapTimer.current)
      swapTimer.current = window.setTimeout(() => {
        apply(next)
        setSwapping(false)
      }, 130)
    }
    measure(true)
    const ro = new ResizeObserver(() => measure())
    ro.observe(slot)
    ro.observe(parent)
    const onResize = () => measure(true)
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(swapTimer.current)
    }
  }, [slot])

  const visible = !!geom
  mapRefs.visible = visible

  // exactly one canvas resize per geometry change, after the DOM has it
  useEffect(() => {
    if (!geom) return
    const id = requestAnimationFrame(() => mapRefs.map?.resize())
    return () => cancelAnimationFrame(id)
  }, [geom])

  return (
    <div
      ref={hostRef}
      className="absolute overflow-hidden rounded-xl"
      style={{
        left: geom?.left ?? 0,
        top: geom?.top ?? 0,
        width: geom?.width ?? '100%',
        height: geom?.height ?? '100%',
        opacity: visible && !swapping ? 1 : 0,
        transition: `opacity ${swapping ? 130 : 260}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        visibility: visible ? 'visible' : 'hidden',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <MapView />
      {/* subtle inner vignette + border to seat the map in the HUD */}
      <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_80px_rgba(3,7,18,0.85)] ring-1 ring-sky-400/15" />
      {visible && children}
    </div>
  )
}
