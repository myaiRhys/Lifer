import './app.css'
import App from './App.svelte'
import { initializeStorage } from './lib/db/init'

// Add diagnostic info
console.log('🚀 Lifer app starting...')
console.log('Base URL:', import.meta.env.BASE_URL)
console.log('Mode:', import.meta.env.MODE)
console.log('Location:', window.location.href)

const appEl = document.getElementById('app')!

// Mount UI immediately for better perceived performance
const app = new App({
  target: appEl
})

// Initialize database in background (non-blocking)
initializeStorage()
  .then(() => {
    console.log('✅ Database initialized')
  })
  .catch((error) => {
    console.error('❌ Failed to initialize storage:', error)
    // App will handle errors gracefully through its own error boundaries
  })
