import { readJson, writeJson } from '../lib/storage'
import type { GlutenAnalysis } from '../types/product'

/** strict: sporen = onveilig (rood). sensitive: sporen = twijfel (oranje). */
export type SafetyProfile = 'strict' | 'sensitive'

const KEY = 'glutenscanner.profile.v1'

export const PROFILES: Record<SafetyProfile, { title: string; description: string }> = {
  strict: {
    title: 'Strikte coeliakie',
    description: 'Sporen van gluten gelden als onveilig en worden rood gemeld.',
  },
  sensitive: {
    title: 'Glutenintolerant / gevoelig',
    description: 'Sporen van gluten worden oranje gemeld als twijfelgeval.',
  },
}

export function loadProfile(): SafetyProfile {
  const saved = readJson<string>(KEY, 'strict')
  return saved === 'sensitive' ? 'sensitive' : 'strict'
}

export function saveProfile(profile: SafetyProfile): void {
  writeJson(KEY, profile)
}

/**
 * Past het profiel toe op een analyse. De parser meldt sporen altijd als
 * waarschuwing; bij 'strict' worden ze een harde match. Dit gebeurt bij het
 * tonen, zodat eerdere scans meeveranderen als het profiel wijzigt.
 */
export function applyProfile(analysis: GlutenAnalysis, profile: SafetyProfile): GlutenAnalysis {
  if (profile === 'sensitive') return analysis

  const traces = analysis.warnings.filter((w) => w.source === 'traces')
  if (traces.length === 0) return analysis

  const reasons =
    analysis.status === 'danger'
      ? analysis.reasons
      : ['Kan sporen van gluten bevatten. In je profiel Strikte coeliakie geldt dit als onveilig.']

  return {
    ...analysis,
    status: 'danger',
    matches: [...analysis.matches, ...traces],
    warnings: analysis.warnings.filter((w) => w.source !== 'traces'),
    reasons,
  }
}
