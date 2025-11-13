<script lang="ts">
  import { onMount } from 'svelte'
  import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../lib/db'
  import { getUserState, addXP } from '../lib/db/userState'
  import { checkAndUnlockAchievements } from '../lib/db/achievements'
  import { celebrateTaskComplete, showFloatingXP, hapticSuccess } from '../lib/animations'
  import { soundSystem } from '../lib/sounds'
  import type { Task, Achievement } from '../lib/types'
  import LevelUpModal from './LevelUpModal.svelte'
  import AchievementNotification from './AchievementNotification.svelte'

  let tasks: Task[] = []
  let showAddForm = false
  let editingTask: Task | null = null
  let showLevelUp = false
  let newLevel = 1
  let newAchievement: Achievement | null = null

  // Form fields
  let title = ''
  let description = ''
  let leverageScore: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 = 5
  let isMorningTask = false
  let outcomeId = 'none'

  onMount(async () => {
    await loadTasks()
  })

  async function loadTasks() {
    tasks = await getTasks()
    tasks.sort((a, b) => {
      if (b.leverageScore !== a.leverageScore) {
        return b.leverageScore - a.leverageScore
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  async function handleAddTask() {
    if (!title.trim()) return

    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      leverageScore,
      outcomeId,
      isMorningTask
    })

    resetForm()
    await loadTasks()
  }

  async function handleUpdateTask() {
    if (!editingTask || !title.trim()) return

    await updateTask(editingTask.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      leverageScore,
      isMorningTask
    })

    resetForm()
    await loadTasks()
  }

  async function handleDeleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id)
      await loadTasks()
    }
  }

  async function handleCompleteTask(task: Task, event: MouseEvent) {
    const xp = task.leverageScore * 10
    const oldState = await getUserState()
    const oldLevel = oldState?.level || 1

    // Complete task and add XP
    await completeTask(task.id, xp)
    const newState = await addXP(xp)

    // Animations and sounds
    celebrateTaskComplete(task.leverageScore)
    soundSystem.taskComplete(task.leverageScore)
    hapticSuccess()

    // Show floating XP
    if (event.target instanceof HTMLElement) {
      showFloatingXP(event.target, xp)
    }

    // Check for level up
    if (newState && newState.level > oldLevel) {
      newLevel = newState.level
      showLevelUp = true
    }

    // Check for new achievements
    const achievements = await checkAndUnlockAchievements()
    if (achievements.length > 0) {
      newAchievement = achievements[0] // Show first achievement
    }

    await loadTasks()
  }

  function startEdit(task: Task) {
    editingTask = task
    title = task.title
    description = task.description || ''
    leverageScore = task.leverageScore
    isMorningTask = task.isMorningTask
    showAddForm = true
  }

  function resetForm() {
    showAddForm = false
    editingTask = null
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

  $: activeTasks = tasks.filter(t => !t.completed)
  $: completedTasks = tasks.filter(t => t.completed)
</script>

<div class="max-w-4xl mx-auto">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold">Tasks</h2>
      <p class="text-slate-400 text-sm mt-1">
        {activeTasks.length} active · {completedTasks.length} completed
      </p>
    </div>
    <button
      on:click={() => showAddForm = !showAddForm}
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
    >
      {showAddForm ? 'Cancel' : '+ New Task'}
    </button>
  </div>

  <!-- Add/Edit Form -->
  {#if showAddForm}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
      <h3 class="font-semibold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            bind:value={title}
            placeholder="What needs to be done?"
            class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            bind:value={description}
            placeholder="Add more details..."
            rows="3"
            class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                bind:checked={isMorningTask}
                class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span class="text-sm font-medium">Morning Task (1st 90min)</span>
            </label>
            <p class="text-xs text-slate-500 mt-2">
              Complete in first 90 minutes for bonus XP
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            on:click={editingTask ? handleUpdateTask : handleAddTask}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </button>
          <button
            on:click={resetForm}
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Active Tasks -->
  {#if activeTasks.length > 0}
    <div class="space-y-3 mb-6">
      {#each activeTasks as task (task.id)}
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
          <div class="flex items-start gap-3">
            <button
              on:click={(e) => handleCompleteTask(task, e)}
              class="mt-1 w-5 h-5 border-2 border-slate-600 rounded hover:border-green-500 transition-colors flex-shrink-0"
              title="Complete task"
            />

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-medium">{task.title}</h3>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="{getLeverageColor(task.leverageScore)} font-bold text-sm">
                    L{task.leverageScore}
                  </span>
                  {#if task.isMorningTask}
                    <span class="text-amber-400 text-xs" title="Morning task">☀️</span>
                  {/if}
                </div>
              </div>

              {#if task.description}
                <p class="text-sm text-slate-400 mt-1">{task.description}</p>
              {/if}

              <div class="flex gap-2 mt-3">
                <button
                  on:click={() => startEdit(task)}
                  class="text-xs text-blue-400 hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  on:click={() => handleDeleteTask(task.id)}
                  class="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center py-12 text-slate-500">
      <p class="text-lg">No active tasks</p>
      <p class="text-sm mt-2">Click "New Task" to add your first high-leverage task</p>
    </div>
  {/if}

  <!-- Completed Tasks -->
  {#if completedTasks.length > 0}
    <details class="mt-6">
      <summary class="cursor-pointer text-sm font-medium text-slate-400 hover:text-slate-300">
        Completed Tasks ({completedTasks.length})
      </summary>
      <div class="space-y-2 mt-3">
        {#each completedTasks as task (task.id)}
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 opacity-60">
            <div class="flex items-start gap-3">
              <div class="mt-1 w-5 h-5 bg-green-600 rounded flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xs">✓</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-medium line-through">{task.title}</h3>
                  <span class="text-slate-500 text-xs flex-shrink-0">
                    +{task.xpEarned || 0} XP
                  </span>
                </div>
                {#if task.completedAt}
                  <p class="text-xs text-slate-500 mt-1">
                    Completed {new Date(task.completedAt).toLocaleDateString()}
                  </p>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </details>
  {/if}
</div>

<!-- Modals -->
<LevelUpModal bind:visible={showLevelUp} level={newLevel} onClose={() => showLevelUp = false} />
<AchievementNotification achievement={newAchievement} onClose={() => newAchievement = null} />
