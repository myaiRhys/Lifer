<script lang="ts">
  import { onMount } from 'svelte'
  import { celebrateLevelUp } from '../lib/animations'
  import { soundSystem } from '../lib/sounds'

  export let visible = false
  export let level: number
  export let onClose: () => void

  onMount(() => {
    if (visible) {
      celebrateLevelUp()
      soundSystem.levelUp()
    }
  })

  function handleClose() {
    visible = false
    onClose()
  }
</script>

{#if visible}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" on:click={handleClose}>
    <div class="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-8 max-w-md animate-scale-in" on:click|stopPropagation>
      <div class="text-center">
        <div class="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 class="text-4xl font-bold text-white mb-2">LEVEL UP!</h2>
        <div class="text-6xl font-bold text-white mb-4">{level}</div>
        <p class="text-white/90 mb-6">You're getting stronger! Keep pushing forward!</p>
        <button
          class="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
          on:click={handleClose}
        >
          AWESOME!
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scale-in {
    from {
      transform: scale(0.5);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-scale-in {
    animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
</style>
