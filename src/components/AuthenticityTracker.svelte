<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getAuthenticityLogs,
    getTodayAuthenticityLog,
    logAuthenticity,
    getAuthenticityStats,
    checkLowAuthenticityAlert,
    getAuthenticityTrend,
    getReflectionPrompts,
    COMMON_BODY_SIGNALS
  } from '../lib/db'
  import type { AuthenticityLog } from '../lib/types'

  let logs: AuthenticityLog[] = []
  let todayLog: AuthenticityLog | undefined
  let stats: any = null
  let alert: any = null
  let trend: 'improving' | 'stable' | 'declining' = 'stable'
  let reflectionPrompts: string[] = []

  // Form state
  let score = 7
  let boundariesHonored = 0
  let selectedBodySignals: string[] = []
  let notes = ''
  let showBodySignalPicker = false

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    logs = await getAuthenticityLogs()
    todayLog = await getTodayAuthenticityLog()
    stats = await getAuthenticityStats()
    alert = await checkLowAuthenticityAlert()
    trend = await getAuthenticityTrend()
    reflectionPrompts = await getReflectionPrompts()

    // Load today's data if exists
    if (todayLog) {
      score = todayLog.score
      boundariesHonored = todayLog.boundariesHonored
      selectedBodySignals = todayLog.bodySignals
      notes = todayLog.notes || ''
    }
  }

  async function handleSave() {
    await logAuthenticity(score, boundariesHonored, selectedBodySignals, notes.trim() || undefined)
    await loadData()
  }

  function toggleBodySignal(signal: string) {
    if (selectedBodySignals.includes(signal)) {
      selectedBodySignals = selectedBodySignals.filter(s => s !== signal)
    } else {
      selectedBodySignals = [...selectedBodySignals, signal]
    }
  }

  function getScoreColor(s: number): string {
    if (s >= 8) return 'text-green-400'
    if (s >= 7) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getScoreBgColor(s: number): string {
    if (s >= 8) return 'bg-green-500'
    if (s >= 7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  function getTrendIcon(t: string): string {
    if (t === 'improving') return '📈'
    if (t === 'declining') return '📉'
    return '➡️'
  }

  function getTrendColor(t: string): string {
    if (t === 'improving') return 'text-green-400'
    if (t === 'declining') return 'text-red-400'
    return 'text-slate-400'
  }

  $: sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-2">🌿 Authenticity Tracker</h2>
    <p class="text-slate-400">
      Track how true to yourself you're being. Authenticity prevents burnout.
    </p>
  </div>

  <!-- Low Authenticity Alert -->
  {#if alert && alert.shouldAlert}
    <div class="bg-red-900/30 border-2 border-red-600 rounded-lg p-4 mb-6 animate-pulse">
      <div class="flex items-start gap-3">
        <span class="text-3xl">⚠️</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-red-300 mb-1">Authenticity Alert: {alert.consecutiveLowDays} Days Below 7</h3>
          <p class="text-sm text-red-200 mb-2">
            Your authenticity scores have been low for {alert.consecutiveLowDays} consecutive days ({alert.lastLowScores.join(', ')}).
            This is a signal from your body and soul. It's time for reflection.
          </p>
          <div class="bg-red-900/50 rounded p-3 mt-3">
            <div class="font-medium text-red-200 mb-2">Gabor Maté's wisdom:</div>
            <p class="text-sm text-red-100 italic">
              "When we have been prevented from learning how to say no, our bodies may end up saying it for us."
            </p>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Stats Overview -->
  {#if stats}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 rounded-lg p-4">
        <div class="text-sm text-green-400 mb-1">Current Streak</div>
        <div class="text-3xl font-bold text-green-300">{stats.currentStreak}</div>
        <div class="text-xs text-slate-400 mt-1">days ≥ 7</div>
      </div>

      <div class="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-4">
        <div class="text-sm text-blue-400 mb-1">7-Day Average</div>
        <div class="text-3xl font-bold {getScoreColor(stats.last7DaysAverage)}">{stats.last7DaysAverage}</div>
        <div class="text-xs text-slate-400 mt-1">out of 10</div>
      </div>

      <div class="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-700 rounded-lg p-4">
        <div class="text-sm text-purple-400 mb-1">Boundaries Honored</div>
        <div class="text-3xl font-bold text-purple-300">{stats.totalBoundariesHonored}</div>
        <div class="text-xs text-slate-400 mt-1">total count</div>
      </div>

      <div class="bg-gradient-to-r from-amber-900/30 to-amber-800/30 border border-amber-700 rounded-lg p-4">
        <div class="text-sm text-amber-400 mb-1">Trend</div>
        <div class="text-3xl font-bold {getTrendColor(trend)}">{getTrendIcon(trend)}</div>
        <div class="text-xs text-slate-400 mt-1 capitalize">{trend}</div>
      </div>
    </div>
  {/if}

  <!-- Today's Check-In -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
    <h3 class="text-xl font-bold mb-4">Today's Authenticity Check-In</h3>

    <div class="space-y-6">
      <!-- Authenticity Score -->
      <div>
        <label class="block text-sm font-medium mb-3">
          How true to yourself were you today?
        </label>
        <div class="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            bind:value={score}
            class="flex-1"
          />
          <div class="text-4xl font-bold {getScoreColor(score)} w-16 text-center">
            {score}
          </div>
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-2">
          <span>Completely forced/inauthentic</span>
          <span>Completely authentic/aligned</span>
        </div>
        {#if score < 7}
          <div class="bg-yellow-900/20 border border-yellow-700/30 rounded p-3 mt-3 text-sm text-yellow-200">
            💡 Scores below 7 indicate you're pushing yourself in ways that don't align with your true self.
          </div>
        {/if}
      </div>

      <!-- Boundaries Honored -->
      <div>
        <label class="block text-sm font-medium mb-3">
          How many times did you honor your boundaries today?
        </label>
        <div class="flex items-center gap-4">
          <button
            on:click={() => boundariesHonored = Math.max(0, boundariesHonored - 1)}
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-xl"
          >
            −
          </button>
          <div class="text-4xl font-bold text-purple-400 w-24 text-center">
            {boundariesHonored}
          </div>
          <button
            on:click={() => boundariesHonored++}
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-xl"
          >
            +
          </button>
        </div>
        <div class="text-xs text-slate-400 mt-2">
          Times you said "no" to protect your energy, time, or values
        </div>
      </div>

      <!-- Body Signals -->
      <div>
        <label class="block text-sm font-medium mb-3">
          What did your body tell you today?
        </label>
        <button
          on:click={() => showBodySignalPicker = !showBodySignalPicker}
          class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-left hover:border-blue-500 transition-colors"
        >
          {#if selectedBodySignals.length > 0}
            <div class="flex flex-wrap gap-2">
              {#each selectedBodySignals as signal}
                <span class="px-2 py-1 bg-blue-600 rounded text-sm">{signal}</span>
              {/each}
            </div>
          {:else}
            <span class="text-slate-500">Select body signals...</span>
          {/if}
        </button>

        {#if showBodySignalPicker}
          <div class="mt-3 bg-slate-900 border border-slate-600 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div class="grid grid-cols-2 gap-2">
              {#each COMMON_BODY_SIGNALS as signal}
                <button
                  on:click={() => toggleBodySignal(signal)}
                  class="px-3 py-2 rounded text-sm text-left transition-colors {selectedBodySignals.includes(signal) ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}"
                >
                  {selectedBodySignals.includes(signal) ? '✓ ' : ''}{signal}
                </button>
              {/each}
            </div>
          </div>
        {/if}
        <div class="text-xs text-slate-400 mt-2">
          Your body speaks in symptoms. What is it trying to tell you?
        </div>
      </div>

      <!-- Reflection Notes -->
      <div>
        <label class="block text-sm font-medium mb-3">
          Reflection (optional)
        </label>
        <textarea
          bind:value={notes}
          rows="4"
          placeholder="What felt aligned today? What felt forced? What would authenticity look like tomorrow?"
          class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <button
        on:click={handleSave}
        class="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
      >
        {todayLog ? 'Update' : 'Save'} Today's Check-In
      </button>
    </div>
  </div>

  <!-- Reflection Prompts -->
  {#if reflectionPrompts.length > 0}
    <div class="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-700/50 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-3">💭 Reflection Prompts</h3>
      <div class="space-y-2">
        {#each reflectionPrompts as prompt}
          <div class="bg-slate-900/50 rounded-lg p-3 text-slate-300 italic">
            "{prompt}"
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Common Body Signals Insights -->
  {#if stats && stats.commonBodySignals.length > 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-4">🔍 Your Body's Patterns</h3>
      <p class="text-sm text-slate-400 mb-4">
        These are the signals your body most frequently sends you:
      </p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        {#each stats.commonBodySignals.slice(0, 6) as { signal, count }}
          <div class="bg-slate-900 rounded-lg p-3">
            <div class="font-medium text-blue-300 mb-1">{signal}</div>
            <div class="text-sm text-slate-500">{count} time{count !== 1 ? 's' : ''}</div>
          </div>
        {/each}
      </div>
      <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3 mt-4 text-sm text-blue-200">
        💡 Recurring physical symptoms are often your body's way of saying "Something needs to change."
      </div>
    </div>
  {/if}

  <!-- History -->
  {#if sortedLogs.length > 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 class="text-xl font-bold mb-4">History</h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-700">
              <th class="text-left py-2 px-3 text-sm font-medium text-slate-400">Date</th>
              <th class="text-center py-2 px-3 text-sm font-medium text-slate-400">Score</th>
              <th class="text-center py-2 px-3 text-sm font-medium text-slate-400">Boundaries</th>
              <th class="text-left py-2 px-3 text-sm font-medium text-slate-400">Body Signals</th>
              <th class="text-left py-2 px-3 text-sm font-medium text-slate-400">Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each sortedLogs.slice(0, 30) as log}
              <tr class="border-b border-slate-800 hover:bg-slate-750">
                <td class="py-3 px-3 text-sm">
                  {new Date(log.date).toLocaleDateString()}
                </td>
                <td class="py-3 px-3 text-center">
                  <span class="text-lg font-bold {getScoreColor(log.score)}">
                    {log.score}
                  </span>
                </td>
                <td class="py-3 px-3 text-center text-purple-400">
                  {log.boundariesHonored}
                </td>
                <td class="py-3 px-3 text-sm">
                  {#if log.bodySignals.length > 0}
                    <div class="flex flex-wrap gap-1">
                      {#each log.bodySignals.slice(0, 3) as signal}
                        <span class="px-2 py-0.5 bg-slate-700 rounded text-xs">
                          {signal}
                        </span>
                      {/each}
                      {#if log.bodySignals.length > 3}
                        <span class="px-2 py-0.5 bg-slate-700 rounded text-xs">
                          +{log.bodySignals.length - 3}
                        </span>
                      {/if}
                    </div>
                  {:else}
                    <span class="text-slate-600">None</span>
                  {/if}
                </td>
                <td class="py-3 px-3 text-sm text-slate-400 max-w-xs truncate">
                  {log.notes || '—'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Philosophy Card -->
  <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-3">📚 Gabor Maté on Authenticity</h3>
    <div class="space-y-3 text-sm text-slate-300">
      <p>
        <strong>The Authenticity Imperative:</strong> "Authenticity is the condition of being true to oneself,
        even at the risk of incurring the displeasure of others, rather than being an anxious imitation
        of what others are, or what they expect you to be."
      </p>
      <p>
        When we consistently suppress our authentic needs and feelings to please others,
        our bodies begin to speak for us through symptoms. Chronic stress, autoimmune conditions,
        and other illnesses often arise from this disconnection.
      </p>
      <div class="bg-slate-900/50 rounded p-3 mt-3">
        <div class="font-medium mb-2">The Three A's of Health:</div>
        <ul class="space-y-1 text-slate-400">
          <li>• <strong class="text-blue-300">Authenticity:</strong> Being true to yourself</li>
          <li>• <strong class="text-blue-300">Agency:</strong> Having control over your life</li>
          <li>• <strong class="text-blue-300">Attachment:</strong> Healthy relationships without self-abandonment</li>
        </ul>
      </div>
      <p class="text-xs text-slate-400 mt-3">
        <strong>Remember:</strong> A score of 7+ means you're honoring yourself. Consistently below 7 is a warning sign.
        Your body's symptoms are wisdom—listen to them.
      </p>
    </div>
  </div>
</div>
