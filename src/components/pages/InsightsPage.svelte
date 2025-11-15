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

<div class="space-y-6">
  <!-- Page Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-4xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
        📈 Insights
      </h1>
      <p class="text-slate-400 mt-2">Track your progress and discover patterns</p>
    </div>
    <div class="text-xs text-slate-500 hidden md:block">
      Press 1-9 for quick navigation
    </div>
  </div>

  <!-- Tab Navigation -->
  <div class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2">
    <div class="flex gap-2 overflow-x-auto">
      {#each tabs as tab}
        <button
          on:click={() => activeTab = tab.id}
          class="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap {activeTab === tab.id
            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105'
            : 'bg-slate-800/50 hover:bg-slate-700 hover:scale-105 text-slate-300'}"
        >
          <span class="text-xl">{tab.icon}</span>
          <span class="hidden sm:inline">{tab.label}</span>
          <span class="sm:hidden">{tab.label.split(' ')[0]}</span>
          {#if activeTab !== tab.id}
            <span class="text-xs opacity-50 hidden md:inline">({tab.shortcut})</span>
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

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>
