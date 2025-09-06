<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { i18n } from '@/plugins/i18n'
import AuthNav from '@/components/AuthNav.vue'
import ProfileDemo from '@/components/ProfileDemo.vue'

const pages = ref<any[]>([])
const locale = computed(() => (i18n.global.locale.value === 'af' ? 'af' : 'en'))

onMounted(async () => {
  const base = import.meta.env.VITE_API_V2_BASE || '/api/v2'
  const res = await fetch(`${base}/pages/?locale=${locale.value}&limit=20&fields=title,id`)
  const data = await res.json()
  pages.value = data.items || []
})
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Navigation -->
    <AuthNav />

    <!-- Hero Section -->
    <div class="hero bg-gradient-to-r from-primary/10 to-secondary/10">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="flex justify-center mb-4">
            <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-16 h-16 object-contain" />
          </div>
          <h1 class="text-5xl font-bold text-primary">Welcome to Your Farm Community</h1>
          <p class="py-6 text-base-content">
            Your agricultural community security dashboard is ready. Stay connected, stay safe, and
            protect your harvest.
          </p>
          <div class="join">
            <button class="btn btn-accent join-item">🚨 Emergency Alert</button>
            <button class="btn btn-secondary join-item">📊 Farm Status</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <!-- Profile Demo Section -->
      <div class="mb-8">
        <ProfileDemo />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Farm Community Card -->
        <div class="card bg-base-100 shadow-lg border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-secondary">
              <span class="text-2xl">🌾</span>
              Farm Community
            </h2>
            <div class="space-y-2">
              <div v-if="pages.length === 0" class="text-base-content/70">
                <span class="loading loading-spinner loading-sm"></span>
                Loading pages...
              </div>
              <div v-else>
                <div v-for="p in pages" :key="p.id" class="badge badge-outline badge-lg">
                  {{ p.title }}
                </div>
              </div>
            </div>
            <div class="card-actions justify-end">
              <button class="btn btn-secondary btn-sm">View All</button>
            </div>
          </div>
        </div>

        <!-- Farm Security Card -->
        <div class="card bg-base-100 shadow-lg border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-accent">
              <span class="text-2xl">🚨</span>
              Farm Security
            </h2>
            <div class="stats stats-vertical">
              <div class="stat">
                <div class="stat-title">Active Farms</div>
                <div class="stat-value text-primary">12</div>
                <div class="stat-desc">Connected neighbors</div>
              </div>
              <div class="stat">
                <div class="stat-title">Security Alerts</div>
                <div class="stat-value text-warning">0</div>
                <div class="stat-desc">Last 24 hours</div>
              </div>
            </div>
            <div class="card-actions justify-end">
              <button class="btn btn-accent btn-sm">View Details</button>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="card bg-base-100 shadow-lg border border-base-300">
          <div class="card-body">
            <h2 class="card-title text-info">
              <span class="text-2xl">⚡</span>
              Quick Actions
            </h2>
            <div class="space-y-3">
              <button class="btn btn-outline btn-primary w-full justify-start">
                <span class="text-lg">🚨</span>
                Report Emergency
              </button>
              <button class="btn btn-outline btn-secondary w-full justify-start">
                <span class="text-lg">👥</span>
                Contact Neighbors
              </button>
              <button class="btn btn-outline btn-accent w-full justify-start">
                <span class="text-lg">📱</span>
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-base-200 text-base-content">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
          <span class="font-semibold text-lg">Naboom NeighborNet</span>
        </div>
        <p>© 2024 Agricultural Community Security Platform</p>
      </div>
    </footer>
  </div>
</template>
