import '@fontsource/orbitron/500.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './styles/index.css'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import * as engine from './store/engine'
import { useStore } from './store/scenarioStore'

engine.startEngine()
if (import.meta.env.DEV) Object.assign(window, { __engine: engine, __store: useStore })
createRoot(document.getElementById('root')!).render(<App />)
