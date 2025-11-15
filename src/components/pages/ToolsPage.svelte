<script lang="ts">
  import TaskPrioritizer from '../TaskPrioritizer.svelte'
  import CookieJar from '../CookieJar.svelte'
  import Seasons from '../Seasons.svelte'
  import PowerUpShop from '../PowerUpShop.svelte'
  import CouplesMode from '../CouplesMode.svelte'

  type Tool = 'prioritizer' | 'cookie-jar' | 'seasons' | 'shop' | 'couples'

  let activeTool: Tool | null = null

  const tools = [
    {
      id: 'prioritizer',
      name: 'AI Prioritizer',
      icon: '🤖',
      description: 'Let AI help you prioritize tasks by leverage and urgency',
      gradient: 'from-cyan-600 to-blue-600',
      shortcut: '1'
    },
    {
      id: 'cookie-jar',
      name: 'Cookie Jar',
      icon: '🍪',
      description: 'Store your wins for motivation when you need it most',
      gradient: 'from-amber-600 to-orange-600',
      shortcut: '2'
    },
    {
      id: 'seasons',
      name: 'Seasons',
      icon: '🌍',
      description: 'Align your goals with natural energy cycles',
      gradient: 'from-emerald-600 to-teal-600',
      shortcut: '3'
    },
    {
      id: 'shop',
      name: 'Power-Up Shop',
      icon: '🛒',
      description: 'Unlock rewards and bonuses with your XP',
      gradient: 'from-purple-600 to-pink-600',
      shortcut: '4'
    },
    {
      id: 'couples',
      name: 'Pair Lifers',
      icon: '💑',
      description: 'Share progress and accountability with your partner',
      gradient: 'from-rose-600 to-red-600',
      shortcut: '5'
    }
  ] as const

  function handleKeydown(e: KeyboardEvent) {
    if (activeTool) {
      // Escape to go back
      if (e.key === 'Escape') {
        activeTool = null
      }
    } else {
      // Number keys to open tools
      const num = parseInt(e.key)
      if (num >= 1 && num <= 5) {
        activeTool = tools[num - 1].id as Tool
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  {#if activeTool === null}
    <!-- Tools Grid View -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          🛠️ Tools
        </h1>
        <p class="text-slate-400 mt-2">Powerful features to optimize your growth</p>
      </div>
      <div class="text-xs text-slate-500 hidden md:block">
        Press 1-5 to open, ESC to close
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each tools as tool}
        <button
          on:click={() => activeTool = tool.id}
          class="group relative bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-left hover:scale-105 transition-all duration-300 hover:shadow-2xl overflow-hidden"
        >
          <!-- Gradient Background on Hover -->
          <div class="absolute inset-0 bg-gradient-to-br {tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-4">
              <div class="text-5xl mb-2">{tool.icon}</div>
              <div class="text-xs bg-slate-800 px-2 py-1 rounded-lg text-slate-400">
                Press {tool.shortcut}
              </div>
            </div>
            <h3 class="text-xl font-bold mb-2 group-hover:bg-gradient-to-r group-hover:{tool.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {tool.name}
            </h3>
            <p class="text-slate-400 text-sm">{tool.description}</p>
          </div>

          <!-- Decorative Corner -->
          <div class="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br {tool.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </button>
      {/each}
    </div>
  {:else}
    <!-- Tool Detail View -->
    <div class="animate-fade-in">
      <button
        on:click={() => activeTool = null}
        class="mb-4 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
      >
        ← Back to Tools
        <span class="text-xs text-slate-500">(ESC)</span>
      </button>

      {#if activeTool === 'prioritizer'}
        <TaskPrioritizer />
      {:else if activeTool === 'cookie-jar'}
        <CookieJar />
      {:else if activeTool === 'seasons'}
        <Seasons />
      {:else if activeTool === 'shop'}
        <PowerUpShop />
      {:else if activeTool === 'couples'}
        <CouplesMode />
      {/if}
    </div>
  {/if}
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
