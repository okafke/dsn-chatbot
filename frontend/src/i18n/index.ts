import { computed } from 'vue'
import { useLanguageStore } from '../stores/language'
import en from './locales/en'
import de from './locales/de'

export type Locale = 'en' | 'de'

export interface LocaleDefinition {
    label: string
    flag: string
}

/** All supported locales with display metadata. */
export const SUPPORTED_LOCALES: Record<Locale, LocaleDefinition> = {
    en: { label: 'English', flag: '🇬🇧' },
    de: { label: 'Deutsch', flag: '🇩🇪' },
}

export const DEFAULT_LOCALE: Locale = 'de'

/** Recursive string-leaf message tree. */
type MessageTree = { [key: string]: string | MessageTree }

const messages: Record<Locale, MessageTree> = { en, de }

/**
 * Look up a nested translation key like "games.title" from the messages object.
 */
function resolve(obj: Record<string, any>, path: string): string {
    const keys = path.split('.')
    let current: any = obj
    for (const key of keys) {
        if (current == null || typeof current !== 'object') return path
        current = current[key]
    }
    return typeof current === 'string' ? current : path
}

/**
 * Composable that provides a reactive `t()` function.
 * Usage: `const { t } = useI18n()`
 */
export function useI18n() {
    const languageStore = useLanguageStore()

    const locale = computed(() => languageStore.locale)

    function t(key: string): string {
        return resolve(messages[locale.value], key)
    }

    return { t, locale }
}
