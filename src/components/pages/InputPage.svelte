<script lang="ts">
  import TaskList from '../TaskList.svelte'
  import Practices from '../Practices.svelte'
  import Chores from '../Chores.svelte'
  import MorningSovereignty from '../MorningSovereignty.svelte'
  import IdentityBuilder from '../IdentityBuilder.svelte'
  import Outcomes from '../Outcomes.svelte'
  import OutcomeTreeView from '../OutcomeTreeView.svelte'

  type InputTab = 'tasks' | 'practices' | 'chores' | 'morning' | 'identity' | 'outcomes' | 'trees'

  let activeTab: InputTab = 'tasks'

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: '✅', shortcut: '1' },
    { id: 'practices', label: 'Practices', icon: '♻️', shortcut: '2' },
    { id: 'chores', label: 'Chores', icon: '🏠', shortcut: '3' },
    { id: 'morning', label: 'Morning Ritual', icon: '☀️', shortcut: '4' },
    { id: 'identity', label: 'Identity', icon: '🎯', shortcut: '5' },
    { id: 'outcomes', label: 'Outcomes', icon: '🎯', shortcut: '6' },
    { id: 'trees', label: 'Outcome Trees', icon: '🌳', shortcut: '7' }
  ] as const

  function handleKeydown(e: KeyboardEvent) {
    // Quick navigation with number keys
    const num = parseInt(e.key)
    if (num >= 1 && num <= 7) {
      activeTab = tabs[num - 1].id as InputTab
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        📝 Input
      </h1>
      <p class="text-slate-400 mt-2">Create tasks, practices, and set your intentions</p>
    </div>
    <div class="text-xs text-slate-500 hidden md:block">
      Press 1-7 for quick navigation
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
    <div class="flex gap-2 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap {activeTab === tab.id
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105'
            : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 text-slate-300'}"
        >
          <span class="text-xl">{tab.icon}</span>
          <span>{tab.label}</span>
          {#if activeTab !== tab.id}
            <span class="text-xs opacity-50 hidden md:inline">({tab.shortcut})</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab Content -->
  <div class="animate-fade-in">
    {#if activeTab === 'tasks'}
      <TaskList />
    {:else if activeTab === 'practices'}
      <Practices />
    {:else if activeTab === 'chores'}
      <Chores />
    {:else if activeTab === 'morning'}
      <MorningSovereignty />
    {:else if activeTab === 'identity'}
      <IdentityBuilder />
    {:else if activeTab === 'outcomes'}
      <Outcomes />
    {:else if activeTab === 'trees'}
      <OutcomeTreeView />
    {/if}
  </div>
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>
