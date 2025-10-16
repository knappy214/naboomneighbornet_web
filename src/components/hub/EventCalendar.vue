<template>
  <div class="event-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold">{{ t('events.calendar') }}</h2>
          <div class="flex items-center gap-2">
            <button class="btn btn-sm btn-outline" @click="previousMonth">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h3 class="text-lg font-semibold min-w-[200px] text-center">
              {{ currentMonthYear }}
            </h3>
            <button class="btn btn-sm btn-outline" @click="nextMonth">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="btn-group">
            <button
              class="btn btn-sm"
              :class="{ 'btn-active': view === 'month' }"
              @click="setView('month')"
            >
              {{ t('events.monthView') }}
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-active': view === 'week' }"
              @click="setView('week')"
            >
              {{ t('events.weekView') }}
            </button>
            <button
              class="btn btn-sm"
              :class="{ 'btn-active': view === 'day' }"
              @click="setView('day')"
            >
              {{ t('events.dayView') }}
            </button>
          </div>

          <!-- Today Button -->
          <button class="btn btn-sm btn-primary" @click="goToToday">
            {{ t('events.today') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-ghost" @click="retry">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Month View -->
    <div v-else-if="view === 'month'" class="month-view">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in daysOfWeek"
          :key="day"
          class="text-center text-sm font-medium text-base-content/70 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          class="min-h-[120px] border border-base-300 rounded-lg p-2 cursor-pointer hover:bg-base-200 transition-colors"
          :class="{
            'bg-base-200': isToday(day.date),
            'text-base-content/50': !day.isCurrentMonth,
            'bg-primary/10': isSelected(day.date),
          }"
          @click="selectDate(day.date)"
        >
          <!-- Day Number -->
          <div class="text-sm font-medium mb-1">
            {{ day.date.getDate() }}
          </div>

          <!-- Events for this day -->
          <div class="space-y-1">
            <div
              v-for="event in getEventsForDate(day.date)"
              :key="event.id"
              class="text-xs p-1 rounded cursor-pointer truncate"
              :class="getEventClass(event)"
              @click.stop="selectEvent(event)"
            >
              {{ event.title }}
            </div>
            <div v-if="getEventsForDate(day.date).length > 3" class="text-xs text-base-content/50">
              +{{ getEventsForDate(day.date).length - 3 }} {{ t('events.more') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-else-if="view === 'week'" class="week-view">
      <div class="grid grid-cols-8 gap-1">
        <!-- Time column header -->
        <div class="text-sm font-medium text-base-content/70 py-2"></div>

        <!-- Day headers -->
        <div
          v-for="day in weekDays"
          :key="day.date.toISOString()"
          class="text-center text-sm font-medium text-base-content/70 py-2 border-b border-base-300"
        >
          <div>{{ day.name }}</div>
          <div class="text-xs">{{ day.date.getDate() }}</div>
        </div>
      </div>

      <!-- Time slots -->
      <div class="grid grid-cols-8 gap-1">
        <div
          v-for="hour in timeSlots"
          :key="hour"
          class="text-xs text-base-content/50 py-1 border-r border-base-300"
        >
          {{ formatHour(hour) }}
        </div>

        <div
          v-for="day in weekDays"
          :key="day.date.toISOString()"
          class="min-h-[600px] border border-base-300 rounded-lg p-2"
        >
          <div
            v-for="event in getEventsForDate(day.date)"
            :key="event.id"
            class="text-xs p-1 rounded cursor-pointer mb-1"
            :class="getEventClass(event)"
            @click="selectEvent(event)"
          >
            {{ event.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-else-if="view === 'day'" class="day-view">
      <div class="text-center text-lg font-semibold mb-4">
        {{
          selectedDate.toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        }}
      </div>

      <div class="grid grid-cols-12 gap-4">
        <!-- Time column -->
        <div class="col-span-2">
          <div
            v-for="hour in timeSlots"
            :key="hour"
            class="text-sm text-base-content/70 py-2 border-b border-base-300"
          >
            {{ formatHour(hour) }}
          </div>
        </div>

        <!-- Events column -->
        <div class="col-span-10">
          <div
            v-for="event in getEventsForDate(selectedDate)"
            :key="event.id"
            class="p-3 border border-base-300 rounded-lg mb-2 cursor-pointer hover:bg-base-200 transition-colors"
            :class="getEventClass(event)"
            @click="selectEvent(event)"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ event.title }}</h4>
                <p class="text-sm text-base-content/70">{{ event.description }}</p>
              </div>
              <div class="text-sm text-base-content/50">
                {{ formatEventTime(event.startDate, event.endDate) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="selectedEvent" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">{{ selectedEvent.title }}</h3>

        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ formatEventTime(selectedEvent.startDate, selectedEvent.endDate) }}</span>
          </div>

          <div
            v-if="selectedEvent.location || selectedEvent.isVirtual"
            class="flex items-center gap-2"
          >
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span v-if="selectedEvent.isVirtual" class="text-primary">{{
              t('events.virtualEvent')
            }}</span>
            <span v-else>{{ selectedEvent.location }}</span>
          </div>

          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <span
              >{{ selectedEvent.currentAttendees
              }}{{ selectedEvent.maxAttendees ? ` / ${selectedEvent.maxAttendees}` : '' }}
              {{ t('events.attendees') }}</span
            >
          </div>

          <div class="divider"></div>

          <p class="text-base-content/80">{{ selectedEvent.description }}</p>
        </div>

        <div class="modal-action">
          <button class="btn btn-primary" @click="viewEventDetails">
            {{ t('common.viewDetails') }}
          </button>
          <button class="btn btn-ghost" @click="selectedEvent = null">
            {{ t('common.close') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import type { Event } from '@/types/events'

const emit = defineEmits<{
  (event: 'select-event', eventData: Event): void
  (event: 'create-event', date: Date): void
}>()

const { t } = useI18n()
const eventStore = useEventStore()

// Reactive data
const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const selectedEvent = ref<Event | null>(null)
const view = ref<'month' | 'week' | 'day'>('month')

// Computed properties
const { events, loading, error } = eventStore

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })
})

const daysOfWeek = computed(() => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days.map((day) => t(`events.days.${day.toLowerCase()}`))
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    days.push({
      date: new Date(date),
      isCurrentMonth: date.getMonth() === month,
    })
  }

  return days
})

const weekDays = computed(() => {
  const startOfWeek = new Date(selectedDate.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    days.push({
      date: new Date(date),
      name: t(`events.days.${['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][i]}`),
    })
  }

  return days
})

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    slots.push(hour)
  }
  return slots
})

// Methods
function getEventsForDate(date: Date): Event[] {
  const dateStr = date.toDateString()
  return events.value.filter((event) => {
    const eventDate = new Date(event.startDate).toDateString()
    return eventDate === dateStr
  })
}

function getEventClass(event: Event): string {
  const classes = ['bg-primary text-primary-content']

  // Add category-based colors
  switch (event.category) {
    case 'meeting':
      classes[0] = 'bg-blue-500 text-white'
      break
    case 'social':
      classes[0] = 'bg-green-500 text-white'
      break
    case 'emergency':
      classes[0] = 'bg-red-500 text-white'
      break
    case 'maintenance':
      classes[0] = 'bg-yellow-500 text-black'
      break
    case 'celebration':
      classes[0] = 'bg-pink-500 text-white'
      break
    case 'education':
      classes[0] = 'bg-purple-500 text-white'
      break
    case 'sports':
      classes[0] = 'bg-orange-500 text-white'
      break
    case 'volunteer':
      classes[0] = 'bg-teal-500 text-white'
      break
    default:
      classes[0] = 'bg-gray-500 text-white'
  }

  return classes.join(' ')
}

function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isSelected(date: Date): boolean {
  return date.toDateString() === selectedDate.value.toDateString()
}

function selectDate(date: Date) {
  selectedDate.value = date
  if (view.value === 'day') {
    // Stay in day view
  } else {
    view.value = 'day'
  }
}

function selectEvent(event: Event) {
  selectedEvent.value = event
}

function viewEventDetails() {
  if (selectedEvent.value) {
    emit('select-event', selectedEvent.value)
    selectedEvent.value = null
  }
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  fetchEventsForMonth()
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  fetchEventsForMonth()
}

function goToToday() {
  currentDate.value = new Date()
  selectedDate.value = new Date()
  fetchEventsForMonth()
}

function setView(newView: 'month' | 'week' | 'day') {
  view.value = newView
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function formatEventTime(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return `${startTime} - ${endTime}`
}

function fetchEventsForMonth() {
  const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1)
  const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)

  eventStore.fetchEventsByDateRange(startOfMonth, endOfMonth)
}

function retry() {
  fetchEventsForMonth()
}

// Lifecycle
onMounted(() => {
  fetchEventsForMonth()
})

// Watch for view changes
watch(view, (newView) => {
  if (newView === 'week') {
    // Fetch events for the current week
    const startOfWeek = new Date(selectedDate.value)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6)

    eventStore.fetchEventsByDateRange(startOfWeek, endOfWeek)
  } else if (newView === 'day') {
    // Fetch events for the selected day
    const startOfDay = new Date(selectedDate.value)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate.value)
    endOfDay.setHours(23, 59, 59, 999)

    eventStore.fetchEventsByDateRange(startOfDay, endOfDay)
  }
})

// Watch for selected date changes
watch(selectedDate, () => {
  if (view.value === 'day') {
    const startOfDay = new Date(selectedDate.value)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(selectedDate.value)
    endOfDay.setHours(23, 59, 59, 999)

    eventStore.fetchEventsByDateRange(startOfDay, endOfDay)
  }
})
</script>

<style scoped>
.event-calendar {
  @apply space-y-6;
}

.calendar-header {
  @apply border-b border-base-300 pb-4;
}

.month-view {
  @apply space-y-2;
}

.week-view {
  @apply space-y-2;
}

.day-view {
  @apply space-y-4;
}

.time-slots {
  @apply space-y-1;
}

.modal {
  @apply z-50;
}

.grid {
  @apply gap-1;
}

.calendar-day {
  @apply transition-all duration-200;
}

.calendar-day:hover {
  @apply transform scale-105;
}

.event-item {
  @apply transition-all duration-200;
}

.event-item:hover {
  @apply transform scale-105;
}
</style>
