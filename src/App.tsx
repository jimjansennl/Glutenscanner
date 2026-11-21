import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Loader2, UtensilsCrossed } from 'lucide-react'
import { InfoMenu, InfoPanel } from './components/landing/LandingPanels'
import { LandingPage } from './components/landing/LandingPage'
import type { PanelId } from './components/landing/panels'
import { PhotoAnalysis } from './components/scanner/PhotoAnalysis'
import { ScannerView } from './components/scanner/ScannerView'
import { BottomNav, type NavTab } from './components/ui/BottomNav'
import { DisclaimerModal } from './components/ui/DisclaimerModal'
import type { DecodedCode } from './hooks/useBarcodeScanner'
import { GuidePage } from './pages/GuidePage'
import { HistoryPage } from './pages/HistoryPage'
import { ResultPage } from './pages/ResultPage'
import { DishPage } from './pages/DishPage'
import { askDish, clearWaiting, loadWaiting, type DishAnswer } from './services/dish'
import { DESKTOP_QUERY, openWebsite, showWebsite } from './services/siteNav'
import { feel } from './lib/haptics'
import { rememberProduct, starredProducts } from './services/products'
import { SettingsPage } from './pages/SettingsPage'
import { TravelCardPage } from './pages/TravelCardPage'
import { analyzeText } from './services/glutenParser'
import { addToHistory, clearHistory, loadHistory, type HistoryItem } from './services/history'
import { applyProfile, loadProfile, saveProfile, type SafetyProfile } from './services/profile'
import { analyzeCode } from './services/scanService'
import { crossCheck, PENDING_MS } from './services/crossCheck'
import type { ScanResult } from './types/product'

type Tab = Exclude<NavTab, 'scan'>

type View =
  | { name: 'scanner' }
  | { name: 'photo'; image: Blob; imageUrl: string; textOnly: boolean; noDish?: boolean }
  | { name: 'dish'; image?: Blob; imageUrl: string; answer?: DishAnswer }
  | { name: 'loading'; label: string }
  | { name: 'result'; result: ScanResult; back: 'scan' | 'history' }
  | { name: 'travel'; back: 'guide' | 'settings' }
  | { name: Tab }


/** Schermen met de tabbalk onderin; het camerascherm tekent zijn eigen balk. */
function WithNav({
  children,
  active,
  onNavigate,
}: {
  children: ReactNode
  active: NavTab | null
  onNavigate: (tab: NavTab) => void
}) {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <BottomNav active={active} onSelect={onNavigate} />
    </div>
  )
}

/** De scanner-app zoals op de telefoon: opent direct op de camera. */
function ScannerApp() {
  const [view, setView] = useState<View>({ name: 'scanner' })
  /** Hamburgermenu met de onderdelen van de website: dicht, het menu, of één onderdeel. */
  const [info, setInfo] = useState<null | 'menu' | PanelId>(null)
  const abortRef = useRef<AbortController | null>(null)
  const imageUrlRef = useRef<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory)
  const [profile, setProfile] = useState<SafetyProfile>(loadProfile)
  /** Analyses worden profiel-neutraal bewaard; het profiel wordt pas bij tonen toegepast. */
  const profiled = useCallback((result: ScanResult) => applyProfile(result.analysis, profile), [profile])

  const releaseImage = useCallback(() => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current)
    imageUrlRef.current = null
  }, [])

  const go = useCallback(
    (next: View) => {
      abortRef.current?.abort()
      // Alleen resultaat- en fotoschermen gebruiken de vastgelegde foto nog.
      if (next.name !== 'result' && next.name !== 'photo' && next.name !== 'loading' && next.name !== 'dish') releaseImage()
      setView(next)
      // Elk nieuw scherm begint bovenaan, niet halverwege waar het vorige scherm was.
      window.scrollTo(0, 0)
    },
    [releaseImage],
  )

  useEffect(() => releaseImage, [releaseImage])

  const viewName = useRef(view.name)
  useEffect(() => {
    viewName.current = view.name
  }, [view.name])

  /** Bord eten dat zonder internet is gefotografeerd: bekijken zodra er weer internet is. */
  const [dishReady, setDishReady] = useState<{ answer: DishAnswer; imageUrl: string; at: number } | null>(null)
  useEffect(() => {
    const check = async () => {
      const waiting = loadWaiting()
      // Staat het bord nog open, dan bekijkt dat scherm de foto zelf.
      if (!waiting || !navigator.onLine || viewName.current === 'dish') return
      try {
        const answer = await askDish(waiting.image)
        clearWaiting()
        if (answer.food) setDishReady({ answer, imageUrl: `data:image/jpeg;base64,${waiting.image}`, at: waiting.at })
      } catch {
        // Lukt het niet, dan proberen we het de volgende keer weer.
      }
    }
    void check()
    window.addEventListener('online', check)
    return () => window.removeEventListener('online', check)
  }, [])

  /** Toont een vers resultaat: trillen, bewaren in de geschiedenis en tonen. */
  const showResult = useCallback(
    (scanned: ScanResult) => {
      const status = profiled(scanned).status
      // Zelfde barcode als eerder? Dan vergelijken we de ingrediënten met de vorige keer.
      const result: ScanResult = { ...scanned, recipeChange: rememberProduct(scanned, status) }
      feel(result.recipeChange ? 'danger' : status)
      setHistory(addToHistory(result))
      setView({ name: 'result', result, back: 'scan' })
    },
    [profiled],
  )

  const navigate = useCallback((tab: NavTab) => go(tab === 'scan' ? { name: 'scanner' } : { name: tab }), [go])

  const run = useCallback(
    async (label: string, task: (signal: AbortSignal) => Promise<ScanResult>) => {
      go({ name: 'loading', label })
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const result = await task(controller.signal)
        if (!controller.signal.aborted) showResult(result)
      } catch {
        // Afgebroken door navigatie: niets te doen.
      }
    },
    [go, showResult],
  )

  /** Barcode-uitslag waarvoor de gebruiker net het etiket gaat fotograferen (dubbele check). */
  const pendingRef = useRef<{ result: ScanResult; at: number } | null>(null)

  const handleCode = useCallback(
    (code: DecodedCode, labelText?: string, unsure?: string[]) => {
      pendingRef.current = null
      return run('Product opzoeken…', async (signal) => {
        const result = await analyzeCode(code, signal)
        return labelText ? crossCheck(result, labelText, unsure) : result
      })
    },
    [run],
  )

  const handlePhoto = useCallback(
    (image: Blob, textOnly: boolean) => {
      releaseImage()
      const imageUrl = URL.createObjectURL(image)
      imageUrlRef.current = imageUrl
      go({ name: 'photo', image, imageUrl, textOnly })
    },
    [go, releaseImage],
  )

  switch (view.name) {
    case 'scanner':
      return (
        <>
          <ScannerView
            onNavigate={navigate}
            onHome={() => openWebsite('/')}
            onMenu={() => setInfo('menu')}
            // Achter het menu draait de camera door; een barcode mag dan niets doen.
            onCode={info ? () => {} : handleCode}
            onPhoto={handlePhoto}
          />
          {dishReady && !info && (
            <button
              onClick={() => {
                setView({ name: 'dish', imageUrl: dishReady.imageUrl, answer: dishReady.answer })
                setDishReady(null)
              }}
              className="fixed inset-x-4 top-[max(4.5rem,calc(env(safe-area-inset-top)+3.5rem))] z-50 flex items-center gap-3 rounded-[20px] bg-white p-3.5 text-left text-black shadow-2xl"
            >
              <UtensilsCrossed size={22} className="shrink-0 text-accent" />
              <span className="text-[15px] font-semibold leading-snug">
                Je bord van {new Date(dishReady.at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} is bekeken. Tik om de tips te zien.
              </span>
            </button>
          )}
          {info === 'menu' && (
            <InfoMenu
              onSelect={(id) => {
                // De glutengids staat al in de app: open die direct, geen tweede versie.
                if (id === 'gids') {
                  setInfo(null)
                  navigate('guide')
                } else setInfo(id)
              }}
              onClose={() => setInfo(null)}
            />
          )}
          {info && info !== 'menu' && (
            <InfoPanel
              id={info}
              onBack={() => setInfo('menu')}
            />
          )}
        </>
      )
    case 'history':
      return (
        <WithNav active="history" onNavigate={navigate}>
          <HistoryPage
            items={history}
            statusOf={(item) => profiled(item.result).status}
            onOpen={(item) => setView({ name: 'result', result: item.result, back: 'history' })}
            starred={starredProducts().map((p) => {
              const checked = !!p.checked && p.checked.ingredients === p.ingredients
              const status = profiled(p.result).status
              return { ...p, checked, status: checked && status === 'warning' ? 'safe' : status }
            })}
            onOpenResult={(result) => setView({ name: 'result', result, back: 'history' })}
            onClear={() => {
              clearHistory()
              setHistory([])
            }}
          />
        </WithNav>
      )
    case 'guide':
      return (
        <WithNav active="guide" onNavigate={navigate}>
          <GuidePage onTravelCard={() => go({ name: 'travel', back: 'guide' })} />
        </WithNav>
      )
    case 'settings':
      return (
        <WithNav active="settings" onNavigate={navigate}>
          <SettingsPage
            profile={profile}
            onProfileChange={(next) => {
              saveProfile(next)
              setProfile(next)
            }}
          />
        </WithNav>
      )
    case 'photo':
      return (
        <PhotoAnalysis
          image={view.image}
          imageUrl={view.imageUrl}
          textOnly={view.textOnly}
          noDish={view.noDish}
          onDish={() => setView({ name: 'dish', image: view.image, imageUrl: view.imageUrl })}
          onCode={handleCode}
          onText={(text, context, unsure) => {
            // Komt de gebruiker van een barcode-uitslag ("Check ook het etiket")? Dan vergelijken.
            const pending = pendingRef.current
            pendingRef.current = null
            if (pending && context === 'label' && Date.now() - pending.at < PENDING_MS) {
              showResult({ ...crossCheck(pending.result, text, unsure), imageUrl: view.imageUrl })
              return
            }
            showResult({
              source: 'photo',
              context,
              rawValue: text,
              imageUrl: view.imageUrl,
              analysis: analyzeText(text, context, unsure),
            })
          }}
          onCancel={() => go({ name: 'scanner' })}
        />
      )
    case 'dish':
      return (
        <DishPage
          key={view.imageUrl}
          image={view.image}
          imageUrl={view.imageUrl}
          answer={view.answer}
          onClose={() => go({ name: 'scanner' })}
          onReadText={() =>
            view.image
              ? setView({ name: 'photo', image: view.image, imageUrl: view.imageUrl, textOnly: true, noDish: true })
              : go({ name: 'scanner' })
          }
          onTravelCard={() => go({ name: 'travel', back: 'guide' })}
        />
      )
    case 'loading':
      return (
        <WithNav active="scan" onNavigate={navigate}>
          <main className="flex flex-1 flex-col items-center justify-center gap-4 text-muted">
            <Loader2 size={40} className="animate-spin text-accent" />
            <p className="text-[17px]">{view.label}</p>
            <button onClick={() => go({ name: 'scanner' })} className="text-[15px] text-accent">
              Annuleren
            </button>
          </main>
        </WithNav>
      )
    case 'result':
      return (
        <WithNav active={view.back} onNavigate={navigate}>
          <ResultPage
            result={{ ...view.result, analysis: profiled(view.result) }}
            onHome={() => navigate(view.back)}
            onPhotoScan={() => {
              // Bij een product: de volgende foto van het etiket wordt een dubbele check.
              pendingRef.current = view.result.product ? { result: view.result, at: Date.now() } : null
              go({ name: 'scanner' })
            }}
            onOpenBarcode={(barcode) => handleCode({ text: barcode, format: 'barcode' })}
          />
        </WithNav>
      )
    case 'travel':
      return (
        <WithNav active={view.back} onNavigate={navigate}>
          <TravelCardPage onBack={() => go({ name: view.back })} />
        </WithNav>
      )
  }
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', onChange)
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}

function App() {
  const landing = useSyncExternalStore(subscribe, showWebsite)
  if (landing) return <LandingPage />
  return (
    <>
      <ScannerApp />
      <DisclaimerModal />
    </>
  )
}

export default App
