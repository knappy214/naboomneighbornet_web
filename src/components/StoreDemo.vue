<template>
  <v-container>
    <v-card class="elevation-2">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-database</v-icon>
        {{ $t('storeDemo.title') }}
        <v-chip color="warning" size="small" class="ml-2">
          {{ $t('storeDemo.mockData') }}
        </v-chip>
      </v-card-title>

      <v-card-text>
        <!-- Locale Management -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-translate</v-icon>
            {{ $t('storeDemo.localeManagement') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-web</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.currentLocale') }}</v-list-item-title>
                    <v-list-item-subtitle
                      >{{ localeInfo.nativeName }} ({{ currentLocale }})</v-list-item-subtitle
                    >
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-flag</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.localeFlag') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ localeInfo.flag }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-format-text-direction-ltr</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.textDirection') }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      localeInfo.direction.toUpperCase()
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn-toggle
                  v-model="currentLocale"
                  mandatory
                  @update:model-value="handleLocaleChange"
                  class="mb-4"
                >
                  <v-btn
                    v-for="locale in availableLocaleInfo"
                    :key="locale.code"
                    :value="locale.code"
                    :prepend-icon="locale.flag"
                  >
                    {{ locale.nativeName }}
                  </v-btn>
                </v-btn-toggle>

                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="refreshLocaleData"
                  :loading="isLocaleChanging"
                  class="mr-2"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  {{ $t('storeDemo.refreshData') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Cache Management -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-cached</v-icon>
            {{ $t('storeDemo.cacheManagement') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-database</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.cacheSize') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ cacheSize }} entries</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-memory</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.memoryUsage') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatBytes(memoryUsage) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-target</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('storeDemo.hitRate') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ hitRate.toFixed(1) }}%</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn
                  color="warning"
                  variant="outlined"
                  @click="clearCacheForCurrentLocale"
                  class="mr-2 mb-2"
                >
                  <v-icon start>mdi-delete</v-icon>
                  {{ $t('storeDemo.clearLocaleCache') }}
                </v-btn>

                <v-btn color="error" variant="outlined" @click="clearAllCache" class="mr-2 mb-2">
                  <v-icon start>mdi-delete-forever</v-icon>
                  {{ $t('storeDemo.clearAllCache') }}
                </v-btn>

                <v-btn color="info" variant="outlined" @click="optimizeCache" class="mb-2">
                  <v-icon start>mdi-tune</v-icon>
                  {{ $t('storeDemo.optimizeCache') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Data Stores -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-database-cog</v-icon>
            {{ $t('storeDemo.dataStores') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="store in dataStores" :key="store.name" cols="12" sm="6" md="4">
                <v-card variant="outlined" class="h-100">
                  <v-card-title class="text-subtitle-1">
                    <v-icon class="mr-2" :color="store.color">{{ store.icon }}</v-icon>
                    {{ store.name }}
                  </v-card-title>
                  <v-card-text>
                    <v-list density="compact">
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-loading</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('storeDemo.loading') }}</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip :color="store.isLoading ? 'warning' : 'success'" size="small">
                            {{ store.isLoading ? $t('storeDemo.yes') : $t('storeDemo.no') }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-database</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('storeDemo.hasData') }}</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip :color="store.hasData ? 'success' : 'error'" size="small">
                            {{ store.hasData ? $t('storeDemo.yes') : $t('storeDemo.no') }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template #prepend>
                          <v-icon>mdi-alert</v-icon>
                        </template>
                        <v-list-item-title>{{ $t('storeDemo.error') }}</v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip :color="store.hasError ? 'error' : 'success'" size="small">
                            {{ store.hasError ? $t('storeDemo.yes') : $t('storeDemo.no') }}
                          </v-chip>
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      @click="store.refresh"
                      :loading="store.isLoading"
                    >
                      <v-icon start>mdi-refresh</v-icon>
                      {{ $t('storeDemo.refresh') }}
                    </v-btn>
                    <v-spacer />
                    <v-btn color="error" variant="text" size="small" @click="store.clear">
                      <v-icon start>mdi-delete</v-icon>
                      {{ $t('storeDemo.clear') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- API Test -->
        <v-card variant="outlined">
          <v-card-title class="text-h6">
            <v-icon class="mr-2">mdi-api</v-icon>
            {{ $t('storeDemo.apiTest') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="apiEndpoint"
                  :label="$t('storeDemo.apiEndpoint')"
                  variant="outlined"
                  density="compact"
                  :placeholder="'/api/test'"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-btn
                  color="primary"
                  variant="elevated"
                  @click="testApiCall"
                  :loading="apiLoading"
                  class="mr-2"
                >
                  <v-icon start>mdi-send</v-icon>
                  {{ $t('storeDemo.testApi') }}
                </v-btn>

                <v-btn color="secondary" variant="outlined" @click="clearApiResult">
                  <v-icon start>mdi-delete</v-icon>
                  {{ $t('storeDemo.clearResult') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div v-if="apiResult">
              <h4 class="text-h6 mb-2">{{ $t('storeDemo.apiResult') }}</h4>
              <v-card variant="outlined">
                <v-card-text>
                  <pre class="text-caption">{{ JSON.stringify(apiResult, null, 2) }}</pre>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStores, useCacheManagement } from '@/composables/useStores'
import { api } from '@/services/api'

const { t } = useI18n()
// Get all stores (data stores are mocked for now)
const stores = useStores()
const cacheManagement = useCacheManagement()

// Reactive data
const apiEndpoint = ref('/api/test')
const apiLoading = ref(false)
const apiResult = ref<any>(null)

// Computed properties
const currentLocale = computed(() => stores.i18n.currentLocale)
const localeInfo = computed(() => stores.i18n.localeInfo)
const availableLocaleInfo = computed(() => stores.i18n.availableLocaleInfo)
const isLocaleChanging = computed(() => stores.i18n.state.isLocaleChanging)

const cacheSize = computed(() => cacheManagement.cacheSize.value)
const memoryUsage = computed(() => cacheManagement.memoryUsage.value)
const hitRate = computed(() => cacheManagement.hitRate.value)

const dataStores = computed(() => [
  {
    name: 'Farms',
    icon: 'mdi-home-group',
    color: 'primary',
    ...stores.farms,
  },
  {
    name: 'Alerts',
    icon: 'mdi-alert',
    color: 'warning',
    ...stores.alerts,
  },
  {
    name: 'Equipment',
    icon: 'mdi-tools',
    color: 'info',
    ...stores.equipment,
  },
  {
    name: 'Weather',
    icon: 'mdi-weather-cloudy',
    color: 'success',
    ...stores.weather,
  },
  {
    name: 'Neighbors',
    icon: 'mdi-account-group',
    color: 'accent',
    ...stores.neighbors,
  },
])

// Methods
const handleLocaleChange = async (newLocale: string) => {
  await stores.i18n.changeLocale(newLocale as any)
}

const refreshLocaleData = async () => {
  await Promise.all([
    stores.farms.refresh(),
    stores.alerts.refresh(),
    stores.equipment.refresh(),
    stores.weather.refresh(),
    stores.neighbors.refresh(),
  ])
}

const clearCacheForCurrentLocale = () => {
  cacheManagement.clearCacheForLocale(currentLocale.value)
}

const clearAllCache = () => {
  cacheManagement.clearAllCache()
}

const optimizeCache = () => {
  cacheManagement.optimizeCache()
}

const testApiCall = async () => {
  apiLoading.value = true
  apiResult.value = null

  try {
    const response = await api.get(apiEndpoint.value, {
      cache: true,
      cacheTTL: 300000,
    })
    apiResult.value = response
  } catch (error: any) {
    apiResult.value = {
      error: error.message,
      status: error.status,
      timestamp: new Date().toISOString(),
    }
  } finally {
    apiLoading.value = false
  }
}

const clearApiResult = () => {
  apiResult.value = null
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  // Initialize data stores
  Promise.all([
    stores.farms.fetch(),
    stores.alerts.fetch(),
    stores.equipment.fetch(),
    stores.weather.fetch(),
    stores.neighbors.fetch(),
  ])
})
</script>

<i18n>
{
  "en": {
    "storeDemo": {
      "title": "Store Management Demo",
      "localeManagement": "Locale Management",
      "currentLocale": "Current Locale",
      "localeFlag": "Locale Flag",
      "textDirection": "Text Direction",
      "refreshData": "Refresh Data",
      "cacheManagement": "Cache Management",
      "cacheSize": "Cache Size",
      "memoryUsage": "Memory Usage",
      "hitRate": "Hit Rate",
      "clearLocaleCache": "Clear Locale Cache",
      "clearAllCache": "Clear All Cache",
      "optimizeCache": "Optimize Cache",
      "dataStores": "Data Stores",
      "loading": "Loading",
      "hasData": "Has Data",
      "error": "Error",
      "yes": "Yes",
      "no": "No",
      "refresh": "Refresh",
      "clear": "Clear",
      "apiTest": "API Test",
      "apiEndpoint": "API Endpoint",
      "testApi": "Test API",
      "clearResult": "Clear Result",
      "apiResult": "API Result"
    }
  },
  "af": {
    "storeDemo": {
      "title": "Stoor Bestuur Demo",
      "localeManagement": "Taal Bestuur",
      "currentLocale": "Huidige Taal",
      "localeFlag": "Taal Vlag",
      "textDirection": "Teks Rigting",
      "refreshData": "Verfris Data",
      "cacheManagement": "Kas Bestuur",
      "cacheSize": "Kas Grootte",
      "memoryUsage": "Geheue Gebruik",
      "hitRate": "Treffer Koers",
      "clearLocaleCache": "Skep Taal Kas",
      "clearAllCache": "Skep Alle Kas",
      "optimizeCache": "Optimeer Kas",
      "dataStores": "Data Stores",
      "loading": "Laai",
      "hasData": "Het Data",
      "error": "Fout",
      "yes": "Ja",
      "no": "Nee",
      "refresh": "Verfris",
      "clear": "Skep",
      "apiTest": "API Toets",
      "apiEndpoint": "API Eindpunt",
      "testApi": "Toets API",
      "clearResult": "Skep Resultaat",
      "apiResult": "API Resultaat"
    }
  }
}
</i18n>
