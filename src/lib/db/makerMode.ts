import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { MakerMode, MakerModeSession, MakerModePreferences, MakerModeStats } from '../types'

// Default preferences
const DEFAULT_PREFERENCES: MakerModePreferences = {
  defaultMode: 'maker',
  makerBlockDuration: 180, // 3 hours
  managerSlotDuration: 60, // 1 hour
  protectMakerTime: true,
  autoSwitchEnabled: false,
  preferredMakerHours: [
    { start: 9, end: 12 },
    { start: 14, end: 17 }
  ]
}

// Get all sessions
export async function getMakerModeSessions(): Promise<MakerModeSession[]> {
  const sessions = await get<MakerModeSession[]>(KEYS.MAKER_MODE_SESSIONS)
  return sessions || []
}

// Get current active session
export async function getCurrentMakerModeSession(): Promise<MakerModeSession | null> {
  const sessions = await getMakerModeSessions()
  const active = sessions.find(s => !s.endTime)
  return active || null
}

// Get current mode (from active session or preferences)
export async function getCurrentMode(): Promise<MakerMode> {
  const activeSession = await getCurrentMakerModeSession()
  if (activeSession) return activeSession.mode

  const preferences = await getMakerModePreferences()
  return preferences.defaultMode
}

// Start a new maker/manager session
export async function startMakerModeSession(mode: MakerMode): Promise<MakerModeSession> {
  // End any active session first
  await endCurrentSession()

  const sessions = await getMakerModeSessions()
  const newSession: MakerModeSession = {
    id: crypto.randomUUID(),
    mode,
    startTime: new Date().toISOString(),
    tasksCompleted: 0,
    interruptions: 0
  }

  await set(KEYS.MAKER_MODE_SESSIONS, [...sessions, newSession])
  await set(KEYS.CURRENT_MAKER_MODE, mode)

  return newSession
}

// End current session
export async function endCurrentSession(
  productivityRating?: number,
  notes?: string
): Promise<MakerModeSession | null> {
  const sessions = await getMakerModeSessions()
  const activeIndex = sessions.findIndex(s => !s.endTime)

  if (activeIndex === -1) return null

  const active = sessions[activeIndex]
  const endTime = new Date().toISOString()
  const durationMinutes = Math.floor(
    (new Date(endTime).getTime() - new Date(active.startTime).getTime()) / 60000
  )

  sessions[activeIndex] = {
    ...active,
    endTime,
    durationMinutes,
    productivityRating,
    notes
  }

  await set(KEYS.MAKER_MODE_SESSIONS, sessions)
  return sessions[activeIndex]
}

// Switch modes (ends current session and starts new one)
export async function switchMode(newMode: MakerMode): Promise<MakerModeSession> {
  await endCurrentSession()
  return await startMakerModeSession(newMode)
}

// Increment task count for current session
export async function incrementTasksCompleted(): Promise<void> {
  const sessions = await getMakerModeSessions()
  const activeIndex = sessions.findIndex(s => !s.endTime)

  if (activeIndex !== -1) {
    sessions[activeIndex].tasksCompleted++
    await set(KEYS.MAKER_MODE_SESSIONS, sessions)
  }
}

// Increment interruption count for current session
export async function logInterruption(): Promise<void> {
  const sessions = await getMakerModeSessions()
  const activeIndex = sessions.findIndex(s => !s.endTime)

  if (activeIndex !== -1) {
    sessions[activeIndex].interruptions++
    await set(KEYS.MAKER_MODE_SESSIONS, sessions)
  }
}

// Get preferences
export async function getMakerModePreferences(): Promise<MakerModePreferences> {
  const prefs = await get<MakerModePreferences>(KEYS.MAKER_MODE_PREFERENCES)
  return prefs || DEFAULT_PREFERENCES
}

// Update preferences
export async function updateMakerModePreferences(
  updates: Partial<MakerModePreferences>
): Promise<MakerModePreferences> {
  const current = await getMakerModePreferences()
  const updated = { ...current, ...updates }
  await set(KEYS.MAKER_MODE_PREFERENCES, updated)
  return updated
}

// Get statistics
export async function getMakerModeStats(): Promise<MakerModeStats> {
  const sessions = await getMakerModeSessions()
  const completedSessions = sessions.filter(s => s.endTime && s.durationMinutes)

  if (completedSessions.length === 0) {
    return {
      totalMakerMinutes: 0,
      totalManagerMinutes: 0,
      makerSessionsCount: 0,
      managerSessionsCount: 0,
      avgMakerProductivity: 0,
      avgManagerProductivity: 0,
      totalInterruptions: 0,
      deepWorkStreak: 0,
      longestMakerBlock: 0
    }
  }

  const makerSessions = completedSessions.filter(s => s.mode === 'maker')
  const managerSessions = completedSessions.filter(s => s.mode === 'manager')

  const totalMakerMinutes = makerSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
  const totalManagerMinutes = managerSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)

  // Calculate average productivity ratings
  const makerRatings = makerSessions.filter(s => s.productivityRating)
  const managerRatings = managerSessions.filter(s => s.productivityRating)

  const avgMakerProductivity = makerRatings.length > 0
    ? makerRatings.reduce((sum, s) => sum + (s.productivityRating || 0), 0) / makerRatings.length
    : 0

  const avgManagerProductivity = managerRatings.length > 0
    ? managerRatings.reduce((sum, s) => sum + (s.productivityRating || 0), 0) / managerRatings.length
    : 0

  const totalInterruptions = completedSessions.reduce((sum, s) => sum + s.interruptions, 0)

  // Find longest maker block
  const longestMakerBlock = makerSessions.length > 0
    ? Math.max(...makerSessions.map(s => s.durationMinutes || 0))
    : 0

  // Calculate deep work streak (consecutive days with 3+ hours of maker time)
  const deepWorkStreak = calculateDeepWorkStreak(sessions)

  return {
    totalMakerMinutes,
    totalManagerMinutes,
    makerSessionsCount: makerSessions.length,
    managerSessionsCount: managerSessions.length,
    avgMakerProductivity,
    avgManagerProductivity,
    totalInterruptions,
    deepWorkStreak,
    longestMakerBlock
  }
}

// Calculate deep work streak
function calculateDeepWorkStreak(sessions: MakerModeSession[]): number {
  const completedMakerSessions = sessions
    .filter(s => s.mode === 'maker' && s.endTime && s.durationMinutes)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  if (completedMakerSessions.length === 0) return 0

  // Group sessions by date and calculate total maker minutes per day
  const dailyMakerMinutes = new Map<string, number>()

  completedMakerSessions.forEach(session => {
    const date = session.startTime.split('T')[0]
    const current = dailyMakerMinutes.get(date) || 0
    dailyMakerMinutes.set(date, current + (session.durationMinutes || 0))
  })

  // Convert to sorted array of [date, minutes]
  const sortedDays = Array.from(dailyMakerMinutes.entries())
    .sort((a, b) => b[0].localeCompare(a[0])) // Descending by date

  // Count consecutive days with 180+ minutes (3 hours)
  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let checkDate = today

  for (const [date, minutes] of sortedDays) {
    if (date > checkDate) continue // Skip future dates
    if (date !== checkDate) break // Streak broken

    if (minutes >= 180) {
      streak++
      // Move to previous day
      const d = new Date(checkDate)
      d.setDate(d.getDate() - 1)
      checkDate = d.toISOString().split('T')[0]
    } else {
      break // Didn't meet 3-hour threshold
    }
  }

  return streak
}

// Get sessions for a specific date range
export async function getSessionsInRange(
  startDate: string,
  endDate: string
): Promise<MakerModeSession[]> {
  const sessions = await getMakerModeSessions()
  return sessions.filter(s =>
    s.startTime >= startDate && s.startTime <= endDate
  )
}

// Get today's sessions
export async function getTodaySessions(): Promise<MakerModeSession[]> {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  return await getSessionsInRange(today, tomorrowStr)
}

// Calculate "meeting cost" - how much a meeting fragments maker time
export function calculateMeetingCost(
  meetingDuration: number, // in minutes
  currentMode: MakerMode
): {
  fragmentedBlocks: number
  lostProductivityMinutes: number
  suggestion: string
} {
  if (currentMode === 'manager') {
    return {
      fragmentedBlocks: 0,
      lostProductivityMinutes: 0,
      suggestion: 'Manager mode can handle meetings efficiently in 1-hour slots.'
    }
  }

  // In maker mode, any meeting fragments a 3-4 hour block
  const typicalMakerBlock = 180 // 3 hours
  const contextSwitchPenalty = 23 // Minutes to regain deep focus (research-based)

  const fragmentedBlocks = 1
  const lostProductivityMinutes = meetingDuration + (contextSwitchPenalty * 2) // Before and after

  let suggestion = `This ${meetingDuration}-min meeting will fragment a ${typicalMakerBlock}-min maker block. `

  if (meetingDuration <= 30) {
    suggestion += 'Consider batching with other short meetings in manager time.'
  } else {
    suggestion += 'Consider scheduling during manager time or end of day.'
  }

  return {
    fragmentedBlocks,
    lostProductivityMinutes,
    suggestion
  }
}

// Suggest optimal meeting times based on preferences
export async function suggestMeetingTimes(): Promise<{
  bestTimes: string[]
  worstTimes: string[]
}> {
  const preferences = await getMakerModePreferences()
  const currentMode = await getCurrentMode()

  const bestTimes: string[] = []
  const worstTimes: string[] = []

  if (currentMode === 'maker') {
    // During maker mode, suggest times outside maker blocks
    for (let hour = 8; hour < 18; hour++) {
      const isInMakerBlock = preferences.preferredMakerHours.some(
        block => hour >= block.start && hour < block.end
      )

      const timeStr = `${hour}:00-${hour + 1}:00`

      if (isInMakerBlock) {
        worstTimes.push(timeStr)
      } else {
        bestTimes.push(timeStr)
      }
    }
  } else {
    // In manager mode, all 1-hour slots are acceptable
    for (let hour = 8; hour < 18; hour++) {
      bestTimes.push(`${hour}:00-${hour + 1}:00`)
    }
  }

  return { bestTimes, worstTimes }
}

// Get sessions by mode
export async function getSessionsByMode(mode: MakerMode): Promise<MakerModeSession[]> {
  const sessions = await getMakerModeSessions()
  return sessions.filter(s => s.mode === mode)
}

// Delete a session
export async function deleteMakerModeSession(id: string): Promise<void> {
  const sessions = await getMakerModeSessions()
  const filtered = sessions.filter(s => s.id !== id)
  await set(KEYS.MAKER_MODE_SESSIONS, filtered)
}

// Check if currently in a protected maker block
export async function isInProtectedMakerTime(): Promise<boolean> {
  const currentSession = await getCurrentMakerModeSession()
  if (!currentSession || currentSession.mode !== 'maker') return false

  const preferences = await getMakerModePreferences()
  return preferences.protectMakerTime
}
