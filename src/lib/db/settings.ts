import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { AppSettings } from '../types'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
  streakReminders: true,
  morningReminders: true,
  vibrationEnabled: true,
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  onboardingCompleted: false,
  lastWeeklyReview: null
}

export async function getSettings(): Promise<AppSettings> {
  const settings = await get(KEYS.SETTINGS)
  return settings || DEFAULT_SETTINGS
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const updated = { ...current, ...updates }
  await set(KEYS.SETTINGS, updated)
  return updated
}

export async function resetSettings(): Promise<AppSettings> {
  await set(KEYS.SETTINGS, DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
