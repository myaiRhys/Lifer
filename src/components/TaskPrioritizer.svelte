<script lang="ts">
  import { onMount } from 'svelte'
  import { getTasks, getBPTAnalysis, getEnergyLogs, isInBPTWindow } from '../lib/db'
  import type { Task } from '../lib/types'

  let suggestion: {
    task: Task
    reasons: string[]
    confidence: number
    score: number
  } | null = null
  let loading = false

  async function getPrioritization() {
    loading = true
    suggestion = null

    try {
      const tasks = await getTasks()
      const bpt = await getBPTAnalysis()
      const currentHour = new Date().getHours()
      const energyLogs = await getEnergyLogs()

      // Get latest energy
      const recentLog = energyLogs[energyLogs.length - 1]
      const currentEnergy = recentLog?.energy || 5

      // Check if in BPT
      const inBPT = await isInBPTWindow()

      // Score tasks
      const scored = tasks
        .filter(t => !t.completed)
        .map(task => {
          let score = 0
          const reasons: string[] = []

          // Leverage (40%)
          score += task.leverageScore * 4
          if (task.leverageScore >= 7) {
            reasons.push('✓ High leverage task')
          }

          // Morning task bonus (15%)
          if (task.isMorningTask && currentHour < 12) {
            score += 15
            reasons.push('✓ Morning task - complete early!')
          }

          // Deadline urgency (25%)
          if (task.scheduledFor) {
            const daysUntil = Math.ceil(
              (new Date(task.scheduledFor).getTime() - new Date().getTime()) / 86400000
            )
            if (daysUntil <= 1) {
              score += 25
              reasons.push('⚠️ Due tomorrow or earlier')
            } else if (daysUntil <= 3) {
              score += 15
              reasons.push('⏰ Due within 3 days')
            } else if (daysUntil <= 7) {
              score += 5
              reasons.push('📅 Due this week')
            }
          }

          // Energy match (20%)
          if (currentEnergy >= 7) {
            if (task.leverageScore >= 7) {
              score += 20
              reasons.push('✓ High energy + high leverage = perfect match')
            }
          } else if (currentEnergy <= 4) {
            if (task.leverageScore <= 4) {
              score += 20
              reasons.push('✓ Low energy - good time for admin tasks')
            }
          } else {
            if (task.leverageScore >= 5 && task.leverageScore <= 7) {
              score += 15
              reasons.push('✓ Moderate energy - good for medium tasks')
            }
          }

          // BPT bonus
          if (inBPT && task.leverageScore >= 7) {
            score += 25
            reasons.push('🔥 You\'re in your BPT window (2x XP!)')
          }

          return { task, score, reasons }
        })

      scored.sort((a, b) => b.score - a.score)

      if (scored.length === 0) {
        alert('No active tasks! Add some tasks first.')
        loading = false
        return
      }

      const top = scored[0]
      suggestion = {
        task: top.task,
        reasons: top.reasons,
        confidence: Math.min(100, Math.round((top.score / 100) * 100)),
        score: top.score
      }
    } catch (error) {
      alert('Failed to calculate prioritization')
      console.error(error)
    } finally {
      loading = false
    }
  }

  function getLeverageColor(score: number): string {
    if (score >= 8) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    return 'text-orange-400'
  }
</script>

<div class="max-w-3xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">AI Task Prioritizer</h2>

  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
    <p class="text-slate-300 mb-6">
      Not sure what to work on next? Let the AI analyze your tasks, energy levels, deadlines,
      and BPT window to recommend the optimal task.
    </p>

    <button
      on:click={getPrioritization}
      disabled={loading}
      class="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-lg text-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
    >
      {loading ? '🤔 Analyzing...' : '🎯 What should I work on next?'}
    </button>

    {#if suggestion}
      <div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500 rounded-lg p-6">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1">
            <h3 class="text-2xl font-bold mb-2">{suggestion.task.title}</h3>
            {#if suggestion.task.description}
              <p class="text-sm text-slate-300 mb-3">{suggestion.task.description}</p>
            {/if}

            <div class="flex items-center gap-3 mb-4">
              <span class="px-3 py-1 bg-slate-700 rounded-full text-sm font-medium {getLeverageColor(suggestion.task.leverageScore)}">
                Leverage: {suggestion.task.leverageScore}/10
              </span>
              {#if suggestion.task.isMorningTask}
                <span class="px-3 py-1 bg-amber-900/30 text-amber-400 rounded-full text-sm font-medium">
                  ☀️ Morning Task
                </span>
              {/if}
            </div>
          </div>

          <div class="text-center">
            <div class="text-5xl mb-2">
              {#if suggestion.confidence >= 80}
                🎯
              {:else if suggestion.confidence >= 60}
                ✅
              {:else}
                🤔
              {/if}
            </div>
            <div class="text-sm text-slate-400">
              {suggestion.confidence}% confident
            </div>
          </div>
        </div>

        <!-- Reasons -->
        <div class="mb-6">
          <h4 class="font-semibold mb-3 text-blue-400">Why now?</h4>
          <div class="space-y-2">
            {#each suggestion.reasons as reason}
              <div class="flex items-start gap-2 text-sm">
                <div class="mt-0.5">{reason}</div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button
            class="flex-1 bg-green-600 hover:bg-green-500 p-3 rounded-lg font-bold transition-colors"
            on:click={() => {
              alert('Great! Go complete this task.\n\nTip: Navigate to Tasks tab to mark it complete.')
              suggestion = null
            }}
          >
            Start This Task
          </button>
          <button
            on:click={() => suggestion = null}
            class="px-6 bg-slate-700 hover:bg-slate-600 p-3 rounded-lg font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- How It Works -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-4">🧠 How AI Prioritization Works</h3>

    <div class="space-y-4">
      <div>
        <h4 class="font-semibold mb-2">Factors Analyzed:</h4>
        <ul class="text-sm text-slate-300 space-y-1">
          <li class="flex items-start gap-2">
            <span class="text-blue-400">•</span>
            <span><strong>Leverage Score (40%):</strong> Prioritizes high-impact tasks</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-400">•</span>
            <span><strong>Deadlines (25%):</strong> Urgent tasks get higher priority</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-400">•</span>
            <span><strong>Energy Match (20%):</strong> Matches task difficulty to your current energy</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-400">•</span>
            <span><strong>Morning Tasks (15%):</strong> Bonus if it's a morning task and still morning</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-400">•</span>
            <span><strong>BPT Bonus (Extra 25%):</strong> Huge boost if you're in your peak window</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold mb-2">Pro Tips:</h4>
        <ul class="text-sm text-slate-300 space-y-1">
          <li class="flex items-start gap-2">
            <span class="text-green-400">✓</span>
            <span>Log your energy regularly for better recommendations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-400">✓</span>
            <span>Set deadlines on tasks for urgency weighting</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-400">✓</span>
            <span>Use during your BPT for maximum productivity</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
