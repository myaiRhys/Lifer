<script lang="ts">
  import { onMount } from 'svelte'
  import Dashboard from './components/Dashboard.svelte'
  import DashboardEnhanced from './components/DashboardEnhanced.svelte'
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
  import IdentityBuilder from './components/IdentityBuilder.svelte'
  import NeverMissTwice from './components/NeverMissTwice.svelte'
  import MorningSovereignty from './components/MorningSovereignty.svelte'
  import TwoMinuteGateway from './components/TwoMinuteGateway.svelte'
  import HabitStackBuilder from './components/HabitStackBuilder.svelte'
  import AuthenticityTracker from './components/AuthenticityTracker.svelte'
  import MarginalGainsVisualizer from './components/MarginalGainsVisualizer.svelte'
  import MakerModeToggle from './components/MakerModeToggle.svelte'
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

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-x-hidden">
  <!-- Ambient Glow Effects -->
  <div class="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
  <div class="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

  <!-- Enhanced Header with Glassmorphism -->
  <header class="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20 shadow-2xl shadow-indigo-900/20">
    <div class="flex items-center justify-between h-18 px-6 max-w-7xl mx-auto">
      <!-- Logo/Brand -->
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse border-2 border-white/10">
          <span class="text-3xl font-bold">🎯</span>
        </div>
        <div>
          <h1 class="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
            Lifer
          </h1>
          <p class="text-xs text-slate-400 font-medium">Atomic Habits System</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <!-- Sound Toggle -->
        {#if settings}
          <button
            class="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 hover:from-blue-600 hover:to-purple-600 backdrop-blur transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center border-2 border-slate-600 hover:border-blue-400"
            on:click={toggleSound}
            title="Toggle Sound"
          >
            <span class="text-2xl">{settings.soundEnabled ? '🔊' : '🔇'}</span>
          </button>
        {/if}

        <!-- Settings Button -->
        <button
          class="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-3 font-bold text-lg border-2 border-purple-400/20 hover:border-purple-400"
          on:click={() => showSettings = !showSettings}
        >
          <span class="text-2xl">⚙️</span>
          <span class="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Enhanced Navigation with DRAMATIC Styling -->
  <nav class="sticky top-18 z-30 bg-slate-900/70 backdrop-blur-2xl border-b border-indigo-500/30 shadow-2xl shadow-indigo-900/20">
    <div class="max-w-7xl mx-auto overflow-x-auto px-4">
      <!-- Primary Navigation Row -->
      <div class="flex gap-3 py-4 border-b border-indigo-500/20">
        <button
          class="px-5 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/50 scale-105 border-2 border-blue-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-blue-500'}"
          on:click={() => currentView = 'dashboard'}
        >
          <span class="text-xl">📊</span> Dashboard
        </button>

        <!-- Section Divider -->
        <div class="w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent mx-2"></div>

        <!-- ACTION / INPUT SECTION -->
        <span class="px-4 py-3 text-sm text-blue-400 font-black uppercase self-center tracking-widest bg-blue-500/10 rounded-xl border border-blue-500/30">Input</span>

        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'tasks' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'tasks'}
        >
          ✅ Tasks
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'practices' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'practices'}
        >
          ♻️ Practices
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'chores' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'chores'}
        >
          🏠 Chores
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'morning' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'morning'}
        >
          ☀️ Morning
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'identity' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'identity'}
        >
          🎯 Identity
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'outcomes' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'outcomes'}
        >
          🎯 Outcomes
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'outcome-tree' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'outcome-tree'}
        >
          🌳 Trees
        </button>

        <!-- Section Divider -->
        <div class="border-r border-slate-600 mx-2 self-stretch"></div>

        <!-- WORK / FOCUS SECTION -->
        <span class="px-3 py-2 text-xs text-blue-400 font-bold uppercase self-center tracking-wider">Focus</span>

        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'focus' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView === 'focus'}
        >
          ⏱️ Pomodoro
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'ultradian' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'ultradian'}
        >
          🧠 Ultradian
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'bodydoubling' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'bodydoubling'}
        >
          👥 Doubling
        </button>
      </div>

      <!-- Secondary Navigation Row - ANALYTICS / REPORTS -->
      <div class="flex gap-2 py-3">
        <!-- ANALYTICS / REPORTS SECTION -->
        <span class="px-3 py-2 text-xs text-orange-400 font-bold uppercase self-center tracking-wider">Reports</span>

        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'analytics' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'analytics'}
        >
          📈 Analytics
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'heatmap' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'heatmap'}
        >
          📅 Activity Map
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'recovery' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'recovery'}
        >
          🔥 Recovery
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'gateway' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'gateway'}
        >
          ⚡ Gateway
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'stacking' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'stacking'}
        >
          🔗 Stacking
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'authenticity' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'authenticity'}
        >
          🌿 Authenticity
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'marginal-gains' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'marginal-gains'}
        >
          📈 Marginal Gains
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'maker-mode' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'maker-mode'}
        >
          ⚙️ Maker/Manager
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'energy' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'energy'}
        >
          ⚡ Energy & BPT
        </button>

        <!-- Section Divider -->
        <div class="border-r border-slate-600 mx-2 self-stretch"></div>

        <!-- TOOLS SECTION -->
        <span class="px-3 py-2 text-xs text-green-400 font-bold uppercase self-center tracking-wider">Tools</span>

        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'prioritizer' ? 'bg-green-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'prioritizer'}
        >
          🤖 AI Prioritizer
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'couples' ? 'bg-green-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'couples'}
        >
          💑 Pair Lifers
        </button>
        <button
          class="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap {currentView === 'shop' ? 'bg-green-600 text-white shadow-lg scale-105' : 'hover:bg-slate-700 hover:scale-105'}"
          on:click={() => currentView = 'shop'}
        >
          🛒 Power-Ups
        </button>
      </div>
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
      <DashboardEnhanced />
    {:else if currentView === 'tasks'}
      <TaskList />
    {:else if currentView === 'identity'}
      <IdentityBuilder />
    {:else if currentView === 'recovery'}
      <NeverMissTwice />
    {:else if currentView === 'morning'}
      <MorningSovereignty />
    {:else if currentView === 'gateway'}
      <TwoMinuteGateway />
    {:else if currentView === 'stacking'}
      <HabitStackBuilder />
    {:else if currentView === 'authenticity'}
      <AuthenticityTracker />
    {:else if currentView === 'marginal-gains'}
      <MarginalGainsVisualizer />
    {:else if currentView === 'maker-mode'}
      <MakerModeToggle />
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
