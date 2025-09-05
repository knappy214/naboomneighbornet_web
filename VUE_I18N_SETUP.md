# Vue 3.5.20 + vue-i18n 11.1.11 + Vuetify 3.9.6 Setup

This document outlines the complete setup for Vue 3.5.20 with vue-i18n 11.1.11 using Composition API mode and Vuetify 3.9.6 integration.

## 🚀 Features

- **Vue 3.5.20** with enhanced Composition API and -56% memory optimization
- **vue-i18n 11.1.11** with `legacy: false` (Composition API only)
- **@intlify/unplugin-vue-i18n** for build optimization and SFC i18n blocks
- **vite-plugin-vuetify@2.1.2** with autoImport enabled
- **vuetify@3.9.6** with createVueI18nAdapter integration
- **TypeScript support** for better inference
- **English/Afrikaans** language support

## 📦 Dependencies

### package.json

```json
{
  "dependencies": {
    "vue": "^3.5.20",
    "vue-i18n": "^11.1.11",
    "vuetify": "^3.9.6",
    "vite-plugin-vuetify": "^2.1.2"
  },
  "devDependencies": {
    "@intlify/unplugin-vue-i18n": "^2.0.0"
  }
}
```

## ⚙️ Configuration Files

### 1. vite.config.ts

```typescript
import VueI18nPlugin from '@intlify/unplugin-vue-i18n'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vuetify({ autoImport: true }),
    VueI18nPlugin({
      include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
      strictMessage: false,
      escapeHtml: false,
    }),
    vueDevTools(),
  ],
})
```

### 2. src/plugins/i18n.ts

```typescript
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import af from '@/locales/af.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, af },
  globalInjection: true,
  allowComposition: true,
  sync: true,
  warnHtmlMessage: false,
})
```

### 3. src/plugins/vuetify.ts

```typescript
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { i18n } from './i18n'

export const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n }),
    locale: i18n.global.locale.value as string,
    fallback: 'en',
    messages: { en, af },
  },
  theme: {
    defaultTheme: 'community-security',
    themes: {
      'community-security': {
        dark: false,
        colors: {
          primary: '#6b4f2a',
          secondary: '#3a7d44',
          accent: '#f6b40e',
          error: '#c0392b',
          warning: '#f6b40e',
          info: '#3a7d44',
          success: '#3a7d44',
        },
      },
    },
  },
})
```

### 4. src/main.ts

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './plugins/i18n'
import { vuetify } from './plugins/vuetify'

const app = createApp(App)

// Register plugins in correct order
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
```

## 🌍 Locale Files

### src/locales/en.json

```json
{
  "app": {
    "title": "Naboom NeighborNet",
    "language": "Language",
    "english": "English",
    "afrikaans": "Afrikaans",
    "login": "Login",
    "register": "Register",
    "logout": "Logout"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "forgot": "Forgot password?",
    "haveAccount": "Have an account?",
    "needAccount": "Need an account?",
    "sendLink": "Send reset link",
    "resetPassword": "Reset Password",
    "newPassword": "New Password",
    "confirm": "Confirm"
  }
}
```

### src/locales/af.json

```json
{
  "app": {
    "title": "Naboom BuurNet",
    "language": "Taal",
    "english": "Engels",
    "afrikaans": "Afrikaans",
    "login": "Meld aan",
    "register": "Registreer",
    "logout": "Teken uit"
  },
  "auth": {
    "email": "E-pos",
    "password": "Wagwoord",
    "forgot": "Wagwoord vergeet?",
    "haveAccount": "Het jy 'n rekening?",
    "needAccount": "Benodig 'n rekening?",
    "sendLink": "Stuur herstel skakel",
    "resetPassword": "Herstel Wagwoord",
    "newPassword": "Nuwe Wagwoord",
    "confirm": "Bevestig"
  }
}
```

## 🎯 Usage Examples

### Composition API with useI18n

```vue
<template>
  <v-btn>{{ t('app.login') }}</v-btn>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>
```

### Options API with $t

```vue
<template>
  <v-btn>{{ $t('app.login') }}</v-btn>
</template>
```

### Language Switcher Component

```vue
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props" :prepend-icon="currentLocaleIcon">
        {{ currentLocaleLabel }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item v-for="locale in SUPPORT_LOCALES" :key="locale" @click="changeLocale(locale)">
        {{ getLocaleLabel(locale) }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>
```

## ✅ Validation Checklist

- [x] No legacy API deprecation warnings in console
- [x] Vuetify components display translated text correctly
- [x] TypeScript provides proper autocompletion for `$t()`
- [x] Tree-shaking works for both Vuetify components and i18n
- [x] Language switching works seamlessly
- [x] Agricultural theme colors integrated with Vuetify
- [x] Build optimization with unplugin-vue-i18n

## 🚀 Installation

1. Run the installation script:

   ```bash
   chmod +x install-deps.sh
   ./install-deps.sh
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Visit the demo page:
   ```
   http://localhost:5173/demo
   ```

## 🔧 Troubleshooting

### Common Issues

1. **TypeScript errors**: Ensure all type declarations are properly imported
2. **Vuetify not working**: Check that Vuetify is registered after i18n
3. **Translations not loading**: Verify locale files are in the correct directory
4. **Build errors**: Ensure unplugin-vue-i18n is properly configured

### Debug Commands

```bash
# Check for TypeScript errors
npm run type-check

# Lint the codebase
npm run lint

# Build the project
npm run build
```

## 📚 Additional Resources

- [Vue 3.5 Release Notes](https://github.com/vuejs/core/releases/tag/v3.5.0)
- [vue-i18n 11.x Documentation](https://vue-i18n.intlify.dev/)
- [Vuetify 3.x Documentation](https://vuetifyjs.com/)
- [@intlify/unplugin-vue-i18n](https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n)
