<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getUserState,
    getActiveTasks,
    getTodaysChores,
    getTodaysPractices,
    completeTask,
    uncompleteTask,
    logPractice,
    completeChore,
    uncompleteChore,
    addXP,
    getIdentity,
    getTodayAlignment,
    getAtRiskPractices,
    getCriticalPractices,
    getCurrentMorningSession,
    getMorningWindowTimeRemaining
  } from '../lib/db'
  import DailyChallenges from './DailyChallenges.svelte'
  import type { UserState, Task, Practice, Chore, Identity, IdentityAlignment, MorningSession } from '../lib/types'

  let userState: UserState | null = null
  let activeTasks: Task[] = []
  let todaysPractices: Practice[] = []
  let todaysChores: Chore[] = []
  let showPracticeModal = false
  let selectedPractice: Practice | null = null
  let practiceLogValue: number = 0
  let identity: Identity | null = null
  let todayAlignment: IdentityAlignment | null = null
  let atRiskPractices: Practice[] = []
  let criticalPractices: Practice[] = []
  let morningSession: MorningSession | null = null
  let morningTimeRemaining = 0

  onMount(async () => {
    await loadDashboard()
  })

  async function loadDashboard() {
    userState = await getUserState()
    activeTasks = await getActiveTasks()
    todaysPractices = await getTodaysPractices()
    todaysChores = await getTodaysChores()
    identity = await getIdentity()
    todayAlignment = await getTodayAlignment()
    atRiskPractices = await getAtRiskPractices()
    criticalPractices = await getCriticalPractices()
    morningSession = await getCurrentMorningSession()
    if (morningSession) {
      morningTimeRemaining = await getMorningWindowTimeRemaining()
    }
  }

  async function handleTaskToggle(task: Task) {
    if (task.completed) {
      await uncompleteTask(task.id)
      if (task.xpEarned) {
        await addXP(-task.xpEarned) // Remove XP
      }
    } else {
      const xp = task.leverageScore * 10
      await completeTask(task.id, xp)
      await addXP(xp)
    }
    await loadDashboard()
  }

  function openPracticeLog(practice: Practice) {
    selectedPractice = practice
    practiceLogValue = practice.todayValue || 0
    showPracticeModal = true
  }

  async function handlePracticeLog() {
    if (!selectedPractice) return
    await logPractice(selectedPractice.id, practiceLogValue)
    showPracticeModal = false
    selectedPractice = null
    practiceLogValue = 0
    await loadDashboard()
  }

  async function handleChoreToggle(chore: Chore) {
    if (chore.completed) {
      await uncompleteChore(chore.id)
    } else {
      await completeChore(chore.id)
    }
    await loadDashboard()
  }

  function getPracticeProgress(practice: Practice): number {
    if (practice.type === 'positive') {
      return Math.min((practice.todayValue / practice.target) * 100, 100)
    } else {
      if (practice.todayValue <= practice.target) return 100
      return Math.max(0, 100 - ((practice.todayValue - practice.target) / practice.target) * 100)
    }
  }

  function getCategoryEmoji(category?: string): string {
    const map: Record<string, string> = {
      'kitchen': '🍽️', 'bedroom': '🛏️', 'bathroom': '🚿', 'laundry': '🧺',
      'errands': '🛒', 'cleaning': '🧹', 'outdoor': '🌳', 'car': '🚗',
      'pets': '🐕', 'maintenance': '🔧'
    }
    return category ? map[category.toLowerCase()] || '📋' : '📋'
  }

  function getStatColor(value: number): string {
    if (value >= 80) return 'bg-green-500'
    if (value >= 50) return 'bg-yellow-500'
    if (value >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  function getXPPercentage(state: UserState): number {
    return (state.xp / state.xpForNextLevel) * 100
  }

  $: highLeverageTasks = activeTasks.filter(t => t.leverageScore >= 7 && !t.completed)
  $: morningTasks = activeTasks.filter(t => t.isMorningTask && !t.completed)
  $: completedPractices = todaysPractices.filter(p => p.todayCompleted)
  $: showLeverageWarning = userState && userState.lifetimeLeverageRatio > 0 && userState.last7DaysLeverageRatio < (userState.lifetimeLeverageRatio - 1.5)
  $: incompleteTasks = activeTasks.filter(t => !t.completed)
  $: incompleteChores = todaysChores.filter(c => !c.completed || c.recurring)
</script>

<div class="max-w-6xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Dashboard</h2>

  <!-- Morning Window Status -->
  {#if morningSession}
    <div class="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-600 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="text-3xl">☀️</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-amber-300 mb-1">Morning Window Active - {morningTimeRemaining} minutes remaining</h3>
          <p class="text-sm text-amber-200 mb-2">
            You've completed {morningSession.tasksCompleted}/{morningSession.tasksTotal} morning tasks ({morningSession.windowUtilization}% utilization)
          </p>
          <a
            href="#"
            on:click|preventDefault={() => window.location.hash = 'morning'}
            class="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors"
          >
            Go to Morning Ritual →
          </a>
        </div>
      </div>
    </div>
  {/if}

  <!-- Never Miss Twice Warnings -->
  {#if criticalPractices.length > 0}
    <div class="bg-red-900/30 border-2 border-red-600 rounded-lg p-4 mb-6 animate-pulse">
      <div class="flex items-start gap-3">
        <span class="text-3xl">🚨</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-red-300 mb-1">CRITICAL: {criticalPractices.length} Habit{criticalPractices.length > 1 ? 's' : ''} Need Immediate Attention</h3>
          <p class="text-sm text-red-200 mb-2">
            You've missed these habits 2+ days in a row. This is the line between staying on track and losing the habit entirely.
          </p>
          <div class="flex flex-wrap gap-2 mb-2">
            {#each criticalPractices as practice}
              <span class="px-2 py-1 bg-red-800 rounded text-xs font-medium">{practice.name}</span>
            {/each}
          </div>
          <a
            href="#"
            on:click|preventDefault={() => window.location.hash = 'recovery'}
            class="inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors"
          >
            View Recovery Plan →
          </a>
        </div>
      </div>
    </div>
  {:else if atRiskPractices.length > 0}
    <div class="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
      <div class="flex items-start gap-3">
        <span class="text-2xl">⚠️</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-yellow-300 mb-1">At Risk: {atRiskPractices.length} Habit{atRiskPractices.length > 1 ? 's' : ''} Missed Once</h3>
          <p class="text-sm text-yellow-200 mb-2">
            Missing once is an accident. Get back on track today to keep your streaks alive.
          </p>
          <div class="flex flex-wrap gap-2 mb-2">
            {#each atRiskPractices as practice}
              <span class="px-2 py-1 bg-yellow-800 rounded text-xs font-medium">{practice.name}</span>
            {/each}
          </div>
          <a
            href="#"
            on:click|preventDefault={() => window.location.hash = 'recovery'}
            class="inline-block px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-semibold rounded text-sm transition-colors"
          >
            See Recovery Tips →
          </a>
        </div>
      </div>
    </div>
  {/if}

  {#if userState}
    <!-- Top Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Level & XP Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-400">Level</span>
          <span class="text-2xl font-bold text-blue-400">{userState.level}</span>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-slate-400 mb-1">
            <span>XP: {userState.xp}</span>
            <span>{userState.xpForNextLevel}</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all"
              style="width: {getXPPercentage(userState)}%"
            />
          </div>
        </div>
        <p class="text-xs text-slate-500">
          {userState.xpForNextLevel - userState.xp} XP to level {userState.level + 1}
        </p>
      </div>

      <!-- Streaks Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div class="text-sm text-slate-400 mb-2">Streaks</div>
        <div class="flex justify-between items-center">
          <div>
            <div class="text-2xl font-bold text-green-400">{userState.currentStreak}</div>
            <div class="text-xs text-slate-500">Current</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-400">{userState.longestStreak}</div>
            <div class="text-xs text-slate-500">Best</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-amber-400">{userState.morningControlCount}</div>
            <div class="text-xs text-slate-500">Morning Wins</div>
          </div>
        </div>
      </div>

      <!-- Leverage Ratio Card -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div class="text-sm text-slate-400 mb-2">Leverage Ratio</div>
        <div class="flex justify-between items-center">
          <div>
            <div class="text-2xl font-bold text-purple-400">
              {userState.last7DaysLeverageRatio.toFixed(1)}
            </div>
            <div class="text-xs text-slate-500">Last 7 Days</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-300">
              {userState.lifetimeLeverageRatio.toFixed(1)}
            </div>
            <div class="text-xs text-slate-500">Lifetime</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Identity Widget -->
    {#if identity}
      <div class="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">🎯</span>
              <h3 class="font-bold text-lg">Your Identity</h3>
            </div>
            <p class="text-lg mb-3">
              I am a person who <span class="text-blue-400 font-semibold">{identity.statement}</span>
            </p>
            {#if todayAlignment}
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm text-slate-400">Today's Alignment</span>
                    <span class="text-lg font-bold {todayAlignment.percentage >= 80 ? 'text-green-400' : todayAlignment.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}">
                      {todayAlignment.percentage}%
                    </span>
                  </div>
                  <div class="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
                      style="width: {todayAlignment.percentage}%"
                    />
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-xs">
                    <span class="text-green-400">↑ {todayAlignment.votesFor} for</span>
                    <span class="text-red-400">↓ {todayAlignment.votesAgainst} against</span>
                  </div>
                </div>
                <a
                  href="#identity"
                  on:click|preventDefault={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'identity' }))}
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
                >
                  View Details →
                </a>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- Leverage Warning -->
    {#if showLeverageWarning}
      <div class="bg-orange-900/30 border-l-4 border-orange-500 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <div class="text-2xl">⚠️</div>
          <div class="flex-1">
            <h3 class="font-semibold text-orange-400 mb-1">Leverage Slipping</h3>
            <p class="text-sm text-slate-300 mb-2">
              Your 7-day leverage ratio ({userState.last7DaysLeverageRatio.toFixed(1)}) is significantly lower than your lifetime average ({userState.lifetimeLeverageRatio.toFixed(1)}).
            </p>
            <p class="text-sm text-slate-400">
              Focus on high-leverage tasks (7+) to get back on track. Are you getting stuck in busy work?
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- Stats Bars -->
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Today's Status</h3>
      <div class="space-y-3">
        {#each [
          { name: 'Hydration', value: userState.hydration, icon: '💧' },
          { name: 'Strength', value: userState.strength, icon: '💪' },
          { name: 'Energy', value: userState.energy, icon: '⚡' },
          { name: 'Focus', value: userState.focus, icon: '🎯' },
          { name: 'Recovery', value: userState.recovery, icon: '😴' }
        ] as stat}
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="flex items-center gap-2">
                <span>{stat.icon}</span>
                <span>{stat.name}</span>
              </span>
              <span class="font-medium">{stat.value}%</span>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2">
              <div
                class="{getStatColor(stat.value)} h-2 rounded-full transition-all"
                style="width: {stat.value}%"
              />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Daily Challenges -->
    <div class="mb-6">
      <DailyChallenges />
    </div>

    <!-- Action Grid: Complete Today's Items -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Tasks Section -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4 flex items-center justify-between">
          <span>✅ Tasks ({incompleteTasks.length})</span>
          {#if highLeverageTasks.length > 0}
            <span class="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
              {highLeverageTasks.length} high leverage
            </span>
          {/if}
        </h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each incompleteTasks.slice(0, 10) as task (task.id)}
            <div class="flex items-start gap-2 p-2 bg-slate-750 rounded hover:bg-slate-700 transition-colors">
              <button
                class="text-lg mt-0.5"
                on:click={() => handleTaskToggle(task)}
                title="Complete task"
              >
                {task.completed ? '✅' : '⬜'}
              </button>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{task.title}</div>
                <div class="flex items-center gap-2 text-xs text-slate-400">
                  {#if task.isMorningTask}<span>☀️</span>{/if}
                  <span class="px-1 py-0.5 rounded {task.leverageScore >= 7 ? 'bg-green-900/30 text-green-400' : 'bg-slate-600'}">
                    L{task.leverageScore}
                  </span>
                </div>
              </div>
            </div>
          {/each}
          {#if incompleteTasks.length === 0}
            <p class="text-sm text-slate-500 text-center py-4">No active tasks</p>
          {/if}
        </div>
      </div>

      <!-- Practices Section -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">
          🎯 Practices ({completedPractices.length}/{todaysPractices.length})
        </h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each todaysPractices as practice (practice.id)}
            <button
              class="w-full text-left p-2 bg-slate-750 rounded hover:bg-slate-700 transition-colors"
              on:click={() => openPracticeLog(practice)}
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium">{practice.name}</span>
                <span class="text-xs {practice.todayCompleted ? 'text-green-400' : 'text-slate-400'}">
                  {practice.todayCompleted ? '✓' : practice.todayValue}/{practice.target} {practice.unit}
                </span>
              </div>
              <div class="w-full bg-slate-700 rounded-full h-1.5">
                <div
                  class="{practice.todayCompleted ? 'bg-green-500' : 'bg-blue-500'} h-1.5 rounded-full transition-all"
                  style="width: {getPracticeProgress(practice)}%"
                />
              </div>
            </button>
          {/each}
          {#if todaysPractices.length === 0}
            <p class="text-sm text-slate-500 text-center py-4">No practices scheduled</p>
          {/if}
        </div>
      </div>

      <!-- Chores Section -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">
          🏠 Chores ({todaysChores.filter(c => !c.completed).length})
        </h3>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each incompleteChores as chore (chore.id)}
            <div class="flex items-start gap-2 p-2 bg-slate-750 rounded hover:bg-slate-700 transition-colors">
              <button
                class="text-lg mt-0.5"
                on:click={() => handleChoreToggle(chore)}
                title="Complete chore"
              >
                {chore.completed ? '✅' : '⬜'}
              </button>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="text-sm">{getCategoryEmoji(chore.category)}</span>
                  <span class="text-sm font-medium truncate">{chore.title}</span>
                </div>
                <div class="text-xs text-slate-400">
                  {#if chore.recurring}
                    <span class="px-1 py-0.5 bg-purple-900/30 text-purple-400 rounded">{chore.frequency}</span>
                  {/if}
                  <span>+{chore.xpReward} XP</span>
                </div>
              </div>
            </div>
          {/each}
          {#if incompleteChores.length === 0}
            <p class="text-sm text-slate-500 text-center py-4">No chores today</p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-12 text-slate-500">
      <p class="text-lg">Loading dashboard...</p>
    </div>
  {/if}
</div>

<!-- Practice Log Modal -->
{#if showPracticeModal && selectedPractice}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" on:click={() => showPracticeModal = false}>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full" on:click|stopPropagation>
      <h3 class="text-xl font-semibold mb-4">{selectedPractice.name}</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          {selectedPractice.type === 'positive' ? 'How much did you complete?' : 'How much today?'}
        </label>
        <div class="flex items-center gap-3">
          <input
            type="number"
            bind:value={practiceLogValue}
            min="0"
            step="0.1"
            class="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
            autofocus
          />
          <span class="text-slate-400">{selectedPractice.unit}</span>
        </div>
        <div class="text-xs text-slate-400 mt-2">
          Target: {selectedPractice.target} {selectedPractice.unit}
        </div>
      </div>
      <div class="flex gap-2">
        <button
          class="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
          on:click={handlePracticeLog}
        >
          Log Progress
        </button>
        <button
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
          on:click={() => showPracticeModal = false}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
