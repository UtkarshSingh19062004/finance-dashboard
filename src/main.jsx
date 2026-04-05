import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

async function prepare() {
  // MSW only runs in dev — the worker file in /public is excluded from prod builds
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser.js')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
