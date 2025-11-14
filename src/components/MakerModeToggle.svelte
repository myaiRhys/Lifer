<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import {
    getCurrentMode,
    getCurrentMakerModeSession,
    startMakerModeSession,
    endCurrentSession,
    switchMode,
    getMakerModeStats,
    getTodaySessions,
    getMakerModePreferences,
    updateMakerModePreferences,
    calculateMeetingCost,
    suggestMeetingTimes,
    incrementTasksCompleted,
    logInterruption
  } from '../lib/db'
  import type { MakerMode, MakerModeSession, MakerModeStats, MakerModePreferences } from '../lib/types'

  let currentMode: MakerMode = 'maker'
  let activeSession: MakerModeSession | null = null
  let stats: MakerModeStats | null = null
  let todaySessions: MakerModeSession[] = []
  let preferences: MakerModePreferences | null = null

  // UI state
  let showPreferences = false
  let showMeetingCalculator = false
  let meetingDuration = 60
  let sessionElapsedMinutes = 0
  let updateInterval: number

  // End session modal
  let showEndSessionModal = false
  let endProductivityRating = 5
  let endNotes = ''

  onMount(async () => {
    await loadData()

    // Update elapsed time every minute
    updateInterval = window.setInterval(() => {
      if (activeSession && !activeSession.endTime) {
        const elapsed = Math.floor(
          (Date.now() - new Date(activeSession.startTime).getTime()) / 60000
        )
        sessionElapsedMinutes = elapsed
      }
    }, 60000) // Update every minute
  })

  onDestroy(() => {
    if (updateInterval) clearInterval(updateInterval)
  })

  async function loadData() {
    currentMode = await getCurrentMode()
    activeSession = await getCurrentMakerModeSession()
    stats = await getMakerModeStats()
    todaySessions = await getTodaySessions()
    preferences = await getMakerModePreferences()

    if (activeSession && !activeSession.endTime) {
      sessionElapsedMinutes = Math.floor(
        (Date.now() - new Date(activeSession.startTime).getTime()) / 60000
      )
    }
  }

  async function handleSwitchMode() {
    const newMode: MakerMode = currentMode === 'maker' ? 'manager' : 'maker'
    await switchMode(newMode)
    await loadData()
  }

  async function handleStartSession(mode: MakerMode) {
    await startMakerModeSession(mode)
    await loadData()
  }

  function openEndSessionModal() {
    showEndSessionModal = true
  }

  async function handleEndSession() {
    await endCurrentSession(endProductivityRating, endNotes)

    // Reset form
    endProductivityRating = 5
    endNotes = ''
    showEndSessionModal = false

    await loadData()
  }

  async function handleIncrementTasks() {
    await incrementTasksCompleted()
    await loadData()
  }

  async function handleLogInterruption() {
    await logInterruption()
    await loadData()
  }

  async function handleUpdatePreferences() {
    if (!preferences) return
    await updateMakerModePreferences(preferences)
    showPreferences = false
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  $: meetingCost = currentMode ? calculateMeetingCost(meetingDuration, currentMode) : null
  $: recommendedDuration = preferences ? (currentMode === 'maker' ? preferences.makerBlockDuration : preferences.managerSlotDuration) : 180
</script>

<div class="max-w-6xl mx-auto space-y-6">
  <!-- Header with Mode Toggle -->
  <div class="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700 rounded-lg p-6">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h2 class="text-3xl font-bold mb-2">Maker/Manager Mode</h2>
        <p class="text-lg text-indigo-200 mb-3">
          "The manager's schedule is for bosses. The maker's schedule is for makers."
        </p>
        <p class="text-sm text-slate-400">— Paul Graham, Y Combinator</p>
      </div>

      <!-- Current Mode Indicator -->
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center min-w-[200px]">
        <div class="text-sm text-slate-400 mb-1">Current Mode</div>
        <div class="text-3xl font-bold {currentMode === 'maker' ? 'text-purple-400' : 'text-blue-400'} mb-2">
          {currentMode === 'maker' ? '⚙️ Maker' : '📅 Manager'}
        </div>
        <button
          class="px-4 py-2 bg-gradient-to-r {currentMode === 'maker' ? 'from-blue-600 to-blue-500' : 'from-purple-600 to-purple-500'} hover:opacity-90 rounded-lg font-medium transition-all"
          on:click={handleSwitchMode}
        >
          Switch to {currentMode === 'maker' ? 'Manager' : 'Maker'}
        </button>
      </div>
    </div>
  </div>

  <!-- Active Session -->
  {#if activeSession}
    <div class="bg-slate-800 border-2 {currentMode === 'maker' ? 'border-purple-600' : 'border-blue-600'} rounded-lg p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{currentMode === 'maker' ? '⚙️' : '📅'}</span>
            <h3 class="text-xl font-bold">Active {currentMode === 'maker' ? 'Maker' : 'Manager'} Session</h3>
          </div>
          <div class="text-slate-400">Started at {formatTime(activeSession.startTime)}</div>
        </div>

        <div class="text-right">
          <div class="text-3xl font-bold {currentMode === 'maker' ? 'text-purple-400' : 'text-blue-400'}">
            {formatDuration(sessionElapsedMinutes)}
          </div>
          <div class="text-sm text-slate-400">elapsed</div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div class="bg-slate-700 rounded-lg p-3">
          <div class="text-sm text-slate-400 mb-1">Tasks Completed</div>
          <div class="text-2xl font-bold text-green-400">{activeSession.tasksCompleted}</div>
          <button
            class="mt-2 text-xs px-2 py-1 bg-green-600 hover:bg-green-500 rounded"
            on:click={handleIncrementTasks}
          >
            + Add Task
          </button>
        </div>

        <div class="bg-slate-700 rounded-lg p-3">
          <div class="text-sm text-slate-400 mb-1">Interruptions</div>
          <div class="text-2xl font-bold text-red-400">{activeSession.interruptions}</div>
          <button
            class="mt-2 text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
            on:click={handleLogInterruption}
          >
            + Log Interruption
          </button>
        </div>

        <div class="bg-slate-700 rounded-lg p-3">
          <div class="text-sm text-slate-400 mb-1">Recommended</div>
          <div class="text-2xl font-bold text-yellow-400">{formatDuration(recommendedDuration)}</div>
          <div class="text-xs text-slate-500 mt-1">
            {currentMode === 'maker' ? '3-hour' : '1-hour'} block
          </div>
        </div>
      </div>

      <button
        class="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
        on:click={openEndSessionModal}
      >
        End Session
      </button>
    </div>
  {:else}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div class="text-center py-8">
        <div class="text-5xl mb-4">💤</div>
        <div class="text-xl font-semibold mb-2">No Active Session</div>
        <div class="text-slate-400 mb-4">Start a maker or manager session to begin tracking</div>

        <div class="flex gap-3 justify-center">
          <button
            class="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
            on:click={() => handleStartSession('maker')}
          >
            ⚙️ Start Maker Session
          </button>
          <button
            class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            on:click={() => handleStartSession('manager')}
          >
            📅 Start Manager Session
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Stats Dashboard -->
  {#if stats}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4">Your Statistics</h3>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
          <div class="text-sm text-purple-300 mb-1">Maker Time</div>
          <div class="text-2xl font-bold text-purple-400">{formatDuration(stats.totalMakerMinutes)}</div>
          <div class="text-xs text-purple-300 mt-1">{stats.makerSessionsCount} sessions</div>
        </div>

        <div class="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div class="text-sm text-blue-300 mb-1">Manager Time</div>
          <div class="text-2xl font-bold text-blue-400">{formatDuration(stats.totalManagerMinutes)}</div>
          <div class="text-xs text-blue-300 mt-1">{stats.managerSessionsCount} sessions</div>
        </div>

        <div class="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div class="text-sm text-green-300 mb-1">Deep Work Streak</div>
          <div class="text-2xl font-bold text-green-400">{stats.deepWorkStreak}</div>
          <div class="text-xs text-green-300 mt-1">days with 3+ hrs maker</div>
        </div>

        <div class="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
          <div class="text-sm text-yellow-300 mb-1">Longest Block</div>
          <div class="text-2xl font-bold text-yellow-400">{formatDuration(stats.longestMakerBlock)}</div>
          <div class="text-xs text-yellow-300 mt-1">maker session</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="bg-slate-700 rounded-lg p-4">
          <div class="text-sm text-slate-400 mb-2">Maker Productivity</div>
          <div class="flex items-baseline gap-2">
            <div class="text-3xl font-bold text-purple-400">{stats.avgMakerProductivity.toFixed(1)}</div>
            <div class="text-slate-400">/10</div>
          </div>
        </div>

        <div class="bg-slate-700 rounded-lg p-4">
          <div class="text-sm text-slate-400 mb-2">Manager Productivity</div>
          <div class="flex items-baseline gap-2">
            <div class="text-3xl font-bold text-blue-400">{stats.avgManagerProductivity.toFixed(1)}</div>
            <div class="text-slate-400">/10</div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Meeting Cost Calculator -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold">Meeting Cost Calculator</h3>
      <button
        class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        on:click={() => showMeetingCalculator = !showMeetingCalculator}
      >
        {showMeetingCalculator ? 'Hide' : 'Show'}
      </button>
    </div>

    {#if showMeetingCalculator}
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Meeting Duration (minutes)</label>
          <input
            type="range"
            bind:value={meetingDuration}
            min="15"
            max="240"
            step="15"
            class="w-full"
          />
          <div class="flex justify-between text-sm text-slate-400 mt-1">
            <span>15 min</span>
            <span class="font-semibold">{meetingDuration} minutes</span>
            <span>4 hours</span>
          </div>
        </div>

        {#if meetingCost}
          <div class="bg-{currentMode === 'maker' ? 'red' : 'blue'}-900/20 border border-{currentMode === 'maker' ? 'red' : 'blue'}-700 rounded-lg p-4">
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div class="text-sm text-slate-400 mb-1">Fragmented Blocks</div>
                <div class="text-2xl font-bold {currentMode === 'maker' ? 'text-red-400' : 'text-blue-400'}">
                  {meetingCost.fragmentedBlocks}
                </div>
              </div>

              <div>
                <div class="text-sm text-slate-400 mb-1">Lost Productivity</div>
                <div class="text-2xl font-bold {currentMode === 'maker' ? 'text-red-400' : 'text-blue-400'}">
                  ~{meetingCost.lostProductivityMinutes} min
                </div>
              </div>
            </div>

            <div class="text-sm bg-slate-800 rounded p-3">
              <div class="font-semibold mb-1">💡 Suggestion</div>
              <div class="text-slate-300">{meetingCost.suggestion}</div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Today's Sessions -->
  {#if todaySessions.length > 0}
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 class="text-xl font-bold mb-4">Today's Sessions ({todaySessions.length})</h3>

      <div class="space-y-2">
        {#each todaySessions.filter(s => s.endTime) as session}
          <div class="bg-slate-700 border border-slate-600 rounded-lg p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xl">{session.mode === 'maker' ? '⚙️' : '📅'}</span>
                  <span class="font-semibold capitalize">{session.mode} Session</span>
                </div>
                <div class="text-sm text-slate-400">
                  {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : 'Active'}
                </div>
              </div>

              <div class="text-right">
                <div class="text-xl font-bold {session.mode === 'maker' ? 'text-purple-400' : 'text-blue-400'}">
                  {formatDuration(session.durationMinutes || 0)}
                </div>
                <div class="text-sm text-slate-400 mt-1">
                  {session.tasksCompleted} tasks · {session.interruptions} interruptions
                </div>
                {#if session.productivityRating}
                  <div class="text-sm text-yellow-400 mt-1">
                    {'⭐'.repeat(Math.round(session.productivityRating / 2))} {session.productivityRating}/10
                  </div>
                {/if}
              </div>
            </div>

            {#if session.notes}
              <div class="mt-2 text-sm text-slate-300 bg-slate-800 rounded p-2">
                {session.notes}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Educational Content -->
  <div class="bg-gradient-to-r from-indigo-900/30 to-blue-900/30 border border-indigo-700 rounded-lg p-6">
    <h3 class="text-xl font-bold mb-3">Understanding Maker vs Manager Schedules</h3>

    <div class="space-y-4 text-sm">
      <div>
        <div class="font-semibold text-indigo-300 mb-1">⚙️ The Maker's Schedule</div>
        <div class="text-slate-300">
          Makers (programmers, writers, designers) need long, uninterrupted blocks of time to do creative work.
          A single meeting can fragment an entire afternoon into unusable pieces. Makers work best in
          3-4 hour blocks where they can achieve deep focus and flow states.
        </div>
      </div>

      <div>
        <div class="font-semibold text-indigo-300 mb-1">📅 The Manager's Schedule</div>
        <div class="text-slate-300">
          Managers operate on 1-hour time slots. Their day is chopped up into meetings, calls, and quick
          decisions. Context-switching is expected and manageable. A meeting is just another slot on the calendar.
        </div>
      </div>

      <div>
        <div class="font-semibold text-indigo-300 mb-1">⚠️ The Conflict</div>
        <div class="text-slate-300">
          When someone operating on the manager's schedule schedules a meeting with someone on the maker's schedule,
          they fragment an entire block of productive time. A single 30-minute meeting at 2 PM can wreck the entire
          afternoon for a maker.
        </div>
      </div>

      <div>
        <div class="font-semibold text-indigo-300 mb-1">💡 The 23-Minute Rule</div>
        <div class="text-slate-300">
          Research shows it takes an average of 23 minutes to regain deep focus after an interruption.
          That's why a 30-minute meeting actually costs ~76 minutes of maker time (23 min before + 30 min meeting + 23 min after).
        </div>
      </div>

      <div>
        <div class="font-semibold text-indigo-300 mb-1">🎯 Solutions</div>
        <div class="text-slate-300">
          • Batch all meetings in manager time (morning or end of day)<br>
          • Protect sacred maker blocks (e.g., 9 AM - 12 PM)<br>
          • Use async communication (email, Slack) during maker time<br>
          • Schedule "office hours" for ad-hoc questions<br>
          • Be explicit about which mode you're in
        </div>
      </div>
    </div>
  </div>

  <!-- Preferences Modal -->
  {#if showPreferences && preferences}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-2xl font-bold mb-4">Maker/Manager Preferences</h3>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">Default Mode</label>
            <select
              bind:value={preferences.defaultMode}
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
            >
              <option value="maker">⚙️ Maker</option>
              <option value="manager">📅 Manager</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Maker Block Duration</label>
              <input
                type="number"
                bind:value={preferences.makerBlockDuration}
                min="60"
                max="480"
                step="30"
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <div class="text-xs text-slate-400 mt-1">{formatDuration(preferences.makerBlockDuration)}</div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Manager Slot Duration</label>
              <input
                type="number"
                bind:value={preferences.managerSlotDuration}
                min="15"
                max="120"
                step="15"
                class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg"
              />
              <div class="text-xs text-slate-400 mt-1">{formatDuration(preferences.managerSlotDuration)}</div>
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2">
              <input type="checkbox" bind:checked={preferences.protectMakerTime} />
              <span class="text-sm">Protect maker time (block notifications)</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
            on:click={handleUpdatePreferences}
          >
            Save Changes
          </button>
          <button
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            on:click={() => showPreferences = false}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- End Session Modal -->
  {#if showEndSessionModal}
    <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-2xl font-bold mb-4">End Session</h3>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium mb-2">
              How productive were you? ({endProductivityRating}/10)
            </label>
            <input
              type="range"
              bind:value={endProductivityRating}
              min="1"
              max="10"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-slate-400 mt-1">
              <span>Not productive</span>
              <span>Very productive</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              bind:value={endNotes}
              placeholder="What worked well? What interrupted you?"
              class="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg resize-none"
              rows="3"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <button
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
            on:click={handleEndSession}
          >
            End Session
          </button>
          <button
            class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            on:click={() => showEndSessionModal = false}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Preferences Button (Floating) -->
  <button
    class="fixed bottom-6 right-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium shadow-lg transition-colors z-40"
    on:click={() => showPreferences = true}
  >
    ⚙️ Preferences
  </button>
</div>
