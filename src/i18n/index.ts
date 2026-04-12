import en from './en'
import ptBR from './pt-BR'
import type { Translations } from './en'

export type { Translations }
export type TranslationKey = keyof Translations

const LOCALES: Record<string, Translations> = {
  'en':    en,
  'pt-BR': ptBR,
}

let active: Translations = en

/**
 * Sets the active locale. Falls back silently to English for unknown codes.
 * Must be called before any `t()` usage — typically at app bootstrap.
 */
export function setLanguage(lang: string): void {
  active = LOCALES[lang] ?? en
}

/**
 * Returns the translation for `key` in the currently active locale.
 * TypeScript enforces that only valid keys are passed.
 */
export function t(key: TranslationKey): string {
  return active[key]
}
