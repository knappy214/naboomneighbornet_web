<script setup lang="ts">
import { ref, onMounted } from 'vue'

const themes = [
  { name: 'light', label: 'Light', icon: '💡' },
  { name: 'business', label: 'Business', icon: '🏢' },
]

const currentThemeIndex = ref(0)
const currentTheme = ref(themes[currentThemeIndex.value]!)

const cycleTheme = () => {
  currentThemeIndex.value = (currentThemeIndex.value + 1) % themes.length
  currentTheme.value = themes[currentThemeIndex.value]!
  document.documentElement.setAttribute('data-theme', currentTheme.value.name)
  localStorage.setItem('theme', currentTheme.value.name)
}

const selectTheme = (index: number) => {
  currentThemeIndex.value = index
  currentTheme.value = themes[index]!
  document.documentElement.setAttribute('data-theme', currentTheme.value.name)
  localStorage.setItem('theme', currentTheme.value.name)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    const themeIndex = themes.findIndex((t) => t.name === savedTheme)
    if (themeIndex !== -1) {
      currentThemeIndex.value = themeIndex
      currentTheme.value = themes[themeIndex]!
      document.documentElement.setAttribute('data-theme', currentTheme.value.name)
    }
  }
})
</script>

<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
      <div class="text-2xl">{{ currentTheme.icon }}</div>
    </div>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg">
      <li class="menu-title">
        <span>Choose Theme</span>
      </li>
      <li v-for="(theme, index) in themes" :key="theme.name">
        <button
          @click="selectTheme(index)"
          :class="{ active: currentThemeIndex === index }"
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
