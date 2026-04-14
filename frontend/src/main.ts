import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Register all robot sprites at startup (side-effect import)
import './services/robotSprites'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Health check on startup
fetch('/api/health')
    .then((res) => res.json())
    .then((data) => console.log('[health]', data))
    .catch((err) => console.warn('[health] Backend unreachable:', err.message))
