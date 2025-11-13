import type { Challenge, UserState, Task, Practice } from './types'

export function generateDailyChallenges(): Omit<Challenge, 'completedAt'>[] {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  return [
    {
      id: 'daily_power_hour',
      name: 'Power Hour',
      description: 'Complete 3 tasks before 9 AM',
      icon: '⏰',
      type: 'daily',
      difficulty: 'medium',
      xpReward: 100,
      expiresAt: today.toISOString(),
      condition: (state, tasks) => {
        const morning = tasks.filter(t =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt).getHours() < 9 &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        )
        return morning.length >= 3
      },
      progress: (state, tasks) => {
        const morning = tasks.filter(t =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt).getHours() < 9 &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        )
        return { current: Math.min(morning.length, 3), total: 3 }
      }
    },
    {
      id: 'daily_high_leverage',
      name: 'High Impact Day',
      description: 'Complete 5 high-leverage tasks (7+)',
      icon: '🎯',
      type: 'daily',
      difficulty: 'hard',
      xpReward: 150,
      expiresAt: today.toISOString(),
      condition: (state, tasks) => {
        const highLeverage = tasks.filter(t =>
          t.completed &&
          t.leverageScore >= 7 &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        )
        return highLeverage.length >= 5
      },
      progress: (state, tasks) => {
        const highLeverage = tasks.filter(t =>
          t.completed &&
          t.leverageScore >= 7 &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        )
        return { current: Math.min(highLeverage.length, 5), total: 5 }
      }
    },
    {
      id: 'daily_perfect_practices',
      name: 'Perfect Day',
      description: 'Complete all scheduled practices',
      icon: '✨',
      type: 'daily',
      difficulty: 'hard',
      xpReward: 200,
      expiresAt: today.toISOString(),
      condition: (state, tasks, practices) => {
        const today = new Date().getDay()
        const scheduled = practices.filter(p =>
          p.frequency === 'daily' ||
          (p.frequency === 'custom' && p.scheduleDays?.includes(today))
        )
        return scheduled.length > 0 && scheduled.every(p => p.todayCompleted)
      },
      progress: (state, tasks, practices) => {
        const today = new Date().getDay()
        const scheduled = practices.filter(p =>
          p.frequency === 'daily' ||
          (p.frequency === 'custom' && p.scheduleDays?.includes(today))
        )
        const completed = scheduled.filter(p => p.todayCompleted)
        return { current: completed.length, total: scheduled.length }
      }
    },
    {
      id: 'daily_streak_keeper',
      name: 'Streak Keeper',
      description: 'Keep your streak alive today',
      icon: '🔥',
      type: 'daily',
      difficulty: 'easy',
      xpReward: 50,
      expiresAt: today.toISOString(),
      condition: (state) => {
        return new Date(state.lastActive).toDateString() === new Date().toDateString()
      },
      progress: (state) => ({
        current: new Date(state.lastActive).toDateString() === new Date().toDateString() ? 1 : 0,
        total: 1
      })
    },
    {
      id: 'daily_xp_sprint',
      name: 'XP Sprint',
      description: 'Earn 500 XP today',
      icon: '⚡',
      type: 'daily',
      difficulty: 'hard',
      xpReward: 100,
      expiresAt: today.toISOString(),
      condition: (state, tasks) => {
        const todayXP = tasks.filter(t =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        ).reduce((sum, t) => sum + (t.xpEarned || 0), 0)
        return todayXP >= 500
      },
      progress: (state, tasks) => {
        const todayXP = tasks.filter(t =>
          t.completed &&
          t.completedAt &&
          new Date(t.completedAt).toDateString() === new Date().toDateString()
        ).reduce((sum, t) => sum + (t.xpEarned || 0), 0)
        return { current: Math.min(todayXP, 500), total: 500 }
      }
    }
  ]
}

export function checkChallengeCompletion(
  challenge: Challenge,
  state: UserState,
  tasks: Task[],
  practices: Practice[]
): boolean {
  if (challenge.completedAt) return true
  if (new Date(challenge.expiresAt) < new Date()) return false

  return challenge.condition(state, tasks, practices)
}
