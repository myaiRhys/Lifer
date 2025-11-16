/**
 * Unit tests for performance utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle, memoize, createLRUCache } from './performance'

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(299)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(fn).toHaveBeenCalledOnce()
    })

    it('should cancel previous calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced()
      vi.advanceTimersByTime(100)
      debounced()
      vi.advanceTimersByTime(100)
      debounced()

      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledOnce()
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced('test', 123)
      vi.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledWith('test', 123)
    })
  })

  describe('throttle', () => {
    it('should limit function calls', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled()
      expect(fn).toHaveBeenCalledOnce()

      throttled()
      expect(fn).toHaveBeenCalledOnce()

      vi.advanceTimersByTime(100)
      throttled()
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should pass arguments correctly', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled('arg1', 'arg2')
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })
  })

  describe('memoize', () => {
    it('should cache results', () => {
      const expensiveFn = vi.fn((x: number) => x * 2)
      const memoized = memoize(expensiveFn)

      const result1 = memoized(5)
      const result2 = memoized(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(expensiveFn).toHaveBeenCalledOnce()
    })

    it('should cache different inputs separately', () => {
      const fn = vi.fn((x: number) => x * 2)
      const memoized = memoize(fn)

      memoized(5)
      memoized(10)
      memoized(5)

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should support custom key function', () => {
      const fn = vi.fn((obj: { id: number }) => obj.id * 2)
      const memoized = memoize(fn, (obj) => `id-${obj.id}`)

      memoized({ id: 5 })
      memoized({ id: 5 })

      expect(fn).toHaveBeenCalledOnce()
    })
  })

  describe('createLRUCache', () => {
    it('should store and retrieve values', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.size).toBe(2)
    })

    it('should evict oldest entry when size exceeded', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)
      cache.set('d', 4) // Should evict 'a'

      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
      expect(cache.size).toBe(3)
    })

    it('should update LRU order on get', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      cache.get('a') // Move 'a' to end

      cache.set('d', 4) // Should evict 'b', not 'a'

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBeUndefined()
      expect(cache.get('c')).toBe(3)
      expect(cache.get('d')).toBe(4)
    })

    it('should support has method', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)

      expect(cache.has('a')).toBe(true)
      expect(cache.has('b')).toBe(false)
    })

    it('should clear all entries', () => {
      const cache = createLRUCache<string, number>(3)

      cache.set('a', 1)
      cache.set('b', 2)

      cache.clear()

      expect(cache.size).toBe(0)
      expect(cache.has('a')).toBe(false)
    })
  })
})
