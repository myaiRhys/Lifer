<script lang="ts">
  import { onMount } from 'svelte'
  import { getUserState, getSettings, updateSettings } from '../lib/db'
  import { applyTheme, themes, getStoredTheme, type Theme } from '../lib/themes'
  import DashboardStats from './DashboardStats.svelte'
  import Badge from './shared/Badge.svelte'
  import Button from './shared/Button.svelte'
  import SkeletonLoader from './shared/SkeletonLoader.svelte'
  import type { UserState, AppSettings } from '../lib/types'

  let userState: UserState | null = null
  let settings: AppSettings | null = null
  let loading = true
  let currentTheme: Theme = getStoredTheme()

  onMount(async () => {
    await loadProfile()
  })

  async function loadProfile() {
    loading = true
    userState = await getUserState()
    settings = await getSettings()
    loading = false
  }

  async function handleThemeChange(theme: Theme) {
    currentTheme = theme
    applyTheme(theme)
    if (settings) {
      await updateSettings({ theme })
      settings = await getSettings()
    }
  }

  async function toggleSound() {
    if (!settings) return
    await updateSettings({ soundEnabled: !settings.soundEnabled })
    settings = await getSettings()
  }

  async function toggleNotifications() {
    if (!settings) return
    await updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
    settings = await getSettings()
  }

  function formatDate(date: Date | null): string {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function getMembershipDays(): number {
    if (!userState?.createdAt) return 0
    const created = new Date(userState.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
</script>

<div class="profile-page">
  {#if loading}
    <SkeletonLoader variant="profile" count={1} />
  {:else if userState}
    <!-- Profile Header -->
    <div class="profile-header bg-bg-secondary border border-border rounded-2xl p-24 mb-24 shadow-elevation-2 relative overflow-hidden">
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex items-start gap-24 mb-24">
          <!-- Avatar -->
          <div class="avatar-wrapper">
            <div class="avatar bg-gradient-to-br from-accent to-brand-blue flex items-center justify-center text-white text-h2 font-bold shadow-elevation-3">
              L
            </div>
            <Badge variant="level" value={userState.level} animate={false}>
              <span class="text-sm font-bold">Lvl {userState.level}</span>
            </Badge>
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-h3 font-bold text-text-primary mb-8">Lifer Member</h1>
            <p class="text-body text-text-secondary mb-16">
              Member for {getMembershipDays()} days • Joined {formatDate(userState.createdAt)}
            </p>

            <!-- Quick Stats -->
            <div class="flex flex-wrap gap-12">
              <Badge variant="xp" value={userState.totalXPEarned.toLocaleString()}>
                <span class="mr-4">✨</span> Total XP
              </Badge>
              <Badge variant="streak" value={userState.currentStreak}>
                <span class="mr-4">🔥</span> Streak
              </Badge>
              <Badge variant="achievement" tier="gold">
                <span class="mr-4">🏆</span> {userState.tasksCompleted || 0} Tasks
              </Badge>
            </div>
          </div>
        </div>

        <!-- Bio / Description -->
        <div class="bg-bg-primary border border-border rounded-xl p-16 mb-16">
          <p class="text-body text-text-secondary text-center italic">
            "Building a better life, one day at a time."
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="mb-24">
      <h2 class="text-h5 font-semibold text-text-primary mb-16 flex items-center gap-12">
        <span>📊</span> Your Progress
      </h2>
      <DashboardStats {userState} />
    </div>

    <!-- Settings Section -->
    {#if settings}
      <div class="settings-section bg-bg-secondary border border-border rounded-2xl p-24 mb-24 shadow-elevation-1">
        <h2 class="text-h5 font-semibold text-text-primary mb-24 flex items-center gap-12">
          <span>⚙️</span> Settings
        </h2>

        <!-- Theme Selection -->
        <div class="mb-24">
          <h3 class="text-body-large font-medium text-text-primary mb-12">Theme</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-12">
            {#each Object.entries(themes) as [key, theme]}
              <button
                on:click={() => handleThemeChange(key)}
                class="theme-card bg-bg-primary border-2 rounded-xl p-16 text-center transition-all hover:scale-105 active:scale-95 {currentTheme === key ? 'border-accent shadow-elevation-2' : 'border-border'}"
              >
                <div class="text-3xl mb-8">{theme.name}</div>
                <div class="text-body-small text-text-secondary">{key}</div>
                {#if currentTheme === key}
                  <div class="mt-8 text-accent text-sm font-semibold">✓ Active</div>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Preferences -->
        <div class="space-y-16">
          <h3 class="text-body-large font-medium text-text-primary mb-12">Preferences</h3>

          <!-- Sound Toggle -->
          <div class="flex items-center justify-between bg-bg-primary border border-border rounded-xl p-16">
            <div>
              <p class="text-body font-medium text-text-primary">Sound Effects</p>
              <p class="text-body-small text-text-muted">Play sounds for interactions</p>
            </div>
            <button
              on:click={toggleSound}
              class="toggle-button {settings.soundEnabled ? 'active' : ''}"
              aria-label="Toggle sound effects"
            >
              <div class="toggle-slider"></div>
            </button>
          </div>

          <!-- Notifications Toggle -->
          <div class="flex items-center justify-between bg-bg-primary border border-border rounded-xl p-16">
            <div>
              <p class="text-body font-medium text-text-primary">Notifications</p>
              <p class="text-body-small text-text-muted">Receive reminder notifications</p>
            </div>
            <button
              on:click={toggleNotifications}
              class="toggle-button {settings.notificationsEnabled ? 'active' : ''}"
              aria-label="Toggle notifications"
            >
              <div class="toggle-slider"></div>
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Account Actions -->
    <div class="space-y-12">
      <Button variant="secondary" fullWidth={true} onclick={() => window.location.reload()}>
        <span class="mr-8">🔄</span> Refresh Data
      </Button>
      <Button variant="ghost" fullWidth={true}>
        <span class="mr-8">📤</span> Export Data
      </Button>
    </div>
  {/if}
</div>

<style>
  .profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;
    padding-bottom: 100px; /* Space for bottom nav */
  }

  /* Avatar */
  .avatar-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    border: 4px solid var(--border);
  }

  /* Theme Card */
  .theme-card {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  /* Toggle Button */
  .toggle-button {
    position: relative;
    width: 56px;
    height: 32px;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-button.active {
    background: var(--accent);
    border-color: var(--accent);
  }

  .toggle-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-button.active .toggle-slider {
    transform: translateX(24px);
  }

  /* Responsive */
  @media (min-width: 768px) {
    .profile-page {
      padding: 32px;
    }
  }
</style>
