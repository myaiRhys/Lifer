/**
 * Haptic Feedback Utility
 *
 * Provides cross-platform haptic feedback for iOS, Android, and web.
 * Falls back gracefully when haptics are not available.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

interface VibrationAPI {
  vibrate?: (pattern: number | number[]) => boolean
}

/**
 * Check if haptic feedback is available
 */
export function isHapticsAvailable(): boolean {
  // Check for iOS Haptic Engine (iOS 10+)
  if (typeof window !== 'undefined' && 'ondeviceready' in window) {
    return true
  }

  // Check for Vibration API (Android, some browsers)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    return true
  }

  return false
}

/**
 * Trigger haptic feedback
 *
 * @param style - The haptic feedback style
 * @param force - Force vibration even if user preference is to disable
 */
export function triggerHaptic(style: HapticStyle = 'light', force: boolean = false): void {
  // Check if user has disabled haptics (could be stored in settings)
  if (!force && !shouldUseHaptics()) {
    return
  }

  // Try iOS Haptic Engine first (best experience)
  if (triggerIOSHaptic(style)) {
    return
  }

  // Fallback to Vibration API
  triggerVibration(style)
}

/**
 * Check user preference for haptics
 */
function shouldUseHaptics(): boolean {
  try {
    const settings = localStorage.getItem('lifer-settings')
    if (settings) {
      const parsed = JSON.parse(settings)
      return parsed.hapticsEnabled !== false // Default to true
    }
  } catch (e) {
    // Ignore errors
  }
  return true
}

/**
 * Trigger iOS Haptic Engine feedback
 * Returns true if successful
 */
function triggerIOSHaptic(style: HapticStyle): boolean {
  // iOS 10+ Haptic Engine
  // This requires Capacitor or Cordova plugin in production
  // For web, we return false and fall back to vibration

  if (typeof window === 'undefined') return false

  // Check for Capacitor Haptics plugin
  // @ts-ignore - Capacitor types
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
    try {
      // @ts-ignore
      const { Haptics, ImpactStyle, NotificationType } = window.Capacitor.Plugins

      switch (style) {
        case 'light':
          Haptics.impact({ style: ImpactStyle.Light })
          return true
        case 'medium':
          Haptics.impact({ style: ImpactStyle.Medium })
          return true
        case 'heavy':
          Haptics.impact({ style: ImpactStyle.Heavy })
          return true
        case 'success':
          Haptics.notification({ type: NotificationType.Success })
          return true
        case 'warning':
          Haptics.notification({ type: NotificationType.Warning })
          return true
        case 'error':
          Haptics.notification({ type: NotificationType.Error })
          return true
        case 'selection':
          Haptics.selectionStart()
          Haptics.selectionChanged()
          Haptics.selectionEnd()
          return true
      }
    } catch (e) {
      console.warn('Haptics API error:', e)
      return false
    }
  }

  return false
}

/**
 * Trigger vibration using Vibration API
 */
function triggerVibration(style: HapticStyle): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return
  }

  const nav = navigator as unknown as VibrationAPI
  if (!nav.vibrate) return

  // Vibration patterns (in milliseconds)
  const patterns: Record<HapticStyle, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 30,
    success: [10, 50, 10],
    warning: [10, 50, 10, 50, 10],
    error: [30, 50, 30],
    selection: 5
  }

  try {
    nav.vibrate(patterns[style])
  } catch (e) {
    console.warn('Vibration API error:', e)
  }
}

/**
 * Haptic feedback presets for common interactions
 */
export const Haptics = {
  /**
   * Light tap feedback (buttons, checkboxes)
   */
  tap: () => triggerHaptic('light'),

  /**
   * Selection feedback (tabs, toggles)
   */
  select: () => triggerHaptic('selection'),

  /**
   * Success feedback (task completed, level up)
   */
  success: () => triggerHaptic('success'),

  /**
   * Warning feedback (at risk, low balance)
   */
  warning: () => triggerHaptic('warning'),

  /**
   * Error feedback (validation failed, streak lost)
   */
  error: () => triggerHaptic('error'),

  /**
   * Heavy impact (major milestone, achievement unlocked)
   */
  impact: () => triggerHaptic('heavy'),

  /**
   * Medium feedback (swipe action, drag)
   */
  medium: () => triggerHaptic('medium'),

  /**
   * Enable or disable haptics
   */
  setEnabled: (enabled: boolean) => {
    try {
      const settings = JSON.parse(localStorage.getItem('lifer-settings') || '{}')
      settings.hapticsEnabled = enabled
      localStorage.setItem('lifer-settings', JSON.stringify(settings))
    } catch (e) {
      console.warn('Failed to save haptics preference:', e)
    }
  },

  /**
   * Check if haptics are available
   */
  isAvailable: isHapticsAvailable
}

/**
 * Svelte action for haptic feedback on click
 *
 * Usage:
 * <button use:haptic={'light'}>Click me</button>
 * <button use:haptic={{ style: 'success' }}>Submit</button>
 */
export function haptic(node: HTMLElement, style: HapticStyle | { style: HapticStyle } = 'light') {
  const hapticStyle = typeof style === 'string' ? style : style.style

  function handleClick() {
    triggerHaptic(hapticStyle)
  }

  node.addEventListener('click', handleClick)

  return {
    destroy() {
      node.removeEventListener('click', handleClick)
    },
    update(newStyle: HapticStyle | { style: HapticStyle }) {
      // Allow updating the style
    }
  }
}
