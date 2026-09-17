import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useStore } from '../../store/scenarioStore'
import { MapControls } from '../map/MapControls'
import { MapSlot } from '../map/MapSlot'
import { ActionPanel } from './ActionPanel'
import { DistrictTable } from './DistrictTable'
import { HazardSummary } from './HazardSummary'
import { KpiStrip } from './KpiStrip'
import { NetworkHealth } from './NetworkHealth'
import { WeatherPanel } from './WeatherPanel'

export function CommandCentre() {
  const hidden = useStore((s) => s.panelsHidden)
  const set = useStore((s) => s.set)
  const col = 'w-[260px] min-[1600px]:w-[300px]'

  return (
    <div className="absolute inset-0">
      <MapSlot className="absolute inset-0" />
      <AnimatePresence>
        {!hidden && (
          <motion.div key="panels" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
            <div className="absolute left-3 right-3 top-3">
              <KpiStrip />
            </div>
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }} className={`thin-scroll pointer-events-auto absolute bottom-3 left-3 top-[108px] min-[1500px]:top-[92px] flex flex-col gap-2 overflow-y-auto ${col}`}>
              <WeatherPanel />
              <HazardSummary />
            </motion.div>
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`thin-scroll pointer-events-auto absolute bottom-3 right-3 top-[108px] min-[1500px]:top-[92px] flex flex-col gap-2 overflow-y-auto ${col}`}>
              <DistrictTable />
              <NetworkHealth />
            </motion.div>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="absolute bottom-3 left-[272px] right-[272px] min-[1600px]:left-[312px] min-[1600px]:right-[312px]">
              <ActionPanel />
            </motion.div>
            <div className="absolute right-[272px] top-[108px] min-[1500px]:top-[92px] min-[1600px]:right-[312px]">
              <MapControls />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => set({ panelsHidden: !hidden })}
        className={`glass pointer-events-auto absolute grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:text-cyan-200 cursor-pointer ${hidden ? 'right-3 top-3' : 'right-[272px] min-[1600px]:right-[312px] top-[300px] min-[1500px]:top-[284px]'}`}
        title={hidden ? 'Show panels' : 'Focus map'}
      >
        {hidden ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
      {hidden && (
        <div className="absolute right-3 top-14">
          <MapControls />
        </div>
      )}
    </div>
  )
}
