<script lang="ts">
  import { onMount } from 'svelte'
  import { getPractices, logPractice, logPracticeGateway, setPracticeGatewayVersion, removePracticeGatewayVersion } from '../lib/db'
  import type { Practice } from '../lib/types'

  let practices: Practice[] = []
  let selectedPractice: Practice | null = null
  let logValue: number = 0
  let showLogModal = false
  let showGatewaySetup = false
  let gatewayName = ''
  let gatewayTarget = 0
  let gatewayUnit = ''

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

  async function handleGatewayCompletion(practice: Practice) {
    if (!practice.gatewayVersion) return

    await logPracticeGateway(practice.id, 'gateway')
    await loadPractices()
  }

  async function handleFullCompletion(practice: Practice) {
    await logPracticeGateway(practice.id, 'full')
    await loadPractices()
  }

  function openGatewaySetup(practice: Practice) {
    selectedPractice = practice
    if (practice.gatewayVersion) {
      gatewayName = practice.gatewayVersion.name
      gatewayTarget = practice.gatewayVersion.target
      gatewayUnit = practice.gatewayVersion.unit
    } else {
      // Suggest gateway version based on practice
      gatewayName = practice.name.toLowerCase().includes('meditate') ? 'Sit and breathe'
        : practice.name.toLowerCase().includes('gym') || practice.name.toLowerCase().includes('workout') ? 'Put on workout clothes'
        : practice.name.toLowerCase().includes('journal') ? 'Write one sentence'
        : practice.name.toLowerCase().includes('read') ? 'Read one page'
        : `${practice.name} (2-min version)`
      gatewayTarget = Math.max(1, Math.floor(practice.target * 0.1)) // 10% of target
      gatewayUnit = practice.unit
    }
    showGatewaySetup = true
  }

  async function handleSaveGateway() {
    if (!selectedPractice || !gatewayName.trim()) return

    await setPracticeGatewayVersion(
      selectedPractice.id,
      gatewayName.trim(),
      gatewayTarget,
      gatewayUnit
    )
    await loadPractices()

    showGatewaySetup = false
    selectedPractice = null
    gatewayName = ''
    gatewayTarget = 0
    gatewayUnit = ''
  }

  async function handleRemoveGateway(practiceId: string) {
    await removePracticeGatewayVersion(practiceId)
    await loadPractices()
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
                <div class="flex gap-2">
                  {#if practice.gatewayVersion && !practice.todayCompleted}
                    <button
                      class="px-3 py-2 rounded-lg font-medium transition-colors bg-amber-600 hover:bg-amber-500 text-white text-sm"
                      on:click={() => handleGatewayCompletion(practice)}
                      title="Complete 2-minute gateway version"
                    >
                      ⚡ 2-Min
                    </button>
                  {/if}
                  <button
                    class="px-4 py-2 rounded-lg font-medium transition-colors {practice.todayCompleted ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-blue-600 hover:bg-blue-500 text-white'}"
                    on:click={() => practice.todayCompleted ? openLogModal(practice) : handleFullCompletion(practice)}
                  >
                    {practice.todayCompleted ? '✓ Logged' : 'Complete'}
                  </button>
                </div>
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

              <!-- Gateway Version Info -->
              {#if practice.gatewayVersion}
                <div class="mb-3 p-2 bg-amber-900/20 border border-amber-700/30 rounded text-xs">
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-amber-400 font-medium">⚡ 2-Min Version:</span>
                      <span class="text-slate-300 ml-1">{practice.gatewayVersion.name}</span>
                    </div>
                    <button
                      on:click={() => openGatewaySetup(practice)}
                      class="text-amber-400 hover:text-amber-300"
                      title="Edit gateway version"
                    >
                      ✏️
                    </button>
                  </div>
                  {#if practice.gatewayCount || practice.fullCount}
                    <div class="text-slate-400 mt-1">
                      {practice.gatewayCount || 0} gateway · {practice.fullCount || 0} full
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="mb-3">
                  <button
                    on:click={() => openGatewaySetup(practice)}
                    class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>⚡</span>
                    <span>Add 2-minute gateway version</span>
                  </button>
                </div>
              {/if}

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

<!-- Gateway Setup Modal -->
{#if showGatewaySetup && selectedPractice}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showGatewaySetup = false}>
    <div class="bg-slate-800 border-2 border-amber-600 rounded-lg p-6 max-w-lg w-full" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-2">⚡ 2-Minute Gateway Version</h3>
      <p class="text-sm text-slate-400 mb-4">
        Create a simplified version that takes 2 minutes or less. This still counts for your streak on tough days!
      </p>

      <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3 mb-4 text-sm">
        <div class="font-medium text-blue-300 mb-1">💡 Examples:</div>
        <ul class="text-slate-300 space-y-1">
          <li>• "Meditate 20 min" → "Sit and breathe for 2 min"</li>
          <li>• "Go to gym" → "Put on workout clothes"</li>
          <li>• "Journal 3 pages" → "Write one sentence"</li>
          <li>• "Read 30 pages" → "Read one page"</li>
        </ul>
      </div>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Gateway Version Name</label>
          <input
            type="text"
            bind:value={gatewayName}
            placeholder="e.g., 'Put on running shoes'"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            autofocus
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">Target</label>
            <input
              type="number"
              bind:value={gatewayTarget}
              min="0"
              step="0.5"
              class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Unit</label>
            <input
              type="text"
              bind:value={gatewayUnit}
              placeholder="e.g., minutes"
              class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div class="bg-slate-900 rounded p-3 text-sm">
          <div class="text-slate-400 mb-1">Full Practice:</div>
          <div class="font-medium">{selectedPractice.name} ({selectedPractice.target} {selectedPractice.unit})</div>
          <div class="text-slate-400 mt-2 mb-1">Gateway Version:</div>
          <div class="font-medium text-amber-400">{gatewayName || '...'} ({gatewayTarget} {gatewayUnit || '...'})</div>
        </div>
      </div>

      <div class="flex gap-3">
        {#if selectedPractice.gatewayVersion}
          <button
            class="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg font-medium transition-colors border border-red-700"
            on:click={() => {
              handleRemoveGateway(selectedPractice.id)
              showGatewaySetup = false
            }}
          >
            Remove Gateway
          </button>
        {/if}
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => showGatewaySetup = false}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
          on:click={handleSaveGateway}
          disabled={!gatewayName.trim()}
        >
          Save Gateway
        </button>
      </div>
    </div>
  </div>
{/if}
