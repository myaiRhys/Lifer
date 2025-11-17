/**
 * Touch Gesture Utilities
 *
 * Provides swipe, drag, and other touch gesture detection for mobile interactions.
 */

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeConfig {
  /**
   * Minimum distance in pixels to trigger swipe
   * @default 60
   */
  threshold?: number

  /**
   * Maximum time in ms for swipe gesture
   * @default 300
   */
  timeout?: number

  /**
   * Allowed directions
   * @default ['left', 'right']
   */
  directions?: SwipeDirection[]

  /**
   * Callback when swipe is detected
   */
  onSwipe?: (direction: SwipeDirection, distance: number) => void

  /**
   * Callback during swipe movement
   */
  onSwipeMove?: (direction: SwipeDirection, distance: number, percentage: number) => void

  /**
   * Callback when swipe is released but threshold not met
   */
  onSwipeCancel?: () => void

  /**
   * Enable haptic feedback
   * @default true
   */
  haptics?: boolean

  /**
   * Show visual feedback during swipe
   * @default true
   */
  visualFeedback?: boolean
}

interface TouchState {
  startX: number
  startY: number
  startTime: number
  currentX: number
  currentY: number
  isSwiping: boolean
}

/**
 * Svelte action for swipe gesture detection
 *
 * Usage:
 * <div use:swipe={{ onSwipe: (dir) => console.log(dir) }}>
 *   Swipe me!
 * </div>
 */
export function swipe(node: HTMLElement, config: SwipeConfig = {}) {
  const {
    threshold = 60,
    timeout = 300,
    directions = ['left', 'right'],
    onSwipe,
    onSwipeMove,
    onSwipeCancel,
    haptics = true,
    visualFeedback = true
  } = config

  let touchState: TouchState | null = null
  let swipeElement: HTMLElement | null = null

  // Create visual feedback element
  if (visualFeedback) {
    swipeElement = document.createElement('div')
    swipeElement.className = 'swipe-indicator'
    swipeElement.style.cssText = `
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 100;
    `
    node.style.position = 'relative'
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    touchState = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: false
    }

    // Add visual element
    if (swipeElement && node.contains(swipeElement) === false) {
      node.appendChild(swipeElement)
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!touchState) return

    const touch = e.touches[0]
    touchState.currentX = touch.clientX
    touchState.currentY = touch.clientY

    const deltaX = touchState.currentX - touchState.startX
    const deltaY = touchState.currentY - touchState.startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Determine if this is a swipe gesture
    if (!touchState.isSwiping && (absDeltaX > 10 || absDeltaY > 10)) {
      touchState.isSwiping = true

      // Determine primary direction
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        e.preventDefault() // Prevent scroll
      }
    }

    if (touchState.isSwiping) {
      // Calculate direction and distance
      let direction: SwipeDirection | null = null
      let distance = 0
      let percentage = 0

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left'
        distance = absDeltaX
        percentage = Math.min((distance / threshold) * 100, 100)

        // Update visual feedback
        if (swipeElement && directions.includes(direction)) {
          swipeElement.textContent = direction === 'left' ? '👈' : '👉'
          swipeElement.style.opacity = String(Math.min(percentage / 100, 0.8))
          swipeElement.style[direction === 'left' ? 'right' : 'left'] = '16px'
          swipeElement.style[direction === 'left' ? 'left' : 'right'] = 'auto'

          // Change color based on threshold
          if (distance >= threshold) {
            swipeElement.style.backgroundColor = 'rgba(74, 222, 128, 0.2)' // Green
          } else {
            swipeElement.style.backgroundColor = 'rgba(59, 130, 246, 0.2)' // Blue
          }
        }
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up'
        distance = absDeltaY
        percentage = Math.min((distance / threshold) * 100, 100)
      }

      // Call move callback
      if (direction && directions.includes(direction) && onSwipeMove) {
        onSwipeMove(direction, distance, percentage)
      }

      // Trigger haptic at threshold
      if (haptics && distance >= threshold && !touchState.isSwiping) {
        import('./haptics').then(({ Haptics }) => Haptics.medium())
      }
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!touchState) return

    const deltaX = touchState.currentX - touchState.startX
    const deltaY = touchState.currentY - touchState.startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    const duration = Date.now() - touchState.startTime

    // Hide visual feedback
    if (swipeElement) {
      swipeElement.style.opacity = '0'
      setTimeout(() => {
        if (swipeElement && swipeElement.parentNode) {
          swipeElement.parentNode.removeChild(swipeElement)
        }
      }, 200)
    }

    // Check if swipe is valid
    if (duration <= timeout && touchState.isSwiping) {
      let direction: SwipeDirection | null = null
      let distance = 0

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left'
        distance = absDeltaX
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up'
        distance = absDeltaY
      }

      if (direction && directions.includes(direction) && distance >= threshold) {
        // Valid swipe detected
        if (onSwipe) {
          onSwipe(direction, distance)
        }

        if (haptics) {
          import('./haptics').then(({ Haptics }) => Haptics.success())
        }
      } else if (onSwipeCancel) {
        // Swipe cancelled (threshold not met)
        onSwipeCancel()
      }
    } else if (onSwipeCancel && touchState.isSwiping) {
      onSwipeCancel()
    }

    touchState = null
  }

  // Add event listeners
  node.addEventListener('touchstart', handleTouchStart, { passive: true })
  node.addEventListener('touchmove', handleTouchMove, { passive: false })
  node.addEventListener('touchend', handleTouchEnd, { passive: true })

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchmove', handleTouchMove)
      node.removeEventListener('touchend', handleTouchEnd)

      // Clean up visual element
      if (swipeElement && swipeElement.parentNode) {
        swipeElement.parentNode.removeChild(swipeElement)
      }
    },
    update(newConfig: SwipeConfig) {
      // Allow updating config
      Object.assign(config, newConfig)
    }
  }
}

/**
 * Pull-to-refresh gesture
 *
 * Usage:
 * <div use:pullToRefresh={{ onRefresh: async () => { ... } }}>
 */
export interface PullToRefreshConfig {
  /**
   * Threshold distance to trigger refresh (in pixels)
   * @default 80
   */
  threshold?: number

  /**
   * Callback when refresh is triggered
   */
  onRefresh: () => Promise<void> | void

  /**
   * Enable haptic feedback
   * @default true
   */
  haptics?: boolean
}

export function pullToRefresh(node: HTMLElement, config: PullToRefreshConfig) {
  const { threshold = 80, onRefresh, haptics = true } = config

  let startY = 0
  let currentY = 0
  let isRefreshing = false
  let pullDistance = 0

  // Create refresh indicator
  const indicator = document.createElement('div')
  indicator.className = 'pull-to-refresh-indicator'
  indicator.style.cssText = `
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    opacity: 0;
  `
  indicator.innerHTML = '⟳'

  function handleTouchStart(e: TouchEvent) {
    if (node.scrollTop === 0 && !isRefreshing) {
      startY = e.touches[0].clientY
      if (!node.contains(indicator)) {
        node.appendChild(indicator)
      }
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (startY === 0 || isRefreshing) return

    currentY = e.touches[0].clientY
    pullDistance = Math.max(0, currentY - startY)

    if (pullDistance > 0) {
      e.preventDefault()

      // Update indicator
      const progress = Math.min(pullDistance / threshold, 1)
      indicator.style.top = `${Math.min(pullDistance - 60, 20)}px`
      indicator.style.opacity = String(progress)
      indicator.style.transform = `translateX(-50%) rotate(${progress * 360}deg) scale(${progress})`

      // Trigger haptic at threshold
      if (haptics && pullDistance >= threshold && !isRefreshing) {
        import('./haptics').then(({ Haptics }) => Haptics.medium())
      }
    }
  }

  async function handleTouchEnd() {
    if (pullDistance >= threshold && !isRefreshing) {
      isRefreshing = true

      // Show loading state
      indicator.innerHTML = '⟳'
      indicator.style.animation = 'spin 1s linear infinite'

      if (haptics) {
        import('./haptics').then(({ Haptics }) => Haptics.success())
      }

      // Trigger refresh
      try {
        await onRefresh()
      } finally {
        isRefreshing = false
        indicator.style.opacity = '0'
        indicator.style.top = '-60px'
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator)
          }
        }, 300)
      }
    } else {
      // Reset
      indicator.style.opacity = '0'
      indicator.style.top = '-60px'
    }

    startY = 0
    currentY = 0
    pullDistance = 0
  }

  node.addEventListener('touchstart', handleTouchStart, { passive: true })
  node.addEventListener('touchmove', handleTouchMove, { passive: false })
  node.addEventListener('touchend', handleTouchEnd, { passive: true })

  return {
    destroy() {
      node.removeEventListener('touchstart', handleTouchStart)
      node.removeEventListener('touchmove', handleTouchMove)
      node.removeEventListener('touchend', handleTouchEnd)

      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator)
      }
    }
  }
}
