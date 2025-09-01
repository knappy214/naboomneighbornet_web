<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { i18n } from '@/plugins/i18n'

const pages = ref<any[]>([])
const locale = computed(() => (i18n.global.locale.value === 'af' ? 'af' : 'en'))

onMounted(async () => {
  const base = import.meta.env.VITE_API_V2_BASE || '/api/v2'
  const res = await fetch(`${base}/pages/?locale=${locale.value}&limit=20&fields=title,meta.slug,meta.locale`)
  const data = await res.json()
  pages.value = data.items || []
})
</script>

<template>
  <div class="space-y-4">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Pages</h2>
        <ul>
          <li v-for="p in pages" :key="p.id">{{ p.title }} <span class="opacity-60">({{ p.meta.locale }})</span></li>
        </ul>
      </div>
    </div>
  </div>
</template>
