<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentTheme, currentThemeData, themes, setTheme, toggleTheme, initializeTheme } =
  useTheme()

const currentThemeIndex = computed(() => {
  return themes.value.findIndex((theme) => theme.name === currentTheme.value)
})

const cycleTheme = () => {
  toggleTheme()
}

const selectTheme = (index: number) => {
  const theme = themes.value[index]
  if (theme) {
    setTheme(theme.name)
  }
}

// Initialize theme on component mount
initializeTheme()
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
      <div class="text-2xl">{{ currentThemeData.icon }}</div>
    </div>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg">
      <li class="menu-title">
        <span>Choose Theme</span>
      </li>
      <li v-for="(theme, index) in themes" :key="theme.name">
        <button
          @click="selectTheme(index)"
          :class="{ 'menu-active': currentThemeIndex === index }"
          class="flex items-center gap-3"
        >
          <span class="text-xl">{{ theme.icon }}</span>
          <span>{{ theme.label }}</span>
          <span v-if="currentThemeIndex === index" class="badge badge-primary badge-sm"
            >Active</span
          >
        </button>
      </li>
    </ul>
  </div>
</template>
