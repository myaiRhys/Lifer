/**
 * Unit tests for export utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportTasksToCSV, exportPracticesToCSV, exportToMarkdown, exportToCalendar } from './export'
import type { Task, Practice } from '../types'

// Mock the database functions
vi.mock('./index', () => ({
  getTasks: vi.fn(),
  getPractices: vi.fn(),
  getOutcomes: vi.fn(),
  getUserState: vi.fn(),
  getHistory: vi.fn()
}))

describe('Export Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportTasksToCSV', () => {
    it('should export tasks to CSV format', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          leverageScore: 8,
          completed: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          scheduledFor: '2025-01-10',
          tags: ['work', 'important']
        } as Task
      ]

      const { getTasks } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)

      const csv = await exportTasksToCSV()

      expect(csv).toContain('Title,Description,Leverage Score')
      expect(csv).toContain('Test Task')
      expect(csv).toContain('Test Description')
      expect(csv).toContain('8')
    })

    it('should handle special characters in CSV', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Task with "quotes"',
          description: 'Description, with comma',
          leverageScore: 5,
          completed: false,
          createdAt: '2025-01-01T00:00:00.000Z'
        } as Task
      ]

      const { getTasks } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)

      const csv = await exportTasksToCSV()

      expect(csv).toContain('""quotes""') // Escaped quotes
      expect(csv).toContain('with comma') // Comma in quoted field
    })
  })

  describe('exportPracticesToCSV', () => {
    it('should export practices to CSV format', async () => {
      const mockPractices: Practice[] = [
        {
          id: '1',
          name: 'Meditation',
          type: 'positive',
          target: 10,
          unit: 'minutes',
          frequency: 'daily',
          currentStreak: 5,
          bestStreak: 10,
          completionHistory: [{} as any, {} as any, {} as any],
          tags: ['wellness']
        } as Practice
      ]

      const { getPractices } = await import('./index')
      vi.mocked(getPractices).mockResolvedValue(mockPractices)

      const csv = await exportPracticesToCSV()

      expect(csv).toContain('Name,Type,Target,Unit')
      expect(csv).toContain('Meditation')
      expect(csv).toContain('positive')
      expect(csv).toContain('10')
      expect(csv).toContain('minutes')
    })
  })

  describe('exportToMarkdown', () => {
    it('should export data to Markdown format', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Important Task',
          description: 'Task description',
          leverageScore: 9,
          completed: false,
          createdAt: '2025-01-01T00:00:00.000Z'
        } as Task
      ]

      const { getTasks, getPractices, getOutcomes, getUserState, getHistory } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)
      vi.mocked(getPractices).mockResolvedValue([])
      vi.mocked(getOutcomes).mockResolvedValue([])
      vi.mocked(getUserState).mockResolvedValue(null)
      vi.mocked(getHistory).mockResolvedValue([])

      const markdown = await exportToMarkdown()

      expect(markdown).toContain('# Lifer Data Export')
      expect(markdown).toContain('## ✅ Active Tasks')
      expect(markdown).toContain('### Important Task')
      expect(markdown).toContain('**Leverage Score:** 9/10')
    })
  })

  describe('exportToCalendar', () => {
    it('should export tasks with due dates to ICS format', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Meeting Task',
          description: 'Important meeting',
          leverageScore: 7,
          completed: false,
          createdAt: '2025-01-01T00:00:00.000Z',
          scheduledFor: '2025-01-15T10:00:00.000Z',
          tags: ['meeting', 'work']
        } as Task
      ]

      const { getTasks } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)

      const ics = await exportToCalendar()

      expect(ics).toContain('BEGIN:VCALENDAR')
      expect(ics).toContain('VERSION:2.0')
      expect(ics).toContain('BEGIN:VEVENT')
      expect(ics).toContain('SUMMARY:Meeting Task')
      expect(ics).toContain('DESCRIPTION:Important meeting')
      expect(ics).toContain('CATEGORIES:meeting,work')
      expect(ics).toContain('END:VEVENT')
      expect(ics).toContain('END:VCALENDAR')
    })

    it('should skip completed tasks', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Completed Task',
          leverageScore: 5,
          completed: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          scheduledFor: '2025-01-15T10:00:00.000Z'
        } as Task
      ]

      const { getTasks } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)

      const ics = await exportToCalendar()

      expect(ics).not.toContain('SUMMARY:Completed Task')
    })

    it('should skip tasks without due dates', async () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'No Date Task',
          leverageScore: 5,
          completed: false,
          createdAt: '2025-01-01T00:00:00.000Z'
        } as Task
      ]

      const { getTasks } = await import('./index')
      vi.mocked(getTasks).mockResolvedValue(mockTasks)

      const ics = await exportToCalendar()

      expect(ics).not.toContain('SUMMARY:No Date Task')
    })
  })
})
