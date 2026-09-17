import { useEffect, useRef } from 'react'
import { useMapUi } from '../../lib/mapInstance'

/** Placeholder a screen renders where it wants the persistent map to appear. */
export function MapSlot({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    useMapUi.setState({ slot: el })
    return () => {
      if (useMapUi.getState().slot === el) useMapUi.setState({ slot: null })
    }
  }, [])
  return <div ref={ref} className={`pointer-events-none ${className}`} />
}
