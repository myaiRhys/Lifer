<script lang="ts">
  import { Haptics } from '../../lib/haptics'

  export let checked: boolean = false
  export let disabled: boolean = false
  export let label: string = ''
  export let id: string = `checkbox-${Math.random().toString(36).substr(2, 9)}`

  /**
   * Enable haptic feedback on toggle
   * @default true
   */
  export let haptics: boolean = true

  function handleChange(event: Event) {
    if (disabled) return

    // Trigger haptic feedback on toggle
    if (haptics) {
      // Use selection haptic for checkbox toggle
      Haptics.selection()
    }
  }
</script>

<div class="flex items-center gap-12">
  <input
    {id}
    type="checkbox"
    {disabled}
    bind:checked
    class="checkbox"
    on:change={handleChange}
  />
  {#if label}
    <label for={id} class="text-body text-text-primary cursor-pointer select-none">
      {label}
    </label>
  {:else}
    <label for={id} class="cursor-pointer">
      <slot />
    </label>
  {/if}
</div>

<style>
  /* Styles are defined in app.css */
</style>
