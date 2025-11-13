<script lang="ts">
  import { onMount } from 'svelte'
  import { getUserState } from '../lib/db/userState'
  import { getTasks } from '../lib/db/tasks'
  import { getTodaysPractices } from '../lib/db'
  import { generateDailyChallenges, checkChallengeCompletion } from '../lib/challenges'
  import type { Challenge, UserState, Task, Practice } from '../lib/types'

  let challenges: Challenge[] = []
  let userState: UserState | null = null
  let tasks: Task[] = []
  let practices: Practice[] = []

  onMount(async () => {
    await loadChallenges()
  })

  async function loadChallenges() {
    userState = await getUserState()
    tasks = await getTasks()
    practices = await getTodaysPractices()
    challenges = generateDailyChallenges()
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-900/30'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30'
      case 'hard': return 'text-red-400 bg-red-900/30'
      default: return 'text-slate-400 bg-slate-900/30'
    }
  }

  function getProgress(challenge: Challenge) {
    if (!userState) return { current: 0, total: 1 }
    return challenge.progress ? challenge.progress(userState, tasks, practices) : { current: 0, total: 1 }
  }

  function isComplete(challenge: Challenge) {
    if (!userState) return false
    return checkChallengeCompletion(challenge, userState, tasks, practices)
  }
</script>

<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-xl font-bold">Daily Challenges</h3>
      <p class="text-sm text-slate-400 mt-1">Resets at midnight</p>
    </div>
    <div class="text-3xl">🎯</div>
  </div>

  <div class="space-y-3">
    {#each challenges as challenge}
      {@const progress = getProgress(challenge)}
      {@const complete = isComplete(challenge)}
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 {complete ? 'border-green-500' : ''}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-start gap-3">
            <div class="text-2xl">{challenge.icon}</div>
            <div>
              <h4 class="font-bold">{challenge.name}</h4>
              <p class="text-sm text-slate-400">{challenge.description}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs px-2 py-1 rounded {getDifficultyColor(challenge.difficulty)} uppercase font-bold">
              {challenge.difficulty}
            </span>
            {#if complete}
              <span class="text-green-400 text-xl">✓</span>
            {/if}
          </div>
        </div>

        <div class="mb-2">
          <div class="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progress.current}/{progress.total}</span>
          </div>
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div
              class="{complete ? 'bg-green-500' : 'bg-blue-500'} h-2 rounded-full transition-all"
              style="width: {Math.min((progress.current / progress.total) * 100, 100)}%"
            />
          </div>
        </div>

        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-400">Reward:</span>
          <span class="text-yellow-400 font-bold">+{challenge.xpReward} XP</span>
        </div>
      </div>
    {/each}
  </div>
</div>
