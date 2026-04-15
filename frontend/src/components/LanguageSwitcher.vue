<script lang="ts" setup>
import { useLanguageStore } from '../stores/language'
import { SUPPORTED_LOCALES, type Locale } from '../i18n'

const languageStore = useLanguageStore()

const locales = Object.entries(SUPPORTED_LOCALES) as [Locale, typeof SUPPORTED_LOCALES[Locale]][]

function switchLocale(newLocale: Locale) {
    languageStore.setLocale(newLocale)
}
</script>

<template>
    <div class="flex items-center gap-1">
        <button
            v-for="[code, def] in locales"
            :key="code"
            :class="[
                'px-2 py-1 text-sm rounded transition-colors',
                languageStore.locale === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            ]"
            :title="def.label"
            @click="switchLocale(code)"
        >
            {{ def.flag }}
        </button>
    </div>
</template>
