<template>
  <div class="event-list">
    <!-- Header with filters and search -->
    <div class="event-list-header mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold">{{ t('events.eventList') }}</h2>
          <div class="badge badge-primary">{{ totalEvents }} {{ t('events.events') }}</div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <!-- Search -->
          <div class="form-control">
            <div class="input-group">
              <input
                v-model="searchQuery"
                type="text"
                class="input input-bordered"
                :placeholder="t('events.searchEvents')"
                @input="handleSearch"
              />
              <button class="btn btn-square btn-primary" @click="handleSearch">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Filter Toggle -->
          <button
            class="btn btn-outline"
            :class="{ 'btn-active': showFilters }"
            @click="toggleFilters"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {{ t('common.filters') }}
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div v-if="showFilters" class="filters-panel mt-4 p-4 bg-base-200 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Category Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.category') }}</span>
            </label>
            <select
              v-model="filters.category"
              class="select select-bordered w-full"
              @change="applyFilters"
            >
              <option value="">{{ t('events.allCategories') }}</option>
              <option value="meeting">{{ t('events.categories.meeting') }}</option>
              <option value="social">{{ t('events.categories.social') }}</option>
              <option value="emergency">{{ t('events.categories.emergency') }}</option>
              <option value="maintenance">{{ t('events.categories.maintenance') }}</option>
              <option value="celebration">{{ t('events.categories.celebration') }}</option>
              <option value="education">{{ t('events.categories.education') }}</option>
              <option value="sports">{{ t('events.categories.sports') }}</option>
              <option value="volunteer">{{ t('events.categories.volunteer') }}</option>
              <option value="other">{{ t('events.categories.other') }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.status') }}</span>
            </label>
            <select
              v-model="filters.status"
              class="select select-bordered w-full"
              @change="applyFilters"
            >
              <option value="">{{ t('events.allStatuses') }}</option>
              <option value="published">{{ t('events.statuses.published') }}</option>
              <option value="draft">{{ t('events.statuses.draft') }}</option>
              <option value="cancelled">{{ t('events.statuses.cancelled') }}</option>
              <option value="completed">{{ t('events.statuses.completed') }}</option>
              <option value="postponed">{{ t('events.statuses.postponed') }}</option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.dateRange') }}</span>
            </label>
            <select
              v-model="dateRangeFilter"
              class="select select-bordered w-full"
              @change="applyDateRangeFilter"
            >
              <option value="all">{{ t('events.allDates') }}</option>
              <option value="today">{{ t('events.today') }}</option>
              <option value="tomorrow">{{ t('events.tomorrow') }}</option>
              <option value="thisWeek">{{ t('events.thisWeek') }}</option>
              <option value="nextWeek">{{ t('events.nextWeek') }}</option>
              <option value="thisMonth">{{ t('events.thisMonth') }}</option>
              <option value="nextMonth">{{ t('events.nextMonth') }}</option>
              <option value="custom">{{ t('events.customRange') }}</option>
            </select>
          </div>

          <!-- Event Type Filter -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.eventType') }}</span>
            </label>
            <select
              v-model="eventTypeFilter"
              class="select select-bordered w-full"
              @change="applyEventTypeFilter"
            >
              <option value="all">{{ t('events.allTypes') }}</option>
              <option value="virtual">{{ t('events.virtualEvents') }}</option>
              <option value="physical">{{ t('events.physicalEvents') }}</option>
            </select>
          </div>
        </div>

        <!-- Custom Date Range -->
        <div v-if="dateRangeFilter === 'custom'" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.startDate') }}</span>
            </label>
            <input
              v-model="customStartDate"
              type="date"
              class="input input-bordered w-full"
              @change="applyFilters"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">{{ t('events.endDate') }}</span>
            </label>
            <input
              v-model="customEndDate"
              type="date"
              class="input input-bordered w-full"
              @change="applyFilters"
            />
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4 flex justify-end">
          <button class="btn btn-ghost btn-sm" @click="clearFilters">
            {{ t('common.clearFilters') }}
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

    <!-- Empty State -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-12">
      <svg
        class="w-16 h-16 mx-auto text-base-content/30 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 class="text-lg font-semibold mb-2">{{ t('events.noEventsFound') }}</h3>
      <p class="text-base-content/70 mb-4">{{ t('events.noEventsDescription') }}</p>
      <button class="btn btn-primary" @click="$emit('create-event')">
        {{ t('events.createFirstEvent') }}
      </button>
    </div>

    <!-- Events Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="event in paginatedEvents"
        :key="event.id"
        class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        @click="selectEvent(event)"
      >
        <div class="card-body">
          <!-- Event Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="badge badge-primary badge-sm">
                {{ t(`events.categories.${event.category}`) }}
              </div>
              <div class="badge badge-ghost badge-sm">
                {{ t(`events.statuses.${event.status}`) }}
              </div>
            </div>
            <div class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-sm btn-square">
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
                class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
              >
                <li>
                  <a @click.stop="editEvent(event)">{{ t('common.edit') }}</a>
                </li>
                <li>
                  <a @click.stop="duplicateEvent(event)">{{ t('events.duplicate') }}</a>
                </li>
                <li v-if="event.status === 'published'">
                  <a @click.stop="cancelEvent(event)">{{ t('events.cancel') }}</a>
                </li>
                <li>
                  <a @click.stop="deleteEvent(event)" class="text-error">{{
                    t('common.delete')
                  }}</a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Event Title -->
          <h3 class="card-title text-lg mb-2 line-clamp-2">{{ event.title }}</h3>

          <!-- Event Description -->
          <p class="text-base-content/70 text-sm mb-4 line-clamp-3">{{ event.description }}</p>

          <!-- Event Details -->
          <div class="space-y-2 mb-4">
            <!-- Date and Time -->
            <div class="flex items-center gap-2 text-sm">
              <svg
                class="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{{ formatEventDate(event.startDate, event.endDate) }}</span>
            </div>

            <!-- Location -->
            <div v-if="event.location || event.isVirtual" class="flex items-center gap-2 text-sm">
              <svg
                class="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <span v-if="event.isVirtual" class="text-primary">{{
                t('events.virtualEvent')
              }}</span>
              <span v-else>{{ event.location }}</span>
            </div>

            <!-- Attendees -->
            <div class="flex items-center gap-2 text-sm">
              <svg
                class="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <span
                >{{ event.currentAttendees
                }}{{ event.maxAttendees ? ` / ${event.maxAttendees}` : '' }}
                {{ t('events.attendees') }}</span
              >
            </div>
          </div>

          <!-- Tags -->
          <div v-if="event.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
            <span
              v-for="tag in event.tags.slice(0, 3)"
              :key="tag"
              class="badge badge-outline badge-xs"
            >
              {{ tag }}
            </span>
            <span v-if="event.tags.length > 3" class="badge badge-outline badge-xs">
              +{{ event.tags.length - 3 }}
            </span>
          </div>

          <!-- Event Actions -->
          <div class="card-actions justify-between">
            <div class="flex gap-2">
              <button class="btn btn-primary btn-sm" @click.stop="rsvpToEvent(event)">
                {{ getRsvpButtonText(event) }}
              </button>
              <button class="btn btn-ghost btn-sm" @click.stop="viewEvent(event)">
                {{ t('common.view') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-8">
      <div class="join">
        <button
          class="join-item btn"
          :class="{ 'btn-disabled': currentPage === 1 }"
          @click="goToPage(currentPage - 1)"
        >
          {{ t('common.previous') }}
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="join-item btn"
          :class="{ 'btn-active': page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <button
          class="join-item btn"
          :class="{ 'btn-disabled': currentPage === totalPages }"
          @click="goToPage(currentPage + 1)"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import type { Event, EventFilter, AttendeeStatus } from '@/types/events'

const emit = defineEmits<{
  (event: 'select-event', eventData: Event): void
  (event: 'create-event'): void
  (event: 'edit-event', eventData: Event): void
}>()

const { t } = useI18n()
const eventStore = useEventStore()

// Reactive data
const searchQuery = ref('')
const showFilters = ref(false)
const dateRangeFilter = ref('all')
const eventTypeFilter = ref('all')
const customStartDate = ref('')
const customEndDate = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

// Filters
const filters = ref<EventFilter>({})

// Computed properties
const { events, loading, error } = eventStore

const filteredEvents = computed(() => {
  let filtered = events.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.tags.some((tag) => tag.toLowerCase().includes(query)),
    )
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter((event) => event.category === filters.value.category)
  }

  // Status filter
  if (filters.value.status) {
    filtered = filtered.filter((event) => event.status === filters.value.status)
  }

  // Date range filter
  if (filters.value.dateRange) {
    const { start, end } = filters.value.dateRange
    filtered = filtered.filter((event) => {
      const eventDate = new Date(event.startDate)
      return eventDate >= start && eventDate <= end
    })
  }

  // Event type filter
  if (eventTypeFilter.value === 'virtual') {
    filtered = filtered.filter((event) => event.isVirtual)
  } else if (eventTypeFilter.value === 'physical') {
    filtered = filtered.filter((event) => !event.isVirtual)
  }

  return filtered
})

const totalEvents = computed(() => filteredEvents.value.length)

const totalPages = computed(() => Math.ceil(totalEvents.value / itemsPerPage))

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredEvents.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
function handleSearch() {
  currentPage.value = 1
  // Search is handled by the computed property
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function applyFilters() {
  currentPage.value = 1
  eventStore.setFilters(filters.value)
  eventStore.fetchEvents()
}

function applyDateRangeFilter() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (dateRangeFilter.value) {
    case 'today':
      filters.value.dateRange = {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
      }
      break
    case 'tomorrow':
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      filters.value.dateRange = {
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1),
      }
      break
    case 'thisWeek':
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      filters.value.dateRange = { start: startOfWeek, end: endOfWeek }
      break
    case 'nextWeek':
      const nextWeekStart = new Date(today)
      nextWeekStart.setDate(today.getDate() - today.getDay() + 7)
      const nextWeekEnd = new Date(nextWeekStart)
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6)
      filters.value.dateRange = { start: nextWeekStart, end: nextWeekEnd }
      break
    case 'thisMonth':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      filters.value.dateRange = { start: startOfMonth, end: endOfMonth }
      break
    case 'nextMonth':
      const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
      filters.value.dateRange = { start: nextMonthStart, end: nextMonthEnd }
      break
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        filters.value.dateRange = {
          start: new Date(customStartDate.value),
          end: new Date(customEndDate.value),
        }
      }
      break
    default:
      delete filters.value.dateRange
  }

  applyFilters()
}

function applyEventTypeFilter() {
  // Event type filter is handled by the computed property
  currentPage.value = 1
}

function clearFilters() {
  filters.value = {}
  searchQuery.value = ''
  dateRangeFilter.value = 'all'
  eventTypeFilter.value = 'all'
  customStartDate.value = ''
  customEndDate.value = ''
  applyFilters()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

function selectEvent(event: Event) {
  emit('select-event', event)
}

function editEvent(event: Event) {
  emit('edit-event', event)
}

function duplicateEvent(event: Event) {
  // Implementation for duplicating event
  console.log('Duplicate event:', event)
}

function cancelEvent(event: Event) {
  // Implementation for cancelling event
  console.log('Cancel event:', event)
}

function deleteEvent(event: Event) {
  // Implementation for deleting event
  console.log('Delete event:', event)
}

function rsvpToEvent(event: Event) {
  // Implementation for RSVP
  console.log('RSVP to event:', event)
}

function viewEvent(event: Event) {
  emit('select-event', event)
}

function getRsvpButtonText(event: Event): string {
  // This would check the user's current RSVP status
  return t('events.rsvp')
}

function formatEventDate(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const isSameDay = start.toDateString() === end.toDateString()

  if (isSameDay) {
    return `${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }
}

function retry() {
  eventStore.fetchEvents()
}

// Lifecycle
onMounted(() => {
  eventStore.fetchEvents()
})

// Watch for changes in filters
watch(
  filters,
  () => {
    applyFilters()
  },
  { deep: true },
)
</script>

<style scoped>
.event-list {
  @apply space-y-6;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.filters-panel {
  @apply border border-base-300;
}

.card {
  @apply transition-all duration-200;
}

.card:hover {
  @apply transform scale-105;
}

.dropdown-content {
  @apply z-50;
}
</style>
