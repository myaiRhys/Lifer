/**
 * Accessibility Utilities
 * Helper functions for improving accessibility
 */

/**
 * Announces a message to screen readers
 * @param message - Message to announce
 * @param priority - Priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Traps focus within an element (for modals, dialogs)
 * @param element - Element to trap focus within
 * @returns Cleanup function
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable.focus()
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown)

  // Focus first element
  firstFocusable?.focus()

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown)
  }
}

/**
 * Restores focus to a previously focused element
 * @param element - Element to restore focus to
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure focus happens after any transitions
    setTimeout(() => {
      element.focus()
    }, 0)
  }
}

/**
 * Gets the currently focused element before opening modal/dialog
 * @returns Currently focused element
 */
export function saveFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement
}

/**
 * Checks if an element is visible
 * @param element - Element to check
 * @returns true if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    element.getClientRects().length
  )
}

/**
 * Generates a unique ID for accessibility attributes
 * @param prefix - Prefix for the ID
 * @returns Unique ID
 */
let idCounter = 0
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`
}

/**
 * Checks if user prefers reduced motion
 * @returns true if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Checks if user prefers dark color scheme
 * @returns true if dark scheme is preferred
 */
export function prefersDarkScheme(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Checks if user prefers high contrast
 * @returns true if high contrast is preferred
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Adds keyboard navigation to a list of elements
 * @param elements - Array of elements
 * @param options - Configuration options
 */
export function addKeyboardNavigation(
  elements: HTMLElement[],
  options: {
    onSelect?: (element: HTMLElement, index: number) => void
    loop?: boolean
    orientation?: 'horizontal' | 'vertical'
  } = {}
): () => void {
  const { onSelect, loop = true, orientation = 'vertical' } = options

  function handleKeyDown(e: KeyboardEvent) {
    const currentIndex = elements.findIndex(el => el === document.activeElement)
    if (currentIndex === -1) return

    let nextIndex = currentIndex

    const isVertical = orientation === 'vertical'
    const upKey = isVertical ? 'ArrowUp' : 'ArrowLeft'
    const downKey = isVertical ? 'ArrowDown' : 'ArrowRight'

    switch (e.key) {
      case upKey:
        e.preventDefault()
        nextIndex = currentIndex - 1
        if (nextIndex < 0) {
          nextIndex = loop ? elements.length - 1 : 0
        }
        break

      case downKey:
        e.preventDefault()
        nextIndex = currentIndex + 1
        if (nextIndex >= elements.length) {
          nextIndex = loop ? 0 : elements.length - 1
        }
        break

      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break

      case 'End':
        e.preventDefault()
        nextIndex = elements.length - 1
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        if (onSelect) {
          onSelect(elements[currentIndex], currentIndex)
        }
        return
    }

    if (nextIndex !== currentIndex) {
      elements[nextIndex]?.focus()
    }
  }

  elements.forEach(el => {
    el.addEventListener('keydown', handleKeyDown)
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '0')
    }
  })

  // Return cleanup function
  return () => {
    elements.forEach(el => {
      el.removeEventListener('keydown', handleKeyDown)
    })
  }
}

/**
 * Creates a live region for dynamic content updates
 * @param message - Message to announce
 * @param politeness - ARIA live region politeness level
 */
export function createLiveRegion(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): HTMLDivElement {
  const liveRegion = document.createElement('div')
  liveRegion.setAttribute('role', 'status')
  liveRegion.setAttribute('aria-live', politeness)
  liveRegion.setAttribute('aria-atomic', 'true')
  liveRegion.className = 'sr-only'
  liveRegion.textContent = message

  return liveRegion
}
