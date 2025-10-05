<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <h2 class="card-title text-xl">
            <span class="text-2xl text-primary">🗄️</span>
            {{ t('storeDemo.title') }}
          </h2>
          <div class="badge badge-warning">{{ t('storeDemo.mockData') }}</div>
        </div>

        <div class="space-y-6">
          <!-- Locale Management -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h3 class="card-title text-lg">
                <span class="text-xl">🌐</span>
                {{ t('storeDemo.localeManagement') }}
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🌐</span>
                    <div>
                      <div class="font-medium">{{ t('storeDemo.currentLocale') }}</div>
                      <div class="text-sm text-base-content/70">
                        {{ localeInfo.nativeName }} ({{ currentLocale }})
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🏳️</span>
                    <div>
                      <div class="font-medium">{{ t('storeDemo.localeFlag') }}</div>
                      <div class="text-sm text-base-content/70">{{ localeInfo.flag }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg">📝</span>
                    <div>
                      <div class="font-medium">{{ t('storeDemo.textDirection') }}</div>
                      <div class="text-sm text-base-content/70">
                        {{ localeInfo.direction.toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <h4 class="font-semibold">{{ t('storeDemo.availableLocales') }}</h4>
                  <div class="space-y-1">
                    <div
                      v-for="locale in availableLocales"
                      :key="locale.code"
                      class="flex items-center justify-between p-2 bg-base-100 rounded"
                    >
                      <span class="text-sm">{{ locale.flag }} {{ locale.nativeName }}</span>
                      <div
                        class="badge badge-sm"
                        :class="locale.code === currentLocale ? 'badge-primary' : 'badge-ghost'"
                      >
                        {{ locale.code }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme Management -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h3 class="card-title text-lg">
                <span class="text-xl">🎨</span>
                {{ t('storeDemo.themeManagement') }}
              </h3>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🌞</span>
                    <div>
                      <div class="font-medium">{{ t('storeDemo.currentTheme') }}</div>
                      <div class="text-sm text-base-content/70">{{ currentTheme }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg">🎯</span>
                    <div>
                      <div class="font-medium">{{ t('storeDemo.themeMode') }}</div>
                      <div class="text-sm text-base-content/70">{{ themeMode }}</div>
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <h4 class="font-semibold">{{ t('storeDemo.availableThemes') }}</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <div
                      v-for="theme in availableThemes"
                      :key="theme"
                      class="flex items-center justify-between p-2 bg-base-100 rounded"
                    >
                      <span class="text-sm">{{ theme }}</span>
                      <div
                        class="badge badge-sm"
                        :class="theme === currentTheme ? 'badge-primary' : 'badge-ghost'"
                      >
                        {{ theme === currentTheme ? 'Active' : 'Inactive' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Store State Display -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h3 class="card-title text-lg">
                <span class="text-xl">📊</span>
                {{ t('storeDemo.storeState') }}
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="stat bg-base-100 rounded-lg">
                    <div class="stat-figure text-primary">
                      <span class="text-2xl">🌐</span>
                    </div>
                    <div class="stat-title">{{ t('storeDemo.locale') }}</div>
                    <div class="stat-value text-lg">{{ currentLocale }}</div>
                  </div>
                  <div class="stat bg-base-100 rounded-lg">
                    <div class="stat-figure text-secondary">
                      <span class="text-2xl">🎨</span>
                    </div>
                    <div class="stat-title">{{ t('storeDemo.theme') }}</div>
                    <div class="stat-value text-lg">{{ currentTheme }}</div>
                  </div>
                  <div class="stat bg-base-100 rounded-lg">
                    <div class="stat-figure text-accent">
                      <span class="text-2xl">⚙️</span>
                    </div>
                    <div class="stat-title">{{ t('storeDemo.settings') }}</div>
                    <div class="stat-value text-lg">{{ settingsCount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card bg-base-200">
            <div class="card-body">
              <h3 class="card-title text-lg">
                <span class="text-xl">⚡</span>
                {{ t('storeDemo.actions') }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-primary btn-sm" @click="switchLocale('en')">
                  Switch to English
                </button>
                <button class="btn btn-secondary btn-sm" @click="switchLocale('af')">
                  Switch to Afrikaans
                </button>
                <button class="btn btn-accent btn-sm" @click="setTheme('light')">
                  Light Theme
                </button>
                <button class="btn btn-neutral btn-sm" @click="setTheme('business')">
                  Dark Theme
                </button>
                <button class="btn btn-outline btn-sm" @click="resetSettings">
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useLocaleRouter } from '@/composables/useLocaleRouter'

const { t, locale } = useI18n()
const { currentTheme, setTheme, availableThemes } = useTheme()
const { switchLocale } = useLocaleRouter()

const currentLocale = computed(() => locale.value)
const themeMode = computed(() => (currentTheme.value === 'light' ? 'Light' : 'Dark'))

const availableLocales = computed(() => [
  { code: 'en', flag: '🇺🇸', nativeName: 'English' },
  { code: 'af', flag: '🇿🇦', nativeName: 'Afrikaans' },
])

const localeInfo = computed(() => {
  const current = availableLocales.value.find((l) => l.code === currentLocale.value)
  return current || { code: 'en', flag: '🇺🇸', nativeName: 'English', direction: 'ltr' }
})

const settingsCount = computed(() => {
  return availableThemes.value.length + availableLocales.value.length
})

const resetSettings = () => {
  setTheme('light')
  switchLocale('en')
}
</script>
