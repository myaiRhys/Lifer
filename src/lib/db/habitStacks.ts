import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { HabitStack, HabitStackLink, HabitStackCompletion, Practice } from '../types'
import { getPractices, getPracticeById } from './practices'

export async function getHabitStacks(): Promise<HabitStack[]> {
  const stacks = await get(KEYS.HABIT_STACKS)
  return stacks || []
}

export async function getHabitStackById(id: string): Promise<HabitStack | undefined> {
  const stacks = await getHabitStacks()
  return stacks.find(s => s.id === id)
}

export async function createHabitStack(
  name: string,
  description: string | undefined,
  chain: HabitStackLink[]
): Promise<HabitStack> {
  const stacks = await getHabitStacks()

  const newStack: HabitStack = {
    id: crypto.randomUUID(),
    name,
    description,
    chain,
    isActive: true,
    completionRate: 0,
    totalCompletions: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  }

  stacks.push(newStack)
  await set(KEYS.HABIT_STACKS, stacks)

  return newStack
}

export async function updateHabitStack(id: string, updates: Partial<HabitStack>): Promise<HabitStack | null> {
  const stacks = await getHabitStacks()
  const index = stacks.findIndex(s => s.id === id)

  if (index === -1) return null

  stacks[index] = {
    ...stacks[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  }

  await set(KEYS.HABIT_STACKS, stacks)
  return stacks[index]
}

export async function deleteHabitStack(id: string): Promise<boolean> {
  const stacks = await getHabitStacks()
  const filtered = stacks.filter(s => s.id !== id)

  if (filtered.length === stacks.length) return false

  await set(KEYS.HABIT_STACKS, filtered)
  return true
}

// Get completions for habit stacks
export async function getHabitStackCompletions(): Promise<HabitStackCompletion[]> {
  const completions = await get(KEYS.HABIT_STACK_COMPLETIONS)
  return completions || []
}

export async function getHabitStackCompletionsByStackId(stackId: string): Promise<HabitStackCompletion[]> {
  const completions = await getHabitStackCompletions()
  return completions.filter(c => c.stackId === stackId)
}

// Log a habit stack completion
export async function logHabitStackCompletion(
  stackId: string,
  completedLinks: string[],
  fullChainCompleted: boolean
): Promise<HabitStackCompletion> {
  const stack = await getHabitStackById(stackId)
  if (!stack) throw new Error('Habit stack not found')

  const completions = await getHabitStackCompletions()
  const today = new Date().toISOString().split('T')[0]

  const completion: HabitStackCompletion = {
    id: crypto.randomUUID(),
    stackId,
    stackName: stack.name,
    date: today,
    completedLinks,
    fullChainCompleted,
    timestamp: new Date().toISOString()
  }

  completions.push(completion)
  await set(KEYS.HABIT_STACK_COMPLETIONS, completions)

  // Update stack completion rate
  const stackCompletions = completions.filter(c => c.stackId === stackId && c.fullChainCompleted)
  const totalAttempts = completions.filter(c => c.stackId === stackId).length
  const completionRate = totalAttempts > 0 ? Math.round((stackCompletions.length / totalAttempts) * 100) : 0

  await updateHabitStack(stackId, {
    completionRate,
    totalCompletions: stackCompletions.length,
    lastCompleted: fullChainCompleted ? new Date().toISOString() : stack.lastCompleted
  })

  return completion
}

// Check if a stack was completed today
export async function isStackCompletedToday(stackId: string): Promise<boolean> {
  const completions = await getHabitStackCompletions()
  const today = new Date().toISOString().split('T')[0]

  return completions.some(c =>
    c.stackId === stackId &&
    c.date === today &&
    c.fullChainCompleted
  )
}

// Get stack progress for today
export async function getTodayStackProgress(stackId: string): Promise<{
  completedLinks: string[]
  totalLinks: number
  progressPercentage: number
}> {
  const stack = await getHabitStackById(stackId)
  if (!stack) {
    return { completedLinks: [], totalLinks: 0, progressPercentage: 0 }
  }

  const practices = await getPractices()
  const today = new Date().toDateString()

  // Check which practices in the stack are completed today
  const completedLinks = stack.chain
    .filter(link => {
      const practice = practices.find(p => p.id === link.practiceId)
      if (!practice) return false

      const lastLogged = new Date(practice.lastLoggedAt).toDateString()
      return lastLogged === today && practice.todayCompleted
    })
    .map(link => link.practiceId)

  const totalLinks = stack.chain.length
  const progressPercentage = totalLinks > 0 ? Math.round((completedLinks.length / totalLinks) * 100) : 0

  return {
    completedLinks,
    totalLinks,
    progressPercentage
  }
}

// Get suggested stacks based on user's practices
export async function getSuggestedStacks(): Promise<Array<{
  name: string
  description: string
  chain: HabitStackLink[]
}>> {
  const practices = await getPractices()
  const suggestions: Array<{ name: string; description: string; chain: HabitStackLink[] }> = []

  // Morning stack (if user has morning-related practices)
  const morningPractices = practices.filter(p =>
    p.name.toLowerCase().includes('meditate') ||
    p.name.toLowerCase().includes('journal') ||
    p.name.toLowerCase().includes('exercise') ||
    p.name.toLowerCase().includes('hydrat') ||
    p.name.toLowerCase().includes('water')
  )

  if (morningPractices.length >= 2) {
    suggestions.push({
      name: 'Morning Routine',
      description: 'Stack your morning habits for a powerful start to the day',
      chain: morningPractices.slice(0, 4).map((p, i) => ({
        practiceId: p.id,
        order: i + 1,
        transitionTime: 60 // 1 minute between habits
      }))
    })
  }

  // Evening stack
  const eveningPractices = practices.filter(p =>
    p.name.toLowerCase().includes('read') ||
    p.name.toLowerCase().includes('stretch') ||
    p.name.toLowerCase().includes('plan')
  )

  if (eveningPractices.length >= 2) {
    suggestions.push({
      name: 'Evening Wind-Down',
      description: 'End your day with consistent habits',
      chain: eveningPractices.slice(0, 3).map((p, i) => ({
        practiceId: p.id,
        order: i + 1,
        transitionTime: 120 // 2 minutes between habits
      }))
    })
  }

  return suggestions
}

// Create a default morning stack if user has appropriate practices
export async function createDefaultMorningStack(): Promise<HabitStack | null> {
  const practices = await getPractices()

  // Look for common morning practices
  const meditation = practices.find(p => p.name.toLowerCase().includes('meditate'))
  const journal = practices.find(p => p.name.toLowerCase().includes('journal'))
  const exercise = practices.find(p =>
    p.name.toLowerCase().includes('exercise') ||
    p.name.toLowerCase().includes('workout') ||
    p.name.toLowerCase().includes('gym')
  )
  const hydration = practices.find(p =>
    p.name.toLowerCase().includes('water') ||
    p.name.toLowerCase().includes('hydrat')
  )

  const chain: HabitStackLink[] = []
  let order = 1

  if (hydration) {
    chain.push({ practiceId: hydration.id, order: order++, transitionTime: 0 })
  }
  if (meditation) {
    chain.push({ practiceId: meditation.id, order: order++, transitionTime: 60 })
  }
  if (journal) {
    chain.push({ practiceId: journal.id, order: order++, transitionTime: 60 })
  }
  if (exercise) {
    chain.push({ practiceId: exercise.id, order: order++, transitionTime: 300 })
  }

  if (chain.length < 2) return null

  return await createHabitStack(
    'Morning Routine',
    'Win the morning, win the day. Stack your most important habits to build momentum.',
    chain
  )
}

// Get analytics for a specific stack
export async function getHabitStackAnalytics(stackId: string): Promise<{
  totalAttempts: number
  successfulCompletions: number
  completionRate: number
  currentStreak: number
  longestStreak: number
  averageProgressPercentage: number
  lastCompleted?: string
}> {
  const stack = await getHabitStackById(stackId)
  if (!stack) {
    return {
      totalAttempts: 0,
      successfulCompletions: 0,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageProgressPercentage: 0
    }
  }

  const completions = await getHabitStackCompletionsByStackId(stackId)
  const totalAttempts = completions.length
  const successfulCompletions = completions.filter(c => c.fullChainCompleted).length
  const completionRate = totalAttempts > 0 ? Math.round((successfulCompletions / totalAttempts) * 100) : 0

  // Calculate streaks
  const completedDates = completions
    .filter(c => c.fullChainCompleted)
    .map(c => c.date)
    .sort()

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  if (completedDates.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Check if completed today or yesterday
    if (completedDates[completedDates.length - 1] === today || completedDates[completedDates.length - 1] === yesterday) {
      // Calculate current streak
      for (let i = completedDates.length - 1; i >= 0; i--) {
        const expectedDate = new Date(Date.now() - (currentStreak * 86400000)).toISOString().split('T')[0]
        if (completedDates[i] === expectedDate) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    for (let i = 0; i < completedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(completedDates[i - 1])
        const currDate = new Date(completedDates[i])
        const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000))

        if (dayDiff === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }
  }

  // Calculate average progress
  const totalProgress = completions.reduce((sum, c) => {
    const progress = (c.completedLinks.length / stack.chain.length) * 100
    return sum + progress
  }, 0)
  const averageProgressPercentage = totalAttempts > 0 ? Math.round(totalProgress / totalAttempts) : 0

  return {
    totalAttempts,
    successfulCompletions,
    completionRate,
    currentStreak,
    longestStreak,
    averageProgressPercentage,
    lastCompleted: stack.lastCompleted
  }
}
