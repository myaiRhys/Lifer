import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Chore, HistoryRecord } from '../types'
import { addXP, getUserState } from './userState'
import { addHistoryRecord } from './history'

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function getChores(): Promise<Chore[]> {
  const chores = await get(KEYS.CHORES)
  return chores || []
}

export async function getChoreById(id: string): Promise<Chore | undefined> {
  const chores = await getChores()
  return chores.find(c => c.id === id)
}

export async function getTodaysChores(): Promise<Chore[]> {
  const chores = await getChores()
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.

  return chores.filter(c => {
    if (!c.recurring) return true // One-time chores always show

    if (c.frequency === 'daily') return true

    if (c.frequency === 'custom' && c.customDays) {
      return c.customDays.includes(today)
    }

    // Weekly and monthly need to check if reset is due
    if (c.frequency === 'weekly') {
      if (!c.lastReset) return true
      const lastReset = new Date(c.lastReset)
      const daysSinceReset = Math.floor((Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceReset >= 7
    }

    if (c.frequency === 'monthly') {
      if (!c.lastReset) return true
      const lastReset = new Date(c.lastReset)
      const daysSinceReset = Math.floor((Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceReset >= 30
    }

    return true
  })
}

export async function createChore(
  data: Omit<Chore, 'id' | 'createdAt' | 'completed'>
): Promise<Chore> {
  const chores = await getChores()

  const newChore: Chore = {
    ...data,
    id: generateUUID(),
    completed: false,
    createdAt: new Date().toISOString()
  }

  chores.push(newChore)
  await set(KEYS.CHORES, chores)

  return newChore
}

export async function updateChore(
  id: string,
  updates: Partial<Chore>
): Promise<Chore | null> {
  const chores = await getChores()
  const index = chores.findIndex(c => c.id === id)

  if (index === -1) return null

  chores[index] = { ...chores[index], ...updates }
  await set(KEYS.CHORES, chores)

  return chores[index]
}

export async function deleteChore(id: string): Promise<boolean> {
  const chores = await getChores()
  const filtered = chores.filter(c => c.id !== id)

  if (filtered.length === chores.length) return false

  await set(KEYS.CHORES, filtered)
  return true
}

export async function completeChore(id: string): Promise<Chore | null> {
  const chore = await getChoreById(id)
  if (!chore) return null

  const now = new Date()
  const completedAt = now.toISOString()

  // Award XP
  await addXP(chore.xpReward)

  // Create history record
  await addHistoryRecord({
    type: 'chore',
    entityId: chore.id,
    entitySnapshot: { ...chore },
    completedAt,
    xpEarned: chore.xpReward,
    wasInMorningWindow: false, // Chores don't have morning bonus
    choreCategory: chore.category,
    dayOfWeek: now.getDay(),
    hourOfDay: now.getHours()
  })

  // Handle completion based on recurring status
  if (chore.recurring) {
    // Reset for next occurrence
    const updated = await updateChore(id, {
      completed: false,
      lastReset: completedAt
    })
    return updated
  } else {
    // Mark one-time chore as completed
    const updated = await updateChore(id, {
      completed: true,
      completedAt
    })
    return updated
  }
}

export async function uncompleteChore(id: string): Promise<Chore | null> {
  const chore = await getChoreById(id)
  if (!chore || !chore.completed) return null

  // Remove XP
  const userState = await getUserState()
  if (userState && chore.completedAt) {
    await addXP(-chore.xpReward)
  }

  // Mark as incomplete
  const updated = await updateChore(id, {
    completed: false,
    completedAt: undefined
  })

  return updated
}

// Reset recurring chores that are due
export async function resetDueChores(): Promise<void> {
  const chores = await getChores()
  const now = Date.now()

  for (const chore of chores) {
    if (!chore.recurring || !chore.lastReset) continue

    const lastReset = new Date(chore.lastReset).getTime()
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24))

    let shouldReset = false

    if (chore.frequency === 'daily' && daysSinceReset >= 1) {
      shouldReset = true
    } else if (chore.frequency === 'weekly' && daysSinceReset >= 7) {
      shouldReset = true
    } else if (chore.frequency === 'monthly' && daysSinceReset >= 30) {
      shouldReset = true
    }

    if (shouldReset) {
      await updateChore(chore.id, {
        completed: false,
        lastReset: new Date().toISOString()
      })
    }
  }
}
