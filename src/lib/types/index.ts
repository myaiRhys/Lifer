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
  // Four Laws of Behavior Change (James Clear)
  fourLaws?: {
    obvious: { score: number; cue?: string; time?: string; location?: string }
    attractive: { score: number; bundle?: string }
    easy: { score: number; frictionSteps: number; gateway?: string }
    satisfying: { score: number; reward?: string }
    totalScore: number
  }
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
  // Four Laws of Behavior Change (James Clear)
  fourLaws?: {
    obvious: { score: number; cue?: string; time?: string; location?: string }
    attractive: { score: number; bundle?: string }
    easy: { score: number; frictionSteps: number; gateway?: string }
    satisfying: { score: number; reward?: string }
    totalScore: number
  }
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
  // Four Laws of Behavior Change (James Clear)
  fourLaws?: {
    obvious: { score: number; cue?: string; time?: string; location?: string }
    attractive: { score: number; bundle?: string }
    easy: { score: number; frictionSteps: number; gateway?: string }
    satisfying: { score: number; reward?: string }
    totalScore: number
  }
  // Never Miss Twice (James Clear)
  consecutiveMisses?: number
  lastMissDate?: string
  recoveryCount?: number // How many times bounced back after a miss
  atRisk?: boolean // True if missed once (warning state)
  // 2-Minute Rule Gateway (James Clear)
  gatewayVersion?: {
    name: string
    target: number
    unit: string
  }
  lastCompletionType?: 'gateway' | 'intermediate' | 'full'
  gatewayCount?: number // How many times completed gateway version
  fullCount?: number // How many times completed full version
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
  type: "pomodoro" | "deep_work" | "ultradian"
  duration: number
  taskId?: string
  startedAt: string
  completedAt?: string
  xpEarned: number
  interrupted: boolean
  // Ultradian-specific fields
  plannedDuration?: number
  actualDuration?: number
  flowStateAchieved?: boolean
  breakQuality?: number
}

// Energy tracking for BPT
export interface EnergyLog {
  id: string
  timestamp: string
  energy: number // 1-10
  context: 'morning' | 'midday' | 'evening'
  notes?: string
  completedTasksInLastHour: number
}

export interface BPTAnalysis {
  userId: string
  dataPoints: number
  peakWindow: { start: string; end: string; confidence: number }
  energyCurve: Array<{ hour: number; avgEnergy: number }>
  lastCalculated: string
}

// Couples mode
export interface CouplesProfile {
  id: string
  partner1Id: string
  partner2Id: string
  partner1Name: string
  partner2Name: string
  relationshipLevel: number
  sharedXP: number
  couplesStreak: number
  sharedOutcomes: string[]
  sharedRewards: string[]
  createdAt: string
}

export interface MorningSync {
  id: string
  coupleId: string
  date: string
  partner1Priorities: [string, string, string]
  partner2Priorities: [string, string, string]
  partner1Energy: number
  partner2Energy: number
  sharedSessionPlanned: boolean
  sharedSessionTime?: string
  sharedOutcome?: string
  coupleReward?: string
  completedSync: boolean
  completedAt?: string
}

export interface CoupleReward {
  id: string
  coupleId: string
  name: string
  description: string
  category: 'quality_time' | 'intimate' | 'practical' | 'big_goal'
  xpCost: number
  condition: string
  isPrivate: boolean
  createdBy: string
  unlocked: boolean
  redeemedAt?: string
  createdAt: string
}

// Outcome Trees (extended)
export interface OutcomeNode {
  id: string
  type: 'purpose' | 'outcome' | 'milestone'
  title: string
  description: string
  parentId?: string
  childIds: string[]
  progress: number // 0-100
  color: string
  isActive: boolean
  createdAt: string
  linkedTaskCount?: number
}

// Body Doubling
export interface BodyDoublingSession {
  id: string
  participants: [string, string]
  scheduledStart: string
  actualStart?: string
  duration: number
  tasksCompleted: { [userId: string]: number }
  focusQuality: { [userId: string]: number }
  completedAt?: string
  createdAt: string
}

// Identity-Based Habits (James Clear)
export interface Identity {
  id: string
  statement: string // "I am a person who..."
  createdAt: string
  lastUpdated: string
}

export interface IdentityVote {
  id: string
  identityId: string
  action: string
  actionType: 'task' | 'practice' | 'chore' | 'focus' | 'other'
  entityId?: string // ID of related task/practice/etc
  direction: 'for' | 'against'
  timestamp: string
  context?: string
}

export interface IdentityEvidence {
  id: string
  identityId: string
  description: string
  category: 'achievement' | 'streak' | 'completion' | 'custom'
  linkedEntityId?: string
  addedAt: string
}

export interface IdentityAlignment {
  date: string // YYYY-MM-DD
  votesFor: number
  votesAgainst: number
  percentage: number // 0-100
  totalVotes: number
}

// Never Miss Twice System (James Clear)
export interface RecoveryEvent {
  id: string
  practiceId: string
  practiceName: string
  missedDate: string // YYYY-MM-DD when they missed
  recoveredDate: string // YYYY-MM-DD when they came back
  missCount: number // How many consecutive misses before recovery (1 or 2)
  recoveryStrategy?: string // What helped them bounce back
  timestamp: string
}

// Morning Sovereignty Ritual
export interface MorningSession {
  id: string
  date: string // YYYY-MM-DD
  wakeTime: string // ISO timestamp when user marked "I'm awake"
  windowEndTime: string // wakeTime + 90 minutes
  ritualCompleted: boolean
  ritualCompletedAt?: string
  tasksCompleted: number // How many morning tasks done in window
  tasksTotal: number // How many morning tasks were scheduled
  windowUtilization: number // 0-100 percentage
  leverageScore: number // Sum of all morning task leverage scores
  windowMaintained: boolean // Did they stay in focus mode?
  createdAt: string
}

export interface MorningRitual {
  id: string
  steps: MorningRitualStep[]
  active: boolean
  createdAt: string
  lastUpdated: string
}

export interface MorningRitualStep {
  id: string
  title: string
  description?: string
  order: number
  duration?: number // Estimated minutes
  completed: boolean
  completedAt?: string
}

export interface MorningStats {
  totalMorningSessions: number
  averageWindowUtilization: number
  averageTasksCompleted: number
  averageLeverageScore: number
  currentStreak: number // Days in a row with morning ritual
  longestStreak: number
  last7DaysUtilization: number
}

export type Theme = "dark" | "light" | "ocean" | "fire" | "forest" | "sunset" | "military" | "cowboy" | "academic" | "cyberpunk" | "zen"

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
