<script lang="ts">
  import { onMount } from 'svelte'
  import LoadingSkeleton from '../shared/LoadingSkeleton.svelte'
  import { prefetchAdjacentTabs } from '../../lib/utils/prefetch'

  type InsightTab = 'analytics' | 'heatmap' | 'recovery' | 'gateway' | 'stacking' | 'authenticity' | 'marginal' | 'maker' | 'energy'

  let activeTab: InsightTab = 'analytics'

  // Lazy load heavy analytics components only when needed
  const componentMap = {
    analytics: () => import('../PersonalAnalytics.svelte'),
    heatmap: () => import('../HeatMap.svelte'),
    recovery: () => import('../NeverMissTwice.svelte'),
    gateway: () => import('../TwoMinuteGateway.svelte'),
    stacking: () => import('../HabitStackBuilder.svelte'),
    authenticity: () => import('../AuthenticityTracker.svelte'),
    marginal: () => import('../MarginalGainsVisualizer.svelte'),
    maker: () => import('../MakerModeToggle.svelte'),
    energy: null // Special case: loads two components
  }

  $: activeComponent = activeTab === 'energy' ? null : componentMap[activeTab]()

  // Prefetch adjacent tabs for smoother navigation
  $: if (activeTab && activeTab !== 'energy') {
    prefetchAdjacentTabs(activeTab, componentMap)
  }

  // Prefetch analytics on mount (most commonly viewed)
  onMount(() => {
    if (activeTab !== 'analytics') {
      componentMap.analytics()
    }
  })

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: '📈', shortcut: '1' },
    { id: 'heatmap', label: 'Activity Map', icon: '📅', shortcut: '2' },
    { id: 'recovery', label: 'Never Miss Twice', icon: '🔥', shortcut: '3' },
    { id: 'gateway', label: '2-Min Gateway', icon: '⚡', shortcut: '4' },
    { id: 'stacking', label: 'Habit Stacking', icon: '🔗', shortcut: '5' },
    { id: 'authenticity', label: 'Authenticity', icon: '🌿', shortcut: '6' },
    { id: 'marginal', label: 'Marginal Gains', icon: '📊', shortcut: '7' },
    { id: 'maker', label: 'Maker/Manager', icon: '⚙️', shortcut: '8' },
    { id: 'energy', label: 'Energy & BPT', icon: '⚡', shortcut: '9' }
  ] as const

  function handleKeydown(e: KeyboardEvent) {
    const num = parseInt(e.key)
    if (num >= 1 && num <= 9) {
      activeTab = tabs[num - 1].id as InsightTab
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6 animate-page-enter">
  <!-- Page Header - Mobile Optimized -->
  <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
    <div>
      <h1 class="text-3xl md:text-5xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight mb-2 md:mb-3">
        📈 Insights
      </h1>
      <p class="text-slate-300 text-sm md:text-lg">Track your progress and discover patterns</p>
    </div>
    <div class="text-xs text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 hidden lg:block">
      <kbd class="font-mono">1-9</kbd> for quick navigation
    </div>
  </div>

  <!-- Tab Navigation with enhanced styling - Touch-optimized -->
  <div class="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-xl md:rounded-2xl border border-slate-700/50 p-1.5 md:p-2 shadow-xl shadow-black/20">
    <div class="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="group relative flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl font-bold transition-all duration-300 whitespace-nowrap active:scale-95 {activeTab === tab.id
            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105'
            : 'bg-slate-800/50 hover:bg-slate-700/70 hover:scale-102 text-slate-300 hover:text-white'}"
        >
          {#if activeTab === tab.id}
            <div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg md:rounded-xl blur-lg opacity-40 -z-10"></div>
          {/if}
          <span class="text-lg md:text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
          <span class="text-xs md:text-base hidden sm:inline">{tab.label}</span>
          <span class="text-xs sm:hidden">{tab.label.split(' ')[0]}</span>
          {#if activeTab !== tab.id}
            <span class="text-xs opacity-40 hidden lg:inline font-mono">({tab.shortcut})</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab Content with Lazy Loading -->
  <div class="animate-fade-in">
    {#if activeTab === 'energy'}
      <!-- Energy tab loads two components -->
      {#await Promise.all([import('../EnergyLogger.svelte'), import('../BPTAnalysis.svelte')])}
        <LoadingSkeleton rows={3} type="list" />
      {:then [energyModule, bptModule]}
        <div class="space-y-6">
          <svelte:component this={energyModule.default} />
          <svelte:component this={bptModule.default} />
        </div>
      {:catch error}
        <div class="text-center py-12 text-red-400">
          <p>Failed to load components: {error.message}</p>
        </div>
      {/await}
    {:else}
      {#await activeComponent}
        <LoadingSkeleton rows={3} type="list" />
      {:then module}
        <svelte:component this={module.default} />
      {:catch error}
        <div class="text-center py-12 text-red-400">
          <p>Failed to load component: {error.message}</p>
        </div>
      {/await}
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
