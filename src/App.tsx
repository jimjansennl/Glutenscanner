import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { LandingPage } from './components/landing/LandingPage'
import { PhotoAnalysis } from './components/scanner/PhotoAnalysis'
import { ScannerView, type ScanMode } from './components/scanner/ScannerView'
import { BottomNav, type NavTab } from './components/ui/BottomNav'
import { DisclaimerModal } from './components/ui/DisclaimerModal'
import type { DecodedCode } from './hooks/useBarcodeScanner'
import { GuidePage } from './pages/GuidePage'
import { HistoryPage } from './pages/HistoryPage'
import { ResultPage } from './pages/ResultPage'
import { SettingsPage } from './pages/SettingsPage'
import { TravelCardPage } from './pages/TravelCardPage'
import { analyzeText } from './services/glutenParser'
import { addToHistory, clearHistory, loadHistory, type HistoryItem } from './services/history'
import { applyProfile, loadProfile, saveProfile, type SafetyProfile } from './services/profile'
import { analyzeCode } from './services/scanService'
import type { GlutenStatus, ScanResult } from './types/product'

type Tab = Exclude<NavTab, 'scan'>

type View =
  | { name: 'scanner' }
  | { name: 'photo'; image: Blob; imageUrl: string }
  | { name: 'loading'; label: string }
  | { name: 'result'; result: ScanResult; back: 'scan' | 'history' }
  | { name: 'travel'; back: 'guide' | 'settings' }
  | { name: Tab }

/** Voelbare feedback: kort tikje = veilig, dubbel = twijfel, lang dubbel = gluten. */
const HAPTICS: Record<GlutenStatus, number[]> = {
  safe: [40],
  warning: [60, 80, 60],
  danger: [200, 100, 200],
}

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
  const [scanMode, setScanMode] = useState<ScanMode>('barcode')
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
      if (next.name !== 'result' && next.name !== 'photo' && next.name !== 'loading') releaseImage()
      setView(next)
    },
    [releaseImage],
  )

  useEffect(() => releaseImage, [releaseImage])

  /** Toont een vers resultaat: trillen, bewaren in de geschiedenis en tonen. */
  const showResult = useCallback(
    (result: ScanResult) => {
      navigator.vibrate?.(HAPTICS[profiled(result).status])
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

  const handleCode = useCallback(
    (code: DecodedCode) => run('Product opzoeken…', (signal) => analyzeCode(code, signal)),
    [run],
  )

  const handlePhoto = useCallback(
    (image: Blob) => {
      releaseImage()
      const imageUrl = URL.createObjectURL(image)
      imageUrlRef.current = imageUrl
      go({ name: 'photo', image, imageUrl })
    },
    [go, releaseImage],
  )

  switch (view.name) {
    case 'scanner':
      return (
        <ScannerView
          mode={scanMode}
          onModeChange={setScanMode}
          onNavigate={navigate}
          onCode={handleCode}
          onPhoto={handlePhoto}
        />
      )
    case 'history':
      return (
        <WithNav active="history" onNavigate={navigate}>
          <HistoryPage
            items={history}
            statusOf={(item) => profiled(item.result).status}
            onOpen={(item) => setView({ name: 'result', result: item.result, back: 'history' })}
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
            onTravelCard={() => go({ name: 'travel', back: 'settings' })}
          />
        </WithNav>
      )
    case 'photo':
      return (
        <PhotoAnalysis
          image={view.image}
          imageUrl={view.imageUrl}
          onCode={handleCode}
          onText={(text, context) =>
            showResult({
              source: 'photo',
              context,
              rawValue: text,
              imageUrl: view.imageUrl,
              analysis: analyzeText(text, context),
            })
          }
          onCancel={() => go({ name: 'scanner' })}
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
              setScanMode('photo')
              go({ name: 'scanner' })
            }}
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

/** Desktop met muis = informatiesite; telefoon/tablet = scanner. "#app" opent de scanner altijd. */
const DESKTOP_QUERY = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', onChange)
  window.addEventListener('hashchange', onChange)
  return () => {
    media.removeEventListener('change', onChange)
    window.removeEventListener('hashchange', onChange)
  }
}

function showLandingPage() {
  return window.matchMedia(DESKTOP_QUERY).matches && window.location.hash !== '#app'
}

function App() {
  const landing = useSyncExternalStore(subscribe, showLandingPage)
  if (landing) return <LandingPage />
  return (
    <>
      <ScannerApp />
      <DisclaimerModal />
    </>
  )
}

export default App
