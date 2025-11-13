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
  isRecurring: boolean
  recurringTemplateId?: string
}

export interface RecurringTaskTemplate {
  id: string
  title: string
  description?: string
  leverageScore: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  outcomeId: string
  isMorningTask: boolean
  active: boolean
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
  // Extended fields from RecurringTasks merge
  leverageScore?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  outcomeId?: string
  isMorningTask?: boolean
}

export interface Chore {
  id: string
  title: string
  description?: string
  category?: string
  completed: boolean
  completedAt?: string
  xpReward: number
  recurring: boolean
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom'
  customDays?: number[]
  lastReset?: string
  createdAt: string
}

export interface HistoryRecord {
  id: string
  type: "task" | "practice" | "outcome" | "chore"
  entityId: string
  entitySnapshot: object
  completedAt: string
  xpEarned?: number
  wasInMorningWindow: boolean
  leverageScore?: number
  habitStrength?: number
  practiceType?: "positive" | "negative"
  slipOccurred?: boolean
  choreCategory?: string
  dayOfWeek: number
  hourOfDay: number
}

export type AchievementRarity = "common" | "rare" | "epic" | "legendary"

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: AchievementRarity
  category: "streak" | "task" | "leverage" | "morning" | "level" | "practice" | "challenge"
  condition: (state: UserState, history: HistoryRecord[]) => boolean
  progress?: (state: UserState, history: HistoryRecord[]) => { current: number; total: number }
  unlockedAt?: string
}

export interface Challenge {
  id: string
  name: string
  description: string
  icon: string
  type: "daily" | "weekly"
  difficulty: "easy" | "medium" | "hard"
  xpReward: number
  condition: (state: UserState, tasks: Task[], practices: Practice[]) => boolean
  progress?: (state: UserState, tasks: Task[], practices: Practice[]) => { current: number; total: number }
  completedAt?: string
  expiresAt: string
}

export type PowerUpType = "xp_boost" | "streak_shield" | "double_xp" | "time_freeze" | "focus_boost"

export interface PowerUp {
  id: string
  name: string
  description: string
  icon: string
  type: PowerUpType
  cost: number
  duration?: number
  multiplier?: number
  isActive?: boolean
  activatedAt?: string
  expiresAt?: string
}

export interface PurchasedPowerUp {
  id: string
  powerUpType: PowerUpType
  purchasedAt: string
  usedAt?: string
  expiresAt?: string
  isActive: boolean
}

export interface FocusSession {
  id: string
  type: "pomodoro" | "deep_work"
  duration: number
  taskId?: string
  startedAt: string
  completedAt?: string
  xpEarned: number
  interrupted: boolean
}

export type Theme = "dark" | "light" | "ocean" | "fire" | "forest" | "sunset"

export interface AppSettings {
  theme: Theme
  soundEnabled: boolean
  notificationsEnabled: boolean
  streakReminders: boolean
  morningReminders: boolean
  vibrationEnabled: boolean
  pomodoroLength: number
  shortBreakLength: number
  longBreakLength: number
  onboardingCompleted: boolean
  lastWeeklyReview: string | null
}
