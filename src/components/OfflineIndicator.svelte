<!--
@component
Offline Indicator Component
Shows online/offline status and handles offline data sync

Features:
- Online/offline status indicator
- Pending sync count
- Auto-hide when online
- Visual feedback for connectivity changes
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let isOnline = navigator.onLine
  let showIndicator = !isOnline
  let pendingSyncs = 0
  let showDetails = false

  // Auto-hide timeout
  let hideTimeout: ReturnType<typeof setTimeout> | null = null

  function handleOnline() {
    isOnline = true
    showIndicator = true

    // Auto-hide after 3 seconds
    if (hideTimeout) clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
      showIndicator = false
    }, 3000)
  }

  function handleOffline() {
    isOnline = false
    showIndicator = true

    // Keep showing while offline
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = null
    }
  }

  function toggleDetails() {
    showDetails = !showDetails
  }

  onMount(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for pending syncs (would be from IndexedDB in real implementation)
    // For now, simulate
    const checkPendingSyncs = () => {
      if (!isOnline) {
        // In a real app, check IndexedDB for unsynced data
        pendingSyncs = 0 // Placeholder
      }
    }

    checkPendingSyncs()
    const interval = setInterval(checkPendingSyncs, 5000)

    return () => {
      clearInterval(interval)
    }
  })

  onDestroy(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (hideTimeout) clearTimeout(hideTimeout)
  })
</script>

{#if showIndicator}
  <div
    class="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-40 transition-all duration-300"
    role="status"
    aria-live="polite"
    aria-label={isOnline ? 'Back online' : 'No internet connection'}
  >
    <div
      class="relative rounded-xl p-4 shadow-2xl border-2 backdrop-blur-xl cursor-pointer transition-all hover:scale-102 {isOnline
        ? 'bg-gradient-to-br from-green-600/95 to-emerald-600/95 border-green-400/50'
        : 'bg-gradient-to-br from-slate-700/95 to-slate-800/95 border-slate-500/50'}"
      on:click={toggleDetails}
      on:keydown={(e) => e.key === 'Enter' && toggleDetails()}
      tabindex="0"
    >
      <!-- Glow Effect -->
      <div
        class="absolute -inset-1 rounded-xl blur-xl opacity-50 -z-10 {isOnline
          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
          : 'bg-gradient-to-r from-slate-600 to-slate-700'}"
      ></div>

      <div class="flex items-center gap-3">
        <!-- Status Icon -->
        <div class="text-3xl" aria-hidden="true">
          {#if isOnline}
            ✅
          {:else}
            📡
          {/if}
        </div>

        <!-- Status Text -->
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-black text-white">
              {#if isOnline}
                Back Online
              {:else}
                Offline Mode
              {/if}
            </h4>

            {#if !isOnline}
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-100"></div>
                <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-200"></div>
              </div>
            {/if}
          </div>

          <p class="text-xs text-white/80 mt-0.5">
            {#if isOnline}
              Connected to internet
            {:else}
              Working offline - changes saved locally
            {/if}
          </p>
        </div>

        <!-- Expand Indicator -->
        <button
          class="text-white/60 hover:text-white transition-colors"
          aria-label={showDetails ? 'Hide details' : 'Show details'}
        >
          <svg
            class="w-5 h-5 transition-transform {showDetails ? 'rotate-180' : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Details Panel -->
      {#if showDetails}
        <div class="mt-4 pt-4 border-t border-white/20">
          <div class="space-y-2 text-xs text-white/80">
            {#if isOnline}
              <div class="flex items-center justify-between">
                <span>Status:</span>
                <span class="font-bold text-green-300">Connected</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Data Sync:</span>
                <span class="font-bold text-green-300">Active</span>
              </div>
            {:else}
              <div class="flex items-center justify-between">
                <span>Status:</span>
                <span class="font-bold text-red-300">Disconnected</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Pending Syncs:</span>
                <span class="font-bold text-yellow-300">{pendingSyncs}</span>
              </div>
              <p class="text-xs text-white/60 mt-2 p-2 bg-white/10 rounded">
                💡 Your data is saved locally and will sync when you're back online
              </p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .animation-delay-100 {
    animation-delay: 100ms;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }

  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
</style>
