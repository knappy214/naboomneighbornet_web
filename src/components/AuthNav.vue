<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLocaleRouter } from '@/composables/useLocaleRouter'
import ThemeSwitcher from './ThemeSwitcher.vue'

const authStore = useAuthStore()
const { goToDashboard, goToLogin, getLocalizedPath } = useLocaleRouter()

const isAuthenticated = computed(() => {
  return authStore.accessToken && authStore.accessToken.length > 0
})

const logout = () => {
  authStore.clear()
  goToLogin()
}
</script>

<template>
  <div class="navbar bg-base-100/80 backdrop-blur-sm shadow-sm">
    <div class="navbar-start">
      <router-link
        :to="getLocalizedPath('/dashboard')"
        class="btn btn-ghost text-xl font-bold text-primary flex items-center gap-3"
      >
        <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
        Naboom NeighborNet
      </router-link>
    </div>

    <!-- Navigation Links for Authenticated Users -->
    <div v-if="isAuthenticated" class="navbar-center hidden md:flex">
      <ul class="menu menu-horizontal px-1">
        <li>
          <router-link :to="getLocalizedPath('/dashboard')" class="btn btn-ghost">
            <span class="text-lg">🏠</span>
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link :to="getLocalizedPath('/profile')" class="btn btn-ghost">
            <span class="text-lg">👤</span>
            Profile
          </router-link>
        </li>
      </ul>
    </div>

    <div class="navbar-end">
      <!-- Authenticated User Menu -->
      <div v-if="isAuthenticated" class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
          <div
            class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center"
          >
            <span class="text-sm font-bold">U</span>
          </div>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-lg"
        >
          <li class="menu-title">
            <span>Account</span>
          </li>
          <li>
            <router-link :to="getLocalizedPath('/dashboard')" class="flex items-center gap-2">
              <span class="text-lg">🏠</span>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li>
            <router-link :to="getLocalizedPath('/profile')" class="flex items-center gap-2">
              <span class="text-lg">👤</span>
              <span>Profile</span>
            </router-link>
          </li>
          <li>
            <a class="flex items-center gap-2">
              <span class="text-lg">⚙️</span>
              <span>Settings</span>
            </a>
          </li>
          <li><div class="divider my-1"></div></li>
          <li>
            <button @click="logout" class="flex items-center gap-2 text-error">
              <span class="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>

      <!-- Guest User Menu -->
      <div v-else class="flex items-center gap-2">
        <router-link :to="getLocalizedPath('/login')" class="btn btn-primary btn-sm">
          Login
        </router-link>
        <router-link :to="getLocalizedPath('/register')" class="btn btn-outline btn-sm">
          Register
        </router-link>
      </div>

      <div class="divider divider-horizontal mx-2"></div>
      <ThemeSwitcher />
    </div>
  </div>
</template>
