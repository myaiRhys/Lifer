<script lang="ts">
  import { fly, fade, scale } from 'svelte/transition'
  import { cubicOut, quintOut } from 'svelte/easing'

  export let type: 'slide' | 'fade' | 'scale' = 'slide'
  export let direction: 'left' | 'right' | 'up' | 'down' = 'right'
  export let duration: number = 300
  export let delay: number = 0

  // Determine transition parameters based on direction
  $: transitionParams = {
    slide: {
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
      y: direction === 'up' ? -20 : direction === 'down' ? 20 : 0,
      duration,
      delay,
      easing: cubicOut
    },
    fade: {
      duration,
      delay,
      easing: quintOut
    },
    scale: {
      duration,
      delay,
      start: 0.95,
      easing: cubicOut
    }
  }
</script>

{#if type === 'slide'}
  <div
    in:fly={transitionParams.slide}
    out:fly={{ ...transitionParams.slide, x: -transitionParams.slide.x, y: -transitionParams.slide.y }}
  >
    <slot />
  </div>
{:else if type === 'fade'}
  <div
    in:fade={transitionParams.fade}
    out:fade={transitionParams.fade}
  >
    <slot />
  </div>
{:else if type === 'scale'}
  <div
    in:scale={transitionParams.scale}
    out:scale={transitionParams.scale}
  >
    <slot />
  </div>
{/if}

<style>
  div {
    width: 100%;
    height: 100%;
  }
</style>
