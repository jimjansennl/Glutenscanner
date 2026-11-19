// Zet de bestanden voor tekstherkenning in public/tesseract, zodat de app ze zelf levert
// (geen externe server nodig, en ze kunnen offline bewaard worden).
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const out = 'public/tesseract'
mkdirSync(join(out, 'lang'), { recursive: true })
const copies = [
  ['node_modules/tesseract.js/dist/worker.min.js', 'worker.min.js'],
  // Alleen de LSTM-varianten: die gebruikt de app (oem 1). Tesseract kiest zelf de snelste.
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['node_modules/tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['node_modules/@tesseract.js-data/nld/4.0.0_best_int/nld.traineddata.gz', 'lang/nld.traineddata.gz'],
  ['node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz'],
]
for (const [from, to] of copies) {
  if (!existsSync(from)) throw new Error(`Ontbreekt: ${from}`)
  copyFileSync(from, join(out, to))
}
console.log(`Tekstherkenning klaargezet in ${out}`)
