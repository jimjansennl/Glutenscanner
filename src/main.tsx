import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { DishTestPage } from './pages/DishTestPage'
import { ensureSecureContext } from './services/secureContext'
import { prefetchOfflineProducts } from './services/offlineProducts'
import { isDesktop } from './services/siteNav'

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
      {/* Testpagina voor de herkenning van gerechten (staat in geen enkel menu). */}
      {window.location.pathname === '/test-gerecht' ? <DishTestPage /> : <App />}
    </StrictMode>,
  )
  // Op de telefoon: alvast de populaire producten bewaren voor scannen zonder internet.
  if (!isDesktop()) prefetchOfflineProducts()
}
