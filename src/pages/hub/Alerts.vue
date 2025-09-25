<template>
  <div class="space-y-6 p-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-base-content">{{ t('hub.alerts.pageTitle') }}</h1>
        <p class="text-sm text-base-content/70">{{ t('hub.alerts.pageSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" @click="refresh" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          {{ t('hub.actions.refresh') }}
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="showCreateForm = true">
          {{ t('hub.alerts.createAlert') }}
        </button>
      </div>
    </header>

    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-semibold text-base-content">
          {{ t('hub.alerts.recent') }}
        </h2>
        <span class="badge badge-primary">{{ alerts.length }}</span>
      </div>

      <div v-if="alerts.length === 0" class="text-center py-8 text-base-content/60">
        <p>{{ t('hub.alerts.noAlerts') }}</p>
      </div>

      <div v-else class="space-y-3">
        <AlertCard
          v-for="alert in alerts"
          :key="alert.id"
          :alert="alert"
          @view-thread="viewThread"
        />
      </div>
    </div>

    <!-- Create Alert Modal -->
    <div v-if="showCreateForm" class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">{{ t('hub.alerts.createAlert') }}</h3>

        <form @submit.prevent="createAlert" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.alerts.content') }}</span>
            </label>
            <textarea
              v-model="alertForm.content"
              class="textarea textarea-bordered w-full"
              :placeholder="t('hub.alerts.contentPlaceholder')"
              rows="4"
              required
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.alerts.channel') }}</span>
            </label>
            <select v-model="alertForm.channel" class="select select-bordered w-full" required>
              <option value="">{{ t('hub.alerts.selectChannel') }}</option>
              <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                {{ channel.name }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('hub.alerts.thread') }}</span>
              <span class="label-text-alt">{{ t('hub.alerts.optional') }}</span>
            </label>
            <select v-model="alertForm.thread" class="select select-bordered w-full">
              <option value="">{{ t('hub.alerts.noThread') }}</option>
              <option v-for="thread in threadsForChannel" :key="thread.id" :value="thread.id">
                {{ thread.title }}
              </option>
            </select>
          </div>

          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost"
              @click="showCreateForm = false"
              :disabled="creating"
            >
              {{ t('hub.actions.cancel') }}
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="creating || !alertForm.content.trim()"
            >
              <span v-if="creating" class="loading loading-spinner loading-xs" />
              {{ t('hub.alerts.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import AlertCard from '@/components/hub/AlertCard.vue'
import * as communityHubAPI from '@/services/communityHub'
import type { Alert, Channel, Thread } from '@/services/communityHub'

const { t } = useI18n()
const router = useRouter()

const alerts = ref<Alert[]>([])
const channels = ref<Channel[]>([])
const threads = ref<Thread[]>([])
const loading = ref(false)
const creating = ref(false)
const showCreateForm = ref(false)

const alertForm = reactive({
  content: '',
  channel: '' as string | number,
  thread: '' as string | number,
})

const threadsForChannel = computed(() => {
  if (!alertForm.channel) return []
  return threads.value.filter((thread) => thread.channel === Number(alertForm.channel))
})

onMounted(async () => {
  await Promise.all([loadAlerts(), loadChannels(), loadThreads()])
})

const loadAlerts = async () => {
  loading.value = true
  try {
    alerts.value = await communityHubAPI.getAlerts()
  } catch (error) {
    console.error('Failed to load alerts:', error)
  } finally {
    loading.value = false
  }
}

const loadChannels = async () => {
  try {
    channels.value = await communityHubAPI.getChannels()
  } catch (error) {
    console.error('Failed to load channels:', error)
  }
}

const loadThreads = async () => {
  try {
    threads.value = await communityHubAPI.getThreads()
  } catch (error) {
    console.error('Failed to load threads:', error)
  }
}

const refresh = async () => {
  await Promise.all([loadAlerts(), loadChannels(), loadThreads()])
}

const viewThread = (threadId: number) => {
  router.push(`/threads/${threadId}`)
}

const createAlert = async () => {
  if (!alertForm.content.trim() || !alertForm.channel) return

  creating.value = true
  try {
    const alert = await communityHubAPI.createAlert({
      content: alertForm.content.trim(),
      channel: Number(alertForm.channel),
      thread: alertForm.thread ? Number(alertForm.thread) : undefined,
    })

    alerts.value.unshift(alert)
    showCreateForm.value = false

    // Reset form
    alertForm.content = ''
    alertForm.channel = ''
    alertForm.thread = ''
  } catch (error) {
    console.error('Failed to create alert:', error)
  } finally {
    creating.value = false
  }
}
</script>
