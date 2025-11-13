<script lang="ts">
  import { onMount } from 'svelte'
  import type { Achievement } from '../lib/types'
  import { celebrateAchievement } from '../lib/animations'
  import { soundSystem } from '../lib/sounds'

  export let achievement: Achievement | null = null
  export let onClose: () => void

  let visible = false

  $: if (achievement) {
    visible = true
    celebrateAchievement()
    soundSystem.achievementUnlocked()

    setTimeout(() => {
      visible = false
      setTimeout(onClose, 300)
    }, 5000)
  }

  function getRarityColor(rarity: string) {
    switch (rarity) {
      case 'common': return 'from-slate-500 to-slate-600'
      case 'rare': return 'from-blue-500 to-blue-600'
      case 'epic': return 'from-purple-500 to-purple-600'
      case 'legendary': return 'from-yellow-500 to-orange-600'
      default: return 'from-slate-500 to-slate-600'
    }
  }
</script>

{#if visible && achievement}
  <div class="fixed top-4 right-4 z-50 animate-slide-in">
    <div class="bg-gradient-to-br {getRarityColor(achievement.rarity)} rounded-xl p-4 shadow-2xl max-w-sm border-2 border-white/20">
      <div class="flex items-start gap-3">
        <div class="text-4xl">{achievement.icon}</div>
        <div class="flex-1">
          <div class="text-xs text-white/80 uppercase tracking-wider mb-1">Achievement Unlocked!</div>
          <h3 class="font-bold text-white text-lg">{achievement.name}</h3>
          <p class="text-white/90 text-sm">{achievement.description}</p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-in {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
</style>
