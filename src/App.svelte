<script lang="ts">
  import { onMount } from 'svelte'
  import Dashboard from './components/Dashboard.svelte'
  import TaskList from './components/TaskList.svelte'
  import Chores from './components/Chores.svelte'
  import PowerUpShop from './components/PowerUpShop.svelte'
  import FocusTimer from './components/FocusTimer.svelte'
  import HeatMap from './components/HeatMap.svelte'
  import Practices from './components/Practices.svelte'
  import Outcomes from './components/Outcomes.svelte'
  import Onboarding from './components/Onboarding.svelte'
  import WeeklyReview from './components/WeeklyReview.svelte'
  // v2.0 components
  import EnergyLogger from './components/EnergyLogger.svelte'
  import BPTAnalysis from './components/BPTAnalysis.svelte'
  import UltradianTimer from './components/UltradianTimer.svelte'
  import CouplesMode from './components/CouplesMode.svelte'
  import OutcomeTreeView from './components/OutcomeTreeView.svelte'
  import BodyDoublingView from './components/BodyDoublingView.svelte'
  import TaskPrioritizer from './components/TaskPrioritizer.svelte'
  import PersonalAnalytics from './components/PersonalAnalytics.svelte'
  import { initializeStorage, getSettings, updateSettings } from './lib/db'
  import { applyTheme, getStoredTheme } from './lib/themes'
  import { notificationSystem } from './lib/notifications'
  import { exportAllData, importAllData, downloadBackup, readBackupFile } from './lib/db/backup'
  import type { AppSettings, Theme } from './lib/types'

  let currentView = 'dashboard'
  let settings: AppSettings | null = null
  let showSettings = false
  let showOnboarding = false
  let showWeeklyReview = false
  let fileInput: HTMLInputElement

  onMount(async () => {
    await initializeStorage()
    settings = await getSettings()

    // Check if onboarding is needed
    if (!settings.onboardingCompleted) {
      showOnboarding = true
    }

    // Check if weekly review is due (if onboarding is complete)
    if (settings.onboardingCompleted) {
      const shouldShowReview = checkWeeklyReviewDue(settings.lastWeeklyReview)
      if (shouldShowReview) {
        showWeeklyReview = true
      }
    }

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

  async function handleExport() {
    try {
      const data = await exportAllData()
      const filename = `lifer-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadBackup(data, filename)
    } catch (error) {
      alert('Failed to export data. Please try again.')
      console.error('Export error:', error)
    }
  }

  async function handleImport() {
    fileInput.click()
  }

  async function handleFileSelected(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (!file) return

    if (!confirm('This will replace all current data. Are you sure you want to continue?')) {
      return
    }

    try {
      const jsonString = await readBackupFile(file)
      const success = await importAllData(jsonString)

      if (success) {
        alert('Data imported successfully! The page will now reload.')
        window.location.reload()
      } else {
        alert('Failed to import data. Please check the file format.')
      }
    } catch (error) {
      alert('Failed to import data. Please try again.')
      console.error('Import error:', error)
    } finally {
      // Reset file input
      target.value = ''
    }
  }

  async function completeOnboarding() {
    showOnboarding = false
    const updated = await updateSettings({ onboardingCompleted: true })
    settings = updated
  }

  function checkWeeklyReviewDue(lastReview: string | null): boolean {
    if (!lastReview) return true // Never done a review

    const lastReviewDate = new Date(lastReview)
    const now = new Date()
    const daysSinceReview = Math.floor((now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))

    return daysSinceReview >= 7
  }

  async function completeWeeklyReview() {
    showWeeklyReview = false
    const updated = await updateSettings({ lastWeeklyReview: new Date().toISOString() })
    settings = updated
  }

  function skipWeeklyReview() {
    showWeeklyReview = false
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
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'prioritizer' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'prioritizer'}
      >
        🎯 AI Prioritizer
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'focus' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'focus'}
      >
        ⏱️ Pomodoro
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'ultradian' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'ultradian'}
      >
        🧠 Ultradian
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'energy' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'energy'}
      >
        ⚡ Energy & BPT
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'outcome-tree' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'outcome-tree'}
      >
        🌳 Outcome Trees
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'couples' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'couples'}
      >
        💑 Pair Lifers
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'bodydoubling' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'bodydoubling'}
      >
        👥 Body Doubling
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'analytics' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'analytics'}
      >
        📈 Analytics
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'chores' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'chores'}
      >
        🏠 Chores
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'practices' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'practices'}
      >
        ♻️ Practices
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'heatmap' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'heatmap'}
      >
        📅 Activity Map
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'shop' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'shop'}
      >
        🛒 Power-Ups
      </button>
      <button
        class="px-4 py-2 rounded transition-colors whitespace-nowrap {currentView === 'outcomes' ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'}"
        on:click={() => currentView = 'outcomes'}
      >
        🎯 Outcomes (v1)
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
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'military' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('military')}
            >
              🎖️ Military
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'cowboy' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('cowboy')}
            >
              🤠 Cowboy
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'academic' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('academic')}
            >
              🎓 Academic
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'cyberpunk' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('cyberpunk')}
            >
              🤖 Cyberpunk
            </button>
            <button
              class="px-4 py-2 rounded-lg border transition-colors {settings.theme === 'zen' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
              on:click={() => changeTheme('zen')}
            >
              🌱 Zen
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

        <!-- Data Backup Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-3">Data Backup</label>
          <div class="space-y-2">
            <button
              class="w-full px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700 rounded-lg font-medium transition-colors"
              on:click={handleExport}
            >
              📥 Export All Data
            </button>
            <button
              class="w-full px-4 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-700 rounded-lg font-medium transition-colors"
              on:click={handleImport}
            >
              📤 Import Data
            </button>
            <p class="text-xs text-slate-400 mt-2">
              Export your data as a JSON file for backup. Import to restore from a previous backup.
            </p>
          </div>
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
    {:else if currentView === 'prioritizer'}
      <TaskPrioritizer />
    {:else if currentView === 'focus'}
      <FocusTimer />
    {:else if currentView === 'ultradian'}
      <UltradianTimer />
    {:else if currentView === 'energy'}
      <div class="space-y-6">
        <EnergyLogger />
        <BPTAnalysis />
      </div>
    {:else if currentView === 'outcome-tree'}
      <OutcomeTreeView />
    {:else if currentView === 'couples'}
      <CouplesMode />
    {:else if currentView === 'bodydoubling'}
      <BodyDoublingView />
    {:else if currentView === 'analytics'}
      <PersonalAnalytics />
    {:else if currentView === 'chores'}
      <Chores />
    {:else if currentView === 'practices'}
      <Practices />
    {:else if currentView === 'heatmap'}
      <HeatMap />
    {:else if currentView === 'shop'}
      <PowerUpShop />
    {:else if currentView === 'outcomes'}
      <Outcomes />
    {/if}
  </main>

  <!-- Hidden file input for import -->
  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    on:change={handleFileSelected}
    class="hidden"
  />

  <!-- Onboarding Modal -->
  {#if showOnboarding}
    <Onboarding on:complete={completeOnboarding} />
  {/if}

  <!-- Weekly Review Modal -->
  {#if showWeeklyReview && !showOnboarding}
    <WeeklyReview on:complete={completeWeeklyReview} on:skip={skipWeeklyReview} />
  {/if}
</div>
