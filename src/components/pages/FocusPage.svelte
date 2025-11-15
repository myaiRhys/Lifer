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

<div class="space-y-6 animate-page-enter">
  <!-- Page Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight mb-3">
        ⚡ Focus
      </h1>
      <p class="text-slate-300 text-lg">Deep work sessions to maximize productivity</p>
    </div>
    <div class="text-xs text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 hidden md:block">
      <kbd class="font-mono">1-3</kbd> for quick navigation
    </div>
  </div>

  <!-- Mode Selection Cards with enhanced styling -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each modes as mode}
      <button
        on:click={() => activeMode = mode.id}
        class="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-2xl border transition-all duration-300 p-8 text-left shadow-xl shadow-black/20 {activeMode === mode.id
          ? `border-transparent bg-gradient-to-br ${mode.gradient} shadow-2xl shadow-purple-500/30 scale-105`
          : 'border-slate-700/50 hover:border-slate-600 hover:scale-105 hover:shadow-2xl'}"
      >
        {#if activeMode === mode.id}
          <div class="absolute inset-0 bg-gradient-to-br {mode.gradient} rounded-2xl blur-xl opacity-40 -z-10"></div>
        {/if}

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="text-5xl group-hover:scale-110 transition-transform duration-300">{mode.icon}</div>
            {#if activeMode !== mode.id}
              <div class="text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-400 font-mono border border-slate-700">
                {mode.shortcut}
              </div>
            {/if}
          </div>
          <h3 class="text-2xl font-black mb-3 {activeMode === mode.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}">
            {mode.name}
          </h3>
          <p class="text-sm leading-relaxed {activeMode === mode.id ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-300'}">
            {mode.description}
          </p>
        </div>

        {#if activeMode !== mode.id}
          <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br {mode.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        {/if}
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
</style>
