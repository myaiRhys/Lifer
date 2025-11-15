<script lang="ts">
  import PersonalAnalytics from '../PersonalAnalytics.svelte'
  import HeatMap from '../HeatMap.svelte'
  import NeverMissTwice from '../NeverMissTwice.svelte'
  import TwoMinuteGateway from '../TwoMinuteGateway.svelte'
  import HabitStackBuilder from '../HabitStackBuilder.svelte'
  import AuthenticityTracker from '../AuthenticityTracker.svelte'
  import MarginalGainsVisualizer from '../MarginalGainsVisualizer.svelte'
  import MakerModeToggle from '../MakerModeToggle.svelte'
  import EnergyLogger from '../EnergyLogger.svelte'
  import BPTAnalysis from '../BPTAnalysis.svelte'

  type InsightTab = 'analytics' | 'heatmap' | 'recovery' | 'gateway' | 'stacking' | 'authenticity' | 'marginal' | 'maker' | 'energy'

  let activeTab: InsightTab = 'analytics'

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
  <!-- Page Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-5xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight mb-3">
        📈 Insights
      </h1>
      <p class="text-slate-300 text-lg">Track your progress and discover patterns</p>
    </div>
    <div class="text-xs text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 hidden md:block">
      <kbd class="font-mono">1-9</kbd> for quick navigation
    </div>
  </div>

  <!-- Tab Navigation with enhanced styling -->
  <div class="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-700/50 p-2 shadow-xl shadow-black/20">
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="group relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap {activeTab === tab.id
            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105'
            : 'bg-slate-800/50 hover:bg-slate-700/70 hover:scale-102 text-slate-300 hover:text-white'}"
        >
          {#if activeTab === tab.id}
            <div class="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-lg opacity-40 -z-10"></div>
          {/if}
          <span class="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
          <span class="hidden sm:inline">{tab.label}</span>
          <span class="sm:hidden">{tab.label.split(' ')[0]}</span>
          {#if activeTab !== tab.id}
            <span class="text-xs opacity-40 hidden lg:inline font-mono">({tab.shortcut})</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab Content -->
  <div class="animate-fade-in">
    {#if activeTab === 'analytics'}
      <PersonalAnalytics />
    {:else if activeTab === 'heatmap'}
      <HeatMap />
    {:else if activeTab === 'recovery'}
      <NeverMissTwice />
    {:else if activeTab === 'gateway'}
      <TwoMinuteGateway />
    {:else if activeTab === 'stacking'}
      <HabitStackBuilder />
    {:else if activeTab === 'authenticity'}
      <AuthenticityTracker />
    {:else if activeTab === 'marginal'}
      <MarginalGainsVisualizer />
    {:else if activeTab === 'maker'}
      <MakerModeToggle />
    {:else if activeTab === 'energy'}
      <div class="space-y-6">
        <EnergyLogger />
        <BPTAnalysis />
      </div>
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
