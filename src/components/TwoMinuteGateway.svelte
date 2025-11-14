<script lang="ts">
  import { onMount } from 'svelte'
  import { getPractices, getGatewayAnalytics, type GatewayStats, getPracticeGatewayStats } from '../lib/db'
  import type { Practice } from '../lib/types'

  let practices: Practice[] = []
  let analytics: {
    practicesWithGateway: number
    totalCompletions: number
    totalGatewayCompletions: number
    totalFullCompletions: number
    overallGatewayPercentage: number
    streaksSavedByGateway: number
  } = {
    practicesWithGateway: 0,
    totalCompletions: 0,
    totalGatewayCompletions: 0,
    totalFullCompletions: 0,
    overallGatewayPercentage: 0,
    streaksSavedByGateway: 0
  }

  let practiceStats: Map<string, GatewayStats> = new Map()

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    practices = await getPractices()
    analytics = await getGatewayAnalytics()

    // Load individual practice stats
    for (const practice of practices) {
      if (practice.gatewayVersion) {
        const stats = await getPracticeGatewayStats(practice.id)
        if (stats) {
          practiceStats.set(practice.id, stats)
        }
      }
    }
    practiceStats = practiceStats // Trigger reactivity
  }

  function getLastCompletionBadge(completionType?: 'gateway' | 'intermediate' | 'full'): string {
    if (!completionType) return ''
    if (completionType === 'gateway') return '⚡'
    if (completionType === 'full') return '✓'
    return '◐'
  }

  $: practicesWithGateway = practices.filter(p => p.gatewayVersion)
  $: practicesWithoutGateway = practices.filter(p => !p.gatewayVersion)
</script>

<div class="max-w-6xl mx-auto">
  <div class="mb-6">
    <h2 class="text-3xl font-bold mb-2">⚡ 2-Minute Rule Gateway</h2>
    <p class="text-slate-400">
      Shrink habits to 2-minute versions. Lower the barrier, maintain the streak.
    </p>
  </div>

  <!-- Overall Analytics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700 rounded-lg p-4">
      <div class="text-sm text-amber-400 mb-1">Practices with Gateway</div>
      <div class="text-3xl font-bold text-amber-300">{analytics.practicesWithGateway}</div>
      <div class="text-xs text-slate-400 mt-1">out of {practices.length}</div>
    </div>

    <div class="bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-700 rounded-lg p-4">
      <div class="text-sm text-green-400 mb-1">Streaks Saved</div>
      <div class="text-3xl font-bold text-green-300">{analytics.streaksSavedByGateway}</div>
      <div class="text-xs text-slate-400 mt-1">gateway completions</div>
    </div>

    <div class="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-4">
      <div class="text-sm text-blue-400 mb-1">Gateway Usage</div>
      <div class="text-3xl font-bold text-blue-300">{analytics.overallGatewayPercentage}%</div>
      <div class="text-xs text-slate-400 mt-1">of all completions</div>
    </div>

    <div class="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-700 rounded-lg p-4">
      <div class="text-sm text-purple-400 mb-1">Total Completions</div>
      <div class="text-3xl font-bold text-purple-300">{analytics.totalCompletions}</div>
      <div class="text-xs text-slate-400 mt-1">{analytics.totalGatewayCompletions} gateway · {analytics.totalFullCompletions} full</div>
    </div>
  </div>

  <!-- Philosophy Card -->
  <div class="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-6 mb-6">
    <h3 class="text-xl font-bold mb-3">📚 The 2-Minute Rule</h3>
    <div class="space-y-3 text-sm text-slate-300">
      <p>
        <strong>James Clear's insight:</strong> "When you start a new habit, it should take less than two minutes to do."
      </p>
      <p>
        The key is to <strong>standardize before you optimize</strong>. You can't improve a habit that doesn't exist.
      </p>
      <div class="bg-slate-900/50 rounded p-3 mt-3">
        <div class="font-medium mb-2">Examples of Gateway Habits:</div>
        <ul class="space-y-1 text-slate-400">
          <li>• "Read 30 pages" → "Read one page"</li>
          <li>• "Run 5 miles" → "Put on running shoes"</li>
          <li>• "Meditate 20 minutes" → "Sit and breathe for 2 minutes"</li>
          <li>• "Journal 3 pages" → "Write one sentence"</li>
          <li>• "Study for 1 hour" → "Open textbook to right page"</li>
        </ul>
      </div>
      <p class="text-xs text-slate-400 mt-3">
        <strong>Pro tip:</strong> On tough days, completing the gateway version still counts for your streak.
        The goal is to keep showing up, even in the smallest way.
      </p>
    </div>
  </div>

  <!-- Practices with Gateway -->
  {#if practicesWithGateway.length > 0}
    <div class="mb-8">
      <h3 class="text-xl font-bold mb-4">Practices with 2-Minute Gateway</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each practicesWithGateway as practice}
          {@const stats = practiceStats.get(practice.id)}
          <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h4 class="font-semibold text-lg mb-1">
                  {practice.name}
                  {#if practice.lastCompletionType}
                    <span class="text-lg ml-1" title="Last completion type">
                      {getLastCompletionBadge(practice.lastCompletionType)}
                    </span>
                  {/if}
                </h4>
                <div class="text-sm text-slate-400">
                  <div><strong>Full:</strong> {practice.target} {practice.unit}</div>
                  {#if practice.gatewayVersion}
                    <div class="text-amber-400">
                      <strong>⚡ Gateway:</strong> {practice.gatewayVersion.name}
                    </div>
                  {/if}
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-2xl font-bold text-green-400">{practice.currentStreak}</div>
                <div class="text-xs text-slate-400">day streak</div>
              </div>
            </div>

            {#if stats}
              <!-- Completion Stats -->
              <div class="bg-slate-900/50 rounded-lg p-3 mb-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-slate-400">Completion Breakdown</span>
                  <span class="text-sm font-medium text-amber-400">{stats.gatewayPercentage}% gateway</span>
                </div>
                <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div class="h-full flex">
                    <div
                      class="bg-amber-500"
                      style="width: {stats.gatewayPercentage}%"
                      title="Gateway completions"
                    />
                    <div
                      class="bg-blue-500"
                      style="width: {100 - stats.gatewayPercentage}%"
                      title="Full completions"
                    />
                  </div>
                </div>
                <div class="flex justify-between text-xs text-slate-400 mt-2">
                  <span>⚡ {stats.gatewayCompletions} gateway</span>
                  <span>✓ {stats.fullCompletions} full</span>
                </div>
              </div>

              <!-- Streak Impact -->
              {#if practice.currentStreak > 0 && stats.gatewayCompletions > 0}
                <div class="bg-green-900/20 border border-green-700/30 rounded p-2 text-xs text-green-300">
                  💪 Gateway helped maintain your {practice.currentStreak}-day streak
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Practices without Gateway (suggestions) -->
  {#if practicesWithoutGateway.length > 0}
    <div>
      <h3 class="text-xl font-bold mb-4">Practices Without Gateway (Add One!)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each practicesWithoutGateway as practice}
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
            <h4 class="font-semibold mb-2">{practice.name}</h4>
            <div class="text-sm text-slate-400 mb-3">
              Target: {practice.target} {practice.unit}
            </div>
            <div class="bg-amber-900/20 border border-amber-700/30 rounded p-2 text-xs mb-3">
              <div class="text-amber-400 font-medium mb-1">💡 Suggested Gateway:</div>
              <div class="text-slate-300">
                {#if practice.name.toLowerCase().includes('meditate')}
                  "Sit and breathe for 2 min"
                {:else if practice.name.toLowerCase().includes('gym') || practice.name.toLowerCase().includes('workout')}
                  "Put on workout clothes"
                {:else if practice.name.toLowerCase().includes('journal')}
                  "Write one sentence"
                {:else if practice.name.toLowerCase().includes('read')}
                  "Read one page"
                {:else}
                  "{practice.name} (2-min version)"
                {/if}
              </div>
            </div>
            <a
              href="#practices"
              class="block text-center text-sm text-amber-400 hover:text-amber-300"
            >
              Add Gateway →
            </a>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Success Insights -->
  {#if analytics.totalCompletions > 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mt-6">
      <h3 class="text-xl font-bold mb-4">📊 Gateway Insights</h3>
      <div class="space-y-4 text-sm">
        {#if analytics.overallGatewayPercentage > 0 && analytics.overallGatewayPercentage < 20}
          <div class="bg-green-900/20 border border-green-700/30 rounded p-3">
            <div class="font-medium text-green-300 mb-1">✅ Perfect Balance</div>
            <div class="text-slate-300">
              You're using gateway versions {analytics.overallGatewayPercentage}% of the time.
              This is ideal - gateway is a rescue tool for tough days, not the default.
            </div>
          </div>
        {:else if analytics.overallGatewayPercentage >= 20 && analytics.overallGatewayPercentage < 40}
          <div class="bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
            <div class="font-medium text-yellow-300 mb-1">⚠️ High Gateway Usage</div>
            <div class="text-slate-300">
              You're completing gateway versions {analytics.overallGatewayPercentage}% of the time.
              Consider: Are your full practice targets too ambitious? Gateway should be 10-20% of completions.
            </div>
          </div>
        {:else if analytics.overallGatewayPercentage >= 40}
          <div class="bg-red-900/20 border border-red-700/30 rounded p-3">
            <div class="font-medium text-red-300 mb-1">🚨 Gateway Overuse</div>
            <div class="text-slate-300">
              Gateway versions are {analytics.overallGatewayPercentage}% of your completions.
              You may be avoiding the full practice. Consider making the gateway your new "full" practice,
              and create a more ambitious version as a stretch goal.
            </div>
          </div>
        {:else}
          <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3">
            <div class="font-medium text-blue-300 mb-1">ℹ️ Gateway Available</div>
            <div class="text-slate-300">
              You haven't used gateway versions yet. When life gets tough, remember:
              completing the 2-minute version still counts for your streak!
            </div>
          </div>
        {/if}

        {#if analytics.streaksSavedByGateway > 0}
          <div class="bg-green-900/20 border border-green-700/30 rounded p-3">
            <div class="font-medium text-green-300 mb-1">💪 Streaks Protected</div>
            <div class="text-slate-300">
              Gateway versions have helped protect approximately <strong>{analytics.streaksSavedByGateway} days</strong> of your streaks.
              This is exactly what the 2-Minute Rule is for - showing up on hard days.
            </div>
          </div>
        {/if}

        {#if practicesWithoutGateway.length === practices.length && practices.length > 0}
          <div class="bg-amber-900/20 border border-amber-700/30 rounded p-3">
            <div class="font-medium text-amber-300 mb-1">💡 Get Started</div>
            <div class="text-slate-300">
              None of your practices have gateway versions yet. Go to the Practices tab
              and click "Add 2-minute gateway version" on any practice to get started.
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Educational Note -->
  <div class="bg-blue-900/10 border border-blue-700/30 rounded-lg p-4 mt-6">
    <h4 class="font-bold mb-2">💡 Why This Works</h4>
    <p class="text-sm text-slate-300 mb-2">
      The 2-Minute Rule works because:
    </p>
    <ul class="text-sm text-slate-300 space-y-1 list-disc list-inside">
      <li><strong>Lower activation energy:</strong> Starting is always the hardest part</li>
      <li><strong>Builds identity:</strong> Even a 2-minute meditation makes you "someone who meditates"</li>
      <li><strong>Prevents the spiral:</strong> One miss is an accident, two misses is a new habit (in the wrong direction)</li>
      <li><strong>Creates momentum:</strong> Once you start, you often continue beyond 2 minutes</li>
    </ul>
    <p class="text-sm text-slate-400 mt-3">
      <strong>Remember:</strong> You can't improve a habit that doesn't exist.
      Standardize before you optimize. Show up, even if it's just for 2 minutes.
    </p>
  </div>
</div>
