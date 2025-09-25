<template>
  <section class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-base font-semibold text-base-content">
          {{ t('hub.notifications.title') }}
        </h2>
        <p class="mt-1 text-sm text-base-content/70">{{ t('hub.notifications.description') }}</p>
      </div>
      <label class="flex items-center gap-2">
        <span class="text-sm text-base-content/70">{{ toggleLabel }}</span>
        <input
          type="checkbox"
          class="toggle toggle-primary"
          :checked="enabled"
          :disabled="disabled"
          @change="onToggle"
        />
      </label>
    </header>

    <dl class="mt-4 grid gap-3 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-base-content/70">{{ t('hub.notifications.status') }}</dt>
        <dd class="font-medium text-base-content">{{ statusLabel }}</dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="text-base-content/70">{{ t('hub.notifications.permission') }}</dt>
        <dd class="font-medium text-base-content">{{ permissionLabel }}</dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="text-base-content/70">{{ t('hub.notifications.lastChecked') }}</dt>
        <dd class="font-medium text-base-content">{{ lastChecked }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePrefsStore } from '@/stores/hub/prefs'
import { requestNotificationPermission, ensureSubscription, disableSubscription } from '@/lib/push'

const { t } = useI18n()
const prefsStore = usePrefsStore()

const enabled = computed(
  () => prefsStore.notificationsEnabled && prefsStore.permission === 'granted',
)
const disabled = computed(() => !prefsStore.pushSupported)

const toggleLabel = computed(() =>
  enabled.value ? t('hub.notifications.on') : t('hub.notifications.off'),
)

const permissionLabel = computed(() => {
  switch (prefsStore.permission) {
    case 'granted':
      return t('hub.notifications.permissionGranted')
    case 'denied':
      return t('hub.notifications.permissionDenied')
    case 'unsupported':
      return t('hub.notifications.unsupported')
    default:
      return t('hub.notifications.permissionPrompt')
  }
})

const statusLabel = computed(() => {
  if (!prefsStore.pushSupported) return t('hub.notifications.unsupported')
  if (prefsStore.permission === 'denied') return t('hub.notifications.blocked')
  if (enabled.value && prefsStore.isSubscribed) return t('hub.notifications.active')
  return t('hub.notifications.inactive')
})

const lastChecked = computed(() => {
  if (!prefsStore.lastSubscriptionCheck) return t('hub.notifications.never')
  return new Intl.DateTimeFormat(prefsStore.language, {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(new Date(prefsStore.lastSubscriptionCheck))
})

const onToggle = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') return
    const registration = await navigator.serviceWorker.ready
    await ensureSubscription(registration)
  } else {
    const registration = await navigator.serviceWorker.ready
    await disableSubscription(registration)
  }
}
</script>
