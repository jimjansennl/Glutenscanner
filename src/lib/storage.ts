/**
 * localStorage kan ontbreken of gooien (privé-modus, geblokkeerde opslag).
 * Deze helpers falen stil, zodat de app altijd blijft werken.
 */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Opslag niet beschikbaar: niets aan te doen.
  }
}
