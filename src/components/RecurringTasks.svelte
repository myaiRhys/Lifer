<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getRecurringTaskTemplates,
    createRecurringTaskTemplate,
    updateRecurringTaskTemplate,
    deleteRecurringTaskTemplate,
    spawnTodaysRecurringTasks
  } from '../lib/db'
  import type { RecurringTaskTemplate } from '../lib/types'

  let templates: RecurringTaskTemplate[] = []
  let showAddForm = false
  let editingTemplate: RecurringTaskTemplate | null = null

  // Form fields
  let title = ''
  let description = ''
  let leverageScore: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 5
  let isMorningTask = false
  let outcomeId = 'none'

  onMount(async () => {
    await loadTemplates()
  })

  async function loadTemplates() {
    templates = await getRecurringTaskTemplates()
  }

  async function handleAddTemplate() {
    if (!title.trim()) return

    await createRecurringTaskTemplate({
      title: title.trim(),
      description: description.trim() || undefined,
      leverageScore,
      outcomeId,
      isMorningTask
    })

    // Spawn today's instance
    await spawnTodaysRecurringTasks()

    resetForm()
    await loadTemplates()
  }

  async function handleUpdateTemplate() {
    if (!editingTemplate || !title.trim()) return

    await updateRecurringTaskTemplate(editingTemplate.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      leverageScore,
      isMorningTask
    })

    // Respawn today's tasks with updated info
    await spawnTodaysRecurringTasks()

    resetForm()
    await loadTemplates()
  }

  async function handleToggleActive(template: RecurringTaskTemplate) {
    await updateRecurringTaskTemplate(template.id, {
      active: !template.active
    })
    await loadTemplates()
  }

  async function handleDeleteTemplate(id: string) {
    if (confirm('Are you sure? This will delete the recurring task template but not completed instances.')) {
      await deleteRecurringTaskTemplate(id)
      await loadTemplates()
    }
  }

  function startEdit(template: RecurringTaskTemplate) {
    editingTemplate = template
    title = template.title
    description = template.description || ''
    leverageScore = template.leverageScore
    isMorningTask = template.isMorningTask
    showAddForm = true
  }

  function resetForm() {
    showAddForm = false
    editingTemplate = null
    title = ''
    description = ''
    leverageScore = 5
    isMorningTask = false
  }

  function getLeverageColor(score: number): string {
    if (score >= 8) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    return 'text-orange-400'
  }

  $: activeTemplates = templates.filter(t => t.active)
  $: inactiveTemplates = templates.filter(t => !t.active)
</script>

<div class="max-w-4xl mx-auto">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold">🔄 Recurring Tasks</h2>
      <p class="text-slate-400 text-sm mt-1">
        Manage tasks that auto-create every day
      </p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
    >
      {showAddForm ? 'Cancel' : '+ Add Recurring Task'}
    </button>
  </div>

  <!-- Add/Edit Form -->
  {#if showAddForm}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-medium mb-4">
        {editingTemplate ? 'Edit' : 'Create'} Recurring Task
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            bind:value={title}
            placeholder="e.g., Drink 2L water"
            class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            bind:value={description}
            placeholder="Additional details..."
            rows="2"
            class="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              Leverage Score: <span class={getLeverageColor(leverageScore)}>{leverageScore}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              bind:value={leverageScore}
              class="w-full"
            />
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer mt-6">
              <input
                type="checkbox"
                bind:checked={isMorningTask}
                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm font-medium">Morning Task</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            on:click={editingTemplate ? handleUpdateTemplate : handleAddTemplate}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </button>
          <button
            on:click={resetForm}
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>

        <p class="text-xs text-slate-500 mt-2">
          💡 This will create a fresh task every day automatically
        </p>
      </div>
    </div>
  {/if}

  <!-- Info Box -->
  {#if templates.length === 0}
    <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-6">
      <h3 class="font-bold mb-2 flex items-center gap-2">
        <span class="text-2xl">🔄</span>
        What are Recurring Tasks?
      </h3>
      <p class="text-sm text-slate-300 mb-3">
        Recurring tasks automatically create fresh instances every day. Perfect for daily habits like:
      </p>
      <ul class="text-sm text-slate-300 space-y-1 ml-4">
        <li>• Drink 2L of water</li>
        <li>• Take medications</li>
        <li>• 30 minutes of exercise</li>
        <li>• Morning meditation</li>
        <li>• Review daily goals</li>
      </ul>
      <p class="text-xs text-slate-400 mt-3">
        Click "+ Add Recurring Task" above to create your first one!
      </p>
    </div>
  {/if}

  <!-- Active Templates -->
  {#if activeTemplates.length > 0}
    <div class="mb-6">
      <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
        <span class="text-green-400">✓</span> Active Recurring Tasks ({activeTemplates.length})
      </h3>
      <div class="space-y-2">
        {#each activeTemplates as template (template.id)}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium">{template.title}</h3>
                  <span class="{getLeverageColor(template.leverageScore)} font-bold text-sm">
                    L{template.leverageScore}
                  </span>
                  {#if template.isMorningTask}
                    <span class="text-amber-400 text-xs" title="Morning task">☀️</span>
                  {/if}
                  <span class="text-blue-400 text-xs" title="Active recurring">🔄</span>
                </div>

                {#if template.description}
                  <p class="text-sm text-slate-400">{template.description}</p>
                {/if}

                <p class="text-xs text-slate-500 mt-2">
                  Creates daily • {template.leverageScore * 10} XP per completion
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <button
                  on:click={() => handleToggleActive(template)}
                  class="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm transition-colors"
                  title="Pause this recurring task"
                >
                  Pause
                </button>
                <button
                  on:click={() => startEdit(template)}
                  class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  on:click={() => handleDeleteTemplate(template.id)}
                  class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
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

  <!-- Inactive Templates -->
  {#if inactiveTemplates.length > 0}
    <div>
      <h3 class="text-lg font-medium mb-3 flex items-center gap-2">
        <span class="text-slate-500">⏸</span> Paused Recurring Tasks ({inactiveTemplates.length})
      </h3>
      <div class="space-y-2">
        {#each inactiveTemplates as template (template.id)}
          <div class="bg-slate-800/50 border border-slate-700 rounded-lg p-4 opacity-60">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium">{template.title}</h3>
                  <span class="text-slate-500 font-bold text-sm">
                    L{template.leverageScore}
                  </span>
                </div>

                {#if template.description}
                  <p class="text-sm text-slate-500">{template.description}</p>
                {/if}

                <p class="text-xs text-slate-600 mt-2">
                  Paused • Won't create daily tasks
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <button
                  on:click={() => handleToggleActive(template)}
                  class="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
                  title="Resume this recurring task"
                >
                  Resume
                </button>
                <button
                  on:click={() => handleDeleteTemplate(template.id)}
                  class="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
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
</div>
