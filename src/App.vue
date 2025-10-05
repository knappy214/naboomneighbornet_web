<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navigation Drawer - Only show for non-auth routes -->
    <LocaleNavigation v-if="!isAuthRoute" />

    <!-- Main Content -->
    <main class="min-h-screen">
      <RouterView />
    </main>

    <ToastHost />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleNavigation from '@/components/LocaleNavigation.vue'
import ToastHost from '@/components/ToastHost.vue'
import { useTheme } from '@/composables/useTheme'
import { detectLocale } from '@/utils/localeDetection'

const route = useRoute()
const { locale } = useI18n()
const { initializeTheme } = useTheme()

// Check if current route is an auth route (login, register, forgot, reset)
const isAuthRoute = computed(() => {
  return route.meta.requiresGuest === true
})

onMounted(() => {
  // Initialize theme system
  initializeTheme()

  // Detect locale from URL or other sources
  const detection = detectLocale()
  if (locale.value !== detection.locale) {
    locale.value = detection.locale
  }
})
</script>
