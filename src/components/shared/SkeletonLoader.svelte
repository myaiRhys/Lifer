<script lang="ts">
  export let variant: 'card' | 'list' | 'stats' | 'dashboard' | 'profile' = 'card'
  export let count: number = 1
</script>

{#if variant === 'card'}
  <!-- Task Card Skeleton -->
  {#each Array(count) as _, i}
    <div class="bg-bg-secondary border border-border rounded-lg p-24 mb-12">
      <div class="flex items-start gap-16">
        <!-- Checkbox skeleton -->
        <div class="skeleton w-24 h-24 rounded"></div>

        <!-- Content skeleton -->
        <div class="flex-1 space-y-12">
          <div class="skeleton h-24 w-3/4 rounded"></div>
          <div class="skeleton h-16 w-1/2 rounded"></div>

          <!-- Tags skeleton -->
          <div class="flex gap-8">
            <div class="skeleton h-24 w-64 rounded-full"></div>
            <div class="skeleton h-24 w-48 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  {/each}

{:else if variant === 'list'}
  <!-- Simple List Item Skeleton -->
  {#each Array(count) as _, i}
    <div class="bg-bg-secondary border border-border rounded-lg p-16 mb-8 flex items-center gap-16">
      <div class="skeleton w-48 h-48 rounded-full"></div>
      <div class="flex-1 space-y-8">
        <div class="skeleton h-20 w-full rounded"></div>
        <div class="skeleton h-16 w-2/3 rounded"></div>
      </div>
    </div>
  {/each}

{:else if variant === 'stats'}
  <!-- Stats Grid Skeleton -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-16">
    {#each Array(count) as _, i}
      <div class="bg-bg-secondary border border-border rounded-xl p-16 text-center">
        <div class="skeleton h-32 w-3/4 mx-auto mb-8 rounded"></div>
        <div class="skeleton h-16 w-1/2 mx-auto rounded"></div>
      </div>
    {/each}
  </div>

{:else if variant === 'dashboard'}
  <!-- Complete Dashboard Skeleton -->
  <div class="space-y-24">
    <!-- Header skeleton -->
    <div class="skeleton h-48 w-1/3 rounded-lg"></div>

    <!-- Stats cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-16">
      {#each Array(3) as _, i}
        <div class="bg-bg-secondary border border-border rounded-2xl p-24">
          <div class="skeleton h-24 w-1/2 mb-16 rounded"></div>
          <div class="skeleton h-32 w-full mb-12 rounded"></div>
          <div class="skeleton h-16 w-3/4 rounded"></div>
        </div>
      {/each}
    </div>

    <!-- Main content -->
    <div class="bg-bg-secondary border border-border rounded-2xl p-24">
      <div class="skeleton h-32 w-1/4 mb-24 rounded"></div>
      <div class="space-y-12">
        {#each Array(4) as _, i}
          <div class="flex gap-16">
            <div class="skeleton w-24 h-24 rounded"></div>
            <div class="flex-1 space-y-8">
              <div class="skeleton h-20 w-full rounded"></div>
              <div class="skeleton h-16 w-2/3 rounded"></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

{:else if variant === 'profile'}
  <!-- Profile Skeleton -->
  <div class="bg-bg-secondary border border-border rounded-2xl p-24">
    <div class="flex items-center gap-24 mb-32">
      <!-- Avatar -->
      <div class="skeleton w-96 h-96 rounded-full"></div>

      <!-- Info -->
      <div class="flex-1 space-y-12">
        <div class="skeleton h-32 w-1/2 rounded"></div>
        <div class="skeleton h-20 w-3/4 rounded"></div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-16">
      {#each Array(3) as _, i}
        <div class="text-center">
          <div class="skeleton h-32 w-3/4 mx-auto mb-8 rounded"></div>
          <div class="skeleton h-16 w-1/2 mx-auto rounded"></div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  /* Styles defined in app.css */
</style>
