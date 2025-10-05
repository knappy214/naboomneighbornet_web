<template>
  <div class="container mx-auto p-4 space-y-6">
    <!-- Page Header -->
    <div class="card bg-primary text-primary-content shadow-xl">
      <div class="card-body">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="avatar">
              <div class="w-16 h-16 rounded-full">
                <img :src="logoUrl" alt="SafeNaboom Logo" />
              </div>
            </div>
            <div>
              <h1 class="text-4xl font-bold">{{ t('safenaboom.title') }}</h1>
              <p class="text-xl opacity-90">{{ t('safenaboom.subtitle') }}</p>
            </div>
          </div>
          <div class="badge badge-lg bg-white text-primary">
            <span class="text-lg">🛡️</span>
            {{ t('safenaboom.status') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Dashboard and Alerts -->
      <div class="lg:col-span-2 space-y-6">
        <!-- SafeNaboom Dashboard -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">
              <span class="text-2xl text-primary">📊</span>
              {{ t('safenaboom.dashboard.title') }}
            </h2>
            <SafeNaboomDashboard
              :farm-id="farmId"
              :show-stats="true"
              @alert-created="handleAlertCreated"
              @quick-action="handleQuickAction"
              @view-details="handleViewDetails"
            />
          </div>
        </div>

        <!-- Farm Security Alerts -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <div class="flex items-center justify-between mb-4">
              <h2 class="card-title text-xl">
                <span class="text-2xl text-error">🚨</span>
                {{ t('safenaboom.alerts.title') }}
              </h2>
              <button class="btn btn-primary btn-sm" @click="handleCreateAlert">
                <span class="text-lg">➕</span>
                {{ t('safenaboom.alerts.create') }}
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="alert in securityAlerts" :key="alert.id" class="card bg-base-200">
                <FarmSecurityAlert
                  :alert="alert"
                  :show-actions="true"
                  :show-details="true"
                  @acknowledge="handleAcknowledgeAlert"
                  @dismiss="handleDismissAlert"
                  @view-details="handleViewAlertDetails"
                  @primary-action="handlePrimaryAction"
                  @secondary-action="handleSecondaryAction"
                  @emergency="handleEmergency"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Communication and Monitoring -->
      <div class="space-y-6">
        <!-- Neighbor Communication -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">
              <span class="text-2xl text-info">👥</span>
              {{ t('safenaboom.communication.title') }}
            </h2>
            <NeighborCommunication
              :farm-id="farmId"
              :show-composer="true"
              @new-message="handleNewMessage"
              @message-click="handleMessageClick"
              @message-neighbor="handleMessageNeighbor"
              @send-message="handleSendMessage"
              @reply="handleReply"
              @delete-message="handleDeleteMessage"
            />
          </div>
        </div>

        <!-- Equipment Monitoring -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">
              <span class="text-2xl text-warning">⚙️</span>
              {{ t('safenaboom.equipment.title') }}
            </h2>
            <EquipmentMonitoring
              :farm-id="farmId"
              :show-controls="true"
              @equipment-status="handleEquipmentStatus"
              @maintenance-alert="handleMaintenanceAlert"
              @control-equipment="handleControlEquipment"
              @schedule-maintenance="handleScheduleMaintenance"
            />
          </div>
        </div>

        <!-- Weather Monitoring -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-xl mb-4">
              <span class="text-2xl text-accent">🌤️</span>
              {{ t('safenaboom.weather.title') }}
            </h2>
            <WeatherMonitoring
              :farm-id="farmId"
              :show-forecast="true"
              @weather-alert="handleWeatherAlert"
              @forecast-update="handleForecastUpdate"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency Actions -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">
          <span class="text-2xl text-error">🚨</span>
          {{ t('safenaboom.emergency.title') }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button class="btn btn-error btn-lg" @click="handleEmergencyPanic">
            <span class="text-2xl">🚨</span>
            {{ t('safenaboom.emergency.panic') }}
          </button>
          <button class="btn btn-warning btn-lg" @click="handleEmergencyAlert">
            <span class="text-2xl">⚠️</span>
            {{ t('safenaboom.emergency.alert') }}
          </button>
          <button class="btn btn-info btn-lg" @click="handleEmergencyContact">
            <span class="text-2xl">📞</span>
            {{ t('safenaboom.emergency.contact') }}
          </button>
          <button class="btn btn-secondary btn-lg" @click="handleEmergencyReport">
            <span class="text-2xl">📋</span>
            {{ t('safenaboom.emergency.report') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">
          <span class="text-2xl text-info">📊</span>
          {{ t('safenaboom.activity.title') }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import SafeNaboomDashboard from '@/components/SafeNaboomDashboard.vue'
import FarmSecurityAlert from '@/components/FarmSecurityAlert.vue'
import NeighborCommunication from '@/components/NeighborCommunication.vue'
import EquipmentMonitoring from '@/components/EquipmentMonitoring.vue'
import WeatherMonitoring from '@/components/WeatherMonitoring.vue'

const { t } = useI18n()

// Props
const props = defineProps<{
  farmId?: string
}>()

// Mock data - replace with real data from stores
const farmId = ref(props.farmId || 'farm-001')
const logoUrl = '/logo.png'

const securityAlerts = ref([
  {
    id: 1,
    type: 'motion',
    severity: 'high',
    title: 'Motion Detected',
    description: 'Unusual movement detected at Gate 1',
    timestamp: new Date(),
    location: 'Gate 1',
    status: 'active',
  },
  {
    id: 2,
    type: 'temperature',
    severity: 'medium',
    title: 'Temperature Alert',
    description: 'High temperature detected in storage area',
    timestamp: new Date(Date.now() - 3600000),
    location: 'Storage Area',
    status: 'acknowledged',
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

// Event handlers
const handleAlertCreated = (alert: any) => {
  console.log('Alert created:', alert)
}

const handleQuickAction = (action: string) => {
  console.log('Quick action:', action)
}

const handleViewDetails = (details: any) => {
  console.log('View details:', details)
}

const handleCreateAlert = () => {
  console.log('Create alert')
}

const handleAcknowledgeAlert = (alertId: string) => {
  console.log('Acknowledge alert:', alertId)
}

const handleDismissAlert = (alertId: string) => {
  console.log('Dismiss alert:', alertId)
}

const handleViewAlertDetails = (alertId: string) => {
  console.log('View alert details:', alertId)
}

const handlePrimaryAction = (alertId: string) => {
  console.log('Primary action for alert:', alertId)
}

const handleSecondaryAction = (alertId: string) => {
  console.log('Secondary action for alert:', alertId)
}

const handleEmergency = (alertId: string) => {
  console.log('Emergency for alert:', alertId)
}

const handleNewMessage = (message: any) => {
  console.log('New message:', message)
}

const handleMessageClick = (messageId: string) => {
  console.log('Message click:', messageId)
}

const handleMessageNeighbor = (neighbor: any) => {
  console.log('Message neighbor:', neighbor)
}

const handleSendMessage = (message: any) => {
  console.log('Send message:', message)
}

const handleReply = (messageId: string) => {
  console.log('Reply to message:', messageId)
}

const handleDeleteMessage = (messageId: string) => {
  console.log('Delete message:', messageId)
}

const handleEquipmentStatus = (equipment: any) => {
  console.log('Equipment status:', equipment)
}

const handleMaintenanceAlert = (equipment: any) => {
  console.log('Maintenance alert:', equipment)
}

const handleControlEquipment = (equipment: any) => {
  console.log('Control equipment:', equipment)
}

const handleScheduleMaintenance = (equipment: any) => {
  console.log('Schedule maintenance:', equipment)
}

const handleWeatherAlert = (alert: any) => {
  console.log('Weather alert:', alert)
}

const handleForecastUpdate = (forecast: any) => {
  console.log('Forecast update:', forecast)
}

const handleEmergencyPanic = () => {
  console.log('Emergency panic button pressed')
}

const handleEmergencyAlert = () => {
  console.log('Emergency alert button pressed')
}

const handleEmergencyContact = () => {
  console.log('Emergency contact button pressed')
}

const handleEmergencyReport = () => {
  console.log('Emergency report button pressed')
}

onMounted(() => {
  // Initialize component
  console.log('SafeNaboom page mounted')
})
</script>
