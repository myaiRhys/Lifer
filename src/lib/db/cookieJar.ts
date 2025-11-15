/**
 * Cookie Jar Database Module
 * Based on David Goggins' Mental Toughness Method
 *
 * The Cookie Jar is a mental tool for accessing past victories during hard moments.
 * "When you're at 40%, you're not done. You have 60% left in the tank."
 *
 * Philosophy:
 * - Store victories with rich emotional context
 * - Retrieve them during hard moments for strength
 * - Each retrieval strengthens the neural pathway
 * - Track which victories give you the most power
 */

import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { CookieJarVictory, CookieJarStats, VictoryEmotion } from '../types'

/**
 * Add a victory to the Cookie Jar
 * This can be called when:
 * - Achievement unlocked (auto-capture with emotional context prompt)
 * - Major task completed
 * - Practice milestone reached
 * - User manually adds a past victory
 */
export async function addVictory(params: {
  title: string
  story: string
  emotion: VictoryEmotion
  difficulty: number // 1-10
  category: CookieJarVictory['category']
  dateAchieved?: string // Optional: defaults to now
  sourceType?: CookieJarVictory['sourceType']
  sourceId?: string
}): Promise<CookieJarVictory> {
  const victories = await getVictories()

  const newVictory: CookieJarVictory = {
    id: `victory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: params.title,
    story: params.story,
    emotion: params.emotion,
    difficulty: Math.max(1, Math.min(10, params.difficulty)), // Clamp 1-10
    category: params.category,
    dateAchieved: params.dateAchieved || new Date().toISOString(),
    sourceType: params.sourceType,
    sourceId: params.sourceId,
    timesRetrieved: 0,
    createdAt: new Date().toISOString()
  }

  victories.push(newVictory)
  await set(KEYS.COOKIE_JAR_VICTORIES, victories)

  return newVictory
}

/**
 * Get all victories from the Cookie Jar
 * Sorted by most recently added (newest first)
 */
export async function getVictories(): Promise<CookieJarVictory[]> {
  const victories = await get<CookieJarVictory[]>(KEYS.COOKIE_JAR_VICTORIES)
  if (!victories) return []

  return victories.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Retrieve a victory for strength during a hard moment
 * This is the core of the 40% rule - accessing past wins when you think you're done
 *
 * Each retrieval:
 * - Increments the timesRetrieved counter
 * - Updates lastRetrievedAt timestamp
 * - Returns the victory for display
 *
 * Usage: When user feels stuck/tired/wants to quit, open the jar
 */
export async function retrieveVictory(victoryId: string): Promise<CookieJarVictory | null> {
  const victories = await getVictories()
  const index = victories.findIndex(v => v.id === victoryId)

  if (index === -1) return null

  // Increment retrieval counter and timestamp
  victories[index].timesRetrieved += 1
  victories[index].lastRetrievedAt = new Date().toISOString()

  await set(KEYS.COOKIE_JAR_VICTORIES, victories)

  return victories[index]
}

/**
 * Get a random victory for inspiration
 * Weighted by difficulty - harder victories are more likely to be shown
 */
export async function getRandomVictory(): Promise<CookieJarVictory | null> {
  const victories = await getVictories()

  if (victories.length === 0) return null

  // Weight by difficulty: higher difficulty = more likely to be chosen
  const weights = victories.map(v => v.difficulty)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  let random = Math.random() * totalWeight

  for (let i = 0; i < victories.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return await retrieveVictory(victories[i].id) // Also increments counter
    }
  }

  // Fallback: return first victory
  return await retrieveVictory(victories[0].id)
}

/**
 * Get victories by category
 * Useful for targeted inspiration (e.g., "Show me my physical victories")
 */
export async function getVictoriesByCategory(
  category: CookieJarVictory['category']
): Promise<CookieJarVictory[]> {
  const victories = await getVictories()
  return victories.filter(v => v.category === category)
}

/**
 * Get victories by emotion
 * Useful when you need a specific emotional state
 */
export async function getVictoriesByEmotion(
  emotion: VictoryEmotion
): Promise<CookieJarVictory[]> {
  const victories = await getVictories()
  return victories.filter(v => v.emotion === emotion)
}

/**
 * Update a victory's story or emotional context
 * Allows users to refine their victories over time
 */
export async function updateVictory(
  victoryId: string,
  updates: Partial<Pick<CookieJarVictory, 'title' | 'story' | 'emotion' | 'difficulty' | 'category'>>
): Promise<CookieJarVictory | null> {
  const victories = await getVictories()
  const index = victories.findIndex(v => v.id === victoryId)

  if (index === -1) return null

  victories[index] = { ...victories[index], ...updates }
  await set(KEYS.COOKIE_JAR_VICTORIES, victories)

  return victories[index]
}

/**
 * Delete a victory
 * Rare, but useful if a "victory" wasn't actually meaningful
 */
export async function deleteVictory(victoryId: string): Promise<boolean> {
  const victories = await getVictories()
  const filtered = victories.filter(v => v.id !== victoryId)

  if (filtered.length === victories.length) return false // Not found

  await set(KEYS.COOKIE_JAR_VICTORIES, filtered)
  return true
}

/**
 * Get Cookie Jar statistics
 * Shows the power of the jar and which victories are most impactful
 */
export async function getCookieJarStats(): Promise<CookieJarStats> {
  const victories = await getVictories()

  if (victories.length === 0) {
    return {
      totalVictories: 0,
      totalRetrievals: 0,
      victoryByCategory: [],
      avgDifficulty: 0,
      mostCommonEmotion: 'proud',
      currentStrength: 0
    }
  }

  // Calculate total retrievals
  const totalRetrievals = victories.reduce((sum, v) => sum + v.timesRetrieved, 0)

  // Find most retrieved victory
  const mostRetrieved = victories.reduce((max, v) =>
    v.timesRetrieved > max.timesRetrieved ? v : max
  )

  // Category breakdown
  const categoryMap = new Map<string, { count: number }>()
  victories.forEach(v => {
    const existing = categoryMap.get(v.category) || { count: 0 }
    categoryMap.set(v.category, { count: existing.count + 1 })
  })

  const victoryByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count
  }))

  // Average difficulty
  const avgDifficulty = victories.reduce((sum, v) => sum + v.difficulty, 0) / victories.length

  // Most common emotion
  const emotionMap = new Map<VictoryEmotion, number>()
  victories.forEach(v => {
    emotionMap.set(v.emotion, (emotionMap.get(v.emotion) || 0) + 1)
  })
  const mostCommonEmotion = Array.from(emotionMap.entries()).reduce((max, [emotion, count]) =>
    count > max[1] ? [emotion, count] : max
  , ['proud', 0] as [VictoryEmotion, number])[0]

  // Current strength calculation (1-100)
  // Based on:
  // - Number of victories (more = stronger)
  // - Average difficulty (harder victories = stronger)
  // - Recent retrievals (using the jar = stronger)
  const recentRetrievals = victories.filter(v => {
    if (!v.lastRetrievedAt) return false
    const daysSince = (Date.now() - new Date(v.lastRetrievedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 7 // Retrieved in last 7 days
  }).length

  const strengthFromCount = Math.min(50, victories.length * 5) // Max 50 points from count
  const strengthFromDifficulty = Math.min(30, avgDifficulty * 3) // Max 30 points from difficulty
  const strengthFromUsage = Math.min(20, recentRetrievals * 4) // Max 20 points from recent usage

  const currentStrength = Math.round(strengthFromCount + strengthFromDifficulty + strengthFromUsage)

  return {
    totalVictories: victories.length,
    totalRetrievals,
    mostRetrievedVictory: mostRetrieved,
    victoryByCategory,
    avgDifficulty: Math.round(avgDifficulty * 10) / 10, // Round to 1 decimal
    mostCommonEmotion,
    currentStrength
  }
}

/**
 * Get victories that haven't been retrieved in a while
 * Good for reminding users of forgotten wins
 */
export async function getForgottenVictories(): Promise<CookieJarVictory[]> {
  const victories = await getVictories()
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)

  return victories.filter(v => {
    if (v.timesRetrieved === 0) return false // Never retrieved, not forgotten
    if (!v.lastRetrievedAt) return false

    const lastRetrieved = new Date(v.lastRetrievedAt).getTime()
    return lastRetrieved < thirtyDaysAgo
  }).sort((a, b) => b.difficulty - a.difficulty) // Show hardest victories first
}
