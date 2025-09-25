<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.search.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.search.pageSubtitle') }}</p>
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
        <span v-if="loading" class="loading loading-spinner loading-xs" />
        {{ t('hub.actions.refresh') }}
      </button>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div class="space-y-4">
        <SearchFilters :channels="channels" @filters-changed="handleFiltersChanged" />
      </div>

      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-semibold text-base-content">
            {{ t('hub.search.results') }}
          </h2>
          <span class="badge badge-primary">{{ searchResults.length }}</span>
        </div>

        <div
          v-if="searchResults.length === 0 && !loading"
          class="text-center py-8 text-base-content/60"
        >
          <p>{{ t('hub.search.noResults') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="card bg-base-100 shadow-sm border border-base-200"
          >
            <div class="card-body p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-base-content">
                    {{ result.title }}
                  </h3>
                  <p class="text-xs text-base-content/60 mt-1">
                    {{ t('hub.search.by') }} {{ result.author }}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {{ formatRelativeTime(result.created_at) }}
                  </p>
                  <div v-if="result.searchRank" class="mt-2">
                    <span class="badge badge-outline badge-sm">
                      {{ t('hub.search.rank', { rank: result.searchRank.toFixed(2) }) }}
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="badge" :class="getTypeBadge(result.type)">
                    {{ t(`hub.search.types.${result.type}`) }}
                  </span>
                  <button class="btn btn-ghost btn-xs" @click="viewResult(result)">
                    {{ t('hub.search.view') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SearchFilters from '@/components/hub/SearchFilters.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { Channel, Thread } from '@/services/communityHub'

const { t } = useI18n()
const router = useRouter()

const channels = ref<Channel[]>([])
const searchResults = ref<Thread[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filters = ref({
  channel: '' as number | '',
  includeThreads: true,
  includePosts: true,
  includeAlerts: false,
  dateFrom: '',
  dateTo: '',
  author: '',
})

onMounted(async () => {
  await loadChannels()
})

const loadChannels = async () => {
  try {
    channels.value = await communityHubAPI.getChannels()
  } catch (error) {
    console.error('Failed to load channels:', error)
  }
}

const refresh = async () => {
  if (searchQuery.value.trim()) {
    await performSearch()
  }
}

const handleFiltersChanged = (newFilters: any) => {
  filters.value = newFilters
  if (searchQuery.value.trim()) {
    performSearch()
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  try {
    const results = await communityHubAPI.searchThreads(
      searchQuery.value,
      filters.value.channel || undefined,
    )
    searchResults.value = results
  } catch (error) {
    console.error('Failed to search:', error)
  } finally {
    loading.value = false
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'thread':
      return 'badge-primary'
    case 'post':
      return 'badge-secondary'
    case 'alert':
      return 'badge-warning'
    default:
      return 'badge-outline'
  }
}

const viewResult = (result: Thread) => {
  router.push(`/threads/${result.id}`)
}

const formatRelativeTime = (timestamp: string) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = now.getTime() - then.getTime()

  const minutes = Math.round(diff / (1000 * 60))
  if (minutes < 1) return t('hub.time.now')
  if (minutes < 60) return t('hub.time.minutes', { count: minutes })

  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('hub.time.hours', { count: hours })

  const days = Math.round(hours / 24)
  return t('hub.time.days', { count: days })
}

// Expose search function for external use
defineExpose({
  search: (query: string) => {
    searchQuery.value = query
    performSearch()
  },
})
</script>
