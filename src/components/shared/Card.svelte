<script lang="ts">
  export let variant: 'default' | 'gradient' | 'glow' = 'default'
  export let gradient: string = 'from-slate-800 to-slate-900'
  export let hover: boolean = true
  export let padding: 'sm' | 'md' | 'lg' = 'md'

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const baseClasses = `
    rounded-2xl
    border
    transition-all duration-300
    ${paddingClasses[padding]}
  `

  const variantClasses = {
    default: `
      bg-slate-900/50
      backdrop-blur-xl
      border-slate-700/50
      ${hover ? 'hover:border-slate-600 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1' : ''}
    `,
    gradient: `
      bg-gradient-to-br ${gradient}
      backdrop-blur-xl
      border-slate-700
      shadow-xl shadow-black/20
      ${hover ? 'hover:shadow-2xl hover:shadow-blue-900/30 hover:border-blue-500/50 hover:-translate-y-1' : ''}
    `,
    glow: `
      bg-gradient-to-br ${gradient}
      backdrop-blur-xl
      border-transparent
      shadow-2xl shadow-blue-500/30
      relative
      overflow-hidden
      ${hover ? 'hover:shadow-blue-500/50 hover:scale-105' : ''}
    `
  }
</script>

<div class="{baseClasses} {variantClasses[variant]}">
  {#if variant === 'glow'}
    <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 -z-10"></div>
  {/if}
  <slot />
</div>

<style>
  div {
    will-change: transform;
  }
</style>
