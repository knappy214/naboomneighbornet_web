<template>
  <v-card class="elevation-2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-tools</v-icon>
      {{ $t('equipment.title') }}
      <v-spacer />
      <v-btn color="primary" variant="outlined" size="small" @click="handleAddEquipment">
        <v-icon start>mdi-plus</v-icon>
        {{ $t('equipment.addEquipment') }}
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Equipment Status Overview -->
      <v-row class="mb-4">
        <v-col v-for="status in equipmentStatus" :key="status.key" cols="6" sm="3">
          <v-card :color="status.color" variant="tonal" class="text-center">
            <v-card-text>
              <v-icon :color="status.iconColor" size="32" class="mb-2">
                {{ status.icon }}
              </v-icon>
              <div class="text-h5 font-weight-bold">{{ status.count }}</div>
              <div class="text-caption">{{ $t(status.label) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Equipment List -->
      <v-data-table
        :headers="headers"
        :items="equipmentList"
        :items-per-page="10"
        class="elevation-1"
        :loading="isLoading"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" class="mr-3">
              <v-img :src="item.image" :alt="item.name" />
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.model }}</div>
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small">
            <v-icon start size="12">{{ getStatusIcon(item.status) }}</v-icon>
            {{ $t(`equipment.status.${item.status}`) }}
          </v-chip>
        </template>

        <template #item.health="{ item }">
          <div class="d-flex align-center">
            <v-progress-linear
              :model-value="item.health"
              :color="getHealthColor(item.health)"
              height="8"
              rounded
              class="mr-2"
              style="width: 60px"
            />
            <span class="text-caption">{{ item.health }}%</span>
          </div>
        </template>

        <template #item.lastMaintenance="{ item }">
          <div>
            <div class="text-body-2">{{ formatDate(item.lastMaintenance) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ getDaysSinceMaintenance(item.lastMaintenance) }}
            </div>
          </div>
        </template>

        <template #item.nextMaintenance="{ item }">
          <div>
            <div class="text-body-2">{{ formatDate(item.nextMaintenance) }}</div>
            <div class="text-caption" :class="getMaintenanceUrgency(item.nextMaintenance)">
              {{ getDaysUntilMaintenance(item.nextMaintenance) }}
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" size="small" variant="text" @click="handleViewDetails(item)" />
          <v-btn
            icon="mdi-wrench"
            size="small"
            variant="text"
            @click="handleScheduleMaintenance(item)"
          />
          <v-btn
            icon="mdi-dots-vertical"
            size="small"
            variant="text"
            @click="handleMoreActions(item)"
          />
        </template>
      </v-data-table>

      <!-- Equipment Detail Dialog -->
      <v-dialog v-model="showDetailDialog" max-width="800">
        <v-card v-if="selectedEquipment">
          <v-card-title class="d-flex align-center">
            <v-avatar class="mr-3" size="48">
              <v-img :src="selectedEquipment.image" :alt="selectedEquipment.name" />
            </v-avatar>
            <div>
              <h3 class="text-h6">{{ selectedEquipment.name }}</h3>
              <p class="text-caption mb-0">{{ selectedEquipment.model }}</p>
            </div>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="showDetailDialog = false" />
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-tag</v-icon>
                    </template>
                    <v-list-item-title>{{
                      $t('equipment.details.serialNumber')
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      selectedEquipment.serialNumber
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>{{
                      $t('equipment.details.purchaseDate')
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(selectedEquipment.purchaseDate)
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-map-marker</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('equipment.details.location') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ selectedEquipment.location }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-heart-pulse</v-icon>
                    </template>
                    <v-list-item-title>{{ $t('equipment.details.health') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :model-value="selectedEquipment.health"
                        :color="getHealthColor(selectedEquipment.health)"
                        height="8"
                        rounded
                        class="mt-1"
                      />
                      {{ selectedEquipment.health }}%
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-wrench</v-icon>
                    </template>
                    <v-list-item-title>{{
                      $t('equipment.details.lastMaintenance')
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(selectedEquipment.lastMaintenance)
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template #prepend>
                      <v-icon>mdi-calendar-clock</v-icon>
                    </template>
                    <v-list-item-title>{{
                      $t('equipment.details.nextMaintenance')
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      formatDate(selectedEquipment.nextMaintenance)
                    }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Maintenance History -->
            <v-divider class="my-4" />
            <h4 class="text-h6 mb-3">{{ $t('equipment.details.maintenanceHistory') }}</h4>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="maintenance in selectedEquipment.maintenanceHistory"
                :key="maintenance.id"
                :dot-color="maintenance.type === 'scheduled' ? 'primary' : 'warning'"
                size="small"
              >
                <template #icon>
                  <v-icon
                    :color="maintenance.type === 'scheduled' ? 'primary' : 'warning'"
                    size="16"
                  >
                    {{ maintenance.type === 'scheduled' ? 'mdi-calendar-check' : 'mdi-wrench' }}
                  </v-icon>
                </template>
                <div>
                  <div class="text-body-2 font-weight-medium">
                    {{ $t(`equipment.maintenance.${maintenance.type}`) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ maintenance.description }}
                  </div>
                  <div class="text-caption">
                    {{ formatDate(maintenance.date) }} - {{ maintenance.technician }}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="primary"
              variant="outlined"
              @click="handleScheduleMaintenance(selectedEquipment)"
            >
              <v-icon start>mdi-calendar-plus</v-icon>
              {{ $t('equipment.scheduleMaintenance') }}
            </v-btn>
            <v-spacer />
            <v-btn color="error" variant="text" @click="handleReportIssue(selectedEquipment)">
              <v-icon start>mdi-alert</v-icon>
              {{ $t('equipment.reportIssue') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// TypeScript interfaces
interface Equipment {
  id: string
  name: string
  model: string
  serialNumber: string
  type: 'tractor' | 'irrigation' | 'harvester' | 'sprayer' | 'other'
  status: 'operational' | 'maintenance' | 'warning' | 'error' | 'offline'
  health: number
  location: string
  purchaseDate: Date
  lastMaintenance: Date
  nextMaintenance: Date
  image: string
  maintenanceHistory: MaintenanceRecord[]
}

interface MaintenanceRecord {
  id: string
  type: 'scheduled' | 'emergency'
  date: Date
  description: string
  technician: string
  cost?: number
}

interface Props {
  farmId?: string
  showAddButton?: boolean
}

interface Emits {
  (e: 'add-equipment'): void
  (e: 'view-details', equipment: Equipment): void
  (e: 'schedule-maintenance', equipment: Equipment): void
  (e: 'report-issue', equipment: Equipment): void
  (e: 'more-actions', equipment: Equipment): void
}

const props = withDefaults(defineProps<Props>(), {
  farmId: '',
  showAddButton: true,
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()

// Reactive data
const isLoading = ref(false)
const showDetailDialog = ref(false)
const selectedEquipment = ref<Equipment | null>(null)

// Mock data
const equipmentList = computed<Equipment[]>(() => [
  {
    id: '1',
    name: 'John Deere 6120R',
    model: '6120R',
    serialNumber: 'JD6120R-001',
    type: 'tractor',
    status: 'operational',
    health: 85,
    location: 'Field A',
    purchaseDate: new Date('2022-03-15'),
    lastMaintenance: new Date('2024-01-15'),
    nextMaintenance: new Date('2024-04-15'),
    image: '/equipment/tractor.jpg',
    maintenanceHistory: [
      {
        id: '1',
        type: 'scheduled',
        date: new Date('2024-01-15'),
        description: 'Regular maintenance check',
        technician: 'Jan van der Merwe',
        cost: 2500,
      },
    ],
  },
  {
    id: '2',
    name: 'Irrigation System',
    model: 'RainBird 5000',
    serialNumber: 'RB5000-002',
    type: 'irrigation',
    status: 'warning',
    health: 65,
    location: 'Field B',
    purchaseDate: new Date('2021-06-20'),
    lastMaintenance: new Date('2023-12-10'),
    nextMaintenance: new Date('2024-02-10'),
    image: '/equipment/irrigation.jpg',
    maintenanceHistory: [
      {
        id: '2',
        type: 'emergency',
        date: new Date('2023-12-10'),
        description: 'Pump replacement',
        technician: 'Maria Botha',
        cost: 5000,
      },
    ],
  },
  {
    id: '3',
    name: 'Combine Harvester',
    model: 'Case IH 2388',
    serialNumber: 'CI2388-003',
    type: 'harvester',
    status: 'maintenance',
    health: 45,
    location: 'Shed 1',
    purchaseDate: new Date('2020-09-10'),
    lastMaintenance: new Date('2023-11-20'),
    nextMaintenance: new Date('2024-01-20'),
    image: '/equipment/harvester.jpg',
    maintenanceHistory: [
      {
        id: '3',
        type: 'scheduled',
        date: new Date('2023-11-20'),
        description: 'Pre-harvest inspection',
        technician: 'Piet Joubert',
        cost: 1800,
      },
    ],
  },
])

const equipmentStatus = computed(() => [
  {
    key: 'operational',
    count: equipmentList.value.filter((e) => e.status === 'operational').length,
    label: 'equipment.status.operational',
    color: 'success',
    icon: 'mdi-check-circle',
    iconColor: 'success',
  },
  {
    key: 'maintenance',
    count: equipmentList.value.filter((e) => e.status === 'maintenance').length,
    label: 'equipment.status.maintenance',
    color: 'warning',
    icon: 'mdi-wrench',
    iconColor: 'warning',
  },
  {
    key: 'warning',
    count: equipmentList.value.filter((e) => e.status === 'warning').length,
    label: 'equipment.status.warning',
    color: 'info',
    icon: 'mdi-alert',
    iconColor: 'info',
  },
  {
    key: 'error',
    count: equipmentList.value.filter((e) => e.status === 'error').length,
    label: 'equipment.status.error',
    color: 'error',
    icon: 'mdi-alert-circle',
    iconColor: 'error',
  },
])

const headers = computed(() => [
  { title: t('equipment.table.name'), key: 'name', sortable: true },
  { title: t('equipment.table.status'), key: 'status', sortable: true },
  { title: t('equipment.table.health'), key: 'health', sortable: true },
  { title: t('equipment.table.lastMaintenance'), key: 'lastMaintenance', sortable: true },
  { title: t('equipment.table.nextMaintenance'), key: 'nextMaintenance', sortable: true },
  { title: t('equipment.table.actions'), key: 'actions', sortable: false },
])

// Methods
const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'success'
    case 'maintenance':
      return 'warning'
    case 'warning':
      return 'info'
    case 'error':
      return 'error'
    case 'offline':
      return 'grey'
    default:
      return 'primary'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return 'mdi-check-circle'
    case 'maintenance':
      return 'mdi-wrench'
    case 'warning':
      return 'mdi-alert'
    case 'error':
      return 'mdi-alert-circle'
    case 'offline':
      return 'mdi-wifi-off'
    default:
      return 'mdi-help-circle'
  }
}

const getHealthColor = (health: number) => {
  if (health >= 80) return 'success'
  if (health >= 60) return 'warning'
  return 'error'
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const getDaysSinceMaintenance = (date: Date): string => {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  return t('equipment.daysAgo', { count: days })
}

const getDaysUntilMaintenance = (date: Date): string => {
  const days = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return t('equipment.daysUntil', { count: days })
}

const getMaintenanceUrgency = (date: Date): string => {
  const days = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 7) return 'text-error'
  if (days < 14) return 'text-warning'
  return 'text-success'
}

const handleAddEquipment = () => {
  emit('add-equipment')
}

const handleViewDetails = (equipment: Equipment) => {
  selectedEquipment.value = equipment
  showDetailDialog.value = true
  emit('view-details', equipment)
}

const handleScheduleMaintenance = (equipment: Equipment) => {
  emit('schedule-maintenance', equipment)
}

const handleReportIssue = (equipment: Equipment) => {
  emit('report-issue', equipment)
}

const handleMoreActions = (equipment: Equipment) => {
  emit('more-actions', equipment)
}
</script>

<i18n>
{
  "en": {
    "equipment": {
      "title": "Equipment Monitoring",
      "addEquipment": "Add Equipment",
      "status": {
        "operational": "Operational",
        "maintenance": "Maintenance",
        "warning": "Warning",
        "error": "Error",
        "offline": "Offline"
      },
      "table": {
        "name": "Name",
        "status": "Status",
        "health": "Health",
        "lastMaintenance": "Last Maintenance",
        "nextMaintenance": "Next Maintenance",
        "actions": "Actions"
      },
      "details": {
        "serialNumber": "Serial Number",
        "purchaseDate": "Purchase Date",
        "location": "Location",
        "health": "Health",
        "lastMaintenance": "Last Maintenance",
        "nextMaintenance": "Next Maintenance",
        "maintenanceHistory": "Maintenance History"
      },
      "maintenance": {
        "scheduled": "Scheduled Maintenance",
        "emergency": "Emergency Repair"
      },
      "scheduleMaintenance": "Schedule Maintenance",
      "reportIssue": "Report Issue",
      "daysAgo": "{count} days ago",
      "daysUntil": "{count} days until"
    }
  },
  "af": {
    "equipment": {
      "title": "Toerusting Monitering",
      "addEquipment": "Voeg Toerusting By",
      "status": {
        "operational": "Bedryf",
        "maintenance": "Onderhoud",
        "warning": "Waarskuwing",
        "error": "Fout",
        "offline": "Aflyn"
      },
      "table": {
        "name": "Naam",
        "status": "Status",
        "health": "Gesondheid",
        "lastMaintenance": "Laaste Onderhoud",
        "nextMaintenance": "Volgende Onderhoud",
        "actions": "Aksies"
      },
      "details": {
        "serialNumber": "Reeksnommer",
        "purchaseDate": "Aankoop Datum",
        "location": "Ligging",
        "health": "Gesondheid",
        "lastMaintenance": "Laaste Onderhoud",
        "nextMaintenance": "Volgende Onderhoud",
        "maintenanceHistory": "Onderhoud Geskiedenis"
      },
      "maintenance": {
        "scheduled": "Geskeduleerde Onderhoud",
        "emergency": "Nood Herstel"
      },
      "scheduleMaintenance": "Skeduleer Onderhoud",
      "reportIssue": "Rapporteer Probleem",
      "daysAgo": "{count} dae gelede",
      "daysUntil": "{count} dae tot"
    }
  }
}
</i18n>
