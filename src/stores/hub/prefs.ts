import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { i18n, type AppLocale } from '@/plugins/i18n'
import { useI18nStore } from '@/stores/i18n'

type NotificationPermissionState = NotificationPermission | 'unsupported'

export interface StoredSubscriptionMeta {
  endpoint: string
  expirationTime: number | null
}

export const usePrefsStore = defineStore(
  'hub-prefs',
  () => {
    const language = ref<AppLocale>((localStorage.getItem('locale') as AppLocale) || 'en')
    const notificationsEnabled = ref<boolean>(localStorage.getItem('hub-notifications') === 'true')
    const subscriptionMeta = ref<StoredSubscriptionMeta | null>(
      localStorage.getItem('hub-subscription-meta')
        ? JSON.parse(localStorage.getItem('hub-subscription-meta') as string)
        : null,
    )
    const permission = ref<NotificationPermissionState>('default')
    const pushSupported = ref<boolean>(typeof window !== 'undefined' && 'PushManager' in window)
    const vapidPublicKey = ref<string>(import.meta.env.VITE_VAPID_PUBLIC_KEY || '')
    const lastSubscriptionCheck = ref<number>(0)

    const currentLanguage = computed(() => language.value)

    const isSubscribed = computed(() => !!subscriptionMeta.value?.endpoint)

    const canUsePush = computed(() => pushSupported.value && permission.value !== 'denied')

    async function initialize() {
      const i18nStore = useI18nStore()
      const storeLocale = i18nStore.currentLocale
      const normalizedLocale = (storeLocale as AppLocale) || language.value
      await changeLanguage(normalizedLocale)

      if (!pushSupported.value) {
        permission.value = 'unsupported'
        notificationsEnabled.value = false
        return
      }

      permission.value = Notification.permission
      if (permission.value === 'granted') {
        localStorage.setItem('hub-notifications', 'true')
        notificationsEnabled.value = true
      }
    }

    async function changeLanguage(next: AppLocale) {
      language.value = next
      localStorage.setItem('locale', next)
      i18n.global.locale.value = next
    }

    function setPermission(value: NotificationPermissionState) {
      permission.value = value
    }

    function setSubscription(meta: StoredSubscriptionMeta | null) {
      subscriptionMeta.value = meta
      if (meta) {
        localStorage.setItem('hub-subscription-meta', JSON.stringify(meta))
      } else {
        localStorage.removeItem('hub-subscription-meta')
      }
    }

    function setNotificationsEnabled(enabled: boolean) {
      notificationsEnabled.value = enabled
      localStorage.setItem('hub-notifications', enabled ? 'true' : 'false')
    }

    function setLastSubscriptionCheck(timestamp: number) {
      lastSubscriptionCheck.value = timestamp
    }

    return {
      language,
      notificationsEnabled,
      subscriptionMeta,
      permission,
      pushSupported,
      vapidPublicKey,
      lastSubscriptionCheck,
      currentLanguage,
      isSubscribed,
      canUsePush,
      initialize,
      changeLanguage,
      setPermission,
      setSubscription,
      setNotificationsEnabled,
      setLastSubscriptionCheck,
    }
  },
  {
    persist: [
      {
        key: 'hub-prefs',
        paths: ['language', 'notificationsEnabled', 'subscriptionMeta', 'vapidPublicKey'],
        debug: false,
      },
    ],
  },
)
