import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './app.css'
import { i18n } from './plugins/i18n'
import { vuetify } from './plugins/vuetify'

createApp(App).use(createPinia()).use(router).use(i18n).use(vuetify).mount('#app')
