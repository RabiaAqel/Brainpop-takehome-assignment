import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import '@/utilities/css/font-file.css'
import '@/utilities/css/design-tokens.scss'
import { useUserStore } from '@/stores/user'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// authentication
const userStore = useUserStore()
userStore.initAuth()

app.mount('#app')
