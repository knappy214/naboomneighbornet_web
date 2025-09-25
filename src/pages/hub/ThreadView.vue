<template>
  <div class="space-y-6 p-6">
    <header class="space-y-2">
      <RouterLink :to="channelLink" class="text-sm text-primary">{{
        t('hub.actions.backToChannel')
      }}</RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ threadTitle }}</h1>
        <p class="text-sm text-base-content/70">
          {{
            t('hub.threads.byline', { author: threadAuthor, time: formatRelative(threadCreatedAt) })
          }}
        </p>
      </div>
    </header>

    <section class="space-y-4">
      <div class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
        <header class="flex flex-wrap items-center justify-between gap-4">
          <span class="text-sm text-base-content/70">{{
            t('hub.posts.count', { count: posts.length })
          }}</span>
          <span v-if="isLoading" class="loading loading-spinner loading-sm" aria-hidden="true" />
        </header>
        <VirtualPostList :posts="posts" />
      </div>

      <ThreadComposer :thread-id="threadId" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import VirtualPostList from '@/components/hub/VirtualPostList.vue'
import ThreadComposer from '@/components/hub/ThreadComposer.vue'
import { useThreadsStore } from '@/stores/hub/threads'
import { usePostsStore } from '@/stores/hub/posts'
import { useChannelsStore } from '@/stores/hub/channels'
import { useLocaleRouter } from '@/composables/useLocaleRouter'

const { t } = useI18n()
const route = useRoute()
const threadsStore = useThreadsStore()
const postsStore = usePostsStore()
const channelsStore = useChannelsStore()
const { getLocalizedPath } = useLocaleRouter()

const threadId = computed(() => String(route.params.id ?? ''))

const loadPosts = (id: string) => {
  if (!id) return
  postsStore.loadPosts(id)
}

onMounted(() => {
  if (threadId.value) {
    loadPosts(threadId.value)
  }
})

watch(
  () => route.params.id,
  (next) => {
    if (typeof next === 'string') {
      loadPosts(next)
    }
  },
)

const thread = computed(() =>
  threadId.value ? threadsStore.threadById(threadId.value) : undefined,
)

watch(
  thread,
  (value) => {
    if (value?.channelId) {
      channelsStore.setActiveChannel(value.channelId)
      channelsStore.markChannelRead(value.channelId)
    }
  },
  { immediate: true },
)

const posts = computed(() => postsStore.postsForThread(threadId.value))
const isLoading = computed(() => postsStore.isLoading(threadId.value))

const threadTitle = computed(() => thread.value?.title ?? t('hub.threads.unknownTitle'))
const threadAuthor = computed(() => thread.value?.author ?? t('hub.threads.unknownAuthor'))
const threadCreatedAt = computed(() => thread.value?.createdAt ?? new Date().toISOString())

const channelLink = computed(() => {
  const channelId = thread.value?.channelId
  if (channelId) {
    return getLocalizedPath(`/channels/${channelId}`)
  }
  return getLocalizedPath('/channels')
})

const formatRelative = (timestamp: string) => {
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
