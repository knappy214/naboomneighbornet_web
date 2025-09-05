<template>
  <v-container fluid>
    <!-- Page Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="elevation-4" color="primary">
          <v-card-title class="d-flex align-center text-white">
            <v-avatar class="mr-4" size="64">
              <v-img :src="logoUrl" alt="SafeNaboom Logo" />
            </v-avatar>
            <div>
              <h1 class="text-h3 font-weight-bold">{{ $t('safenaboom.title') }}</h1>
              <p class="text-h6 mb-0">{{ $t('safenaboom.subtitle') }}</p>
            </div>
            <v-spacer />
            <v-chip color="white" size="large" class="mr-2">
              <v-icon start>mdi-shield-check</v-icon>
              {{ $t('safenaboom.status') }}
            </v-chip>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Dashboard Grid -->
    <v-row>
      <!-- Left Column - Dashboard and Alerts -->
      <v-col cols="12" lg="8">
        <!-- SafeNaboom Dashboard -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-view-dashboard</v-icon>
            {{ $t('safenaboom.dashboard.title') }}
          </v-card-title>
          <v-card-text>
            <SafeNaboomDashboard
              :farm-id="farmId"
              :show-stats="true"
              @alert-created="handleAlertCreated"
              @quick-action="handleQuickAction"
              @view-details="handleViewDetails"
            />
          </v-card-text>
        </v-card>

        <!-- Farm Security Alerts -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="mr-2" color="error">mdi-shield-alert</v-icon>
            {{ $t('safenaboom.alerts.title') }}
            <v-spacer />
            <v-btn color="primary" variant="outlined" size="small" @click="handleCreateAlert">
              <v-icon start>mdi-plus</v-icon>
              {{ $t('safenaboom.alerts.create') }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="alert in securityAlerts" :key="alert.id" cols="12" md="6">
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
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column - Communication and Monitoring -->
      <v-col cols="12" lg="4">
        <!-- Neighbor Communication -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="mr-2" color="info">mdi-account-group</v-icon>
            {{ $t('safenaboom.communication.title') }}
          </v-card-title>
          <v-card-text>
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
          </v-card-text>
        </v-card>

        <!-- Equipment Monitoring -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="mr-2" color="warning">mdi-tools</v-icon>
            {{ $t('safenaboom.equipment.title') }}
          </v-card-title>
          <v-card-text>
            <EquipmentMonitoring
              :farm-id="farmId"
              :show-add-button="true"
              @add-equipment="handleAddEquipment"
              @view-details="handleEquipmentDetails"
              @schedule-maintenance="handleScheduleMaintenance"
              @report-issue="handleReportIssue"
              @more-actions="handleEquipmentActions"
            />
          </v-card-text>
        </v-card>

        <!-- Weather Monitoring -->
        <v-card class="mb-6" elevation="2">
          <v-card-title>
            <v-icon class="mr-2" color="success">mdi-weather-cloudy</v-icon>
            {{ $t('safenaboom.weather.title') }}
          </v-card-title>
          <v-card-text>
            <WeatherMonitoring
              :farm-id="farmId"
              :auto-refresh="true"
              :refresh-interval="300000"
              @refresh="handleWeatherRefresh"
              @alert-clicked="handleWeatherAlert"
              @recommendation-clicked="handleWeatherRecommendation"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions Floating Button -->
    <v-fab v-model="showQuickActions" location="bottom end" size="large" color="primary">
      <v-icon>mdi-plus</v-icon>
      <v-fab
        v-for="action in quickActions"
        :key="action.key"
        :color="action.color"
        size="small"
        location="top"
        @click="handleQuickAction(action.key)"
      >
        <v-icon>{{ action.icon }}</v-icon>
      </v-fab>
    </v-fab>

    <!-- Emergency Alert Dialog -->
    <v-dialog v-model="showEmergencyDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error">mdi-alert-circle</v-icon>
          {{ $t('safenaboom.emergency.title') }}
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="emergencyMessage"
            :label="$t('safenaboom.emergency.message')"
            :placeholder="$t('safenaboom.emergency.placeholder')"
            variant="outlined"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="error"
            variant="elevated"
            :disabled="!emergencyMessage.trim()"
            @click="handleSendEmergency"
          >
            <v-icon start>mdi-send</v-icon>
            {{ $t('safenaboom.emergency.send') }}
          </v-btn>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showEmergencyDialog = false">
            {{ $t('safenaboom.emergency.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SafeNaboomDashboard from '@/components/SafeNaboomDashboard.vue'
import FarmSecurityAlert from '@/components/FarmSecurityAlert.vue'
import NeighborCommunication from '@/components/NeighborCommunication.vue'
import EquipmentMonitoring from '@/components/EquipmentMonitoring.vue'
import WeatherMonitoring from '@/components/WeatherMonitoring.vue'

// TypeScript interfaces
interface SafeNaboomSecurityAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'intrusion' | 'equipment' | 'weather' | 'safety' | 'maintenance'
  timestamp: Date
  location: string
  reportedBy: string
  acknowledged?: boolean
  dismissed?: boolean
}

interface QuickAction {
  key: string
  title: string
  icon: string
  color: string
}

interface Props {
  farmId?: string
}

interface Emits {
  (e: 'emergency-alert', message: string): void
  (e: 'alert-created', alert: SafeNaboomSecurityAlert): void
  (e: 'equipment-added'): void
  (e: 'message-sent', content: string): void
}

const props = withDefaults(defineProps<Props>(), {
  farmId: 'default-farm',
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()

// Reactive data
const logoUrl = '/logo.png'
const showQuickActions = ref(false)
const showEmergencyDialog = ref(false)
const emergencyMessage = ref('')

// Mock data
const securityAlerts = computed<SafeNaboomSecurityAlert[]>(() => [
  {
    id: '1',
    title: 'Intrusion Detected',
    description: 'Motion detected in restricted area near the eastern fence',
    severity: 'high',
    category: 'intrusion',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    location: 'Eastern Fence',
    reportedBy: 'Security System',
    acknowledged: false,
    dismissed: false,
  },
  {
    id: '2',
    title: 'Equipment Malfunction',
    description: 'Irrigation system pump showing unusual pressure readings',
    severity: 'medium',
    category: 'equipment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    location: 'Field B',
    reportedBy: 'Equipment Monitor',
    acknowledged: true,
    dismissed: false,
  },
  {
    id: '3',
    title: 'Weather Warning',
    description: 'Heavy rainfall expected this evening. Secure outdoor equipment.',
    severity: 'low',
    category: 'weather',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    location: 'Farm Wide',
    reportedBy: 'Weather Service',
    acknowledged: false,
    dismissed: false,
  },
])

const quickActions = computed<QuickAction[]>(() => [
  {
    key: 'emergency',
    title: t('safenaboom.quickActions.emergency'),
    icon: 'mdi-alert-circle',
    color: 'error',
  },
  {
    key: 'report',
    title: t('safenaboom.quickActions.report'),
    icon: 'mdi-file-document',
    color: 'warning',
  },
  {
    key: 'neighbors',
    title: t('safenaboom.quickActions.neighbors'),
    icon: 'mdi-account-group',
    color: 'info',
  },
  {
    key: 'equipment',
    title: t('safenaboom.quickActions.equipment'),
    icon: 'mdi-tools',
    color: 'primary',
  },
])

// Event handlers
const handleAlertCreated = (alert: any) => {
  // Convert DashboardSecurityAlert to SafeNaboomSecurityAlert
  const convertedAlert: SafeNaboomSecurityAlert = {
    id: alert.id,
    title: alert.title,
    description: alert.subtitle,
    severity: alert.severity,
    category: 'safety',
    timestamp: new Date(),
    location: 'Farm',
    reportedBy: 'System',
  }
  emit('alert-created', convertedAlert)
}

const handleQuickAction = (actionKey: string) => {
  switch (actionKey) {
    case 'emergency':
      showEmergencyDialog.value = true
      break
    case 'report':
      // Handle report action
      break
    case 'neighbors':
      // Handle neighbors action
      break
    case 'equipment':
      // Handle equipment action
      break
  }
}

const handleViewDetails = (itemId: string) => {
  // Handle view details
}

const handleCreateAlert = () => {
  // Handle create alert
}

const handleAcknowledgeAlert = (alertId: string) => {
  // Handle acknowledge alert
}

const handleDismissAlert = (alertId: string) => {
  // Handle dismiss alert
}

const handleViewAlertDetails = (alertId: string) => {
  // Handle view alert details
}

const handlePrimaryAction = (alertId: string) => {
  // Handle primary action
}

const handleSecondaryAction = (alertId: string) => {
  // Handle secondary action
}

const handleEmergency = (alertId: string) => {
  // Handle emergency
}

const handleNewMessage = () => {
  // Handle new message
}

const handleMessageClick = (message: any) => {
  // Handle message click
}

const handleMessageNeighbor = (neighbor: any) => {
  // Handle message neighbor
}

const handleSendMessage = (content: string) => {
  emit('message-sent', content)
}

const handleReply = (message: any) => {
  // Handle reply
}

const handleDeleteMessage = (messageId: string) => {
  // Handle delete message
}

const handleAddEquipment = () => {
  emit('equipment-added')
}

const handleEquipmentDetails = (equipment: any) => {
  // Handle equipment details
}

const handleScheduleMaintenance = (equipment: any) => {
  // Handle schedule maintenance
}

const handleReportIssue = (equipment: any) => {
  // Handle report issue
}

const handleEquipmentActions = (equipment: any) => {
  // Handle equipment actions
}

const handleWeatherRefresh = () => {
  // Handle weather refresh
}

const handleWeatherAlert = (alert: any) => {
  // Handle weather alert
}

const handleWeatherRecommendation = (recommendation: any) => {
  // Handle weather recommendation
}

const handleSendEmergency = () => {
  if (emergencyMessage.value.trim()) {
    emit('emergency-alert', emergencyMessage.value)
    emergencyMessage.value = ''
    showEmergencyDialog.value = false
  }
}
</script>

<i18n>
{
  "en": {
    "safenaboom": {
      "title": "SafeNaboom",
      "subtitle": "Agricultural Community Security Platform",
      "status": "Active",
      "dashboard": {
        "title": "Farm Dashboard"
      },
      "alerts": {
        "title": "Security Alerts",
        "create": "Create Alert"
      },
      "communication": {
        "title": "Neighbor Communication"
      },
      "equipment": {
        "title": "Equipment Monitoring"
      },
      "weather": {
        "title": "Weather Monitoring"
      },
      "quickActions": {
        "emergency": "Emergency Alert",
        "report": "File Report",
        "neighbors": "Contact Neighbors",
        "equipment": "Equipment Status"
      },
      "emergency": {
        "title": "Emergency Alert",
        "message": "Emergency Message",
        "placeholder": "Describe the emergency situation...",
        "send": "Send Alert",
        "cancel": "Cancel"
      }
    }
  },
  "af": {
    "safenaboom": {
      "title": "SafeNaboom",
      "subtitle": "Landbou Gemeenskap Sekuriteit Platform",
      "status": "Aktief",
      "dashboard": {
        "title": "Plaas Dashboard"
      },
      "alerts": {
        "title": "Sekuriteit Waarskuwings",
        "create": "Skep Waarskuwing"
      },
      "communication": {
        "title": "Buur Kommunikasie"
      },
      "equipment": {
        "title": "Toerusting Monitering"
      },
      "weather": {
        "title": "Weer Monitering"
      },
      "quickActions": {
        "emergency": "Nood Waarskuwing",
        "report": "Lêer Verslag",
        "neighbors": "Kontak Bure",
        "equipment": "Toerusting Status"
      },
      "emergency": {
        "title": "Nood Waarskuwing",
        "message": "Nood Boodskap",
        "placeholder": "Beskryf die nood situasie...",
        "send": "Stuur Waarskuwing",
        "cancel": "Kanselleer"
      }
    }
  }
}
</i18n>
