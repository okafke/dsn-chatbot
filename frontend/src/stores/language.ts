import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Locale } from '../i18n'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n'

const STORAGE_KEY = 'app_locale'

export const useLanguageStore = defineStore('language', () => {
    const locale = ref<Locale>(loadLocale())

    /** Read persisted locale from localStorage, falling back to the default. */
    function loadLocale(): Locale {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored && stored in SUPPORTED_LOCALES) {
            return stored as Locale
        }
        return DEFAULT_LOCALE
    }

    /** Change the active locale and persist the choice. */
    function setLocale(newLocale: Locale) {
        locale.value = newLocale
        localStorage.setItem(STORAGE_KEY, newLocale)
    }

    return { locale, setLocale }
})
