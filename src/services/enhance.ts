/**
 * Maakt een foto klaar voor tekstherkenning, zoals een documentscanner dat doet:
 * - formaat zo kiezen dat kleine letters groot genoeg zijn (en niet onnodig groot);
 * - grijs maken en lichte tekst op een donkere kaart omdraaien;
 * - schaduw en glans wegwerken (ongelijk licht gelijk trekken);
 * - contrast oprekken en de letters iets scherper maken.
 *
 * Alles gebeurt met eigen pixelbewerkingen, zodat het in elke browser hetzelfde werkt
 * (Safari kent niet overal `ctx.filter`).
 */

/** Langste zijde van het resultaat: groot genoeg voor kleine letters, klein genoeg voor snelheid. */
const MAX_SIDE = 2600
/** Kleinere foto's worden opgeschaald tot minstens deze langste zijde. */
const MIN_SIDE = 1800
/** Blokgrootte (px) voor het schatten van de achtergrond. */
const BLOCK = 24

type Source = ImageBitmap | HTMLCanvasElement | HTMLImageElement

function sizeOf(src: Source) {
  return 'naturalWidth' in src ? { w: src.naturalWidth, h: src.naturalHeight } : { w: src.width, h: src.height }
}

/** Gemiddelde van een vierkant rond elk punt (snel, twee keer een lopende som). */
function boxBlur(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h)
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const row = y * w
    let sum = 0
    for (let x = -r; x <= r; x++) sum += src[row + Math.min(w - 1, Math.max(0, x))]
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / (2 * r + 1)
      sum += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0
    for (let y = -r; y <= r; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / (2 * r + 1)
      sum += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
    }
  }
  return out
}

/** Waarde bij een bepaald percentiel (0–1) van een reeks 0–255. */
function percentile(values: Float32Array, p: number): number {
  const hist = new Uint32Array(256)
  for (let i = 0; i < values.length; i++) hist[Math.max(0, Math.min(255, values[i] | 0))]++
  const target = values.length * p
  let acc = 0
  for (let v = 0; v < 256; v++) {
    acc += hist[v]
    if (acc >= target) return v
  }
  return 255
}

/**
 * Schat per blok de achtergrondhelderheid (het papier) en deelt elk punt daardoor.
 * Schaduw en glans verdwijnen zo grotendeels; de letters blijven donker.
 */
function flattenLight(gray: Float32Array, w: number, h: number): Float32Array {
  const bw = Math.ceil(w / BLOCK)
  const bh = Math.ceil(h / BLOCK)
  const bg = new Float32Array(bw * bh)
  const block = new Float32Array(BLOCK * BLOCK)
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      let n = 0
      for (let y = by * BLOCK; y < Math.min(h, (by + 1) * BLOCK); y++)
        for (let x = bx * BLOCK; x < Math.min(w, (bx + 1) * BLOCK); x++) block[n++] = gray[y * w + x]
      // Het lichtste deel van het blok is het papier; 90e percentiel negeert ruis en spiegelingen.
      bg[by * bw + bx] = percentile(block.subarray(0, n), 0.9)
    }
  }
  // Grootste waarde in de buurt: een blok vol tekst krijgt zo het papier van zijn buren.
  const spread = new Float32Array(bw * bh)
  for (let by = 0; by < bh; by++)
    for (let bx = 0; bx < bw; bx++) {
      let m = 0
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = by + dy
          const xx = bx + dx
          if (yy >= 0 && yy < bh && xx >= 0 && xx < bw) m = Math.max(m, bg[yy * bw + xx])
        }
      spread[by * bw + bx] = m
    }
  const smooth = boxBlur(spread, bw, bh, 1)

  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    const fy = Math.min(bh - 1, Math.max(0, y / BLOCK - 0.5))
    const y0 = Math.floor(fy)
    const y1 = Math.min(bh - 1, y0 + 1)
    const ty = fy - y0
    for (let x = 0; x < w; x++) {
      const fx = Math.min(bw - 1, Math.max(0, x / BLOCK - 0.5))
      const x0 = Math.floor(fx)
      const x1 = Math.min(bw - 1, x0 + 1)
      const tx = fx - x0
      const b =
        (smooth[y0 * bw + x0] * (1 - tx) + smooth[y0 * bw + x1] * tx) * (1 - ty) +
        (smooth[y1 * bw + x0] * (1 - tx) + smooth[y1 * bw + x1] * tx) * ty
      out[y * w + x] = Math.min(255, (gray[y * w + x] * 255) / Math.max(b, 24))
    }
  }
  return out
}

/** Zet een foto om naar een schoon, scherp zwart-op-wit beeld voor tekstherkenning. */
export function enhanceForOcr(src: Source): HTMLCanvasElement {
  const { w: sw, h: sh } = sizeOf(src)
  const long = Math.max(sw, sh)
  const scale = long > MAX_SIDE ? MAX_SIDE / long : long < MIN_SIDE ? Math.min(2, MIN_SIDE / long) : 1
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h)
  const px = img.data

  // 1. Grijs (helderheid zoals het oog die ziet)
  let gray: Float32Array = new Float32Array(w * h)
  for (let i = 0, j = 0; j < gray.length; i += 4, j++) gray[j] = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114

  // 2. Lichte letters op een donkere kaart (veel menukaarten): omdraaien naar donker op licht.
  //    Kijk alleen naar het midden, daar staat de tekst.
  const mid = new Float32Array(Math.floor(w / 2) * Math.floor(h / 2))
  let k = 0
  for (let y = Math.floor(h / 4); y < Math.floor(h / 4) + Math.floor(h / 2); y++)
    for (let x = Math.floor(w / 4); x < Math.floor(w / 4) + Math.floor(w / 2); x++) mid[k++] = gray[y * w + x]
  if (percentile(mid, 0.5) < 100) for (let j = 0; j < gray.length; j++) gray[j] = 255 - gray[j]

  // 3. Schaduw en glans wegwerken
  gray = flattenLight(gray, w, h)

  // 4. Contrast oprekken: donkerste 1% wordt zwart, en bijna-wit (papier met wat korrel) wordt wit
  const lo = percentile(gray, 0.01)
  const paper = Math.max(lo + 40, percentile(gray, 0.97))
  const span = 255 / (lo + (paper - lo) * 0.85 - lo)

  // 5. Iets scherper maken (unsharp mask)
  const blur = boxBlur(gray, w, h, 1)
  for (let i = 0, j = 0; j < gray.length; i += 4, j++) {
    const sharp = gray[j] + 0.8 * (gray[j] - blur[j])
    const v = Math.max(0, Math.min(255, (sharp - lo) * span))
    px[i] = px[i + 1] = px[i + 2] = v
    px[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return canvas
}
