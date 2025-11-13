import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Outcome } from '../types'

export async function getOutcomes(): Promise<Outcome[]> {
  const outcomes = await get(KEYS.OUTCOMES)
  return outcomes || []
}

export async function getOutcomeById(id: string): Promise<Outcome | undefined> {
  const outcomes = await getOutcomes()
  return outcomes.find(o => o.id === id)
}

export async function getActiveOutcomes(): Promise<Outcome[]> {
  const outcomes = await getOutcomes()
  return outcomes.filter(o => o.status === 'active')
}

export async function createOutcome(outcome: Omit<Outcome, 'id' | 'createdAt' | 'linkedTaskCount' | 'lastProgressUpdate' | 'stalledDays'>): Promise<Outcome> {
  const outcomes = await getOutcomes()

  const newOutcome: Outcome = {
    ...outcome,
    id: crypto.randomUUID(),
    linkedTaskCount: 0,
    lastProgressUpdate: new Date().toISOString(),
    stalledDays: 0,
    createdAt: new Date().toISOString()
  }

  outcomes.push(newOutcome)
  await set(KEYS.OUTCOMES, outcomes)

  return newOutcome
}

export async function updateOutcome(id: string, updates: Partial<Outcome>): Promise<Outcome | null> {
  const outcomes = await getOutcomes()
  const index = outcomes.findIndex(o => o.id === id)

  if (index === -1) return null

  outcomes[index] = {
    ...outcomes[index],
    ...updates,
    lastProgressUpdate: new Date().toISOString()
  }

  await set(KEYS.OUTCOMES, outcomes)

  return outcomes[index]
}

export async function deleteOutcome(id: string): Promise<boolean> {
  const outcomes = await getOutcomes()
  const filtered = outcomes.filter(o => o.id !== id)

  if (filtered.length === outcomes.length) return false

  await set(KEYS.OUTCOMES, filtered)
  return true
}

export async function archiveOutcome(id: string): Promise<Outcome | null> {
  return updateOutcome(id, {
    status: 'archived',
    archivedAt: new Date().toISOString()
  })
}

export async function completeOutcome(id: string): Promise<Outcome | null> {
  return updateOutcome(id, {
    status: 'completed',
    progress: 100,
    completedAt: new Date().toISOString()
  })
}

export async function updateOutcomeLinkedTaskCount(outcomeId: string): Promise<void> {
  const { getActiveTasks } = await import('./tasks')
  const tasks = await getActiveTasks()
  const linkedCount = tasks.filter(t => t.outcomeId === outcomeId).length

  await updateOutcome(outcomeId, {
    linkedTaskCount: linkedCount
  })
}

export async function checkStalledOutcomes(): Promise<void> {
  const outcomes = await getActiveOutcomes()
  const now = new Date()

  for (const outcome of outcomes) {
    const lastUpdate = new Date(outcome.lastProgressUpdate)
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceUpdate >= 7 && outcome.status === 'active') {
      await updateOutcome(outcome.id, {
        status: 'stalled',
        stalledDays: daysSinceUpdate
      })
    }
  }
}
