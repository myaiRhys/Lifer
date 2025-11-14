import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Practice } from '../types'
import { addIdentityVote, getIdentity, autoAddStreakEvidence } from './identity'

export async function getPractices(): Promise<Practice[]> {
  const practices = await get(KEYS.PRACTICES)
  return practices || []
}

export async function getPracticeById(id: string): Promise<Practice | undefined> {
  const practices = await getPractices()
  return practices.find(p => p.id === id)
}

export async function updatePractice(id: string, updates: Partial<Practice>): Promise<Practice | null> {
  const practices = await getPractices()
  const index = practices.findIndex(p => p.id === id)

  if (index === -1) return null

  practices[index] = { ...practices[index], ...updates }
  await set(KEYS.PRACTICES, practices)

  return practices[index]
}

export async function getTodaysPractices(): Promise<Practice[]> {
  const practices = await getPractices()
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

  return practices.filter(p => {
    if (p.frequency === 'daily') return true
    if (p.frequency === 'custom' && p.scheduleDays) {
      return p.scheduleDays.includes(today)
    }
    return false
  })
}

export async function logPractice(id: string, value: number): Promise<Practice | null> {
  const practice = await getPracticeById(id)
  if (!practice) return null

  const now = new Date().toISOString()
  const today = new Date().toDateString()
  const lastLogged = new Date(practice.lastLoggedAt).toDateString()

  // Check if already logged today
  const isNewDay = today !== lastLogged

  let currentStreak = practice.currentStreak
  let longestStreak = practice.longestStreak
  let cleanStreak = practice.cleanStreak || 0
  let longestCleanStreak = practice.longestCleanStreak || 0

  if (isNewDay) {
    if (practice.type === 'positive') {
      // For positive practices, completing the target continues the streak
      if (value >= practice.target) {
        currentStreak++
      } else {
        currentStreak = 0
      }
    } else {
      // For negative practices, staying under target continues streak
      if (value <= practice.target) {
        cleanStreak++
      } else {
        cleanStreak = 0
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak)
    longestCleanStreak = Math.max(longestCleanStreak, cleanStreak)
  }

  const todayCompleted = practice.type === 'positive'
    ? value >= practice.target
    : value <= practice.target

  // Update habit strength (0-100)
  let habitStrength = practice.habitStrength
  if (todayCompleted) {
    habitStrength = Math.min(100, habitStrength + 2)
  } else {
    habitStrength = Math.max(0, habitStrength - 5)
  }

  const result = await updatePractice(id, {
    todayValue: value,
    todayCompleted,
    currentStreak,
    longestStreak,
    cleanStreak,
    longestCleanStreak,
    habitStrength,
    lastLoggedAt: now,
    lastCompletedAt: todayCompleted ? now : practice.lastCompletedAt
  })

  // Add identity vote (if identity exists)
  const identity = await getIdentity()
  if (identity && todayCompleted) {
    const streakInfo = practice.type === 'positive'
      ? currentStreak > 0 ? `${currentStreak}-day streak` : undefined
      : cleanStreak > 0 ? `${cleanStreak}-day clean streak` : undefined

    await addIdentityVote(
      `Completed: ${practice.name}`,
      'practice',
      'for', // Practice completion votes FOR identity
      practice.id,
      streakInfo
    )

    // Auto-add streak evidence at milestones
    if (practice.type === 'positive' && currentStreak > 0) {
      await autoAddStreakEvidence(practice.id, practice.name, currentStreak)
    } else if (practice.type === 'negative' && cleanStreak > 0) {
      await autoAddStreakEvidence(practice.id, `${practice.name} (clean)`, cleanStreak)
    }
  } else if (identity && !todayCompleted && practice.type === 'negative') {
    // Negative practice: failing to stay under target votes AGAINST identity
    await addIdentityVote(
      `Slipped: ${practice.name}`,
      'practice',
      'against',
      practice.id,
      `Exceeded target: ${value} > ${practice.target}`
    )
  }

  // Update Never Miss Twice recovery tracking
  const { updatePracticeRecoveryStatus } = await import('./recovery')
  const updatedResult = await updatePracticeRecoveryStatus(result || practice, todayCompleted)

  // Recalculate health stats after logging a practice
  const { calculateHealthStatsFromPractices } = await import('./userState')
  await calculateHealthStatsFromPractices()

  return updatedResult
}

// Log practice with gateway completion option (2-Minute Rule)
export async function logPracticeGateway(id: string, completionType: 'gateway' | 'full'): Promise<Practice | null> {
  const practice = await getPracticeById(id)
  if (!practice) return null

  // Determine value based on completion type
  let value: number
  if (completionType === 'gateway' && practice.gatewayVersion) {
    value = practice.gatewayVersion.target
  } else {
    value = practice.target
  }

  // Update gateway/full counts
  const gatewayCount = (practice.gatewayCount || 0) + (completionType === 'gateway' ? 1 : 0)
  const fullCount = (practice.fullCount || 0) + (completionType === 'full' ? 1 : 0)

  // Update practice with completion type tracking
  await updatePractice(id, {
    lastCompletionType: completionType,
    gatewayCount,
    fullCount
  })

  // Use regular logPractice for streak/strength logic
  return await logPractice(id, value)
}

// Get gateway stats for a practice
export interface GatewayStats {
  totalCompletions: number
  gatewayCompletions: number
  fullCompletions: number
  gatewayPercentage: number
  lastCompletionType?: 'gateway' | 'intermediate' | 'full'
}

export async function getPracticeGatewayStats(id: string): Promise<GatewayStats | null> {
  const practice = await getPracticeById(id)
  if (!practice) return null

  const gatewayCompletions = practice.gatewayCount || 0
  const fullCompletions = practice.fullCount || 0
  const totalCompletions = gatewayCompletions + fullCompletions

  return {
    totalCompletions,
    gatewayCompletions,
    fullCompletions,
    gatewayPercentage: totalCompletions > 0 ? Math.round((gatewayCompletions / totalCompletions) * 100) : 0,
    lastCompletionType: practice.lastCompletionType
  }
}

// Get overall gateway analytics across all practices
export async function getGatewayAnalytics(): Promise<{
  practicesWithGateway: number
  totalCompletions: number
  totalGatewayCompletions: number
  totalFullCompletions: number
  overallGatewayPercentage: number
  streaksSavedByGateway: number
}> {
  const practices = await getPractices()

  let practicesWithGateway = 0
  let totalCompletions = 0
  let totalGatewayCompletions = 0
  let totalFullCompletions = 0
  let streaksSavedByGateway = 0

  for (const practice of practices) {
    if (practice.gatewayVersion) {
      practicesWithGateway++
    }

    const gatewayCount = practice.gatewayCount || 0
    const fullCount = practice.fullCount || 0

    totalGatewayCompletions += gatewayCount
    totalFullCompletions += fullCount
    totalCompletions += gatewayCount + fullCount

    // Estimate streaks saved: if current streak > 0 and has gateway completions
    if (practice.currentStreak > 0 && gatewayCount > 0) {
      // Conservative estimate: gateway was used on hard days
      streaksSavedByGateway += Math.min(gatewayCount, Math.floor(practice.currentStreak * 0.3))
    }
  }

  return {
    practicesWithGateway,
    totalCompletions,
    totalGatewayCompletions,
    totalFullCompletions,
    overallGatewayPercentage: totalCompletions > 0
      ? Math.round((totalGatewayCompletions / totalCompletions) * 100)
      : 0,
    streaksSavedByGateway
  }
}

// Set gateway version for a practice
export async function setPracticeGatewayVersion(
  id: string,
  gatewayName: string,
  gatewayTarget: number,
  gatewayUnit: string
): Promise<Practice | null> {
  return await updatePractice(id, {
    gatewayVersion: {
      name: gatewayName,
      target: gatewayTarget,
      unit: gatewayUnit
    }
  })
}

// Remove gateway version from a practice
export async function removePracticeGatewayVersion(id: string): Promise<Practice | null> {
  return await updatePractice(id, {
    gatewayVersion: undefined
  })
}
