<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { trapFocus, restoreFocus, saveFocus } from '../../lib/accessibility'
  import Button from './Button.svelte'

  /**
   * Whether the modal is open
   */
  export let open: boolean = false

  /**
   * Modal title
   */
  export let title: string = ''

  /**
   * Modal size
   */
  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md'

  /**
   * Close callback
   */
  export let onClose: (() => void) | undefined = undefined

  /**
   * Show close button in header
   */
  export let showCloseButton: boolean = true

  /**
   * Close on overlay click
   */
  export let closeOnOverlay: boolean = true

  /**
   * Close on escape key
   */
  export let closeOnEscape: boolean = true

  /**
   * Prevent body scroll when open
   */
  export let preventScroll: boolean = true

  let modalElement: HTMLElement
  let previousFocusedElement: HTMLElement | null = null
  let cleanupFocusTrap: (() => void) | undefined

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-16'
  }

  $: if (open) {
    handleOpen()
  } else {
    handleClose()
  }

  function handleOpen() {
    // Save currently focused element
    previousFocusedElement = saveFocus()

    // Prevent body scroll
    if (preventScroll) {
      document.body.style.overflow = 'hidden'
    }

    // Setup focus trap after modal is rendered
    setTimeout(() => {
      if (modalElement) {
        cleanupFocusTrap = trapFocus(modalElement)
      }
    }, 0)
  }

  function handleClose() {
    // Restore body scroll
    if (preventScroll) {
      document.body.style.overflow = ''
    }

    // Cleanup focus trap
    if (cleanupFocusTrap) {
      cleanupFocusTrap()
      cleanupFocusTrap = undefined
    }

    // Restore focus
    restoreFocus(previousFocusedElement)
  }

  function closeModal() {
    if (onClose) {
      onClose()
    }
  }

  function handleOverlayClick(event: MouseEvent) {
    if (closeOnOverlay && event.target === event.currentTarget) {
      closeModal()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape') {
      event.preventDefault()
      closeModal()
    }
  }

  onDestroy(() => {
    handleClose()
  })
</script>

{#if open}
  <div
    class="modal-overlay"
    on:click={handleOverlayClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
  >
    <div
      bind:this={modalElement}
      class="modal-content {sizeClasses[size]}"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="button"
      tabindex="0"
    >
      <!-- Header -->
      {#if title || showCloseButton}
        <div class="modal-header">
          {#if title}
            <h2 id="modal-title" class="modal-title text-h5 font-bold text-text-primary">
              {title}
            </h2>
          {/if}

          {#if showCloseButton}
            <button
              type="button"
              class="close-button"
              on:click={closeModal}
              aria-label="Close modal"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          {/if}
        </div>
      {/if}

      <!-- Body -->
      <div class="modal-body">
        <slot />
      </div>

      <!-- Footer (optional) -->
      <slot name="footer" />
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.3s ease-out;
  }

  .modal-content {
    position: relative;
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-elevation-4);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    animation: scaleIn 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid var(--border);
  }

  .modal-title {
    margin: 0;
    flex: 1;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .close-button:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .modal-header {
      padding: 32px;
    }

    .modal-body {
      padding: 32px;
    }
  }
</style>
