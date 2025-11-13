import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { CouplesProfile, MorningSync, CoupleReward } from '../types'

function generateUUID(): string {
  return crypto.randomUUID()
}

// Couples Profile
export async function getCouplesProfile(): Promise<CouplesProfile | null> {
  return await get(KEYS.COUPLES_PROFILE) || null
}

export async function createCouplesProfile(
  partner1Id: string,
  partner2Id: string,
  partner1Name: string,
  partner2Name: string
): Promise<CouplesProfile> {
  const profile: CouplesProfile = {
    id: generateUUID(),
    partner1Id,
    partner2Id,
    partner1Name,
    partner2Name,
    relationshipLevel: 1,
    sharedXP: 0,
    couplesStreak: 0,
    sharedOutcomes: [],
    sharedRewards: [],
    createdAt: new Date().toISOString()
  }

  await set(KEYS.COUPLES_PROFILE, profile)
  return profile
}

export async function updateCouplesProfile(updates: Partial<CouplesProfile>): Promise<CouplesProfile | null> {
  const profile = await getCouplesProfile()
  if (!profile) return null

  const updated = { ...profile, ...updates }
  await set(KEYS.COUPLES_PROFILE, updated)
  return updated
}

export async function addCoupleXP(xp: number): Promise<CouplesProfile | null> {
  const profile = await getCouplesProfile()
  if (!profile) return null

  profile.sharedXP += xp

  // Level up every 1000 XP
  const newLevel = Math.floor(profile.sharedXP / 1000) + 1
  if (newLevel > profile.relationshipLevel) {
    profile.relationshipLevel = newLevel
  }

  await set(KEYS.COUPLES_PROFILE, profile)
  return profile
}

// Morning Syncs
export async function getMorningSyncs(): Promise<MorningSync[]> {
  return await get(KEYS.MORNING_SYNCS) || []
}

export async function getTodaysMorningSync(): Promise<MorningSync | null> {
  const syncs = await getMorningSyncs()
  const today = new Date().toISOString().split('T')[0]
  return syncs.find(s => s.date === today) || null
}

export async function createMorningSync(
  partner1Priorities: [string, string, string],
  partner2Priorities: [string, string, string],
  partner1Energy: number,
  partner2Energy: number,
  sharedSessionPlanned: boolean = false
): Promise<MorningSync> {
  const profile = await getCouplesProfile()
  if (!profile) throw new Error('No couples profile found')

  const syncs = await getMorningSyncs()
  const today = new Date().toISOString().split('T')[0]

  const sync: MorningSync = {
    id: generateUUID(),
    coupleId: profile.id,
    date: today,
    partner1Priorities,
    partner2Priorities,
    partner1Energy,
    partner2Energy,
    sharedSessionPlanned,
    completedSync: true,
    completedAt: new Date().toISOString()
  }

  syncs.push(sync)
  await set(KEYS.MORNING_SYNCS, syncs)

  // Award couple XP and update streak
  await addCoupleXP(50)
  await updateCouplesStreak()

  return sync
}

async function updateCouplesStreak(): Promise<void> {
  const syncs = await getMorningSyncs()
  const profile = await getCouplesProfile()
  if (!profile) return

  // Check consecutive days
  const today = new Date()
  let streak = 0

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]

    const hasSync = syncs.some(s => s.date === dateStr && s.completedSync)
    if (hasSync) {
      streak++
    } else {
      break
    }
  }

  profile.couplesStreak = streak
  await set(KEYS.COUPLES_PROFILE, profile)
}

// Couple Rewards
export async function getCoupleRewards(): Promise<CoupleReward[]> {
  return await get(KEYS.COUPLE_REWARDS) || []
}

export async function createCoupleReward(
  name: string,
  description: string,
  category: CoupleReward['category'],
  xpCost: number,
  condition: string,
  isPrivate: boolean,
  createdBy: string
): Promise<CoupleReward> {
  const profile = await getCouplesProfile()
  if (!profile) throw new Error('No couples profile found')

  const rewards = await getCoupleRewards()

  const reward: CoupleReward = {
    id: generateUUID(),
    coupleId: profile.id,
    name,
    description,
    category,
    xpCost,
    condition,
    isPrivate,
    createdBy,
    unlocked: false,
    createdAt: new Date().toISOString()
  }

  rewards.push(reward)
  await set(KEYS.COUPLE_REWARDS, rewards)
  return reward
}

export async function unlockCoupleReward(rewardId: string): Promise<CoupleReward | null> {
  const rewards = await getCoupleRewards()
  const profile = await getCouplesProfile()

  if (!profile) return null

  const reward = rewards.find(r => r.id === rewardId)
  if (!reward) return null

  if (profile.sharedXP >= reward.xpCost) {
    reward.unlocked = true
    profile.sharedXP -= reward.xpCost
    profile.sharedRewards.push(rewardId)

    await set(KEYS.COUPLE_REWARDS, rewards)
    await set(KEYS.COUPLES_PROFILE, profile)
    return reward
  }

  return null
}

export async function redeemCoupleReward(rewardId: string): Promise<CoupleReward | null> {
  const rewards = await getCoupleRewards()
  const reward = rewards.find(r => r.id === rewardId)

  if (!reward || !reward.unlocked) return null

  reward.redeemedAt = new Date().toISOString()
  await set(KEYS.COUPLE_REWARDS, rewards)
  return reward
}

export async function deleteCoupleReward(rewardId: string): Promise<boolean> {
  const rewards = await getCoupleRewards()
  const filtered = rewards.filter(r => r.id !== rewardId)

  if (filtered.length === rewards.length) return false

  await set(KEYS.COUPLE_REWARDS, filtered)
  return true
}
