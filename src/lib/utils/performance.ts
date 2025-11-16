/**
 * Performance utilities for optimizing user interactions and computations
 */

/**
 * Debounces a function call, delaying execution until after the specified delay
 * Useful for search inputs, auto-save, and other frequent user interactions
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttles a function call, ensuring it's called at most once per interval
 * Useful for scroll handlers, resize handlers, and other high-frequency events
 *
 * @param fn - Function to throttle
 * @param interval - Minimum interval between calls in milliseconds (default: 100ms)
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 100
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastCall >= interval) {
      lastCall = now
      fn.apply(this, args)
    }
  }
}

/**
 * Memoizes a function, caching results for identical inputs
 * Useful for expensive computations with repeated inputs
 *
 * @param fn - Function to memoize
 * @param getKey - Optional function to generate cache key from arguments
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  } as T
}

/**
 * Creates a simple LRU (Least Recently Used) cache
 * Automatically evicts oldest entries when size limit is reached
 *
 * @param maxSize - Maximum number of entries to cache
 * @returns Cache object with get/set methods
 */
export function createLRUCache<K, V>(maxSize: number = 100) {
  const cache = new Map<K, V>()

  return {
    get(key: K): V | undefined {
      if (!cache.has(key)) return undefined

      // Move to end (most recently used)
      const value = cache.get(key)!
      cache.delete(key)
      cache.set(key, value)
      return value
    },

    set(key: K, value: V): void {
      // Delete if exists to update position
      if (cache.has(key)) {
        cache.delete(key)
      }

      // Add to end
      cache.set(key, value)

      // Evict oldest if over limit
      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
    },

    has(key: K): boolean {
      return cache.has(key)
    },

    clear(): void {
      cache.clear()
    },

    get size(): number {
      return cache.size
    }
  }
}

/**
 * Batches multiple function calls into a single execution
 * Useful for reducing database queries or API calls
 *
 * @param fn - Function to batch
 * @param delay - Delay before executing batch (default: 50ms)
 * @returns Batched function that returns a promise
 */
export function batch<T, R>(
  fn: (items: T[]) => Promise<R[]>,
  delay: number = 50
): (item: T) => Promise<R> {
  let queue: Array<{ item: T; resolve: (value: R) => void; reject: (error: any) => void }> = []
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  async function flush() {
    if (queue.length === 0) return

    const currentQueue = queue
    queue = []
    timeoutId = null

    try {
      const items = currentQueue.map(q => q.item)
      const results = await fn(items)

      currentQueue.forEach((q, index) => {
        q.resolve(results[index])
      })
    } catch (error) {
      currentQueue.forEach(q => {
        q.reject(error)
      })
    }
  }

  return (item: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      queue.push({ item, resolve, reject })

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(flush, delay)
    })
  }
}

/**
 * RequestAnimationFrame-based debounce for smooth animations
 * Ensures function runs on next animation frame
 *
 * @param fn - Function to run on RAF
 * @returns RAF-debounced function
 */
export function rafDebounce<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function (this: any, ...args: Parameters<T>) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
    }

    rafId = requestAnimationFrame(() => {
      fn.apply(this, args)
      rafId = null
    })
  }
}
