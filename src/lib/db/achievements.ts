import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Achievement } from '../types'
import { ACHIEVEMENTS, checkAchievements } from '../achievements'
import { getUserState } from './userState'
import { getHistory } from './history'

export async function getUnlockedAchievements(): Promise<Achievement[]> {
  return (await get(KEYS.ACHIEVEMENTS)) || []
}

export async function unlockAchievement(achievement: Achievement): Promise<void> {
  const unlocked = await getUnlockedAchievements()
  if (!unlocked.find(a => a.id === achievement.id)) {
    unlocked.push(achievement)
    await set(KEYS.ACHIEVEMENTS, unlocked)
  }
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const userState = await getUserState()
  if (!userState) return []

  const history = await getHistory()
  const unlocked = await getUnlockedAchievements()
  const unlockedIds = unlocked.map(a => a.id)

  const newAchievements = checkAchievements(userState, history, unlockedIds)

  for (const achievement of newAchievements) {
    await unlockAchievement(achievement)
  }

  return newAchievements
}

export async function getAchievementsWithProgress() {
  const userState = await getUserState()
  if (!userState) return []

  const history = await getHistory()
  const unlocked = await getUnlockedAchievements()
  const unlockedIds = unlocked.map(a => a.id)

  return ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlockedIds.includes(ach.id)
    const unlockedData = unlocked.find(a => a.id === ach.id)

    let progress = ach.progress ? ach.progress(userState, history) : undefined

    return {
      ...ach,
      unlocked: isUnlocked,
      unlockedAt: unlockedData?.unlockedAt,
      progress
    }
  })
}
