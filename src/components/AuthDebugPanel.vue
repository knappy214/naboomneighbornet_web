<template>
  <v-card class="auth-debug-panel" elevation="2">
    <v-card-title class="d-flex align-center">
      <v-icon class="me-2">🔐</v-icon>
      Authentication Debug Panel
      <v-spacer />
      <v-btn
        icon="mdi-refresh"
        size="small"
        variant="text"
        @click="refreshDebugInfo"
        :loading="isLoading"
      />
    </v-card-title>

    <v-card-text>
      <v-alert v-if="debugInfo.accessToken.isExpired" type="warning" variant="tonal" class="mb-4">
        <v-alert-title>⚠️ Access Token Expired</v-alert-title>
        Your access token has expired. Try refreshing or logging in again.
      </v-alert>

      <v-alert v-if="!debugInfo.isAuthenticated" type="error" variant="tonal" class="mb-4">
        <v-alert-title>❌ Not Authenticated</v-alert-title>
        No access token found. Please log in.
      </v-alert>

      <v-alert
        v-if="debugInfo.isAuthenticated && !debugInfo.accessToken.isExpired"
        type="success"
        variant="tonal"
        class="mb-4"
      >
        <v-alert-title>✅ Authenticated</v-alert-title>
        You are successfully authenticated.
      </v-alert>

      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">🎫</v-icon>
            Access Token Details
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="debugInfo.accessToken.isValid ? 'success' : 'error'" size="small">
                    {{ debugInfo.accessToken.isValid ? 'Valid' : 'Invalid' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Expired</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="debugInfo.accessToken.isExpired ? 'error' : 'success'"
                    size="small"
                  >
                    {{ debugInfo.accessToken.isExpired ? 'Yes' : 'No' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="debugInfo.accessToken.expiresAt">
                <v-list-item-title>Expires At</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(debugInfo.accessToken.expiresAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="debugInfo.accessToken.issuedAt">
                <v-list-item-title>Issued At</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(debugInfo.accessToken.issuedAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="debugInfo.accessToken.error">
                <v-list-item-title>Error</v-list-item-title>
                <v-list-item-subtitle class="text-error">
                  {{ debugInfo.accessToken.error }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">🔄</v-icon>
            Refresh Token Details
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Status</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="debugInfo.refreshToken.isValid ? 'success' : 'error'"
                    size="small"
                  >
                    {{ debugInfo.refreshToken.isValid ? 'Valid' : 'Invalid' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Expired</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip
                    :color="debugInfo.refreshToken.isExpired ? 'error' : 'success'"
                    size="small"
                  >
                    {{ debugInfo.refreshToken.isExpired ? 'Yes' : 'No' }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="debugInfo.refreshToken.expiresAt">
                <v-list-item-title>Expires At</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(debugInfo.refreshToken.expiresAt) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="debugInfo.refreshToken.error">
                <v-list-item-title>Error</v-list-item-title>
                <v-list-item-subtitle class="text-error">
                  {{ debugInfo.refreshToken.error }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-title>
            <v-icon class="me-2">💾</v-icon>
            Local Storage
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Access Token</v-list-item-title>
                <v-list-item-subtitle>
                  {{ debugInfo.localStorage.accessToken ? 'Present' : 'Missing' }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Refresh Token</v-list-item-title>
                <v-list-item-subtitle>
                  {{ debugInfo.localStorage.refreshToken ? 'Present' : 'Missing' }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider class="my-4" />

      <div class="d-flex flex-wrap gap-2">
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="testAPIAuth"
          :loading="isTestingAPI"
        >
          <v-icon class="me-1">🧪</v-icon>
          Test API Auth
        </v-btn>
        <v-btn color="warning" variant="outlined" size="small" @click="clearAuth">
          <v-icon class="me-1">🧹</v-icon>
          Clear Auth
        </v-btn>
        <v-btn color="info" variant="outlined" size="small" @click="openConsole">
          <v-icon class="me-1">🖥️</v-icon>
          Open Console
        </v-btn>
      </div>

      <v-alert
        v-if="testResult"
        :type="testResult.success ? 'success' : 'error'"
        variant="tonal"
        class="mt-4"
      >
        <v-alert-title>
          {{ testResult.success ? '✅ API Test Successful' : '❌ API Test Failed' }}
        </v-alert-title>
        <div v-if="testResult.message">{{ testResult.message }}</div>
        <div v-if="testResult.details" class="mt-2">
          <strong>Details:</strong>
          <pre class="mt-1">{{ JSON.stringify(testResult.details, null, 2) }}</pre>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
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

<style scoped>
.auth-debug-panel {
  max-width: 600px;
  margin: 0 auto;
}

pre {
  font-size: 0.8em;
  background: hsl(var(--b3) / 0.05);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
