import { ScanBarcode } from 'lucide-react'

function App() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="rounded-full bg-brand-100 p-6 text-brand-600">
        <ScanBarcode size={48} />
      </div>
      <h1 className="text-3xl font-bold">Glutenscanner</h1>
      <p className="max-w-xs text-gray-600">Scan de barcode van een product om te zien of het glutenvrij is.</p>
      <button className="w-full max-w-xs rounded-xl bg-brand-600 px-6 py-4 font-semibold text-white shadow-lg active:bg-brand-700">
        Start scannen
      </button>
    </main>
  )
}

export default App
