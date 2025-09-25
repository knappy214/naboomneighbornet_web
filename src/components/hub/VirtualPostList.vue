<template>
  <div
    ref="container"
    class="max-h-[60vh] overflow-y-auto rounded-box border border-base-200 bg-base-100 p-4"
  >
    <div :style="{ height: `${topSpacer}px` }" aria-hidden="true" />
    <div
      v-for="post in visiblePosts"
      :key="post.id"
      class="mb-4 rounded-box bg-base-200/60 p-4 last:mb-0"
    >
      <header class="flex items-center justify-between text-xs text-base-content/60">
        <span class="font-semibold text-base-content">{{ post.author }}</span>
        <time>{{ formatRelative(post.createdAt) }}</time>
      </header>
      <p class="mt-2 whitespace-pre-wrap text-sm text-base-content">{{ post.body }}</p>
      <p v-if="post.optimistic" class="mt-2 text-xs text-warning">
        {{ t('hub.posts.optimistic') }}
      </p>
    </div>
    <div :style="{ height: `${bottomSpacer}px` }" aria-hidden="true" />
    <p v-if="!posts.length" class="text-center text-sm text-base-content/70">
      {{ t('hub.posts.empty') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { HubPost } from '@/types/hub'

const props = defineProps<{
  posts: HubPost[]
}>()

const { t } = useI18n()

const container = ref<HTMLElement | null>(null)
const itemHeight = ref(120)
const viewportHeight = ref(0)
const startIndex = ref(0)
const buffer = 6
const resizeObserver = ref<ResizeObserver | null>(null)

const visibleCount = computed(() => {
  if (!viewportHeight.value) return 10
  return Math.ceil(viewportHeight.value / itemHeight.value) + buffer
})

const topSpacer = computed(() => startIndex.value * itemHeight.value)

const visiblePosts = computed(() => {
  if (!props.posts.length) return []
  return props.posts.slice(startIndex.value, startIndex.value + visibleCount.value)
})

const bottomSpacer = computed(() => {
  const rendered = startIndex.value + visibleCount.value
  const remaining = Math.max(props.posts.length - rendered, 0)
  return remaining * itemHeight.value
})

const updateViewport = () => {
  if (!container.value) return
  viewportHeight.value = container.value.clientHeight
  updateRange()
}

const updateRange = () => {
  if (!container.value) return
  const scrollTop = container.value.scrollTop
  startIndex.value = Math.max(Math.floor(scrollTop / itemHeight.value) - buffer, 0)
}

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

onMounted(() => {
  updateViewport()
  if (!container.value) return
  resizeObserver.value = new ResizeObserver(() => updateViewport())
  resizeObserver.value.observe(container.value)
  container.value.addEventListener('scroll', updateRange, { passive: true })
})

watch(
  () => props.posts.length,
  () => {
    updateViewport()
  },
)

onBeforeUnmount(() => {
  if (container.value) {
    container.value.removeEventListener('scroll', updateRange)
  }
  resizeObserver.value?.disconnect()
  resizeObserver.value = null
})
</script>
