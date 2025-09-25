<template>
  <div class="space-y-3">
    <header class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-base-content">{{ title }}</h2>
      <span v-if="threads.length" class="text-xs text-base-content/60">
        {{ t('hub.threads.count', { count: threads.length }) }}
      </span>
    </header>

    <p
      v-if="!threads.length"
      class="rounded-box border border-dashed border-base-200 p-6 text-center text-sm text-base-content/70"
    >
      {{ emptyState }}
    </p>

    <ul v-else class="space-y-2">
      <li v-for="thread in threads" :key="thread.id">
        <RouterLink
          :to="threadLink(thread.id)"
          class="block rounded-box border border-base-200 bg-base-100 p-4 shadow-sm transition hover:border-primary hover:shadow"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="text-base font-semibold text-base-content">{{ thread.title }}</h3>
            <span v-if="thread.searchRank" class="badge badge-outline badge-sm">
              {{ t('hub.search.rank', { rank: thread.searchRank?.toFixed(2) }) }}
            </span>
          </div>
          <p class="mt-1 text-sm text-base-content/70">{{ thread.lastReplySnippet }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
            <span>{{ t('hub.threads.author', { name: thread.author }) }}</span>
            <span>{{ formatRelative(thread.updatedAt) }}</span>
            <span>{{ t('hub.threads.replies', { count: thread.replyCount }) }}</span>
          </div>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { HubThread } from '@/types/hub'

const props = defineProps<{
  threads: HubThread[]
  titleKey?: string
  emptyKey?: string
}>()

const { t, locale } = useI18n()
const route = useRoute()

const title = computed(() => t(props.titleKey ?? 'hub.threads.title'))
const emptyState = computed(() => t(props.emptyKey ?? 'hub.threads.empty'))

const threadLink = (threadId: string) => {
  const segments = route.path.split('/').filter(Boolean)
  const currentLocale = segments[0]
  const localePrefix = currentLocale && ['en', 'af'].includes(currentLocale) ? currentLocale : locale.value
  return `/${localePrefix}/threads/${threadId}`
}

const formatRelative = (timestamp: string) => {
  if (!timestamp) return t('hub.time.unknown')
  const then = new Date(timestamp)
  const diff = Date.now() - then.getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return t('hub.time.now')
  if (minutes < 60) return t('hub.time.minutes', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return t('hub.time.hours', { count: hours })
  const days = Math.round(hours / 24)
  return t('hub.time.days', { count: days })
}
</script>
