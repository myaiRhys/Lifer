import type { Achievement, UserState, HistoryRecord } from './types'

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Streak Achievements
  {
    id: 'fire_starter',
    name: 'Fire Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    condition: (state) => state.currentStreak >= 3,
    progress: (state) => ({ current: Math.min(state.currentStreak, 3), total: 3 })
  },
  {
    id: 'momentum_master',
    name: 'Momentum Master',
    description: 'Achieve a 7-day streak',
    icon: '⚡',
    rarity: 'rare',
    category: 'streak',
    condition: (state) => state.currentStreak >= 7,
    progress: (state) => ({ current: Math.min(state.currentStreak, 7), total: 7 })
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Reach a 30-day streak',
    icon: '💪',
    rarity: 'epic',
    category: 'streak',
    condition: (state) => state.currentStreak >= 30,
    progress: (state) => ({ current: Math.min(state.currentStreak, 30), total: 30 })
  },
  {
    id: 'legend_status',
    name: 'Legend Status',
    description: 'Achieve a 100-day streak',
    icon: '👑',
    rarity: 'legendary',
    category: 'streak',
    condition: (state) => state.currentStreak >= 100,
    progress: (state) => ({ current: Math.min(state.currentStreak, 100), total: 100 })
  },

  // Task Achievements
  {
    id: 'task_novice',
    name: 'Task Novice',
    description: 'Complete 10 tasks',
    icon: '📝',
    rarity: 'common',
    category: 'task',
    condition: (state, history) => history.filter(h => h.type === 'task').length >= 10,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task').length, 10), total: 10 })
  },
  {
    id: 'task_warrior',
    name: 'Task Warrior',
    description: 'Complete 50 tasks',
    icon: '⚔️',
    rarity: 'rare',
    category: 'task',
    condition: (state, history) => history.filter(h => h.type === 'task').length >= 50,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task').length, 50), total: 50 })
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: '🎯',
    rarity: 'epic',
    category: 'task',
    condition: (state, history) => history.filter(h => h.type === 'task').length >= 100,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task').length, 100), total: 100 })
  },
  {
    id: 'task_legend',
    name: 'Task Legend',
    description: 'Complete 500 tasks',
    icon: '🏅',
    rarity: 'legendary',
    category: 'task',
    condition: (state, history) => history.filter(h => h.type === 'task').length >= 500,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task').length, 500), total: 500 })
  },

  // Leverage Achievements
  {
    id: 'high_value',
    name: 'High Value',
    description: 'Complete 10 high-leverage tasks (7+)',
    icon: '💎',
    rarity: 'common',
    category: 'leverage',
    condition: (state, history) => history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 7).length >= 10,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 7).length, 10), total: 10 })
  },
  {
    id: 'leverage_pro',
    name: 'Leverage Pro',
    description: 'Complete 50 ultra-high tasks (8+)',
    icon: '🚀',
    rarity: 'rare',
    category: 'leverage',
    condition: (state, history) => history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 8).length >= 50,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 8).length, 50), total: 50 })
  },
  {
    id: 'impact_titan',
    name: 'Impact Titan',
    description: 'Complete 100 maximum impact tasks (9+)',
    icon: '⭐',
    rarity: 'epic',
    category: 'leverage',
    condition: (state, history) => history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 9).length >= 100,
    progress: (state, history) => ({ current: Math.min(history.filter(h => h.type === 'task' && (h.leverageScore || 0) >= 9).length, 100), total: 100 })
  },

  // Morning Achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 10 morning tasks',
    icon: '☀️',
    rarity: 'common',
    category: 'morning',
    condition: (state) => state.morningControlCount >= 10,
    progress: (state) => ({ current: Math.min(state.morningControlCount, 10), total: 10 })
  },
  {
    id: 'dawn_warrior',
    name: 'Dawn Warrior',
    description: 'Complete 50 morning tasks',
    icon: '🌅',
    rarity: 'rare',
    category: 'morning',
    condition: (state) => state.morningControlCount >= 50,
    progress: (state) => ({ current: Math.min(state.morningControlCount, 50), total: 50 })
  },
  {
    id: 'morning_legend',
    name: 'Morning Legend',
    description: 'Complete 100 morning tasks',
    icon: '🦅',
    rarity: 'epic',
    category: 'morning',
    condition: (state) => state.morningControlCount >= 100,
    progress: (state) => ({ current: Math.min(state.morningControlCount, 100), total: 100 })
  },

  // Level Achievements
  {
    id: 'bronze_achiever',
    name: 'Bronze Achiever',
    description: 'Reach level 10',
    icon: '🥉',
    rarity: 'common',
    category: 'level',
    condition: (state) => state.level >= 10,
    progress: (state) => ({ current: Math.min(state.level, 10), total: 10 })
  },
  {
    id: 'silver_warrior',
    name: 'Silver Warrior',
    description: 'Reach level 25',
    icon: '🥈',
    rarity: 'rare',
    category: 'level',
    condition: (state) => state.level >= 25,
    progress: (state) => ({ current: Math.min(state.level, 25), total: 25 })
  },
  {
    id: 'gold_master',
    name: 'Gold Master',
    description: 'Reach level 50',
    icon: '🥇',
    rarity: 'epic',
    category: 'level',
    condition: (state) => state.level >= 50,
    progress: (state) => ({ current: Math.min(state.level, 50), total: 50 })
  },
  {
    id: 'diamond_elite',
    name: 'Diamond Elite',
    description: 'Reach level 100',
    icon: '💠',
    rarity: 'legendary',
    category: 'level',
    condition: (state) => state.level >= 100,
    progress: (state) => ({ current: Math.min(state.level, 100), total: 100 })
  },

  // XP Achievements
  {
    id: 'xp_millionaire',
    name: 'XP Millionaire',
    description: 'Earn 10,000 total XP',
    icon: '💰',
    rarity: 'epic',
    category: 'level',
    condition: (state, history) => history.reduce((sum, h) => sum + (h.xpEarned || 0), 0) >= 10000,
    progress: (state, history) => ({ current: Math.min(history.reduce((sum, h) => sum + (h.xpEarned || 0), 0), 10000), total: 10000 })
  },

  // Leverage Ratio Achievements
  {
    id: 'leverage_master',
    name: 'Leverage Master',
    description: 'Maintain 7+ average leverage ratio for 7 days',
    icon: '🎪',
    rarity: 'rare',
    category: 'leverage',
    condition: (state) => state.last7DaysLeverageRatio >= 7,
    progress: (state) => ({ current: Math.min(state.last7DaysLeverageRatio, 7), total: 7 })
  }
]

export function checkAchievements(userState: UserState, history: HistoryRecord[], unlockedIds: string[]): Achievement[] {
  const newlyUnlocked: Achievement[] = []

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id) && achievement.condition(userState, history)) {
      newlyUnlocked.push({
        ...achievement,
        unlockedAt: new Date().toISOString()
      })
    }
  }

  return newlyUnlocked
}
