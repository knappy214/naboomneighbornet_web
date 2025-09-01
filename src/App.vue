<template>
  <main class="p-6 max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-3 justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">{{ $t('app.title') }}</h1>
        <span class="badge">daisyUI</span>
      </div>
      <div class="flex gap-2 items-center">
        <LanguageSwitcher />
        <router-link class="btn btn-ghost" to="/login">{{ $t('app.login') }}</router-link>
        <router-link class="btn btn-primary" to="/register">{{ $t('app.register') }}</router-link>
      </div>
    </div>
    <RouterView />
  </main>
</template>
<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>
