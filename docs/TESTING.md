# Testing Guide

**Last Updated:** 2025-11-16

## Overview

Lifer uses [Vitest](https://vitest.dev/) for unit and component testing. This guide covers how to write, run, and maintain tests.

---

## Quick Start

### Run Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## Test Structure

Tests are located alongside the code they test:

```
src/
├── lib/
│   ├── utils/
│   │   ├── performance.ts
│   │   └── performance.test.ts  # Unit tests
│   └── db/
│       ├── export.ts
│       └── export.test.ts        # Unit tests
└── components/
    ├── EmptyState.svelte
    └── EmptyState.spec.ts        # Component tests
```

---

## Unit Testing

### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myModule'

describe('MyModule', () => {
  it('should do something', () => {
    const result = myFunction('input')
    expect(result).toBe('expected output')
  })
})
```

### Example: Testing Utilities

```typescript
import { describe, it, expect, vi } from 'vitest'
import { debounce } from './performance'

describe('debounce', () => {
  it('should delay function execution', () => {
    vi.useFakeTimers()

    const fn = vi.fn()
    const debounced = debounce(fn, 300)

    debounced()
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledOnce()

    vi.restoreAllMocks()
  })
})
```

---

## Component Testing

### Writing Component Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import MyComponent from './MyComponent.svelte'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(MyComponent, { props: { title: 'Test' } })

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Example: Testing Interactive Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Button from './Button.svelte'

describe('Button', () => {
  it('should handle click events', async () => {
    const { component } = render(Button)
    const button = screen.getByRole('button')

    await fireEvent.click(button)

    // Assert expected behavior
  })
})
```

---

## Mocking

### Mock Functions

```typescript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn('arg1', 'arg2')

expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledOnce()
```

### Mock Modules

```typescript
vi.mock('./myModule', () => ({
  myFunction: vi.fn(() => 'mocked value')
}))
```

### Mock IndexedDB

```typescript
// Already configured in src/test/setup.ts
import { get, set } from 'idb-keyval'

// Use normally in tests - they're mocked
await set('key', 'value')
const value = await get('key')
```

---

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - Visual HTML report
- `coverage/coverage-final.json` - JSON data

### Coverage Goals

- **Utility Functions:** 90%+ coverage
- **Business Logic:** 80%+ coverage
- **Components:** 70%+ coverage
- **Overall Project:** 75%+ coverage

---

## Best Practices

### 1. Test Organization

- **Group related tests** with `describe` blocks
- **Use descriptive test names** that explain what's being tested
- **One assertion per test** when possible

```typescript
describe('UserState', () => {
  describe('level calculation', () => {
    it('should return level 1 for 0-99 XP', () => {
      // ...
    })

    it('should return level 2 for 100-299 XP', () => {
      // ...
    })
  })
})
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should add two numbers', () => {
  // Arrange
  const a = 5
  const b = 10

  // Act
  const result = add(a, b)

  // Assert
  expect(result).toBe(15)
})
```

### 3. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('should handle division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
  })

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })
})
```

### 4. Avoid Testing Implementation Details

```typescript
// ❌ Bad - tests implementation
it('should call internal method', () => {
  const component = new MyComponent()
  component.internalMethod()
  expect(component.internalState).toBe(true)
})

// ✅ Good - tests behavior
it('should display success message after submission', async () => {
  render(MyComponent)
  await submitForm()
  expect(screen.getByText('Success!')).toBeInTheDocument()
})
```

---

## Common Testing Patterns

### Testing Async Functions

```typescript
it('should load data asynchronously', async () => {
  const data = await loadData()
  expect(data).toEqual({ id: 1, name: 'Test' })
})
```

### Testing Timers

```typescript
it('should execute after delay', () => {
  vi.useFakeTimers()

  const callback = vi.fn()
  setTimeout(callback, 1000)

  vi.advanceTimersByTime(1000)
  expect(callback).toHaveBeenCalled()

  vi.restoreAllMocks()
})
```

### Testing Events

```typescript
it('should emit event on click', async () => {
  const { component } = render(MyComponent)
  const handleEvent = vi.fn()

  component.$on('customEvent', handleEvent)

  await fireEvent.click(screen.getByRole('button'))

  expect(handleEvent).toHaveBeenCalled()
})
```

---

## Continuous Integration

### GitHub Actions (Example)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npm run test:run
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Debugging Tests

### Run Specific Test File

```bash
npm test performance.test.ts
```

### Run Specific Test

```bash
npm test -t "should debounce function calls"
```

### Debug with Browser DevTools

```bash
npm run test:ui
```

Opens Vitest UI in browser for interactive debugging.

---

## Troubleshooting

### Tests Fail with "Cannot find module"

Make sure module paths are correct and dependencies are installed:

```bash
npm install
```

### Tests Timeout

Increase timeout for async tests:

```typescript
it('should load slowly', async () => {
  // ...
}, 10000) // 10 second timeout
```

### Mock Not Working

Ensure mock is defined before import:

```typescript
vi.mock('./module')  // Must be before import
import { fn } from './module'
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Testing Best Practices](https://testingjavascript.com/)

---

## Contributing

When adding new features:

1. ✅ Write tests first (TDD approach recommended)
2. ✅ Ensure all tests pass before committing
3. ✅ Maintain test coverage above project goals
4. ✅ Update this documentation if adding new patterns

---

## Existing Test Files

### Unit Tests
- `src/lib/utils/performance.test.ts` - Performance utility tests
- `src/lib/db/export.test.ts` - Export functionality tests

### Component Tests
- Coming soon...

---

## Future Enhancements

Planned testing improvements:

- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance benchmarks
- [ ] Integration tests for IndexedDB
- [ ] Accessibility testing
- [ ] Load testing for large datasets

---

## License

Tests are part of the Lifer project. See main README for license details.
