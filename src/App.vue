<script setup lang="ts">
// Community Security Theme Demo
// This component showcases the custom DaisyUI theme colors and components
import { ref } from 'vue'

const themes = ['community-security', 'community-security-dark', 'light']
const currentThemeIndex = ref(0)

const currentTheme = ref(themes[currentThemeIndex.value])

const cycleTheme = () => {
  currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length
  currentTheme.value = themes[currentThemeIndex.value]
  document.documentElement.setAttribute('data-theme', currentTheme.value)
}

const getThemeDisplayName = (theme: string) => {
  switch (theme) {
    case 'community-security':
      return 'Community Security (Light)'
    case 'community-security-dark':
      return 'Community Security (Dark)'
    case 'light':
      return 'DaisyUI Light'
    default:
      return theme
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-100" :data-theme="currentTheme">
    <!-- Theme Switcher -->
    <div class="navbar bg-base-200 shadow-sm">
      <div class="navbar-start">
        <h1 class="text-xl font-bold text-primary">{{ getThemeDisplayName(currentTheme) }}</h1>
      </div>
      <div class="navbar-end">
        <button @click="cycleTheme" class="btn btn-primary btn-sm">Switch Theme</button>
      </div>
    </div>

    <!-- Debug Color Swatches -->
    <div class="p-4 bg-base-200">
      <h2 class="text-lg font-bold mb-4">Theme Color Test</h2>
      <div class="flex flex-wrap gap-4">
        <div
          class="w-20 h-20 bg-primary rounded-lg flex items-center justify-center text-primary-content font-bold"
        >
          Primary
        </div>
        <div
          class="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-content font-bold"
        >
          Secondary
        </div>
        <div
          class="w-20 h-20 bg-accent rounded-lg flex items-center justify-center text-accent-content font-bold"
        >
          Accent
        </div>
        <div
          class="w-20 h-20 bg-base-100 rounded-lg border border-base-300 flex items-center justify-center text-base-content font-bold"
        >
          Base
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold text-primary">Naboom NeighborNet</h1>
          <p class="py-6 text-base-content">Community security and neighborhood watch platform</p>
          <button class="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Security Card -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-secondary">Community Security</h2>
            <p class="text-base-content">
              Keep your neighborhood safe with real-time alerts and community reporting.
            </p>
            <div class="card-actions justify-end">
              <button class="btn btn-secondary btn-sm">Learn More</button>
            </div>
          </div>
        </div>

        <!-- Watch Card -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-accent">Neighborhood Watch</h2>
            <p class="text-base-content">
              Coordinate with neighbors to maintain vigilance and safety.
            </p>
            <div class="card-actions justify-end">
              <button class="btn btn-accent btn-sm">Join Watch</button>
            </div>
          </div>
        </div>

        <!-- Alert Card -->
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title text-info">Emergency Alerts</h2>
            <p class="text-base-content">Get instant notifications about incidents in your area.</p>
            <div class="card-actions justify-end">
              <button class="btn btn-info btn-sm">Set Alerts</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Indicators -->
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-wrap gap-4 justify-center">
        <div class="badge badge-success badge-lg">Safe Zone</div>
        <div class="badge badge-warning badge-lg">Caution Area</div>
        <div class="badge badge-error badge-lg">Incident Reported</div>
        <div class="badge badge-info badge-lg">Patrol Active</div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="container mx-auto px-4 py-8 text-center">
      <div class="join">
        <button class="btn join-item btn-primary">Report Incident</button>
        <button class="btn join-item btn-secondary">Request Patrol</button>
        <button class="btn join-item btn-accent">Community Chat</button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-base-200 text-base-content">
      <div>
        <p>Copyright © 2024 - All rights reserved by Naboom NeighborNet</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Component-specific styles can go here if needed */
</style>
