<script lang="ts">
  import { onMount } from 'svelte'
  import { getTodaysFocusSessions, getSettings } from '../lib/db'
  import type { FocusSession, AppSettings } from '../lib/types'
  import timerStore, { formattedTime, timerActions } from '../lib/timerStore'

  let settings: AppSettings | null = null
  let todaySessions: FocusSession[] = []

  let sessionLengths = {
    work: 25,
    short_break: 5,
    long_break: 15
  }

  onMount(async () => {
    settings = await getSettings()
    sessionLengths = {
      work: settings.pomodoroLength,
      short_break: settings.shortBreakLength,
      long_break: settings.longBreakLength
    }
    await loadTodaySessions()
  })

  async function loadTodaySessions() {
    todaySessions = await getTodaysFocusSessions()
  }

  function switchSession(type: 'work' | 'short_break' | 'long_break') {
    timerActions.switchType(type, sessionLengths[type])
  }

  function getProgressPercentage(): number {
    if (!$timerStore) return 0
    return (($timerStore.totalTime - $timerStore.timeRemaining) / $timerStore.totalTime) * 100
  }

  function getSessionColor(): string {
    if ($timerStore.type === 'work') return 'text-blue-400'
    if ($timerStore.type === 'long_break') return 'text-purple-400'
    return 'text-green-400'
  }

  function getSessionBgColor(): string {
    if ($timerStore.type === 'work') return 'bg-blue-500'
    if ($timerStore.type === 'long_break') return 'bg-purple-500'
    return 'bg-green-500'
  }

  $: sessionTitle = $timerStore.type === 'work' ? 'Focus Time' : $timerStore.type === 'short_break' ? 'Short Break' : 'Long Break'
  $: completedPomodoros = todaySessions.filter(s => s.type === 'pomodoro' && s.completedAt && !s.interrupted).length
</script>

<div class="max-w-2xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-3xl font-bold">Focus Timer</h2>
    {#if $timerStore.isRunning}
      <div class="bg-green-900/30 border border-green-600 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
        <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span class="text-green-300 font-semibold">Timer Running</span>
      </div>
    {/if}
  </div>

  <!-- Timer Card -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-6">
    <!-- Session Type Selector -->
    <div class="flex gap-2 mb-6 justify-center">
      <button
        class="px-4 py-2 rounded-lg font-medium transition-colors {$timerStore.type === 'work' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
        on:click={() => !$timerStore.isRunning && switchSession('work')}
        disabled={$timerStore.isRunning}
      >
        Pomodoro
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-colors {$timerStore.type === 'short_break' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
        on:click={() => !$timerStore.isRunning && switchSession('short_break')}
        disabled={$timerStore.isRunning}
      >
        Short Break
      </button>
      <button
        class="px-4 py-2 rounded-lg font-medium transition-colors {$timerStore.type === 'long_break' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}"
        on:click={() => !$timerStore.isRunning && switchSession('long_break')}
        disabled={$timerStore.isRunning}
      >
        Long Break
      </button>
    </div>

    <!-- Timer Display -->
    <div class="text-center mb-6">
      <h3 class="text-lg font-medium text-slate-400 mb-2">{sessionTitle}</h3>
      <div class="text-7xl font-bold {getSessionColor()} mb-4 font-mono">
        {$formattedTime}
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-slate-700 rounded-full h-2 mb-6">
        <div
          class="{getSessionBgColor()} h-2 rounded-full transition-all"
          style="width: {getProgressPercentage()}%"
        />
      </div>

      <!-- XP Indicator for Work Sessions -->
      {#if $timerStore.type === 'work' && !$timerStore.isRunning}
        <div class="text-sm text-yellow-400 mb-4">
          +100 XP upon completion
        </div>
      {/if}

      <!-- Background Running Indicator -->
      {#if $timerStore.isRunning}
        <div class="text-sm text-green-400 mb-4 flex items-center justify-center gap-2">
          <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Timer continues even if you switch pages or lock your screen</span>
        </div>
      {/if}
    </div>

    <!-- Controls -->
    <div class="flex gap-3 justify-center">
      {#if !$timerStore.isRunning && !$timerStore.isPaused}
        <button
          class="{getSessionBgColor()} hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold text-lg transition-opacity"
          on:click={timerActions.start}
        >
          Start
        </button>
      {/if}

      {#if $timerStore.isRunning}
        <button
          class="bg-yellow-600 hover:bg-yellow-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          on:click={timerActions.pause}
        >
          Pause
        </button>
      {/if}

      {#if $timerStore.isPaused}
        <button
          class="{getSessionBgColor()} hover:opacity-90 text-white px-8 py-3 rounded-lg font-bold text-lg transition-opacity"
          on:click={timerActions.resume}
        >
          Resume
        </button>
      {/if}

      {#if ($timerStore.isRunning || $timerStore.isPaused)}
        <button
          class="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          on:click={timerActions.stop}
        >
          Stop
        </button>
      {/if}
    </div>
  </div>

  <!-- Today's Stats -->
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Completed Pomodoros</div>
      <div class="text-3xl font-bold text-blue-400">{completedPomodoros}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total XP Earned</div>
      <div class="text-3xl font-bold text-yellow-400">{completedPomodoros * 100}</div>
    </div>
  </div>

  <!-- Info Box -->
  <div class="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h4 class="font-bold mb-2">🔔 How it works:</h4>
    <ul class="text-sm text-slate-300 space-y-1">
      <li>• Complete a {sessionLengths.work}-minute focus session to earn 100 XP</li>
      <li>• Take {sessionLengths.short_break}-minute breaks between sessions</li>
      <li>• After 4 sessions, take a {sessionLengths.long_break}-minute long break</li>
      <li>• Timer runs in the background - switch pages or lock your screen safely</li>
      <li>• You'll get a notification + vibration when timer completes</li>
      <li>• Grant notification permission for best experience</li>
    </ul>
  </div>
</div>
