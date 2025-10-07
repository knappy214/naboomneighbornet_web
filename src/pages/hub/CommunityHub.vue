<template>
  <div class="space-y-6 p-6">
    <header class="text-center">
      <h1 class="text-3xl font-bold text-base-content">{{ t('hub.communityHub.title') }}</h1>
      <p class="mt-2 text-lg text-base-content/70">{{ t('hub.communityHub.subtitle') }}</p>

      <!-- Connection Status Indicator -->
      <div class="mt-4 flex justify-center">
        <div
          class="badge"
          :class="{
            'badge-success': isConnected,
            'badge-warning':
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting',
            'badge-error': connectionStatus === 'offline',
            'badge-info': connectionStatus === 'authenticating',
          }"
        >
          <div
            class="w-2 h-2 rounded-full mr-2"
            :class="{
              'bg-success': isConnected,
              'bg-warning animate-pulse':
                connectionStatus === 'connecting' || connectionStatus === 'reconnecting',
              'bg-error': connectionStatus === 'offline',
              'bg-info animate-pulse': connectionStatus === 'authenticating',
            }"
          ></div>
          {{ isConnected ? 'Connected' : connectionStatus }}
        </div>
      </div>
    </header>

    <!-- Quick Stats -->
    <div class="stats stats-horizontal shadow w-full">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('hub.communityHub.stats.channels') }}</div>
        <div class="stat-value text-primary">{{ channelCount }}</div>
        <div class="stat-desc">{{ t('hub.communityHub.stats.activeChannels') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('hub.communityHub.stats.events') }}</div>
        <div class="stat-value text-secondary">{{ eventCount }}</div>
        <div class="stat-desc">{{ t('hub.communityHub.stats.upcomingEvents') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-accent">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('hub.communityHub.stats.alerts') }}</div>
        <div class="stat-value text-accent">{{ alertCount }}</div>
        <div class="stat-desc">{{ t('hub.communityHub.stats.activeAlerts') }}</div>
      </div>
    </div>

    <!-- Main Navigation Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <!-- Channels Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-primary/10 text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.channels') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">
            {{ t('hub.communityHub.navigation.channelsDesc') }}
          </p>
          <div class="card-actions">
            <router-link :to="getLocalizedPath('/channels')" class="btn btn-primary btn-sm">
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Events Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-secondary/10 text-secondary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.events') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">{{ t('hub.communityHub.navigation.eventsDesc') }}</p>
          <div class="card-actions">
            <router-link :to="getLocalizedPath('/events')" class="btn btn-secondary btn-sm">
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Alerts Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-accent/10 text-accent">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.alerts') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">{{ t('hub.communityHub.navigation.alertsDesc') }}</p>
          <div class="card-actions">
            <router-link :to="getLocalizedPath('/alerts')" class="btn btn-accent btn-sm">
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Search Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-info/10 text-info">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.search') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">{{ t('hub.communityHub.navigation.searchDesc') }}</p>
          <div class="card-actions">
            <router-link :to="getLocalizedPath('/search')" class="btn btn-info btn-sm">
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Reports Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-warning/10 text-warning">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.reports') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">
            {{ t('hub.communityHub.navigation.reportsDesc') }}
          </p>
          <div class="card-actions">
            <router-link :to="getLocalizedPath('/reports')" class="btn btn-warning btn-sm">
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-3 rounded-full bg-neutral/10 text-neutral">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 class="card-title text-lg">{{ t('hub.communityHub.navigation.settings') }}</h3>
          </div>
          <p class="text-base-content/70 mb-4">
            {{ t('hub.communityHub.navigation.settingsDesc') }}
          </p>
          <div class="card-actions">
            <router-link
              :to="getLocalizedPath('/settings/notifications')"
              class="btn btn-neutral btn-sm"
            >
              {{ t('hub.actions.explore') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">{{ t('hub.communityHub.recentActivity.title') }}</h2>
        <div v-if="loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="recentActivity.length === 0" class="text-center py-8 text-base-content/60">
          <p>{{ t('hub.communityHub.recentActivity.noActivity') }}</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-base-200/50"
          >
            <div class="p-2 rounded-full" :class="getActivityIconClass(activity.type)">
              <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-base-content">{{ activity.title }}</p>
              <p class="text-xs text-base-content/60">{{ activity.time }}</p>
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
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import { useCommunityHub } from '@/composables/useCommunityHub'

const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()

// Use the optimized Community Hub composable
const { loading, activeChannels, upcomingEvents, activeAlerts, isConnected, connectionStatus } =
  useCommunityHub()

// Computed stats
const channelCount = computed(() => activeChannels.value.length)
const eventCount = computed(() => upcomingEvents.value.length)
const alertCount = computed(() => activeAlerts.value.length)

// Recent activity (mock data for now)
const recentActivity = ref([
  {
    id: 1,
    type: 'channel',
    title: 'New message in General Discussion',
    time: '2 minutes ago',
  },
  {
    id: 2,
    type: 'event',
    title: 'Community Meeting scheduled for tomorrow',
    time: '1 hour ago',
  },
  {
    id: 3,
    type: 'alert',
    title: 'Security alert: Suspicious activity reported',
    time: '3 hours ago',
  },
])

// Load data on mount
onMounted(async () => {
  // Data loading is handled by the composable
  console.log('Community Hub mounted, data loading initiated')
})

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'channel':
      return 'svg'
    case 'event':
      return 'svg'
    case 'alert':
      return 'svg'
    default:
      return 'svg'
  }
}

const getActivityIconClass = (type: string) => {
  switch (type) {
    case 'channel':
      return 'bg-primary/10 text-primary'
    case 'event':
      return 'bg-secondary/10 text-secondary'
    case 'alert':
      return 'bg-accent/10 text-accent'
    default:
      return 'bg-neutral/10 text-neutral'
  }
}
</script>
