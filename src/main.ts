// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import naive from 'naive-ui'

const app = createApp(App)
const pinia = createPinia()

// 注册插件
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.use(naive)

app.mount('#app')