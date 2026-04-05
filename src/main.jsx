import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { worker } from './mocks/browser.js'

// MSW runs in all environments — this app is a frontend-only demo with no real backend.
// The worker is fully started before render so the initial fetch isn't intercepted too late.
worker.start({ onUnhandledRequest: 'bypass' }).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
