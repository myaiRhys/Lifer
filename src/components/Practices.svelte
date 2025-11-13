<script lang="ts">
  import { onMount } from 'svelte'
  import { getPractices, logPractice } from '../lib/db'
  import type { Practice } from '../lib/types'

  let practices: Practice[] = []
  let selectedPractice: Practice | null = null
  let logValue: number = 0
  let showLogModal = false

  onMount(async () => {
    await loadPractices()
  })

  async function loadPractices() {
    practices = await getPractices()
  }

  function openLogModal(practice: Practice) {
    selectedPractice = practice
    logValue = practice.todayValue || 0
    showLogModal = true
  }

  async function handleLog() {
    if (!selectedPractice) return

    await logPractice(selectedPractice.id, logValue)
    await loadPractices()

    showLogModal = false
    selectedPractice = null
    logValue = 0
  }

  function getProgressPercentage(practice: Practice): number {
    if (practice.type === 'positive') {
      return Math.min((practice.todayValue / practice.target) * 100, 100)
    } else {
      // For negative practices, being under target is good
      if (practice.todayValue <= practice.target) {
        return 100
      }
      return Math.max(0, 100 - ((practice.todayValue - practice.target) / practice.target) * 100)
    }
  }

  function getProgressColor(practice: Practice): string {
    const percentage = getProgressPercentage(practice)
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 70) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  function getHabitStrengthColor(strength: number): string {
    if (strength >= 80) return 'text-green-400'
    if (strength >= 50) return 'text-yellow-400'
    if (strength >= 30) return 'text-orange-400'
    return 'text-red-400'
  }

  function getDayName(dayNum: number): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[dayNum]
  }

  function isScheduledToday(practice: Practice): boolean {
    if (practice.frequency === 'daily') return true
    if (practice.frequency === 'custom' && practice.scheduleDays) {
      const today = new Date().getDay()
      return practice.scheduleDays.includes(today)
    }
    return false
  }

  $: todaysPractices = practices.filter(isScheduledToday)
  $: completedToday = todaysPractices.filter(p => p.todayCompleted).length
  $: overallCompletion = todaysPractices.length > 0
    ? Math.round((completedToday / todaysPractices.length) * 100)
    : 0
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold">Practices</h2>
    <div class="text-right">
      <div class="text-sm text-slate-400">Today's Progress</div>
      <div class="text-2xl font-bold text-blue-400">{completedToday}/{todaysPractices.length}</div>
      <div class="text-xs text-slate-500">{overallCompletion}% Complete</div>
    </div>
  </div>

  {#if practices.length === 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
      <div class="text-6xl mb-4">♻️</div>
      <h3 class="text-xl font-semibold mb-2">No Practices Yet</h3>
      <p class="text-slate-400">
        Practices are daily habits that compound over time. Your core practices should be automatically loaded.
      </p>
    </div>
  {:else}
    <!-- Today's Practices -->
    {#if todaysPractices.length > 0}
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">Today's Practices</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each todaysPractices as practice}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="font-semibold text-lg mb-1">{practice.name}</h4>
                  {#if practice.description}
                    <p class="text-sm text-slate-400 mb-2">{practice.description}</p>
                  {/if}
                  <div class="flex items-center gap-3 text-sm">
                    <span class="text-slate-400">
                      Target: <span class="text-white font-medium">{practice.target} {practice.unit}</span>
                    </span>
                    <span class="text-slate-400">
                      Type: <span class="capitalize text-white">{practice.type}</span>
                    </span>
                  </div>
                </div>
                <button
                  class="px-4 py-2 rounded-lg font-medium transition-colors {practice.todayCompleted ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}"
                  on:click={() => openLogModal(practice)}
                >
                  {practice.todayCompleted ? '✓ Logged' : 'Log'}
                </button>
              </div>

              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress: {practice.todayValue} / {practice.target} {practice.unit}</span>
                  <span>{getProgressPercentage(practice).toFixed(0)}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="{getProgressColor(practice)} h-2 rounded-full transition-all"
                    style="width: {getProgressPercentage(practice)}%"
                  />
                </div>
              </div>

              <!-- Stats Row -->
              <div class="flex items-center justify-between text-sm pt-3 border-t border-slate-700">
                <div class="flex items-center gap-4">
                  <div>
                    <span class="text-slate-400">Streak:</span>
                    <span class="font-bold text-green-400 ml-1">
                      {practice.type === 'positive' ? practice.currentStreak : (practice.cleanStreak || 0)}
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-400">Best:</span>
                    <span class="font-bold text-yellow-400 ml-1">
                      {practice.type === 'positive' ? practice.longestStreak : (practice.longestCleanStreak || 0)}
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-slate-400">Habit Strength:</span>
                  <span class="font-bold {getHabitStrengthColor(practice.habitStrength)} ml-1">
                    {practice.habitStrength}%
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Other Practices (not scheduled today) -->
    {#if practices.length > todaysPractices.length}
      <div>
        <h3 class="text-xl font-semibold mb-4">Other Practices</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each practices.filter(p => !isScheduledToday(p)) as practice}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 opacity-60">
              <h4 class="font-semibold mb-2">{practice.name}</h4>
              <div class="text-sm text-slate-400 mb-2">
                {#if practice.frequency === 'custom' && practice.scheduleDays}
                  Scheduled: {practice.scheduleDays.map(d => getDayName(d)).join(', ')}
                {/if}
              </div>
              <div class="flex items-center justify-between text-sm">
                <div>
                  <span class="text-slate-400">Streak:</span>
                  <span class="font-bold text-green-400 ml-1">
                    {practice.type === 'positive' ? practice.currentStreak : (practice.cleanStreak || 0)}
                  </span>
                </div>
                <div>
                  <span class="text-slate-400">Strength:</span>
                  <span class="font-bold {getHabitStrengthColor(practice.habitStrength)} ml-1">
                    {practice.habitStrength}%
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Log Modal -->
{#if showLogModal && selectedPractice}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showLogModal = false}>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-4">Log {selectedPractice.name}</h3>

      {#if selectedPractice.description}
        <p class="text-sm text-slate-400 mb-4">{selectedPractice.description}</p>
      {/if}

      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">
          {selectedPractice.type === 'positive' ? 'Amount Completed' : 'Amount Consumed/Done'}
        </label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            bind:value={logValue}
            min="0"
            step={selectedPractice.unit === 'ml' ? 100 : selectedPractice.unit === 'grams' ? 10 : 0.5}
            class="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-lg font-medium focus:outline-none focus:border-blue-500"
            autofocus
          />
          <span class="text-slate-400 text-lg">{selectedPractice.unit}</span>
        </div>

        <!-- Quick increment buttons -->
        <div class="mt-3 flex flex-wrap gap-2">
          {#if selectedPractice.unit === 'ml'}
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 250}>+250ml</button>
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 500}>+500ml</button>
          {:else if selectedPractice.unit === 'grams'}
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 20}>+20g</button>
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 30}>+30g</button>
          {:else if selectedPractice.unit === 'minutes'}
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 15}>+15min</button>
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 30}>+30min</button>
          {:else if selectedPractice.unit === 'hours'}
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 1}>+1hr</button>
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 2}>+2hr</button>
          {:else}
            <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue += 1}>+1</button>
          {/if}
          <button class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm" on:click={() => logValue = selectedPractice.target}>Set to target</button>
        </div>
      </div>

      <div class="mb-4 p-3 bg-slate-900 rounded-lg">
        <div class="text-sm text-slate-400 mb-1">Target: {selectedPractice.target} {selectedPractice.unit}</div>
        {#if selectedPractice.type === 'positive'}
          <div class="text-sm">
            {#if logValue >= selectedPractice.target}
              <span class="text-green-400">✓ Target achieved!</span>
            {:else}
              <span class="text-yellow-400">Need {selectedPractice.target - logValue} more {selectedPractice.unit}</span>
            {/if}
          </div>
        {:else}
          <div class="text-sm">
            {#if logValue <= selectedPractice.target}
              <span class="text-green-400">✓ Under target (good!)</span>
            {:else}
              <span class="text-red-400">Over target by {logValue - selectedPractice.target} {selectedPractice.unit}</span>
            {/if}
          </div>
        {/if}
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => showLogModal = false}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handleLog}
        >
          Save Log
        </button>
      </div>
    </div>
  </div>
{/if}
