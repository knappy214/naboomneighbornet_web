<script setup lang="ts">
import AuthNav from './AuthNav.vue'
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-dot-pattern"></div>
    </div>

    <!-- Header -->
    <AuthNav />

    <!-- Main Content -->
    <div class="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div class="w-full max-w-lg">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-4 bg-base-100/50 backdrop-blur-sm text-base-content">
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-6 h-6 object-contain" />
          <span class="font-semibold">Naboom NeighborNet</span>
        </div>
        <p class="text-sm opacity-70">© 2024 Agricultural community security platform.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.bg-dot-pattern {
  background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
