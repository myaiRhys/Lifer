<script lang="ts">
  import FocusTimer from '../FocusTimer.svelte'
  import UltradianTimer from '../UltradianTimer.svelte'
  import BodyDoublingView from '../BodyDoublingView.svelte'

  type FocusMode = 'pomodoro' | 'ultradian' | 'doubling'

  let activeMode: FocusMode = 'pomodoro'

  const modes = [
    {
      id: 'pomodoro',
      name: 'Pomodoro',
      icon: '⏱️',
      description: '25-minute focused work sessions with short breaks',
      gradient: 'from-red-600 to-orange-600',
      shortcut: '1'
    },
    {
      id: 'ultradian',
      name: 'Ultradian',
      icon: '🧠',
      description: '90-minute deep work blocks aligned with natural energy cycles',
      gradient: 'from-purple-600 to-blue-600',
      shortcut: '2'
    },
    {
      id: 'doubling',
      name: 'Body Doubling',
      icon: '👥',
      description: 'Work alongside others for accountability and focus',
      gradient: 'from-green-600 to-teal-600',
      shortcut: '3'
    }
  ] as const

  function handleKeydown(e: KeyboardEvent) {
    const num = parseInt(e.key)
    if (num >= 1 && num <= 3) {
      activeMode = modes[num - 1].id as FocusMode
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        ⚡ Focus
      </h1>
      <p class="text-slate-400 mt-2">Deep work sessions to maximize productivity</p>
    </div>
    <div class="text-xs text-slate-500 hidden md:block">
      Press 1-3 for quick navigation
    </div>
  </div>

  <!-- Mode Selection Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each modes as mode}
      <button
        on:click={() => activeMode = mode.id}
        class="group relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border transition-all duration-300 p-6 text-left {activeMode === mode.id
          ? `border-transparent bg-gradient-to-br ${mode.gradient} shadow-2xl shadow-${mode.gradient.split('-')[1]}-500/30 scale-105`
          : 'border-slate-700/50 hover:border-slate-600 hover:scale-105'}"
      >
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-3">
            <div class="text-4xl">{mode.icon}</div>
            {#if activeMode !== mode.id}
              <div class="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400">
                {mode.shortcut}
              </div>
            {/if}
          </div>
          <h3 class="text-xl font-bold mb-2 {activeMode === mode.id ? 'text-white' : 'text-slate-200'}">
            {mode.name}
          </h3>
          <p class="text-sm {activeMode === mode.id ? 'text-white/80' : 'text-slate-400'}">
            {mode.description}
          </p>
        </div>
      </button>
    {/each}
  </div>

  <!-- Active Mode Content -->
  <div class="animate-fade-in">
    {#if activeMode === 'pomodoro'}
      <FocusTimer />
    {:else if activeMode === 'ultradian'}
      <UltradianTimer />
    {:else if activeMode === 'doubling'}
      <BodyDoublingView />
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
