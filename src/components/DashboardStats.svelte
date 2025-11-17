<script lang="ts">
  import Badge from './shared/Badge.svelte'
  import ProgressBar from './shared/ProgressBar.svelte'
  import StreakDisplay from './shared/StreakDisplay.svelte'
  import type { UserState } from '../lib/types'

  export let userState: UserState
  export let onLevelUp: ((newLevel: number) => void) | undefined = undefined

  $: xpPercentage = (userState.xp / userState.xpForNextLevel) * 100
  $: xpRemaining = userState.xpForNextLevel - userState.xp
</script>

<div class="space-y-24">
  <!-- Level & XP Section -->
  <div class="bg-bg-secondary border border-border rounded-2xl p-24 shadow-elevation-2 relative overflow-hidden">
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-deep-purple/10 to-transparent pointer-events-none"></div>

    <div class="relative z-10">
      <!-- Level Badge -->
      <div class="flex items-center justify-between mb-24">
        <div>
          <h3 class="text-body-small text-text-secondary mb-8 uppercase tracking-wide font-medium">Your Level</h3>
          <div class="flex items-center gap-16">
            <Badge variant="level" value={userState.level} animate={false} />
            <div>
              <p class="text-h4 font-bold text-text-primary">{userState.level}</p>
              <p class="text-body-small text-text-muted">Level</p>
            </div>
          </div>
        </div>

        <!-- Total XP Badge -->
        <div class="text-right">
          <p class="text-body-small text-text-secondary mb-4 uppercase tracking-wide font-medium">Total XP</p>
          <Badge variant="xp" value={userState.totalXPEarned.toLocaleString()}>
            <span class="text-xl">✨</span>
          </Badge>
        </div>
      </div>

      <!-- XP Progress Bar -->
      <ProgressBar
        value={userState.xp}
        max={userState.xpForNextLevel}
        showLabel={true}
        label="Progress to Level {userState.level + 1}"
      />

      <!-- XP Stats -->
      <div class="mt-16 flex items-center justify-between text-body-small">
        <span class="text-text-secondary">
          Current: <span class="font-semibold text-text-primary">{userState.xp.toLocaleString()} XP</span>
        </span>
        <span class="text-text-muted">
          {xpRemaining.toLocaleString()} XP needed
        </span>
      </div>
    </div>
  </div>

  <!-- Streak Section -->
  <div>
    <h3 class="text-h6 font-semibold text-text-primary mb-16">🔥 Your Streak</h3>
    <StreakDisplay
      currentStreak={userState.currentStreak}
      bestStreak={userState.longestStreak}
      variant="full"
      animated={true}
      showBest={true}
    />
  </div>

  <!-- Quick Stats Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-16">
    <!-- Morning Wins -->
    <div class="bg-bg-secondary border border-border rounded-xl p-16 text-center shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <div class="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-8">
        {userState.morningControlCount}
      </div>
      <p class="text-body-small text-text-secondary">Morning Wins</p>
      <span class="text-2xl mt-8 block">☀️</span>
    </div>

    <!-- Task Completions -->
    <div class="bg-bg-secondary border border-border rounded-xl p-16 text-center shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <div class="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-8">
        {userState.tasksCompleted || 0}
      </div>
      <p class="text-body-small text-text-secondary">Tasks Done</p>
      <span class="text-2xl mt-8 block">✅</span>
    </div>

    <!-- Leverage (Last 7 Days) -->
    <div class="bg-bg-secondary border border-border rounded-xl p-16 text-center shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <div class="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
        {userState.last7DaysLeverageRatio.toFixed(1)}
      </div>
      <p class="text-body-small text-text-secondary">7-Day Leverage</p>
      <span class="text-2xl mt-8 block">⚡</span>
    </div>

    <!-- Lifetime Leverage -->
    <div class="bg-bg-secondary border border-border rounded-xl p-16 text-center shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <div class="text-h3 font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500 mb-8">
        {userState.lifetimeLeverageRatio.toFixed(1)}
      </div>
      <p class="text-body-small text-text-secondary">All-Time Leverage</p>
      <span class="text-2xl mt-8 block">🎯</span>
    </div>
  </div>
</div>

<style>
  /* Additional custom styles if needed */
</style>
