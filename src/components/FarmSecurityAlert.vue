<template>
  <v-card class="elevation-3" :color="alertColor" :variant="isDismissed ? 'tonal' : 'elevated'">
    <v-card-title class="d-flex align-center">
      <v-icon :color="iconColor" class="mr-3" size="24">
        {{ alertIcon }}
      </v-icon>
      <div class="flex-grow-1">
        <h3 class="text-h6 font-weight-bold">{{ $t(alert.title) }}</h3>
        <p class="text-body-2 mb-0">{{ $t(alert.description) }}</p>
      </div>
      <v-chip :color="severityColor" size="small" class="mr-2">
        {{ $t(`alerts.severity.${alert.severity}`) }}
      </v-chip>
      <v-menu v-if="showActions">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" />
        </template>
        <v-list>
          <v-list-item @click="handleAcknowledge">
            <template #prepend>
              <v-icon>mdi-check</v-icon>
            </template>
            <v-list-item-title>{{ $t('alerts.actions.acknowledge') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleDismiss">
            <template #prepend>
              <v-icon>mdi-close</v-icon>
            </template>
            <v-list-item-title>{{ $t('alerts.actions.dismiss') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleViewDetails">
            <template #prepend>
              <v-icon>mdi-eye</v-icon>
            </template>
            <v-list-item-title>{{ $t('alerts.actions.viewDetails') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-text v-if="showDetails">
      <v-row>
        <v-col cols="12" md="6">
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-clock-outline</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.time') }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDateTime(alert.timestamp) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-map-marker</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.location') }}</v-list-item-title>
              <v-list-item-subtitle>{{ alert.location }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="alert.equipment">
              <template #prepend>
                <v-icon>mdi-tools</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.equipment') }}</v-list-item-title>
              <v-list-item-subtitle>{{ alert.equipment }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12" md="6">
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.reportedBy') }}</v-list-item-title>
              <v-list-item-subtitle>{{ alert.reportedBy }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-tag</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.category') }}</v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`alerts.categories.${alert.category}`)
              }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="alert.priority">
              <template #prepend>
                <v-icon>mdi-flag</v-icon>
              </template>
              <v-list-item-title>{{ $t('alerts.details.priority') }}</v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`alerts.priority.${alert.priority}`)
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="showActions && !isDismissed">
      <v-btn :color="primaryActionColor" variant="elevated" @click="handlePrimaryAction">
        <v-icon start>{{ primaryActionIcon }}</v-icon>
        {{ $t(primaryActionText) }}
      </v-btn>
      <v-btn color="secondary" variant="outlined" @click="handleSecondaryAction">
        {{ $t('alerts.actions.secondary') }}
      </v-btn>
      <v-spacer />
      <v-btn
        color="error"
        variant="text"
        @click="handleEmergency"
        v-if="alert.severity === 'critical'"
      >
        <v-icon start>mdi-alert-circle</v-icon>
        {{ $t('alerts.actions.emergency') }}
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <v-card-text v-if="isExpanded">
        <v-divider class="mb-4" />
        <h4 class="text-h6 mb-3">{{ $t('alerts.details.additionalInfo') }}</h4>
        <p class="text-body-2">{{ alert.additionalInfo ? $t(alert.additionalInfo) : '' }}</p>

        <v-row v-if="alert.attachments && alert.attachments.length > 0" class="mt-4">
          <v-col cols="12">
            <h5 class="text-subtitle-1 mb-2">{{ $t('alerts.details.attachments') }}</h5>
            <v-chip
              v-for="attachment in alert.attachments"
              :key="attachment.id"
              class="mr-2 mb-2"
              @click="handleAttachmentClick(attachment)"
            >
              <v-icon start>mdi-paperclip</v-icon>
              {{ attachment.name }}
            </v-chip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-expand-transition>

    <v-card-actions v-if="isExpanded">
      <v-btn variant="text" @click="isExpanded = false">
        <v-icon start>mdi-chevron-up</v-icon>
        {{ $t('alerts.actions.collapse') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

// TypeScript interfaces
interface SecurityAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'intrusion' | 'equipment' | 'weather' | 'safety' | 'maintenance'
  priority?: 'low' | 'medium' | 'high'
  timestamp: Date
  location: string
  reportedBy: string
  equipment?: string
  additionalInfo?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    url: string
  }>
  acknowledged?: boolean
  dismissed?: boolean
}

interface Props {
  alert: SecurityAlert
  showActions?: boolean
  showDetails?: boolean
  expandable?: boolean
}

interface Emits {
  (e: 'acknowledge', alertId: string): void
  (e: 'dismiss', alertId: string): void
  (e: 'view-details', alertId: string): void
  (e: 'primary-action', alertId: string): void
  (e: 'secondary-action', alertId: string): void
  (e: 'emergency', alertId: string): void
  (e: 'attachment-click', attachment: any): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  showDetails: true,
  expandable: true,
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()
const theme = useTheme()

// Reactive data
const isExpanded = ref(false)
const isDismissed = computed(() => props.alert.dismissed || false)

// Computed properties
const alertColor = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'surface'
  }
})

const iconColor = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'primary'
  }
})

const alertIcon = computed(() => {
  switch (props.alert.category) {
    case 'intrusion':
      return 'mdi-shield-alert'
    case 'equipment':
      return 'mdi-tools'
    case 'weather':
      return 'mdi-weather-windy'
    case 'safety':
      return 'mdi-alert-circle'
    case 'maintenance':
      return 'mdi-wrench'
    default:
      return 'mdi-alert'
  }
})

const severityColor = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'primary'
  }
})

const primaryActionColor = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    default:
      return 'primary'
  }
})

const primaryActionIcon = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'mdi-alert-circle'
    case 'high':
      return 'mdi-shield-alert'
    default:
      return 'mdi-check'
  }
})

const primaryActionText = computed(() => {
  switch (props.alert.severity) {
    case 'critical':
      return 'alerts.actions.respondNow'
    case 'high':
      return 'alerts.actions.investigate'
    default:
      return 'alerts.actions.acknowledge'
  }
})

// Methods
const handleAcknowledge = () => {
  emit('acknowledge', props.alert.id)
}

const handleDismiss = () => {
  emit('dismiss', props.alert.id)
}

const handleViewDetails = () => {
  emit('view-details', props.alert.id)
}

const handlePrimaryAction = () => {
  emit('primary-action', props.alert.id)
}

const handleSecondaryAction = () => {
  emit('secondary-action', props.alert.id)
}

const handleEmergency = () => {
  emit('emergency', props.alert.id)
}

const handleAttachmentClick = (attachment: any) => {
  emit('attachment-click', attachment)
}

const formatDateTime = (timestamp: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}
</script>

<i18n>
{
  "en": {
    "alerts": {
      "severity": {
        "low": "Low",
        "medium": "Medium",
        "high": "High",
        "critical": "Critical"
      },
      "categories": {
        "intrusion": "Intrusion",
        "equipment": "Equipment",
        "weather": "Weather",
        "safety": "Safety",
        "maintenance": "Maintenance"
      },
      "priority": {
        "low": "Low Priority",
        "medium": "Medium Priority",
        "high": "High Priority"
      },
      "actions": {
        "acknowledge": "Acknowledge",
        "dismiss": "Dismiss",
        "viewDetails": "View Details",
        "secondary": "More Options",
        "emergency": "Emergency Response",
        "respondNow": "Respond Now",
        "investigate": "Investigate",
        "collapse": "Collapse"
      },
      "details": {
        "time": "Time",
        "location": "Location",
        "equipment": "Equipment",
        "reportedBy": "Reported By",
        "category": "Category",
        "priority": "Priority",
        "additionalInfo": "Additional Information",
        "attachments": "Attachments"
      }
    }
  },
  "af": {
    "alerts": {
      "severity": {
        "low": "Laag",
        "medium": "Medium",
        "high": "Hoog",
        "critical": "Kritiek"
      },
      "categories": {
        "intrusion": "Indringing",
        "equipment": "Toerusting",
        "weather": "Weer",
        "safety": "Veiligheid",
        "maintenance": "Onderhoud"
      },
      "priority": {
        "low": "Laag Prioriteit",
        "medium": "Medium Prioriteit",
        "high": "Hoog Prioriteit"
      },
      "actions": {
        "acknowledge": "Erken",
        "dismiss": "Verwyder",
        "viewDetails": "Bekyk Besonderhede",
        "secondary": "Meer Opsies",
        "emergency": "Nood Reaksie",
        "respondNow": "Reageer Nou",
        "investigate": "Ondersoek",
        "collapse": "Vou In"
      },
      "details": {
        "time": "Tyd",
        "location": "Ligging",
        "equipment": "Toerusting",
        "reportedBy": "Rapporteer Deur",
        "category": "Kategorie",
        "priority": "Prioriteit",
        "additionalInfo": "Addisionele Inligting",
        "attachments": "Aanhangsel"
      }
    }
  }
}
</i18n>
