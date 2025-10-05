<template>
  <div class="card shadow-lg" :class="alertCardClass">
    <div class="card-body">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="text-2xl" :class="iconColorClass">
            {{ alertIcon }}
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-bold">{{ t(alert.title) }}</h3>
            <p class="text-sm opacity-80">{{ t(alert.description) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="badge" :class="severityBadgeClass">
            {{ t(`alerts.severity.${alert.severity}`) }}
          </div>
          <div v-if="showActions" class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-[1] w-48 p-2 shadow-lg"
            >
              <li @click="handleAcknowledge">
                <button class="flex items-center gap-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {{ t('alerts.actions.acknowledge') }}
                </button>
              </li>
              <li @click="handleDismiss">
                <button class="flex items-center gap-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  {{ t('alerts.actions.dismiss') }}
                </button>
              </li>
              <li @click="handleViewDetails">
                <button class="flex items-center gap-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {{ t('alerts.actions.viewDetails') }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div v-if="showDetails" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-lg">🕐</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.time') }}</div>
                <div class="text-sm opacity-70">{{ formatDateTime(alert.timestamp) }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">📍</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.location') }}</div>
                <div class="text-sm opacity-70">{{ alert.location }}</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">🔢</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.id') }}</div>
                <div class="text-sm opacity-70">{{ alert.id }}</div>
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <span class="text-lg">⚡</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.status') }}</div>
                <div class="badge badge-sm" :class="statusBadgeClass">
                  {{ t(`alerts.status.${alert.status}`) }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-lg">🎯</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.type') }}</div>
                <div class="text-sm opacity-70">{{ t(`alerts.types.${alert.type}`) }}</div>
              </div>
            </div>
            <div v-if="alert.priority" class="flex items-center gap-3">
              <span class="text-lg">⭐</span>
              <div>
                <div class="font-medium">{{ t('alerts.details.priority') }}</div>
                <div class="text-sm opacity-70">{{ t(`alerts.priority.${alert.priority}`) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div v-if="alert.additionalInfo" class="mt-4 p-3 bg-base-200 rounded-lg">
          <h4 class="font-semibold mb-2">{{ t('alerts.details.additionalInfo') }}</h4>
          <p class="text-sm">{{ alert.additionalInfo }}</p>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="flex flex-wrap gap-2 mt-4">
          <button class="btn btn-primary btn-sm" @click="handlePrimaryAction" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
            <span v-else class="text-lg">✅</span>
            {{ t('alerts.actions.acknowledge') }}
          </button>
          <button
            class="btn btn-outline btn-sm"
            @click="handleSecondaryAction"
            :disabled="isLoading"
          >
            <span class="text-lg">👁️</span>
            {{ t('alerts.actions.viewDetails') }}
          </button>
          <button
            v-if="alert.severity === 'critical'"
            class="btn btn-error btn-sm"
            @click="handleEmergency"
            :disabled="isLoading"
          >
            <span class="text-lg">🚨</span>
            {{ t('alerts.actions.emergency') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Alert {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: Date
  location: string
  status: 'active' | 'acknowledged' | 'dismissed' | 'resolved'
  priority?: 'low' | 'medium' | 'high'
  additionalInfo?: string
}

interface Props {
  alert: Alert
  showActions?: boolean
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showDetails: true,
})

const emit = defineEmits<{
  acknowledge: [alertId: string]
  dismiss: [alertId: string]
  viewDetails: [alertId: string]
  primaryAction: [alertId: string]
  secondaryAction: [alertId: string]
  emergency: [alertId: string]
}>()

const isLoading = ref(false)

const alertIcon = computed(() => {
  const icons = {
    motion: '👁️',
    temperature: '🌡️',
    security: '🛡️',
    equipment: '⚙️',
    weather: '🌤️',
    fire: '🔥',
    flood: '🌊',
    power: '⚡',
    network: '📡',
    access: '🚪',
  }
  return icons[props.alert.type as keyof typeof icons] || '⚠️'
})

const alertCardClass = computed(() => {
  const baseClass = 'bg-base-100'
  if (props.alert.status === 'dismissed') {
    return `${baseClass} opacity-60`
  }
  return baseClass
})

const iconColorClass = computed(() => {
  const colors = {
    low: 'text-info',
    medium: 'text-warning',
    high: 'text-error',
    critical: 'text-error',
  }
  return colors[props.alert.severity] || 'text-base-content'
})

const severityBadgeClass = computed(() => {
  const classes = {
    low: 'badge-info',
    medium: 'badge-warning',
    high: 'badge-error',
    critical: 'badge-error',
  }
  return classes[props.alert.severity] || 'badge-neutral'
})

const statusBadgeClass = computed(() => {
  const classes = {
    active: 'badge-error',
    acknowledged: 'badge-warning',
    dismissed: 'badge-neutral',
    resolved: 'badge-success',
  }
  return classes[props.alert.status] || 'badge-neutral'
})

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const handleAcknowledge = () => {
  isLoading.value = true
  emit('acknowledge', props.alert.id)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const handleDismiss = () => {
  isLoading.value = true
  emit('dismiss', props.alert.id)
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const handleViewDetails = () => {
  emit('viewDetails', props.alert.id)
}

const handlePrimaryAction = () => {
  emit('primaryAction', props.alert.id)
}

const handleSecondaryAction = () => {
  emit('secondaryAction', props.alert.id)
}

const handleEmergency = () => {
  emit('emergency', props.alert.id)
}
</script>
