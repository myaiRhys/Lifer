<script lang="ts">
  import { onMount } from 'svelte'
  import { logEnergy, getTodaysEnergyLogs, getEnergyLogs, seedEnergyData } from '../lib/db'
  import type { EnergyLog } from '../lib/types'

  let energy = 5
  let notes = ''
  let todayLogs: EnergyLog[] = []
  let totalLogs = 0
  let daysTracked = 0

  const emojis: { [key: number]: string } = {
    1: '😴', 2: '😪', 3: '😕', 4: '😐', 5: '🙂',
    6: '😊', 7: '😄', 8: '⚡', 9: '🔥', 10: '🚀'
  }

  onMount(async () => {
    await loadLogs()
  })

  async function loadLogs() {
    todayLogs = await getTodaysEnergyLogs()
    const allLogs = await getEnergyLogs()
    totalLogs = allLogs.length
    daysTracked = Math.floor(totalLogs / 3)
  }

  async function handleLogEnergy() {
    try {
      await logEnergy(energy, notes.trim() || undefined)
      notes = ''
      await loadLogs()

      if (totalLogs + 1 >= 63) {
        alert('🎉 You\'ve collected 21 days of data! Your BPT is now calculated.')
      } else {
        alert(`Energy logged! ${emojis[energy]}`)
      }
    } catch (error) {
      alert('Failed to log energy. Please try again.')
      console.error(error)
    }
  }

  async function handleSeedData() {
    if (confirm('This will create 21 days of sample energy data. Continue?')) {
      await seedEnergyData()
      await loadLogs()
      alert('✅ Sample data created! Check out your BPT Analysis.')
    }
  }
</script>

<div class="bg-slate-800 border border-slate-700 rounded-lg p-6">
  <div class="flex justify-between items-center mb-4">
    <h2 class="text-2xl font-bold">Log Your Energy</h2>
    {#if daysTracked < 21}
      <button
        on:click={handleSeedData}
        class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors"
        title="Add sample data for testing"
      >
        📊 Seed Data
      </button>
    {/if}
  </div>

  <!-- Energy Slider -->
  <div class="mb-6">
    <div class="text-6xl text-center mb-4" role="img" aria-label="Energy level {energy}">
      {emojis[energy]}
    </div>
    <input
      type="range"
      min="1"
      max="10"
      bind:value={energy}
      class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
    />
    <div class="flex justify-between text-sm text-slate-400 mt-2">
      <span>Exhausted</span>
      <span class="font-bold text-lg">{energy}/10</span>
      <span>Peak Energy</span>
    </div>
  </div>

  <!-- Notes Input -->
  <input
    type="text"
    placeholder="What are you working on? (optional)"
    bind:value={notes}
    class="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg mb-4 focus:outline-none focus:border-blue-500 transition-colors"
  />

  <!-- Save Button -->
  <button
    on:click={handleLogEnergy}
    class="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-medium transition-colors"
  >
    Save Energy Log
  </button>

  <!-- Today's Logs -->
  {#if todayLogs.length > 0}
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-3">Today's Energy</h3>
      <div class="flex gap-3 items-center flex-wrap">
        {#each todayLogs as log}
          <div class="flex flex-col items-center">
            <div class="text-3xl">{emojis[log.energy]}</div>
            <div class="text-xs text-slate-400 mt-1">
              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Progress Tracker -->
  <div class="mt-6 pt-6 border-t border-slate-700">
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-slate-400">BPT Analysis Progress</span>
      <span class="text-sm font-bold text-blue-400">Day {daysTracked}/21</span>
    </div>
    <div class="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        class="bg-blue-500 h-full transition-all duration-500"
        style="width: {Math.min(100, (daysTracked / 21) * 100)}%"
      />
    </div>
    <p class="text-xs text-slate-500 mt-2">
      {#if daysTracked >= 21}
        ✅ Analysis complete! View your Biological Prime Time below.
      {:else}
        Log your energy 3x daily for {21 - daysTracked} more days to discover your peak productivity hours.
      {/if}
    </p>
  </div>
</div>
