<script lang="ts">
  import { onMount } from 'svelte'
  import { Chart, registerables } from 'chart.js'
  import { getTasks, getEnergyLogs, getFocusSessions, getUserState, getHistory } from '../lib/db'
  import type { Task, EnergyLog, FocusSession, UserState, HistoryRecord } from '../lib/types'

  Chart.register(...registerables)

  let tasks: Task[] = []
  let energyLogs: EnergyLog[] = []
  let sessions: FocusSession[] = []
  let userState: UserState | null = null
  let history: HistoryRecord[] = []

  let productivityChartCanvas: HTMLCanvasElement
  let energyTasksChartCanvas: HTMLCanvasElement

  let stats = {
    avgLeverage: 0,
    flowRate: 0,
    totalTasks: 0,
    avgEnergy: 0,
    bestDay: '',
    peakHours: '',
    taskCompletionRate: 0,
    productivityMultiplier: 0
  }

  let insights: string[] = []

  onMount(async () => {
    await loadData()
    calculateStats()
    generateInsights()
    createCharts()
  })

  async function loadData() {
    tasks = await getTasks()
    energyLogs = await getEnergyLogs()
    sessions = await getFocusSessions()
    userState = await getUserState()
    history = await getHistory()
  }

  function calculateStats() {
    // Average leverage
    const completedTasks = tasks.filter(t => t.completed)
    stats.avgLeverage = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + t.leverageScore, 0) / completedTasks.length
      : 0

    // Flow rate
    const flowSessions = sessions.filter(s => s.flowStateAchieved)
    stats.flowRate = sessions.length > 0
      ? (flowSessions.length / sessions.length) * 100
      : 0

    // Total completed tasks
    stats.totalTasks = completedTasks.length

    // Average energy
    stats.avgEnergy = energyLogs.length > 0
      ? energyLogs.reduce((sum, l) => sum + l.energy, 0) / energyLogs.length
      : 0

    // Best day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayCount = Array(7).fill(0)
    history.filter(h => h.type === 'task').forEach(h => {
      const day = new Date(h.completedAt).getDay()
      dayCount[day]++
    })
    const bestDayIndex = dayCount.indexOf(Math.max(...dayCount))
    stats.bestDay = dayNames[bestDayIndex]

    // Peak hours
    const hourCount = Array(24).fill(0)
    history.filter(h => h.type === 'task').forEach(h => {
      hourCount[h.hourOfDay]++
    })
    const peakHour = hourCount.indexOf(Math.max(...hourCount))
    stats.peakHours = `${peakHour}:00 - ${peakHour + 1}:00`

    // Task completion rate (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const recentTasks = tasks.filter(t => new Date(t.createdAt).getTime() > sevenDaysAgo)
    stats.taskCompletionRate = recentTasks.length > 0
      ? (recentTasks.filter(t => t.completed).length / recentTasks.length) * 100
      : 0

    // Productivity multiplier (high energy vs low energy)
    const highEnergyLogs = energyLogs.filter(l => l.energy >= 7)
    const lowEnergyLogs = energyLogs.filter(l => l.energy <= 4)

    const highEnergyProductivity = highEnergyLogs.length > 0
      ? highEnergyLogs.reduce((sum, l) => sum + l.completedTasksInLastHour, 0) / highEnergyLogs.length
      : 0

    const lowEnergyProductivity = lowEnergyLogs.length > 0
      ? lowEnergyLogs.reduce((sum, l) => sum + l.completedTasksInLastHour, 0) / lowEnergyLogs.length
      : 0

    stats.productivityMultiplier = lowEnergyProductivity > 0
      ? highEnergyProductivity / lowEnergyProductivity
      : 0
  }

  function generateInsights() {
    insights = []

    // Leverage insight
    if (stats.avgLeverage >= 7) {
      insights.push('💚 Excellent! You\'re focusing on high-leverage tasks.')
    } else if (stats.avgLeverage < 5) {
      insights.push('⚠️ You\'re spending time on low-leverage tasks. Focus on higher impact work!')
    }

    // Best day insight
    if (stats.bestDay) {
      insights.push(`📅 ${stats.bestDay}s are your most productive days.`)
    }

    // Energy insight
    if (stats.avgEnergy >= 7) {
      insights.push('⚡ Your energy levels are consistently high. Great job!')
    } else if (stats.avgEnergy < 5) {
      insights.push('😴 Your average energy is low. Consider sleep, exercise, and stress management.')
    }

    // Flow state insight
    if (stats.flowRate >= 50) {
      insights.push('🔥 You\'re achieving flow state frequently. Keep it up!')
    } else if (stats.flowRate < 25 && sessions.length > 5) {
      insights.push('💡 Try longer focus sessions (90 min) to reach flow state more often.')
    }

    // Productivity multiplier insight
    if (stats.productivityMultiplier >= 2) {
      insights.push(`🎯 You're ${stats.productivityMultiplier.toFixed(1)}x more productive when energy is high. Protect your peak hours!`)
    }

    // Task completion insight
    if (stats.taskCompletionRate < 50 && tasks.length > 10) {
      insights.push('📉 Many uncompleted tasks. Try breaking them into smaller chunks or removing low-priority items.')
    }
  }

  function createCharts() {
    createProductivityTrendChart()
    createEnergyTaskCorrelationChart()
  }

  function createProductivityTrendChart() {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const tasksByDay = Array(7).fill(0)
    const xpByDay = Array(7).fill(0)

    history.filter(h => h.type === 'task').forEach(record => {
      const date = new Date(record.completedAt)
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo < 7) {
        const index = 6 - daysAgo
        tasksByDay[index]++
        xpByDay[index] += record.xpEarned || 0
      }
    })

    new Chart(productivityChartCanvas, {
      type: 'line',
      data: {
        labels: last7Days,
        datasets: [
          {
            label: 'Tasks Completed',
            data: tasksByDay,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'XP Earned',
            data: xpByDay,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: { color: '#334155' },
            ticks: { color: '#94a3b8' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    })
  }

  function createEnergyTaskCorrelationChart() {
    const energyLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const tasksPerEnergyLevel = energyLevels.map(level => {
      const logsAtLevel = energyLogs.filter(l => l.energy === level)
      if (logsAtLevel.length === 0) return 0
      return logsAtLevel.reduce((sum, l) => sum + l.completedTasksInLastHour, 0) / logsAtLevel.length
    })

    new Chart(energyTasksChartCanvas, {
      type: 'bar',
      data: {
        labels: energyLevels.map(l => l.toString()),
        datasets: [{
          label: 'Avg Tasks Completed per Hour',
          data: tasksPerEnergyLevel,
          backgroundColor: energyLevels.map(l =>
            l >= 7 ? 'rgba(34, 197, 94, 0.6)' : l >= 4 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: energyLevels.map(l =>
            l >= 7 ? '#22c55e' : l >= 4 ? '#3b82f6' : '#ef4444'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#334155' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' },
            title: {
              display: true,
              text: 'Energy Level',
              color: '#94a3b8'
            }
          }
        }
      }
    })
  }
</script>

<div class="max-w-6xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Personal Analytics</h2>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">📊</div>
      <div class="text-sm text-slate-400 mb-1">Avg Leverage</div>
      <div class="text-2xl font-bold">{stats.avgLeverage.toFixed(1)}/10</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">🔥</div>
      <div class="text-sm text-slate-400 mb-1">Flow State Rate</div>
      <div class="text-2xl font-bold">{stats.flowRate.toFixed(0)}%</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">✅</div>
      <div class="text-sm text-slate-400 mb-1">Tasks Completed</div>
      <div class="text-2xl font-bold">{stats.totalTasks}</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">⚡</div>
      <div class="text-sm text-slate-400 mb-1">Avg Energy</div>
      <div class="text-2xl font-bold">{stats.avgEnergy.toFixed(1)}/10</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">📅</div>
      <div class="text-sm text-slate-400 mb-1">Best Day</div>
      <div class="text-lg font-bold">{stats.bestDay || 'N/A'}</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">🕐</div>
      <div class="text-sm text-slate-400 mb-1">Peak Hours</div>
      <div class="text-sm font-bold">{stats.peakHours || 'N/A'}</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">📈</div>
      <div class="text-sm text-slate-400 mb-1">Completion Rate (7d)</div>
      <div class="text-2xl font-bold">{stats.taskCompletionRate.toFixed(0)}%</div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-3xl mb-2">🎯</div>
      <div class="text-sm text-slate-400 mb-1">Productivity 🔥</div>
      <div class="text-2xl font-bold">{stats.productivityMultiplier.toFixed(1)}x</div>
    </div>
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <!-- Productivity Trend -->
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">7-Day Productivity Trend</h3>
      <div style="height: 250px">
        <canvas bind:this={productivityChartCanvas}></canvas>
      </div>
    </div>

    <!-- Energy-Task Correlation -->
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 class="text-lg font-bold mb-4">Energy vs Productivity</h3>
      <div style="height: 250px">
        <canvas bind:this={energyTasksChartCanvas}></canvas>
      </div>
    </div>
  </div>

  <!-- Insights -->
  {#if insights.length > 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4">💡 Personal Insights</h3>
      <div class="space-y-3">
        {#each insights as insight}
          <div class="bg-slate-700 rounded-lg p-4 text-sm">
            {insight}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
