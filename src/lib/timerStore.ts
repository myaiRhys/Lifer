import { writable, derived } from 'svelte/store'
import { createFocusSession, completeFocusSession, addXP } from './db'
import { celebrateTaskComplete } from './animations'
import { soundSystem } from './sounds'
import { notificationSystem } from './notifications'

export type TimerType = 'work' | 'short_break' | 'long_break'

export interface TimerState {
  type: TimerType
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  isPaused: boolean
  completedPomodoros: number
  sessionId: string | null
  startedAt: number | null
}

const STORAGE_KEY = 'lifer-timer-state'

// Load initial state from localStorage
function loadTimerState(): TimerState {
  if (typeof localStorage === 'undefined') {
    return getDefaultState()
  }

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return getDefaultState()

  try {
    const state = JSON.parse(saved) as TimerState

    // If timer was running, recalculate time remaining based on elapsed time
    if (state.isRunning && state.startedAt) {
      const elapsed = Math.floor((Date.now() - state.startedAt) / 1000)
      state.timeRemaining = Math.max(0, state.timeRemaining - elapsed)
      state.startedAt = Date.now() // Reset start time for future calculations
    }

    return state
  } catch (e) {
    console.error('Failed to load timer state:', e)
    return getDefaultState()
  }
}

function getDefaultState(): TimerState {
  return {
    type: 'work',
    timeRemaining: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    isPaused: false,
    completedPomodoros: 0,
    sessionId: null,
    startedAt: null
  }
}

// Create the store
const timerStore = writable<TimerState>(loadTimerState())

// Subscribe to save state to localStorage
timerStore.subscribe(state => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
})

// Derived store for formatted time
export const formattedTime = derived(timerStore, $timer => {
  const minutes = Math.floor($timer.timeRemaining / 60)
  const seconds = $timer.timeRemaining % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Timer interval management (global)
let timerInterval: number | null = null

function startInterval() {
  if (timerInterval) return // Already running

  timerInterval = window.setInterval(() => {
    timerStore.update(state => {
      if (!state.isRunning) return state

      const newTimeRemaining = state.timeRemaining - 1

      if (newTimeRemaining <= 0) {
        // Timer completed
        handleTimerComplete(state)
        return {
          ...state,
          timeRemaining: 0,
          isRunning: false,
          isPaused: false,
          startedAt: null
        }
      }

      return {
        ...state,
        timeRemaining: newTimeRemaining
      }
    })
  }, 1000)
}

function stopInterval() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

async function handleTimerComplete(state: TimerState) {
  stopInterval()

  if (state.type === 'work') {
    // Award XP for completed Pomodoro
    const xpEarned = 100

    if (state.sessionId) {
      await completeFocusSession(state.sessionId, xpEarned, false)
    } else {
      const session = await createFocusSession('pomodoro', state.totalTime / 60)
      await completeFocusSession(session.id, xpEarned, false)
    }

    await addXP(xpEarned)
    celebrateTaskComplete(7)
    soundSystem.taskComplete(7)

    // Send notification
    notificationSystem.showTimerComplete('Pomodoro Complete!', 'Great work! Time for a break.')

    // Auto-switch to break
    const newCompletedPomodoros = state.completedPomodoros + 1
    const breakType = newCompletedPomodoros % 4 === 0 ? 'long_break' : 'short_break'
    const breakLength = breakType === 'long_break' ? 15 * 60 : 5 * 60

    timerStore.set({
      type: breakType,
      timeRemaining: breakLength,
      totalTime: breakLength,
      isRunning: false,
      isPaused: false,
      completedPomodoros: newCompletedPomodoros,
      sessionId: null,
      startedAt: null
    })
  } else {
    // Break completed
    soundSystem.taskComplete(5)
    notificationSystem.showTimerComplete('Break Complete!', 'Ready to focus again?')

    // Switch back to work
    const workLength = 25 * 60
    timerStore.set({
      type: 'work',
      timeRemaining: workLength,
      totalTime: workLength,
      isRunning: false,
      isPaused: false,
      completedPomodoros: state.completedPomodoros,
      sessionId: null,
      startedAt: null
    })
  }
}

// Timer actions
export const timerActions = {
  start: () => {
    timerStore.update(state => ({
      ...state,
      isRunning: true,
      isPaused: false,
      startedAt: Date.now()
    }))
    startInterval()
  },

  pause: () => {
    timerStore.update(state => ({
      ...state,
      isRunning: false,
      isPaused: true,
      startedAt: null
    }))
    stopInterval()
  },

  resume: () => {
    timerStore.update(state => ({
      ...state,
      isRunning: true,
      isPaused: false,
      startedAt: Date.now()
    }))
    startInterval()
  },

  stop: () => {
    stopInterval()
    timerStore.update(state => ({
      ...state,
      isRunning: false,
      isPaused: false,
      timeRemaining: state.totalTime,
      sessionId: null,
      startedAt: null
    }))
  },

  reset: () => {
    stopInterval()
    timerStore.set(getDefaultState())
  },

  switchType: (type: TimerType, length: number) => {
    stopInterval()
    const totalTime = length * 60
    timerStore.update(state => ({
      ...state,
      type,
      timeRemaining: totalTime,
      totalTime,
      isRunning: false,
      isPaused: false,
      sessionId: null,
      startedAt: null
    }))
  }
}

// Initialize interval if timer was running
const initialState = loadTimerState()
if (initialState.isRunning) {
  startInterval()
}

export default timerStore
