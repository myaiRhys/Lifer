<script lang="ts">
  export let title: string
  export let description: string = ''
  export let icon: string = ''
  export let gradient: string = 'from-blue-400 via-purple-400 to-pink-400'
  export let actionText: string = ''
  export let onAction: (() => void) | null = null
</script>

<div class="mb-8 animate-slide-in">
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <h1 class="text-4xl md:text-5xl font-black bg-gradient-to-r {gradient} bg-clip-text text-transparent leading-tight mb-3 tracking-tight">
        {#if icon}<span class="mr-3">{icon}</span>{/if}{title}
      </h1>
      {#if description}
        <p class="text-slate-400 text-lg">{description}</p>
      {/if}
    </div>

    {#if actionText && onAction}
      <button
        on:click={onAction}
        class="px-6 py-3 bg-gradient-to-r {gradient} rounded-xl font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        {actionText}
      </button>
    {/if}
  </div>
</div>

<style>
  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-in {
    animation: slide-in 0.4s ease-out;
  }
</style>
