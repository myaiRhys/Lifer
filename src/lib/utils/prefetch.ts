/**
 * Component prefetching utilities
 * Preloads components before user navigates to them for instant transitions
 */

const prefetchCache = new Set<string>()

/**
 * Prefetches a component module
 * @param importFn - Dynamic import function
 * @param key - Unique key for the component (optional, for deduplication)
 */
export async function prefetchComponent(
  importFn: () => Promise<any>,
  key?: string
): Promise<void> {
  // Avoid duplicate prefetches
  if (key && prefetchCache.has(key)) {
    return
  }

  try {
    await importFn()
    if (key) {
      prefetchCache.set(key)
    }
  } catch (error) {
    console.warn('Prefetch failed:', error)
  }
}

/**
 * Prefetches multiple components in parallel
 * @param components - Array of import functions
 */
export async function prefetchComponents(
  components: Array<() => Promise<any>>
): Promise<void> {
  try {
    await Promise.all(components.map(fn => fn()))
  } catch (error) {
    console.warn('Batch prefetch failed:', error)
  }
}

/**
 * Prefetches a component on mouse hover (with delay to avoid unnecessary loads)
 * @param importFn - Dynamic import function
 * @param delay - Delay in ms before prefetching (default: 50ms)
 */
export function prefetchOnHover(
  importFn: () => Promise<any>,
  delay: number = 50
): {
  onMouseEnter: () => void
  onFocus: () => void
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const trigger = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      prefetchComponent(importFn)
      timeoutId = null
    }, delay)
  }

  return {
    onMouseEnter: trigger,
    onFocus: trigger
  }
}

/**
 * Prefetches a component when element enters viewport (Intersection Observer)
 * @param element - HTML element to observe
 * @param importFn - Dynamic import function
 * @param options - Intersection Observer options
 */
export function prefetchOnVisible(
  element: HTMLElement,
  importFn: () => Promise<any>,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        prefetchComponent(importFn)
        observer.disconnect()
      }
    })
  }, options)

  observer.observe(element)

  // Return cleanup function
  return () => observer.disconnect()
}

/**
 * Prefetches components during browser idle time
 * Uses requestIdleCallback if available, falls back to setTimeout
 * @param components - Array of import functions
 */
export function prefetchOnIdle(
  components: Array<() => Promise<any>>
): void {
  const prefetchNext = (index: number) => {
    if (index >= components.length) return

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchComponent(components[index])
        prefetchNext(index + 1)
      })
    } else {
      setTimeout(() => {
        prefetchComponent(components[index])
        prefetchNext(index + 1)
      }, 100)
    }
  }

  prefetchNext(0)
}

/**
 * Prefetches likely next components based on current route/tab
 * For tab-based navigation patterns
 * @param currentTab - Current tab identifier
 * @param tabMap - Map of tab IDs to import functions
 * @param adjacentOnly - Only prefetch adjacent tabs (default: true)
 */
export function prefetchAdjacentTabs(
  currentTab: string,
  tabMap: Record<string, () => Promise<any>>,
  adjacentOnly: boolean = true
): void {
  const tabs = Object.keys(tabMap)
  const currentIndex = tabs.indexOf(currentTab)

  if (currentIndex === -1) return

  const toPrefetch: string[] = []

  if (adjacentOnly) {
    // Prefetch previous and next tabs
    if (currentIndex > 0) {
      toPrefetch.push(tabs[currentIndex - 1])
    }
    if (currentIndex < tabs.length - 1) {
      toPrefetch.push(tabs[currentIndex + 1])
    }
  } else {
    // Prefetch all tabs except current
    toPrefetch.push(...tabs.filter(t => t !== currentTab))
  }

  // Prefetch during idle time
  prefetchOnIdle(toPrefetch.map(tab => tabMap[tab]))
}

/**
 * Clears the prefetch cache
 */
export function clearPrefetchCache(): void {
  prefetchCache.clear()
}
