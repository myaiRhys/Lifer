/**
 * Seasons System Database Module
 * Based on Robert Greene's Long-term Cyclical Framework
 *
 * Philosophy:
 * Life operates in seasons. Each season has a natural energy pattern:
 * - SPRING: Build (New ideas, experimentation, learning)
 * - SUMMER: Peak Performance (Execute, produce, deliver)
 * - FALL: Harvest (Reflect, integrate, celebrate wins)
 * - WINTER: Rest & Recover (Strategic planning, deep reflection)
 *
 * Unlike short-term productivity systems, seasons embrace:
 * - Natural energy cycles (3-6 month rhythms)
 * - Different mindsets for different phases
 * - Permission to rest without guilt
 * - Strategic withdrawal before the next push
 *
 * "The greatest mistake is to think you can sustain summer forever."
 */

import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Season, SeasonPhase, SeasonStats } from '../types'

/**
 * Get the current season phase
 * Returns undefined if no season has been set yet
 */
export async function getCurrentSeason(): Promise<SeasonPhase | undefined> {
  return await get<SeasonPhase>(KEYS.CURRENT_SEASON)
}

/**
 * Get all historical season phases
 */
export async function getSeasonHistory(): Promise<SeasonPhase[]> {
  const phases = await get<SeasonPhase[]>(KEYS.SEASON_PHASES)
  if (!phases) return []

  return phases.sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
}

/**
 * Start a new season
 * This ends the current season (if any) and begins a new one
 *
 * Use this when:
 * - Starting the app for the first time
 * - Manually transitioning to a new season
 * - After a major life change or completion
 */
export async function startNewSeason(params: {
  season: Season
  theme?: string
  primaryOutcomes?: string[]
}): Promise<SeasonPhase> {
  const now = new Date().toISOString()

  // End current season if exists
  const currentSeason = await getCurrentSeason()
  if (currentSeason && !currentSeason.endDate) {
    currentSeason.endDate = now

    // Save ended season to history
    const history = await getSeasonHistory()
    history.push(currentSeason)
    await set(KEYS.SEASON_PHASES, history)
  }

  // Determine energy pattern and mindset for season
  const { energyPattern, mindset } = getSeasonCharacteristics(params.season)

  // Create new season
  const newSeason: SeasonPhase = {
    id: `season_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    season: params.season,
    startDate: now,
    theme: params.theme,
    primaryOutcomes: params.primaryOutcomes || [],
    energyPattern,
    mindset,
    createdAt: now
  }

  await set(KEYS.CURRENT_SEASON, newSeason)

  return newSeason
}

/**
 * Get default characteristics for each season
 */
function getSeasonCharacteristics(season: Season): {
  energyPattern: 'building' | 'peak' | 'harvest' | 'rest'
  mindset: string
} {
  switch (season) {
    case 'spring':
      return {
        energyPattern: 'building',
        mindset: 'Explore, experiment, and plant seeds. Try new things without pressure.'
      }
    case 'summer':
      return {
        energyPattern: 'peak',
        mindset: 'Execute with intensity. This is your time to produce and deliver.'
      }
    case 'fall':
      return {
        energyPattern: 'harvest',
        mindset: 'Reap what you have sown. Reflect, integrate learnings, celebrate wins.'
      }
    case 'winter':
      return {
        energyPattern: 'rest',
        mindset: 'Rest deeply. Strategic planning. Let old identities die to make room for new growth.'
      }
  }
}

/**
 * Update the current season's theme and outcomes
 * Useful for refining focus within a season
 */
export async function updateSeasonFocus(params: {
  theme?: string
  primaryOutcomes?: string[]
  reflectionNotes?: string
}): Promise<SeasonPhase | null> {
  const current = await getCurrentSeason()
  if (!current) return null

  const updated: SeasonPhase = {
    ...current,
    ...(params.theme !== undefined && { theme: params.theme }),
    ...(params.primaryOutcomes !== undefined && { primaryOutcomes: params.primaryOutcomes }),
    ...(params.reflectionNotes !== undefined && { reflectionNotes: params.reflectionNotes })
  }

  await set(KEYS.CURRENT_SEASON, updated)
  return updated
}

/**
 * Get the next recommended season in the natural cycle
 */
export function getNextSeason(current: Season): Season {
  const cycle: Season[] = ['spring', 'summer', 'fall', 'winter']
  const currentIndex = cycle.indexOf(current)
  return cycle[(currentIndex + 1) % 4]
}

/**
 * Check if it's time to consider transitioning seasons
 * Returns suggestion if:
 * - Current season is 90+ days old (natural 3-month cycle)
 * - Current season is 180+ days old (strong suggestion)
 */
export async function checkSeasonTransition(): Promise<{
  shouldTransition: boolean
  daysInSeason: number
  nextSeason: Season
  message: string
} | null> {
  const current = await getCurrentSeason()
  if (!current) return null

  const now = Date.now()
  const startTime = new Date(current.startDate).getTime()
  const daysInSeason = Math.floor((now - startTime) / (1000 * 60 * 60 * 24))

  const nextSeason = getNextSeason(current.season)

  // Gentle suggestion at 90 days (3 months)
  if (daysInSeason >= 90 && daysInSeason < 180) {
    return {
      shouldTransition: false,
      daysInSeason,
      nextSeason,
      message: `You've been in ${current.season} for ${daysInSeason} days. Consider if it's time to transition to ${nextSeason}.`
    }
  }

  // Strong suggestion at 180 days (6 months)
  if (daysInSeason >= 180) {
    return {
      shouldTransition: true,
      daysInSeason,
      nextSeason,
      message: `You've been in ${current.season} for ${daysInSeason} days. It may be time to embrace ${nextSeason} and let this season end.`
    }
  }

  return null
}

/**
 * Get comprehensive season statistics
 */
export async function getSeasonStats(): Promise<SeasonStats> {
  const current = await getCurrentSeason()
  const history = await getSeasonHistory()

  if (!current) {
    return {
      currentSeason: 'spring',
      daysInCurrentSeason: 0,
      totalSeasonsCycled: 0,
      seasonHistory: [],
      seasonalPatterns: {
        avgSeasonDuration: 0
      }
    }
  }

  const now = Date.now()
  const currentStartTime = new Date(current.startDate).getTime()
  const daysInCurrentSeason = Math.floor((now - currentStartTime) / (1000 * 60 * 60 * 24))

  // Calculate history stats (only completed seasons)
  const completedSeasons = history.filter(s => s.endDate)

  const seasonHistory = completedSeasons.map(s => {
    const start = new Date(s.startDate).getTime()
    const end = new Date(s.endDate!).getTime()
    const duration = Math.floor((end - start) / (1000 * 60 * 60 * 24))

    return {
      season: s.season,
      startDate: s.startDate,
      endDate: s.endDate!,
      duration,
      outcomesCompleted: 0, // TODO: Link to actual outcome completions
      tasksCompleted: 0, // TODO: Link to actual task completions
      avgLeverageScore: 0 // TODO: Calculate from history
    }
  })

  // Find patterns
  let mostProductiveSeason: Season | undefined
  let longestSeasonData: { season: Season; days: number } | undefined

  if (seasonHistory.length > 0) {
    // Find longest season
    longestSeasonData = seasonHistory.reduce((max, s) =>
      s.duration > max.days ? { season: s.season, days: s.duration } : max
    , { season: seasonHistory[0].season, days: seasonHistory[0].duration })

    // Most productive = most tasks completed (placeholder)
    // TODO: Implement actual productivity calculation
    mostProductiveSeason = seasonHistory[0]?.season
  }

  const avgSeasonDuration = seasonHistory.length > 0
    ? Math.round(seasonHistory.reduce((sum, s) => sum + s.duration, 0) / seasonHistory.length)
    : 0

  return {
    currentSeason: current.season,
    daysInCurrentSeason,
    totalSeasonsCycled: completedSeasons.length,
    seasonHistory,
    seasonalPatterns: {
      mostProductiveSeason,
      longestSeason: longestSeasonData,
      avgSeasonDuration
    }
  }
}

/**
 * Get the season emoji for UI
 */
export function getSeasonEmoji(season: Season): string {
  switch (season) {
    case 'spring': return '🌱'
    case 'summer': return '☀️'
    case 'fall': return '🍂'
    case 'winter': return '❄️'
  }
}

/**
 * Get season color scheme for UI
 */
export function getSeasonColors(season: Season): {
  gradient: string
  text: string
  glow: string
} {
  switch (season) {
    case 'spring':
      return {
        gradient: 'from-green-500 to-emerald-600',
        text: 'text-green-400',
        glow: 'shadow-green-500/50'
      }
    case 'summer':
      return {
        gradient: 'from-yellow-500 to-orange-600',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/50'
      }
    case 'fall':
      return {
        gradient: 'from-orange-600 to-red-600',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/50'
      }
    case 'winter':
      return {
        gradient: 'from-blue-500 to-cyan-600',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/50'
      }
  }
}
