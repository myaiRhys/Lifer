import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { MorningSession, MorningRitual, MorningRitualStep, MorningStats } from '../types'

// Default morning ritual steps
const DEFAULT_RITUAL_STEPS: Omit<MorningRitualStep, 'id'>[] = [
  {
    title: 'No phone for 90 minutes',
    description: 'Protect your morning from distractions',
    order: 1,
    duration: 90,
    completed: false
  },
  {
    title: 'Hydrate (500ml water)',
    description: 'Rehydrate after sleep',
    order: 2,
    duration: 2,
    completed: false
  },
  {
    title: 'Morning light exposure',
    description: '10-15 minutes of natural light',
    order: 3,
    duration: 15,
    completed: false
  },
  {
    title: 'Review top 3 priorities',
    description: 'Identify your most important tasks',
    order: 4,
    duration: 5,
    completed: false
  },
  {
    title: 'Complete 1 high-leverage task',
    description: 'Win the morning, win the day',
    order: 5,
    duration: 60,
    completed: false
  }
]

// Get current morning session (if active)
export async function getCurrentMorningSession(): Promise<MorningSession | null> {
  const session = await get(KEYS.CURRENT_MORNING_SESSION)

  if (!session) return null

  // Check if session is still valid (within 90 minutes)
  const now = new Date()
  const windowEnd = new Date(session.windowEndTime)

  if (now > windowEnd) {
    // Session expired, archive it
    await archiveMorningSession(session)
    await set(KEYS.CURRENT_MORNING_SESSION, null)
    return null
  }

  return session
}

// Start a new morning session
export async function startMorningSession(): Promise<MorningSession> {
  const now = new Date()
  const wakeTime = now.toISOString()
  const windowEndTime = new Date(now.getTime() + 90 * 60 * 1000).toISOString() // +90 minutes

  // Get today's morning tasks
  const { getTasks } = await import('./tasks')
  const allTasks = await getTasks()
  const morningTasks = allTasks.filter(t => t.isMorningTask && !t.completed)

  const session: MorningSession = {
    id: crypto.randomUUID(),
    date: now.toISOString().split('T')[0],
    wakeTime,
    windowEndTime,
    ritualCompleted: false,
    tasksCompleted: 0,
    tasksTotal: morningTasks.length,
    windowUtilization: 0,
    leverageScore: 0,
    windowMaintained: true, // Assume maintained until proven otherwise
    createdAt: now.toISOString()
  }

  await set(KEYS.CURRENT_MORNING_SESSION, session)
  return session
}

// Update morning session with task completion
export async function updateMorningSession(taskLeverageScore: number): Promise<MorningSession | null> {
  const session = await getCurrentMorningSession()
  if (!session) return null

  session.tasksCompleted += 1
  session.leverageScore += taskLeverageScore
  session.windowUtilization = session.tasksTotal > 0
    ? Math.round((session.tasksCompleted / session.tasksTotal) * 100)
    : 100

  await set(KEYS.CURRENT_MORNING_SESSION, session)
  return session
}

// Complete the morning ritual
export async function completeMorningRitual(): Promise<MorningSession | null> {
  const session = await getCurrentMorningSession()
  if (!session) return null

  session.ritualCompleted = true
  session.ritualCompletedAt = new Date().toISOString()

  await set(KEYS.CURRENT_MORNING_SESSION, session)
  await archiveMorningSession(session)

  return session
}

// Archive completed session to history
async function archiveMorningSession(session: MorningSession): Promise<void> {
  const sessions = await getMorningSessions()
  await set(KEYS.MORNING_SESSIONS, [...sessions, session])
}

// Get all morning sessions
export async function getMorningSessions(): Promise<MorningSession[]> {
  const sessions = await get(KEYS.MORNING_SESSIONS)
  return sessions || []
}

// Get morning sessions for date range
export async function getMorningSessionsForRange(startDate: string, endDate: string): Promise<MorningSession[]> {
  const sessions = await getMorningSessions()
  return sessions.filter(s => s.date >= startDate && s.date <= endDate)
}

// Get today's session (current or completed)
export async function getTodaysMorningSession(): Promise<MorningSession | null> {
  const current = await getCurrentMorningSession()
  if (current) return current

  const today = new Date().toISOString().split('T')[0]
  const sessions = await getMorningSessions()
  return sessions.find(s => s.date === today) || null
}

// Check if currently in morning window
export async function isInMorningWindow(): Promise<boolean> {
  const session = await getCurrentMorningSession()
  return session !== null
}

// Get time remaining in morning window (in minutes)
export async function getMorningWindowTimeRemaining(): Promise<number> {
  const session = await getCurrentMorningSession()
  if (!session) return 0

  const now = new Date()
  const windowEnd = new Date(session.windowEndTime)
  const remaining = Math.max(0, Math.floor((windowEnd.getTime() - now.getTime()) / (60 * 1000)))

  return remaining
}

// Get or create morning ritual
export async function getMorningRitual(): Promise<MorningRitual> {
  let ritual = await get(KEYS.MORNING_RITUAL)

  if (!ritual) {
    ritual = {
      id: crypto.randomUUID(),
      steps: DEFAULT_RITUAL_STEPS.map(step => ({
        ...step,
        id: crypto.randomUUID(),
        completed: false
      })),
      active: true,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
    await set(KEYS.MORNING_RITUAL, ritual)
  }

  return ritual
}

// Update morning ritual
export async function updateMorningRitual(updates: Partial<MorningRitual>): Promise<MorningRitual> {
  const ritual = await getMorningRitual()
  const updated = {
    ...ritual,
    ...updates,
    lastUpdated: new Date().toISOString()
  }
  await set(KEYS.MORNING_RITUAL, updated)
  return updated
}

// Toggle ritual step completion
export async function toggleRitualStep(stepId: string): Promise<MorningRitual> {
  const ritual = await getMorningRitual()
  const step = ritual.steps.find(s => s.id === stepId)

  if (step) {
    step.completed = !step.completed
    step.completedAt = step.completed ? new Date().toISOString() : undefined
  }

  return await updateMorningRitual({ steps: ritual.steps })
}

// Reset ritual steps for new day
export async function resetRitualSteps(): Promise<MorningRitual> {
  const ritual = await getMorningRitual()
  ritual.steps.forEach(step => {
    step.completed = false
    step.completedAt = undefined
  })
  return await updateMorningRitual({ steps: ritual.steps })
}

// Add custom ritual step
export async function addRitualStep(title: string, description?: string, duration?: number): Promise<MorningRitual> {
  const ritual = await getMorningRitual()
  const newStep: MorningRitualStep = {
    id: crypto.randomUUID(),
    title,
    description,
    order: ritual.steps.length + 1,
    duration,
    completed: false
  }
  ritual.steps.push(newStep)
  return await updateMorningRitual({ steps: ritual.steps })
}

// Remove ritual step
export async function removeRitualStep(stepId: string): Promise<MorningRitual> {
  const ritual = await getMorningRitual()
  ritual.steps = ritual.steps.filter(s => s.id !== stepId)
  // Reorder remaining steps
  ritual.steps.forEach((step, index) => {
    step.order = index + 1
  })
  return await updateMorningRitual({ steps: ritual.steps })
}

// Calculate morning stats
export async function getMorningStats(): Promise<MorningStats> {
  const sessions = await getMorningSessions()

  if (sessions.length === 0) {
    return {
      totalMorningSessions: 0,
      averageWindowUtilization: 0,
      averageTasksCompleted: 0,
      averageLeverageScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      last7DaysUtilization: 0
    }
  }

  // Calculate averages
  const totalUtilization = sessions.reduce((sum, s) => sum + s.windowUtilization, 0)
  const totalTasks = sessions.reduce((sum, s) => sum + s.tasksCompleted, 0)
  const totalLeverage = sessions.reduce((sum, s) => sum + s.leverageScore, 0)

  const averageWindowUtilization = Math.round(totalUtilization / sessions.length)
  const averageTasksCompleted = Math.round(totalTasks / sessions.length)
  const averageLeverageScore = Math.round(totalLeverage / sessions.length)

  // Calculate current streak (consecutive days with ritual completed)
  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date))
  let currentStreak = 0
  let expectedDate = new Date().toISOString().split('T')[0]

  for (const session of sortedSessions) {
    if (session.date === expectedDate && session.ritualCompleted) {
      currentStreak++
      // Go to previous day
      const prevDate = new Date(expectedDate)
      prevDate.setDate(prevDate.getDate() - 1)
      expectedDate = prevDate.toISOString().split('T')[0]
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  const completedSessions = sessions.filter(s => s.ritualCompleted).sort((a, b) => a.date.localeCompare(b.date))

  for (let i = 0; i < completedSessions.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(completedSessions[i - 1].date)
      const currDate = new Date(completedSessions[i].date)
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

      if (dayDiff === 1) {
        tempStreak++
      } else {
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
  }

  // Last 7 days utilization
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recent7 = sessions.filter(s => new Date(s.date) >= sevenDaysAgo)
  const last7DaysUtilization = recent7.length > 0
    ? Math.round(recent7.reduce((sum, s) => sum + s.windowUtilization, 0) / recent7.length)
    : 0

  return {
    totalMorningSessions: sessions.length,
    averageWindowUtilization,
    averageTasksCompleted,
    averageLeverageScore,
    currentStreak,
    longestStreak,
    last7DaysUtilization
  }
}
