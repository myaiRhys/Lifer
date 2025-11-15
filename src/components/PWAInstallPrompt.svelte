<script lang="ts">
  import { onMount } from 'svelte'

  let deferredPrompt: any = null
  let showPrompt = false
  let isStandalone = false
  let showInstructions = false
  let isIOS = false

  onMount(() => {
    // Check if already installed (standalone mode)
    isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone ||
                    document.referrer.includes('android-app://')

    // Detect iOS
    isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // Don't show prompt if already installed
    if (isStandalone) {
      return
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      // Show our custom prompt
      showPrompt = true
    })

    // Listen for successful app install
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      showPrompt = false
      deferredPrompt = null
    })

    // For iOS, show instructions after a delay if not installed
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        const hasSeenIOSPrompt = localStorage.getItem('lifer_ios_prompt_seen')
        if (!hasSeenIOSPrompt) {
          showInstructions = true
        }
      }, 3000) // Show after 3 seconds
    }
  })

  async function handleInstall() {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    console.log(`User response to the install prompt: ${outcome}`)

    // Clear the deferredPrompt for the next time
    deferredPrompt = null
    showPrompt = false
  }

  function dismissPrompt() {
    showPrompt = false
    // Remember dismissal for 7 days
    localStorage.setItem('lifer_install_dismissed', Date.now().toString())
  }

  function dismissIOSInstructions() {
    showInstructions = false
    localStorage.setItem('lifer_ios_prompt_seen', 'true')
  }
</script>

<!-- Android/Desktop Install Prompt -->
{#if showPrompt && !isStandalone}
  <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
    <div class="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl border-2 border-blue-400/50 backdrop-blur-xl">
      <!-- Glow Effect -->
      <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-50 -z-10"></div>

      <div class="flex items-start gap-4">
        <div class="text-5xl">📱</div>
        <div class="flex-1">
          <h3 class="text-xl font-black text-white mb-1">Install Lifer App</h3>
          <p class="text-sm text-white/90 mb-4">
            Install Lifer on your device for offline access and a better experience!
          </p>

          <div class="flex gap-2">
            <button
              on:click={handleInstall}
              class="flex-1 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-all hover:scale-105"
            >
              Install
            </button>
            <button
              on:click={dismissPrompt}
              class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- iOS Install Instructions -->
{#if showInstructions && isIOS && !isStandalone}
  <div class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
    <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-2xl border-2 border-purple-400/50 backdrop-blur-xl">
      <!-- Glow Effect -->
      <div class="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-50 -z-10"></div>

      <div class="flex items-start gap-4">
        <div class="text-4xl">🍎</div>
        <div class="flex-1">
          <h3 class="text-lg font-black text-white mb-2">Install Lifer on iOS</h3>
          <ol class="text-sm text-white/90 mb-4 space-y-2 list-decimal list-inside">
            <li>Tap the Share button <span class="inline-block px-1.5 py-0.5 bg-white/20 rounded text-xs">↑</span></li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" to install</li>
          </ol>

          <button
            on:click={dismissIOSInstructions}
            class="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-bold transition-all"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
