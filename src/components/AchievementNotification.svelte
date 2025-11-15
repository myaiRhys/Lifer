<script lang="ts">
  import { onMount } from 'svelte'
  import type { Achievement, VictoryEmotion } from '../lib/types'
  import { celebrateAchievement } from '../lib/animations'
  import { soundSystem } from '../lib/sounds'
  import { addVictory } from '../lib/db'

  export let achievement: Achievement | null = null
  export let onClose: () => void

  let visible = false
  let showCookieJarPrompt = false
  let autoHideTimeout: number | null = null

  $: if (achievement) {
    visible = true
    showCookieJarPrompt = false
    celebrateAchievement()
    soundSystem.achievementUnlocked()

    // Auto-hide after 8 seconds (gives time to click Cookie Jar button)
    autoHideTimeout = setTimeout(() => {
      visible = false
      setTimeout(onClose, 300)
    }, 8000)
  }

  function handleAddToCookieJar() {
    if (autoHideTimeout) clearTimeout(autoHideTimeout)
    showCookieJarPrompt = true
  }

  async function handleSaveToCookieJar() {
    if (!achievement) return

    // Auto-capture with default values
    // User can edit later in Cookie Jar view
    await addVictory({
      title: achievement.name,
      story: achievement.description,
      emotion: getDefaultEmotion(achievement.rarity),
      difficulty: getDifficultyFromRarity(achievement.rarity),
      category: 'habit',
      sourceType: 'achievement',
      sourceId: achievement.id
    })

    visible = false
    setTimeout(onClose, 300)
  }

  function getDefaultEmotion(rarity: string): VictoryEmotion {
    switch (rarity) {
      case 'legendary': return 'unstoppable'
      case 'epic': return 'proud'
      case 'rare': return 'energized'
      default: return 'proud'
    }
  }

  function getDifficultyFromRarity(rarity: string): number {
    switch (rarity) {
      case 'legendary': return 10
      case 'epic': return 8
      case 'rare': return 6
      default: return 5
    }
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
  <div class="fixed top-6 right-6 z-50 animate-slide-in">
    <div class="relative bg-gradient-to-br {getRarityColor(achievement.rarity)} rounded-2xl p-6 shadow-2xl max-w-sm border-4 border-white/30 backdrop-blur-xl">
      <!-- Glow Effect -->
      <div class="absolute -inset-1 bg-gradient-to-br {getRarityColor(achievement.rarity)} rounded-2xl blur-xl opacity-50 -z-10"></div>

      <div class="flex items-start gap-4">
        <div class="text-5xl drop-shadow-2xl animate-bounce">{achievement.icon}</div>
        <div class="flex-1">
          <div class="text-xs text-white/90 uppercase tracking-widest mb-2 font-black">🏆 Achievement Unlocked!</div>
          <h3 class="font-black text-white text-xl mb-1 drop-shadow-lg">{achievement.name}</h3>
          <p class="text-white/95 text-base font-medium mb-3">{achievement.description}</p>

          {#if !showCookieJarPrompt}
            <button
              on:click={handleAddToCookieJar}
              class="w-full px-3 py-2 bg-orange-600/30 hover:bg-orange-600/50 border border-orange-400/50 rounded-lg text-sm font-bold text-white transition-all hover:scale-105"
            >
              🍪 Add to Cookie Jar
            </button>
          {:else}
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <p class="text-white text-xs mb-2">Save this victory for hard moments?</p>
              <div class="flex gap-2">
                <button
                  on:click={handleSaveToCookieJar}
                  class="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-xs font-bold transition-all"
                >
                  ✓ Yes
                </button>
                <button
                  on:click={() => showCookieJarPrompt = false}
                  class="flex-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs font-bold transition-all"
                >
                  Not now
                </button>
              </div>
            </div>
          {/if}
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
