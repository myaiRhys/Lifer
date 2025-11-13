<script lang="ts">
  import { onMount } from 'svelte'
  import { getUserState, getActiveTasks, getTodaysPractices } from '../lib/db'
  import DailyChallenges from './DailyChallenges.svelte'
  import type { UserState, Task, Practice } from '../lib/types'

  let userState: UserState | null = null
  let activeTasks: Task[] = []
  let todaysPractices: Practice[] = []

  onMount(async () => {
    await loadDashboard()
  })

  async function loadDashboard() {
    userState = await getUserState()
    activeTasks = await getActiveTasks()
    todaysPractices = await getTodaysPractices()
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

  $: highLeverageTasks = activeTasks.filter(t => t.leverageScore >= 7)
  $: morningTasks = activeTasks.filter(t => t.isMorningTask)
  $: completedPractices = todaysPractices.filter(p => p.todayCompleted)
  $: showLeverageWarning = userState && userState.lifetimeLeverageRatio > 0 && userState.last7DaysLeverageRatio < (userState.lifetimeLeverageRatio - 1.5)
</script>

<div class="max-w-6xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Dashboard</h2>

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

    <!-- Bottom Grid: Tasks & Practices -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Tasks Summary -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Tasks Overview</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-slate-400">Active Tasks</span>
            <span class="text-xl font-bold text-blue-400">{activeTasks.length}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-slate-400 flex items-center gap-2">
              <span>High Leverage (7+)</span>
            </span>
            <span class="text-xl font-bold text-green-400">{highLeverageTasks.length}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-slate-400 flex items-center gap-2">
              <span>☀️ Morning Tasks</span>
            </span>
            <span class="text-xl font-bold text-amber-400">{morningTasks.length}</span>
          </div>
        </div>
        {#if highLeverageTasks.length > 0}
          <div class="mt-4 pt-4 border-t border-slate-700">
            <div class="text-sm text-slate-400 mb-2">Top Priority:</div>
            <div class="text-sm font-medium">{highLeverageTasks[0].title}</div>
          </div>
        {/if}
      </div>

      <!-- Practices Summary -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 class="text-lg font-semibold mb-4">Today's Practices</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-slate-400">Scheduled</span>
            <span class="text-xl font-bold text-blue-400">{todaysPractices.length}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-slate-700">
            <span class="text-slate-400">Completed</span>
            <span class="text-xl font-bold text-green-400">{completedPractices.length}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-slate-400">Completion Rate</span>
            <span class="text-xl font-bold text-purple-400">
              {todaysPractices.length > 0 ? Math.round((completedPractices.length / todaysPractices.length) * 100) : 0}%
            </span>
          </div>
        </div>
        {#if todaysPractices.length > 0}
          <div class="mt-4 pt-4 border-t border-slate-700">
            <div class="text-sm text-slate-400 mb-2">Active Practices:</div>
            <div class="flex flex-wrap gap-2">
              {#each todaysPractices as practice}
                <span
                  class="text-xs px-2 py-1 rounded {practice.todayCompleted ? 'bg-green-900/30 text-green-400' : 'bg-slate-700 text-slate-400'}"
                >
                  {practice.name}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="text-center py-12 text-slate-500">
      <p class="text-lg">Loading dashboard...</p>
    </div>
  {/if}
</div>
