<script lang="ts">
  import { onMount } from 'svelte'
  import DashboardEnhanced from './components/DashboardEnhanced.svelte'
  import InputPage from './components/pages/InputPage.svelte'
  import InsightsPage from './components/pages/InsightsPage.svelte'
  import ToolsPage from './components/pages/ToolsPage.svelte'
  import FocusPage from './components/pages/FocusPage.svelte'
  import Profile from './components/Profile.svelte'
  import AchievementGallery from './components/AchievementGallery.svelte'
  import Onboarding from './components/Onboarding.svelte'
  import WeeklyReview from './components/WeeklyReview.svelte'
  import PWAInstallPrompt from './components/PWAInstallPrompt.svelte'
  import OfflineIndicator from './components/OfflineIndicator.svelte'
  import AppUpdateNotification from './components/AppUpdateNotification.svelte'
  import ExportDialog from './components/ExportDialog.svelte'
  import MobileBottomNav from './components/MobileBottomNav.svelte'
  import { getSettings, updateSettings } from './lib/db'
  import { applyTheme, getStoredTheme } from './lib/themes'
  import { notificationSystem } from './lib/notifications'
  import { exportAllData, importAllData, downloadBackup, readBackupFile } from './lib/db/backup'
  import type { AppSettings, Theme } from './lib/types'

  let currentView = 'dashboard'
  let settings: AppSettings | null = null
  let showSettings = false
  let showOnboarding = false
  let showWeeklyReview = false
  let showExportDialog = false
  let fileInput: HTMLInputElement

  // Swipe gesture support for mobile
  let touchStartX = 0
  let touchEndX = 0
  let touchStartY = 0

  const views = ['dashboard', 'input', 'insights', 'tools', 'focus', 'profile', 'achievements']

  function handleTouchStart(e: TouchEvent) {
    const target = e.target as HTMLElement

    // Don't intercept touches on scrollable containers or their children
    if (isScrollableElement(target)) {
      return
    }

    touchStartX = e.changedTouches[0].screenX
    touchStartY = e.changedTouches[0].screenY
  }

  function handleTouchEnd(e: TouchEvent) {
    const target = e.target as HTMLElement

    // Don't intercept touches on scrollable containers
    if (isScrollableElement(target)) {
      return
    }

    touchEndX = e.changedTouches[0].screenX
    const touchEndY = e.changedTouches[0].screenY

    // Only handle swipe if it's primarily horizontal
    const horizontalDiff = Math.abs(touchStartX - touchEndX)
    const verticalDiff = Math.abs(touchStartY - touchEndY)

    if (horizontalDiff > verticalDiff) {
      handleSwipe()
    }
  }

  function isScrollableElement(element: HTMLElement): boolean {
    // Check if element or any parent is scrollable
    let current = element
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current)
      const overflowX = style.overflowX
      const overflowY = style.overflowY

      // Check if element has overflow-x: auto or scroll, or is in a scrollable container
      if (overflowX === 'auto' || overflowX === 'scroll' ||
          overflowY === 'auto' || overflowY === 'scroll' ||
          current.classList.contains('overflow-x-auto') ||
          current.classList.contains('scrollbar-hide')) {
        return true
      }

      current = current.parentElement as HTMLElement
    }
    return false
  }

  function handleSwipe() {
    const swipeThreshold = 50
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      const currentIndex = views.indexOf(currentView)

      if (diff > 0 && currentIndex < views.length - 1) {
        // Swipe left - go to next view
        currentView = views[currentIndex + 1]
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - go to previous view
        currentView = views[currentIndex - 1]
      }
    }
  }

  onMount(async () => {
    // Don't call initializeStorage() - already called in main.ts
    // Just load settings and apply theme
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

<div
  class="min-h-screen text-white relative overflow-x-hidden transition-colors duration-500"
  style="background: linear-gradient(135deg, var(--color-bg-primary, #0f172a) 0%, var(--color-bg-secondary, #1e293b) 50%, var(--color-bg-tertiary, #334155) 100%); color: var(--color-text-primary, #f1f5f9);"
>
  <!-- Ambient Glow Effects -->
  <div class="fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl -z-10 transition-colors duration-500" style="background-color: var(--color-accent, #3b82f6); opacity: 0.1;"></div>
  <div class="fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl -z-10 transition-colors duration-500" style="background-color: var(--color-accent-hover, #2563eb); opacity: 0.1;"></div>

  <!-- Enhanced Header with Glassmorphism - Mobile Optimized -->
  <header class="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-500/20 shadow-2xl shadow-indigo-900/20">
    <div class="flex items-center justify-between h-16 md:h-18 px-3 md:px-6 max-w-7xl mx-auto">
      <!-- Logo/Brand - Compact on mobile -->
      <div class="flex items-center gap-2 md:gap-4">
        <div class="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse border-2 border-white/10">
          <span class="text-2xl md:text-3xl font-bold">🎯</span>
        </div>
        <div>
          <h1 class="text-xl md:text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-none">
            Lifer
          </h1>
          <p class="text-[10px] md:text-xs text-slate-400 font-medium">Atomic Habits System</p>
        </div>
      </div>

      <!-- Actions - Touch-optimized -->
      <div class="flex items-center gap-2 md:gap-3">
        <!-- Sound Toggle - Larger touch target -->
        {#if settings}
          <button
            class="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 hover:from-blue-600 hover:to-purple-600 active:scale-95 backdrop-blur transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center border-2 border-slate-600 hover:border-blue-400"
            on:click={toggleSound}
            title="Toggle Sound"
          >
            <span class="text-xl md:text-2xl">{settings.soundEnabled ? '🔊' : '🔇'}</span>
          </button>
        {/if}

        <!-- Settings Button - Touch-optimized -->
        <button
          class="px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 active:scale-95 backdrop-blur transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 flex items-center gap-2 md:gap-3 font-bold text-base md:text-lg border-2 border-purple-400/20 hover:border-purple-400"
          on:click={() => showSettings = !showSettings}
        >
          <span class="text-xl md:text-2xl">⚙️</span>
          <span class="hidden sm:inline">Settings</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Redesigned Clean Navigation - Hidden on mobile, shown on desktop -->
  <nav class="hidden md:block sticky top-18 z-30 bg-slate-900/70 backdrop-blur-2xl border-b border-indigo-500/30 shadow-2xl shadow-indigo-900/20">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex gap-3 py-4 justify-center">
        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'dashboard' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/50 scale-105 border-2 border-blue-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-blue-500'}"
          on:click={() => currentView = 'dashboard'}
        >
          <span class="text-2xl">📊</span>
          <span>Dashboard</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'input' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-2xl shadow-blue-500/50 scale-105 border-2 border-blue-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-blue-500'}"
          on:click={() => currentView = 'input'}
        >
          <span class="text-2xl">📝</span>
          <span>Input</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'insights' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-2xl shadow-orange-500/50 scale-105 border-2 border-orange-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-orange-500'}"
          on:click={() => currentView = 'insights'}
        >
          <span class="text-2xl">📈</span>
          <span>Insights</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'tools' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/50 scale-105 border-2 border-green-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-green-500'}"
          on:click={() => currentView = 'tools'}
        >
          <span class="text-2xl">🛠️</span>
          <span>Tools</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'focus' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50 scale-105 border-2 border-purple-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-purple-500'}"
          on:click={() => currentView = 'focus'}
        >
          <span class="text-2xl">⚡</span>
          <span>Focus</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'achievements' ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-2xl shadow-yellow-500/50 scale-105 border-2 border-yellow-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-yellow-500'}"
          on:click={() => currentView = 'achievements'}
        >
          <span class="text-2xl">🏆</span>
          <span>Achievements</span>
        </button>

        <button
          class="flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap {currentView === 'profile' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/50 scale-105 border-2 border-indigo-400' : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 hover:shadow-xl border-2 border-slate-700 hover:border-indigo-500'}"
          on:click={() => currentView = 'profile'}
        >
          <span class="text-2xl">👤</span>
          <span>Profile</span>
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
          <label class="block text-sm font-medium mb-3">Data Backup & Export</label>
          <div class="space-y-2">
            <button
              class="w-full px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 hover:from-green-900/50 hover:to-emerald-900/50 text-green-400 border border-green-700 rounded-lg font-medium transition-all hover:scale-102"
              on:click={() => showExportDialog = true}
            >
              📤 Export Data (Multiple Formats)
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

  <main
    class="p-4 pb-24 md:pb-4 max-w-7xl mx-auto"
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
  >
    {#key currentView}
      <div class="animate-page-transition">
        {#if currentView === 'dashboard'}
          <DashboardEnhanced on:navigate={(e) => currentView = e.detail} />
        {:else if currentView === 'input'}
          <InputPage />
        {:else if currentView === 'insights'}
          <InsightsPage />
        {:else if currentView === 'tools'}
          <ToolsPage />
        {:else if currentView === 'focus'}
          <FocusPage />
        {:else if currentView === 'achievements'}
          <AchievementGallery />
        {:else if currentView === 'profile'}
          <Profile />
        {/if}
      </div>
    {/key}
  </main>

  <!-- Mobile Bottom Navigation -->
  <MobileBottomNav {currentView} on:navigate={(e) => currentView = e.detail} />

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

  <!-- PWA Install Prompt -->
  <PWAInstallPrompt />

  <!-- Offline Indicator -->
  <OfflineIndicator />

  <!-- App Update Notification -->
  <AppUpdateNotification />

  <!-- Export Dialog -->
  <ExportDialog bind:show={showExportDialog} />
</div>

<style>
  @keyframes page-transition {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-page-transition {
    animation: page-transition 0.3s ease-out;
  }

  /* Custom scrollbar styling */
  :global(::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: rgb(15 23 42);
  }

  :global(::-webkit-scrollbar-thumb) {
    background: rgb(71 85 105);
    border-radius: 4px;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: rgb(100 116 139);
  }

  /* Smooth scroll behavior */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
