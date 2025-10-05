<template>
  <div class="container mx-auto p-4 space-y-6">
    <!-- Header Section -->
    <div class="card bg-primary text-primary-content shadow-xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-12 h-12 rounded-full">
                <img :src="logoUrl" alt="SafeNaboom Logo" />
              </div>
            </div>
            <div>
              <h1 class="text-3xl font-bold">{{ t('dashboard.title') }}</h1>
              <p class="text-lg opacity-90">{{ t('dashboard.subtitle') }}</p>
            </div>
          </div>
          <div class="badge badge-lg" :class="statusBadgeClass">
            <span class="text-lg">{{ statusIcon }}</span>
            {{ t('dashboard.status') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="card bg-base-100 shadow-lg"
        :class="stat.colorClass"
      >
        <div class="card-body text-center">
          <div class="text-4xl mb-2" :class="stat.iconColorClass">
            {{ stat.icon }}
          </div>
          <div class="text-3xl font-bold">{{ stat.value }}</div>
          <div class="text-sm opacity-70">{{ t(stat.label) }}</div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Farm Security Panel -->
      <div class="lg:col-span-2">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">
              <span class="text-2xl text-primary">🛡️</span>
              {{ t('dashboard.farmSecurity.title') }}
            </h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="alert in farmAlerts"
                  :key="alert.id"
                  class="alert"
                  :class="alert.severityClass"
                >
                  <span class="text-lg">{{ alert.icon }}</span>
                  <div>
                    <div class="font-bold">{{ alert.title }}</div>
                    <div class="text-xs">{{ alert.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Panel -->
      <div class="space-y-4">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">
              <span class="text-xl text-secondary">⚡</span>
              {{ t('dashboard.quickActions.title') }}
            </h3>
            <div class="space-y-2">
              <button
                v-for="action in quickActions"
                :key="action.key"
                class="btn btn-outline w-full justify-start"
                @click="action.action"
              >
                <span class="text-lg">{{ action.icon }}</span>
                {{ t(action.label) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Weather Panel -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">
              <span class="text-xl text-accent">🌤️</span>
              {{ t('dashboard.weather.title') }}
            </h3>
            <div class="text-center">
              <div class="text-4xl mb-2">{{ weatherIcon }}</div>
              <div class="text-2xl font-bold">{{ weather.temperature }}°C</div>
              <div class="text-sm opacity-70">{{ weather.condition }}</div>
              <div class="text-xs opacity-60 mt-2">{{ weather.location }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">
          <span class="text-2xl text-info">📊</span>
          {{ t('dashboard.recentActivity.title') }}
        </h2>
        <div class="space-y-3">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
          >
            <div class="text-2xl">{{ activity.icon }}</div>
            <div class="flex-1">
              <div class="font-medium">{{ activity.title }}</div>
              <div class="text-sm text-base-content/70">{{ activity.description }}</div>
            </div>
            <div class="text-xs text-base-content/60">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency Contacts -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">
          <span class="text-2xl text-error">🚨</span>
          {{ t('dashboard.emergencyContacts.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="contact in emergencyContacts" :key="contact.id" class="card bg-base-200">
            <div class="card-body text-center">
              <div class="text-3xl mb-2">{{ contact.icon }}</div>
              <div class="font-bold">{{ contact.name }}</div>
              <div class="text-sm opacity-70">{{ contact.role }}</div>
              <button class="btn btn-primary btn-sm mt-2 w-full">
                {{ contact.phone }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const logoUrl = '/logo.png'

// Mock data - replace with real data from stores
const status = ref('operational')
const weather = ref({
  temperature: 24,
  condition: 'Sunny',
  location: 'Naboomspruit, South Africa',
})

const stats = ref([
  {
    key: 'alerts',
    value: '3',
    label: 'dashboard.stats.activeAlerts',
    icon: '🚨',
    colorClass: 'bg-error text-error-content',
    iconColorClass: 'text-error',
  },
  {
    key: 'cameras',
    value: '12',
    label: 'dashboard.stats.cameras',
    icon: '📹',
    colorClass: 'bg-info text-info-content',
    iconColorClass: 'text-info',
  },
  {
    key: 'sensors',
    value: '8',
    label: 'dashboard.stats.sensors',
    icon: '📡',
    colorClass: 'bg-success text-success-content',
    iconColorClass: 'text-success',
  },
  {
    key: 'neighbors',
    value: '24',
    label: 'dashboard.stats.neighbors',
    icon: '👥',
    colorClass: 'bg-warning text-warning-content',
    iconColorClass: 'text-warning',
  },
])

const farmAlerts = ref([
  {
    id: 1,
    title: 'Motion Detected',
    time: '2 minutes ago',
    severity: 'warning',
    icon: '👁️',
    severityClass: 'alert-warning',
  },
  {
    id: 2,
    title: 'Gate Opened',
    time: '15 minutes ago',
    severity: 'info',
    icon: '🚪',
    severityClass: 'alert-info',
  },
  {
    id: 3,
    title: 'Temperature Alert',
    time: '1 hour ago',
    severity: 'error',
    icon: '🌡️',
    severityClass: 'alert-error',
  },
])

const quickActions = ref([
  {
    key: 'panic',
    label: 'dashboard.quickActions.panic',
    icon: '🚨',
    action: () => console.log('Panic button clicked'),
  },
  {
    key: 'camera',
    label: 'dashboard.quickActions.viewCameras',
    icon: '📹',
    action: () => console.log('View cameras clicked'),
  },
  {
    key: 'neighbors',
    label: 'dashboard.quickActions.contactNeighbors',
    icon: '👥',
    action: () => console.log('Contact neighbors clicked'),
  },
  {
    key: 'reports',
    label: 'dashboard.quickActions.generateReport',
    icon: '📊',
    action: () => console.log('Generate report clicked'),
  },
])

const recentActivity = ref([
  {
    id: 1,
    title: 'Motion detected at Gate 1',
    description: 'Security camera detected movement',
    time: '2 min ago',
    icon: '👁️',
  },
  {
    id: 2,
    title: 'Weather alert issued',
    description: 'Heavy rain expected in 2 hours',
    time: '15 min ago',
    icon: '🌧️',
  },
  {
    id: 3,
    title: 'Neighbor check-in',
    description: 'John Smith reported all clear',
    time: '1 hour ago',
    icon: '👋',
  },
])

const emergencyContacts = ref([
  {
    id: 1,
    name: 'Emergency Services',
    role: 'Police/Fire/Medical',
    phone: '10111',
    icon: '🚨',
  },
  {
    id: 2,
    name: 'Farm Security',
    role: 'Private Security',
    phone: '012 345 6789',
    icon: '🛡️',
  },
  {
    id: 3,
    name: 'Neighbor Network',
    role: 'Community Alert',
    phone: '012 345 6790',
    icon: '👥',
  },
])

const statusIcon = computed(() => {
  switch (status.value) {
    case 'operational':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return '❓'
  }
})

const statusBadgeClass = computed(() => {
  switch (status.value) {
    case 'operational':
      return 'badge-success'
    case 'warning':
      return 'badge-warning'
    case 'error':
      return 'badge-error'
    default:
      return 'badge-neutral'
  }
})

const weatherIcon = computed(() => {
  const temp = weather.value.temperature
  if (temp > 30) return '🌞'
  if (temp > 20) return '☀️'
  if (temp > 10) return '⛅'
  return '❄️'
})
</script>
