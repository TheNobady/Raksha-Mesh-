import { useEffect } from 'react'
import { useMapUi } from '../../lib/mapInstance'
import { setPadding } from './camera'
import { useStore } from '../../store/scenarioStore'

/** Keeps the camera centred in the visible area between floating panels. */
export function useMapPadding() {
  const screen = useStore((s) => s.screen)
  const hidden = useStore((s) => s.panelsHidden)
  const ready = useMapUi((s) => s.ready)
  useEffect(() => {
    if (!ready) return
    const wide = window.innerWidth >= 1600
    const side = wide ? 310 : 270
    const padding = screen === 'command' && !hidden ? { left: side, right: side, top: 90, bottom: 110 } : { left: 0, right: 0, top: 0, bottom: 0 }
    setPadding(padding)
  }, [screen, hidden, ready])
}
