<template>
  <div class="card bg-base-100 shadow-lg border border-base-200 max-w-2xl mx-auto">
    <div class="card-body p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="card-title text-xl">
          <span class="text-2xl">🔐</span>
          Authentication Debug Panel
        </h2>
        <button class="btn btn-ghost btn-sm" @click="refreshDebugInfo" :disabled="isLoading">
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="debugInfo.accessToken.isExpired" role="alert" class="alert alert-warning mb-4">
        <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <h3 class="font-bold">⚠️ Access Token Expired</h3>
          <div class="text-xs">
            Your access token has expired. Try refreshing or logging in again.
          </div>
        </div>
      </div>

      <div v-if="!debugInfo.isAuthenticated" role="alert" class="alert alert-error mb-4">
        <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">❌ Not Authenticated</h3>
          <div class="text-xs">No access token found. Please log in.</div>
        </div>
      </div>

      <div
        v-if="debugInfo.isAuthenticated && !debugInfo.accessToken.isExpired"
        role="alert"
        class="alert alert-success mb-4"
      >
        <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">✅ Authenticated</h3>
          <div class="text-xs">You are successfully authenticated.</div>
        </div>
      </div>

      <!-- Collapsible Sections -->
      <div class="space-y-4">
        <!-- Access Token Details -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="radio" name="debug-accordion" />
          <div class="collapse-title text-lg font-medium">
            <span class="text-xl mr-2">🎫</span>
            Access Token Details
          </div>
          <div class="collapse-content">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="font-medium">Status</span>
                <div
                  class="badge"
                  :class="debugInfo.accessToken.isValid ? 'badge-success' : 'badge-error'"
                >
                  {{ debugInfo.accessToken.isValid ? 'Valid' : 'Invalid' }}
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium">Expired</span>
                <div
                  class="badge"
                  :class="debugInfo.accessToken.isExpired ? 'badge-error' : 'badge-success'"
                >
                  {{ debugInfo.accessToken.isExpired ? 'Yes' : 'No' }}
                </div>
              </div>
              <div v-if="debugInfo.accessToken.expiresAt" class="flex justify-between items-center">
                <span class="font-medium">Expires At</span>
                <span class="text-sm text-base-content/70">{{
                  formatDate(debugInfo.accessToken.expiresAt)
                }}</span>
              </div>
              <div v-if="debugInfo.accessToken.issuedAt" class="flex justify-between items-center">
                <span class="font-medium">Issued At</span>
                <span class="text-sm text-base-content/70">{{
                  formatDate(debugInfo.accessToken.issuedAt)
                }}</span>
              </div>
              <div v-if="debugInfo.accessToken.error" class="flex justify-between items-center">
                <span class="font-medium">Error</span>
                <span class="text-sm text-error">{{ debugInfo.accessToken.error }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Refresh Token Details -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="radio" name="debug-accordion" />
          <div class="collapse-title text-lg font-medium">
            <span class="text-xl mr-2">🔄</span>
            Refresh Token Details
          </div>
          <div class="collapse-content">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="font-medium">Status</span>
                <div
                  class="badge"
                  :class="debugInfo.refreshToken.isValid ? 'badge-success' : 'badge-error'"
                >
                  {{ debugInfo.refreshToken.isValid ? 'Valid' : 'Invalid' }}
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium">Expired</span>
                <div
                  class="badge"
                  :class="debugInfo.refreshToken.isExpired ? 'badge-error' : 'badge-success'"
                >
                  {{ debugInfo.refreshToken.isExpired ? 'Yes' : 'No' }}
                </div>
              </div>
              <div
                v-if="debugInfo.refreshToken.expiresAt"
                class="flex justify-between items-center"
              >
                <span class="font-medium">Expires At</span>
                <span class="text-sm text-base-content/70">{{
                  formatDate(debugInfo.refreshToken.expiresAt)
                }}</span>
              </div>
              <div v-if="debugInfo.refreshToken.error" class="flex justify-between items-center">
                <span class="font-medium">Error</span>
                <span class="text-sm text-error">{{ debugInfo.refreshToken.error }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Local Storage -->
        <div class="collapse collapse-arrow bg-base-200">
          <input type="radio" name="debug-accordion" />
          <div class="collapse-title text-lg font-medium">
            <span class="text-xl mr-2">💾</span>
            Local Storage
          </div>
          <div class="collapse-content">
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="font-medium">Access Token</span>
                <div
                  class="badge"
                  :class="debugInfo.localStorage.accessToken ? 'badge-success' : 'badge-error'"
                >
                  {{ debugInfo.localStorage.accessToken ? 'Present' : 'Missing' }}
                </div>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-medium">Refresh Token</span>
                <div
                  class="badge"
                  :class="debugInfo.localStorage.refreshToken ? 'badge-success' : 'badge-error'"
                >
                  {{ debugInfo.localStorage.refreshToken ? 'Present' : 'Missing' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider my-6"></div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-outline btn-sm" @click="testAPIAuth" :disabled="isTestingAPI">
          <span v-if="isTestingAPI" class="loading loading-spinner loading-xs"></span>
          <span v-else class="text-lg">🧪</span>
          Test API Auth
        </button>
        <button class="btn btn-outline btn-warning btn-sm" @click="clearAuth">
          <span class="text-lg">🧹</span>
          Clear Auth
        </button>
        <button class="btn btn-outline btn-info btn-sm" @click="openConsole">
          <span class="text-lg">🖥️</span>
          Open Console
        </button>
      </div>

      <!-- Test Result Alert -->
      <div
        v-if="testResult"
        role="alert"
        class="alert mt-4"
        :class="testResult.success ? 'alert-success' : 'alert-error'"
      >
        <svg class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path
            v-if="testResult.success"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 class="font-bold">
            {{ testResult.success ? '✅ API Test Successful' : '❌ API Test Failed' }}
          </h3>
          <div v-if="testResult.message" class="text-sm">{{ testResult.message }}</div>
          <div v-if="testResult.details" class="mt-2">
            <strong class="text-sm">Details:</strong>
            <pre class="mt-1 text-xs bg-base-300 p-2 rounded overflow-x-auto">{{
              JSON.stringify(testResult.details, null, 2)
            }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  getAuthDebugInfo,
  testAPIAuth as debugTestAPIAuth,
  clearAuth as debugClearAuth,
} from '@/utils/authDebug'
import type { AuthDebugInfo } from '@/utils/authDebug'

const debugInfo = ref<AuthDebugInfo>(getAuthDebugInfo())
const isLoading = ref(false)
const isTestingAPI = ref(false)
const testResult = ref<{
  success: boolean
  message: string
  details?: any
} | null>(null)

const refreshDebugInfo = () => {
  isLoading.value = true
  setTimeout(() => {
    debugInfo.value = getAuthDebugInfo()
    isLoading.value = false
  }, 500)
}

const testAPIAuth = async () => {
  isTestingAPI.value = true
  testResult.value = null

  try {
    await debugTestAPIAuth()
    testResult.value = {
      success: true,
      message: 'API authentication test completed successfully!',
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || 'API authentication test failed',
      details: error.response?.data || error,
    }
  } finally {
    isTestingAPI.value = false
    refreshDebugInfo()
  }
}

const clearAuth = () => {
  debugClearAuth()
  refreshDebugInfo()
  testResult.value = null
}

const openConsole = () => {
  console.log('🔧 Available debugging commands:')
  console.log('  - authDebug.logAuthStatus() - Show current auth status')
  console.log('  - authDebug.testAPIAuth() - Test API authentication')
  console.log('  - authDebug.clearAuth() - Clear all auth data')
  console.log('  - authDebug.checkNetworkRequests() - Show network debugging guide')
}

const formatDate = (date: Date | null) => {
  if (!date) return 'N/A'
  return date.toLocaleString()
}

onMounted(() => {
  refreshDebugInfo()
})
</script>
