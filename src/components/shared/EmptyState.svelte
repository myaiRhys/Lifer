<!--
@component
Empty State Component - Enhanced with Design System
Displays a friendly empty state with optional action button.

Props:
- icon: Emoji or icon to display (default: '📭')
- title: Main heading text
- description: Supporting description text
- actionText: Optional button text
- onAction: Optional button click handler
- variant: Visual style variant ('default', 'compact', 'card')
- size: Size of the empty state ('sm', 'md', 'lg')
-->
<script lang="ts">
  import Button from './Button.svelte'

  export let icon: string = '📭'
  export let title: string = 'Nothing here yet'
  export let description: string = 'Get started by adding your first item'
  export let actionText: string = ''
  export let onAction: (() => void) | null = null
  export let variant: 'default' | 'compact' | 'card' = 'default'
  export let size: 'sm' | 'md' | 'lg' = 'md'

  const sizeConfig = {
    sm: {
      iconSize: 'text-4xl',
      titleSize: 'text-h6',
      padding: 'py-24',
    },
    md: {
      iconSize: 'text-6xl',
      titleSize: 'text-h5',
      padding: 'py-48',
    },
    lg: {
      iconSize: 'text-8xl',
      titleSize: 'text-h4',
      padding: 'py-64',
    },
  }

  $: config = sizeConfig[size]
</script>

<div
  class="empty-state {variant} {config.padding} px-16"
  role="status"
  aria-live="polite"
>
  <div class="empty-content">
    <!-- Icon -->
    <div class="empty-icon {config.iconSize} mb-24" aria-hidden="true">
      {icon}
    </div>

    <!-- Title -->
    <h3 class="empty-title {config.titleSize} font-bold text-text-primary mb-12 text-center">
      {title}
    </h3>

    <!-- Description -->
    <p class="text-body text-text-secondary text-center max-w-md mb-24">
      {description}
    </p>

    <!-- Slot for custom content -->
    <slot />

    <!-- Optional Action Button -->
    {#if actionText && onAction}
      <div class="mt-16">
        <Button variant="primary" size="md" onclick={onAction}>
          {actionText}
        </Button>
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: fadeInUp 0.5s ease-out;
  }

  .empty-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 480px;
  }

  /* Variants */
  .empty-state.compact {
    padding-top: 32px;
    padding-bottom: 32px;
  }

  .empty-state.card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 48px 32px;
    box-shadow: var(--shadow-elevation-1);
  }

  /* Icon */
  .empty-icon {
    opacity: 0.5;
    animation: floatIcon 3s ease-in-out infinite;
  }

  @keyframes floatIcon {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  /* Animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .empty-title {
    animation: fadeInUp 0.5s ease-out 0.1s both;
  }

  /* Responsive */
  @media (min-width: 768px) {
    .empty-state.card {
      padding: 64px 48px;
    }
  }
</style>
