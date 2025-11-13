<script lang="ts">
  import { onMount } from 'svelte'
  import { getAchievementsWithProgress } from '../lib/db/achievements'

  let achievements: any[] = []
  let filter: string = 'all'

  onMount(async () => {
    await loadAchievements()
  })

  async function loadAchievements() {
    achievements = await getAchievementsWithProgress()
  }

  function getRarityColor(rarity: string) {
    switch (rarity) {
      case 'common': return 'border-slate-500 bg-slate-500/10'
      case 'rare': return 'border-blue-500 bg-blue-500/10'
      case 'epic': return 'border-purple-500 bg-purple-500/10'
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10'
      default: return 'border-slate-500 bg-slate-500/10'
    }
  }

  function getRarityBadge(rarity: string) {
    const colors = {
      common: 'bg-slate-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  $: filteredAchievements = filter === 'all'
    ? achievements
    : filter === 'unlocked'
    ? achievements.filter(a => a.unlocked)
    : achievements.filter(a => !a.unlocked)

  $: unlockedCount = achievements.filter(a => a.unlocked).length
  $: totalCount = achievements.length
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-2">Achievements</h2>
    <p class="text-slate-400">{unlockedCount} of {totalCount} unlocked</p>
  </div>

  <!-- Filter Tabs -->
  <div class="flex gap-2 mb-6 border-b border-slate-700">
    <button
      class="px-4 py-2 {filter === 'all' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}"
      on:click={() => filter = 'all'}
    >
      All
    </button>
    <button
      class="px-4 py-2 {filter === 'unlocked' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}"
      on:click={() => filter = 'unlocked'}
    >
      Unlocked ({unlockedCount})
    </button>
    <button
      class="px-4 py-2 {filter === 'locked' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}"
      on:click={() => filter = 'locked'}
    >
      Locked ({totalCount - unlockedCount})
    </button>
  </div>

  <!-- Achievements Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each filteredAchievements as achievement}
      <div class="bg-slate-800 border-2 {getRarityColor(achievement.rarity)} rounded-lg p-4 {achievement.unlocked ? '' : 'opacity-50'}">
        <div class="flex items-start gap-3">
          <div class="text-4xl {achievement.unlocked ? '' : 'grayscale'}">{achievement.icon}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="font-bold text-lg">{achievement.name}</h3>
              <span class="text-xs px-2 py-1 rounded {getRarityBadge(achievement.rarity)} text-white uppercase">
                {achievement.rarity}
              </span>
            </div>
            <p class="text-sm text-slate-400 mb-2">{achievement.description}</p>

            {#if achievement.progress}
              <div class="mb-2">
                <div class="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress.current}/{achievement.progress.total}</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full transition-all"
                    style="width: {Math.min((achievement.progress.current / achievement.progress.total) * 100, 100)}%"
                  />
                </div>
              </div>
            {/if}

            {#if achievement.unlocked && achievement.unlockedAt}
              <p class="text-xs text-green-400">
                ✓ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            {:else}
              <p class="text-xs text-slate-500">🔒 Locked</p>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
