<script lang="ts">
  import { onMount } from 'svelte'
  import { getAchievementsWithProgress } from '../lib/db/achievements'
  import Badge from './shared/Badge.svelte'
  import ProgressBar from './shared/ProgressBar.svelte'
  import LoadingState from './shared/LoadingState.svelte'
  import Button from './shared/Button.svelte'
  import { Haptics } from '../lib/haptics'

  let achievements: any[] = []
  let filter: string = 'all'
  let loading = true
  let selectedAchievement: any = null
  let showDetailModal = false

  onMount(async () => {
    await loadAchievements()
  })

  async function loadAchievements() {
    loading = true
    achievements = await getAchievementsWithProgress()
    loading = false
  }

  function getRarityColor(rarity: string) {
    switch (rarity) {
      case 'common': return 'from-slate-400 to-slate-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-yellow-600'
      default: return 'from-slate-400 to-slate-600'
    }
  }

  function getRarityBorder(rarity: string) {
    switch (rarity) {
      case 'common': return 'border-slate-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-slate-500'
    }
  }

  function getRarityGlow(rarity: string): string {
    switch (rarity) {
      case 'rare': return 'shadow-blue-500/50'
      case 'epic': return 'shadow-purple-500/50'
      case 'legendary': return 'shadow-yellow-500/50'
      default: return ''
    }
  }

  function getTier(rarity: string): 'bronze' | 'silver' | 'gold' {
    switch (rarity) {
      case 'rare': return 'silver'
      case 'epic':
      case 'legendary': return 'gold'
      default: return 'bronze'
    }
  }

  $: filteredAchievements = filter === 'all'
    ? achievements
    : filter === 'unlocked'
    ? achievements.filter(a => a.unlocked)
    : achievements.filter(a => !a.unlocked)

  $: unlockedCount = achievements.filter(a => a.unlocked).length
  $: totalCount = achievements.length
  $: completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

  function handleFilterChange(newFilter: string) {
    filter = newFilter
    Haptics.selection()
  }

  function openDetail(achievement: any) {
    selectedAchievement = achievement
    showDetailModal = true
    if (achievement.unlocked) {
      Haptics.tap()
    }
  }

  function closeDetail() {
    showDetailModal = false
    selectedAchievement = null
  }
</script>

<div class="achievement-gallery">
  <!-- Header -->
  <div class="header-section mb-24">
    <h1 class="text-h3 font-bold text-text-primary mb-8 flex items-center gap-12">
      <span>🏆</span> Achievement Gallery
    </h1>
    <p class="text-body text-text-secondary mb-16">
      Unlock achievements by completing tasks and reaching milestones
    </p>

    <!-- Overall Progress -->
    <div class="bg-bg-secondary border border-border rounded-2xl p-24 shadow-elevation-2">
      <div class="flex items-center justify-between mb-16">
        <span class="text-body-large font-semibold text-text-primary">Overall Progress</span>
        <Badge variant="achievement" tier="gold" value={`${unlockedCount}/${totalCount}`} />
      </div>
      <ProgressBar
        value={unlockedCount}
        max={totalCount}
        showLabel={true}
        label="{completionPercentage.toFixed(1)}% Complete"
      />
    </div>
  </div>

  {#if loading}
    <LoadingState variant="skeleton">
      <div class="space-y-12">
        <div class="skeleton h-64 w-full rounded-lg"></div>
        <div class="skeleton h-64 w-full rounded-lg"></div>
        <div class="skeleton h-64 w-full rounded-lg"></div>
      </div>
    </LoadingState>
  {:else}
    <!-- Filter Tabs -->
    <div class="filter-tabs mb-24">
      <button
        on:click={() => handleFilterChange('all')}
        class="filter-tab {filter === 'all' ? 'active' : ''}"
      >
        All
        <Badge variant="xp" value={totalCount} />
      </button>
      <button
        on:click={() => handleFilterChange('unlocked')}
        class="filter-tab {filter === 'unlocked' ? 'active' : ''}"
      >
        Unlocked
        <Badge variant="achievement" tier="gold" value={unlockedCount} />
      </button>
      <button
        on:click={() => handleFilterChange('locked')}
        class="filter-tab {filter === 'locked' ? 'active' : ''}"
      >
        Locked
        <Badge variant="xp" value={totalCount - unlockedCount} />
      </button>
    </div>

    <!-- Achievements Grid -->
    <div class="achievements-grid">
      {#each filteredAchievements as achievement (achievement.id)}
        <button
          on:click={() => openDetail(achievement)}
          class="achievement-card bg-bg-secondary border-2 {getRarityBorder(achievement.rarity)} rounded-2xl p-16 transition-all hover:scale-105 active:scale-95 {achievement.unlocked ? 'shadow-elevation-2' : 'opacity-60'} {achievement.unlocked && achievement.rarity !== 'common' ? getRarityGlow(achievement.rarity) : ''}"
          class:unlocked={achievement.unlocked}
        >
          <!-- Icon -->
          <div class="achievement-icon text-5xl mb-12 {achievement.unlocked ? '' : 'grayscale'}">
            {achievement.icon}
          </div>

          <!-- Rarity Badge -->
          <div class="mb-12">
            <Badge variant="achievement" tier={getTier(achievement.rarity)}>
              <span class="text-xs uppercase tracking-wide">{achievement.rarity}</span>
            </Badge>
          </div>

          <!-- Name -->
          <h3 class="text-body-large font-bold text-text-primary mb-8">
            {achievement.name}
          </h3>

          <!-- Description -->
          <p class="text-body-small text-text-secondary mb-12">
            {achievement.description}
          </p>

          <!-- Progress -->
          {#if achievement.progress && !achievement.unlocked}
            <div class="mb-12">
              <ProgressBar
                value={achievement.progress.current}
                max={achievement.progress.total}
                variant="linear"
                showLabel={false}
              />
              <p class="text-body-small text-text-muted mt-4 text-center">
                {achievement.progress.current}/{achievement.progress.total}
              </p>
            </div>
          {/if}

          <!-- Status -->
          {#if achievement.unlocked && achievement.unlockedAt}
            <div class="status-badge unlocked">
              <span>✓</span> Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          {:else}
            <div class="status-badge locked">
              <span>🔒</span> Locked
            </div>
          {/if}

          <!-- Glow effect for legendary -->
          {#if achievement.unlocked && achievement.rarity === 'legendary'}
            <div class="legendary-glow"></div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Empty State -->
    {#if filteredAchievements.length === 0}
      <div class="empty-state text-center py-64">
        <div class="text-6xl mb-16">🏆</div>
        <p class="text-body-large text-text-secondary">
          No achievements in this category yet
        </p>
      </div>
    {/if}
  {/if}
</div>

<!-- Detail Modal -->
{#if showDetailModal && selectedAchievement}
  <div
    class="modal-overlay fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-16"
    on:click={closeDetail}
    on:keydown={(e) => e.key === 'Escape' && closeDetail()}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="modal-content bg-bg-secondary border-2 {getRarityBorder(selectedAchievement.rarity)} rounded-2xl p-32 max-w-md w-full shadow-elevation-4"
      on:click|stopPropagation
      on:keydown={(e) => e.key === 'Enter' && e.stopPropagation()}
      role="button"
      tabindex="0"
    >
      <!-- Icon -->
      <div class="text-center mb-24">
        <div class="text-8xl mb-16 {selectedAchievement.unlocked ? 'animate-bounce' : 'grayscale'}">
          {selectedAchievement.icon}
        </div>
        <Badge variant="achievement" tier={getTier(selectedAchievement.rarity)} animate={selectedAchievement.unlocked}>
          <span class="uppercase tracking-wide">{selectedAchievement.rarity}</span>
        </Badge>
      </div>

      <!-- Name & Description -->
      <h2 class="text-h4 font-bold text-text-primary mb-12 text-center">
        {selectedAchievement.name}
      </h2>
      <p class="text-body text-text-secondary mb-24 text-center">
        {selectedAchievement.description}
      </p>

      <!-- Progress -->
      {#if selectedAchievement.progress}
        <div class="mb-24">
          <ProgressBar
            value={selectedAchievement.progress.current}
            max={selectedAchievement.progress.total}
            showLabel={true}
            label="Progress: {selectedAchievement.progress.current}/{selectedAchievement.progress.total}"
          />
        </div>
      {/if}

      <!-- Status -->
      {#if selectedAchievement.unlocked}
        <div class="text-center text-success-green font-semibold mb-24">
          <span class="text-2xl mr-8">✓</span>
          Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      {:else}
        <div class="text-center text-text-muted font-semibold mb-24">
          <span class="text-2xl mr-8">🔒</span>
          Not yet unlocked
        </div>
      {/if}

      <!-- Close Button -->
      <Button variant="primary" fullWidth={true} onclick={closeDetail}>
        Close
      </Button>
    </div>
  </div>
{/if}

<style>
  .achievement-gallery {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
    padding-bottom: 100px; /* Space for bottom nav */
  }

  /* Filter Tabs */
  .filter-tabs {
    display: flex;
    gap: 8px;
    border-bottom: 2px solid var(--border);
    padding-bottom: 8px;
    overflow-x: auto;
  }

  .filter-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;
    cursor: pointer;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  .filter-tab:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .filter-tab.active {
    color: var(--accent);
    background: var(--bg-secondary);
    border-bottom: 2px solid var(--accent);
  }

  /* Achievements Grid */
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  /* Achievement Card */
  .achievement-card {
    position: relative;
    text-align: center;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .achievement-card:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .achievement-card.unlocked {
    animation: cardReveal 0.5s ease-out;
  }

  @keyframes cardReveal {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Status Badge */
  .status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-badge.unlocked {
    background: rgba(74, 222, 128, 0.2);
    color: var(--success-green);
  }

  .status-badge.locked {
    background: var(--bg-primary);
    color: var(--text-muted);
  }

  /* Legendary Glow */
  .legendary-glow {
    position: absolute;
    inset: -4px;
    background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
    border-radius: 18px;
    opacity: 0.3;
    z-index: -1;
    animation: legendaryPulse 2s ease-in-out infinite;
  }

  @keyframes legendaryPulse {
    0%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.05);
    }
  }

  /* Modal */
  .modal-overlay {
    animation: fadeIn 0.3s ease-out;
  }

  .modal-content {
    animation: scaleIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .achievement-gallery {
      padding: 32px;
    }

    .achievements-grid {
      gap: 24px;
    }
  }
</style>
