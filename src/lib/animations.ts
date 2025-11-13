import confetti from 'canvas-confetti'

// Confetti effects
export function celebrateTaskComplete(leverageScore: number) {
  const particleCount = leverageScore >= 7 ? 150 : 80
  const spread = leverageScore >= 7 ? 100 : 70

  confetti({
    particleCount,
    spread,
    origin: { y: 0.6 },
    colors: leverageScore >= 7
      ? ['#10b981', '#34d399', '#6ee7b7', '#fbbf24']
      : ['#3b82f6', '#60a5fa', '#93c5fd']
  })
}

export function celebrateLevelUp() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#fbbf24', '#f59e0b', '#d97706']
    })

    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#fbbf24', '#f59e0b', '#d97706']
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

export function celebrateStreak(days: number) {
  const colors = days >= 30 ? ['#ef4444', '#f97316', '#fbbf24']
    : days >= 7 ? ['#3b82f6', '#60a5fa', '#93c5fd']
    : ['#10b981', '#34d399', '#6ee7b7']

  confetti({
    particleCount: days >= 30 ? 200 : 100,
    spread: 120,
    origin: { y: 0.5 },
    colors
  })
}

export function celebrateAchievement() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#a855f7', '#c084fc', '#e9d5ff', '#fbbf24'],
    shapes: ['star']
  })
}

// Floating XP animation
export function showFloatingXP(element: HTMLElement, xp: number) {
  const floater = document.createElement('div')
  floater.textContent = `+${xp} XP`
  floater.style.cssText = `
    position: fixed;
    left: ${element.getBoundingClientRect().left}px;
    top: ${element.getBoundingClientRect().top}px;
    color: #fbbf24;
    font-weight: bold;
    font-size: 1.5rem;
    pointer-events: none;
    z-index: 9999;
    animation: floatUp 1.5s ease-out forwards;
  `

  document.body.appendChild(floater)

  setTimeout(() => floater.remove(), 1500)
}

// Add CSS animation for floating
const style = document.createElement('style')
style.textContent = `
  @keyframes floatUp {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(1.5);
    }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .pulse-once {
    animation: pulse 0.5s ease-in-out;
  }
`
document.head.appendChild(style)

// Haptic feedback
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50
    }
    navigator.vibrate(patterns[type])
  }
}

export function hapticSuccess() {
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 50, 10])
  }
}

export function hapticLevelUp() {
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 100, 50, 100, 100])
  }
}
