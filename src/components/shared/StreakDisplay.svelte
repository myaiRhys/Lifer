<script lang="ts">
  import { onMount } from 'svelte'

  export let currentStreak: number = 0
  export let bestStreak: number = 0
  export let variant: 'compact' | 'full' = 'full'
  export let animated: boolean = true
  export let showBest: boolean = true

  let displayStreak = 0
  let isIncrementing = false

  // Animate streak counter on mount
  onMount(() => {
    if (animated && currentStreak > 0) {
      const duration = 800
      const steps = 30
      const increment = currentStreak / steps
      const stepDuration = duration / steps

      let current = 0
      const interval = setInterval(() => {
        current += increment
        if (current >= currentStreak) {
          displayStreak = currentStreak
          clearInterval(interval)
        } else {
          displayStreak = Math.floor(current)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    } else {
      displayStreak = currentStreak
    }
  })

  // Determine fire intensity based on streak
  $: fireIntensity = currentStreak >= 30 ? 'high' : currentStreak >= 7 ? 'medium' : 'low'
  $: fireEmoji = currentStreak >= 30 ? '🔥🔥🔥' : currentStreak >= 7 ? '🔥🔥' : currentStreak > 0 ? '🔥' : '❄️'
  $: streakColor = currentStreak >= 30 ? 'from-orange-500 to-red-600' :
                   currentStreak >= 7 ? 'from-yellow-500 to-orange-500' :
                   currentStreak > 0 ? 'from-yellow-400 to-orange-400' : 'from-gray-500 to-gray-600'
  $: glowColor = currentStreak >= 30 ? 'rgba(255,107,53,0.8)' :
                 currentStreak >= 7 ? 'rgba(255,165,0,0.6)' :
                 'rgba(255,215,0,0.4)'
</script>

{#if variant === 'compact'}
  <!-- Compact Streak Display -->
  <div class="inline-flex items-center gap-8 bg-gradient-to-r {streakColor} text-white px-16 py-8 rounded-full shadow-elevation-2">
    <span class="text-h6 animate-flame-flicker">{fireEmoji}</span>
    <span class="text-h6 font-bold tabular-nums">{displayStreak}</span>
    <span class="text-body-small font-medium uppercase tracking-wide">Day{currentStreak !== 1 ? 's' : ''}</span>
  </div>
{:else}
  <!-- Full Streak Display -->
  <div class="relative bg-bg-secondary border-2 border-transparent rounded-2xl p-24 overflow-hidden">
    <!-- Glow Effect -->
    {#if currentStreak > 0}
      <div
        class="absolute inset-0 rounded-2xl pointer-events-none animate-glow-pulse"
        style="box-shadow: 0 0 40px {glowColor}; opacity: 0.5;"
      ></div>
    {/if}

    <!-- Fire Particles for High Streaks -->
    {#if currentStreak >= 7}
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        {#each Array(5) as _, i}
          <div
            class="fire-particle animate-ember-rise"
            style="
              left: {20 + i * 20}%;
              bottom: -10px;
              animation-delay: {i * 0.4}s;
              --drift: {(Math.random() - 0.5) * 40}px;
            "
          ></div>
        {/each}
      </div>
    {/if}

    <!-- Content -->
    <div class="relative z-10 text-center">
      <!-- Fire Icon -->
      <div class="mb-16">
        <span
          class="text-display {currentStreak > 0 ? 'animate-flame-flicker' : ''}"
          style="filter: drop-shadow(0 4px 12px {glowColor});"
        >
          {fireEmoji}
        </span>
      </div>

      <!-- Current Streak -->
      <div class="mb-16">
        <div class="text-display font-bold text-transparent bg-clip-text bg-gradient-to-r {streakColor} tabular-nums animate-number-pop">
          {displayStreak}
        </div>
        <div class="text-body text-text-secondary font-medium">
          Day{currentStreak !== 1 ? 's' : ''} in a row
        </div>
      </div>

      <!-- Motivation Message -->
      {#if currentStreak === 0}
        <p class="text-body-small text-text-muted">
          Start your streak today!
        </p>
      {:else if currentStreak >= 30}
        <p class="text-body-small text-text-secondary font-semibold animate-pulse">
          🏆 Unstoppable! You're on fire!
        </p>
      {:else if currentStreak >= 7}
        <p class="text-body-small text-text-secondary">
          ⚡ Amazing! Keep it going!
        </p>
      {:else}
        <p class="text-body-small text-text-secondary">
          💪 Great start! Keep building!
        </p>
      {/if}

      <!-- Best Streak -->
      {#if showBest && bestStreak > currentStreak}
        <div class="mt-24 pt-24 border-t border-border">
          <div class="flex items-center justify-center gap-12 text-text-muted">
            <span class="text-body-small">Personal Best:</span>
            <span class="text-h6 font-bold tabular-nums">{bestStreak}</span>
            <span class="text-lg">🏅</span>
          </div>
        </div>
      {/if}

      <!-- Circular Progress (optional) -->
      {#if currentStreak > 0 && currentStreak < 30}
        <div class="mt-24">
          <div class="w-32 h-2 bg-bg-tertiary rounded-full overflow-hidden mx-auto">
            <div
              class="h-full bg-gradient-to-r {streakColor} transition-all duration-slower"
              style="width: {Math.min((currentStreak / 30) * 100, 100)}%"
            ></div>
          </div>
          <p class="text-caption text-text-muted mt-8">
            {30 - currentStreak} days to Legendary status
          </p>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Additional custom styles if needed */
</style>
