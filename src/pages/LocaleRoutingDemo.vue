<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-routes</v-icon>
            {{ t('app.localeRouting') }} - Vue Router 4.5.1 Demo
          </v-card-title>
          <v-card-text>
            <!-- Current Route Information -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <h3>Current Route Information</h3>
                <v-list>
                  <v-list-item>
                    <v-list-item-title>Path</v-list-item-title>
                    <v-list-item-subtitle>{{ route.path }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Name</v-list-item-title>
                    <v-list-item-subtitle>{{ route.name }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Locale</v-list-item-title>
                    <v-list-item-subtitle>{{ currentLocale }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Query</v-list-item-title>
                    <v-list-item-subtitle>{{ JSON.stringify(route.query) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <h3>Navigation Actions</h3>
                <v-btn color="primary" class="mr-2 mb-2" @click="goToDashboard">
                  {{ t('app.dashboard') }}
                </v-btn>
                <v-btn color="secondary" class="mr-2 mb-2" @click="goToDemo">
                  {{ t('app.demo') }}
                </v-btn>
                <v-btn color="accent" class="mr-2 mb-2" @click="goToThemeDemo">
                  {{ t('app.themeDemo') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Locale Switching -->
            <v-row class="mb-4">
              <v-col cols="12">
                <h3>Locale Switching</h3>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined">
                      <v-card-title>Switch Locale</v-card-title>
                      <v-card-text>
                        <v-btn-toggle
                          v-model="selectedLocale"
                          mandatory
                          @update:model-value="handleLocaleSwitch"
                        >
                          <v-btn value="en">
                            <v-icon start>mdi-flag</v-icon>
                            English
                          </v-btn>
                          <v-btn value="af">
                            <v-icon start>mdi-flag-south-africa</v-icon>
                            Afrikaans
                          </v-btn>
                        </v-btn-toggle>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined">
                      <v-card-title>Programmatic Navigation</v-card-title>
                      <v-card-text>
                        <v-text-field
                          v-model="customPath"
                          label="Custom Path"
                          placeholder="/dashboard"
                          variant="outlined"
                          density="compact"
                        />
                        <v-btn
                          color="primary"
                          @click="navigateToCustomPath"
                          :disabled="!customPath"
                        >
                          Navigate
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- URL Examples -->
            <v-row class="mb-4">
              <v-col cols="12">
                <h3>URL Examples</h3>
                <v-list>
                  <v-list-item
                    v-for="example in urlExamples"
                    :key="example.path"
                    @click="navigateToExample(example.path)"
                    class="cursor-pointer"
                  >
                    <template #prepend>
                      <v-icon>{{ example.icon }}</v-icon>
                    </template>
                    <v-list-item-title>{{ example.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ example.path }}</v-list-item-subtitle>
                    <template #append>
                      <v-icon>mdi-arrow-right</v-icon>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Route Meta Information -->
            <v-row>
              <v-col cols="12">
                <h3>Route Meta Information</h3>
                <v-data-table
                  :headers="metaHeaders"
                  :items="metaItems"
                  :items-per-page="5"
                  class="elevation-1"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { getSupportedLocales, type AppLocale } from '@/utils/localeDetection'

const { t, locale } = useI18n()
const {
  route,
  currentLocale,
  switchLocale,
  goToDashboard,
  goToDemo,
  goToThemeDemo,
  navigateToLocale,
  getLocalizedPath,
} = useLocaleRouter()

const selectedLocale = ref(currentLocale.value)
const customPath = ref('/dashboard')

const supportedLocales = getSupportedLocales()

const urlExamples = computed(() => [
  {
    path: getLocalizedPath('/dashboard'),
    title: t('app.dashboard'),
    icon: 'mdi-view-dashboard',
  },
  {
    path: getLocalizedPath('/demo'),
    title: t('app.demo'),
    icon: 'mdi-translate',
  },
  {
    path: getLocalizedPath('/theme-demo'),
    title: t('app.themeDemo'),
    icon: 'mdi-palette',
  },
  {
    path: getLocalizedPath('/login'),
    title: t('app.login'),
    icon: 'mdi-login',
  },
  {
    path: getLocalizedPath('/register'),
    title: t('app.register'),
    icon: 'mdi-account-plus',
  },
])

const metaHeaders = [
  { title: 'Property', key: 'property' },
  { title: 'Value', key: 'value' },
  { title: 'Type', key: 'type' },
]

const metaItems = computed(() => [
  {
    property: 'requiresAuth',
    value: route.meta.requiresAuth ? 'true' : 'false',
    type: 'boolean',
  },
  {
    property: 'requiresGuest',
    value: route.meta.requiresGuest ? 'true' : 'false',
    type: 'boolean',
  },
  {
    property: 'locale',
    value: route.meta.locale || 'undefined',
    type: 'string',
  },
  {
    property: 'title',
    value: route.meta.title || 'undefined',
    type: 'string',
  },
  {
    property: 'description',
    value: route.meta.description || 'undefined',
    type: 'string',
  },
])

const handleLocaleSwitch = async (newLocale: AppLocale) => {
  await switchLocale(newLocale)
  selectedLocale.value = newLocale
}

const navigateToCustomPath = async () => {
  if (customPath.value) {
    await navigateToLocale(currentLocale.value, customPath.value)
  }
}

const navigateToExample = async (path: string) => {
  await navigateToLocale(currentLocale.value, path)
}
</script>
