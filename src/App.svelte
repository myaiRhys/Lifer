<script lang="ts">
  import Dashboard from './components/Dashboard.svelte'
  import TaskList from './components/TaskList.svelte'

  // Simple MVP shell - routes will be added later
  let currentView = 'dashboard'
</script>

<div class="min-h-screen bg-slate-900 text-white">
  <header class="bg-slate-800 border-b border-slate-700 p-4">
    <h1 class="text-2xl font-bold">Lifer</h1>
  </header>

  <nav class="bg-slate-800 border-b border-slate-700 p-2">
    <div class="flex gap-4">
      <button
        class="px-4 py-2 rounded {currentView === 'dashboard' ? 'bg-slate-700' : ''}"
        on:click={() => currentView = 'dashboard'}
      >
        Dashboard
      </button>
      <button
        class="px-4 py-2 rounded {currentView === 'tasks' ? 'bg-slate-700' : ''}"
        on:click={() => currentView = 'tasks'}
      >
        Tasks
      </button>
      <button
        class="px-4 py-2 rounded {currentView === 'outcomes' ? 'bg-slate-700' : ''}"
        on:click={() => currentView = 'outcomes'}
      >
        Outcomes
      </button>
      <button
        class="px-4 py-2 rounded {currentView === 'practices' ? 'bg-slate-700' : ''}"
        on:click={() => currentView = 'practices'}
      >
        Practices
      </button>
    </div>
  </nav>

  <main class="p-4">
    {#if currentView === 'dashboard'}
      <Dashboard />
    {:else if currentView === 'tasks'}
      <TaskList />
    {:else if currentView === 'outcomes'}
      <h2 class="text-xl mb-4">Outcomes</h2>
      <p class="text-slate-400">Outcome management coming soon...</p>
    {:else if currentView === 'practices'}
      <h2 class="text-xl mb-4">Practices</h2>
      <p class="text-slate-400">Practice tracking coming soon...</p>
    {/if}
  </main>
</div>
