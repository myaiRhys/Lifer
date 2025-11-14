<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getHabitStacks,
    getPractices,
    getPracticeById,
    createHabitStack,
    updateHabitStack,
    deleteHabitStack,
    getTodayStackProgress,
    getHabitStackAnalytics,
    getSuggestedStacks,
    logHabitStackCompletion,
    isStackCompletedToday
  } from '../lib/db'
  import type { HabitStack, Practice, HabitStackLink } from '../lib/types'

  let stacks: HabitStack[] = []
  let practices: Practice[] = []
  let showCreateModal = false
  let showEditModal = false
  let selectedStack: HabitStack | null = null
  let stackProgress: Map<string, { completedLinks: string[]; totalLinks: number; progressPercentage: number }> = new Map()
  let stackAnalytics: Map<string, any> = new Map()

  // Form state
  let stackName = ''
  let stackDescription = ''
  let selectedPractices: string[] = []
  let transitionTimes: number[] = []

  // Suggested stacks
  let suggestions: Array<{ name: string; description: string; chain: HabitStackLink[] }> = []

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    stacks = await getHabitStacks()
    practices = await getPractices()
    suggestions = await getSuggestedStacks()

    // Load progress for each stack
    for (const stack of stacks) {
      const progress = await getTodayStackProgress(stack.id)
      stackProgress.set(stack.id, progress)

      const analytics = await getHabitStackAnalytics(stack.id)
      stackAnalytics.set(stack.id, analytics)
    }
    stackProgress = stackProgress
    stackAnalytics = stackAnalytics
  }

  function openCreateModal() {
    resetForm()
    showCreateModal = true
  }

  function openEditModal(stack: HabitStack) {
    selectedStack = stack
    stackName = stack.name
    stackDescription = stack.description || ''
    selectedPractices = stack.chain.map(link => link.practiceId)
    transitionTimes = stack.chain.map(link => link.transitionTime || 0)
    showEditModal = true
  }

  function resetForm() {
    stackName = ''
    stackDescription = ''
    selectedPractices = []
    transitionTimes = []
    selectedStack = null
  }

  async function handleCreateStack() {
    if (!stackName.trim() || selectedPractices.length < 2) return

    const chain: HabitStackLink[] = selectedPractices.map((practiceId, index) => ({
      practiceId,
      order: index + 1,
      transitionTime: transitionTimes[index] || 60
    }))

    await createHabitStack(stackName.trim(), stackDescription.trim() || undefined, chain)
    await loadData()

    showCreateModal = false
    resetForm()
  }

  async function handleUpdateStack() {
    if (!selectedStack || !stackName.trim() || selectedPractices.length < 2) return

    const chain: HabitStackLink[] = selectedPractices.map((practiceId, index) => ({
      practiceId,
      order: index + 1,
      transitionTime: transitionTimes[index] || 60
    }))

    await updateHabitStack(selectedStack.id, {
      name: stackName.trim(),
      description: stackDescription.trim() || undefined,
      chain
    })
    await loadData()

    showEditModal = false
    resetForm()
  }

  async function handleDeleteStack(stackId: string) {
    if (!confirm('Are you sure you want to delete this habit stack?')) return

    await deleteHabitStack(stackId)
    await loadData()
  }

  async function handleToggleActive(stackId: string, currentlyActive: boolean) {
    await updateHabitStack(stackId, { isActive: !currentlyActive })
    await loadData()
  }

  function addPracticeToStack(practiceId: string) {
    if (!selectedPractices.includes(practiceId)) {
      selectedPractices = [...selectedPractices, practiceId]
      transitionTimes = [...transitionTimes, 60]
    }
  }

  function removePracticeFromStack(index: number) {
    selectedPractices = selectedPractices.filter((_, i) => i !== index)
    transitionTimes = transitionTimes.filter((_, i) => i !== index)
  }

  function movePracticeUp(index: number) {
    if (index === 0) return
    const newPractices = [...selectedPractices]
    const newTransitions = [...transitionTimes]

    ;[newPractices[index - 1], newPractices[index]] = [newPractices[index], newPractices[index - 1]]
    ;[newTransitions[index - 1], newTransitions[index]] = [newTransitions[index], newTransitions[index - 1]]

    selectedPractices = newPractices
    transitionTimes = newTransitions
  }

  function movePracticeDown(index: number) {
    if (index === selectedPractices.length - 1) return
    const newPractices = [...selectedPractices]
    const newTransitions = [...transitionTimes]

    ;[newPractices[index], newPractices[index + 1]] = [newPractices[index + 1], newPractices[index]]
    ;[newTransitions[index], newTransitions[index + 1]] = [newTransitions[index + 1], newTransitions[index]]

    selectedPractices = newPractices
    transitionTimes = newTransitions
  }

  async function useSuggestedStack(suggestion: { name: string; description: string; chain: HabitStackLink[] }) {
    stackName = suggestion.name
    stackDescription = suggestion.description
    selectedPractices = suggestion.chain.map(link => link.practiceId)
    transitionTimes = suggestion.chain.map(link => link.transitionTime || 60)
    showCreateModal = true
  }

  function formatTransitionTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return minutes === 1 ? '1 min' : `${minutes} mins`
  }

  $: availablePractices = practices.filter(p => !selectedPractices.includes(p.id))
  $: activeStacks = stacks.filter(s => s.isActive)
  $: inactiveStacks = stacks.filter(s => !s.isActive)
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-2">🔗 Habit Stacking</h2>
    <p class="text-slate-400">
      Chain habits together to build automatic routines. Complete one, trigger the next.
    </p>
  </div>

  <!-- Header Actions -->
  <div class="flex items-center justify-between mb-6">
    <div class="text-sm text-slate-400">
      {activeStacks.length} active stack{activeStacks.length !== 1 ? 's' : ''}
    </div>
    <button
      on:click={openCreateModal}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
    >
      + Create Stack
    </button>
  </div>

  <!-- Suggested Stacks -->
  {#if suggestions.length > 0 && stacks.length === 0}
    <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-3">💡 Suggested Stacks</h3>
      <p class="text-sm text-slate-300 mb-4">
        Based on your practices, we've prepared some habit stacks to get you started:
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each suggestions as suggestion}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{suggestion.name}</h4>
            <p class="text-sm text-slate-400 mb-3">{suggestion.description}</p>
            <div class="text-xs text-slate-500 mb-3">
              {suggestion.chain.length} habits in this stack
            </div>
            <button
              on:click={() => useSuggestedStack(suggestion)}
              class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
            >
              Use This Stack
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Active Stacks -->
  {#if activeStacks.length > 0}
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4">Active Stacks</h3>
      <div class="space-y-4">
        {#each activeStacks as stack}
          {@const progress = stackProgress.get(stack.id) || { completedLinks: [], totalLinks: 0, progressPercentage: 0 }}
          {@const analytics = stackAnalytics.get(stack.id) || { currentStreak: 0, completionRate: 0 }}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h4 class="font-semibold text-lg mb-1">{stack.name}</h4>
                {#if stack.description}
                  <p class="text-sm text-slate-400 mb-2">{stack.description}</p>
                {/if}
                <div class="flex items-center gap-4 text-sm">
                  <span class="text-slate-400">
                    {stack.chain.length} habits
                  </span>
                  <span class="text-green-400 font-medium">
                    {analytics.currentStreak} day streak
                  </span>
                  <span class="text-blue-400">
                    {analytics.completionRate}% success rate
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  on:click={() => openEditModal(stack)}
                  class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  on:click={() => handleToggleActive(stack.id, stack.isActive)}
                  class="px-3 py-1.5 bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 rounded text-sm transition-colors"
                >
                  Pause
                </button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs text-slate-400 mb-1">
                <span>Today's Progress</span>
                <span>{progress.completedLinks.length}/{progress.totalLinks} ({progress.progressPercentage}%)</span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-2">
                <div
                  class="bg-blue-500 h-2 rounded-full transition-all"
                  style="width: {progress.progressPercentage}%"
                />
              </div>
            </div>

            <!-- Habit Chain Visualization -->
            <div class="flex flex-col gap-2">
              {#each stack.chain as link, index}
                {@const practice = practices.find(p => p.id === link.practiceId)}
                {#if practice}
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {progress.completedLinks.includes(practice.id) ? 'bg-green-600' : 'bg-slate-700'} font-bold text-sm">
                      {index + 1}
                    </div>
                    <div class="flex-1 bg-slate-900 rounded-lg p-3">
                      <div class="font-medium">{practice.name}</div>
                      {#if link.transitionTime && index < stack.chain.length - 1}
                        <div class="text-xs text-slate-500 mt-1">
                          ⏱️ {formatTransitionTime(link.transitionTime)} → next habit
                        </div>
                      {/if}
                    </div>
                    <div class="flex-shrink-0">
                      {#if progress.completedLinks.includes(practice.id)}
                        <span class="text-green-400 text-xl">✓</span>
                      {:else}
                        <span class="text-slate-600 text-xl">○</span>
                      {/if}
                    </div>
                  </div>
                  {#if index < stack.chain.length - 1}
                    <div class="flex justify-center">
                      <div class="text-slate-600 text-2xl">↓</div>
                    </div>
                  {/if}
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Inactive Stacks -->
  {#if inactiveStacks.length > 0}
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4 text-slate-500">Paused Stacks</h3>
      <div class="space-y-3">
        {#each inactiveStacks as stack}
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 opacity-60">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-semibold">{stack.name}</h4>
                <div class="text-sm text-slate-500">{stack.chain.length} habits</div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  on:click={() => handleToggleActive(stack.id, stack.isActive)}
                  class="px-3 py-1.5 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded text-sm transition-colors"
                >
                  Activate
                </button>
                <button
                  on:click={() => handleDeleteStack(stack.id)}
                  class="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Empty State -->
  {#if stacks.length === 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
      <div class="text-6xl mb-4">🔗</div>
      <h3 class="text-xl font-semibold mb-2">No Habit Stacks Yet</h3>
      <p class="text-slate-400 mb-6">
        Create your first habit stack to build automatic routines.
        Chain habits together and leverage the power of "After X, I do Y."
      </p>
      <button
        on:click={openCreateModal}
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
      >
        Create Your First Stack
      </button>
    </div>
  {/if}

  <!-- Philosophy Card -->
  <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6 mt-6">
    <h3 class="text-xl font-bold mb-3">📚 The Power of Habit Stacking</h3>
    <div class="space-y-3 text-sm text-slate-300">
      <p>
        <strong>James Clear's formula:</strong> "After [CURRENT HABIT], I will [NEW HABIT]."
      </p>
      <p>
        Habit stacking works because you're not starting from zero. You're building on the neural pathways
        you've already established. The cue for your new habit is the completion of your previous habit.
      </p>
      <div class="bg-slate-900/50 rounded p-3 mt-3">
        <div class="font-medium mb-2">Example Stacks:</div>
        <ul class="space-y-1 text-slate-400">
          <li>• After I pour my morning coffee → I meditate for 2 minutes</li>
          <li>• After I meditate → I journal for 5 minutes</li>
          <li>• After I journal → I review my top 3 priorities</li>
          <li>• After I change into workout clothes → I do 10 pushups</li>
        </ul>
      </div>
      <p class="text-xs text-slate-400 mt-3">
        <strong>Pro tip:</strong> Start small. Build a 2-3 habit chain first, then expand once it's automatic.
      </p>
    </div>
  </div>
</div>

<!-- Create Stack Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showCreateModal = false}>
    <div class="bg-slate-800 border-2 border-blue-600 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-4">Create Habit Stack</h3>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Stack Name</label>
          <input
            type="text"
            bind:value={stackName}
            placeholder="e.g., 'Morning Routine', 'Evening Wind-Down'"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            autofocus
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            bind:value={stackDescription}
            placeholder="What's the purpose of this stack?"
            rows="2"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Selected Practices (Chain) -->
        <div>
          <label class="block text-sm font-medium mb-2">Habit Chain (min 2 habits)</label>
          {#if selectedPractices.length > 0}
            <div class="space-y-2 mb-3">
              {#each selectedPractices as practiceId, index}
                {@const practice = practices.find(p => p.id === practiceId)}
                {#if practice}
                  <div class="bg-slate-900 rounded-lg p-3 flex items-center gap-3">
                    <div class="flex flex-col gap-1">
                      <button
                        on:click={() => movePracticeUp(index)}
                        class="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        disabled={index === 0}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        on:click={() => movePracticeDown(index)}
                        class="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        disabled={index === selectedPractices.length - 1}
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div class="flex-1">
                      <div class="font-medium">{practice.name}</div>
                      {#if index < selectedPractices.length - 1}
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-slate-500">Wait</span>
                          <input
                            type="number"
                            bind:value={transitionTimes[index]}
                            min="0"
                            step="15"
                            class="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                          />
                          <span class="text-xs text-slate-500">seconds before next</span>
                        </div>
                      {/if}
                    </div>
                    <button
                      on:click={() => removePracticeFromStack(index)}
                      class="text-red-400 hover:text-red-300 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  {#if index < selectedPractices.length - 1}
                    <div class="flex justify-center">
                      <div class="text-slate-600 text-xl">↓</div>
                    </div>
                  {/if}
                {/if}
              {/each}
            </div>
          {:else}
            <div class="bg-slate-900 rounded-lg p-6 text-center text-slate-500 mb-3">
              Add at least 2 habits to create a stack
            </div>
          {/if}
        </div>

        <!-- Available Practices -->
        <div>
          <label class="block text-sm font-medium mb-2">Add Habits to Stack</label>
          {#if availablePractices.length > 0}
            <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {#each availablePractices as practice}
                <button
                  on:click={() => addPracticeToStack(practice.id)}
                  class="text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-600 rounded transition-colors text-sm"
                >
                  + {practice.name}
                </button>
              {/each}
            </div>
          {:else}
            <div class="text-sm text-slate-500">All practices added to stack</div>
          {/if}
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => {
            showCreateModal = false
            resetForm()
          }}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handleCreateStack}
          disabled={!stackName.trim() || selectedPractices.length < 2}
        >
          Create Stack
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Stack Modal -->
{#if showEditModal && selectedStack}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showEditModal = false}>
    <div class="bg-slate-800 border-2 border-blue-600 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-4">Edit Habit Stack</h3>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Stack Name</label>
          <input
            type="text"
            bind:value={stackName}
            placeholder="e.g., 'Morning Routine', 'Evening Wind-Down'"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Description (optional)</label>
          <textarea
            bind:value={stackDescription}
            placeholder="What's the purpose of this stack?"
            rows="2"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Selected Practices (Chain) -->
        <div>
          <label class="block text-sm font-medium mb-2">Habit Chain (min 2 habits)</label>
          {#if selectedPractices.length > 0}
            <div class="space-y-2 mb-3">
              {#each selectedPractices as practiceId, index}
                {@const practice = practices.find(p => p.id === practiceId)}
                {#if practice}
                  <div class="bg-slate-900 rounded-lg p-3 flex items-center gap-3">
                    <div class="flex flex-col gap-1">
                      <button
                        on:click={() => movePracticeUp(index)}
                        class="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        disabled={index === 0}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        on:click={() => movePracticeDown(index)}
                        class="text-slate-500 hover:text-slate-300 disabled:opacity-30"
                        disabled={index === selectedPractices.length - 1}
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div class="flex-1">
                      <div class="font-medium">{practice.name}</div>
                      {#if index < selectedPractices.length - 1}
                        <div class="flex items-center gap-2 mt-1">
                          <span class="text-xs text-slate-500">Wait</span>
                          <input
                            type="number"
                            bind:value={transitionTimes[index]}
                            min="0"
                            step="15"
                            class="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs"
                          />
                          <span class="text-xs text-slate-500">seconds before next</span>
                        </div>
                      {/if}
                    </div>
                    <button
                      on:click={() => removePracticeFromStack(index)}
                      class="text-red-400 hover:text-red-300 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  {#if index < selectedPractices.length - 1}
                    <div class="flex justify-center">
                      <div class="text-slate-600 text-xl">↓</div>
                    </div>
                  {/if}
                {/if}
              {/each}
            </div>
          {/if}
        </div>

        <!-- Available Practices -->
        <div>
          <label class="block text-sm font-medium mb-2">Add Habits to Stack</label>
          {#if availablePractices.length > 0}
            <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {#each availablePractices as practice}
                <button
                  on:click={() => addPracticeToStack(practice.id)}
                  class="text-left px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-600 rounded transition-colors text-sm"
                >
                  + {practice.name}
                </button>
              {/each}
            </div>
          {:else}
            <div class="text-sm text-slate-500">All practices added to stack</div>
          {/if}
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg font-medium transition-colors border border-red-700"
          on:click={() => {
            handleDeleteStack(selectedStack.id)
            showEditModal = false
          }}
        >
          Delete Stack
        </button>
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => {
            showEditModal = false
            resetForm()
          }}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handleUpdateStack}
          disabled={!stackName.trim() || selectedPractices.length < 2}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}
