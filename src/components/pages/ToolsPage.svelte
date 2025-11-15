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

<div class="space-y-6 animate-page-enter">
  {#if activeTool === null}
    <!-- Tools Grid View -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight tracking-tight mb-3">
          🛠️ Tools
        </h1>
        <p class="text-slate-300 text-lg">Powerful features to optimize your growth</p>
      </div>
      <div class="text-xs text-slate-500 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 hidden md:block">
        <kbd class="font-mono">1-5</kbd> to open • <kbd class="font-mono">ESC</kbd> to close
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each tools as tool}
        <button
          on:click={() => activeTool = tool.id}
          class="group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-2xl border border-slate-700/50 p-8 text-left hover:scale-105 transition-all duration-300 hover:shadow-2xl shadow-xl shadow-black/20 overflow-hidden"
        >
          <!-- Gradient Background on Hover -->
          <div class="absolute inset-0 bg-gradient-to-br {tool.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10">
            <div class="flex items-start justify-between mb-6">
              <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">{tool.icon}</div>
              <div class="text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg text-slate-400 font-mono border border-slate-700">
                {tool.shortcut}
              </div>
            </div>
            <h3 class="text-2xl font-black mb-3 group-hover:bg-gradient-to-r group-hover:{tool.gradient} group-hover:bg-clip-text group-hover:text-transparent transition-all">
              {tool.name}
            </h3>
            <p class="text-slate-400 text-sm leading-relaxed">{tool.description}</p>
          </div>

          <!-- Decorative Corner Glow -->
          <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br {tool.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>

          <!-- Border glow on hover -->
          <div class="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-{tool.gradient.split('-')[1]}-500/50 transition-all duration-300"></div>
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
</style>
