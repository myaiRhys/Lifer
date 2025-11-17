<!--
@component
Error State Component - Enhanced with Design System
Displays error, warning, or info messages with optional retry action.

Props:
- message: Main error/warning/info message
- description: Supporting description text
- actionText: Button text for retry action (default: 'Try Again')
- onRetry: Optional retry handler function
- type: Message type - 'error', 'warning', or 'info' (default: 'error')
- variant: Display variant - 'default', '404', 'network' (default: 'default')
- showBack: Show back button (default: false)
-->
<script lang="ts">
  import Button from './Button.svelte'

  export let message: string = 'Something went wrong'
  export let description: string = 'Please try again or contact support if the problem persists.'
  export let actionText: string = 'Try Again'
  export let onRetry: (() => void) | null = null
  export let type: 'error' | 'warning' | 'info' = 'error'
  export let variant: 'default' | '404' | 'network' = 'default'
  export let showBack: boolean = false

  const icons = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }

  const variantIcons = {
    default: icons[type],
    '404': '🔍',
    network: '📡'
  }

  $: displayIcon = variant !== 'default' ? variantIcons[variant] : icons[type]
</script>

<div class="error-state" role="alert" aria-live="assertive">
  <div class="error-content">
    <!-- Icon -->
    <div class="error-icon" aria-hidden="true">
      {displayIcon}
    </div>

    <!-- Message -->
    <h3 class="error-title text-h4 font-bold text-text-primary mb-12 text-center">
      {message}
    </h3>

    <!-- Description -->
    <p class="text-body text-text-secondary text-center mb-32 max-w-md">
      {description}
    </p>

    <!-- Slot for custom content -->
    <slot />

    <!-- Actions -->
    <div class="error-actions">
      {#if onRetry}
        <Button variant="primary" onclick={onRetry}>
          <span class="mr-8">🔄</span>
          {actionText}
        </Button>
      {/if}

      {#if showBack}
        <Button variant="secondary" onclick={() => window.history.back()}>
          <span class="mr-8">←</span>
          Go Back
        </Button>
      {/if}
    </div>
  </div>
</div>

<style>
  .error-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 32px 16px;
    animation: fadeIn 0.5s ease-out;
  }

  .error-content {
    text-align: center;
    max-width: 480px;
  }

  .error-icon {
    font-size: 96px;
    margin-bottom: 24px;
    animation: errorBounce 0.5s ease-out;
  }

  @keyframes errorBounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .error-title {
    animation: fadeInUp 0.5s ease-out 0.1s both;
  }

  .error-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    animation: fadeInUp 0.5s ease-out 0.3s both;
  }

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

  /* Responsive */
  @media (min-width: 768px) {
    .error-state {
      min-height: 600px;
    }

    .error-actions {
      flex-direction: row;
      justify-content: center;
    }
  }
</style>
