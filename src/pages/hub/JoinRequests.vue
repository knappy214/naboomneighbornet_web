<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.joinRequests.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.joinRequests.pageSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ t('hub.actions.refresh') }}
        </button>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-outline btn-sm">
            {{ t('hub.joinRequests.filterBy') }}: {{ filterLabel }}
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a @click="setFilter('all')">{{ t('hub.joinRequests.filters.all') }}</a>
            </li>
            <li>
              <a @click="setFilter('pending')">{{ t('hub.joinRequests.filters.pending') }}</a>
            </li>
            <li>
              <a @click="setFilter('approved')">{{ t('hub.joinRequests.filters.approved') }}</a>
            </li>
            <li>
              <a @click="setFilter('declined')">{{ t('hub.joinRequests.filters.declined') }}</a>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-base-content">
          {{ t('hub.joinRequests.requests') }}
        </h2>
        <span class="badge badge-primary">{{ filteredRequests.length }}</span>
      </div>

      <div v-if="filteredRequests.length === 0" class="text-center py-8 text-base-content/60">
        <p>{{ t('hub.joinRequests.noRequests') }}</p>
      </div>

      <div v-else class="space-y-3">
        <JoinRequestCard
          v-for="request in filteredRequests"
          :key="request.id"
          :request="request"
          @handle-request="handleRequest"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import JoinRequestCard from '@/components/hub/JoinRequestCard.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { JoinRequest } from '@/services/communityHub'

const { t } = useI18n()

const requests = ref<JoinRequest[]>([])
const loading = ref(false)
const filter = ref<'all' | 'pending' | 'approved' | 'declined'>('all')

const filteredRequests = computed(() => {
  if (filter.value === 'all') return requests.value

  return requests.value.filter((request) => request.status === filter.value)
})

const filterLabel = computed(() => {
  return t(`hub.joinRequests.filters.${filter.value}`)
})

onMounted(async () => {
  await loadRequests()
})

const loadRequests = async () => {
  loading.value = true
  try {
    requests.value = await communityHubAPI.getJoinRequests()
  } catch (error) {
    console.error('Failed to load join requests:', error)
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  await loadRequests()
}

const setFilter = (newFilter: 'all' | 'pending' | 'approved' | 'declined') => {
  filter.value = newFilter
}

const handleRequest = async (requestId: number, action: 'approved' | 'declined') => {
  try {
    if (action === 'approved') {
      await communityHubAPI.approveJoinRequest(requestId)
    } else {
      await communityHubAPI.declineJoinRequest(requestId)
    }

    // Update local state
    const request = requests.value.find((r) => r.id === requestId)
    if (request) {
      request.status = action === 'approved' ? 'approved' : 'declined'
    }
  } catch (error) {
    console.error('Failed to handle join request:', error)
  }
}
</script>
