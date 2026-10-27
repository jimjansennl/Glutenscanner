import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PhotoAnalysis } from './components/scanner/PhotoAnalysis'
import { ScannerView } from './components/scanner/ScannerView'
import type { DecodedCode } from './hooks/useBarcodeScanner'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { analyzeText } from './services/glutenParser'
import { analyzeBarcode, analyzeCode } from './services/scanService'
import type { ScanResult } from './types/product'

type View =
  | { name: 'home' }
  | { name: 'scanner' }
  | { name: 'photo'; image: Blob; imageUrl: string }
  | { name: 'loading'; label: string }
  | { name: 'result'; result: ScanResult }

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
        <HomePage
          onScan={() => go({ name: 'scanner' })}
          onPhoto={handlePhoto}
          onBarcode={(barcode) =>
            run('Product opzoeken…', async (signal) => ({ ...(await analyzeBarcode(barcode, signal)), source: 'manual' }))
          }
        />
      )
    case 'scanner':
      return <ScannerView onCode={handleCode} onPhoto={handlePhoto} onClose={() => go({ name: 'home' })} />
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
          onCancel={() => go({ name: 'scanner' })}
        />
      )
    case 'loading':
      return (
        <main className="flex h-full flex-col items-center justify-center gap-4 text-gray-600">
          <Loader2 size={40} className="animate-spin text-brand-600" />
          <p className="font-medium">{view.label}</p>
          <button onClick={() => go({ name: 'home' })} className="text-sm text-gray-400 underline">
            Annuleren
          </button>
        </main>
      )
    case 'result':
      return (
        <ResultPage result={view.result} onScanAgain={() => go({ name: 'scanner' })} onHome={() => go({ name: 'home' })} />
      )
  }
}

export default App
