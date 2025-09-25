<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.pageSubtitle') }}</p>
      </div>
      <button
        type="button"
        class="btn btn-outline btn-sm"
        @click="refresh"
        :disabled="channelsStore.loading"
      >
        <span v-if="channelsStore.loading" class="loading loading-spinner loading-xs" />
        {{ t('hub.actions.refresh') }}
      </button>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <ChannelList
        :channels="channelsStore.channels"
        :active-id="channelsStore.activeChannelId"
        :loading="channelsStore.loading"
        :statuses="channelsStore.statuses"
        @select="openChannel"
      />

      <section v-if="activeChannel" class="space-y-4">
        <div class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm">
          <header class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-base-content">{{ activeChannel.name }}</h2>
              <p class="mt-1 text-sm text-base-content/70">{{ activeChannel.description }}</p>
            </div>
            <RouterLink :to="threadsLink" class="btn btn-primary btn-sm">{{
              t('hub.actions.viewThreads')
            }}</RouterLink>
          </header>
          <dl class="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt class="text-base-content/60">{{ t('hub.channels.membersLabel') }}</dt>
              <dd class="font-semibold text-base-content">{{ activeChannel.memberCount }}</dd>
            </div>
            <div>
              <dt class="text-base-content/60">{{ t('hub.channels.unreadLabel') }}</dt>
              <dd class="font-semibold text-base-content">{{ activeChannel.unreadCount }}</dd>
            </div>
            <div>
              <dt class="text-base-content/60">{{ t('hub.channels.activityLabel') }}</dt>
              <dd class="font-semibold text-base-content">
                {{ formatRelative(activeChannel.lastActivity) }}
              </dd>
            </div>
            <div>
              <dt class="text-base-content/60">{{ t('hub.channels.mutedLabel') }}</dt>
              <dd class="font-semibold text-base-content">
                {{ activeChannel.isMuted ? t('hub.status.muted') : t('hub.status.active') }}
              </dd>
            </div>
          </dl>
        </div>

        <ThreadList
          :threads="topThreads"
          title-key="hub.threads.previewTitle"
          empty-key="hub.threads.previewEmpty"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ChannelList from '@/components/hub/ChannelList.vue'
import ThreadList from '@/components/hub/ThreadList.vue'
import { useChannelsStore } from '@/stores/hub/channels'
import { useThreadsStore } from '@/stores/hub/threads'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import type { AppLocale } from '@/plugins/i18n'

const { t, locale } = useI18n()
const channelsStore = useChannelsStore()
const threadsStore = useThreadsStore()
const { getLocalizedPath, navigateToLocale } = useLocaleRouter()

onMounted(async () => {
  await channelsStore.initialize()
})

const activeChannel = computed(() => channelsStore.activeChannel)

const topThreads = computed(() => {
  if (!channelsStore.activeChannelId) return []
  return threadsStore.threadsForChannel(channelsStore.activeChannelId).slice(0, 5)
})

const threadsLink = computed(() => {
  if (!channelsStore.activeChannelId) return '#'
  return getLocalizedPath(`/channels/${channelsStore.activeChannelId}`)
})

const openChannel = (id: string) => {
  channelsStore.setActiveChannel(id)
  navigateToLocale(locale.value as AppLocale, `/channels/${id}`)
}

const refresh = () => {
  channelsStore.loadChannels()
}

const formatRelative = (timestamp: string | null) => {
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
