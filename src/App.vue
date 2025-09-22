<template>
  <v-app>
    <v-layout>
      <!-- Navigation Drawer -->
      <LocaleNavigation />

      <!-- Main Content -->
      <v-main>
        <RouterView />
      </v-main>
    </v-layout>
    <ToastHost />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import LocaleNavigation from '@/components/LocaleNavigation.vue'
import ToastHost from '@/components/ToastHost.vue'
import { detectLocale } from '@/utils/localeDetection'

const { locale } = useI18n()
const route = useRoute()

onMounted(() => {
  // Detect locale from URL or other sources
  const detection = detectLocale()
  if (locale.value !== detection.locale) {
    locale.value = detection.locale
  }
})
</script>
