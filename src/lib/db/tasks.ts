import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { Task } from '../types'
import { addHistoryRecord } from './history'
import { addIdentityVote, getIdentity } from './identity'

function generateUUID(): string {
  return crypto.randomUUID()
}

export async function getTasks(): Promise<Task[]> {
  const tasks = await get(KEYS.TASKS)
  return tasks || []
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const tasks = await getTasks()
  return tasks.find(t => t.id === id)
}

export async function createTask(taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>): Promise<Task> {
  const tasks = await getTasks()

  const newTask: Task = {
    ...taskData,
    id: generateUUID(),
    completed: false,
    createdAt: new Date().toISOString()
  }

  tasks.push(newTask)
  await set(KEYS.TASKS, tasks)

  return newTask
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const tasks = await getTasks()
  const index = tasks.findIndex(t => t.id === id)

  if (index === -1) return null

  tasks[index] = { ...tasks[index], ...updates }
  await set(KEYS.TASKS, tasks)

  return tasks[index]
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = await getTasks()
  const filtered = tasks.filter(t => t.id !== id)

  if (filtered.length === tasks.length) return false

  await set(KEYS.TASKS, filtered)
  return true
}

export async function completeTask(id: string, xpEarned: number): Promise<Task | null> {
  const task = await getTaskById(id)
  if (!task) return null

  const completedAt = new Date().toISOString()
  const now = new Date()

  const updated = await updateTask(id, {
    completed: true,
    completedAt,
    xpEarned
  })

  if (updated) {
    // Add to history
    await addHistoryRecord({
      type: 'task',
      entityId: task.id,
      entitySnapshot: updated,
      completedAt,
      xpEarned,
      wasInMorningWindow: task.isMorningTask && now.getHours() < 9,
      leverageScore: task.leverageScore,
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours()
    })

    // Add identity vote (if identity exists)
    const identity = await getIdentity()
    if (identity) {
      const context = task.leverageScore >= 7
        ? `High-leverage task (${task.leverageScore}/10)`
        : task.isMorningTask
        ? 'Morning task'
        : undefined

      await addIdentityVote(
        `Completed: ${task.title}`,
        'task',
        'for', // Task completion always votes FOR identity
        task.id,
        context
      )
    }

    // Update morning session if task is a morning task and we're in window
    if (task.isMorningTask) {
      const { updateMorningSession, isInMorningWindow } = await import('./morning')
      const inWindow = await isInMorningWindow()
      if (inWindow) {
        await updateMorningSession(task.leverageScore)
      }
    }
  }

  return updated
}

export async function uncompleteTask(id: string): Promise<Task | null> {
  const task = await getTaskById(id)
  if (!task || !task.completed) return null

  const updated = await updateTask(id, {
    completed: false,
    completedAt: undefined,
    xpEarned: undefined
  })

  return updated
}

export async function getActiveTasks(): Promise<Task[]> {
  const tasks = await getTasks()
  return tasks.filter(t => !t.completed)
}

export async function getMorningTasks(): Promise<Task[]> {
  const tasks = await getActiveTasks()
  return tasks.filter(t => t.isMorningTask)
}

export async function getTasksByOutcome(outcomeId: string): Promise<Task[]> {
  const tasks = await getTasks()
  return tasks.filter(t => t.outcomeId === outcomeId)
}

export async function getHighLeverageTasks(minScore: number = 7): Promise<Task[]> {
  const tasks = await getActiveTasks()
  return tasks.filter(t => t.leverageScore >= minScore)
}
