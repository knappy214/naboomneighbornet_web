<template>
  <div class="space-y-6 p-6">
    <header class="space-y-2">
      <RouterLink :to="channelsLink" class="text-sm text-primary">{{
        t('hub.actions.backToChannels')
      }}</RouterLink>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-base-content">{{ activeChannel?.name }}</h1>
          <p class="text-sm text-base-content/70">{{ activeChannel?.description }}</p>
        </div>
        <span class="badge" :class="statusBadge">{{ statusLabel }}</span>
      </div>
    </header>

    <div class="flex flex-col gap-4 lg:flex-row">
      <div class="grow space-y-4">
        <div class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
          <label class="block text-sm font-semibold text-base-content" for="thread-search">
            {{ t('hub.search.label') }}
          </label>
          <div class="mt-2 flex items-center gap-2">
            <input
              id="thread-search"
              v-model="search"
              type="search"
              class="input input-bordered w-full"
              :placeholder="t('hub.search.placeholder')"
            />
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              @click="clearSearch"
              :disabled="!search"
            >
              {{ t('hub.search.clear') }}
            </button>
          </div>
          <p v-if="search" class="mt-2 text-xs text-base-content/60">
            {{
              t('hub.search.resultsSummary', { count: searchResults.length, total: searchTotal })
            }}
          </p>
        </div>

        <ThreadList :threads="displayThreads" />
      </div>

      <aside class="w-full max-w-sm space-y-4">
        <div
          class="rounded-box border border-base-200 bg-base-100 p-4 text-sm text-base-content/70"
        >
          <p>{{ t('hub.threads.sideInfo') }}</p>
          <ul class="mt-2 space-y-1">
            <li>• {{ t('hub.threads.tipRealtime') }}</li>
            <li>• {{ t('hub.threads.tipSearch') }}</li>
            <li>• {{ t('hub.threads.tipNotifications') }}</li>
          </ul>
        </div>
        <NotificationToggle />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ThreadList from '@/components/hub/ThreadList.vue'
import NotificationToggle from '@/components/hub/NotificationToggle.vue'
import { useChannelsStore } from '@/stores/hub/channels'
import { useThreadsStore } from '@/stores/hub/threads'
import { useLocaleRouter } from '@/composables/useLocaleRouter'

const { t } = useI18n()
const route = useRoute()
const channelsStore = useChannelsStore()
const threadsStore = useThreadsStore()
const { getLocalizedPath } = useLocaleRouter()

const search = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const channelId = computed(() => String(route.params.id ?? ''))

onMounted(async () => {
  await channelsStore.initialize()
  if (channelId.value) {
    channelsStore.setActiveChannel(channelId.value)
    channelsStore.markChannelRead(channelId.value)
  }
})

watch(
  () => route.params.id,
  (next) => {
    if (typeof next === 'string') {
      channelsStore.setActiveChannel(next)
      channelsStore.markChannelRead(next)
      threadsStore.loadThreads(next)
      search.value = ''
    }
  },
)

watch(search, (value) => {
  if (!channelId.value) return
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    threadsStore.performSearch(channelId.value, value)
  }, 300)
})

const activeChannel = computed(() => channelsStore.activeChannel)

const channelsLink = computed(() => getLocalizedPath('/channels'))

const statusLabel = computed(() => {
  const status = channelsStore.statuses[channelId.value] ?? 'offline'
  switch (status) {
    case 'online':
      return t('hub.status.online')
    case 'connecting':
      return t('hub.status.connecting')
    case 'reconnecting':
      return t('hub.status.reconnecting')
    default:
      return t('hub.status.offline')
  }
})

const statusBadge = computed(() => {
  const status = channelsStore.statuses[channelId.value]
  if (status === 'online') return 'badge-success'
  if (status === 'reconnecting') return 'badge-warning'
  if (status === 'connecting') return 'badge-info'
  return 'badge-outline'
})

const searchResults = computed(() => {
  if (!channelId.value) return []
  return threadsStore.searchForChannel(channelId.value)
})

const searchTotal = computed(() => {
  if (!channelId.value) return 0
  return threadsStore.searchTotalForChannel(channelId.value)
})

const displayThreads = computed(() => {
  if (search.value.trim()) {
    return searchResults.value
  }
  if (!channelId.value) return []
  return threadsStore.threadsForChannel(channelId.value)
})

const clearSearch = () => {
  search.value = ''
}
</script>
