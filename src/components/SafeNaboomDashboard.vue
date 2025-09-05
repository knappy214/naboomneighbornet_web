<template>
  <v-container fluid>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="elevation-4" :color="themeColor">
          <v-card-title class="d-flex align-center">
            <v-avatar class="mr-4" size="48">
              <v-img :src="logoUrl" alt="SafeNaboom Logo" />
            </v-avatar>
            <div>
              <h1 class="text-h4 font-weight-bold">{{ $t('dashboard.title') }}</h1>
              <p class="text-subtitle-1 mb-0">{{ $t('dashboard.subtitle') }}</p>
            </div>
            <v-spacer />
            <v-chip :color="statusColor" size="large" class="mr-2">
              <v-icon start>{{ statusIcon }}</v-icon>
              {{ $t('dashboard.status') }}
            </v-chip>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col v-for="stat in stats" :key="stat.key" cols="12" sm="6" md="3">
        <v-card class="elevation-2" :color="stat.color" height="120">
          <v-card-text class="d-flex flex-column justify-center align-center text-center">
            <v-icon :color="stat.iconColor" size="32" class="mb-2">
              {{ stat.icon }}
            </v-icon>
            <div class="text-h4 font-weight-bold">{{ stat.value }}</div>
            <div class="text-caption">{{ $t(stat.label) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row>
      <!-- Farm Security Panel -->
      <v-col cols="12" md="8">
        <v-card class="elevation-2" height="400">
          <v-card-title>
            <v-icon class="mr-2" color="primary">mdi-shield-check</v-icon>
            {{ $t('dashboard.farmSecurity.title') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="alert in securityAlerts"
                :key="alert.id"
                :prepend-icon="alert.icon"
                :title="$t(alert.title)"
                :subtitle="$t(alert.subtitle)"
              >
                <template #append>
                  <v-chip
                    :color="
                      alert.severity === 'high'
                        ? 'error'
                        : alert.severity === 'medium'
                          ? 'warning'
                          : 'success'
                    "
                    size="small"
                  >
                    {{ $t(`dashboard.farmSecurity.severity.${alert.severity}`) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="outlined">
              <v-icon start>mdi-plus</v-icon>
              {{ $t('dashboard.farmSecurity.addAlert') }}
            </v-btn>
            <v-spacer />
            <v-btn color="secondary" variant="text">
              {{ $t('dashboard.farmSecurity.viewAll') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Quick Actions Panel -->
      <v-col cols="12" md="4">
        <v-card class="elevation-2" height="400">
          <v-card-title>
            <v-icon class="mr-2" color="accent">mdi-lightning-bolt</v-icon>
            {{ $t('dashboard.quickActions.title') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="action in quickActions"
                :key="action.key"
                :prepend-icon="action.icon"
                :title="$t(action.title)"
                :subtitle="$t(action.subtitle)"
                @click="handleQuickAction(action.key)"
                class="cursor-pointer"
              >
                <template #append>
                  <v-icon>mdi-chevron-right</v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="elevation-2">
          <v-card-title>
            <v-icon class="mr-2" color="info">mdi-history</v-icon>
            {{ $t('dashboard.recentActivity.title') }}
          </v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <template #icon>
                  <v-icon :color="activity.color" size="16">
                    {{ activity.icon }}
                  </v-icon>
                </template>
                <div>
                  <div class="text-body-2 font-weight-medium">
                    {{ $t(activity.title) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatTime(activity.timestamp) }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

// TypeScript interfaces
interface StatItem {
  key: string
  value: string | number
  label: string
  color: string
  icon: string
  iconColor: string
}

interface DashboardSecurityAlert {
  id: string
  title: string
  subtitle: string
  icon: string
  severity: 'low' | 'medium' | 'high'
}

interface QuickAction {
  key: string
  title: string
  subtitle: string
  icon: string
}

interface Activity {
  id: string
  title: string
  timestamp: Date
  icon: string
  color: string
}

// Props and emits
interface Props {
  farmId?: string
  showStats?: boolean
}

interface Emits {
  (e: 'alert-created', alert: DashboardSecurityAlert): void
  (e: 'quick-action', action: string): void
  (e: 'view-details', itemId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  farmId: '',
  showStats: true,
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()
const theme = useTheme()

// Reactive data
const logoUrl = '/logo.png'
const isOnline = ref(true)

// Computed properties
const themeColor = computed(() => (theme.current.value.dark ? 'surface' : 'primary'))
const statusColor = computed(() => (isOnline.value ? 'success' : 'error'))
const statusIcon = computed(() => (isOnline.value ? 'mdi-wifi' : 'mdi-wifi-off'))

const stats = computed<StatItem[]>(() => [
  {
    key: 'farms',
    value: 12,
    label: 'dashboard.stats.farms',
    color: 'primary',
    icon: 'mdi-home-group',
    iconColor: 'primary',
  },
  {
    key: 'alerts',
    value: 3,
    label: 'dashboard.stats.alerts',
    color: 'warning',
    icon: 'mdi-alert',
    iconColor: 'warning',
  },
  {
    key: 'neighbors',
    value: 8,
    label: 'dashboard.stats.neighbors',
    color: 'info',
    icon: 'mdi-account-group',
    iconColor: 'info',
  },
  {
    key: 'uptime',
    value: '99.9%',
    label: 'dashboard.stats.uptime',
    color: 'success',
    icon: 'mdi-timer',
    iconColor: 'success',
  },
])

const securityAlerts = computed<DashboardSecurityAlert[]>(() => [
  {
    id: '1',
    title: 'dashboard.farmSecurity.alerts.intrusion',
    subtitle: 'dashboard.farmSecurity.alerts.intrusionDesc',
    icon: 'mdi-shield-alert',
    severity: 'high',
  },
  {
    id: '2',
    title: 'dashboard.farmSecurity.alerts.equipment',
    subtitle: 'dashboard.farmSecurity.alerts.equipmentDesc',
    icon: 'mdi-tools',
    severity: 'medium',
  },
  {
    id: '3',
    title: 'dashboard.farmSecurity.alerts.weather',
    subtitle: 'dashboard.farmSecurity.alerts.weatherDesc',
    icon: 'mdi-weather-windy',
    severity: 'low',
  },
])

const quickActions = computed<QuickAction[]>(() => [
  {
    key: 'emergency',
    title: 'dashboard.quickActions.emergency',
    subtitle: 'dashboard.quickActions.emergencyDesc',
    icon: 'mdi-alert-circle',
  },
  {
    key: 'report',
    title: 'dashboard.quickActions.report',
    subtitle: 'dashboard.quickActions.reportDesc',
    icon: 'mdi-file-document',
  },
  {
    key: 'neighbors',
    title: 'dashboard.quickActions.neighbors',
    subtitle: 'dashboard.quickActions.neighborsDesc',
    icon: 'mdi-account-group',
  },
  {
    key: 'settings',
    title: 'dashboard.quickActions.settings',
    subtitle: 'dashboard.quickActions.settingsDesc',
    icon: 'mdi-cog',
  },
])

const recentActivities = computed<Activity[]>(() => [
  {
    id: '1',
    title: 'dashboard.recentActivity.farmJoined',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: 'mdi-account-plus',
    color: 'success',
  },
  {
    id: '2',
    title: 'dashboard.recentActivity.alertResolved',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: 'mdi-check-circle',
    color: 'info',
  },
  {
    id: '3',
    title: 'dashboard.recentActivity.equipmentUpdated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    icon: 'mdi-tools',
    color: 'warning',
  },
])

// Methods
const handleQuickAction = (actionKey: string) => {
  emit('quick-action', actionKey)
}

const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return t('dashboard.recentActivity.timeAgo.minutes', { count: minutes })
  } else if (hours < 24) {
    return t('dashboard.recentActivity.timeAgo.hours', { count: hours })
  } else {
    return t('dashboard.recentActivity.timeAgo.days', { count: days })
  }
}
</script>

<i18n>
{
  "en": {
    "dashboard": {
      "title": "SafeNaboom Dashboard",
      "subtitle": "Your agricultural community security hub",
      "status": "Online",
      "stats": {
        "farms": "Connected Farms",
        "alerts": "Active Alerts",
        "neighbors": "Neighbors Online",
        "uptime": "System Uptime"
      },
      "farmSecurity": {
        "title": "Farm Security",
        "addAlert": "Add Alert",
        "viewAll": "View All",
        "severity": {
          "low": "Low",
          "medium": "Medium",
          "high": "High"
        },
        "alerts": {
          "intrusion": "Intrusion Detected",
          "intrusionDesc": "Motion detected in restricted area",
          "equipment": "Equipment Alert",
          "equipmentDesc": "Irrigation system needs attention",
          "weather": "Weather Warning",
          "weatherDesc": "High winds expected tonight"
        }
      },
      "quickActions": {
        "title": "Quick Actions",
        "emergency": "Emergency Alert",
        "emergencyDesc": "Send emergency notification",
        "report": "File Report",
        "reportDesc": "Report suspicious activity",
        "neighbors": "Contact Neighbors",
        "neighborsDesc": "Send message to nearby farms",
        "settings": "Settings",
        "settingsDesc": "Configure your preferences"
      },
      "recentActivity": {
        "title": "Recent Activity",
        "farmJoined": "New farm joined the network",
        "alertResolved": "Security alert resolved",
        "equipmentUpdated": "Equipment status updated",
        "timeAgo": {
          "minutes": "{count} minutes ago",
          "hours": "{count} hours ago",
          "days": "{count} days ago"
        }
      }
    }
  },
  "af": {
    "dashboard": {
      "title": "SafeNaboom Dashboard",
      "subtitle": "Jou landbou gemeenskap sekuriteit sentrum",
      "status": "Aanlyn",
      "stats": {
        "farms": "Verbindde Plase",
        "alerts": "Aktiewe Waarskuwings",
        "bure": "Bure Aanlyn",
        "uptime": "Stelsel Bedryfstyd"
      },
      "farmSecurity": {
        "title": "Plaas Sekuriteit",
        "addAlert": "Voeg Waarskuwing By",
        "viewAll": "Bekyk Alles",
        "severity": {
          "low": "Laag",
          "medium": "Medium",
          "high": "Hoog"
        },
        "alerts": {
          "intrusion": "Indringing Bespeur",
          "intrusionDesc": "Beweging bespeur in beperkte area",
          "equipment": "Toerusting Waarskuwing",
          "equipmentDesc": "Besproeiing stelsel benodig aandag",
          "weather": "Weer Waarskuwing",
          "weatherDesc": "Hoë winde verwag vanaand"
        }
      },
      "quickActions": {
        "title": "Vinnige Aksies",
        "emergency": "Nood Waarskuwing",
        "emergencyDesc": "Stuur nood kennisgewing",
        "report": "Lêer Verslag",
        "reportDesc": "Rapporteer verdagte aktiwiteit",
        "neighbors": "Kontak Bure",
        "neighborsDesc": "Stuur boodskap aan nabye plase",
        "settings": "Instellings",
        "settingsDesc": "Konfigureer jou voorkeure"
      },
      "recentActivity": {
        "title": "Onlangse Aktiwiteit",
        "farmJoined": "Nuwe plaas by die netwerk aangesluit",
        "alertResolved": "Sekuriteit waarskuwing opgelos",
        "equipmentUpdated": "Toerusting status opdateer",
        "timeAgo": {
          "minutes": "{count} minute gelede",
          "hours": "{count} ure gelede",
          "days": "{count} dae gelede"
        }
      }
    }
  }
}
</i18n>
