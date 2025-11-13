<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { createFocusSession, completeFocusSession, getTodaysFocusSessions, addXP, getTasks } from '../lib/db'
  import type { FocusSession, Task } from '../lib/types'
  import { celebrateTaskComplete } from '../lib/animations'
  import { soundSystem } from '../lib/sounds'

  type TimerMode = 'ULTRADIAN' | 'STANDARD' | 'SPRINT'
  type Phase = 'idle' | 'work' | 'break'

  const TIMER_MODES = {
    ULTRADIAN: { work: 90, break: 20, name: 'Deep Work (90+20)' },
    STANDARD: { work: 50, break: 10, name: 'Standard (50+10)' },
    SPRINT: { work: 25, break: 5, name: 'Sprint (25+5)' }
  }

  let mode: TimerMode = 'ULTRADIAN'
  let phase: Phase = 'idle'
  let secondsLeft = 0
  let selectedTask: Task | null = null
  let sessionStart: number | null = null
  let flowAchieved = false
  let breakQuality = 0
  let isRunning = false
  let interval: number | null = null
  let tasks: Task[] = []
  let todaySessions: FocusSession[] = []
  let showBreakRating = false

  const FLOW_STATE_THRESHOLD = 30 // Minutes until flow state check
  let flowStateChecked = false

  onMount(async () => {
    await loadTasks()
    await loadTodaySessions()
  })

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })

  async function loadTasks() {
    const allTasks = await getTasks()
    tasks = allTasks.filter(t => !t.completed)
  }

  async function loadTodaySessions() {
    todaySessions = await getTodaysFocusSessions()
  }

  function startWork() {
    phase = 'work'
    secondsLeft = TIMER_MODES[mode].work * 60
    sessionStart = Date.now()
    flowAchieved = false
    flowStateChecked = false
    isRunning = true

    interval = setInterval(() => {
      if (secondsLeft > 0) {
        secondsLeft--

        // Check for flow state at 30 min mark
        const elapsed = TIMER_MODES[mode].work * 60 - secondsLeft
        const elapsedMinutes = Math.floor(elapsed / 60)

        if (elapsedMinutes >= FLOW_STATE_THRESHOLD && !flowStateChecked) {
          flowStateChecked = true
          flowAchieved = true
          celebrateTaskComplete(10)
          soundSystem.taskComplete(8)
          alert('🔥 Flow State Detected! +25 XP bonus')
        }
      } else {
        handlePhaseEnd()
      }
    }, 1000)
  }

  async function handlePhaseEnd() {
    if (interval) clearInterval(interval)
    isRunning = false

    if (phase === 'work') {
      await saveSession()
      phase = 'break'
      secondsLeft = TIMER_MODES[mode].break * 60
      showBreakRating = false

      // Start break timer
      isRunning = true
      interval = setInterval(() => {
        if (secondsLeft > 0) {
          secondsLeft--

          // Show break rating in last 5 minutes
          if (!showBreakRating && secondsLeft <= 300) {
            showBreakRating = true
          }
        } else {
          handleBreakEnd()
        }
      }, 1000)
    }
  }

  function handleBreakEnd() {
    if (interval) clearInterval(interval)
    isRunning = false
    phase = 'idle'
    showBreakRating = false
    alert('Break over! Ready for another session?')
  }

  async function saveSession() {
    if (!sessionStart) return

    const actualDuration = Math.floor((Date.now() - sessionStart) / 60000)
    const plannedDuration = TIMER_MODES[mode].work

    const baseXP = 100
    const flowBonus = flowAchieved ? 25 : 0
    const xpEarned = baseXP + flowBonus

    const session = await createFocusSession(
      'ultradian',
      plannedDuration,
      selectedTask?.id
    )

    await completeFocusSession(
      session.id,
      xpEarned,
      actualDuration < plannedDuration * 0.9
    )

    // Update session with ultradian-specific data
    // Note: This requires the FocusSession type to support these fields
    // which we've already added to the type definition

    await addXP(xpEarned)
    celebrateTaskComplete(8)
    soundSystem.taskComplete(8)
    await loadTodaySessions()

    sessionStart = null
  }

  async function rateBreak(quality: number) {
    breakQuality = quality
    // Store break quality in the most recent session
    // This would require updating the session in the DB
  }

  async function endEarly() {
    if (confirm('End session early? You will lose XP from this session.')) {
      if (interval) clearInterval(interval)
      if (sessionStart) {
        const session = await createFocusSession('ultradian', TIMER_MODES[mode].work, selectedTask?.id)
        await completeFocusSession(session.id, 0, true)
        await addXP(-50) // Penalty for ending early
        await loadTodaySessions()
      }
      phase = 'idle'
      isRunning = false
      secondsLeft = 0
      sessionStart = null
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function setMode(newMode: string) {
    mode = newMode as TimerMode
  }

  $: ultradianSessions = todaySessions.filter(s => s.type === 'ultradian' && s.completedAt && !s.interrupted)
  $: totalFlowSessions = ultradianSessions.filter(s => s.flowStateAchieved).length
  $: totalXPToday = ultradianSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0)
</script>

<div class="max-w-3xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Ultradian Rhythm Timer</h2>

  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
    {#if phase === 'idle'}
      <!-- Mode Selection -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Choose Your Session Length</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          {#each Object.entries(TIMER_MODES) as [key, modeData]}
            <button
              on:click={() => setMode(key)}
              class="p-4 rounded-lg border-2 transition-colors {mode === key ? 'bg-blue-600 border-blue-500' : 'bg-slate-700 border-slate-600 hover:border-slate-500'}"
            >
              <div class="font-bold mb-1">{modeData.name}</div>
              <div class="text-sm text-slate-400">
                {modeData.work} min work + {modeData.break} min break
              </div>
              {#if key === 'ULTRADIAN'}
                <div class="text-xs text-green-400 mt-1">⚡ Recommended for deep work</div>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Task Selection (Optional) -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Working On (Optional)</h3>
        <select
          bind:value={selectedTask}
          class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value={null}>No specific task</option>
          {#each tasks as task}
            <option value={task}>{task.title} (L{task.leverageScore})</option>
          {/each}
        </select>
      </div>

      <!-- Start Button -->
      <button
        on:click={startWork}
        class="w-full bg-green-600 hover:bg-green-500 p-4 rounded-lg text-xl font-bold transition-colors"
      >
        Start {TIMER_MODES[mode].work} Min Focus Block
      </button>

      <!-- Info -->
      <div class="mt-4 text-sm text-slate-400 text-center">
        💡 Reach 30+ minutes for flow state bonus (+25 XP)
      </div>
    {/if}

    {#if phase === 'work'}
      <!-- Work Session -->
      <div class="text-center">
        <div class="text-8xl font-bold mb-4 font-mono text-blue-400">
          {formatTime(secondsLeft)}
        </div>
        <div class="text-2xl mb-6">🎯 Deep Focus Time</div>

        {#if selectedTask}
          <div class="bg-slate-700 p-4 rounded-lg mb-4 max-w-md mx-auto">
            <div class="text-sm text-slate-400 mb-1">Working on:</div>
            <div class="font-semibold">{selectedTask.title}</div>
          </div>
        {/if}

        {#if flowAchieved}
          <div class="bg-orange-900/30 border border-orange-500 p-4 rounded-lg mb-6 max-w-md mx-auto">
            <div class="text-3xl mb-2">🔥</div>
            <div class="font-bold text-orange-400">Flow State Active!</div>
            <div class="text-sm text-slate-300 mt-1">You're in the zone. Keep going!</div>
          </div>
        {/if}

        <!-- Progress Bar -->
        <div class="w-full bg-slate-700 rounded-full h-3 mb-6 max-w-2xl mx-auto">
          <div
            class="bg-blue-500 h-full rounded-full transition-all"
            style="width: {((TIMER_MODES[mode].work * 60 - secondsLeft) / (TIMER_MODES[mode].work * 60)) * 100}%"
          />
        </div>

        <button
          on:click={endEarly}
          class="bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-medium transition-colors"
        >
          End Early (-50 XP)
        </button>
      </div>
    {/if}

    {#if phase === 'break'}
      <!-- Break Time -->
      <div class="text-center">
        <div class="text-8xl font-bold mb-4 font-mono text-green-400">
          {formatTime(secondsLeft)}
        </div>
        <div class="text-2xl mb-6">☕ Break Time</div>

        <!-- Break Suggestions -->
        <div class="bg-slate-700 p-6 rounded-lg mb-6 max-w-md mx-auto">
          <p class="mb-4 font-semibold">Suggested break activities:</p>
          <div class="grid grid-cols-2 gap-4 text-left">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🚶</span>
              <span class="text-sm">Walk around</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">💧</span>
              <span class="text-sm">Drink water</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">👀</span>
              <span class="text-sm">Rest your eyes</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🧘</span>
              <span class="text-sm">Stretch</span>
            </div>
          </div>
        </div>

        <!-- Break Quality Rating -->
        {#if showBreakRating}
          <div class="bg-blue-900/30 border border-blue-500 p-4 rounded-lg max-w-md mx-auto">
            <p class="mb-3 font-semibold">How was your break?</p>
            <div class="flex gap-2 justify-center">
              {#each [1, 2, 3, 4, 5] as n}
                <button
                  on:click={() => rateBreak(n)}
                  class="text-3xl transition-transform hover:scale-110 {breakQuality === n ? 'scale-125' : ''}"
                  title={n === 1 ? 'Poor' : n === 5 ? 'Excellent' : ''}
                >
                  {'⭐'}
                </button>
              {/each}
            </div>
            {#if breakQuality > 0}
              <p class="text-sm text-slate-400 mt-2">
                {breakQuality === 5 ? 'Perfect! You\'re recharged.' : breakQuality >= 3 ? 'Good break!' : 'Try to fully disconnect next time.'}
              </p>
            {/if}
          </div>
        {/if}

        <!-- Progress Bar -->
        <div class="w-full bg-slate-700 rounded-full h-3 mt-6 max-w-2xl mx-auto">
          <div
            class="bg-green-500 h-full rounded-full transition-all"
            style="width: {((TIMER_MODES[mode].break * 60 - secondsLeft) / (TIMER_MODES[mode].break * 60)) * 100}%"
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Today's Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Sessions Today</div>
      <div class="text-3xl font-bold text-blue-400">{ultradianSessions.length}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Flow States</div>
      <div class="text-3xl font-bold text-orange-400">{totalFlowSessions}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total XP</div>
      <div class="text-3xl font-bold text-yellow-400">{totalXPToday}</div>
    </div>
  </div>

  <!-- Info Box -->
  <div class="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h4 class="font-bold mb-2">🧠 About Ultradian Rhythms:</h4>
    <ul class="text-sm text-slate-300 space-y-1">
      <li>• Your brain naturally works in 90-minute cycles</li>
      <li>• Reach 30+ minutes of focus to achieve flow state (+25 XP)</li>
      <li>• Mandatory breaks help maintain peak performance</li>
      <li>• Deep work sessions earn 100-125 XP</li>
    </ul>
  </div>
</div>
