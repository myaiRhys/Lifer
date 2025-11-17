<script lang="ts">
  import { Haptics } from '../../lib/haptics'

  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary'
  export let size: 'sm' | 'md' | 'lg' = 'md'
  export let disabled: boolean = false
  export let fullWidth: boolean = false
  export let type: 'button' | 'submit' | 'reset' = 'button'
  export let onclick: (() => void) | undefined = undefined

  /**
   * Enable haptic feedback on click
   * @default true
   */
  export let haptics: boolean = true

  /**
   * Haptic style to use
   * primary buttons use 'medium', secondary/ghost use 'light'
   */
  export let hapticStyle: 'light' | 'medium' | 'heavy' = variant === 'primary' ? 'medium' : 'light'

  const sizeClasses = {
    sm: 'text-body-small px-16 py-8',
    md: 'text-body px-24 py-12',
    lg: 'text-body-large px-32 py-16'
  }

  function handleClick(event: MouseEvent) {
    if (disabled) return

    // Trigger haptic feedback
    if (haptics) {
      if (hapticStyle === 'light') {
        Haptics.tap()
      } else if (hapticStyle === 'medium') {
        Haptics.select()
      } else if (hapticStyle === 'heavy') {
        Haptics.impact()
      }
    }

    // Call onclick handler if provided
    if (onclick) {
      onclick()
    }
  }
</script>

<button
  {type}
  {disabled}
  class="btn btn-{variant} {sizeClasses[size]} {fullWidth ? 'w-full' : ''}"
  on:click={handleClick}
>
  <slot />
</button>

<style>
  /* Styles are defined in app.css */
</style>
