/**
 * Vitest setup file
 * Runs before all tests
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IndexedDB for tests
const mockIDB = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(() => Promise.resolve([])),
  clear: vi.fn()
}

vi.mock('idb-keyval', () => mockIDB)

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  callback(0)
  return 0
})

global.cancelAnimationFrame = vi.fn()
