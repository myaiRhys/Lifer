<script lang="ts">
  export let currentView: string
  export let onNavigate: (view: string) => void

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', gradient: 'from-blue-600 to-purple-600' },
    { id: 'input', label: 'Input', icon: '📝', gradient: 'from-blue-600 to-cyan-600' },
    { id: 'insights', label: 'Insights', icon: '📈', gradient: 'from-orange-600 to-red-600' },
    { id: 'tools', label: 'Tools', icon: '🛠️', gradient: 'from-green-600 to-emerald-600' },
    { id: 'focus', label: 'Focus', icon: '⚡', gradient: 'from-purple-600 to-pink-600' }
  ]
</script>

<!-- Mobile Bottom Navigation - Only visible on mobile -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-slate-700/50 safe-area-bottom">
  <div class="grid grid-cols-5 gap-1 px-2 py-2">
    {#each navItems as item}
      <button
        on:click={() => onNavigate(item.id)}
        class="flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 {currentView === item.id
          ? `bg-gradient-to-br ${item.gradient} shadow-lg`
          : 'hover:bg-slate-800/50 active:scale-95'}"
      >
        <span class="text-2xl mb-1 {currentView === item.id ? 'scale-110' : ''}">{item.icon}</span>
        <span class="text-[10px] font-semibold {currentView === item.id ? 'text-white' : 'text-slate-400'} leading-tight">
          {item.label}
        </span>
      </button>
    {/each}
  </div>

  <!-- Safe area spacer for devices with bottom notch -->
  <div class="h-safe-bottom bg-slate-900"></div>
</nav>

<style>
  /* Safe area support for iPhone notch */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .h-safe-bottom {
    height: env(safe-area-inset-bottom);
  }
</style>
