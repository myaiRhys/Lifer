import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { BodyDoublingSession } from '../types'

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function getBodyDoublingSessions(): Promise<BodyDoublingSession[]> {
  return await get(KEYS.BODY_DOUBLING_SESSIONS) || []
}

export async function getActiveBodyDoublingSession(): Promise<BodyDoublingSession | null> {
  const sessions = await getBodyDoublingSessions()
  return sessions.find(s => !s.completedAt) || null
}

export async function createBodyDoublingSession(
  participant1: string,
  participant2: string,
  duration: number = 90
): Promise<BodyDoublingSession> {
  const sessions = await getBodyDoublingSessions()

  const session: BodyDoublingSession = {
    id: generateUUID(),
    participants: [participant1, participant2],
    scheduledStart: new Date().toISOString(),
    actualStart: new Date().toISOString(),
    duration,
    tasksCompleted: {
      [participant1]: 0,
      [participant2]: 0
    },
    focusQuality: {
      [participant1]: 0,
      [participant2]: 0
    },
    createdAt: new Date().toISOString()
  }

  sessions.push(session)
  await set(KEYS.BODY_DOUBLING_SESSIONS, sessions)
  return session
}

export async function updateBodyDoublingSession(
  sessionId: string,
  updates: Partial<BodyDoublingSession>
): Promise<BodyDoublingSession | null> {
  const sessions = await getBodyDoublingSessions()
  const index = sessions.findIndex(s => s.id === sessionId)

  if (index === -1) return null

  sessions[index] = { ...sessions[index], ...updates }
  await set(KEYS.BODY_DOUBLING_SESSIONS, sessions)
  return sessions[index]
}

export async function completeBodyDoublingSession(sessionId: string): Promise<BodyDoublingSession | null> {
  return updateBodyDoublingSession(sessionId, {
    completedAt: new Date().toISOString()
  })
}

export async function updateTasksCompleted(
  sessionId: string,
  userId: string,
  count: number
): Promise<BodyDoublingSession | null> {
  const sessions = await getBodyDoublingSessions()
  const session = sessions.find(s => s.id === sessionId)

  if (!session) return null

  session.tasksCompleted[userId] = count
  await set(KEYS.BODY_DOUBLING_SESSIONS, sessions)
  return session
}

export async function updateFocusQuality(
  sessionId: string,
  userId: string,
  quality: number
): Promise<BodyDoublingSession | null> {
  const sessions = await getBodyDoublingSessions()
  const session = sessions.find(s => s.id === sessionId)

  if (!session) return null

  session.focusQuality[userId] = quality
  await set(KEYS.BODY_DOUBLING_SESSIONS, sessions)
  return session
}

export async function getCompletedSessions(userId: string): Promise<BodyDoublingSession[]> {
  const sessions = await getBodyDoublingSessions()
  return sessions.filter(s =>
    s.completedAt &&
    s.participants.includes(userId)
  )
}

export async function getSessionStats(userId: string): Promise<{
  totalSessions: number
  totalTasks: number
  avgFocusQuality: number
}> {
  const sessions = await getCompletedSessions(userId)

  const totalSessions = sessions.length
  const totalTasks = sessions.reduce((sum, s) => sum + (s.tasksCompleted[userId] || 0), 0)
  const avgFocusQuality = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.focusQuality[userId] || 0), 0) / sessions.length
    : 0

  return {
    totalSessions,
    totalTasks,
    avgFocusQuality: Math.round(avgFocusQuality * 10) / 10
  }
}
