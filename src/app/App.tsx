import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CommandCentre } from '../components/command/CommandCentre'
import { AlertComposer } from '../components/composer/AlertComposer'
import { EventFeed } from '../components/layout/EventFeed'
import { Sidebar } from '../components/layout/Sidebar'
import { Ticker } from '../components/layout/Ticker'
import { TopBar } from '../components/layout/TopBar'
import { MapHost } from '../components/map/MapHost'
import { MapTooltip, NodeDetailCard } from '../components/map/MapTooltip'
import { useMapPadding } from '../components/map/useMapPadding'
import { PhoneLayer } from '../components/phones/PhoneLayer'
import { PresenterPanel, usePresenterKeys } from '../components/presenter/PresenterPanel'
import { StartOverlay } from '../components/presenter/StartOverlay'
import { ReachScreen } from '../components/reach/ReachScreen'
import { RescueScreen } from '../components/rescue/RescueScreen'
import { RoutingScreen } from '../components/routing/RoutingScreen'
import { ComingSoon } from './ComingSoon'
import { Toasts } from '../components/ui/Toasts'
import { useStore, type Screen } from '../store/scenarioStore'

function ScreenView({ screen }: { screen: Screen }) {
  switch (screen) {
    case 'command':
      return <CommandCentre />
    case 'composer':
      return <AlertComposer />
    case 'routing':
      return <RoutingScreen />
    case 'reach':
      return <ReachScreen />
    case 'rescue':
      return <RescueScreen />
    default:
      return <ComingSoon screen={screen} />
  }
}

function BroadcastFlash() {
  const nonce = useStore((s) => s.flashNonce)
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (nonce) setKey(nonce)
  }, [nonce])
  return (
    <AnimatePresence>
      {key > 0 && (
        <motion.div
          key={key}
          initial={{ opacity: 0.95 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          onAnimationComplete={() => setKey(0)}
          className="pointer-events-none fixed inset-0 z-[190] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9),rgba(244,63,94,0.75)_35%,rgba(127,29,29,0.55)_75%)]"
        >
          <div className="grid h-full place-items-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.4 }}
              className="font-display text-7xl font-bold tracking-[0.3em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]"
            >
              BROADCAST
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function App() {
  const screen = useStore((s) => s.screen)
  usePresenterKeys()
  useMapPadding()

  return (
    <div className="scanlines vignette flex h-full w-full flex-col overflow-hidden">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="bg-grid relative min-w-0 flex-1 overflow-hidden">
          <MapHost>
            <MapTooltip />
            <NodeDetailCard />
          </MapHost>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0"
            >
              <ScreenView screen={screen} />
            </motion.div>
          </AnimatePresence>
        </main>
        <EventFeed />
      </div>
      <Ticker />
      <PhoneLayer />
      <Toasts />
      <BroadcastFlash />
      <PresenterPanel />
      <StartOverlay />
    </div>
  )
}
