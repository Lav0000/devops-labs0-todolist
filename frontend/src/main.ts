import { createApp } from 'vue'
import './style.css'
import 'boxicons/css/boxicons.min.css'
import App from './App.vue'

createApp(App).mount('#app')

// Notify index.html preloader that Vue has mounted
window.dispatchEvent(new Event('app:mounted'))
