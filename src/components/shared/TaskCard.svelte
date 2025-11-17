<script lang="ts">
  import Checkbox from './Checkbox.svelte'
  import Badge from './Badge.svelte'
  import { swipe } from '../../lib/gestures'
  import { Haptics } from '../../lib/haptics'

  export let title: string
  export let completed: boolean = false
  export let category: string = ''
  export let categoryIcon: string = ''
  export let xpReward: number = 0
  export let description: string = ''
  export let onToggle: ((completed: boolean) => void) | undefined = undefined
  export let onClick: (() => void) | undefined = undefined
  export let enableSwipe: boolean = true

  let swipeOffset = 0
  let isSwipeActive = false

  function handleCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement
    completed = target.checked
    if (onToggle) onToggle(completed)
    Haptics.tap()
  }

  function handleCardClick(event: MouseEvent) {
    // Don't trigger card click if clicking the checkbox
    if ((event.target as HTMLElement).closest('.checkbox')) {
      return
    }
    if (onClick) onClick()
  }

  function handleSwipe(direction: 'left' | 'right') {
    if (!enableSwipe || completed) return

    if (direction === 'right') {
      // Swipe right to complete
      completed = true
      if (onToggle) onToggle(true)
      Haptics.success()
    }
  }

  function handleSwipeMove(direction: 'left' | 'right', distance: number, percentage: number) {
    if (!enableSwipe || completed) return

    if (direction === 'right') {
      swipeOffset = Math.min(distance, 100)
      isSwipeActive = percentage >= 100
    }
  }

  function handleSwipeCancel() {
    swipeOffset = 0
    isSwipeActive = false
  }
</script>

<div
  class="task-card-wrapper relative overflow-hidden"
  use:swipe={{
    onSwipe: handleSwipe,
    onSwipeMove: handleSwipeMove,
    onSwipeCancel: handleSwipeCancel,
    directions: ['right'],
    threshold: 60,
    haptics: true
  }}
>
  <!-- Swipe Background (Complete Action) -->
  {#if !completed && enableSwipe}
    <div
      class="absolute inset-0 bg-gradient-to-r from-success-green to-green-400 flex items-center justify-start pl-24 pointer-events-none transition-opacity"
      style="opacity: {swipeOffset > 0 ? Math.min(swipeOffset / 60, 1) : 0}"
    >
      <span class="text-2xl {isSwipeActive ? 'animate-bounce' : ''}">✓</span>
      <span class="ml-12 text-white font-semibold">Complete</span>
    </div>
  {/if}

  <!-- Task Card Content -->
  <div
    class="task-card {completed ? 'completed' : ''} cursor-pointer relative bg-bg-secondary"
    style="transform: translateX({swipeOffset}px); transition: {swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none'}"
    on:click={handleCardClick}
    on:keydown={(e) => e.key === 'Enter' && handleCardClick(e)}
    role="button"
    tabindex="0"
  >
    <div class="flex items-start gap-16">
      <!-- Checkbox -->
      <div class="pt-4">
        <Checkbox bind:checked={completed} on:change={handleCheckboxChange} />
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h3 class="task-title text-body-large font-medium text-text-primary mb-8">
          {title}
        </h3>

        {#if description}
          <p class="text-body-small text-text-secondary mb-12">
            {description}
          </p>
        {/if}

        <!-- Category and XP -->
        <div class="flex items-center gap-12 flex-wrap">
          {#if category}
            <div class="flex items-center gap-8 text-body-small text-text-muted">
              {#if categoryIcon}
                <span class="text-lg">{categoryIcon}</span>
              {/if}
              <span>{category}</span>
            </div>
          {/if}

          {#if xpReward > 0}
            <Badge variant="xp" value="+{xpReward}">
              XP
            </Badge>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Additional custom styles if needed */
  .task-card {
    /* Inherits styles from app.css */
  }
</style>
