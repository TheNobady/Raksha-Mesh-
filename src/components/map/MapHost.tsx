import { useEffect, useRef, useState, type ReactNode } from 'react'
import { mapRefs, useMapUi } from '../../lib/mapInstance'
import { MapView } from './MapView'

/**
 * Hosts the single persistent map. It follows whichever <MapSlot/> is mounted,
 * animating its rect, and is hidden (but never unmounted) when no slot exists.
 */
export function MapHost({ children }: { children?: ReactNode }) {
  const slot = useMapUi((s) => s.slot)
  const hostRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  useEffect(() => {
    const parent = hostRef.current?.parentElement
    if (!slot || !parent) {
      setRect(null)
      return
    }
    const measure = () => {
      const a = slot.getBoundingClientRect()
      const b = parent.getBoundingClientRect()
      setRect({ left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(slot)
    ro.observe(parent)
    window.addEventListener('resize', measure)
    // slot may animate in with its screen transition
    const t1 = window.setTimeout(measure, 80)
    const t2 = window.setTimeout(measure, 420)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [slot])

  const visible = !!rect
  mapRefs.visible = visible

  // keep maplibre's canvas in sync while the container animates
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const ro = new ResizeObserver(() => mapRefs.map?.resize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={hostRef}
      className="absolute overflow-hidden rounded-xl transition-[left,top,width,height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        width: rect?.width ?? '100%',
        height: rect?.height ?? '100%',
        opacity: visible ? 1 : 0,
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
