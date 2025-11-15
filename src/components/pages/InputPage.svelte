<script lang="ts">
  import TaskList from '../TaskList.svelte'
  import Practices from '../Practices.svelte'
  import Chores from '../Chores.svelte'
  import MorningSovereignty from '../MorningSovereignty.svelte'
  import IdentityBuilder from '../IdentityBuilder.svelte'
  import Outcomes from '../Outcomes.svelte'
  import OutcomeTreeView from '../OutcomeTreeView.svelte'
  import PageHeader from '../shared/PageHeader.svelte'

  type InputTab = 'tasks' | 'practices' | 'chores' | 'morning' | 'identity' | 'outcomes' | 'trees'

  let activeTab: InputTab = 'tasks'

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: '✅', shortcut: '1', color: 'from-blue-500 to-cyan-500' },
    { id: 'practices', label: 'Practices', icon: '♻️', shortcut: '2', color: 'from-green-500 to-emerald-500' },
    { id: 'chores', label: 'Chores', icon: '🏠', shortcut: '3', color: 'from-orange-500 to-amber-500' },
    { id: 'morning', label: 'Morning Ritual', icon: '☀️', shortcut: '4', color: 'from-yellow-500 to-orange-500' },
    { id: 'identity', label: 'Identity', icon: '🎯', shortcut: '5', color: 'from-purple-500 to-pink-500' },
    { id: 'outcomes', label: 'Outcomes', icon: '🎯', shortcut: '6', color: 'from-indigo-500 to-purple-500' },
    { id: 'trees', label: 'Trees', icon: '🌳', shortcut: '7', color: 'from-emerald-500 to-teal-500' }
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

<div class="space-y-6 animate-page-enter">
  <!-- Page Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-5xl font-black bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight tracking-tight mb-3">
        📝 Input
      </h1>
      <p class="text-slate-300 text-lg">Create tasks, practices, and set your intentions</p>
    </div>
    <div class="text-xs text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 hidden md:block">
      <kbd class="font-mono">1-7</kbd> for quick navigation
    </div>
  </div>

  <!-- Tab Navigation with enhanced styling -->
  <div class="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-700/50 p-2 shadow-xl shadow-black/20">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap {activeTab === tab.id
            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-blue-500/30 scale-105`
            : 'bg-slate-800/50 hover:bg-slate-700/70 hover:scale-102 text-slate-300 hover:text-white'}"
        >
          {#if activeTab === tab.id}
            <div class="absolute inset-0 bg-gradient-to-r {tab.color} rounded-xl blur-lg opacity-40 -z-10"></div>
          {/if}
          <span class="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
          <span class="hidden sm:inline">{tab.label}</span>
          {#if activeTab !== tab.id}
            <span class="text-xs opacity-40 hidden lg:inline font-mono">({tab.shortcut})</span>
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

  @keyframes page-enter {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }

  .animate-page-enter {
    animation: page-enter 0.4s ease-out;
  }

  .scrollbar-hide {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .hover\:scale-102:hover {
    transform: scale(1.02);
  }
</style>
