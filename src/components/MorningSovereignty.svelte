<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    getCurrentMorningSession,
    startMorningSession,
    getMorningWindowTimeRemaining,
    getMorningRitual,
    toggleRitualStep,
    resetRitualSteps,
    getMorningStats,
    completeMorningRitual,
    getTasks,
    completeTask,
    addXP
  } from '../lib/db'
  import type { MorningSession, MorningRitual, MorningStats, Task } from '../lib/types'

  let currentSession: MorningSession | null = null
  let ritual: MorningRitual | null = null
  let stats: MorningStats | null = null
  let morningTasks: Task[] = []
  let timeRemaining = 0
  let protectionMode = false

  let interval: number | null = null

  onMount(async () => {
    await loadData()

    // Check for new day and reset ritual if needed
    await checkAndResetRitual()

    // Start timer update interval
    interval = window.setInterval(async () => {
      await updateTimer()
    }, 1000) as unknown as number
  })

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })

  async function loadData() {
    currentSession = await getCurrentMorningSession()
    ritual = await getMorningRitual()
    stats = await getMorningStats()

    // Load morning tasks
    const allTasks = await getTasks()
    morningTasks = allTasks.filter(t => t.isMorningTask && !t.completed)

    if (currentSession) {
      timeRemaining = await getMorningWindowTimeRemaining()
    }
  }

  async function checkAndResetRitual() {
    if (!ritual) return

    const lastStepCompleted = ritual.steps.find(s => s.completedAt)
    if (lastStepCompleted) {
      const lastCompletedDate = new Date(lastStepCompleted.completedAt!).toDateString()
      const today = new Date().toDateString()

      if (lastCompletedDate !== today) {
        // New day, reset ritual
        await resetRitualSteps()
        ritual = await getMorningRitual()
      }
    }
  }

  async function updateTimer() {
    if (currentSession) {
      timeRemaining = await getMorningWindowTimeRemaining()

      if (timeRemaining === 0) {
        // Window expired
        currentSession = null
      }
    }
  }

  async function handleStartMorning() {
    currentSession = await startMorningSession()
    timeRemaining = 90
    await loadData()
  }

  async function handleToggleStep(stepId: string) {
    ritual = await toggleRitualStep(stepId)

    // Check if all steps are completed
    if (ritual && ritual.steps.every(s => s.completed) && currentSession) {
      await completeMorningRitual()
      currentSession = await getCurrentMorningSession()
      stats = await getMorningStats()
    }
  }

  async function handleCompleteTask(task: Task) {
    const xp = task.leverageScore * 10
    await completeTask(task.id, xp)
    await addXP(xp)
    await loadData()
  }

  function toggleProtectionMode() {
    protectionMode = !protectionMode
  }

  function formatTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  $: completedSteps = ritual?.steps.filter(s => s.completed).length || 0
  $: totalSteps = ritual?.steps.length || 0
  $: ritualProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
  $: windowProgress = currentSession ? Math.round(((90 - timeRemaining) / 90) * 100) : 0
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-2">☀️ Morning Sovereignty Ritual</h2>
    <p class="text-slate-400">
      Control the first 90 minutes. Win the morning, win the day.
    </p>
  </div>

  <!-- Stats Overview -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700 rounded-lg p-4">
        <div class="text-sm text-amber-400 mb-1">Current Streak</div>
        <div class="text-3xl font-bold text-amber-300">{stats.currentStreak}</div>
        <div class="text-xs text-slate-400 mt-1">days in a row</div>
      </div>

      <div class="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-4">
        <div class="text-sm text-blue-400 mb-1">Avg Utilization</div>
        <div class="text-3xl font-bold text-blue-300">{stats.averageWindowUtilization}%</div>
        <div class="text-xs text-slate-400 mt-1">of morning window</div>
      </div>

      <div class="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-700 rounded-lg p-4">
        <div class="text-sm text-purple-400 mb-1">Avg Leverage</div>
        <div class="text-3xl font-bold text-purple-300">{stats.averageLeverageScore}</div>
        <div class="text-xs text-slate-400 mt-1">points per morning</div>
      </div>

      <div class="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 rounded-lg p-4">
        <div class="text-sm text-green-400 mb-1">Total Sessions</div>
        <div class="text-3xl font-bold text-green-300">{stats.totalMorningSessions}</div>
        <div class="text-xs text-slate-400 mt-1">mornings owned</div>
      </div>
    </div>
  {/if}

  <!-- Current Session or Start Button -->
  {#if currentSession}
    <!-- Active Morning Window -->
    <div class="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-600 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-2xl font-bold text-amber-300">🔥 Morning Window Active</h3>
          <p class="text-slate-300 text-sm mt-1">
            Started at {new Date(currentSession.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          on:click={toggleProtectionMode}
          class="px-4 py-2 rounded-lg font-semibold transition-colors {protectionMode ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}"
        >
          {protectionMode ? '🔒 Protected' : '🔓 Unprotected'}
        </button>
      </div>

      <!-- Timer Display -->
      <div class="bg-slate-900/50 rounded-lg p-6 mb-4">
        <div class="text-center">
          <div class="text-6xl font-bold text-amber-400 mb-2">
            {formatTime(timeRemaining)}
          </div>
          <div class="text-sm text-slate-400 mb-4">remaining in sacred window</div>
          <div class="w-full bg-slate-700 h-4 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
              style="width: {windowProgress}%"
            />
          </div>
        </div>
      </div>

      <!-- Session Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-slate-900/30 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-blue-400">{currentSession.tasksCompleted}/{currentSession.tasksTotal}</div>
          <div class="text-xs text-slate-400">Tasks</div>
        </div>
        <div class="bg-slate-900/30 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-purple-400">{currentSession.leverageScore}</div>
          <div class="text-xs text-slate-400">Leverage</div>
        </div>
        <div class="bg-slate-900/30 rounded-lg p-3 text-center">
          <div class="text-2xl font-bold text-green-400">{currentSession.windowUtilization}%</div>
          <div class="text-xs text-slate-400">Utilization</div>
        </div>
      </div>
    </div>

    {#if protectionMode}
      <!-- Protection Mode Banner -->
      <div class="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-center">
        <div class="text-xl font-bold text-red-300 mb-1">🚫 Protection Mode Active</div>
        <p class="text-sm text-slate-300">
          This is your sacred time. No distractions, no phone, no interruptions.
        </p>
      </div>
    {/if}
  {:else}
    <!-- Start Morning Window -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-lg p-8 mb-6 text-center">
      <div class="text-6xl mb-4">☀️</div>
      <h3 class="text-2xl font-bold mb-2">Ready to own your morning?</h3>
      <p class="text-slate-300 mb-6">
        Start your 90-minute sacred window. This is when you do your most important work.
      </p>
      <button
        on:click={handleStartMorning}
        class="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-lg rounded-lg transition-colors"
      >
        🚀 Start Morning Window
      </button>
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Morning Ritual Checklist -->
    <div>
      <h3 class="text-xl font-bold mb-4">📋 Morning Ritual</h3>

      {#if ritual}
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">Progress</span>
            <span class="text-lg font-bold text-amber-400">{completedSteps}/{totalSteps}</span>
          </div>
          <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style="width: {ritualProgress}%"
            />
          </div>
        </div>

        <div class="space-y-3">
          {#each ritual.steps as step}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.completed}
                  on:change={() => handleToggleStep(step.id)}
                  class="w-5 h-5 mt-0.5 rounded border-slate-600 text-amber-600 focus:ring-2 focus:ring-amber-500"
                />
                <div class="flex-1">
                  <div class="font-medium {step.completed ? 'line-through text-slate-500' : ''}">{step.title}</div>
                  {#if step.description}
                    <div class="text-sm text-slate-400 mt-1">{step.description}</div>
                  {/if}
                  {#if step.duration}
                    <div class="text-xs text-slate-500 mt-1">⏱ {step.duration} min</div>
                  {/if}
                </div>
              </label>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Morning Tasks -->
    <div>
      <h3 class="text-xl font-bold mb-4">☀️ Morning Tasks</h3>

      {#if morningTasks.length > 0}
        <div class="space-y-3">
          {#each morningTasks as task}
            <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
              <div class="flex items-start gap-3">
                <button
                  on:click={() => handleCompleteTask(task)}
                  class="mt-1 w-5 h-5 border-2 border-slate-600 rounded hover:border-amber-500 transition-colors flex-shrink-0"
                  title="Complete task"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <h4 class="font-medium">{task.title}</h4>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-amber-400 font-bold text-sm">
                        L{task.leverageScore}
                      </span>
                    </div>
                  </div>

                  {#if task.description}
                    <p class="text-sm text-slate-400 mt-1">{task.description}</p>
                  {/if}

                  {#if task.fourLaws && task.fourLaws.easy.gateway}
                    <div class="mt-2 text-xs bg-blue-900/20 border border-blue-700/30 rounded px-2 py-1 inline-block">
                      💡 2-min version: {task.fourLaws.easy.gateway}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <div class="text-4xl mb-3">✅</div>
          <p class="text-slate-400">No morning tasks scheduled</p>
          <p class="text-sm text-slate-500 mt-2">Add tasks and mark them as "Morning Task" to see them here</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Educational Note -->
  <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-6">
    <h4 class="font-bold mb-2">📚 Why the First 90 Minutes Matter</h4>
    <p class="text-sm text-slate-300 mb-2">
      Research shows that willpower and decision-making ability are highest in the morning.
      The first 90 minutes after waking are your most valuable cognitive hours.
    </p>
    <p class="text-sm text-slate-300">
      <strong>The rule:</strong> Protect this time ruthlessly. No email, no social media, no phone.
      Do your most important work when your brain is sharpest.
    </p>
  </div>
</div>
