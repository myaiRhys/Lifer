<script lang="ts">
  import { Haptics } from '../../lib/haptics'

  export interface NavItem {
    id: string
    label: string
    icon: string
    path: string
    badge?: number | string
  }

  /**
   * Navigation items to display
   */
  export let items: NavItem[] = []

  /**
   * Currently active item ID
   */
  export let activeId: string = ''

  /**
   * Callback when navigation item is clicked
   */
  export let onNavigate: ((item: NavItem) => void) | undefined = undefined

  /**
   * Enable haptic feedback on navigation
   * @default true
   */
  export let haptics: boolean = true

  /**
   * Show labels below icons
   * @default true
   */
  export let showLabels: boolean = true

  /**
   * Compact mode (smaller icons, no labels)
   * @default false
   */
  export let compact: boolean = false

  function handleNavClick(item: NavItem) {
    if (item.id === activeId) return

    // Trigger haptic feedback
    if (haptics) {
      Haptics.selection()
    }

    // Call navigation callback
    if (onNavigate) {
      onNavigate(item)
    }
  }
</script>

<nav
  class="bottom-nav"
  class:compact
  aria-label="Main navigation"
>
  {#each items as item (item.id)}
    <button
      class="nav-item"
      class:active={item.id === activeId}
      on:click={() => handleNavClick(item)}
      aria-label={item.label}
      aria-current={item.id === activeId ? 'page' : undefined}
    >
      <!-- Icon with ripple effect -->
      <div class="nav-icon-wrapper">
        <span class="nav-icon" role="img" aria-hidden="true">
          {item.icon}
        </span>

        <!-- Badge indicator -->
        {#if item.badge}
          <span class="nav-badge" aria-label="{item.badge} notifications">
            {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
          </span>
        {/if}

        <!-- Active indicator -->
        {#if item.id === activeId}
          <div class="active-indicator"></div>
        {/if}
      </div>

      <!-- Label -->
      {#if showLabels && !compact}
        <span class="nav-label">
          {item.label}
        </span>
      {/if}
    </button>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: 8px 0;
    z-index: 1000;
    box-shadow: var(--shadow-elevation-4);
    transition: all 0.3s ease;
  }

  .bottom-nav.compact {
    padding: 4px 0;
  }

  /* Nav Item */
  .nav-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 16px;
    min-width: 64px;
    min-height: 56px;
    background: transparent;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--text-muted);
    -webkit-tap-highlight-color: transparent;
  }

  .bottom-nav.compact .nav-item {
    min-height: 48px;
    padding: 6px 12px;
  }

  /* Hover state */
  .nav-item:hover {
    background: var(--bg-primary);
  }

  /* Active state */
  .nav-item.active {
    color: var(--accent);
  }

  /* Icon wrapper */
  .nav-icon-wrapper {
    position: relative;
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

  /* Icon */
  .nav-icon {
    font-size: 24px;
    line-height: 1;
    transition: all 0.3s ease;
  }

  .bottom-nav.compact .nav-icon {
    font-size: 20px;
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

  /* Badge */
  .nav-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--error-red);
    color: #FFFFFF;
    font-size: 11px;
    font-weight: 600;
    border-radius: 9px;
    border: 2px solid var(--bg-secondary);
    animation: badgePulse 2s ease-in-out infinite;
  }

  @keyframes badgePulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  /* Label */
  .nav-label {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 72px;
  }

  .nav-item.active .nav-label {
    font-weight: 600;
  }

  /* Accessibility */
  .nav-item:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Ripple effect on tap */
  .nav-item::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: var(--accent);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    pointer-events: none;
  }

  .nav-item:active::after {
    animation: ripple 0.6s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.3;
    }
    100% {
      transform: translate(-50%, -50%) scale(2);
      opacity: 0;
    }
  }

  /* Safe area support for iOS devices */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .bottom-nav {
      padding-bottom: calc(8px + env(safe-area-inset-bottom));
    }

    .bottom-nav.compact {
      padding-bottom: calc(4px + env(safe-area-inset-bottom));
    }
  }

  /* Responsive adjustments */
  @media (min-width: 768px) {
    .bottom-nav {
      display: none; /* Hide on desktop if needed */
    }
  }
</style>
