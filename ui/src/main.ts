import App from './App.vue'
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import './assets/theme.css'

document.documentElement.setAttribute('theme-mode', 'dark')

const menu = document.querySelector('.comfy-menu')
const separator = document.createElement('hr')

separator.style.margin = '20px 0'
separator.style.width = '100%'
menu!.append(separator)

const managerArea = document.createElement('div')
managerArea.id = 'comfyui-manager'
menu!.append(managerArea)

createApp(App).use(PrimeVue).use(ToastService).mount(managerArea)

export default {}
