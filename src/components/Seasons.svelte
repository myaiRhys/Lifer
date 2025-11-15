<script lang="ts">
  import { onMount } from 'svelte'
  import type { Season, SeasonPhase, SeasonStats } from '../lib/types'
  import {
    getCurrentSeason,
    getSeasonStats,
    getSeasonHistory,
    startNewSeason,
    updateSeasonFocus,
    checkSeasonTransition,
    getNextSeason,
    getSeasonEmoji,
    getSeasonColors
  } from '../lib/db'

  let currentSeason: SeasonPhase | undefined
  let stats: SeasonStats | undefined
  let history: SeasonPhase[] = []
  let transitionSuggestion: any = null
  let showTransitionModal = false
  let showThemeEditor = false

  // Form states
  let selectedNewSeason: Season = 'spring'
  let newSeasonTheme = ''
  let editTheme = ''
  let editReflection = ''

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    currentSeason = await getCurrentSeason()
    stats = await getSeasonStats()
    history = await getSeasonHistory()
    transitionSuggestion = await checkSeasonTransition()

    // Initialize first season if none exists
    if (!currentSeason) {
      currentSeason = await startNewSeason({ season: 'spring' })
      stats = await getSeasonStats()
    }

    // Pre-fill edit forms if current season exists
    if (currentSeason) {
      editTheme = currentSeason.theme || ''
      editReflection = currentSeason.reflectionNotes || ''
      selectedNewSeason = getNextSeason(currentSeason.season)
    }
  }

  async function handleTransitionSeason() {
    if (!currentSeason) return

    await startNewSeason({
      season: selectedNewSeason,
      theme: newSeasonTheme || undefined
    })

    showTransitionModal = false
    newSeasonTheme = ''
    await loadData()
  }

  async function handleUpdateTheme() {
    if (!currentSeason) return

    await updateSeasonFocus({
      theme: editTheme || undefined,
      reflectionNotes: editReflection || undefined
    })

    showThemeEditor = false
    await loadData()
  }

  function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatDuration(days: number): string {
    if (days < 30) return `${days} days`
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''}`
    return `${months}mo ${remainingDays}d`
  }

  function getSeasonDescription(season: Season): string {
    switch (season) {
      case 'spring':
        return 'A time for new beginnings, experimentation, and planting seeds for the future.'
      case 'summer':
        return 'Peak performance season. Execute with intensity and produce your best work.'
      case 'fall':
        return 'Harvest what you have built. Reflect, integrate learnings, and celebrate wins.'
      case 'winter':
        return 'Rest and strategic planning. Let old patterns die to make room for new growth.'
      default:
        return ''
    }
  }
</script>

<div class="max-w-5xl mx-auto p-6">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-4xl font-black text-white mb-2">🌍 Seasons of Life</h1>
    <p class="text-lg text-slate-300">
      Based on Robert Greene's long-term cyclical framework
    </p>
    <p class="text-sm text-slate-400 mt-2 italic">
      "The greatest mistake is to think you can sustain summer forever."
    </p>
  </div>

  {#if currentSeason && stats}
    <!-- Transition Alert -->
    {#if transitionSuggestion && transitionSuggestion.daysInSeason >= 90}
      <div class="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-400/30 rounded-xl backdrop-blur-sm">
        <div class="flex items-start gap-3">
          <div class="text-3xl">⏰</div>
          <div class="flex-1">
            <h3 class="font-bold text-white mb-1">
              {transitionSuggestion.shouldTransition ? 'Time for a New Season' : 'Season Reflection'}
            </h3>
            <p class="text-slate-200 text-sm mb-3">{transitionSuggestion.message}</p>
            <button
              on:click={() => showTransitionModal = true}
              class="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-all hover:scale-105"
            >
              Transition to {getSeasonEmoji(transitionSuggestion.nextSeason)} {transitionSuggestion.nextSeason.charAt(0).toUpperCase() + transitionSuggestion.nextSeason.slice(1)}
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Current Season Card -->
    <div class="mb-8 p-8 bg-gradient-to-br {getSeasonColors(currentSeason.season).gradient} rounded-3xl shadow-2xl border-4 border-white/30 backdrop-blur-xl relative overflow-hidden">
      <!-- Glow Effect -->
      <div class="absolute -inset-1 bg-gradient-to-br {getSeasonColors(currentSeason.season).gradient} rounded-3xl blur-xl opacity-50 -z-10"></div>

      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <div class="text-7xl drop-shadow-2xl">{getSeasonEmoji(currentSeason.season)}</div>
          <div>
            <div class="text-xs text-white/80 uppercase tracking-widest font-black mb-1">Current Season</div>
            <h2 class="text-4xl font-black text-white capitalize">{currentSeason.season}</h2>
            <p class="text-white/90 text-sm mt-1">{stats.daysInCurrentSeason} days in this season</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            on:click={() => showThemeEditor = true}
            class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-white transition-all backdrop-blur-sm"
          >
            ✏️ Edit
          </button>
          <button
            on:click={() => showTransitionModal = true}
            class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-white transition-all backdrop-blur-sm"
          >
            🔄 Transition
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div class="text-xs text-white/70 uppercase tracking-wider mb-1">Energy Pattern</div>
          <div class="text-lg font-bold text-white capitalize">{currentSeason.energyPattern}</div>
        </div>

        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div class="text-xs text-white/70 uppercase tracking-wider mb-1">Mindset</div>
          <div class="text-base text-white">{currentSeason.mindset}</div>
        </div>

        {#if currentSeason.theme}
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="text-xs text-white/70 uppercase tracking-wider mb-1">Season Theme</div>
            <div class="text-base font-bold text-white">{currentSeason.theme}</div>
          </div>
        {/if}

        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div class="text-xs text-white/70 uppercase tracking-wider mb-1">Description</div>
          <div class="text-sm text-white/90">{getSeasonDescription(currentSeason.season)}</div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-600/50">
        <div class="text-3xl mb-2">🔄</div>
        <div class="text-2xl font-black text-white mb-1">{stats.totalSeasonsCycled}</div>
        <div class="text-sm text-slate-300">Seasons Completed</div>
      </div>

      <div class="p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-600/50">
        <div class="text-3xl mb-2">📊</div>
        <div class="text-2xl font-black text-white mb-1">{formatDuration(stats.seasonalPatterns.avgSeasonDuration)}</div>
        <div class="text-sm text-slate-300">Avg Season Length</div>
      </div>

      {#if stats.seasonalPatterns.mostProductiveSeason}
        <div class="p-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-600/50">
          <div class="text-3xl mb-2">{getSeasonEmoji(stats.seasonalPatterns.mostProductiveSeason)}</div>
          <div class="text-2xl font-black text-white mb-1 capitalize">{stats.seasonalPatterns.mostProductiveSeason}</div>
          <div class="text-sm text-slate-300">Most Productive</div>
        </div>
      {/if}
    </div>

    <!-- Season History -->
    {#if history.length > 0}
      <div class="mb-8">
        <h3 class="text-2xl font-black text-white mb-4">📜 Season History</h3>
        <div class="space-y-3">
          {#each history as phase}
            <div class="p-4 bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all">
              <div class="flex items-start gap-4">
                <div class="text-4xl">{getSeasonEmoji(phase.season)}</div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="text-lg font-bold text-white capitalize">{phase.season}</h4>
                    {#if phase.theme}
                      <span class="px-2 py-0.5 bg-blue-600/30 border border-blue-400/40 rounded text-xs font-bold text-blue-200">
                        {phase.theme}
                      </span>
                    {/if}
                  </div>
                  <div class="text-sm text-slate-400">
                    {formatDate(phase.startDate)} → {phase.endDate ? formatDate(phase.endDate) : 'Present'}
                    {#if phase.endDate}
                      <span class="ml-2 text-slate-500">
                        ({formatDuration(Math.floor((new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / (1000 * 60 * 60 * 24)))})
                      </span>
                    {/if}
                  </div>
                  {#if phase.reflectionNotes}
                    <p class="text-sm text-slate-300 mt-2 italic">"{phase.reflectionNotes}"</p>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Season Cycle Reference -->
    <div class="p-6 bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-600/30">
      <h3 class="text-xl font-black text-white mb-4">🌀 The Natural Cycle</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each ['spring', 'summer', 'fall', 'winter'] as season}
          <div class="p-4 bg-slate-900/40 rounded-lg border border-slate-600/20">
            <div class="flex items-center gap-3 mb-2">
              <div class="text-3xl">{getSeasonEmoji(season)}</div>
              <div class="text-lg font-bold text-white capitalize">{season}</div>
            </div>
            <p class="text-sm text-slate-300">{getSeasonDescription(season)}</p>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="text-center py-12">
      <div class="text-6xl mb-4">🌱</div>
      <p class="text-slate-400">Loading seasons...</p>
    </div>
  {/if}
</div>

<!-- Transition Modal -->
{#if showTransitionModal && currentSeason}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
    <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border-2 border-slate-600 shadow-2xl">
      <h2 class="text-3xl font-black text-white mb-4">🔄 Transition to New Season</h2>

      <div class="mb-6 p-4 bg-slate-900/60 rounded-lg border border-slate-600/40">
        <p class="text-slate-300 mb-2">
          You're currently in <span class="font-bold text-white capitalize">{currentSeason.season}</span> ({stats?.daysInCurrentSeason} days).
        </p>
        <p class="text-sm text-slate-400">
          Transitioning seasons is a deliberate act. Reflect on what this season taught you before moving forward.
        </p>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-bold text-slate-300 mb-2">New Season</label>
        <select
          bind:value={selectedNewSeason}
          class="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white font-medium"
        >
          {#each ['spring', 'summer', 'fall', 'winter'] as season}
            <option value={season}>{getSeasonEmoji(season)} {season.charAt(0).toUpperCase() + season.slice(1)}</option>
          {/each}
        </select>
        <p class="text-sm text-slate-400 mt-2">{getSeasonDescription(selectedNewSeason)}</p>
      </div>

      <div class="mb-6">
        <label class="block text-sm font-bold text-slate-300 mb-2">Season Theme (Optional)</label>
        <input
          type="text"
          bind:value={newSeasonTheme}
          placeholder="e.g., Building My Creative Business"
          class="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-500"
        />
      </div>

      <div class="flex gap-3">
        <button
          on:click={handleTransitionSeason}
          class="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-bold text-white transition-all hover:scale-105 shadow-lg"
        >
          Begin New Season
        </button>
        <button
          on:click={() => showTransitionModal = false}
          class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Theme Editor Modal -->
{#if showThemeEditor && currentSeason}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
    <div class="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full border-2 border-slate-600 shadow-2xl">
      <h2 class="text-3xl font-black text-white mb-4">✏️ Edit Season Focus</h2>

      <div class="mb-6">
        <label class="block text-sm font-bold text-slate-300 mb-2">Season Theme</label>
        <input
          type="text"
          bind:value={editTheme}
          placeholder="What's the focus of this season?"
          class="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-500"
        />
      </div>

      <div class="mb-6">
        <label class="block text-sm font-bold text-slate-300 mb-2">Reflection Notes</label>
        <textarea
          bind:value={editReflection}
          placeholder="What are you learning in this season?"
          rows="4"
          class="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 resize-none"
        />
      </div>

      <div class="flex gap-3">
        <button
          on:click={handleUpdateTheme}
          class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-white transition-all hover:scale-105"
        >
          Save Changes
        </button>
        <button
          on:click={() => showThemeEditor = false}
          class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
