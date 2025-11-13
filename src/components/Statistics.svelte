<script lang="ts">
  import { onMount } from 'svelte'
  import { Chart, registerables } from 'chart.js'
  import { getHistory } from '../lib/db/history'
  import { getUserState } from '../lib/db/userState'
  import type { HistoryRecord, UserState } from '../lib/types'

  Chart.register(...registerables)

  let xpChartCanvas: HTMLCanvasElement
  let leverageChartCanvas: HTMLCanvasElement
  let activityChartCanvas: HTMLCanvasElement
  let history: HistoryRecord[] = []
  let userState: UserState | null = null

  onMount(async () => {
    history = await getHistory()
    userState = await getUserState()

    createXPChart()
    createLeverageChart()
    createActivityHeatmap()
  })

  function createXPChart() {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })

    const xpByDay = Array(30).fill(0)
    history.forEach(record => {
      if (record.type === 'task' && record.xpEarned) {
        const date = new Date(record.completedAt)
        const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
        if (daysAgo < 30) {
          xpByDay[29 - daysAgo] += record.xpEarned
        }
      }
    })

    new Chart(xpChartCanvas, {
      type: 'line',
      data: {
        labels: last30Days,
        datasets: [{
          label: 'XP Earned',
          data: xpByDay,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' } },
          x: { grid: { display: false } }
        }
      }
    })
  }

  function createLeverageChart() {
    const leverageCounts = Array(10).fill(0)
    history.forEach(record => {
      if (record.type === 'task' && record.leverageScore) {
        leverageCounts[record.leverageScore - 1]++
      }
    })

    new Chart(leverageChartCanvas, {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [{
          label: 'Tasks Completed',
          data: leverageCounts,
          backgroundColor: leverageCounts.map((_, i) =>
            i >= 6 ? '#10b981' : i >= 4 ? '#f59e0b' : '#f97316'
          )
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' } },
          x: { grid: { display: false } }
        }
      }
    })
  }

  function createActivityHeatmap() {
    const hourCounts = Array(24).fill(0)
    history.forEach(record => {
      if (record.type === 'task') {
        hourCounts[record.hourOfDay]++
      }
    })

    new Chart(activityChartCanvas, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [{
          label: 'Tasks Completed',
          data: hourCounts,
          backgroundColor: '#a855f7'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#334155' } },
          x: { grid: { display: false } }
        }
      }
    })
  }

  $: totalTasks = history.filter(h => h.type === 'task').length
  $: totalXP = history.reduce((sum, h) => sum + (h.xpEarned || 0), 0)
  $: avgLeverage = totalTasks > 0
    ? (history.filter(h => h.type === 'task').reduce((sum, h) => sum + (h.leverageScore || 0), 0) / totalTasks).toFixed(1)
    : '0.0'
  $: morningTasks = history.filter(h => h.type === 'task' && h.wasInMorningWindow).length
</script>

<div class="max-w-6xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Statistics</h2>

  <!-- Summary Cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total Tasks</div>
      <div class="text-2xl font-bold text-blue-400">{totalTasks}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total XP</div>
      <div class="text-2xl font-bold text-yellow-400">{totalXP}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Avg Leverage</div>
      <div class="text-2xl font-bold text-green-400">{avgLeverage}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Morning Tasks</div>
      <div class="text-2xl font-bold text-amber-400">{morningTasks}</div>
    </div>
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 class="text-lg font-bold mb-4">XP Earned (Last 30 Days)</h3>
      <div class="h-64">
        <canvas bind:this={xpChartCanvas}></canvas>
      </div>
    </div>

    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 class="text-lg font-bold mb-4">Tasks by Leverage Score</h3>
      <div class="h-64">
        <canvas bind:this={leverageChartCanvas}></canvas>
      </div>
    </div>
  </div>

  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h3 class="text-lg font-bold mb-4">Activity by Hour of Day</h3>
    <div class="h-64">
      <canvas bind:this={activityChartCanvas}></canvas>
    </div>
  </div>
</div>
