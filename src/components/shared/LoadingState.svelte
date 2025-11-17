<script lang="ts">
  export let variant: 'spinner' | 'skeleton' | 'pulse' = 'spinner'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let message: string = ''
  export let fullScreen: boolean = false

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  }
</script>

{#if fullScreen}
  <!-- Full Screen Loading -->
  <div class="fixed inset-0 bg-bg-primary flex items-center justify-center z-50">
    <div class="text-center">
      {#if variant === 'spinner'}
        <div class="{sizeClasses[size]} border-4 border-border border-t-accent rounded-full animate-spin mx-auto"></div>
      {:else if variant === 'pulse'}
        <div class="{sizeClasses[size]} bg-accent rounded-full animate-pulse mx-auto"></div>
      {/if}

      {#if message}
        <p class="mt-24 text-body text-text-secondary">{message}</p>
      {/if}
    </div>
  </div>
{:else if variant === 'skeleton'}
  <!-- Skeleton Loading -->
  <div class="space-y-12">
    <slot>
      <!-- Default skeleton if no slot provided -->
      <div class="skeleton h-64 w-full rounded-lg"></div>
      <div class="skeleton h-48 w-3/4 rounded-lg"></div>
      <div class="skeleton h-48 w-1/2 rounded-lg"></div>
    </slot>
  </div>
{:else if variant === 'spinner'}
  <!-- Inline Spinner -->
  <div class="flex items-center justify-center py-32">
    <div class="{sizeClasses[size]} border-4 border-border border-t-accent rounded-full animate-spin"></div>
    {#if message}
      <span class="ml-16 text-body text-text-secondary">{message}</span>
    {/if}
  </div>
{:else if variant === 'pulse'}
  <!-- Pulse Loading -->
  <div class="flex items-center justify-center py-32">
    <div class="{sizeClasses[size]} bg-accent rounded-full animate-pulse"></div>
    {#if message}
      <span class="ml-16 text-body text-text-secondary">{message}</span>
    {/if}
  </div>
{/if}

<style>
  /* Additional custom styles */
</style>
