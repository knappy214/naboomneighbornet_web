<template>
  <div v-if="user" class="user-profile">
    <!-- Profile Header -->
    <div class="profile-header mb-6">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-4">
          <!-- Avatar -->
          <div class="avatar">
            <div
              class="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.displayName"
                class="w-full h-full object-cover rounded-full"
              />
              <div
                v-else
                class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold"
              >
                {{ user.displayName.charAt(0).toUpperCase() }}
              </div>
            </div>
            <!-- Online Status Indicator -->
            <div
              v-if="user.isOnline"
              class="absolute bottom-1 right-1 w-6 h-6 bg-success rounded-full border-2 border-base-100"
              :title="$t('user.online')"
            >
              <div class="w-full h-full bg-success rounded-full animate-pulse"></div>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-3xl font-bold">{{ user.displayName }}</h1>
              <div class="badge badge-primary badge-lg">
                {{ $t(`user.roles.${user.role}`) }}
              </div>
              <div class="badge badge-ghost badge-lg">
                {{ $t(`user.statuses.${user.status}`) }}
              </div>
            </div>

            <div class="flex items-center gap-4 text-base-content/70 mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>@{{ user.username }}</span>
              </div>

              <div v-if="user.location" class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span>{{ user.location }}</span>
              </div>

              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{{ $t('user.joinedOn', { date: formatDate(user.joinedAt) }) }}</span>
              </div>

              <div v-if="!user.isOnline" class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ $t('user.lastSeen', { date: formatDate(user.lastActiveAt) }) }}</span>
              </div>
            </div>

            <!-- Bio -->
            <p v-if="user.bio" class="text-base-content/80 text-lg mb-4">
              {{ user.bio }}
            </p>

            <!-- Social Links -->
            <div v-if="user.socialLinks && hasVisibleSocialLinks" class="flex items-center gap-4">
              <a
                v-if="user.socialLinks.twitter"
                :href="user.socialLinks.twitter"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                  />
                </svg>
                Twitter
              </a>

              <a
                v-if="user.socialLinks.linkedin"
                :href="user.socialLinks.linkedin"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                  />
                </svg>
                LinkedIn
              </a>

              <a
                v-if="user.socialLinks.facebook"
                :href="user.socialLinks.facebook"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                Facebook
              </a>

              <a
                v-if="user.socialLinks.instagram"
                :href="user.socialLinks.instagram"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-ghost btn-sm"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"
                  />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <div v-if="canEditProfile" class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-square">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li v-if="canEditProfile">
                <a @click="editProfile">{{ $t('common.edit') }}</a>
              </li>
              <li v-if="canManageUser">
                <a @click="manageUser">{{ $t('user.manageUser') }}</a>
              </li>
              <li v-if="canViewUserActivity">
                <a @click="viewActivity">{{ $t('user.viewActivity') }}</a>
              </li>
              <li v-if="canViewUserSessions">
                <a @click="viewSessions">{{ $t('user.viewSessions') }}</a>
              </li>
              <li v-if="canSendMessage">
                <a @click="sendMessage">{{ $t('user.sendMessage') }}</a>
              </li>
              <li v-if="canFollowUser">
                <a @click="followUser">{{ $t('user.follow') }}</a>
              </li>
              <li v-if="canBlockUser">
                <a @click="blockUser" class="text-error">{{ $t('user.block') }}</a>
              </li>
              <li v-if="canReportUser">
                <a @click="reportUser" class="text-error">{{ $t('user.report') }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Stats Cards -->
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div class="stat-title">{{ $t('user.totalMessages') }}</div>
            <div class="stat-value text-primary">{{ user.stats.totalMessages }}</div>
            <div class="stat-desc">{{ $t('user.allTime') }}</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="stat-title">{{ $t('user.eventsCreated') }}</div>
            <div class="stat-value text-secondary">{{ user.stats.totalEventsCreated }}</div>
            <div class="stat-desc">{{ $t('user.events') }}</div>
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
            <div class="stat-title">{{ $t('user.eventsAttended') }}</div>
            <div class="stat-value text-accent">{{ user.stats.totalEventsAttended }}</div>
            <div class="stat-desc">{{ $t('user.events') }}</div>
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
            <div class="stat-title">{{ $t('user.reputation') }}</div>
            <div class="stat-value text-info">{{ user.stats.reputationScore }}</div>
            <div class="stat-desc">{{ $t('user.points') }}</div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ $t('user.recentActivity') }}</h3>
            <div v-if="user.activityHistory.length === 0" class="text-center py-8">
              <svg
                class="w-12 h-12 mx-auto text-base-content/30 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p class="text-base-content/70">{{ $t('user.noActivityYet') }}</p>
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="activity in user.activityHistory.slice(0, 10)"
                :key="activity.id"
                class="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
              >
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center"
                    :class="getActivityIconClass(activity.type)"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="getActivityIcon(activity.type)"
                      />
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium">{{ activity.description }}</p>
                  <p class="text-xs text-base-content/70">
                    {{ formatDate(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Badges -->
        <div v-if="user.stats.badges.length > 0" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">
              {{ $t('user.badges') }}
              <span class="badge badge-primary badge-sm">{{ user.stats.badges.length }}</span>
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="badge in user.stats.badges"
                :key="badge.id"
                class="flex items-center gap-2 p-2 bg-base-200 rounded-lg"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  :style="{ backgroundColor: badge.color }"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="badge.icon" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ badge.name }}</p>
                  <p class="text-xs text-base-content/70 truncate">{{ badge.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <div v-if="canViewUserPermissions" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ $t('user.permissions') }}</h3>
            <div class="space-y-2">
              <div
                v-for="permission in user.permissions"
                :key="permission"
                class="badge badge-outline"
              >
                {{ $t(`user.permissions.${permission}`) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div v-if="canViewContactInfo" class="card bg-base-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title text-lg mb-4">{{ $t('user.contactInfo') }}</h3>
            <div class="space-y-3">
              <div v-if="canViewUserInfo(user.id, 'email')" class="flex items-center gap-2">
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
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-sm">{{ user.email }}</span>
              </div>

              <div
                v-if="user.phone && canViewUserInfo(user.id, 'phone')"
                class="flex items-center gap-2"
              >
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span class="text-sm">{{ user.phone }}</span>
              </div>

              <div v-if="user.website" class="flex items-center gap-2">
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                <a
                  :href="user.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-primary hover:underline"
                >
                  {{ user.website }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="flex justify-center py-8">
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
      {{ $t('common.retry') }}
    </button>
  </div>

  <!-- Not Found State -->
  <div v-else class="text-center py-12">
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
    <h3 class="text-lg font-semibold mb-2">{{ $t('user.userNotFound') }}</h3>
    <p class="text-base-content/70 mb-4">{{ $t('user.userNotFoundDescription') }}</p>
    <button class="btn btn-primary" @click="$emit('back-to-list')">
      {{ $t('user.backToList') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/hub/user'
import { usePermissions } from '@/composables/usePermissions'
import type { UserProfile } from '@/types/user'

interface Props {
  userId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'edit-profile', user: UserProfile): void
  (event: 'manage-user', user: UserProfile): void
  (event: 'view-activity', user: UserProfile): void
  (event: 'view-sessions', user: UserProfile): void
  (event: 'send-message', user: UserProfile): void
  (event: 'follow-user', user: UserProfile): void
  (event: 'block-user', user: UserProfile): void
  (event: 'report-user', user: UserProfile): void
  (event: 'back-to-list'): void
}>()

const { t } = useI18n()
const userStore = useUserStore()
const { canPerformActionOnUser, canViewUserInfo } = usePermissions()

// Reactive data
const user = ref<UserProfile | null>(null)

// Computed properties
const { loading, error } = userStore

const canEditProfile = computed(() => canPerformActionOnUser(props.userId, 'edit_profile'))
const canManageUser = computed(() => canPerformActionOnUser(props.userId, 'change_role'))
const canViewUserActivity = computed(() => canPerformActionOnUser(props.userId, 'view_activity'))
const canViewUserSessions = computed(() => canPerformActionOnUser(props.userId, 'view_sessions'))
const canSendMessage = computed(() => canPerformActionOnUser(props.userId, 'send_message'))
const canFollowUser = computed(() => canPerformActionOnUser(props.userId, 'follow_user'))
const canBlockUser = computed(() => canPerformActionOnUser(props.userId, 'block_user'))
const canReportUser = computed(() => canPerformActionOnUser(props.userId, 'report_user'))
const canViewUserPermissions = computed(() =>
  canPerformActionOnUser(props.userId, 'view_permissions'),
)
const canViewContactInfo = computed(
  () =>
    canViewUserInfo(props.userId, 'email') ||
    canViewUserInfo(props.userId, 'phone') ||
    !!user.value?.website,
)

const hasVisibleSocialLinks = computed(() => {
  if (!user.value?.socialLinks) return false
  return Object.values(user.value.socialLinks).some((link) => link)
})

// Methods
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    login:
      'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
    logout:
      'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    message_sent:
      'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    event_created:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    profile_updated: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    badge_earned:
      'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  }
  return icons[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

function getActivityIconClass(type: string): string {
  const classes: Record<string, string> = {
    login: 'bg-success text-success-content',
    logout: 'bg-warning text-warning-content',
    message_sent: 'bg-info text-info-content',
    event_created: 'bg-primary text-primary-content',
    profile_updated: 'bg-secondary text-secondary-content',
    badge_earned: 'bg-accent text-accent-content',
  }
  return classes[type] || 'bg-base-300 text-base-content'
}

function editProfile() {
  if (user.value) emit('edit-profile', user.value)
}

function manageUser() {
  if (user.value) emit('manage-user', user.value)
}

function viewActivity() {
  if (user.value) emit('view-activity', user.value)
}

function viewSessions() {
  if (user.value) emit('view-sessions', user.value)
}

function sendMessage() {
  if (user.value) emit('send-message', user.value)
}

function followUser() {
  if (user.value) emit('follow-user', user.value)
}

function blockUser() {
  if (user.value) emit('block-user', user.value)
}

function reportUser() {
  if (user.value) emit('report-user', user.value)
}

function retry() {
  userStore.fetchUserProfile(props.userId)
}

// Lifecycle
onMounted(() => {
  userStore.fetchUserProfile(props.userId)
})

// Watch for user changes
watch(
  () => userStore.users,
  (users) => {
    const foundUser = users.find((u) => u.id === props.userId)
    if (foundUser) {
      user.value = foundUser
    }
  },
)

// Watch for userId changes
watch(
  () => props.userId,
  (newUserId) => {
    if (newUserId) {
      userStore.fetchUserProfile(newUserId)
    }
  },
)
</script>

<style scoped>
.user-profile {
  @apply space-y-6;
}

.profile-header {
  @apply border-b border-base-300 pb-6;
}

.avatar {
  @apply relative;
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

.badge {
  @apply transition-all duration-200;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.dropdown-content {
  @apply z-50;
}
</style>
