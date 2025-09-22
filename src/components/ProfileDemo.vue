<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account-cog</v-icon>
            Profile API Demo
          </v-card-title>

          <v-card-text>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-4"
              text="This demo shows how to use the Profile API endpoints. Make sure you're logged in and the backend server is running on localhost:8000."
            />

            <v-alert
              v-if="!isAuthenticated"
              type="warning"
              variant="tonal"
              class="mb-4"
              text="You need to be logged in to use the Profile API. Please log in first."
            />

            <v-alert
              v-else-if="profileStore.error && profileStore.error.includes('Network Error')"
              type="warning"
              variant="tonal"
              class="mb-4"
              text="Network Error: Make sure the backend server is running on localhost:8000. You may need to start the Django backend server first."
            />

            <v-alert
              v-else
              type="success"
              variant="tonal"
              class="mb-4"
              :text="`Authenticated with token length: ${authStore.accessToken?.length || 0} characters`"
            />

            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title>Profile Store Actions</v-card-title>
                  <v-card-text>
                    <v-list density="compact">
                      <v-list-item>
                        <v-btn
                          @click="loadProfile"
                          color="primary"
                          variant="outlined"
                          size="small"
                          :loading="profileStore.loading"
                          :disabled="!isAuthenticated"
                          class="me-2"
                        >
                          Load Profile
                        </v-btn>
                        <span class="text-caption">Fetch current user profile</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="loadStats"
                          color="primary"
                          variant="outlined"
                          size="small"
                          :loading="profileStore.loading"
                          :disabled="!isAuthenticated"
                          class="me-2"
                        >
                          Load Stats
                        </v-btn>
                        <span class="text-caption">Fetch profile statistics</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="loadGroups"
                          color="primary"
                          variant="outlined"
                          size="small"
                          :loading="profileStore.loading"
                          :disabled="!isAuthenticated"
                          class="me-2"
                        >
                          Load Groups
                        </v-btn>
                        <span class="text-caption">Fetch available groups</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="loadRoles"
                          color="primary"
                          variant="outlined"
                          size="small"
                          :loading="profileStore.loading"
                          :disabled="!isAuthenticated"
                          class="me-2"
                        >
                          Load Roles
                        </v-btn>
                        <span class="text-caption">Fetch available roles</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="checkBackendHealth"
                          color="secondary"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Check Backend
                        </v-btn>
                        <span class="text-caption">Test backend connectivity</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="checkAuthStatus"
                          color="info"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Check Auth
                        </v-btn>
                        <span class="text-caption">Check authentication status</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="testDirectAPI"
                          color="warning"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Test Direct API
                        </v-btn>
                        <span class="text-caption">Test API call with manual headers</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="testBackendEndpoints"
                          color="error"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Test All Endpoints
                        </v-btn>
                        <span class="text-caption">Test all backend endpoints</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="checkAuthStatus"
                          color="info"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Check Auth Status
                        </v-btn>
                        <span class="text-caption">Debug authentication details</span>
                      </v-list-item>

                      <v-list-item>
                        <v-btn
                          @click="verifyToken"
                          color="success"
                          variant="outlined"
                          size="small"
                          class="me-2"
                        >
                          Verify Token
                        </v-btn>
                        <span class="text-caption">Verify JWT token validity</span>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title>Profile Data</v-card-title>
                  <v-card-text>
                    <div v-if="profileStore.loading" class="text-center py-4">
                      <v-progress-circular indeterminate color="primary" />
                      <p class="mt-2">Loading...</p>
                    </div>

                    <div v-else-if="profileStore.error" class="text-center py-4">
                      <v-alert type="error" variant="tonal">
                        {{ profileStore.error }}
                      </v-alert>
                    </div>

                    <div v-else-if="profileStore.profile">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Name</v-list-item-title>
                          <template #append>
                            <span class="text-caption">
                              {{ profileStore.profile.first_name }}
                              {{ profileStore.profile.last_name }}
                            </span>
                          </template>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-title>Email</v-list-item-title>
                          <template #append>
                            <span class="text-caption">{{ profileStore.profile.email }}</span>
                          </template>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-title>Username</v-list-item-title>
                          <template #append>
                            <span class="text-caption">{{ profileStore.profile.username }}</span>
                          </template>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-title>Profile Completion</v-list-item-title>
                          <template #append>
                            <v-chip size="small" color="primary">
                              {{ Math.round(profileStore.profileCompletion) }}%
                            </v-chip>
                          </template>
                        </v-list-item>

                        <v-list-item>
                          <v-list-item-title>Active Groups</v-list-item-title>
                          <template #append>
                            <v-chip size="small" color="success">
                              {{ profileStore.activeGroups.length }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </div>

                    <div v-else class="text-center py-4">
                      <v-icon size="64" color="grey">mdi-account-outline</v-icon>
                      <p class="text-grey">No profile data loaded</p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Groups and Roles Data -->
            <v-row
              v-if="profileStore.groups.length > 0 || profileStore.roles.length > 0"
              class="mt-4"
            >
              <v-col cols="12" md="6" v-if="profileStore.groups.length > 0">
                <v-card variant="outlined">
                  <v-card-title>Available Groups</v-card-title>
                  <v-card-text>
                    <v-list density="compact">
                      <v-list-item v-for="group in profileStore.groups" :key="group.id">
                        <v-list-item-title>{{ group.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ group.description }}</v-list-item-subtitle>
                        <template #append>
                          <v-chip
                            :color="group.is_active ? 'success' : 'error'"
                            size="small"
                            variant="tonal"
                          >
                            {{ group.is_active ? 'Active' : 'Inactive' }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6" v-if="profileStore.roles.length > 0">
                <v-card variant="outlined">
                  <v-card-title>Available Roles</v-card-title>
                  <v-card-text>
                    <v-list density="compact">
                      <v-list-item v-for="role in profileStore.roles" :key="role.id">
                        <v-list-item-title>{{ role.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ role.description }}</v-list-item-subtitle>
                        <template #append>
                          <v-chip
                            :color="role.is_active ? 'success' : 'error'"
                            size="small"
                            variant="tonal"
                          >
                            {{ role.is_active ? 'Active' : 'Inactive' }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- API Response Display -->
            <v-row v-if="apiResponse" class="mt-4">
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title>API Response</v-card-title>
                  <v-card-text>
                    <v-textarea
                      :model-value="JSON.stringify(apiResponse, null, 2)"
                      readonly
                      variant="outlined"
                      rows="10"
                      class="font-mono text-caption"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const apiResponse = ref<any>(null)

const isAuthenticated = computed(() => {
  return authStore.accessToken && authStore.accessToken.length > 0
})

const loadProfile = async () => {
  try {
    console.log('Auth Store State:', {
      accessToken: authStore.accessToken ? 'Present' : 'Missing',
      refreshToken: authStore.refreshToken ? 'Present' : 'Missing',
      tokenLength: authStore.accessToken?.length || 0,
    })

    const response = await profileStore.fetchProfile()
    apiResponse.value = response
  } catch (error: any) {
    console.error('Failed to load profile:', error)
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
    })
  }
}

const loadStats = async () => {
  try {
    const response = await profileStore.fetchStats()
    apiResponse.value = response
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

const loadGroups = async () => {
  try {
    const response = await profileStore.fetchGroups()
    apiResponse.value = response
  } catch (error) {
    console.error('Failed to load groups:', error)
  }
}

const loadRoles = async () => {
  try {
    const response = await profileStore.fetchRoles()
    apiResponse.value = response
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

const checkBackendHealth = async () => {
  try {
    const isProduction = window.location.hostname === 'naboomneighbornet.net.za'
    const apiBase = isProduction
      ? 'https://naboomneighbornet.net.za/api'
      : 'http://localhost:8000/api'
    const response = await fetch(apiBase + '/')
    if (response.ok) {
      console.log('Backend is reachable')
      return true
    } else {
      console.log('Backend returned error:', response.status)
      return false
    }
  } catch (error) {
    console.log('Backend is not reachable:', error)
    return false
  }
}

const checkAuthStatus = () => {
  console.log('=== Authentication Status Check ===')
  console.log('Access Token:', authStore.accessToken ? 'Present' : 'Missing')
  console.log('Refresh Token:', authStore.refreshToken ? 'Present' : 'Missing')
  console.log('Token Length:', authStore.accessToken?.length || 0)
  console.log('Is Authenticated:', isAuthenticated.value)
  console.log(
    'Local Storage Access Token:',
    localStorage.getItem('accessToken') ? 'Present' : 'Missing',
  )
  console.log(
    'Local Storage Refresh Token:',
    localStorage.getItem('refreshToken') ? 'Present' : 'Missing',
  )

  if (authStore.accessToken) {
    console.log('Token Preview:', authStore.accessToken.substring(0, 50) + '...')
    console.log('Token Parts:', authStore.accessToken.split('.').length)

    // Try to decode the JWT payload (without verification)
    try {
      const tokenParts = authStore.accessToken.split('.')
      if (tokenParts.length === 3 && tokenParts[1]) {
        const payload = JSON.parse(atob(tokenParts[1]))
        console.log('Token Payload:', payload)
        console.log('Token Expiry:', new Date(payload.exp * 1000))
        console.log('Token Issued:', new Date(payload.iat * 1000))
      } else {
        console.error('Invalid JWT format - expected 3 parts, got', tokenParts.length)
      }
    } catch (e) {
      console.error('Failed to decode token:', e)
    }
  }

  // Test a simple API call to see if auth is working
  if (authStore.accessToken) {
    console.log('Testing authenticated API call...')
    loadProfile()
  } else {
    console.warn('No access token available for testing')
  }
}

const testDirectAPI = async () => {
  console.log('=== Testing Direct API Call ===')

  if (!authStore.accessToken) {
    console.error('No access token available')
    return
  }

  try {
    const isProduction = window.location.hostname === 'naboomneighbornet.net.za'
    const apiBase = isProduction ? 'https://naboomneighbornet.net.za' : 'http://localhost:8000'
    const response = await fetch(`${apiBase}/api/v2/user-profiles/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    console.log('Direct API Response Status:', response.status)
    console.log('Direct API Response Headers:', Object.fromEntries(response.headers.entries()))

    if (response.ok) {
      const data = await response.json()
      console.log('Direct API Response Data:', data)
      apiResponse.value = data
    } else {
      const errorText = await response.text()
      console.error('Direct API Error Status:', response.status)
      console.error('Direct API Error Text:', errorText)

      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText)
        console.error('Direct API Error JSON:', errorJson)
      } catch (e) {
        console.error('Error response is not JSON, likely HTML error page')
      }
    }
  } catch (error) {
    console.error('Direct API Call Failed:', error)
  }
}

const testBackendEndpoints = async () => {
  console.log('=== Testing Backend Endpoints ===')

  const endpoints = [
    '/api/v2/',
    '/api/v2/user-profiles/',
    '/api/v2/user-groups/',
    '/api/v2/user-roles/',
    '/api/auth/jwt/verify/',
  ]

  const isProduction = window.location.hostname === 'naboomneighbornet.net.za'
  const apiBase = isProduction ? 'https://naboomneighbornet.net.za' : 'http://localhost:8000'

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`)
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      console.log(`${endpoint} - Status: ${response.status}`)

      if (response.status === 200) {
        const data = await response.json()
        console.log(`${endpoint} - Success:`, data)
      } else {
        const text = await response.text()
        console.log(`${endpoint} - Error:`, text.substring(0, 200) + '...')
      }
    } catch (error) {
      console.error(`${endpoint} - Failed:`, error)
    }
  }
}

const verifyToken = async () => {
  console.log('=== Verifying JWT Token ===')

  if (!authStore.accessToken) {
    console.error('No access token available')
    return
  }

  try {
    const isProduction = window.location.hostname === 'naboomneighbornet.net.za'
    const apiBase = isProduction ? 'https://naboomneighbornet.net.za' : 'http://localhost:8000'
    const response = await fetch(`${apiBase}/api/auth/jwt/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token: authStore.accessToken,
      }),
    })

    console.log('Token Verification Status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('Token is valid:', data)
    } else {
      const errorText = await response.text()
      console.error('Token verification failed:', errorText)
    }
  } catch (error) {
    console.error('Token verification error:', error)
  }
}
</script>
