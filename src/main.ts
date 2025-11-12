import './app.css'
import App from './App.svelte'
import { initializeStorage } from './lib/db/init'

// Initialize database on app start
initializeStorage().then(() => {
  const app = new App({
    target: document.getElementById('app')!
  })
})

export default app
