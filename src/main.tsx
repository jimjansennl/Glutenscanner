import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ensureSecureContext } from './services/secureContext'

// Nieuwe versie live gezet? De offline-opslag laat dan eerst nog de oude zien. Neemt de
// nieuwe versie het over vlak na het openen, dan laden we één keer opnieuw.
// Later niet meer, zodat je nooit midden in het scannen een herstart krijgt.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  const opened = Date.now()
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (Date.now() - opened < 15000) window.location.reload()
  })
}

if (!ensureSecureContext()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
