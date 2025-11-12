import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { UserState, Practice } from '../types'

export const CORE_PRACTICES: Omit<Practice, 'id' | 'habitStrength' | 'currentStreak' | 'longestStreak' | 'todayValue' | 'todayCompleted' | 'lastLoggedAt' | 'createdAt'>[] = [
  {
    name: "Sleep",
    type: "positive",
    target: 8,
    unit: "hours",
    frequency: "daily",
    description: "7-9 hours optimal for testosterone and recovery"
  },
  {
    name: "Water Intake",
    type: "positive",
    target: 3700,
    unit: "ml",
    frequency: "daily",
    description: "Minimum daily fluid intake"
  },
  {
    name: "Protein",
    type: "positive",
    target: 180,
    unit: "grams",
    frequency: "daily",
    description: "Muscle maintenance, 0.7-1g per pound bodyweight"
  },
  {
    name: "Morning Sun Exposure",
    type: "positive",
    target: 15,
    unit: "minutes",
    frequency: "daily",
    description: "Circadian rhythm, testosterone production"
  },
  {
    name: "Strength Training",
    type: "positive",
    target: 1,
    unit: "session",
    frequency: "custom",
    scheduleDays: [1, 3, 5],
    description: "Compound movements, 3x per week minimum"
  },
  {
    name: "High-Leverage Work",
    type: "positive",
    target: 2,
    unit: "hours",
    frequency: "daily",
    description: "Deep focus blocks on leverage 7+ tasks"
  },
  {
    name: "Morning Power Hour",
    type: "positive",
    target: 1,
    unit: "completion",
    frequency: "daily",
    description: "Complete at least one high-leverage task in first 90 min"
  }
]

function createDefaultUserState(): UserState {
  return {
    id: "user_state",
    xp: 0,
    level: 1,
    xpForNextLevel: 100,
    morningMultiplier: false,
    peakPerformanceMultiplier: false,
    hydration: 0,
    strength: 0,
    energy: 0,
    focus: 0,
    recovery: 0,
    currentStreak: 0,
    longestStreak: 0,
    morningControlCount: 0,
    lifetimeLeverageRatio: 0,
    last7DaysLeverageRatio: 0,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastMidnightReset: new Date().toISOString()
  }
}

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function initializeStorage() {
  let userState = await get(KEYS.USER_STATE)

  if (!userState) {
    // First-time setup
    userState = createDefaultUserState()
    await set(KEYS.USER_STATE, userState)

    // Seed core practices
    const practices: Practice[] = CORE_PRACTICES.map(p => ({
      ...p,
      id: generateUUID(),
      habitStrength: 0,
      currentStreak: 0,
      longestStreak: 0,
      todayValue: 0,
      todayCompleted: false,
      lastLoggedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }))
    await set(KEYS.PRACTICES, practices)
  }

  // Initialize empty arrays if needed
  if (!await get(KEYS.TASKS)) await set(KEYS.TASKS, [])
  if (!await get(KEYS.OUTCOMES)) await set(KEYS.OUTCOMES, [])
  if (!await get(KEYS.HISTORY)) await set(KEYS.HISTORY, [])
}
