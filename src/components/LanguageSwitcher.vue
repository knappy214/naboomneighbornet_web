<script setup lang="ts">
import { SUPPORT_LOCALES } from '@/plugins/i18n'
import { useI18n } from 'vue-i18n'
const { locale, t } = useI18n()
function setLocale(l: string){ locale.value = l; localStorage.setItem('locale', l) }
</script>
<template>
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn">
      {{ t('app.language') }}: {{ locale }}
    </div>
    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      <li v-for="l in SUPPORT_LOCALES" :key="l"><button @click="setLocale(l)">{{ l==='en'? t('app.english'): t('app.afrikaans') }}</button></li>
    </ul>
  </div>
</template>
