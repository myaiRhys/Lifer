<script lang="ts">
  import { onMount } from 'svelte'
  import { getOutcomes, createOutcome, updateOutcome, deleteOutcome, archiveOutcome, completeOutcome } from '../lib/db'
  import type { Outcome } from '../lib/types'

  let outcomes: Outcome[] = []
  let showCreateModal = false
  let showEditModal = false
  let selectedOutcome: Outcome | null = null

  // Form state
  let formResult = ''
  let formPurpose = ''
  let formProgress = 0
  let formStatus: Outcome['status'] = 'active'

  onMount(async () => {
    await loadOutcomes()
  })

  async function loadOutcomes() {
    outcomes = await getOutcomes()
    // Sort: active first, then stalled, then completed/archived
    outcomes.sort((a, b) => {
      const statusOrder = { active: 1, stalled: 2, completed: 3, archived: 4 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
  }

  function openCreateModal() {
    formResult = ''
    formPurpose = ''
    formProgress = 0
    formStatus = 'active'
    showCreateModal = true
  }

  function openEditModal(outcome: Outcome) {
    selectedOutcome = outcome
    formResult = outcome.result
    formPurpose = outcome.purpose
    formProgress = outcome.progress
    formStatus = outcome.status
    showEditModal = true
  }

  async function handleCreate() {
    if (!formResult.trim() || !formPurpose.trim()) return

    await createOutcome({
      result: formResult,
      purpose: formPurpose,
      status: 'active',
      progress: 0
    })

    await loadOutcomes()
    showCreateModal = false
  }

  async function handleUpdate() {
    if (!selectedOutcome) return

    await updateOutcome(selectedOutcome.id, {
      result: formResult,
      purpose: formPurpose,
      progress: formProgress,
      status: formStatus
    })

    await loadOutcomes()
    showEditModal = false
    selectedOutcome = null
  }

  async function handleDelete(outcome: Outcome) {
    if (outcome.linkedTaskCount > 0) {
      if (!confirm(`This outcome has ${outcome.linkedTaskCount} linked tasks. Delete anyway?`)) {
        return
      }
    }

    if (confirm('Are you sure you want to delete this outcome?')) {
      await deleteOutcome(outcome.id)
      await loadOutcomes()
    }
  }

  async function handleComplete(outcome: Outcome) {
    await completeOutcome(outcome.id)
    await loadOutcomes()
  }

  async function handleArchive(outcome: Outcome) {
    await archiveOutcome(outcome.id)
    await loadOutcomes()
  }

  function getStatusColor(status: Outcome['status']): string {
    switch (status) {
      case 'active': return 'bg-blue-900/30 text-blue-400 border-blue-700'
      case 'stalled': return 'bg-orange-900/30 text-orange-400 border-orange-700'
      case 'completed': return 'bg-green-900/30 text-green-400 border-green-700'
      case 'archived': return 'bg-slate-700 text-slate-400 border-slate-600'
    }
  }

  function getStatusIcon(status: Outcome['status']): string {
    switch (status) {
      case 'active': return '🎯'
      case 'stalled': return '⚠️'
      case 'completed': return '✅'
      case 'archived': return '📦'
    }
  }

  $: activeOutcomes = outcomes.filter(o => o.status === 'active')
  $: stalledOutcomes = outcomes.filter(o => o.status === 'stalled')
  $: completedOutcomes = outcomes.filter(o => o.status === 'completed')
  $: archivedOutcomes = outcomes.filter(o => o.status === 'archived')
</script>

<div class="max-w-6xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-3xl font-bold">Outcomes</h2>
      <p class="text-slate-400 mt-1">Define your desired results and why they matter</p>
    </div>
    <button
      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
      on:click={openCreateModal}
    >
      + New Outcome
    </button>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Active</div>
      <div class="text-2xl font-bold text-blue-400">{activeOutcomes.length}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Stalled</div>
      <div class="text-2xl font-bold text-orange-400">{stalledOutcomes.length}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Completed</div>
      <div class="text-2xl font-bold text-green-400">{completedOutcomes.length}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total</div>
      <div class="text-2xl font-bold text-purple-400">{outcomes.length}</div>
    </div>
  </div>

  {#if outcomes.length === 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
      <div class="text-6xl mb-4">🎯</div>
      <h3 class="text-xl font-semibold mb-2">No Outcomes Yet</h3>
      <p class="text-slate-400 mb-6">
        Outcomes are the meaningful results you want to achieve.<br />
        Each task should be linked to an outcome to ensure you're working on what matters.
      </p>
      <button
        class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        on:click={openCreateModal}
      >
        Create Your First Outcome
      </button>
    </div>
  {:else}
    <!-- Active Outcomes -->
    {#if activeOutcomes.length > 0}
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">🎯 Active</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each activeOutcomes as outcome}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 rounded text-xs border {getStatusColor(outcome.status)}">
                      {getStatusIcon(outcome.status)} {outcome.status.toUpperCase()}
                    </span>
                    {#if outcome.linkedTaskCount > 0}
                      <span class="text-xs text-slate-400">
                        {outcome.linkedTaskCount} task{outcome.linkedTaskCount !== 1 ? 's' : ''}
                      </span>
                    {/if}
                  </div>
                  <h4 class="font-semibold text-lg mb-2">{outcome.result}</h4>
                  <p class="text-sm text-slate-400 mb-3">{outcome.purpose}</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{outcome.progress}%</span>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full transition-all"
                    style="width: {outcome.progress}%"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex gap-2">
                <button
                  class="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                  on:click={() => openEditModal(outcome)}
                >
                  Edit
                </button>
                <button
                  class="px-3 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded text-sm transition-colors"
                  on:click={() => handleComplete(outcome)}
                >
                  Complete
                </button>
                <button
                  class="px-3 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded text-sm transition-colors"
                  on:click={() => handleDelete(outcome)}
                >
                  Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Stalled Outcomes -->
    {#if stalledOutcomes.length > 0}
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4">⚠️ Stalled</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each stalledOutcomes as outcome}
            <div class="bg-slate-800 border border-orange-700 rounded-lg p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-1 rounded text-xs border {getStatusColor(outcome.status)}">
                      {getStatusIcon(outcome.status)} {outcome.status.toUpperCase()}
                    </span>
                    <span class="text-xs text-orange-400">
                      {outcome.stalledDays} days since update
                    </span>
                  </div>
                  <h4 class="font-semibold text-lg mb-2">{outcome.result}</h4>
                  <p class="text-sm text-slate-400 mb-3">{outcome.purpose}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  class="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                  on:click={() => openEditModal(outcome)}
                >
                  Reactivate
                </button>
                <button
                  class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                  on:click={() => handleArchive(outcome)}
                >
                  Archive
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Completed & Archived -->
    {#if completedOutcomes.length > 0 || archivedOutcomes.length > 0}
      <div>
        <h3 class="text-xl font-semibold mb-4">Completed & Archived</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each [...completedOutcomes, ...archivedOutcomes] as outcome}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 opacity-75">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 rounded text-xs border {getStatusColor(outcome.status)}">
                  {getStatusIcon(outcome.status)} {outcome.status.toUpperCase()}
                </span>
              </div>
              <h4 class="font-semibold mb-1">{outcome.result}</h4>
              <p class="text-xs text-slate-400 mb-3">{outcome.purpose}</p>
              {#if outcome.completedAt}
                <p class="text-xs text-slate-500">
                  Completed: {new Date(outcome.completedAt).toLocaleDateString()}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<!-- Create Modal -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showCreateModal = false}>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-4">Create New Outcome</h3>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Result (What do you want to achieve?)</label>
          <input
            type="text"
            bind:value={formResult}
            placeholder="e.g., Launch profitable SaaS product"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            autofocus
          />
          <p class="text-xs text-slate-400 mt-1">Be specific and measurable</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Purpose (Why does this matter?)</label>
          <textarea
            bind:value={formPurpose}
            placeholder="e.g., Achieve financial freedom and help entrepreneurs build better products"
            rows="3"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
          <p class="text-xs text-slate-400 mt-1">Connect to your deeper motivations</p>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => showCreateModal = false}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handleCreate}
          disabled={!formResult.trim() || !formPurpose.trim()}
        >
          Create Outcome
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && selectedOutcome}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showEditModal = false}>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full" on:click|stopPropagation>
      <h3 class="text-2xl font-bold mb-4">Edit Outcome</h3>

      <div class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium mb-2">Result</label>
          <input
            type="text"
            bind:value={formResult}
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Purpose</label>
          <textarea
            bind:value={formPurpose}
            rows="3"
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Progress: {formProgress}%</label>
          <input
            type="range"
            bind:value={formProgress}
            min="0"
            max="100"
            step="5"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select
            bind:value={formStatus}
            class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="stalled">Stalled</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => showEditModal = false}
        >
          Cancel
        </button>
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handleUpdate}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
{/if}
