<script lang="ts">
  import { onMount } from 'svelte'
  import Dashboard from './components/Dashboard.svelte'
  import TaskList from './components/TaskList.svelte'
  import RecurringTasks from './components/RecurringTasks.svelte'
  import PowerUpShop from './components/PowerUpShop.svelte'
  import FocusTimer from './components/FocusTimer.svelte'
  import HeatMap from './components/HeatMap.svelte'
  import { initializeStorage, getSettings, updateSettings } from './lib/db'
  import { applyTheme, getStoredTheme } from './lib/themes'
  import { notificationSystem } from './lib/notifications'
  import type { AppSettings, Theme } from './lib/types'

  let currentView = 'dashboard'
  let settings: AppSettings | null = null
  let showSettings = false

  onMount(async () => {
    await initializeStorage()
    settings = await getSettings()

    // Apply stored theme
    const theme = getStoredTheme()
    applyTheme(theme)

    // Initialize notifications
    if (settings.notificationsEnabled) {
      await notificationSystem.scheduleNotifications()
    }
  })

  async function toggleSound() {
    if (!settings) return
    const updated = await updateSettings({ soundEnabled: !settings.soundEnabled })
    settings = updated
  }

  async function changeTheme(theme: Theme) {
    applyTheme(theme)
    const updated = await updateSettings({ theme })
    settings = updated
  }
</script>

<div class="min-h-screen bg-slate-900 text-white">
  <header class="bg-slate-800 border-b border-slate-700 p-4">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold">🎯 Lifer</h1>
      <div class="flex items-center gap-3">
        <!-- Sound Toggle -->
        {#if settings}
          <button
            class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            on:click={toggleSound}
            title="Toggle Sound"
          >
            {settings.soundEnabled ? '🔊' : '🔇'}
          </button>
        {/if}

        <!-- Settings Button -->
        <button
          class="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          on:click={() => showSettings = !showSettings}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  </header>

  <nav class="bg-slate-800 border-b border-slate-700 p-2">
    <div class="flex gap-2 max-w-7xl mx-auto overflow-x-auto">
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'dashboard' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'dashboard'}
      >
        📊 Dashboard
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'tasks' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'tasks'}
      >
        ✅ Tasks
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'recurring' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'recurring'}
      >
        🔄 Recurring
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'focus' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'focus'}
      >
        ⏱️ Focus Timer
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'shop' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'shop'}
      >
        🛒 Power-Up Shop
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'heatmap' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'heatmap'}
      >
        📅 Activity Map
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'outcomes' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'outcomes'}
      >
        🎯 Outcomes
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'practices' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'practices'}
      >
        ♻️ Practices
      </button>
    </div>
  </nav>

  <!-- Settings Modal -->
  {#if showSettings && settings}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showSettings = false}>
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full" on:click|stopPropagation>
        <h2 class="text-2xl font-bold mb-4">Settings</h2>

        <!-- Theme Selection -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Theme</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'dark' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('dark')}
            >
              🌊 Dark Ocean
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'light' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('light')}
            >
              ☀️ Light
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'ocean' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('ocean')}
            >
              🌊 Ocean Deep
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'fire' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('fire')}
            >
              🔥 Ember Glow
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'forest' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('forest')}
            >
              🌲 Forest Night
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'sunset' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('sunset')}
            >
              🌅 Sunset
            </button>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="space-y-3 mb-6">
          <label class="flex items-center justify-between">
            <span class="text-sm">Notifications</span>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              on:change={async (e) => {
                settings = await updateSettings({ notificationsEnabled: e.currentTarget.checked })
              }}
              class="w-5 h-5"
            />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm">Morning Reminders</span>
            <input
              type="checkbox"
              checked={settings.morningReminders}
              on:change={async (e) => {
                settings = await updateSettings({ morningReminders: e.currentTarget.checked })
              }}
              class="w-5 h-5"
            />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm">Streak Reminders</span>
            <input
              type="checkbox"
              checked={settings.streakReminders}
              on:change={async (e) => {
                settings = await updateSettings({ streakReminders: e.currentTarget.checked })
              }}
              class="w-5 h-5"
            />
          </label>
          <label class="flex items-center justify-between">
            <span class="text-sm">Vibration</span>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              on:change={async (e) => {
                settings = await updateSettings({ vibrationEnabled: e.currentTarget.checked })
              }}
              class="w-5 h-5"
            />
          </label>
        </div>

        <button
          class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={() => showSettings = false}
        >
          Close
        </button>
      </div>
    </div>
  {/if}

  <main class="p-4 max-w-7xl mx-auto">
    {#if currentView === 'dashboard'}
      <Dashboard />
    {:else if currentView === 'tasks'}
      <TaskList />
    {:else if currentView === 'recurring'}
      <RecurringTasks />
    {:else if currentView === 'focus'}
      <FocusTimer />
    {:else if currentView === 'shop'}
      <PowerUpShop />
    {:else if currentView === 'heatmap'}
      <HeatMap />
    {:else if currentView === 'outcomes'}
      <h2 class="text-xl mb-4">Outcomes</h2>
      <p class="text-slate-400">Outcome management coming soon...</p>
    {:else if currentView === 'practices'}
      <h2 class="text-xl mb-4">Practices</h2>
      <p class="text-slate-400">Practice tracking coming soon...</p>
    {/if}
  </main>
</div>
