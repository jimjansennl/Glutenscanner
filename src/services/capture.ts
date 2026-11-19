/**
 * Maakt bij de sluiterknop een zo scherp mogelijke foto van alleen het kader.
 *
 * Het camerabeeld loopt normaal op Full HD (zuinig, snel genoeg voor barcodes). Voor een
 * foto van een etiket of menukaart zetten we de camera heel even op 4K, pakken één beeld
 * en zetten hem daarna terug. Kleine letters worden zo veel beter leesbaar.
 */

/** Deel van het camerabeeld (als fractie 0–1 van het zichtbare beeld). */
export interface Area {
  left: number
  top: number
  width: number
  height: number
}

const NORMAL = { width: { ideal: 1920 }, height: { ideal: 1080 } }
const SHARP = { width: { ideal: 3840 }, height: { ideal: 2160 } }
/** Langer wachten op het scherpere beeld heeft geen zin: dan maar de gewone resolutie. */
const SHARP_TIMEOUT_MS = 1500

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Wacht op een nieuw videobeeld (of kort, als de browser dat niet kan melden). */
function nextFrame(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(() => resolve())
    else setTimeout(resolve, 50)
  })
}

/** Probeert de camera op 4K te zetten. Geeft terug of dat gelukt is. */
async function boost(video: HTMLVideoElement, track: MediaStreamTrack): Promise<boolean> {
  const caps = track.getCapabilities?.()
  const maxSide = Math.max(caps?.width?.max ?? 0, caps?.height?.max ?? 0)
  const before = video.videoWidth * video.videoHeight
  if (maxSide < 2560) return false // toestel kan niet scherper
  try {
    await track.applyConstraints(SHARP)
  } catch {
    return false
  }
  const start = Date.now()
  while (video.videoWidth * video.videoHeight <= before) {
    if (Date.now() - start > SHARP_TIMEOUT_MS) return false
    await sleep(40)
  }
  // Een paar beelden laten lopen: scherpstelling en belichting moeten even bijkomen.
  for (let i = 0; i < 4; i++) await nextFrame(video)
  return true
}

/** Tekent het stuk van de video dat binnen `area` op het scherm staat (video staat op object-cover). */
function cropFrame(video: HTMLVideoElement, area: Area): HTMLCanvasElement {
  const vw = video.videoWidth
  const vh = video.videoHeight
  const ew = video.clientWidth || vw
  const eh = video.clientHeight || vh
  const scale = Math.max(ew / vw, eh / vh)
  const visW = ew / scale
  const visH = eh / scale
  const sx = (vw - visW) / 2 + area.left * visW
  const sy = (vh - visH) / 2 + area.top * visH
  const w = area.width * visW
  const h = area.height * visH
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w)
  canvas.height = Math.round(h)
  canvas.getContext('2d')!.drawImage(video, sx, sy, w, h, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Scherpe foto van het kader, als JPEG. */
export async function captureArea(video: HTMLVideoElement, area: Area): Promise<Blob> {
  const track = (video.srcObject as MediaStream | null)?.getVideoTracks()[0]
  const boosted = track ? await boost(video, track) : false
  const canvas = cropFrame(video, area)
  // Terug naar het gewone beeld; niet op wachten.
  if (boosted && track) track.applyConstraints(NORMAL).catch(() => {})
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Foto mislukt'))), 'image/jpeg', 0.95),
  )
}
