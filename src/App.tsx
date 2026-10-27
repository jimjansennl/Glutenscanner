import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { PhotoAnalysis } from './components/scanner/PhotoAnalysis'
import { ScannerView, type ScanMode } from './components/scanner/ScannerView'
import { BottomNav, type NavTab } from './components/ui/BottomNav'
import type { DecodedCode } from './hooks/useBarcodeScanner'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { analyzeText } from './services/glutenParser'
import { analyzeBarcode, analyzeCode } from './services/scanService'
import type { ScanResult } from './types/product'

type View =
  | { name: 'home' }
  | { name: 'scanner'; mode: ScanMode }
  | { name: 'photo'; image: Blob; imageUrl: string }
  | { name: 'loading'; label: string }
  | { name: 'result'; result: ScanResult }

/** Schermen met de tabbalk onderin; de camera-schermen tekenen hun eigen balk. */
function WithNav({ children, onNavigate }: { children: ReactNode; onNavigate: (tab: NavTab) => void }) {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <BottomNav active="home" onSelect={onNavigate} />
    </div>
  )
}

function App() {
  const [view, setView] = useState<View>({ name: 'home' })
  const abortRef = useRef<AbortController | null>(null)
  const imageUrlRef = useRef<string | null>(null)

  const releaseImage = useCallback(() => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current)
    imageUrlRef.current = null
  }, [])

  const go = useCallback(
    (next: View) => {
      abortRef.current?.abort()
      if (next.name === 'home' || next.name === 'scanner') releaseImage()
      setView(next)
    },
    [releaseImage],
  )

  useEffect(() => releaseImage, [releaseImage])

  const navigate = useCallback(
    (tab: NavTab) => go(tab === 'home' ? { name: 'home' } : { name: 'scanner', mode: tab }),
    [go],
  )

  const run = useCallback(
    async (label: string, task: (signal: AbortSignal) => Promise<ScanResult>) => {
      go({ name: 'loading', label })
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const result = await task(controller.signal)
        if (!controller.signal.aborted) setView({ name: 'result', result })
      } catch {
        // Afgebroken door navigatie: niets te doen.
      }
    },
    [go],
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
    case 'home':
      return (
        <WithNav onNavigate={navigate}>
          <HomePage
            onScan={(mode) => navigate(mode)}
            onBarcode={(barcode) =>
              run('Product opzoeken…', async (signal) => ({ ...(await analyzeBarcode(barcode, signal)), source: 'manual' }))
            }
          />
        </WithNav>
      )
    case 'scanner':
      return <ScannerView mode={view.mode} onNavigate={navigate} onCode={handleCode} onPhoto={handlePhoto} />
    case 'photo':
      return (
        <PhotoAnalysis
          image={view.image}
          imageUrl={view.imageUrl}
          onCode={handleCode}
          onText={(text) =>
            setView({
              name: 'result',
              result: { source: 'photo', rawValue: text, imageUrl: view.imageUrl, analysis: analyzeText(text) },
            })
          }
          onCancel={() => go({ name: 'scanner', mode: 'photo' })}
        />
      )
    case 'loading':
      return (
        <WithNav onNavigate={navigate}>
          <main className="flex flex-1 flex-col items-center justify-center gap-4 text-muted">
            <Loader2 size={40} className="animate-spin text-safe" />
            <p className="text-[17px]">{view.label}</p>
            <button onClick={() => go({ name: 'home' })} className="text-[15px] text-safe">
              Annuleren
            </button>
          </main>
        </WithNav>
      )
    case 'result':
      return (
        <WithNav onNavigate={navigate}>
          <ResultPage result={view.result} onHome={() => go({ name: 'home' })} />
        </WithNav>
      )
  }
}

export default App
