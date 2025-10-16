<template>
  <div class="event-hub">
    <!-- Navigation Tabs -->
    <div class="tabs tabs-boxed mb-6">
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'list' }"
        @click="setActiveTab('list')"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        {{ t('events.listView') }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'calendar' }"
        @click="setActiveTab('calendar')"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        {{ t('events.calendarView') }}
      </button>
      <button
        class="tab"
        :class="{ 'tab-active': activeTab === 'create' }"
        @click="setActiveTab('create')"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        {{ t('events.createEvent') }}
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="stats shadow mb-6">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('events.totalEvents') }}</div>
        <div class="stat-value text-primary">{{ eventStats?.totalEvents || 0 }}</div>
        <div class="stat-desc">{{ t('events.allTime') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-secondary">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('events.upcomingEvents') }}</div>
        <div class="stat-value text-secondary">{{ eventStats?.upcomingEvents || 0 }}</div>
        <div class="stat-desc">{{ t('events.next30Days') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-accent">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('events.totalAttendees') }}</div>
        <div class="stat-value text-accent">{{ eventStats?.totalAttendees || 0 }}</div>
        <div class="stat-desc">{{ t('events.allEvents') }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-info">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div class="stat-title">{{ t('events.thisMonth') }}</div>
        <div class="stat-value text-info">{{ eventStats?.eventsThisMonth || 0 }}</div>
        <div class="stat-desc">{{ t('events.eventsCreated') }}</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="event-hub-content">
      <!-- List View -->
      <EventList
        v-if="activeTab === 'list'"
        @select-event="handleSelectEvent"
        @create-event="handleCreateEvent"
        @edit-event="handleEditEvent"
      />

      <!-- Calendar View -->
      <EventCalendar
        v-else-if="activeTab === 'calendar'"
        @select-event="handleSelectEvent"
        @create-event="handleCreateEvent"
      />

      <!-- Create/Edit Event -->
      <EventCreator
        v-else-if="activeTab === 'create' || activeTab === 'edit'"
        :event="editingEvent"
        :is-editing="activeTab === 'edit'"
        @success="handleEventSuccess"
        @cancel="handleEventCancel"
      />

      <!-- Event Details -->
      <EventDetails
        v-else-if="activeTab === 'details' && selectedEventId"
        :event-id="selectedEventId"
        @edit-event="handleEditEvent"
        @back-to-list="setActiveTab('list')"
      />
    </div>

    <!-- Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <div class="dropdown dropdown-top dropdown-end">
        <div tabindex="0" role="button" class="btn btn-primary btn-circle btn-lg shadow-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mb-2">
          <li>
            <a @click="setActiveTab('create')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {{ t('events.createEvent') }}
            </a>
          </li>
          <li>
            <a @click="setActiveTab('calendar')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {{ t('events.calendarView') }}
            </a>
          </li>
          <li>
            <a @click="setActiveTab('list')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              {{ t('events.listView') }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import EventList from './EventList.vue'
import EventCalendar from './EventCalendar.vue'
import EventCreator from './EventCreator.vue'
import EventDetails from './EventDetails.vue'
import type { Event } from '@/types/events'

const { t } = useI18n()
const eventStore = useEventStore()

// Reactive data
const activeTab = ref<'list' | 'calendar' | 'create' | 'edit' | 'details'>('list')
const selectedEventId = ref<string | null>(null)
const editingEvent = ref<Event | null>(null)

// Computed properties
const { eventStats } = eventStore

// Methods
function setActiveTab(tab: 'list' | 'calendar' | 'create' | 'edit' | 'details') {
  activeTab.value = tab

  // Reset related state when switching tabs
  if (tab !== 'edit') {
    editingEvent.value = null
  }
  if (tab !== 'details') {
    selectedEventId.value = null
  }
}

function handleSelectEvent(event: Event) {
  selectedEventId.value = event.id
  setActiveTab('details')
}

function handleCreateEvent(date?: Date) {
  editingEvent.value = null
  setActiveTab('create')
}

function handleEditEvent(event: Event) {
  editingEvent.value = event
  setActiveTab('edit')
}

function handleEventSuccess(event: Event) {
  // Event created/updated successfully
  setActiveTab('list')

  // Show success message
  // This would typically use a toast notification system
  console.log('Event saved successfully:', event)
}

function handleEventCancel() {
  setActiveTab('list')
}

// Lifecycle
onMounted(() => {
  // Fetch initial data
  eventStore.fetchEvents()
  eventStore.fetchEventStats()
})
</script>

<style scoped>
.event-hub {
  @apply space-y-6;
}

.event-hub-content {
  @apply min-h-[600px];
}

.tabs {
  @apply flex-wrap;
}

.tab {
  @apply transition-all duration-200;
}

.tab:hover {
  @apply transform scale-105;
}

.stats {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
}

.stat {
  @apply transition-all duration-200;
}

.stat:hover {
  @apply transform scale-105;
}

.fixed {
  @apply z-50;
}

.dropdown-content {
  @apply z-50;
}

.btn-circle {
  @apply shadow-lg;
}

.btn-circle:hover {
  @apply transform scale-110;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats {
    @apply grid-cols-2;
  }

  .tabs {
    @apply flex-col;
  }

  .tab {
    @apply w-full justify-center;
  }
}

@media (max-width: 480px) {
  .stats {
    @apply grid-cols-1;
  }
}
</style>
