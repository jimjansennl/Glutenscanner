import type { AnalysisContext } from '../types/product'

const LABEL_HINTS =
  /ingredi|zutaten|ingr[eé]dients|ingredientes|ingrediënten|kan sporen|may contain|kann spuren|voedingswaarde|nutrition|n[aä]hrwert|houdbaar|ten minste/i
const MENU_HINTS = /menu|voorgerecht|hoofdgerecht|nagerecht|dessert|starter|bijgerecht|lunch|diner|dagschotel|\bkaart\b|vorspeise|hauptgericht|entr[ée]es?|plats?\b/i
const PRICE = /(€\s?\d|\d+[.,]\d{2}\b|\d+[.,]-)/g

/**
 * Raadt of de foto een etiket of een menukaart is, zodat niemand dat hoeft te kiezen.
 * Etiketwoorden winnen; prijzen of menuwoorden maken het een menukaart. Bij twijfel kijken
 * we naar de vorm: een etiket is een lange lijst met komma's, een menu heeft korte regels.
 */
export function guessContext(text: string): AnalysisContext {
  if (LABEL_HINTS.test(text)) return 'label'
  if ((text.match(PRICE)?.length ?? 0) >= 2 || MENU_HINTS.test(text)) return 'menu'
  const lines = text.split(/\n+/).filter((l) => l.trim()).length || 1
  const commas = text.split(',').length - 1
  return commas / lines >= 1.5 ? 'label' : 'menu'
}
