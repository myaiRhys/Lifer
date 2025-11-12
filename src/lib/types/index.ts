// Export all types from data model
export interface UserState {
  id: "user_state"
  xp: number
  level: number
  xpForNextLevel: number
  morningMultiplier: boolean
  peakPerformanceMultiplier: boolean
  hydration: number
  strength: number
  energy: number
  focus: number
  recovery: number
  currentStreak: number
  longestStreak: number
  morningControlCount: number
  lifetimeLeverageRatio: number
  last7DaysLeverageRatio: number
  lastActive: string
  createdAt: string
  lastMidnightReset: string
}

export interface Outcome {
  id: string
  result: string
  purpose: string
  status: "active" | "completed" | "stalled" | "archived"
  progress: number
  linkedTaskCount: number
  lastProgressUpdate: string
  stalledDays: number
  createdAt: string
  completedAt?: string
  archivedAt?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  leverageScore: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  outcomeId: string
  scheduledFor?: string
  isMorningTask: boolean
  completed: boolean
  completedAt?: string
  xpEarned?: number
  createdAt: string
}

export interface Practice {
  id: string
  name: string
  description?: string
  type: "positive" | "negative"
  target: number
  unit: string
  habitStrength: number
  currentStreak: number
  longestStreak: number
  todayValue: number
  todayCompleted: boolean
  lastLoggedAt: string
  cleanStreak?: number
  longestCleanStreak?: number
  frequency: "daily" | "custom"
  scheduleDays?: number[]
  createdAt: string
  lastCompletedAt?: string
}

export interface HistoryRecord {
  id: string
  type: "task" | "practice" | "outcome"
  entityId: string
  entitySnapshot: object
  completedAt: string
  xpEarned?: number
  wasInMorningWindow: boolean
  leverageScore?: number
  habitStrength?: number
  practiceType?: "positive" | "negative"
  slipOccurred?: boolean
  dayOfWeek: number
  hourOfDay: number
}
