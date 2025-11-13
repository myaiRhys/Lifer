import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { UserState } from '../types'

export async function getUserState(): Promise<UserState | null> {
  const state = await get(KEYS.USER_STATE)
  return state || null
}

export async function updateUserState(updates: Partial<UserState>): Promise<UserState | null> {
  const state = await getUserState()
  if (!state) return null

  const updated = { ...state, ...updates, lastActive: new Date().toISOString() }
  await set(KEYS.USER_STATE, updated)
  return updated
}

export async function addXP(amount: number): Promise<UserState | null> {
  const state = await getUserState()
  if (!state) return null

  let newXP = state.xp + amount
  let newLevel = state.level
  let xpForNextLevel = state.xpForNextLevel

  // Level up logic: each level requires level * 100 XP
  while (newXP >= xpForNextLevel) {
    newXP -= xpForNextLevel
    newLevel++
    xpForNextLevel = newLevel * 100
  }

  return updateUserState({
    xp: newXP,
    level: newLevel,
    xpForNextLevel
  })
}

export async function updateStreak(completed: boolean): Promise<UserState | null> {
  const state = await getUserState()
  if (!state) return null

  const today = new Date().toDateString()
  const lastActive = new Date(state.lastActive).toDateString()

  // If already updated today, don't update again
  if (today === lastActive) return state

  let currentStreak = state.currentStreak

  if (completed) {
    currentStreak++
  } else {
    currentStreak = 0
  }

  const longestStreak = Math.max(state.longestStreak, currentStreak)

  return updateUserState({
    currentStreak,
    longestStreak
  })
}

export async function updateStats(stats: Partial<Pick<UserState, 'hydration' | 'strength' | 'energy' | 'focus' | 'recovery'>>): Promise<UserState | null> {
  return updateUserState(stats)
}

export async function incrementMorningControl(): Promise<UserState | null> {
  const state = await getUserState()
  if (!state) return null

  return updateUserState({
    morningControlCount: state.morningControlCount + 1
  })
}

export async function calculateHealthStatsFromPractices(): Promise<UserState | null> {
  const { getPractices } = await import('./practices')
  const practices = await getPractices()

  // Find each practice by name
  const waterPractice = practices.find(p => p.name === 'Water Intake')
  const proteinPractice = practices.find(p => p.name === 'Protein')
  const sleepPractice = practices.find(p => p.name === 'Sleep')
  const strengthPractice = practices.find(p => p.name === 'Strength Training')
  const wrCPractice = practices.find(p => p.name === 'WRC (Walk/Run/Cardio)')
  const highLeveragePractice = practices.find(p => p.name === 'High-Leverage Work')
  const morningPowerPractice = practices.find(p => p.name === 'Morning Power Hour')

  // Calculate completion percentage for each practice
  const getCompletionPercentage = (practice: any) => {
    if (!practice) return 0
    if (practice.type === 'positive') {
      return Math.min((practice.todayValue / practice.target) * 100, 100)
    }
    return 0
  }

  // Map practices to health stats
  const hydration = getCompletionPercentage(waterPractice)

  const proteinScore = getCompletionPercentage(proteinPractice)
  const strengthScore = getCompletionPercentage(strengthPractice)
  const strength = Math.round((proteinScore + strengthScore) / 2)

  const sleepScore = getCompletionPercentage(sleepPractice)
  const wrcScore = getCompletionPercentage(wrCPractice)
  const energy = Math.round((sleepScore + wrcScore) / 2)

  const highLeverageScore = getCompletionPercentage(highLeveragePractice)
  const morningPowerScore = getCompletionPercentage(morningPowerPractice)
  const focus = Math.round((highLeverageScore + morningPowerScore) / 2)

  const recovery = Math.round(sleepScore)

  return updateUserState({
    hydration: Math.round(hydration),
    strength,
    energy,
    focus,
    recovery
  })
}
