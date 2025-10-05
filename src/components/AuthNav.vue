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
  <div class="navbar bg-base-100 shadow-sm">
    <!-- Mobile Hamburger Menu -->
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li v-if="isAuthenticated">
            <router-link :to="getLocalizedPath('/dashboard')" class="flex items-center gap-2">
              <span class="text-lg">🏠</span>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link :to="getLocalizedPath('/monitor')" class="flex items-center gap-2">
              <span class="text-lg">🚨</span>
              <span>Monitor</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link :to="getLocalizedPath('/panic-dashboard')" class="flex items-center gap-2">
              <span class="text-lg">📊</span>
              <span>Panic Dashboard</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <router-link :to="getLocalizedPath('/profile')" class="flex items-center gap-2">
              <span class="text-lg">👤</span>
              <span>Profile</span>
            </router-link>
          </li>
          <li v-if="!isAuthenticated">
            <router-link :to="getLocalizedPath('/login')" class="flex items-center gap-2">
              <span class="text-lg">🔑</span>
              <span>Login</span>
            </router-link>
          </li>
          <li v-if="!isAuthenticated">
            <router-link :to="getLocalizedPath('/register')" class="flex items-center gap-2">
              <span class="text-lg">📝</span>
              <span>Register</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated">
            <div class="divider my-1"></div>
            <button @click="logout" class="flex items-center gap-2 text-error">
              <span class="text-lg">🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Centered Logo and Title -->
    <div class="navbar-center">
      <router-link
        :to="getLocalizedPath('/dashboard')"
        class="btn btn-ghost text-xl font-bold text-primary flex items-center gap-3"
      >
        <img src="/logo.png" alt="Naboom NeighborNet Logo" class="w-8 h-8 object-contain" />
        <span class="hidden sm:inline">Naboom NeighborNet</span>
        <span class="sm:hidden">Naboom</span>
      </router-link>
    </div>

    <!-- Desktop Navigation Links -->
    <div v-if="isAuthenticated" class="navbar-end hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li>
          <router-link :to="getLocalizedPath('/dashboard')" class="btn btn-ghost">
            <span class="text-lg">🏠</span>
            <span class="hidden xl:inline">Dashboard</span>
          </router-link>
        </li>
        <li>
          <router-link :to="getLocalizedPath('/monitor')" class="btn btn-ghost">
            <span class="text-lg">🚨</span>
            <span class="hidden xl:inline">Monitor</span>
          </router-link>
        </li>
        <li>
          <router-link :to="getLocalizedPath('/panic-dashboard')" class="btn btn-ghost">
            <span class="text-lg">📊</span>
            <span class="hidden xl:inline">Panic</span>
          </router-link>
        </li>
        <li>
          <router-link :to="getLocalizedPath('/profile')" class="btn btn-ghost">
            <span class="text-lg">👤</span>
            <span class="hidden xl:inline">Profile</span>
          </router-link>
        </li>
      </ul>
    </div>

    <!-- Right Side Actions -->
    <div class="navbar-end">
      <!-- Authenticated User Avatar Dropdown -->
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

      <!-- Guest User Actions -->
      <div v-else class="flex items-center gap-2">
        <router-link :to="getLocalizedPath('/login')" class="btn btn-primary btn-sm">
          Login
        </router-link>
        <router-link :to="getLocalizedPath('/register')" class="btn btn-outline btn-sm">
          Register
        </router-link>
      </div>

      <!-- Theme Switcher -->
      <div class="divider divider-horizontal mx-2"></div>
      <ThemeSwitcher />
    </div>
  </div>
</template>
