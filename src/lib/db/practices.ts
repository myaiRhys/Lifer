import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Practice } from '../types'

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

  // Recalculate health stats after logging a practice
  const { calculateHealthStatsFromPractices } = await import('./userState')
  await calculateHealthStatsFromPractices()

  return result
}
