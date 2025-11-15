<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getVictories,
    addVictory,
    retrieveVictory,
    getRandomVictory,
    getCookieJarStats,
    updateVictory,
    deleteVictory,
    getForgottenVictories
  } from '../lib/db'
  import type { CookieJarVictory, CookieJarStats, VictoryEmotion } from '../lib/types'

  let victories: CookieJarVictory[] = []
  let stats: CookieJarStats | null = null
  let showAddForm = false
  let showRandomVictory = false
  let selectedVictory: CookieJarVictory | null = null
  let forgottenVictories: CookieJarVictory[] = []

  // Form fields
  let formTitle = ''
  let formStory = ''
  let formEmotion: VictoryEmotion = 'proud'
  let formDifficulty = 5
  let formCategory: CookieJarVictory['category'] = 'habit'

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    victories = await getVictories()
    stats = await getCookieJarStats()
    forgottenVictories = await getForgottenVictories()
  }

  async function handleAddVictory() {
    if (!formTitle.trim() || !formStory.trim()) return

    await addVictory({
      title: formTitle.trim(),
      story: formStory.trim(),
      emotion: formEmotion,
      difficulty: formDifficulty,
      category: formCategory
    })

    resetForm()
    await loadData()
  }

  function resetForm() {
    showAddForm = false
    formTitle = ''
    formStory = ''
    formEmotion = 'proud'
    formDifficulty = 5
    formCategory = 'habit'
  }

  async function handleRetrieveVictory(victory: CookieJarVictory) {
    selectedVictory = await retrieveVictory(victory.id)
    showRandomVictory = true
    await loadData()
  }

  async function handleGetRandomVictory() {
    selectedVictory = await getRandomVictory()
    if (selectedVictory) {
      showRandomVictory = true
      await loadData()
    } else {
      alert('Add some victories first! Every achievement is a victory.')
    }
  }

  async function handleDeleteVictory(victoryId: string) {
    if (confirm('Remove this victory from your Cookie Jar?')) {
      await deleteVictory(victoryId)
      await loadData()
    }
  }

  function getEmotionEmoji(emotion: VictoryEmotion): string {
    const emojiMap: Record<VictoryEmotion, string> = {
      proud: '💪',
      relieved: '😌',
      unstoppable: '🔥',
      grateful: '🙏',
      fierce: '⚡',
      calm: '🧘',
      energized: '⚡'
    }
    return emojiMap[emotion]
  }

  function getCategoryEmoji(category: CookieJarVictory['category']): string {
    const emojiMap: Record<CookieJarVictory['category'], string> = {
      physical: '💪',
      mental: '🧠',
      emotional: '❤️',
      professional: '💼',
      relationship: '👥',
      habit: '🎯'
    }
    return emojiMap[category]
  }

  function getDifficultyColor(difficulty: number): string {
    if (difficulty >= 8) return 'from-red-600 to-red-700'
    if (difficulty >= 6) return 'from-orange-600 to-orange-700'
    if (difficulty >= 4) return 'from-yellow-600 to-yellow-700'
    return 'from-green-600 to-green-700'
  }

  function getStrengthColor(strength: number): string {
    if (strength >= 80) return 'text-red-400'
    if (strength >= 60) return 'text-orange-400'
    if (strength >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }
</script>

<div class="max-w-6xl mx-auto">
  <!-- Header -->
  <div class="mb-8 animate-fade-in-scale">
    <h2 class="text-4xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-2">
      🍪 Cookie Jar
    </h2>
    <p class="text-slate-300 text-lg">
      Your mental toughness vault. When you think you're done, you're only at <span class="text-red-400 font-bold">40%</span>.
    </p>
    <p class="text-slate-400 text-sm mt-2 italic">
      "The Cookie Jar is a place to go back and remember the hard things you've overcome." - David Goggins
    </p>
  </div>

  <!-- Stats Dashboard -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up stagger-1 opacity-0">
      <div class="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-orange-500/50 rounded-2xl p-6 shadow-xl">
        <div class="text-sm text-slate-400 mb-1">Total Victories</div>
        <div class="text-4xl font-black text-orange-400">{stats.totalVictories}</div>
      </div>

      <div class="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-2xl p-6 shadow-xl">
        <div class="text-sm text-slate-400 mb-1">Times Retrieved</div>
        <div class="text-4xl font-black text-blue-400">{stats.totalRetrievals}</div>
      </div>

      <div class="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 shadow-xl">
        <div class="text-sm text-slate-400 mb-1">Avg Difficulty</div>
        <div class="text-4xl font-black text-purple-400">{stats.avgDifficulty}/10</div>
      </div>

      <div class="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-6 shadow-xl">
        <div class="text-sm text-slate-400 mb-1">Mental Strength</div>
        <div class="text-4xl font-black {getStrengthColor(stats.currentStrength)}">{stats.currentStrength}%</div>
      </div>
    </div>
  {/if}

  <!-- 40% Rule Button -->
  <div class="mb-8 animate-fade-in-up stagger-2 opacity-0">
    <button
      on:click={handleGetRandomVictory}
      class="w-full py-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 rounded-2xl font-black text-2xl shadow-2xl shadow-red-500/50 hover:shadow-orange-500/50 transition-all hover:scale-[1.02] border-4 border-red-400/30"
    >
      🔥 I'm at 40% - Give Me Strength
    </button>
    <p class="text-center text-slate-400 text-sm mt-2">
      When you feel like quitting, remember: you're only 40% done. You have 60% left.
    </p>
  </div>

  <!-- Actions -->
  <div class="flex gap-4 mb-8 animate-fade-in-up stagger-3 opacity-0">
    <button
      on:click={() => showAddForm = !showAddForm}
      class="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all hover:scale-105 border-2 border-blue-400/30"
    >
      {showAddForm ? '❌ Cancel' : '✨ Add Victory'}
    </button>
  </div>

  <!-- Add Victory Form -->
  {#if showAddForm}
    <div class="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 mb-8 shadow-2xl shadow-purple-500/30 animate-fade-in-scale">
      <h3 class="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">✨ Add a Victory</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">What did you overcome?</label>
          <input
            type="text"
            bind:value={formTitle}
            placeholder="e.g., Ran first 5K, Landed the promotion, 100-day meditation streak"
            class="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">The Story (Emotional Context)</label>
          <textarea
            bind:value={formStory}
            placeholder="What made this hard? How did you feel when you achieved it? What did you have to overcome? Be specific and emotional."
            rows="6"
            class="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 transition-all resize-none"
          />
          <p class="text-xs text-slate-400 mt-2">
            💡 The more emotional detail, the more powerful this victory becomes when you retrieve it.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">How did you feel?</label>
            <select
              bind:value={formEmotion}
              class="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-purple-400 transition-all"
            >
              <option value="proud">💪 Proud</option>
              <option value="relieved">😌 Relieved</option>
              <option value="unstoppable">🔥 Unstoppable</option>
              <option value="grateful">🙏 Grateful</option>
              <option value="fierce">⚡ Fierce</option>
              <option value="calm">🧘 Calm</option>
              <option value="energized">⚡ Energized</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Category</label>
            <select
              bind:value={formCategory}
              class="w-full px-4 py-3 bg-slate-900/80 border-2 border-slate-600 rounded-xl focus:outline-none focus:border-purple-400 transition-all"
            >
              <option value="physical">💪 Physical</option>
              <option value="mental">🧠 Mental</option>
              <option value="emotional">❤️ Emotional</option>
              <option value="professional">💼 Professional</option>
              <option value="relationship">👥 Relationship</option>
              <option value="habit">🎯 Habit</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            Difficulty: <span class="font-black text-lg bg-gradient-to-r {getDifficultyColor(formDifficulty)} bg-clip-text text-transparent">{formDifficulty}/10</span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            bind:value={formDifficulty}
            class="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-xs text-slate-500 mt-2">
            <span>Easy</span>
            <span>Hard</span>
            <span>Extremely Hard</span>
          </div>
        </div>

        <button
          on:click={handleAddVictory}
          disabled={!formTitle.trim() || !formStory.trim()}
          class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg shadow-xl shadow-purple-500/50 hover:shadow-pink-500/50 transition-all hover:scale-105 border-2 border-purple-400/30 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
        >
          💾 Save Victory
        </button>
      </div>
    </div>
  {/if}

  <!-- Forgotten Victories Alert -->
  {#if forgottenVictories.length > 0}
    <div class="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-2xl p-6 mb-8 animate-fade-in-up stagger-4 opacity-0">
      <h3 class="text-xl font-bold text-yellow-400 mb-2">⚠️ Forgotten Victories</h3>
      <p class="text-slate-300 mb-4">
        You have {forgottenVictories.length} powerful {forgottenVictories.length === 1 ? 'victory' : 'victories'} you haven't accessed in over 30 days. Don't forget your strength!
      </p>
      <div class="flex flex-wrap gap-2">
        {#each forgottenVictories.slice(0, 3) as victory}
          <button
            on:click={() => handleRetrieveVictory(victory)}
            class="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500/50 rounded-lg text-sm font-medium transition-all hover:scale-105"
          >
            {victory.title}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Victory List -->
  {#if victories.length > 0}
    <div class="space-y-4">
      {#each victories as victory, index (victory.id)}
        <div class="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border-2 border-slate-600/50 hover:border-orange-500/50 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 animate-fade-in-up {index < 6 ? `stagger-${index + 5}` : ''} opacity-0">
          <div class="flex items-start gap-4">
            <div class="text-5xl">{getEmotionEmoji(victory.emotion)}</div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 mb-3">
                <h3 class="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-yellow-400 group-hover:bg-clip-text transition-all">
                  {victory.title}
                </h3>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <div class="px-3 py-1 rounded-lg font-bold text-sm bg-gradient-to-r {getDifficultyColor(victory.difficulty)} border border-white/20">
                    {victory.difficulty}/10
                  </div>
                  <div class="text-2xl" title={victory.category}>
                    {getCategoryEmoji(victory.category)}
                  </div>
                </div>
              </div>

              <p class="text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">{victory.story}</p>

              <div class="flex items-center gap-4 text-sm text-slate-400">
                <div>
                  Retrieved <span class="font-bold text-blue-400">{victory.timesRetrieved}</span> {victory.timesRetrieved === 1 ? 'time' : 'times'}
                </div>
                {#if victory.lastRetrievedAt}
                  <div>
                    Last accessed: {new Date(victory.lastRetrievedAt).toLocaleDateString()}
                  </div>
                {/if}
                <div>
                  {new Date(victory.dateAchieved).toLocaleDateString()}
                </div>
              </div>

              <div class="flex gap-3 mt-4">
                <button
                  on:click={() => handleRetrieveVictory(victory)}
                  class="px-4 py-2 text-sm font-medium text-orange-300 hover:text-orange-200 bg-orange-900/30 hover:bg-orange-800/50 rounded-lg transition-all hover:scale-105"
                >
                  🔥 Retrieve for Strength
                </button>
                <button
                  on:click={() => handleDeleteVictory(victory.id)}
                  class="px-4 py-2 text-sm font-medium text-red-300 hover:text-red-200 bg-red-900/30 hover:bg-red-800/50 rounded-lg transition-all hover:scale-105"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-16 animate-fade-in-up stagger-5 opacity-0">
      <div class="text-6xl mb-4">🍪</div>
      <p class="text-2xl font-bold text-slate-400 mb-2">Your Cookie Jar is empty</p>
      <p class="text-slate-500 mb-6">
        Start by adding your greatest victories. Every achievement, every hard moment you overcame, belongs here.
      </p>
      <button
        on:click={() => showAddForm = true}
        class="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-2xl font-bold text-xl shadow-2xl shadow-orange-500/50 transition-all hover:scale-105 border-2 border-orange-400/30"
      >
        ✨ Add Your First Victory
      </button>
    </div>
  {/if}
</div>

<!-- Random Victory Modal -->
{#if showRandomVictory && selectedVictory}
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" on:click={() => showRandomVictory = false}>
    <div class="relative bg-gradient-to-br from-orange-500/95 via-red-500/95 to-yellow-600/95 backdrop-blur-2xl rounded-3xl p-10 max-w-2xl w-full animate-scale-in border-4 border-yellow-300/50 shadow-2xl shadow-orange-500/50" on:click|stopPropagation>
      <!-- Glow Effects -->
      <div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl blur-2xl opacity-50 -z-10"></div>

      <div class="text-center mb-8">
        <div class="text-8xl mb-4 animate-bounce drop-shadow-2xl">{getEmotionEmoji(selectedVictory.emotion)}</div>
        <h2 class="text-4xl font-black text-white mb-2 drop-shadow-lg">{selectedVictory.title}</h2>
        <div class="inline-block px-6 py-2 bg-white/20 rounded-2xl border-2 border-white/30 backdrop-blur-sm">
          <span class="text-xl font-bold text-white">Difficulty: {selectedVictory.difficulty}/10</span>
        </div>
      </div>

      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-white/20">
        <p class="text-xl text-white leading-relaxed whitespace-pre-wrap font-medium">
          {selectedVictory.story}
        </p>
      </div>

      <div class="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border-2 border-yellow-300/30">
        <p class="text-2xl font-black text-white text-center mb-4">
          💪 YOU DID THIS ONCE. YOU CAN DO IT AGAIN.
        </p>
        <p class="text-lg text-white/90 text-center italic">
          "When you think you're done, you're only 40% done. You have 60% left in the tank."
        </p>
      </div>

      <div class="text-center">
        <button
          class="bg-white text-orange-600 px-12 py-4 rounded-2xl font-black text-xl hover:scale-110 hover:shadow-2xl hover:shadow-white/50 transition-all border-4 border-orange-200"
          on:click={() => showRandomVictory = false}
        >
          🔥 LET'S GO!
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
