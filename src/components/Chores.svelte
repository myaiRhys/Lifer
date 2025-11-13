<script lang="ts">
  import { onMount } from 'svelte'
  import { getChores, createChore, updateChore, deleteChore, completeChore, uncompleteChore } from '../lib/db'
  import type { Chore } from '../lib/types'

  let chores: Chore[] = []
  let showAddForm = false
  let editingChore: Chore | null = null

  // Form fields
  let title = ''
  let description = ''
  let category = ''
  let xpReward = 15
  let recurring = false
  let frequency: 'daily' | 'weekly' | 'monthly' | 'custom' = 'daily'
  let customDays: number[] = []

  onMount(async () => {
    await loadChores()
  })

  async function loadChores() {
    chores = await getChores()
  }

  function resetForm() {
    title = ''
    description = ''
    category = ''
    xpReward = 15
    recurring = false
    frequency = 'daily'
    customDays = []
    editingChore = null
  }

  async function handleSubmit() {
    if (!title.trim()) return

    if (editingChore) {
      await updateChore(editingChore.id, {
        title,
        description: description || undefined,
        category: category || undefined,
        xpReward,
        recurring,
        frequency: recurring ? frequency : undefined,
        customDays: frequency === 'custom' ? customDays : undefined
      })
    } else {
      await createChore({
        title,
        description: description || undefined,
        category: category || undefined,
        xpReward,
        recurring,
        frequency: recurring ? frequency : undefined,
        customDays: frequency === 'custom' ? customDays : undefined
      })
    }

    await loadChores()
    showAddForm = false
    resetForm()
  }

  function startEdit(chore: Chore) {
    editingChore = chore
    title = chore.title
    description = chore.description || ''
    category = chore.category || ''
    xpReward = chore.xpReward
    recurring = chore.recurring
    frequency = chore.frequency || 'daily'
    customDays = chore.customDays || []
    showAddForm = true
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this chore?')) return
    await deleteChore(id)
    await loadChores()
  }

  async function handleToggleComplete(chore: Chore) {
    if (chore.completed) {
      await uncompleteChore(chore.id)
    } else {
      await completeChore(chore.id)
    }
    await loadChores()
  }

  function toggleDaySelection(day: number) {
    if (customDays.includes(day)) {
      customDays = customDays.filter(d => d !== day)
    } else {
      customDays = [...customDays, day]
    }
  }

  function getCategoryEmoji(category?: string): string {
    const map: Record<string, string> = {
      'kitchen': '🍽️',
      'bedroom': '🛏️',
      'bathroom': '🚿',
      'laundry': '🧺',
      'errands': '🛒',
      'cleaning': '🧹',
      'outdoor': '🌳',
      'car': '🚗',
      'pets': '🐕',
      'maintenance': '🔧'
    }
    return category ? map[category.toLowerCase()] || '📋' : '📋'
  }

  $: oneTimeChores = chores.filter(c => !c.recurring)
  $: recurringChores = chores.filter(c => c.recurring)
  $: completedOneTime = oneTimeChores.filter(c => c.completed).length
</script>

<div class="max-w-4xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold">🏠 Chores</h2>
    <button
      class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
      on:click={() => {
        showAddForm = !showAddForm
        if (!showAddForm) resetForm()
      }}
    >
      {showAddForm ? '✕ Cancel' : '+ Add Chore'}
    </button>
  </div>

  <!-- Add/Edit Form -->
  {#if showAddForm}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-semibold mb-4">{editingChore ? 'Edit Chore' : 'New Chore'}</h3>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              bind:value={title}
              placeholder="e.g., Wash dishes"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Description (optional)</label>
            <textarea
              bind:value={description}
              placeholder="Any details..."
              rows="2"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Category (optional)</label>
              <select
                bind:value={category}
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                <option value="kitchen">🍽️ Kitchen</option>
                <option value="bedroom">🛏️ Bedroom</option>
                <option value="bathroom">🚿 Bathroom</option>
                <option value="laundry">🧺 Laundry</option>
                <option value="errands">🛒 Errands</option>
                <option value="cleaning">🧹 Cleaning</option>
                <option value="outdoor">🌳 Outdoor</option>
                <option value="car">🚗 Car</option>
                <option value="pets">🐕 Pets</option>
                <option value="maintenance">🔧 Maintenance</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">XP Reward</label>
              <input
                type="number"
                bind:value={xpReward}
                min="5"
                max="50"
                class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                bind:checked={recurring}
                class="w-5 h-5"
              />
              <span class="text-sm font-medium">Recurring chore</span>
            </label>
          </div>

          {#if recurring}
            <div>
              <label class="block text-sm font-medium mb-2">Frequency</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border transition-colors {frequency === 'daily' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
                  on:click={() => frequency = 'daily'}
                >
                  Daily
                </button>
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border transition-colors {frequency === 'weekly' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
                  on:click={() => frequency = 'weekly'}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border transition-colors {frequency === 'monthly' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
                  on:click={() => frequency = 'monthly'}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  class="px-3 py-2 rounded-lg border transition-colors {frequency === 'custom' ? 'bg-slate-700 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
                  on:click={() => frequency = 'custom'}
                >
                  Custom
                </button>
              </div>
            </div>

            {#if frequency === 'custom'}
              <div>
                <label class="block text-sm font-medium mb-2">Select Days</label>
                <div class="grid grid-cols-7 gap-2">
                  {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day, i}
                    <button
                      type="button"
                      class="px-2 py-2 rounded-lg border text-sm transition-colors {customDays.includes(i) ? 'bg-blue-600 border-blue-500' : 'border-slate-600 hover:border-slate-500'}"
                      on:click={() => toggleDaySelection(i)}
                    >
                      {day}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/if}

          <button
            type="submit"
            class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          >
            {editingChore ? 'Update Chore' : 'Create Chore'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Stats Summary -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">One-Time</div>
      <div class="text-2xl font-bold text-blue-400">{oneTimeChores.length}</div>
      <div class="text-xs text-slate-500">{completedOneTime} completed</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Recurring</div>
      <div class="text-2xl font-bold text-purple-400">{recurringChores.length}</div>
      <div class="text-xs text-slate-500">Active routines</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total</div>
      <div class="text-2xl font-bold text-green-400">{chores.length}</div>
      <div class="text-xs text-slate-500">All chores</div>
    </div>
  </div>

  <!-- Recurring Chores -->
  {#if recurringChores.length > 0}
    <div class="mb-6">
      <h3 class="text-xl font-semibold mb-4">🔄 Recurring Chores</h3>
      <div class="space-y-2">
        {#each recurringChores as chore (chore.id)}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3 flex-1">
                <button
                  class="text-2xl mt-1"
                  on:click={() => handleToggleComplete(chore)}
                  title="Complete chore"
                >
                  {chore.completed ? '✅' : '⬜'}
                </button>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{getCategoryEmoji(chore.category)}</span>
                    <span class="font-medium">{chore.title}</span>
                    <span class="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded">
                      {chore.frequency}
                    </span>
                    <span class="text-xs text-slate-500">+{chore.xpReward} XP</span>
                  </div>
                  {#if chore.description}
                    <p class="text-sm text-slate-400 mt-1">{chore.description}</p>
                  {/if}
                  {#if chore.lastReset}
                    <p class="text-xs text-slate-500 mt-1">
                      Last completed: {new Date(chore.lastReset).toLocaleDateString()}
                    </p>
                  {/if}
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                  on:click={() => startEdit(chore)}
                >
                  Edit
                </button>
                <button
                  class="px-3 py-1 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                  on:click={() => handleDelete(chore.id)}
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

  <!-- One-Time Chores -->
  {#if oneTimeChores.length > 0}
    <div>
      <h3 class="text-xl font-semibold mb-4">📋 One-Time Chores</h3>
      <div class="space-y-2">
        {#each oneTimeChores as chore (chore.id)}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors {chore.completed ? 'opacity-60' : ''}">
            <div class="flex items-start justify-between">
              <div class="flex items-start gap-3 flex-1">
                <button
                  class="text-2xl mt-1"
                  on:click={() => handleToggleComplete(chore)}
                  title="Complete chore"
                >
                  {chore.completed ? '✅' : '⬜'}
                </button>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{getCategoryEmoji(chore.category)}</span>
                    <span class="font-medium {chore.completed ? 'line-through' : ''}">{chore.title}</span>
                    <span class="text-xs text-slate-500">+{chore.xpReward} XP</span>
                  </div>
                  {#if chore.description}
                    <p class="text-sm text-slate-400 mt-1">{chore.description}</p>
                  {/if}
                  {#if chore.completedAt}
                    <p class="text-xs text-green-400 mt-1">
                      ✓ Completed {new Date(chore.completedAt).toLocaleDateString()}
                    </p>
                  {/if}
                </div>
              </div>
              <div class="flex gap-2">
                {#if !chore.completed}
                  <button
                    class="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                    on:click={() => startEdit(chore)}
                  >
                    Edit
                  </button>
                {/if}
                <button
                  class="px-3 py-1 text-sm bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                  on:click={() => handleDelete(chore.id)}
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

  {#if chores.length === 0}
    <div class="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
      <p class="text-lg text-slate-400 mb-4">No chores yet</p>
      <p class="text-sm text-slate-500">Click "Add Chore" to create your first chore</p>
    </div>
  {/if}
</div>
