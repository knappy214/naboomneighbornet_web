<template>
  <div class="profile-hub">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">{{ $t('user.profileHub') }}</h1>
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="form-control">
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="text"
              class="input input-bordered"
              :placeholder="$t('user.searchUsers')"
              @keyup.enter="searchUsers"
            />
            <button class="btn btn-square" @click="searchUsers">
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

        <!-- Filter Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {{ $t('common.filter') }}
          </div>
          <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <label class="cursor-pointer">
                <input
                  v-model="filters.role"
                  type="radio"
                  name="role"
                  value=""
                  class="radio radio-sm"
                />
                <span>{{ $t('user.allRoles') }}</span>
              </label>
            </li>
            <li v-for="role in availableRoles" :key="role">
              <label class="cursor-pointer">
                <input
                  v-model="filters.role"
                  type="radio"
                  name="role"
                  :value="role"
                  class="radio radio-sm"
                />
                <span>{{ $t(`user.roles.${role}`) }}</span>
              </label>
            </li>
          </ul>
        </div>

        <!-- Online Filter -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text mr-2">{{ $t('user.onlineOnly') }}</span>
            <input v-model="filters.onlineOnly" type="checkbox" class="toggle toggle-primary" />
          </label>
        </div>

        <!-- Refresh Button -->
        <button class="btn btn-ghost btn-square" @click="refreshUsers">
          <svg
            class="w-5 h-5"
            :class="{ 'animate-spin': loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-if="!selectedUser" class="space-y-6">
      <!-- Stats Cards -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-figure text-primary">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <div class="stat-title">{{ $t('user.totalUsers') }}</div>
          <div class="stat-value text-primary">{{ totalUsers }}</div>
          <div class="stat-desc">{{ $t('user.registered') }}</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-success">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="stat-title">{{ $t('user.onlineUsers') }}</div>
          <div class="stat-value text-success">{{ onlineUsers.length }}</div>
          <div class="stat-desc">{{ $t('user.currentlyOnline') }}</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-info">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="stat-title">{{ $t('user.recentlyActive') }}</div>
          <div class="stat-value text-info">{{ recentlyActiveUsers.length }}</div>
          <div class="stat-desc">{{ $t('user.last24Hours') }}</div>
        </div>

        <div class="stat">
          <div class="stat-figure text-warning">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div class="stat-title">{{ $t('user.newUsers') }}</div>
          <div class="stat-value text-warning">{{ newUsersThisWeek }}</div>
          <div class="stat-desc">{{ $t('user.thisWeek') }}</div>
        </div>
      </div>

      <!-- User List -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h2 class="card-title">{{ $t('user.userList') }}</h2>
            <div class="flex items-center gap-2">
              <span class="text-sm text-base-content/70">
                {{ $t('user.showing', { count: filteredUsers.length, total: totalUsers }) }}
              </span>
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
            <button class="btn btn-sm btn-ghost" @click="refreshUsers">
              {{ $t('common.retry') }}
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 class="text-lg font-semibold mb-2">{{ $t('user.noUsersFound') }}</h3>
            <p class="text-base-content/70 mb-4">{{ $t('user.noUsersFoundDescription') }}</p>
            <button class="btn btn-primary" @click="clearFilters">
              {{ $t('user.clearFilters') }}
            </button>
          </div>

          <!-- User Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="user in paginatedUsers"
              :key="user.id"
              class="card bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
              @click="selectUser(user)"
            >
              <div class="card-body p-4">
                <div class="flex items-center gap-3 mb-3">
                  <!-- Avatar -->
                  <div class="avatar">
                    <div
                      class="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                    >
                      <img
                        v-if="user.avatar"
                        :src="user.avatar"
                        :alt="user.displayName"
                        class="w-full h-full object-cover rounded-full"
                      />
                      <div
                        v-else
                        class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-lg font-bold"
                      >
                        {{ user.displayName.charAt(0).toUpperCase() }}
                      </div>
                    </div>
                    <!-- Online Status -->
                    <div
                      v-if="user.isOnline"
                      class="absolute bottom-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-base-100"
                    ></div>
                  </div>

                  <!-- User Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold truncate">{{ user.displayName }}</h3>
                    <p class="text-sm text-base-content/70 truncate">@{{ user.username }}</p>
                  </div>

                  <!-- Role Badge -->
                  <div class="badge badge-primary badge-sm">
                    {{ $t(`user.roles.${user.role}`) }}
                  </div>
                </div>

                <!-- Bio -->
                <p v-if="user.bio" class="text-sm text-base-content/80 line-clamp-2 mb-3">
                  {{ user.bio }}
                </p>

                <!-- Location -->
                <div
                  v-if="user.location"
                  class="flex items-center gap-1 text-xs text-base-content/60 mb-3"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span class="truncate">{{ user.location }}</span>
                </div>

                <!-- Stats -->
                <div class="flex items-center justify-between text-xs text-base-content/60">
                  <div class="flex items-center gap-3">
                    <span>{{ user.stats.totalMessages }} {{ $t('user.messages') }}</span>
                    <span>{{ user.stats.reputationScore }} {{ $t('user.reputation') }}</span>
                  </div>
                  <div v-if="!user.isOnline" class="text-xs">
                    {{ $t('user.lastSeen', { date: formatDate(user.lastActiveAt) }) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-6">
            <div class="join">
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === 1 }"
                @click="currentPage = 1"
              >
                «
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === 1 }"
                @click="currentPage = Math.max(1, currentPage - 1)"
              >
                ‹
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                class="join-item btn btn-sm"
                :class="{ 'btn-active': page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === totalPages }"
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
              >
                ›
              </button>
              <button
                class="join-item btn btn-sm"
                :class="{ 'btn-disabled': currentPage === totalPages }"
                @click="currentPage = totalPages"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile View -->
    <div v-else>
      <UserProfile
        :user-id="selectedUser.id"
        @edit-profile="handleEditProfile"
        @manage-user="handleManageUser"
        @view-activity="handleViewActivity"
        @view-sessions="handleViewSessions"
        @send-message="handleSendMessage"
        @follow-user="handleFollowUser"
        @block-user="handleBlockUser"
        @report-user="handleReportUser"
        @back-to-list="selectedUser = null"
      />
    </div>

    <!-- Profile Editor Modal -->
    <div v-if="showProfileEditor" class="modal modal-open">
      <div class="modal-box max-w-4xl">
        <ProfileEditor
          :user="selectedUser"
          @close="showProfileEditor = false"
          @saved="handleProfileSaved"
        />
      </div>
      <div class="modal-backdrop" @click="showProfileEditor = false"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/hub/user'
import UserProfile from './UserProfile.vue'
import ProfileEditor from './ProfileEditor.vue'
import type { UserProfile as UserProfileType } from '@/types/user'

const { t } = useI18n()
const userStore = useUserStore()

// Reactive data
const selectedUser = ref<UserProfileType | null>(null)
const showProfileEditor = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

const filters = ref({
  role: '',
  onlineOnly: false,
})

// Computed properties
const { users, onlineUsers, recentlyActiveUsers, loading, error } = userStore

const availableRoles = ['admin', 'moderator', 'member', 'guest', 'banned']

const totalUsers = computed(() => users.value.length)

const newUsersThisWeek = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  return users.value.filter((user) => new Date(user.joinedAt) > oneWeekAgo).length
})

const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query) ||
        user.location?.toLowerCase().includes(query),
    )
  }

  // Role filter
  if (filters.value.role) {
    filtered = filtered.filter((user) => user.role === filters.value.role)
  }

  // Online filter
  if (filters.value.onlineOnly) {
    filtered = filtered.filter((user) => user.isOnline)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
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
function selectUser(user: UserProfileType) {
  selectedUser.value = user
}

function searchUsers() {
  currentPage.value = 1
  // Search is handled by computed property
}

function clearFilters() {
  searchQuery.value = ''
  filters.value.role = ''
  filters.value.onlineOnly = false
  currentPage.value = 1
}

function refreshUsers() {
  userStore.fetchOnlineUsers()
  userStore.fetchRecentlyActiveUsers()
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Event handlers
function handleEditProfile(user: UserProfileType) {
  selectedUser.value = user
  showProfileEditor.value = true
}

function handleManageUser(user: UserProfileType) {
  // TODO: Implement user management
  console.log('Manage user:', user)
}

function handleViewActivity(user: UserProfileType) {
  // TODO: Implement activity view
  console.log('View activity:', user)
}

function handleViewSessions(user: UserProfileType) {
  // TODO: Implement sessions view
  console.log('View sessions:', user)
}

function handleSendMessage(user: UserProfileType) {
  // TODO: Implement send message
  console.log('Send message:', user)
}

function handleFollowUser(user: UserProfileType) {
  // TODO: Implement follow user
  console.log('Follow user:', user)
}

function handleBlockUser(user: UserProfileType) {
  // TODO: Implement block user
  console.log('Block user:', user)
}

function handleReportUser(user: UserProfileType) {
  // TODO: Implement report user
  console.log('Report user:', user)
}

function handleProfileSaved(user: UserProfileType) {
  showProfileEditor.value = false
  selectedUser.value = user
  // Refresh the user list
  refreshUsers()
}

// Watch for filter changes
watch(
  filters,
  () => {
    currentPage.value = 1
  },
  { deep: true },
)

// Lifecycle
onMounted(() => {
  refreshUsers()
})
</script>

<style scoped>
.profile-hub {
  @apply space-y-6;
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

.card {
  @apply transition-all duration-200;
}

.card:hover {
  @apply transform scale-105;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.avatar {
  @apply transition-all duration-200;
}

.avatar:hover {
  @apply transform scale-110;
}

.badge {
  @apply transition-all duration-200;
}

.input-group {
  @apply transition-all duration-200;
}

.input-group:hover {
  @apply transform scale-105;
}

.dropdown {
  @apply transition-all duration-200;
}

.dropdown:hover {
  @apply transform scale-105;
}

.modal {
  @apply transition-all duration-200;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
