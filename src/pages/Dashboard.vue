<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navigation -->
    <AuthNav />

    <!-- Hero Section -->
    <div class="hero bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12">
      <div class="hero-content text-center max-w-6xl">
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-4 mb-6">
            <div class="avatar">
              <div class="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src="/logo.png" alt="Naboom NeighborNet Logo" />
              </div>
            </div>
            <div class="text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-base-content drop-shadow-lg">
                SafeNaboom
              </h1>
              <p class="text-lg text-base-content/90 drop-shadow-md">Community Security Hub</p>
            </div>
          </div>

          <div class="max-w-3xl">
            <h2 class="text-2xl md:text-3xl font-semibold text-base-content drop-shadow-lg mb-4">
              Welcome to Your Farm Community
            </h2>
            <p class="text-lg text-base-content/90 drop-shadow-md mb-8 leading-relaxed">
              Your agricultural community security dashboard is ready. Stay connected, stay safe,
              and protect your harvest with real-time monitoring and instant alerts.
            </p>

            <!-- Quick Action Buttons -->
            <div class="flex flex-wrap justify-center gap-3 mb-8">
              <button class="btn btn-error btn-lg shadow-lg hover:shadow-xl transition-all">
                <span class="text-xl">🚨</span>
                Emergency Alert
              </button>
              <button class="btn btn-warning btn-lg shadow-lg hover:shadow-xl transition-all">
                <span class="text-xl">📊</span>
                Farm Status
              </button>
              <button class="btn btn-info btn-lg shadow-lg hover:shadow-xl transition-all">
                <span class="text-xl">👥</span>
                Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Debug Panel (Development Only) -->
      <div v-if="showDebugPanel" class="mb-8">
        <AuthDebugPanel />
      </div>
      <!-- Status Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Connected Farms Card -->
        <div
          class="card bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg hover:shadow-xl transition-all"
        >
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-base-content drop-shadow-lg">12</div>
                <div class="text-sm font-medium text-base-content/90 drop-shadow-md">
                  Connected Farms
                </div>
                <div class="text-xs text-base-content/80 drop-shadow-sm mt-1">
                  Active in your network
                </div>
              </div>
              <div class="text-4xl opacity-90 drop-shadow-md">🌾</div>
            </div>
            <div class="mt-3">
              <div class="flex items-center text-xs text-base-content drop-shadow-sm">
                <span class="w-2 h-2 bg-success rounded-full mr-2 shadow-sm"></span>
                +2 this week
              </div>
            </div>
          </div>
        </div>

        <!-- Active Alerts Card -->
        <div
          class="card bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/30 shadow-lg hover:shadow-xl transition-all"
        >
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-base-content drop-shadow-lg">3</div>
                <div class="text-sm font-medium text-base-content/90 drop-shadow-md">
                  Active Alerts
                </div>
                <div class="text-xs text-base-content/80 drop-shadow-sm mt-1">
                  Requiring attention
                </div>
              </div>
              <div class="text-4xl opacity-90 drop-shadow-md">🚨</div>
            </div>
            <div class="mt-3">
              <div class="flex items-center text-xs text-base-content drop-shadow-sm">
                <span class="w-2 h-2 bg-warning rounded-full mr-2 shadow-sm"></span>
                1 high priority
              </div>
            </div>
          </div>
        </div>

        <!-- Neighbors Online Card -->
        <div
          class="card bg-gradient-to-br from-info/20 to-info/10 border border-info/30 shadow-lg hover:shadow-xl transition-all"
        >
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-base-content drop-shadow-lg">8</div>
                <div class="text-sm font-medium text-base-content/90 drop-shadow-md">
                  Neighbors Online
                </div>
                <div class="text-xs text-base-content/80 drop-shadow-sm mt-1">Currently active</div>
              </div>
              <div class="text-4xl opacity-90 drop-shadow-md">👥</div>
            </div>
            <div class="mt-3">
              <div class="flex items-center text-xs text-base-content drop-shadow-sm">
                <span class="w-2 h-2 bg-info rounded-full mr-2 shadow-sm"></span>
                Peak hours
              </div>
            </div>
          </div>
        </div>

        <!-- System Uptime Card -->
        <div
          class="card bg-gradient-to-br from-success/20 to-success/10 border border-success/30 shadow-lg hover:shadow-xl transition-all"
        >
          <div class="card-body p-6">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-3xl font-bold text-base-content drop-shadow-lg">99.9%</div>
                <div class="text-sm font-medium text-base-content/90 drop-shadow-md">
                  System Uptime
                </div>
                <div class="text-xs text-base-content/80 drop-shadow-sm mt-1">Last 30 days</div>
              </div>
              <div class="text-4xl opacity-90 drop-shadow-md">⚡</div>
            </div>
            <div class="mt-3">
              <div class="flex items-center text-xs text-base-content drop-shadow-sm">
                <span class="w-2 h-2 bg-success rounded-full mr-2 shadow-sm"></span>
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <!-- Farm Security Panel -->
        <div class="xl:col-span-2">
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-base-content flex items-center gap-3">
                  <div class="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">🛡️</span>
                  </div>
                  Farm Security Status
                </h2>
                <div class="badge badge-error badge-lg">3 Active Alerts</div>
              </div>

              <!-- Security Alerts -->
              <div class="space-y-3">
                <!-- High Priority Alert -->
                <div class="alert alert-error border-l-4 border-l-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-bold text-base">Intrusion Detected</h3>
                      <span class="badge badge-error badge-sm">HIGH</span>
                    </div>
                    <div class="text-sm text-base-content/70 mt-1">
                      Motion detected in restricted area - North Field
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">2 minutes ago</div>
                  </div>
                </div>

                <!-- Medium Priority Alert -->
                <div class="alert alert-warning border-l-4 border-l-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-bold text-base">Equipment Alert</h3>
                      <span class="badge badge-warning badge-sm">MEDIUM</span>
                    </div>
                    <div class="text-sm text-base-content/70 mt-1">
                      Irrigation system needs attention - Check Zone 3
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">15 minutes ago</div>
                  </div>
                </div>

                <!-- Low Priority Alert -->
                <div class="alert alert-info border-l-4 border-l-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class="font-bold text-base">Weather Warning</h3>
                      <span class="badge badge-info badge-sm">LOW</span>
                    </div>
                    <div class="text-sm text-base-content/70 mt-1">
                      High winds expected tonight - Secure equipment
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">1 hour ago</div>
                  </div>
                </div>
              </div>

              <div class="divider my-6"></div>

              <div class="flex flex-wrap gap-3">
                <button class="btn btn-primary btn-sm">
                  <span class="text-lg">➕</span>
                  Add Alert
                </button>
                <button class="btn btn-outline btn-secondary btn-sm">View All Alerts</button>
                <button class="btn btn-outline btn-accent btn-sm">Alert Settings</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body p-6">
              <h2 class="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span class="text-lg">⚡</span>
                </div>
                Quick Actions
              </h2>
              <div class="space-y-2">
                <button
                  class="btn btn-outline btn-primary w-full justify-start hover:bg-primary hover:text-primary-content transition-all"
                >
                  <span class="text-lg">🚨</span>
                  Report Emergency
                </button>
                <button
                  class="btn btn-outline btn-secondary w-full justify-start hover:bg-secondary hover:text-secondary-content transition-all"
                >
                  <span class="text-lg">👥</span>
                  Contact Neighbors
                </button>
                <button
                  class="btn btn-outline btn-accent w-full justify-start hover:bg-accent hover:text-accent-content transition-all"
                >
                  <span class="text-lg">📱</span>
                  Update Status
                </button>
                <button
                  class="btn btn-outline btn-info w-full justify-start hover:bg-info hover:text-info-content transition-all"
                >
                  <span class="text-lg">📊</span>
                  View Reports
                </button>
              </div>
            </div>
          </div>

          <!-- Weather Widget -->
          <div
            class="card bg-gradient-to-br from-info/15 to-info/8 border border-info/30 shadow-lg"
          >
            <div class="card-body p-6">
              <h2
                class="text-xl font-bold text-base-content drop-shadow-lg mb-4 flex items-center gap-2"
              >
                <div class="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                  <span class="text-lg drop-shadow-md">🌤️</span>
                </div>
                Current Weather
              </h2>
              <div class="text-center">
                <div class="text-5xl mb-3 drop-shadow-md">☀️</div>
                <div class="text-3xl font-bold text-base-content drop-shadow-lg mb-1">24°C</div>
                <div class="text-lg text-base-content/90 drop-shadow-md mb-2">Sunny</div>
                <div class="text-sm text-base-content/80 drop-shadow-sm space-y-1">
                  <div>Wind: 15 km/h NW</div>
                  <div>Humidity: 65%</div>
                  <div>UV Index: 6 (High)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card bg-base-100 shadow-lg border border-base-300">
            <div class="card-body p-6">
              <h2 class="text-xl font-bold text-base-content mb-4 flex items-center gap-2">
                <div class="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <span class="text-lg">📈</span>
                </div>
                Recent Activity
              </h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-3 h-3 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1">
                    <div class="font-medium text-sm">New farm joined network</div>
                    <div class="text-xs text-base-content/60 mt-1">
                      Johnson Family Farm connected to the community
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">2 hours ago</div>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-3 h-3 bg-info rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1">
                    <div class="font-medium text-sm">Security alert resolved</div>
                    <div class="text-xs text-base-content/60 mt-1">
                      Motion sensor false alarm cleared
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">4 hours ago</div>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-3 h-3 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div class="flex-1">
                    <div class="font-medium text-sm">Equipment status updated</div>
                    <div class="text-xs text-base-content/60 mt-1">
                      Irrigation system maintenance completed
                    </div>
                    <div class="text-xs text-base-content/50 mt-1">6 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Community Section -->
      <div class="card bg-base-100 shadow-lg border border-base-300">
        <div class="card-body p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-base-content flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🌾</span>
              </div>
              Farm Community
            </h2>
            <button class="btn btn-outline btn-primary btn-sm">View All Neighbors</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="card bg-base-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div class="card-body p-4">
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-primary text-primary-content rounded-full w-12">
                      <span class="text-lg font-bold">JS</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-base">John Smith</div>
                    <div class="text-sm text-base-content/70">North Field Farm</div>
                    <div class="flex items-center gap-1 mt-1">
                      <div class="w-2 h-2 bg-success rounded-full"></div>
                      <span class="text-xs text-success">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div class="card-body p-4">
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-secondary text-secondary-content rounded-full w-12">
                      <span class="text-lg font-bold">MJ</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-base">Mary Johnson</div>
                    <div class="text-sm text-base-content/70">South Valley Ranch</div>
                    <div class="flex items-center gap-1 mt-1">
                      <div class="w-2 h-2 bg-warning rounded-full"></div>
                      <span class="text-xs text-warning">Away</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card bg-base-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div class="card-body p-4">
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-accent text-accent-content rounded-full w-12">
                      <span class="text-lg font-bold">RB</span>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-base">Robert Brown</div>
                    <div class="text-sm text-base-content/70">East Hills Farm</div>
                    <div class="flex items-center gap-1 mt-1">
                      <div class="w-2 h-2 bg-success rounded-full"></div>
                      <span class="text-xs text-success">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-8 bg-base-200 text-base-content mt-16">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
          <span class="font-semibold text-lg">Naboom NeighborNet</span>
        </div>
        <p class="text-sm text-base-content/70">© 2024 Agricultural Community Security Platform</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AuthNav from '@/components/AuthNav.vue'
import AuthDebugPanel from '@/components/AuthDebugPanel.vue'

// Reactive data
const isOnline = ref(true)

// Debug panel (show in development)
const showDebugPanel = ref(import.meta.env.DEV)
</script>
