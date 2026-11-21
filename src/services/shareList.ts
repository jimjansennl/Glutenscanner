import type { GlutenStatus } from '../types/product'

/**
 * "Mijn vaste producten" delen met opa en oma, school of de ouders van een vriendinnetje.
 * Alles zit in de link zelf (na het #-teken): er gaat niets naar een server en je hebt geen
 * account nodig. De ontvanger ziet een nette lijst op glutenscanner.nl/lijst.
 */

export interface SharedItem {
  name: string
  brand?: string
  status: GlutenStatus
  checked?: boolean
}

export interface SharedList {
  /** Voor wie de lijst is ("Isa"), mag leeg. */
  who?: string
  items: SharedItem[]
  /** Wanneer de lijst gemaakt is (ms). */
  at: number
}

const S: Record<GlutenStatus, string> = { safe: 's', warning: 'w', danger: 'd' }
const FROM_S: Record<string, GlutenStatus> = { s: 'safe', w: 'warning', d: 'danger' }

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function shareUrl(list: SharedList): string {
  const data = {
    w: list.who || undefined,
    t: Math.round(list.at / 1000),
    p: list.items.map((i) => [i.name, i.brand ?? '', S[i.status] + (i.checked ? 'c' : '')]),
  }
  return `${window.location.origin}/lijst#${toBase64Url(JSON.stringify(data))}`
}

/** Leest de lijst uit de link. Kapot of leeg: null. */
export function readSharedList(hash: string): SharedList | null {
  try {
    const raw = JSON.parse(fromBase64Url(hash.replace(/^#/, ''))) as { w?: string; t?: number; p?: [string, string, string][] }
    if (!Array.isArray(raw.p)) return null
    const items = raw.p
      .filter((p) => Array.isArray(p) && typeof p[0] === 'string' && FROM_S[p[2]?.[0]])
      .map(([name, brand, flags]) => ({ name: name.slice(0, 80), brand: brand?.slice(0, 40) || undefined, status: FROM_S[flags[0]], checked: flags.includes('c') }))
    return { who: typeof raw.w === 'string' ? raw.w.slice(0, 30) : undefined, items, at: (raw.t ?? 0) * 1000 }
  } catch {
    return null
  }
}
