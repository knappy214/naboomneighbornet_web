<template>
  <div class="space-y-6 p-6">
    <header class="space-y-2">
      <RouterLink :to="channelsLink" class="text-sm text-primary">{{
        t('hub.actions.backToChannels')
      }}</RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.notifications.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.notifications.pageSubtitle') }}</p>
      </div>
    </header>

    <NotificationToggle />

    <section class="grid gap-4 lg:grid-cols-2">
      <article class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
        <h2 class="text-base font-semibold text-base-content">
          {{ t('hub.notifications.pushTitle') }}
        </h2>
        <p class="mt-2 text-sm text-base-content/70">
          {{ t('hub.notifications.pushDescription') }}
        </p>
        <ul class="mt-3 list-disc space-y-1 pl-4 text-sm text-base-content/70">
          <li>{{ t('hub.notifications.pushTip1') }}</li>
          <li>{{ t('hub.notifications.pushTip2') }}</li>
          <li>{{ t('hub.notifications.pushTip3') }}</li>
        </ul>
      </article>
      <article class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
        <h2 class="text-base font-semibold text-base-content">
          {{ t('hub.notifications.emailTitle') }}
        </h2>
        <p class="mt-2 text-sm text-base-content/70">
          {{ t('hub.notifications.emailDescription') }}
        </p>
        <div class="mt-3 space-y-2">
          <label class="flex items-center gap-2 text-sm text-base-content">
            <input type="checkbox" class="checkbox checkbox-sm" checked disabled />
            <span>{{ t('hub.notifications.emailDaily') }}</span>
          </label>
          <label class="flex items-center gap-2 text-sm text-base-content">
            <input type="checkbox" class="checkbox checkbox-sm" checked disabled />
            <span>{{ t('hub.notifications.emailSecurity') }}</span>
          </label>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationToggle from '@/components/hub/NotificationToggle.vue'
import { useLocaleRouter } from '@/composables/useLocaleRouter'

const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()

const channelsLink = computed(() => getLocalizedPath('/channels'))
</script>
