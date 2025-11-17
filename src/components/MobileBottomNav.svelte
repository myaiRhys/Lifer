<script lang="ts">
  import { Haptics } from '../lib/haptics'

  export let currentView: string
  export let onNavigate: (view: string) => void

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '📊', path: '/dashboard' },
    { id: 'achievements', label: 'Awards', icon: '🏆', path: '/achievements' },
    { id: 'input', label: 'Input', icon: '📝', path: '/input' },
    { id: 'tools', label: 'Tools', icon: '🛠️', path: '/tools' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' }
  ]

  function handleNavClick(itemId: string) {
    if (itemId === currentView) return

    // Trigger haptic feedback
    Haptics.selection()

    onNavigate(itemId)
  }
</script>

<!-- Mobile Bottom Navigation - Only visible on mobile -->
<nav
  class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-2xl border-t border-border safe-area-bottom"
  style="box-shadow: var(--shadow-elevation-4)"
  aria-label="Main navigation"
>
  <div class="grid grid-cols-5 gap-1 px-8 py-8">
    {#each navItems as item}
      <button
        on:click={() => handleNavClick(item.id)}
        class="nav-item flex flex-col items-center justify-center py-8 px-4 rounded-xl transition-all duration-300 relative {currentView === item.id ? 'active' : ''}"
        aria-label={item.label}
        aria-current={currentView === item.id ? 'page' : undefined}
      >
        <!-- Icon -->
        <div class="nav-icon-wrapper relative mb-4">
          <span class="text-2xl transition-transform duration-300" role="img" aria-hidden="true">
            {item.icon}
          </span>

          <!-- Active indicator -->
          {#if currentView === item.id}
            <div class="active-indicator"></div>
          {/if}
        </div>

        <!-- Label -->
        <span class="text-[10px] font-semibold leading-tight transition-colors duration-300">
          {item.label}
        </span>

        <!-- Ripple effect -->
        <div class="ripple"></div>
      </button>
    {/each}
  </div>

  <!-- Safe area spacer for devices with bottom notch -->
  <div class="h-safe-bottom"></div>
</nav>

<style>
  /* Safe area support for iPhone notch */
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .h-safe-bottom {
    height: env(safe-area-inset-bottom);
    background: var(--bg-secondary);
  }

  /* Nav Item */
  .nav-item {
    color: var(--text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:hover {
    background: var(--bg-primary);
  }

  .nav-item.active {
    color: var(--accent);
  }

  /* Icon wrapper */
  .nav-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    transition: transform 0.3s ease;
  }

  .nav-item:active .nav-icon-wrapper {
    transform: scale(0.9);
  }

  .nav-item.active .nav-icon-wrapper {
    transform: scale(1.1);
  }

  /* Active indicator */
  .active-indicator {
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 3px;
    background: var(--accent);
    border-radius: 2px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      width: 24px;
      opacity: 1;
    }
  }

  /* Ripple effect */
  .ripple {
    position: absolute;
    inset: 0;
    border-radius: 12px;
    background: var(--accent);
    opacity: 0;
    pointer-events: none;
  }

  .nav-item:active .ripple {
    animation: ripple 0.6s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.3;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  /* Accessibility */
  .nav-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
</style>
