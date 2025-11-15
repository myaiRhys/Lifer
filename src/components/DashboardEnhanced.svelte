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
    getMorningWindowTimeRemaining,
    getGatewayAnalytics,
    checkLowAuthenticityAlert
  } from '../lib/db'
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
  let gatewayAnalytics: any = null
  let authenticityAlert: any = null

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
    gatewayAnalytics = await getGatewayAnalytics()
    authenticityAlert = await checkLowAuthenticityAlert()
  }

  async function handleTaskToggle(task: Task) {
    if (task.completed) {
      await uncompleteTask(task.id)
      if (task.xpEarned) {
        await addXP(-task.xpEarned)
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

  function getLeverageColor(score: number): string {
    if (score >= 9) return 'border-red-500 bg-red-900/20'
    if (score >= 7) return 'border-orange-500 bg-orange-900/20'
    if (score >= 4) return 'border-blue-500 bg-blue-900/20'
    return 'border-slate-600 bg-slate-800'
  }

  function getLeverageBadgeColor(score: number): string {
    if (score >= 9) return 'bg-red-600 text-white'
    if (score >= 7) return 'bg-orange-600 text-white'
    if (score >= 4) return 'bg-blue-600 text-white'
    return 'bg-slate-600 text-slate-300'
  }

  function getXPPercentage(state: UserState): number {
    return (state.xp / state.xpForNextLevel) * 100
  }

  function getPracticeProgress(practice: Practice): number {
    if (practice.type === 'positive') {
      return Math.min((practice.todayValue / practice.target) * 100, 100)
    } else {
      if (practice.todayValue <= practice.target) return 100
      return Math.max(0, 100 - ((practice.todayValue - practice.target) / practice.target) * 100)
    }
  }

  $: highLeverageTasks = activeTasks.filter(t => t.leverageScore >= 7 && !t.completed).slice(0, 6)
  $: morningTasks = activeTasks.filter(t => t.isMorningTask && !t.completed)
  $: completedPractices = todaysPractices.filter(p => p.todayCompleted)
  $: incompleteTasks = activeTasks.filter(t => !t.completed)
  $: morningCompletionPercentage = morningSession ? (morningSession.tasksCompleted / morningSession.tasksTotal) * 100 : 0
</script>

<div class="max-w-6xl mx-auto p-6">
  <!-- Top Bar: Avatar + Level + XP + Streak -->
  {#if userState}
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <!-- Avatar with Level Badge -->
        <div class="relative">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span class="text-2xl font-bold text-white">{userState.level}</span>
          </div>
          <div class="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-slate-900">
            LVL {userState.level}
          </div>
        </div>

        <!-- XP Counter -->
        <div>
          <div class="text-sm text-slate-400">Experience</div>
          <div class="text-3xl font-bold text-blue-400">{userState.xp.toLocaleString()} XP</div>
          <div class="text-xs text-slate-500">{userState.xpForNextLevel - userState.xp} to next level</div>
        </div>
      </div>

      <!-- Streak Counter -->
      <div class="text-right">
        <div class="text-sm text-slate-400 mb-1">Current Streak</div>
        <div class="flex items-center gap-2">
          <span class="text-4xl">🔥</span>
          <span class="text-4xl font-bold text-orange-400">{userState.currentStreak}</span>
        </div>
        <div class="text-xs text-slate-500">Best: {userState.longestStreak} days</div>
      </div>
    </div>

    <!-- XP Progress Bar (Full Width) -->
    <div class="mb-8">
      <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
          style="width: {getXPPercentage(userState)}%"
        />
      </div>
    </div>
  {/if}

  <!-- Identity Statement Card (PROMINENT) -->
  {#if identity}
    <div class="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-2 border-indigo-600 rounded-2xl p-6 mb-8 shadow-xl">
      <div class="flex items-start gap-3 mb-4">
        <span class="text-4xl">🎯</span>
        <div class="flex-1">
          <div class="text-sm uppercase tracking-wide text-indigo-400 font-semibold mb-2">Your Identity</div>
          <p class="text-2xl font-bold leading-tight">
            I am a person who <span class="text-indigo-300">{identity.statement}</span>
          </p>
        </div>
      </div>

      {#if todayAlignment}
        <div class="flex items-center gap-4 mt-4">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-slate-300">Today's Alignment</span>
              <span class="text-2xl font-bold {todayAlignment.percentage >= 80 ? 'text-green-400' : todayAlignment.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}">
                {todayAlignment.percentage}%
              </span>
            </div>
            <div class="w-full bg-slate-700/50 h-3 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-green-500 to-green-300 transition-all duration-500"
                style="width: {todayAlignment.percentage}%"
              />
            </div>
            <div class="flex items-center gap-4 mt-2 text-sm">
              <span class="text-green-400">↑ {todayAlignment.votesFor} votes for</span>
              <span class="text-red-400">↓ {todayAlignment.votesAgainst} votes against</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Morning Control Widget (Circular Progress) -->
  {#if morningSession}
    <div class="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-2 border-amber-600 rounded-2xl p-6 mb-8 shadow-xl">
      <div class="flex items-center gap-6">
        <!-- Circular Progress -->
        <div class="relative w-32 h-32 flex-shrink-0">
          <svg class="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-amber-400 transition-all duration-500"
              stroke-dasharray="351.68"
              stroke-dashoffset="{351.68 * (1 - morningCompletionPercentage / 100)}"
              stroke-linecap="round"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-3xl font-bold text-amber-300">{Math.round(morningCompletionPercentage)}%</div>
            <div class="text-xs text-amber-500">{morningSession.tasksCompleted}/{morningSession.tasksTotal}</div>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-3xl">☀️</span>
            <h3 class="text-2xl font-bold text-amber-300">Morning Control</h3>
          </div>
          <p class="text-amber-200 mb-3">
            {morningTimeRemaining} minutes remaining • {morningSession.windowUtilization}% utilization
          </p>
          {#if morningSession.tasksCompleted >= 5}
            <div class="inline-block px-4 py-2 bg-amber-600 text-white font-bold rounded-lg text-sm animate-pulse">
              🔥 3x XP ACTIVE
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- Alerts Section -->
  <div class="space-y-4 mb-8">
    <!-- Authenticity Alert -->
    {#if authenticityAlert?.shouldAlert}
      <div class="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-2 border-purple-600 rounded-xl p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <span class="text-3xl">🌿</span>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-purple-300 mb-1">Low Authenticity: {authenticityAlert.consecutiveLowDays} Days Below 7</h3>
            <p class="text-sm text-purple-200 mb-2">
              Your body is telling you something. Scores: {authenticityAlert.lastLowScores.join(', ')}
            </p>
            <button
              on:click={() => window.location.href = '#authenticity'}
              class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Check In With Yourself →
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Critical Practices Alert -->
    {#if criticalPractices.length > 0}
      <div class="bg-red-900/30 border-2 border-red-600 rounded-xl p-4 animate-pulse">
        <div class="flex items-start gap-3">
          <span class="text-3xl">🚨</span>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-red-300 mb-1">CRITICAL: {criticalPractices.length} Streak{criticalPractices.length > 1 ? 's' : ''} At Risk</h3>
            <p class="text-sm text-red-200 mb-2">
              Missed twice. Don't break the identity.
            </p>
            <div class="flex flex-wrap gap-2 mb-3">
              {#each criticalPractices as practice}
                <span class="px-3 py-1 bg-red-800 rounded-full text-sm font-medium">{practice.name}</span>
              {/each}
            </div>
            <button
              on:click={() => window.location.href = '#recovery'}
              class="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Recovery Plan →
            </button>
          </div>
        </div>
      </div>
    {:else if atRiskPractices.length > 0}
      <div class="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div class="flex-1">
            <h3 class="text-lg font-bold text-yellow-300 mb-1">At Risk: {atRiskPractices.length} Missed Once</h3>
            <p class="text-sm text-yellow-200 mb-2">
              Missing once is an accident. Get back on track today.
            </p>
            <div class="flex flex-wrap gap-2">
              {#each atRiskPractices as practice}
                <span class="px-3 py-1 bg-yellow-800 rounded-full text-sm font-medium">{practice.name}</span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- High Leverage Tasks Section (CONSTRAINT: MAX 6) -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-2xl font-bold">Today's High-Leverage Tasks</h3>
      <span class="text-sm text-slate-400">{highLeverageTasks.length}/6 tasks</span>
    </div>

    {#if highLeverageTasks.length === 0}
      <div class="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <div class="text-4xl mb-3">🎯</div>
        <div class="text-lg font-semibold mb-2">No high-leverage tasks yet</div>
        <p class="text-slate-400 text-sm">
          Add tasks with leverage score 7+ to focus on what matters most
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each highLeverageTasks as task}
          <button
            on:click={() => handleTaskToggle(task)}
            class="w-full {getLeverageColor(task.leverageScore)} border-l-4 rounded-xl p-4 text-left transition-all hover:scale-[1.02] {task.completed ? 'opacity-60' : ''}"
          >
            <div class="flex items-start gap-4">
              <!-- Progress Ring -->
              <div class="relative w-12 h-12 flex-shrink-0">
                <svg class="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    stroke-width="3"
                    fill="none"
                    class="text-slate-700"
                  />
                  {#if task.completed}
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      stroke-width="3"
                      fill="none"
                      class="text-green-500"
                      stroke-dasharray="125.6"
                      stroke-dashoffset="0"
                    />
                  {/if}
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  {#if task.completed}
                    <span class="text-green-500 text-xl">✓</span>
                  {:else}
                    <span class="text-slate-500 text-xl">○</span>
                  {/if}
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start gap-2 mb-1">
                  <h4 class="text-lg font-semibold flex-1 {task.completed ? 'line-through text-slate-500' : ''}">
                    {task.title}
                  </h4>
                  <!-- Leverage Badge -->
                  <div class="flex-shrink-0">
                    <span class="{getLeverageBadgeColor(task.leverageScore)} px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      {task.leverageScore}
                      {#if task.leverageScore >= 9}
                        <span>🔥</span>
                      {/if}
                    </span>
                  </div>
                </div>

                {#if task.result}
                  <p class="text-sm text-slate-400 mb-1">
                    <span class="text-slate-500">Result:</span> {task.result}
                  </p>
                {/if}

                {#if task.purpose}
                  <p class="text-sm text-slate-400 italic mb-2">
                    <span class="text-slate-500">Purpose:</span> {task.purpose}
                  </p>
                {/if}

                <!-- Metadata -->
                <div class="flex items-center gap-3 text-xs text-slate-500">
                  {#if task.estimatedTime}
                    <span>⏱️ {task.estimatedTime} min</span>
                  {/if}
                  {#if task.energyLevel}
                    <span>⚡ {task.energyLevel}</span>
                  {/if}
                  {#if task.completed}
                    <span class="text-green-400">+{task.xpEarned || task.leverageScore * 10} XP</span>
                  {/if}
                </div>
              </div>
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Quick Actions Bar -->
  <div class="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 p-4 -mx-6 -mb-6">
    <div class="flex items-center justify-center gap-4">
      <button
        on:click={() => window.location.href = '#tasks'}
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-colors"
      >
        <span class="text-xl">✅</span>
        <span>Add Task</span>
      </button>
      <button
        on:click={() => window.location.href = '#energy'}
        class="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-semibold transition-colors"
      >
        <span class="text-xl">⚡</span>
        <span>Energy Check</span>
      </button>
      <button
        on:click={() => window.location.href = '#focus'}
        class="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
      >
        <span class="text-xl">🎯</span>
        <span>Start Focus</span>
      </button>
    </div>
  </div>
</div>

<!-- Practice Log Modal -->
{#if showPracticeModal && selectedPractice}
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div class="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
      <h3 class="text-2xl font-bold mb-4">{selectedPractice.name}</h3>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2">
          {selectedPractice.type === 'positive' ? 'How much did you complete?' : 'How much today?'}
        </label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            bind:value={practiceLogValue}
            min="0"
            step="0.1"
            class="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-lg"
          />
          <span class="text-slate-400 text-lg">{selectedPractice.unit}</span>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          on:click={handlePracticeLog}
          class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
        >
          Log It
        </button>
        <button
          on:click={() => showPracticeModal = false}
          class="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}
