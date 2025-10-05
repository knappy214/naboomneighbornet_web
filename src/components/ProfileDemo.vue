<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">
          <span class="text-2xl">⚙️</span>
          Profile API Demo
        </h2>

        <div class="space-y-4">
          <!-- Info Alert -->
          <div role="alert" class="alert alert-info">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Info</h3>
              <div class="text-xs">
                This demo shows how to use the Profile API endpoints. Make sure you're logged in and
                the backend server is running on localhost:8000.
              </div>
            </div>
          </div>

          <!-- Authentication Alerts -->
          <div v-if="!isAuthenticated" role="alert" class="alert alert-warning">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Warning</h3>
              <div class="text-xs">
                You need to be logged in to use the Profile API. Please log in first.
              </div>
            </div>
          </div>

          <div
            v-else-if="profileStore.error && profileStore.error.includes('Network Error')"
            role="alert"
            class="alert alert-warning"
          >
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Network Error</h3>
              <div class="text-xs">
                Make sure the backend server is running on localhost:8000. You may need to start the
                Django backend server first.
              </div>
            </div>
          </div>

          <div v-else role="alert" class="alert alert-success">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Success</h3>
              <div class="text-xs">
                Authenticated with token length: {{ authStore.accessToken?.length || 0 }} characters
              </div>
            </div>
          </div>

          <!-- Demo Sections -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Profile Store Actions -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">Profile Store Actions</h3>
                <div class="space-y-2">
                  <button
                    class="btn btn-primary btn-sm w-full"
                    @click="profileStore.fetchProfile"
                    :disabled="profileStore.loading"
                  >
                    <span
                      v-if="profileStore.loading"
                      class="loading loading-spinner loading-xs"
                    ></span>
                    Fetch Profile
                  </button>
                  <button
                    class="btn btn-secondary btn-sm w-full"
                    @click="
                      profileStore.updateProfile({ first_name: 'Updated', last_name: 'Name' })
                    "
                    :disabled="profileStore.loading"
                  >
                    <span
                      v-if="profileStore.loading"
                      class="loading loading-spinner loading-xs"
                    ></span>
                    Update Profile
                  </button>
                  <button
                    class="btn btn-accent btn-sm w-full"
                    @click="
                      profileStore.changePassword({ old_password: 'old', new_password: 'new' })
                    "
                    :disabled="profileStore.loading"
                  >
                    <span
                      v-if="profileStore.loading"
                      class="loading loading-spinner loading-xs"
                    ></span>
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <!-- Profile Data Display -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h3 class="card-title text-lg">Profile Data</h3>
                <div v-if="profileStore.profile" class="space-y-2">
                  <div class="flex justify-between">
                    <span class="font-medium">Name:</span>
                    <span
                      >{{ profileStore.profile.first_name }}
                      {{ profileStore.profile.last_name }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Email:</span>
                    <span>{{ profileStore.profile.email }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="font-medium">Phone:</span>
                    <span>{{ profileStore.profile.phone || 'N/A' }}</span>
                  </div>
                </div>
                <div v-else class="text-base-content/60 text-sm">No profile data loaded</div>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="profileStore.error" class="alert alert-error">
            <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Error</h3>
              <div class="text-xs">{{ profileStore.error }}</div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="profileStore.loading" class="flex justify-center">
            <span class="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>
