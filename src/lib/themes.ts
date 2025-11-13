import type { Theme } from './types'

export const themes: Record<Theme, { name: string; colors: Record<string, string> }> = {
  dark: {
    name: 'Dark Ocean',
    colors: {
      'bg-primary': '#0f172a',
      'bg-secondary': '#1e293b',
      'bg-tertiary': '#334155',
      'border': '#475569',
      'text-primary': '#f1f5f9',
      'text-secondary': '#cbd5e1',
      'text-muted': '#94a3b8',
      'accent': '#3b82f6',
      'accent-hover': '#2563eb'
    }
  },
  light: {
    name: 'Light Mode',
    colors: {
      'bg-primary': '#ffffff',
      'bg-secondary': '#f8fafc',
      'bg-tertiary': '#f1f5f9',
      'border': '#e2e8f0',
      'text-primary': '#0f172a',
      'text-secondary': '#475569',
      'text-muted': '#64748b',
      'accent': '#3b82f6',
      'accent-hover': '#2563eb'
    }
  },
  ocean: {
    name: 'Ocean Deep',
    colors: {
      'bg-primary': '#0a1929',
      'bg-secondary': '#0d2438',
      'bg-tertiary': '#173447',
      'border': '#2d4a5d',
      'text-primary': '#e3f2fd',
      'text-secondary': '#b3d9ff',
      'text-muted': '#6ba3cc',
      'accent': '#00b4d8',
      'accent-hover': '#0096c7'
    }
  },
  fire: {
    name: 'Ember Glow',
    colors: {
      'bg-primary': '#1a0f0a',
      'bg-secondary': '#2d1810',
      'bg-tertiary': '#3d2418',
      'border': '#5d3920',
      'text-primary': '#fff5e6',
      'text-secondary': '#ffd4a3',
      'text-muted': '#cc9966',
      'accent': '#ff6b35',
      'accent-hover': '#e63c00'
    }
  },
  forest: {
    name: 'Forest Night',
    colors: {
      'bg-primary': '#0a1f0a',
      'bg-secondary': '#0f2e0f',
      'bg-tertiary': '#1a3d1a',
      'border': '#2d5c2d',
      'text-primary': '#e8f5e8',
      'text-secondary': '#b8e6b8',
      'text-muted': '#7cbd7c',
      'accent': '#4ade80',
      'accent-hover': '#22c55e'
    }
  },
  sunset: {
    name: 'Sunset Horizon',
    colors: {
      'bg-primary': '#1f0a1a',
      'bg-secondary': '#2e0f26',
      'bg-tertiary': '#3d1736',
      'border': '#5c2952',
      'text-primary': '#ffe6f5',
      'text-secondary': '#ffb3e6',
      'text-muted': '#cc80b8',
      'accent': '#f472b6',
      'accent-hover': '#ec4899'
    }
  },
  military: {
    name: '🎖️ Military Command',
    colors: {
      'bg-primary': '#1a251a',
      'bg-secondary': '#243e24',
      'bg-tertiary': '#2d4d2d',
      'border': '#3d5c3d',
      'text-primary': '#e8f0e8',
      'text-secondary': '#c2d6c2',
      'text-muted': '#8fad8f',
      'accent': '#4ade80',
      'accent-hover': '#22c55e'
    }
  },
  cowboy: {
    name: '🤠 Wild West',
    colors: {
      'bg-primary': '#2d1810',
      'bg-secondary': '#4a2618',
      'bg-tertiary': '#6b3820',
      'border': '#8b4a28',
      'text-primary': '#fff5e6',
      'text-secondary': '#f5d6b3',
      'text-muted': '#d2a679',
      'accent': '#d2691e',
      'accent-hover': '#b8541a'
    }
  },
  academic: {
    name: '🎓 Academic Scholar',
    colors: {
      'bg-primary': '#1e1f3a',
      'bg-secondary': '#2d2f5f',
      'bg-tertiary': '#3d4080',
      'border': '#4d508f',
      'text-primary': '#f0f1ff',
      'text-secondary': '#d4d6ff',
      'text-muted': '#a0a5cc',
      'accent': '#6366f1',
      'accent-hover': '#4f46e5'
    }
  },
  cyberpunk: {
    name: '🤖 Cyberpunk',
    colors: {
      'bg-primary': '#0a0a1a',
      'bg-secondary': '#1a0a1f',
      'bg-tertiary': '#2a1030',
      'border': '#ff006e',
      'text-primary': '#00f5ff',
      'text-secondary': '#ff006e',
      'text-muted': '#b366ff',
      'accent': '#ff006e',
      'accent-hover': '#d6005c'
    }
  },
  zen: {
    name: '🌱 Zen Garden',
    colors: {
      'bg-primary': '#1a2e1a',
      'bg-secondary': '#2d4a2d',
      'bg-tertiary': '#40664b',
      'border': '#52b788',
      'text-primary': '#f0fff0',
      'text-secondary': '#d8f3d8',
      'text-muted': '#95d5b2',
      'accent': '#52b788',
      'accent-hover': '#40916c'
    }
  }
}

export function applyTheme(theme: Theme) {
  const themeColors = themes[theme].colors
  const root = document.documentElement

  Object.entries(themeColors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })

  // Store in localStorage for persistence
  localStorage.setItem('lifer-theme', theme)
}

export function getStoredTheme(): Theme {
  const stored = localStorage.getItem('lifer-theme')
  return (stored as Theme) || 'dark'
}

// Theme-specific terminology
export const themeLabels: Record<Theme, { xp: string; level: string; tasks: string; icon: string }> = {
  dark: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🎯' },
  light: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🎯' },
  ocean: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🌊' },
  fire: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🔥' },
  forest: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🌲' },
  sunset: { xp: 'XP', level: 'Level', tasks: 'Tasks', icon: '🌅' },
  military: { xp: 'Combat Points', level: 'Rank', tasks: 'Missions', icon: '🎖️' },
  cowboy: { xp: 'Honor Points', level: 'Renown', tasks: 'Bounties', icon: '🤠' },
  academic: { xp: 'Research Credits', level: 'Academic Rank', tasks: 'Assignments', icon: '🎓' },
  cyberpunk: { xp: 'Street Cred', level: 'Clearance', tasks: 'Exploits', icon: '🤖' },
  zen: { xp: 'Life Force', level: 'Growth Stage', tasks: 'Practices', icon: '🌱' }
}

export function getThemeLabels(theme?: Theme): typeof themeLabels[Theme] {
  const currentTheme = theme || getStoredTheme()
  return themeLabels[currentTheme] || themeLabels.dark
}
