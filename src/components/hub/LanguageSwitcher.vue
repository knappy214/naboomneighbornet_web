<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c.655 0 1.305.05 1.94.15M3 5.621a48.474 48.474 0 0 0 6-.371m0 0c.655 0 1.305.05 1.94.15M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c.655 0 1.305.05 1.94.15M3 5.621a48.474 48.474 0 0 0 6-.371m0 0c.655 0 1.305.05 1.94.15" />
      </svg>
      {{ currentLanguage.toUpperCase() }}
    </div>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
      <li v-for="lang in availableLanguages" :key="lang">
        <button 
          @click="setLanguage(lang)"
          :class="{ 'active': currentLanguage === lang }"
          class="btn btn-ghost btn-sm"
        >
          {{ lang.toUpperCase() }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useInternationalization } from '@/composables/useInternationalization'
import type { Language } from '@/types/communication'

const { currentLanguage, availableLanguages, setLanguage } = useInternationalization()
</script>
