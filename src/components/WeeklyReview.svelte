<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { getUserState, getHistory, addXP } from '../lib/db'
  import type { UserState, HistoryRecord } from '../lib/types'

  const dispatch = createEventDispatcher()

  let userState: UserState | null = null
  let weekHistory: HistoryRecord[] = []
  let reflection = ''
  let improvements = ''

  let stats = {
    tasksCompleted: 0,
    xpEarned: 0,
    averageLeverage: 0,
    practicesCompleted: 0,
    morningTasks: 0,
    highLeverageTasks: 0
  }

  onMount(async () => {
    await loadWeeklyData()
  })

  async function loadWeeklyData() {
    userState = await getUserState()
    const allHistory = await getHistory()

    // Get last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    weekHistory = allHistory.filter(h => new Date(h.completedAt) >= sevenDaysAgo)

    // Calculate stats
    const tasks = weekHistory.filter(h => h.type === 'task')
    const practices = weekHistory.filter(h => h.type === 'practice')

    stats = {
      tasksCompleted: tasks.length,
      xpEarned: tasks.reduce((sum, t) => sum + (t.xpEarned || 0), 0),
      averageLeverage: tasks.length > 0
        ? tasks.reduce((sum, t) => sum + (t.leverageScore || 0), 0) / tasks.length
        : 0,
      practicesCompleted: practices.filter(p => !p.slipOccurred).length,
      morningTasks: tasks.filter(t => t.wasInMorningWindow).length,
      highLeverageTasks: tasks.filter(t => (t.leverageScore || 0) >= 7).length
    }
  }

  async function submitReview() {
    if (!reflection.trim()) {
      alert('Please share at least one reflection before submitting.')
      return
    }

    // Reward user for completing review
    await addXP(50)

    // TODO: Store reflection in a new reflections collection
    // For now, we'll just close the modal

    dispatch('complete', {
      reflection,
      improvements,
      stats
    })
  }

  function skip() {
    if (confirm('Skip this week\'s review? Regular reflection helps you improve faster.')) {
      dispatch('skip')
    }
  }

  function getLeverageColor(avg: number): string {
    if (avg >= 7) return 'text-green-400'
    if (avg >= 5) return 'text-yellow-400'
    if (avg >= 3) return 'text-orange-400'
    return 'text-red-400'
  }

  function getLeverageMessage(avg: number): string {
    if (avg >= 7) return 'Excellent! You\'re focused on high-impact work.'
    if (avg >= 5) return 'Good work. Can you push more tasks into 7+ territory?'
    if (avg >= 3) return 'You\'re doing necessary work, but look for higher-leverage opportunities.'
    return 'Warning: Too much low-leverage work. Refocus on what moves the needle.'
  }
</script>

<div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
  <div class="bg-slate-800 border-2 border-purple-500 rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
    <div class="text-center mb-6">
      <div class="text-6xl mb-4">📊</div>
      <h2 class="text-3xl font-bold mb-2">Weekly Review</h2>
      <p class="text-slate-400">Reflect on your progress and plan improvements</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-400">{stats.tasksCompleted}</div>
        <div class="text-sm text-slate-400">Tasks Completed</div>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-400">+{stats.xpEarned}</div>
        <div class="text-sm text-slate-400">XP Earned</div>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold {getLeverageColor(stats.averageLeverage)}">
          {stats.averageLeverage.toFixed(1)}
        </div>
        <div class="text-sm text-slate-400">Avg Leverage</div>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-purple-400">{stats.practicesCompleted}</div>
        <div class="text-sm text-slate-400">Practices Hit</div>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-amber-400">{stats.morningTasks}</div>
        <div class="text-sm text-slate-400">Morning Tasks</div>
      </div>
      <div class="bg-slate-900 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-400">{stats.highLeverageTasks}</div>
        <div class="text-sm text-slate-400">High-Leverage (7+)</div>
      </div>
    </div>

    <!-- Leverage Insight -->
    <div class="bg-slate-900 border-l-4 {
      stats.averageLeverage >= 7 ? 'border-green-500' :
      stats.averageLeverage >= 5 ? 'border-yellow-500' :
      stats.averageLeverage >= 3 ? 'border-orange-500' : 'border-red-500'
    } rounded-lg p-4 mb-6">
      <div class="font-semibold mb-1">Leverage Analysis</div>
      <div class="text-sm text-slate-300">{getLeverageMessage(stats.averageLeverage)}</div>
    </div>

    <!-- Reflection Prompts -->
    <div class="space-y-4 mb-6">
      <div>
        <label class="block text-sm font-medium mb-2">
          What went well this week? What are you proud of?
        </label>
        <textarea
          bind:value={reflection}
          placeholder="e.g., Maintained morning routine all 7 days, shipped new feature ahead of schedule, hit strength training 3x"
          rows="4"
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">
          What will you improve next week?
        </label>
        <textarea
          bind:value={improvements}
          placeholder="e.g., Increase avg leverage to 6.5+, complete 5 morning tasks instead of 3, ship MVP"
          rows="4"
          class="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
        />
      </div>
    </div>

    <!-- Reward Info -->
    <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-6 text-sm">
      <div class="flex items-center gap-2">
        <span>⚡</span>
        <span>Complete this review to earn <strong>+50 XP</strong></span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        class="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
        on:click={skip}
      >
        Skip This Week
      </button>
      <button
        class="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
        on:click={submitReview}
        disabled={!reflection.trim()}
      >
        Complete Review (+50 XP)
      </button>
    </div>
  </div>
</div>
