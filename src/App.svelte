<script lang="ts">
  import Dashboard from './components/Dashboard.svelte'
  import TaskList from './components/TaskList.svelte'
  import Achievements from './components/Achievements.svelte'
  import Statistics from './components/Statistics.svelte'
  import { soundSystem } from './lib/sounds'

  let currentView = 'dashboard'
  let showFAB = false

  function toggleSound() {
    soundSystem.toggle()
    soundSystem.buttonClick()
  }

  $: showFAB = currentView === 'tasks'
</script>

<div class="min-h-screen bg-slate-900 text-white">
  <header class="bg-slate-800 border-b border-slate-700 p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <h1 class="text-2xl font-bold">🎯 Lifer</h1>
      <button
        on:click={toggleSound}
        class="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
        title="Toggle sound"
      >
        {soundSystem.isEnabled() ? '🔊' : '🔇'}
      </button>
    </div>
  </header>

  <nav class="bg-slate-800 border-b border-slate-700 p-2 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto flex gap-2 overflow-x-auto">
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'dashboard' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'dashboard'}
      >
        📊 Dashboard
      </button>
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'tasks' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'tasks'}
      >
        ✓ Tasks
      </button>
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'achievements' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'achievements'}
      >
        🏆 Achievements
      </button>
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'statistics' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'statistics'}
      >
        📈 Statistics
      </button>
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'outcomes' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'outcomes'}
      >
        🎯 Outcomes
      </button>
      <button
        class="px-4 py-2 rounded whitespace-nowrap {currentView === 'practices' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}"
        on:click={() => currentView = 'practices'}
      >
        🔄 Practices
      </button>
    </div>
  </nav>

  <main class="p-4 pb-20">
    <div class="max-w-7xl mx-auto">
      {#if currentView === 'dashboard'}
        <Dashboard />
      {:else if currentView === 'tasks'}
        <TaskList />
      {:else if currentView === 'achievements'}
        <Achievements />
      {:else if currentView === 'statistics'}
        <Statistics />
      {:else if currentView === 'outcomes'}
        <h2 class="text-xl mb-4">Outcomes</h2>
        <p class="text-slate-400">Outcome management coming soon...</p>
      {:else if currentView === 'practices'}
        <h2 class="text-xl mb-4">Practices</h2>
        <p class="text-slate-400">Practice tracking coming soon...</p>
      {/if}
    </div>
  </main>

  <!-- Floating Action Button -->
  {#if showFAB}
    <button
      class="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 z-50"
      on:click={() => {
        // Trigger new task form
        const event = new CustomEvent('openTaskForm')
        window.dispatchEvent(event)
      }}
      title="Add new task"
    >
      +
    </button>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
