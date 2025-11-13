<script lang="ts">
  import { onMount } from 'svelte'
  import { Chart, registerables } from 'chart.js'
  import { getBPTAnalysis, getEnergyLogs } from '../lib/db'
  import type { BPTAnalysis, EnergyLog } from '../lib/types'

  Chart.register(...registerables)

  let chartCanvas: HTMLCanvasElement
  let bptData: BPTAnalysis | null = null
  let logs: EnergyLog[] = []
  let chart: Chart | null = null

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    bptData = await getBPTAnalysis()
    logs = await getEnergyLogs()

    if (bptData && chartCanvas) {
      createEnergyChart()
      calculateCorrelations()
    }
  }

  function createEnergyChart() {
    if (!bptData) return

    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }

    const labels = bptData.energyCurve.map(d => {
      const hour = d.hour
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      return `${displayHour}${period}`
    })

    const data = bptData.energyCurve.map(d => d.avgEnergy)

    // Highlight BPT window
    const bptStart = parseInt(bptData.peakWindow.start.split(':')[0])
    const bptEnd = parseInt(bptData.peakWindow.end.split(':')[0])

    const backgroundColors = bptData.energyCurve.map(d =>
      d.hour >= bptStart && d.hour < bptEnd
        ? 'rgba(34, 197, 94, 0.3)'
        : 'rgba(59, 130, 246, 0.1)'
    )

    chart = new Chart(chartCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Average Energy',
          data,
          borderColor: '#3b82f6',
          backgroundColor: backgroundColors,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: bptData.energyCurve.map(d =>
            d.hour >= bptStart && d.hour < bptEnd ? '#22c55e' : '#3b82f6'
          ),
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `Energy: ${context.parsed.y.toFixed(1)}/10`
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            grid: { color: '#334155' },
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

  // Calculate correlations between energy and tasks completed
  let highEnergyProductivity = 0
  let lowEnergyProductivity = 0

  function calculateCorrelations() {
    const highEnergyLogs = logs.filter(l => l.energy >= 7)
    const lowEnergyLogs = logs.filter(l => l.energy <= 4)

    if (highEnergyLogs.length > 0) {
      highEnergyProductivity = highEnergyLogs.reduce((sum, l) =>
        sum + l.completedTasksInLastHour, 0
      ) / highEnergyLogs.length
    }

    if (lowEnergyLogs.length > 0) {
      lowEnergyProductivity = lowEnergyLogs.reduce((sum, l) =>
        sum + l.completedTasksInLastHour, 0
      ) / lowEnergyLogs.length
    }
  }

  $: daysTracked = Math.floor(logs.length / 3)
  $: hasEnoughData = logs.length >= 63
</script>

<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
  <h2 class="text-2xl font-bold mb-4">Biological Prime Time Analysis</h2>

  {#if !hasEnoughData}
    <!-- Not enough data yet -->
    <div class="text-center py-8">
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-xl font-semibold mb-2">Keep Tracking Your Energy</h3>
      <div class="mb-4">
        <div class="bg-slate-700 h-4 rounded-full overflow-hidden max-w-md mx-auto">
          <div
            class="bg-blue-500 h-full transition-all duration-500"
            style="width: {(daysTracked / 21) * 100}%"
          />
        </div>
        <p class="text-sm mt-2 text-slate-400">Day {daysTracked}/21</p>
      </div>
      <p class="text-slate-400 max-w-lg mx-auto">
        Log your energy 3 times daily for 21 days to discover your peak productivity hours.
        Your Biological Prime Time is when you naturally have the most mental energy.
      </p>
    </div>
  {:else}
    <!-- BPT Analysis -->
    {#if bptData}
      <!-- Peak Window Card -->
      <div class="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500 rounded-lg p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="text-5xl">🎯</div>
          <div class="flex-1">
            <h3 class="text-2xl font-bold mb-2">
              {bptData.peakWindow.start} - {bptData.peakWindow.end}
            </h3>
            <p class="text-slate-300 mb-1">Your Biological Prime Time</p>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  class="bg-green-500 h-full rounded-full"
                  style="width: {bptData.peakWindow.confidence}%"
                />
              </div>
              <span class="text-sm font-bold text-green-400">{bptData.peakWindow.confidence}% confident</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Based on {bptData.dataPoints} energy logs
            </p>
          </div>
        </div>
      </div>

      <!-- Energy Curve Chart -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Your Energy Curve</h3>
        <div class="bg-slate-900 rounded-lg p-4" style="height: 300px">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
        <p class="text-xs text-slate-400 mt-2 text-center">
          Green area = Your BPT window (optimal for high-leverage tasks)
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-slate-700 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="text-3xl">⚡</div>
            <div>
              <div class="text-sm text-slate-400">High Energy (7+)</div>
              <div class="text-2xl font-bold">{highEnergyProductivity.toFixed(1)} tasks/hour</div>
            </div>
          </div>
        </div>

        <div class="bg-slate-700 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="text-3xl">😴</div>
            <div>
              <div class="text-sm text-slate-400">Low Energy (&lt;4)</div>
              <div class="text-2xl font-bold">{lowEnergyProductivity.toFixed(1)} tasks/hour</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div class="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
        <h3 class="font-semibold mb-2 flex items-center gap-2">
          <span>💡</span>
          <span>Optimization Tips</span>
        </h3>
        <ul class="space-y-2 text-sm text-slate-300">
          <li class="flex items-start gap-2">
            <span class="text-green-400 mt-0.5">✓</span>
            <span>Schedule high-leverage tasks (7+) during your BPT for 2x XP bonus</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-400 mt-0.5">✓</span>
            <span>Use low-energy periods for admin work, emails, and planning</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-400 mt-0.5">✓</span>
            <span>You're {(highEnergyProductivity / Math.max(lowEnergyProductivity, 0.1)).toFixed(1)}x more productive during high energy times</span>
          </li>
        </ul>
      </div>
    {/if}
  {/if}
</div>
