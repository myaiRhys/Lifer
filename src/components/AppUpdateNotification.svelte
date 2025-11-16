<!--
@component
App Update Notification Component
Notifies users when a new app version is available and handles update

Features:
- Detects service worker updates
- Shows update notification
- Prompts user to refresh for new version
- Handles update installation
- Auto-dismiss after update
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { useRegisterSW } from 'virtual:pwa-register/svelte'

  const {
    needRefresh,
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    }
  })

  let showNotification = false
  let isUpdating = false

  $: if ($needRefresh && !showNotification) {
    showNotification = true
  }

  async function handleUpdate() {
    isUpdating = true

    try {
      await updateServiceWorker(true)

      // Show success message briefly before reload
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Update failed:', error)
      isUpdating = false
    }
  }

  function dismissNotification() {
    showNotification = false
    // Remember dismissal for this session
    sessionStorage.setItem('lifer_update_dismissed', 'true')
  }

  onMount(() => {
    // Check if update was dismissed this session
    const dismissed = sessionStorage.getItem('lifer_update_dismissed')
    if (dismissed && $needRefresh) {
      showNotification = false
    }
  })
</script>

{#if showNotification && $needRefresh}
  <div
    class="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-down"
    role="alert"
    aria-live="assertive"
    aria-label="New app version available"
  >
    <div class="relative bg-gradient-to-br from-cyan-600/95 to-blue-600/95 rounded-2xl p-5 shadow-2xl border-2 border-cyan-400/50 backdrop-blur-xl">
      <!-- Glow Effect -->
      <div class="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 -z-10 animate-pulse-slow"></div>

      <div class="flex items-start gap-4">
        <!-- Update Icon -->
        <div class="relative flex-shrink-0" aria-hidden="true">
          <div class="text-4xl animate-bounce-slow">
            {#if isUpdating}
              ⏳
            {:else}
              🆕
            {/if}
          </div>
          {#if !isUpdating}
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          {/if}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-black text-white mb-1">
            {#if isUpdating}
              Updating App...
            {:else}
              New Version Available!
            {/if}
          </h3>

          <p class="text-sm text-white/90 mb-4">
            {#if isUpdating}
              Installing the latest version...
            {:else}
              A new version of Lifer is available with improvements and bug fixes.
            {/if}
          </p>

          {#if !isUpdating}
            <div class="flex gap-2">
              <button
                on:click={handleUpdate}
                class="flex-1 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                aria-label="Update now"
              >
                🚀 Update Now
              </button>
              <button
                on:click={dismissNotification}
                class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all active:scale-95"
                aria-label="Remind me later"
              >
                Later
              </button>
            </div>
          {:else}
            <div class="flex items-center gap-2 text-white/90">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-100"></div>
                <div class="w-2 h-2 bg-white rounded-full animate-bounce animation-delay-200"></div>
              </div>
              <span class="text-sm">Please wait...</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Close Button (only when not updating) -->
      {#if !isUpdating}
        <button
          on:click={dismissNotification}
          class="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss notification"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes slide-down {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes bounce-slow {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }

  @keyframes pulse-slow {
    0%, 100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.6;
    }
  }

  .animate-slide-down {
    animation: slide-down 0.3s ease-out;
  }

  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  .animation-delay-100 {
    animation-delay: 100ms;
  }

  .animation-delay-200 {
    animation-delay: 200ms;
  }
</style>
