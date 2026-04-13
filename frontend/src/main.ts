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
