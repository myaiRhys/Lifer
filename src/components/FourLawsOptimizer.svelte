<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  // Four Laws data structure
  export let fourLaws: {
    obvious: { score: number; cue?: string; time?: string; location?: string }
    attractive: { score: number; bundle?: string }
    easy: { score: number; frictionSteps: number; gateway?: string }
    satisfying: { score: number; reward?: string }
    totalScore: number
  } = {
    obvious: { score: 5, cue: '', time: '', location: '' },
    attractive: { score: 5, bundle: '' },
    easy: { score: 5, frictionSteps: 1, gateway: '' },
    satisfying: { score: 5, reward: '' },
    totalScore: 20
  }

  export let habitName: string = 'this habit'

  // Update total score whenever any law changes
  $: fourLaws.totalScore =
    fourLaws.obvious.score +
    fourLaws.attractive.score +
    fourLaws.easy.score +
    fourLaws.satisfying.score

  // Color coding for scores
  function getScoreColor(score: number): string {
    if (score >= 8) return 'text-green-400'
    if (score >= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  function getTotalScoreColor(total: number): string {
    if (total >= 32) return 'text-green-400' // 80%+
    if (total >= 24) return 'text-yellow-400' // 60%+
    return 'text-red-400'
  }

  // Suggestions based on current scores
  $: suggestions = {
    obvious: fourLaws.obvious.score < 8 ? [
      'Set a specific time and location for this habit',
      'Create a visual cue (e.g., lay out gym clothes the night before)',
      'Use implementation intention: "When [TIME/SITUATION], I will [HABIT]"',
      'Stack this habit after an existing one you never miss'
    ] : [],
    attractive: fourLaws.attractive.score < 8 ? [
      'Bundle this habit with something you enjoy (temptation bundling)',
      'Join a group where this behavior is normal',
      'Redesign the environment to make good choices easier',
      'Create a ritual that makes starting the habit enjoyable'
    ] : [],
    easy: fourLaws.easy.score < 8 ? [
      'Reduce friction: can you do this in 2 minutes or less?',
      'Prepare your environment to make the habit easier',
      `Current friction: ${fourLaws.easy.frictionSteps} steps. Can you reduce it?`,
      'Use the 2-minute rule: start with a gateway version of the habit'
    ] : [],
    satisfying: fourLaws.satisfying.score < 8 ? [
      'Add an immediate reward after completing the habit',
      'Track your progress visually (habit tracker, streak counter)',
      'Use a habit tracker that gives you a sense of accomplishment',
      'Celebrate small wins immediately after completion'
    ] : []
  }

  // 2-minute rule examples
  const twoMinuteExamples = {
    'Read 30 pages': 'Read 1 page',
    'Run 5km': 'Put on running shoes',
    'Study for 1 hour': 'Open textbook to right page',
    'Write 1000 words': 'Write 1 sentence',
    'Meditate 20 minutes': 'Sit on meditation cushion',
    'Do 30 pushups': 'Do 1 pushup',
    'Practice guitar 30 mins': 'Pick up guitar',
    'Clean entire house': 'Clean for 2 minutes'
  }

  function emitUpdate() {
    dispatch('update', fourLaws)
  }
</script>

<div class="space-y-6">
  <!-- Header with total score -->
  <div class="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xl font-bold">⚡ Four Laws Optimizer</h3>
      <div class="text-right">
        <div class="text-sm text-slate-400">Total Score</div>
        <div class="text-3xl font-bold {getTotalScoreColor(fourLaws.totalScore)}">
          {fourLaws.totalScore}/40
        </div>
        <div class="text-xs text-slate-500">Target: 32+ (80%)</div>
      </div>
    </div>
    <p class="text-sm text-slate-400">
      Optimize {habitName} using James Clear's Four Laws of Behavior Change
    </p>
  </div>

  <!-- Law 1: Make it Obvious -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-bold text-lg">1️⃣ Make it Obvious</h4>
      <span class="text-2xl font-bold {getScoreColor(fourLaws.obvious.score)}">
        {fourLaws.obvious.score}/10
      </span>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">
          Score (How obvious is the cue?)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          bind:value={fourLaws.obvious.score}
          on:change={emitUpdate}
          class="w-full"
        />
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>Hidden</span>
          <span>Impossible to miss</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Cue / Trigger
        </label>
        <input
          type="text"
          bind:value={fourLaws.obvious.cue}
          on:blur={emitUpdate}
          placeholder="What will remind you? (e.g., alarm, location, existing habit)"
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Time</label>
          <input
            type="text"
            bind:value={fourLaws.obvious.time}
            on:blur={emitUpdate}
            placeholder="e.g., 6:00 AM"
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            bind:value={fourLaws.obvious.location}
            on:blur={emitUpdate}
            placeholder="e.g., Kitchen table"
            class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {#if suggestions.obvious.length > 0}
        <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3">
          <div class="text-sm font-medium mb-2">💡 Suggestions to improve:</div>
          <ul class="text-xs text-slate-300 space-y-1">
            {#each suggestions.obvious as suggestion}
              <li>• {suggestion}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>

  <!-- Law 2: Make it Attractive -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-bold text-lg">2️⃣ Make it Attractive</h4>
      <span class="text-2xl font-bold {getScoreColor(fourLaws.attractive.score)}">
        {fourLaws.attractive.score}/10
      </span>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">
          Score (How appealing is this habit?)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          bind:value={fourLaws.attractive.score}
          on:change={emitUpdate}
          class="w-full"
        />
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>Dreading it</span>
          <span>Can't wait</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Temptation Bundling
        </label>
        <input
          type="text"
          bind:value={fourLaws.attractive.bundle}
          on:blur={emitUpdate}
          placeholder="Pair with something you enjoy (e.g., 'Only listen to podcast while exercising')"
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {#if suggestions.attractive.length > 0}
        <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3">
          <div class="text-sm font-medium mb-2">💡 Suggestions to improve:</div>
          <ul class="text-xs text-slate-300 space-y-1">
            {#each suggestions.attractive as suggestion}
              <li>• {suggestion}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>

  <!-- Law 3: Make it Easy -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-bold text-lg">3️⃣ Make it Easy</h4>
      <span class="text-2xl font-bold {getScoreColor(fourLaws.easy.score)}">
        {fourLaws.easy.score}/10
      </span>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">
          Score (How easy is it to start?)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          bind:value={fourLaws.easy.score}
          on:change={emitUpdate}
          class="w-full"
        />
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>Many obstacles</span>
          <span>Effortless</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Friction Steps (How many steps to start?)
        </label>
        <input
          type="number"
          min="1"
          max="20"
          bind:value={fourLaws.easy.frictionSteps}
          on:change={emitUpdate}
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
        />
        <p class="text-xs text-slate-400 mt-1">
          Example: "Go to gym" = 10 steps (change clothes, pack bag, drive, park, etc.)
          Lower is better!
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          2-Minute Gateway Version
        </label>
        <input
          type="text"
          bind:value={fourLaws.easy.gateway}
          on:blur={emitUpdate}
          placeholder="What's the 2-minute version? (e.g., 'Put on running shoes')"
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
        />
        <div class="mt-2 text-xs">
          <div class="font-medium text-slate-300 mb-1">Examples:</div>
          <div class="grid grid-cols-2 gap-1 text-slate-400">
            {#each Object.entries(twoMinuteExamples).slice(0, 4) as [full, gateway]}
              <div>"{full}" → "{gateway}"</div>
            {/each}
          </div>
        </div>
      </div>

      {#if suggestions.easy.length > 0}
        <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3">
          <div class="text-sm font-medium mb-2">💡 Suggestions to improve:</div>
          <ul class="text-xs text-slate-300 space-y-1">
            {#each suggestions.easy as suggestion}
              <li>• {suggestion}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>

  <!-- Law 4: Make it Satisfying -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-bold text-lg">4️⃣ Make it Satisfying</h4>
      <span class="text-2xl font-bold {getScoreColor(fourLaws.satisfying.score)}">
        {fourLaws.satisfying.score}/10
      </span>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-sm font-medium mb-1">
          Score (How rewarding is completion?)
        </label>
        <input
          type="range"
          min="1"
          max="10"
          bind:value={fourLaws.satisfying.score}
          on:change={emitUpdate}
          class="w-full"
        />
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>No payoff</span>
          <span>Instant gratification</span>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">
          Immediate Reward
        </label>
        <input
          type="text"
          bind:value={fourLaws.satisfying.reward}
          on:blur={emitUpdate}
          placeholder="What reward happens immediately? (e.g., 'Check off streak', 'Post to social')"
          class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {#if suggestions.satisfying.length > 0}
        <div class="bg-blue-900/20 border border-blue-700/30 rounded p-3">
          <div class="text-sm font-medium mb-2">💡 Suggestions to improve:</div>
          <ul class="text-xs text-slate-300 space-y-1">
            {#each suggestions.satisfying as suggestion}
              <li>• {suggestion}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </div>

  <!-- Summary Card -->
  <div class="bg-gradient-to-r from-slate-800 to-slate-700 border-2 {fourLaws.totalScore >= 32 ? 'border-green-500' : fourLaws.totalScore >= 24 ? 'border-yellow-500' : 'border-red-500'} rounded-lg p-4">
    <h4 class="font-bold mb-3">📊 Optimization Summary</h4>

    <div class="grid grid-cols-4 gap-2 mb-4">
      <div class="text-center">
        <div class="text-xs text-slate-400">Obvious</div>
        <div class="text-lg font-bold {getScoreColor(fourLaws.obvious.score)}">
          {fourLaws.obvious.score}
        </div>
      </div>
      <div class="text-center">
        <div class="text-xs text-slate-400">Attractive</div>
        <div class="text-lg font-bold {getScoreColor(fourLaws.attractive.score)}">
          {fourLaws.attractive.score}
        </div>
      </div>
      <div class="text-center">
        <div class="text-xs text-slate-400">Easy</div>
        <div class="text-lg font-bold {getScoreColor(fourLaws.easy.score)}">
          {fourLaws.easy.score}
        </div>
      </div>
      <div class="text-center">
        <div class="text-xs text-slate-400">Satisfying</div>
        <div class="text-lg font-bold {getScoreColor(fourLaws.satisfying.score)}">
          {fourLaws.satisfying.score}
        </div>
      </div>
    </div>

    <div class="bg-slate-900/50 rounded-lg p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium">Overall Habit Strength</span>
        <span class="text-xl font-bold {getTotalScoreColor(fourLaws.totalScore)}">
          {Math.round((fourLaws.totalScore / 40) * 100)}%
        </span>
      </div>
      <div class="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-500 {fourLaws.totalScore >= 32 ? 'bg-green-500' : fourLaws.totalScore >= 24 ? 'bg-yellow-500' : 'bg-red-500'}"
          style="width: {(fourLaws.totalScore / 40) * 100}%"
        />
      </div>
      <p class="text-xs text-slate-400 mt-2">
        {#if fourLaws.totalScore >= 32}
          ✨ Excellent! This habit is optimized for success.
        {:else if fourLaws.totalScore >= 24}
          💪 Good foundation. Review suggestions above to strengthen.
        {:else}
          ⚠️ This habit needs optimization. Focus on the lowest-scoring laws.
        {/if}
      </p>
    </div>
  </div>

  <!-- Educational Note -->
  <div class="bg-blue-900/10 border border-blue-700/30 rounded-lg p-3">
    <p class="text-sm text-slate-300">
      <strong>💡 The Four Laws:</strong> Every habit follows a pattern: Cue → Craving → Response → Reward.
      The Four Laws help you design each stage for maximum success. Aim for 32+ points (80%) for habits that stick.
    </p>
  </div>
</div>
