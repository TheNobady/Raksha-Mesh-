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
import { easeOutExpo, screenIn } from '../lib/motion'
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

/** Full-screen flash used for both the incident trigger and the broadcast. */
function Flash({ nonce, label, tint, size = 'text-6xl' }: { nonce: number; label: string; tint: string; size?: string }) {
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
          className="pointer-events-none fixed inset-0 z-[190]"
          style={{ background: tint }}
        >
          <div className="grid h-full place-items-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 1, letterSpacing: '0.2em' }}
              animate={{ scale: 1.5, opacity: 0, letterSpacing: '0.42em' }}
              transition={{ duration: 1.4, ease: easeOutExpo }}
              className={`font-display ${size} px-8 text-center font-bold text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]`}
            >
              {label}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function App() {
  const screen = useStore((s) => s.screen)
  const flashNonce = useStore((s) => s.flashNonce)
  const eventNonce = useStore((s) => s.eventNonce)
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
              variants={screenIn}
              initial="hidden"
              animate="show"
              exit="exit"
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
      <Flash
        nonce={eventNonce}
        label="CYCLONE VAYU-26 · EVENT DETECTED"
        size="text-4xl"
        tint="radial-gradient(circle at center, rgba(255,237,213,0.9), rgba(245,158,11,0.7) 35%, rgba(120,53,15,0.55) 75%)"
      />
      <Flash
        nonce={flashNonce}
        label="BROADCAST"
        tint="radial-gradient(circle at center, rgba(255,255,255,0.9), rgba(244,63,94,0.75) 35%, rgba(127,29,29,0.55) 75%)"
      />
      <PresenterPanel />
      <StartOverlay />
    </div>
  )
}
