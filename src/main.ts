import './app.css'
import App from './App.svelte'
import { initializeStorage } from './lib/db/init'

// Add diagnostic info
console.log('🚀 Lifer app starting...')
console.log('Base URL:', import.meta.env.BASE_URL)
console.log('Mode:', import.meta.env.MODE)
console.log('Location:', window.location.href)

// Show loading state
const appEl = document.getElementById('app')!
appEl.innerHTML = '<div style="padding: 2rem; color: white; background: #0f172a;">Loading Lifer...</div>'

// Initialize database on app start
initializeStorage()
  .then(() => {
    console.log('✅ Database initialized')
    const app = new App({
      target: appEl
    })
    console.log('✅ App mounted')
    return app
  })
  .catch((error) => {
    console.error('❌ Failed to initialize app:', error)
    appEl.innerHTML = `
      <div style="padding: 2rem; color: white; background: #0f172a; font-family: monospace;">
        <h1 style="color: #ef4444;">⚠️ Initialization Error</h1>
        <p style="color: #fbbf24;">${error.message}</p>
        <pre style="color: #94a3b8; margin-top: 1rem;">${error.stack || 'No stack trace'}</pre>
        <hr style="margin: 2rem 0; border-color: #475569;">
        <h2 style="color: #60a5fa;">Debug Info:</h2>
        <ul style="color: #cbd5e1;">
          <li>URL: ${window.location.href}</li>
          <li>Base: ${import.meta.env.BASE_URL}</li>
          <li>Mode: ${import.meta.env.MODE}</li>
        </ul>
      </div>
    `
  })
