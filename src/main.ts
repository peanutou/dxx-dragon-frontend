import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import naive from 'naive-ui'
import { createDiscreteApi } from 'naive-ui'
const app = createApp(App)
const pinia = createPinia()

// 注册插件
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.use(naive)

app.mount('#app')

const { message, dialog } = createDiscreteApi(['message', 'dialog'], {
    messageProviderProps: {
        placement: 'top-right',
        duration: 2000,
        max: 1,
        closable: true,
    }
})
window.$message = message
window.$dialog = dialog
