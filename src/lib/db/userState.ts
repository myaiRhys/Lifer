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
