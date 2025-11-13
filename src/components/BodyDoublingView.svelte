<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getBodyDoublingSessions,
    getActiveBodyDoublingSession,
    createBodyDoublingSession,
    completeBodyDoublingSession,
    updateTasksCompleted,
    updateFocusQuality,
    getSessionStats
  } from '../lib/db'
  import type { BodyDoublingSession } from '../lib/types'

  let sessions: BodyDoublingSession[] = []
  let activeSession: BodyDoublingSession | null = null
  let friends: Array<{id: string, name: string, online: boolean}> = [
    { id: 'friend1', name: 'Sarah', online: true },
    { id: 'friend2', name: 'Alex', online: false },
    { id: 'friend3', name: 'Jamie', online: true }
  ]
  let stats = { totalSessions: 0, totalTasks: 0, avgFocusQuality: 0 }
  let myTasksCompleted = 0
  let myFocusQuality = 0

  onMount(async () => {
    await loadData()
  })

  async function loadData() {
    sessions = await getBodyDoublingSessions()
    activeSession = await getActiveBodyDoublingSession()
    stats = await getSessionStats('user1')

    if (activeSession) {
      myTasksCompleted = activeSession.tasksCompleted['user1'] || 0
      myFocusQuality = activeSession.focusQuality['user1'] || 0
    }
  }

  async function handleStartSession(friendId: string) {
    const session = await createBodyDoublingSession('user1', friendId, 90)
    activeSession = session
    alert('Session started! Work silently alongside your friend.')
  }

  async function handleEndSession() {
    if (!activeSession) return

    if (confirm('End body doubling session?')) {
      // Update final stats
      if (myTasksCompleted > 0) {
        await updateTasksCompleted(activeSession.id, 'user1', myTasksCompleted)
      }
      if (myFocusQuality > 0) {
        await updateFocusQuality(activeSession.id, 'user1', myFocusQuality)
      }

      await completeBodyDoublingSession(activeSession.id)
      activeSession = null
      myTasksCompleted = 0
      myFocusQuality = 0
      await loadData()
      alert('Session complete! Great work!')
    }
  }

  async function handleUpdateTasksCompleted() {
    if (!activeSession) return
    await updateTasksCompleted(activeSession.id, 'user1', myTasksCompleted)
  }

  async function handleRateFocus(quality: number) {
    if (!activeSession) return
    myFocusQuality = quality
    await updateFocusQuality(activeSession.id, 'user1', quality)
  }

  function getOnlineFriends() {
    return friends.filter(f => f.online)
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }
</script>

<div class="max-w-4xl mx-auto">
  <h2 class="text-3xl font-bold mb-6">Body Doubling</h2>

  <div class="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
    {#if !activeSession}
      <!-- No Active Session -->
      <div class="mb-6">
        <p class="text-slate-300 mb-4">
          Body doubling = working alongside someone else for accountability and focus.
          Research shows it dramatically improves task completion!
        </p>
      </div>

      <!-- Friends List -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-4">Available Friends</h3>
        <div class="space-y-3">
          {#each getOnlineFriends() as friend}
            <div class="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-green-500 rounded-full" title="Online"></div>
                <div>
                  <div class="font-semibold">{friend.name}</div>
                  <div class="text-sm text-green-400">🟢 Online</div>
                </div>
              </div>
              <button
                on:click={() => handleStartSession(friend.id)}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
              >
                Invite to Session
              </button>
            </div>
          {/each}

          {#if friends.filter(f => !f.online).length > 0}
            <details class="mt-4">
              <summary class="cursor-pointer text-sm text-slate-400 hover:text-slate-300">
                Offline Friends ({friends.filter(f => !f.online).length})
              </summary>
              <div class="mt-2 space-y-2">
                {#each friends.filter(f => !f.online) as friend}
                  <div class="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg opacity-60">
                    <div class="w-3 h-3 bg-slate-500 rounded-full" title="Offline"></div>
                    <div>
                      <div class="font-semibold">{friend.name}</div>
                      <div class="text-xs text-slate-500">Offline</div>
                    </div>
                  </div>
                {/each}
              </div>
            </details>
          {/if}

          {#if getOnlineFriends().length === 0}
            <div class="text-center py-8 text-slate-500">
              <p class="mb-2">No friends online right now</p>
              <p class="text-sm">Invite friends to join Lifer!</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Add Friend Button -->
      <button
        on:click={() => alert('Friend system coming soon! For now, this is a demo with mock friends.')}
        class="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg font-medium transition-colors"
      >
        + Add Friend
      </button>
    {:else}
      <!-- Active Session -->
      <div class="text-center mb-6">
        <div class="text-5xl mb-4">👥</div>
        <h3 class="text-2xl font-bold mb-2">Body Doubling Session Active</h3>
        <p class="text-slate-400">Working with {friends.find(f => f.id === activeSession.participants[1])?.name || 'Friend'}</p>
      </div>

      <!-- Session Info Grid -->
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- Your Side -->
        <div class="bg-slate-700 rounded-lg p-4">
          <h4 class="font-bold mb-4 text-center">You</h4>

          <div class="mb-4">
            <label class="block text-sm text-slate-400 mb-2">Tasks Completed</label>
            <div class="flex items-center gap-2">
              <button
                on:click={() => { myTasksCompleted = Math.max(0, myTasksCompleted - 1); handleUpdateTasksCompleted() }}
                class="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
              >
                -
              </button>
              <div class="flex-1 text-center text-3xl font-bold">{myTasksCompleted}</div>
              <button
                on:click={() => { myTasksCompleted++; handleUpdateTasksCompleted() }}
                class="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">Focus Quality</label>
            <div class="flex gap-1 justify-center">
              {#each [1, 2, 3, 4, 5] as rating}
                <button
                  on:click={() => handleRateFocus(rating)}
                  class="text-2xl transition-transform hover:scale-110 {myFocusQuality >= rating ? 'text-yellow-400' : 'text-slate-600'}"
                >
                  ⭐
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Partner's Side (Simulated) -->
        <div class="bg-slate-700 rounded-lg p-4 opacity-75">
          <h4 class="font-bold mb-4 text-center">
            {friends.find(f => f.id === activeSession.participants[1])?.name || 'Partner'}
          </h4>

          <div class="mb-4">
            <label class="block text-sm text-slate-400 mb-2">Tasks Completed</label>
            <div class="text-center text-3xl font-bold">{activeSession.tasksCompleted[activeSession.participants[1]] || 3}</div>
          </div>

          <div>
            <label class="block text-sm text-slate-400 mb-2">Focus Quality</label>
            <div class="flex gap-1 justify-center">
              {#each Array(activeSession.focusQuality[activeSession.participants[1]] || 4) as _}
                <span class="text-2xl text-yellow-400">⭐</span>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Session Tips -->
      <div class="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mb-6">
        <h4 class="font-semibold mb-2">💡 Body Doubling Tips:</h4>
        <ul class="text-sm text-slate-300 space-y-1">
          <li>• Work in silence or minimal communication</li>
          <li>• Update your task count as you complete items</li>
          <li>• Rate your focus quality at the end</li>
          <li>• Use video/audio optional (presence is enough!)</li>
        </ul>
      </div>

      <!-- End Session Button -->
      <button
        on:click={handleEndSession}
        class="w-full bg-red-600 hover:bg-red-500 p-3 rounded-lg font-medium transition-colors"
      >
        End Session
      </button>
    {/if}
  </div>

  <!-- Stats Section -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Total Sessions</div>
      <div class="text-3xl font-bold text-blue-400">{stats.totalSessions}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Tasks Completed</div>
      <div class="text-3xl font-bold text-green-400">{stats.totalTasks}</div>
    </div>
    <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div class="text-sm text-slate-400 mb-1">Avg Focus Quality</div>
      <div class="text-3xl font-bold text-yellow-400">{stats.avgFocusQuality.toFixed(1)}/5</div>
    </div>
  </div>

  <!-- Info Box -->
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-4">
    <h4 class="font-bold mb-2">🧠 Why Body Doubling Works:</h4>
    <ul class="text-sm text-slate-300 space-y-1">
      <li>• Creates external accountability without pressure</li>
      <li>• Reduces procrastination by up to 60% (studies)</li>
      <li>• Particularly effective for ADHD and task initiation difficulties</li>
      <li>• The "parallel play" of productivity - you don't need to talk!</li>
    </ul>
  </div>
</div>
