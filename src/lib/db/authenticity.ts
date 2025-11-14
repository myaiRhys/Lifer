import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { AuthenticityLog } from '../types'

export async function getAuthenticityLogs(): Promise<AuthenticityLog[]> {
  const logs = await get(KEYS.AUTHENTICITY_LOGS)
  return logs || []
}

export async function getAuthenticityLogByDate(date: string): Promise<AuthenticityLog | undefined> {
  const logs = await getAuthenticityLogs()
  return logs.find(log => log.date === date)
}

export async function getTodayAuthenticityLog(): Promise<AuthenticityLog | undefined> {
  const today = new Date().toISOString().split('T')[0]
  return await getAuthenticityLogByDate(today)
}

export async function logAuthenticity(
  score: number,
  boundariesHonored: number,
  bodySignals: string[],
  notes?: string
): Promise<AuthenticityLog> {
  const logs = await getAuthenticityLogs()
  const today = new Date().toISOString().split('T')[0]

  // Check if log already exists for today
  const existingIndex = logs.findIndex(log => log.date === today)

  const log: AuthenticityLog = {
    id: existingIndex >= 0 ? logs[existingIndex].id : crypto.randomUUID(),
    date: today,
    score,
    boundariesHonored,
    bodySignals,
    notes,
    createdAt: existingIndex >= 0 ? logs[existingIndex].createdAt : new Date().toISOString()
  }

  if (existingIndex >= 0) {
    logs[existingIndex] = log
  } else {
    logs.push(log)
  }

  await set(KEYS.AUTHENTICITY_LOGS, logs)
  return log
}

export async function getAuthenticityStats(): Promise<{
  averageScore: number
  last7DaysAverage: number
  last30DaysAverage: number
  totalBoundariesHonored: number
  commonBodySignals: { signal: string; count: number }[]
  currentStreak: number // Days with score >= 7
  longestStreak: number
}> {
  const logs = await getAuthenticityLogs()

  if (logs.length === 0) {
    return {
      averageScore: 0,
      last7DaysAverage: 0,
      last30DaysAverage: 0,
      totalBoundariesHonored: 0,
      commonBodySignals: [],
      currentStreak: 0,
      longestStreak: 0
    }
  }

  // Sort logs by date descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate averages
  const allScores = logs.map(l => l.score)
  const averageScore = Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length * 10) / 10

  const last7Days = sortedLogs.slice(0, 7)
  const last7DaysAverage = last7Days.length > 0
    ? Math.round(last7Days.reduce((sum, l) => sum + l.score, 0) / last7Days.length * 10) / 10
    : 0

  const last30Days = sortedLogs.slice(0, 30)
  const last30DaysAverage = last30Days.length > 0
    ? Math.round(last30Days.reduce((sum, l) => sum + l.score, 0) / last30Days.length * 10) / 10
    : 0

  // Total boundaries honored
  const totalBoundariesHonored = logs.reduce((sum, l) => sum + l.boundariesHonored, 0)

  // Common body signals
  const signalCounts: Record<string, number> = {}
  logs.forEach(log => {
    log.bodySignals.forEach(signal => {
      signalCounts[signal] = (signalCounts[signal] || 0) + 1
    })
  })

  const commonBodySignals = Object.entries(signalCounts)
    .map(([signal, count]) => ({ signal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Calculate streaks (days with score >= 7)
  const sortedByDateAsc = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const goodDays = sortedByDateAsc.filter(l => l.score >= 7).map(l => l.date)

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Check if we have a current streak (today or yesterday must be good)
  if (goodDays.length > 0) {
    const lastGoodDay = goodDays[goodDays.length - 1]
    if (lastGoodDay === today || lastGoodDay === yesterday) {
      // Calculate current streak
      for (let i = goodDays.length - 1; i >= 0; i--) {
        const expectedDate = new Date(Date.now() - (currentStreak * 86400000)).toISOString().split('T')[0]
        if (goodDays[i] === expectedDate) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < goodDays.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(goodDays[i - 1])
        const currDate = new Date(goodDays[i])
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

        if (dayDiff === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }
  }

  return {
    averageScore,
    last7DaysAverage,
    last30DaysAverage,
    totalBoundariesHonored,
    commonBodySignals,
    currentStreak,
    longestStreak
  }
}

// Check if authenticity score has been low for 3+ consecutive days
export async function checkLowAuthenticityAlert(): Promise<{
  shouldAlert: boolean
  consecutiveLowDays: number
  lastLowScores: number[]
}> {
  const logs = await getAuthenticityLogs()
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  let consecutiveLowDays = 0
  const lastLowScores: number[] = []

  for (const log of sortedLogs) {
    if (log.score < 7) {
      consecutiveLowDays++
      lastLowScores.push(log.score)
      if (consecutiveLowDays >= 3) break
    } else {
      break
    }
  }

  return {
    shouldAlert: consecutiveLowDays >= 3,
    consecutiveLowDays,
    lastLowScores: lastLowScores.slice(0, 3)
  }
}

// Get authenticity trend (improving, stable, declining)
export async function getAuthenticityTrend(): Promise<'improving' | 'stable' | 'declining'> {
  const logs = await getAuthenticityLogs()
  if (logs.length < 7) return 'stable'

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const last3Days = sortedLogs.slice(0, 3)
  const previous4Days = sortedLogs.slice(3, 7)

  if (last3Days.length < 3 || previous4Days.length < 4) return 'stable'

  const last3Avg = last3Days.reduce((sum, l) => sum + l.score, 0) / last3Days.length
  const prev4Avg = previous4Days.reduce((sum, l) => sum + l.score, 0) / previous4Days.length

  if (last3Avg > prev4Avg + 0.5) return 'improving'
  if (last3Avg < prev4Avg - 0.5) return 'declining'
  return 'stable'
}

// Get recommended reflection prompts based on recent logs
export async function getReflectionPrompts(): Promise<string[]> {
  const stats = await getAuthenticityStats()
  const alert = await checkLowAuthenticityAlert()
  const prompts: string[] = []

  if (alert.shouldAlert) {
    prompts.push(`Your authenticity has been below 7 for ${alert.consecutiveLowDays} days. What's pulling you away from yourself?`)
    prompts.push("Are you saying 'yes' when you mean 'no'? What boundaries need reinforcement?")
  }

  if (stats.averageScore < 6) {
    prompts.push("Your average authenticity is low. What would living more authentically look like for you?")
  }

  if (stats.totalBoundariesHonored === 0 && stats.last7DaysAverage > 0) {
    prompts.push("You haven't honored any boundaries recently. Are you people-pleasing or avoiding conflict?")
  }

  if (stats.commonBodySignals.length > 0) {
    const topSignal = stats.commonBodySignals[0]
    prompts.push(`Your body frequently signals "${topSignal.signal}". What is it trying to tell you?`)
  }

  if (prompts.length === 0) {
    prompts.push("How true to yourself were you today?")
    prompts.push("What moments felt aligned vs. forced?")
    prompts.push("What did your body tell you today?")
  }

  return prompts
}

// Common body signals for quick selection
export const COMMON_BODY_SIGNALS = [
  'Tension in neck/shoulders',
  'Headache',
  'Tight chest',
  'Stomach discomfort',
  'Fatigue/exhaustion',
  'Restlessness',
  'Racing heart',
  'Shallow breathing',
  'Jaw clenching',
  'Back pain',
  'Difficulty sleeping',
  'Loss of appetite',
  'Increased appetite',
  'Brain fog'
]
