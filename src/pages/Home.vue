<script setup lang="ts">
import api from '@/lib/api'
import { ref, onMounted } from 'vue'
const pages = ref<any[]>([])
onMounted(async () => { pages.value = (await api.get('/pages')).data?.results || [] })
</script>
<template>
  <div class="space-y-4">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Pages</h2>
        <ul>
          <li v-for="p in pages" :key="p.id">{{ p.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
