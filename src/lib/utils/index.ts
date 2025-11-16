/**
 * Centralized utilities index
 * Re-exports all utility functions for easy importing
 */

export {
  debounce,
  throttle,
  memoize,
  createLRUCache,
  batch,
  rafDebounce
} from './performance'

export {
  prefetchComponent,
  prefetchComponents,
  prefetchOnHover,
  prefetchOnVisible,
  prefetchOnIdle,
  prefetchAdjacentTabs,
  clearPrefetchCache
} from './prefetch'
