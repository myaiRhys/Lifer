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
      'accent-hover': '#2563eb',
      'gradient-start': '#3b82f6',
      'gradient-mid': '#8b5cf6',
      'gradient-end': '#d946ef',
      'glow-color': 'rgba(59, 130, 246, 0.5)',
      'shimmer-color': 'rgba(139, 92, 246, 0.3)'
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
      'accent-hover': '#2563eb',
      'gradient-start': '#3b82f6',
      'gradient-mid': '#8b5cf6',
      'gradient-end': '#d946ef',
      'glow-color': 'rgba(59, 130, 246, 0.4)',
      'shimmer-color': 'rgba(139, 92, 246, 0.2)'
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
      'accent-hover': '#0096c7',
      'gradient-start': '#0066cc',
      'gradient-mid': '#0099ff',
      'gradient-end': '#00ccff',
      'glow-color': 'rgba(0, 180, 216, 0.6)',
      'shimmer-color': 'rgba(0, 204, 255, 0.3)'
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
      'accent-hover': '#e63c00',
      'gradient-start': '#ff4500',
      'gradient-mid': '#ff6347',
      'gradient-end': '#ff8c00',
      'glow-color': 'rgba(255, 107, 53, 0.7)',
      'shimmer-color': 'rgba(255, 140, 0, 0.4)'
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
      'accent-hover': '#22c55e',
      'gradient-start': '#228b22',
      'gradient-mid': '#32cd32',
      'gradient-end': '#90ee90',
      'glow-color': 'rgba(74, 222, 128, 0.6)',
      'shimmer-color': 'rgba(144, 238, 144, 0.3)'
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
      'accent-hover': '#ec4899',
      'gradient-start': '#ec4899',
      'gradient-mid': '#f472b6',
      'gradient-end': '#fbbf24',
      'glow-color': 'rgba(244, 114, 182, 0.6)',
      'shimmer-color': 'rgba(251, 191, 36, 0.3)'
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
      'accent-hover': '#22c55e',
      'gradient-start': '#3d5c3d',
      'gradient-mid': '#4ade80',
      'gradient-end': '#22c55e',
      'glow-color': 'rgba(74, 222, 128, 0.5)',
      'shimmer-color': 'rgba(61, 92, 61, 0.3)'
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
      'accent-hover': '#b8541a',
      'gradient-start': '#8b4a28',
      'gradient-mid': '#d2691e',
      'gradient-end': '#daa520',
      'glow-color': 'rgba(210, 105, 30, 0.6)',
      'shimmer-color': 'rgba(218, 165, 32, 0.3)'
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
      'accent-hover': '#4f46e5',
      'gradient-start': '#4f46e5',
      'gradient-mid': '#6366f1',
      'gradient-end': '#818cf8',
      'glow-color': 'rgba(99, 102, 241, 0.6)',
      'shimmer-color': 'rgba(129, 140, 248, 0.3)'
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
      'accent-hover': '#d6005c',
      'gradient-start': '#6b46c1',
      'gradient-mid': '#ff006e',
      'gradient-end': '#00f5ff',
      'glow-color': 'rgba(255, 0, 110, 0.8)',
      'shimmer-color': 'rgba(0, 245, 255, 0.4)'
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
      'accent-hover': '#40916c',
      'gradient-start': '#40916c',
      'gradient-mid': '#52b788',
      'gradient-end': '#95d5b2',
      'glow-color': 'rgba(82, 183, 136, 0.5)',
      'shimmer-color': 'rgba(149, 213, 178, 0.3)'
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
