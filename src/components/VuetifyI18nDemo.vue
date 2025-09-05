<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-translate</v-icon>
            {{ t('app.title') }} - Vuetify + i18n Integration Demo
          </v-card-title>
          <v-card-text>
            <!-- Locale Switcher -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <h3>{{ t('app.language') }}</h3>
                <VuetifyLocaleSwitcher />
              </v-col>
              <v-col cols="12" md="6">
                <h3>Current Locale</h3>
                <v-chip color="primary" size="large">
                  <v-icon start>{{ currentLocaleIcon }}</v-icon>
                  {{ currentLocale }}
                </v-chip>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Vuetify Components with i18n -->
            <v-row>
              <v-col cols="12" md="6">
                <h3>Vuetify Data Table</h3>
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :items-per-page="5"
                  class="elevation-1"
                />
              </v-col>
              <v-col cols="12" md="6">
                <h3>Vuetify Pagination</h3>
                <v-pagination v-model="page" :length="4" class="my-4" />
                <v-btn color="primary" class="mr-2">
                  {{ t('app.login') }}
                </v-btn>
                <v-btn color="secondary" variant="outlined">
                  {{ t('app.register') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Form Components -->
            <v-row>
              <v-col cols="12" md="6">
                <h3>Form Components</h3>
                <v-form>
                  <v-text-field :label="t('auth.email')" variant="outlined" class="mb-2" />
                  <v-text-field
                    :label="t('auth.password')"
                    type="password"
                    variant="outlined"
                    class="mb-2"
                  />
                  <v-btn color="primary" block>
                    {{ t('app.login') }}
                  </v-btn>
                </v-form>
              </v-col>
              <v-col cols="12" md="6">
                <h3>File Upload</h3>
                <v-file-input
                  :label="t('$vuetify.fileInput.counter', ['0'])"
                  variant="outlined"
                  multiple
                  show-size
                />
                <v-rating
                  v-model="rating"
                  :label="t('$vuetify.rating.ariaLabel.item', [rating, 5])"
                  class="mt-4"
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Time Picker and Calendar -->
            <v-row>
              <v-col cols="12" md="6">
                <h3>Time Picker</h3>
                <v-time-picker v-model="time" :format="'24hr'" class="mt-2" />
              </v-col>
              <v-col cols="12" md="6">
                <h3>Carousel</h3>
                <v-carousel height="200" show-arrows="hover" class="mt-2">
                  <v-carousel-item
                    v-for="(item, i) in carouselItems"
                    :key="i"
                    :src="item.src"
                    cover
                  >
                    <div class="d-flex fill-height justify-center align-center">
                      <div class="text-h2">{{ item.title }}</div>
                    </div>
                  </v-carousel-item>
                </v-carousel>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <!-- Loading States -->
            <v-row>
              <v-col cols="12">
                <h3>Loading States</h3>
                <v-progress-linear indeterminate color="primary" class="mb-2" />
                <v-skeleton-loader type="table-heading, table-tbody" class="mb-2" />
                <v-btn :loading="loading" @click="toggleLoading" color="primary">
                  {{ loading ? t('$vuetify.loading') : 'Click me' }}
                </v-btn>
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
import { useLocale } from 'vuetify'
import VuetifyLocaleSwitcher from './VuetifyLocaleSwitcher.vue'
import { type AppLocale } from '@/plugins/i18n'

const { t, locale } = useI18n()
const vuetifyLocale = useLocale()

const currentLocale = computed(() => locale.value as AppLocale)
const page = ref(1)
const rating = ref(3)
const time = ref('12:00')
const loading = ref(false)

const currentLocaleIcon = computed(() => {
  const icons = {
    en: 'mdi-flag',
    af: 'mdi-flag-south-africa',
  }
  return icons[currentLocale.value]
})

const headers = computed(() => [
  { title: t('auth.email'), key: 'email', sortable: true },
  { title: t('auth.password'), key: 'password', sortable: false },
  { title: t('app.language'), key: 'language', sortable: true },
])

const items = computed(() => [
  { email: 'user1@example.com', password: '••••••••', language: 'English' },
  { email: 'user2@example.com', password: '••••••••', language: 'Afrikaans' },
  { email: 'user3@example.com', password: '••••••••', language: 'English' },
])

const carouselItems = computed(() => [
  { src: 'https://picsum.photos/800/400?random=1', title: t('app.title') },
  { src: 'https://picsum.photos/800/400?random=2', title: t('$vuetify.loading') },
  { src: 'https://picsum.photos/800/400?random=3', title: t('app.language') },
])

const toggleLoading = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>
