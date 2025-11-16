/**
 * Enhanced export utilities for external integrations
 * Supports multiple formats: JSON, CSV, Markdown, ICS Calendar
 */

import { getTasks, getPractices, getOutcomes, getHistory, getUserState } from './index'
import type { Task, Practice, Outcome, HistoryRecord, UserState } from '../types'

/**
 * Export tasks to CSV format (Excel/Google Sheets compatible)
 */
export async function exportTasksToCSV(): Promise<string> {
  const tasks = await getTasks()

  const headers = ['Title', 'Description', 'Leverage Score', 'Status', 'Created At', 'Completed At', 'Scheduled For', 'Outcome', 'Morning Task', 'Tags']
  const rows = tasks.map(task => [
    task.title,
    task.description || '',
    task.leverageScore.toString(),
    task.completed ? 'Completed' : 'Active',
    new Date(task.createdAt).toLocaleString(),
    task.completedAt ? new Date(task.completedAt).toLocaleString() : '',
    task.scheduledFor || '',
    task.outcomeId || '',
    task.isMorningTask ? 'Yes' : 'No',
    task.tags?.join('; ') || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  return csv
}

/**
 * Export practices to CSV format
 */
export async function exportPracticesToCSV(): Promise<string> {
  const practices = await getPractices()

  const headers = ['Name', 'Type', 'Target', 'Unit', 'Frequency', 'Current Streak', 'Best Streak', 'Total Completions', 'Tags']
  const rows = practices.map(practice => [
    practice.name,
    practice.type,
    practice.target?.toString() || '',
    practice.unit || '',
    practice.frequency || '',
    practice.currentStreak?.toString() || '0',
    practice.bestStreak?.toString() || '0',
    practice.completionHistory?.length.toString() || '0',
    practice.tags?.join('; ') || ''
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  return csv
}

/**
 * Export all data to Markdown format (Notion compatible)
 */
export async function exportToMarkdown(): Promise<string> {
  const tasks = await getTasks()
  const practices = await getPractices()
  const outcomes = await getOutcomes()
  const userState = await getUserState()
  const history = await getHistory()

  let markdown = `# Lifer Data Export\n\n`
  markdown += `**Exported:** ${new Date().toLocaleString()}\n\n`
  markdown += `---\n\n`

  // User Stats
  if (userState) {
    markdown += `## 📊 User Stats\n\n`
    markdown += `- **Level:** ${userState.level}\n`
    markdown += `- **XP:** ${userState.xp}\n`
    markdown += `- **Total Completions:** ${userState.totalCompletions}\n`
    markdown += `- **Current Streak:** ${userState.currentStreak} days\n`
    markdown += `- **Best Streak:** ${userState.bestStreak} days\n`
    markdown += `\n---\n\n`
  }

  // Active Tasks
  const activeTasks = tasks.filter(t => !t.completed)
  if (activeTasks.length > 0) {
    markdown += `## ✅ Active Tasks (${activeTasks.length})\n\n`
    activeTasks.forEach(task => {
      markdown += `### ${task.title}\n\n`
      if (task.description) markdown += `${task.description}\n\n`
      markdown += `- **Leverage Score:** ${task.leverageScore}/10\n`
      if (task.scheduledFor) markdown += `- **Due:** ${new Date(task.scheduledFor).toLocaleDateString()}\n`
      if (task.outcomeId) markdown += `- **Outcome:** ${task.outcomeId}\n`
      if (task.tags && task.tags.length > 0) markdown += `- **Tags:** ${task.tags.join(', ')}\n`
      markdown += `\n`
    })
    markdown += `---\n\n`
  }

  // Practices
  if (practices.length > 0) {
    markdown += `## ♻️ Daily Practices (${practices.length})\n\n`
    markdown += `| Practice | Streak | Best | Completions |\n`
    markdown += `|----------|--------|------|-------------|\n`
    practices.forEach(practice => {
      markdown += `| ${practice.name} | ${practice.currentStreak || 0} | ${practice.bestStreak || 0} | ${practice.completionHistory?.length || 0} |\n`
    })
    markdown += `\n---\n\n`
  }

  // Outcomes
  const activeOutcomes = outcomes.filter(o => o.status !== 'completed' && o.status !== 'archived')
  if (activeOutcomes.length > 0) {
    markdown += `## 🎯 Active Outcomes (${activeOutcomes.length})\n\n`
    activeOutcomes.forEach(outcome => {
      markdown += `### ${outcome.result}\n\n`
      markdown += `**Purpose:** ${outcome.purpose}\n\n`
      markdown += `- **Progress:** ${outcome.progress}%\n`
      markdown += `- **Status:** ${outcome.status}\n`
      markdown += `- **Created:** ${new Date(outcome.createdAt).toLocaleDateString()}\n`
      markdown += `\n`
    })
    markdown += `---\n\n`
  }

  // Recent Activity
  const recentHistory = history.slice(-20).reverse()
  if (recentHistory.length > 0) {
    markdown += `## 📅 Recent Activity (Last 20)\n\n`
    recentHistory.forEach(record => {
      const date = new Date(record.completedAt).toLocaleString()
      markdown += `- **${date}** - ${record.type}: ${record.title || record.practiceName || 'Unknown'}\n`
    })
  }

  return markdown
}

/**
 * Export tasks with due dates to ICS calendar format
 */
export async function exportToCalendar(): Promise<string> {
  const tasks = await getTasks()
  const tasksWithDates = tasks.filter(t => t.scheduledFor && !t.completed)

  let ics = 'BEGIN:VCALENDAR\n'
  ics += 'VERSION:2.0\n'
  ics += 'PRODID:-//Lifer//Task Calendar//EN\n'
  ics += 'CALSCALE:GREGORIAN\n'
  ics += 'METHOD:PUBLISH\n'
  ics += 'X-WR-CALNAME:Lifer Tasks\n'
  ics += 'X-WR-TIMEZONE:UTC\n'

  tasksWithDates.forEach(task => {
    const dueDate = new Date(task.scheduledFor!)
    const dtstart = formatICSDate(dueDate)
    const dtend = formatICSDate(new Date(dueDate.getTime() + 3600000)) // +1 hour
    const uid = `task-${task.id}@lifer.app`
    const created = formatICSDate(new Date(task.createdAt))

    ics += 'BEGIN:VEVENT\n'
    ics += `UID:${uid}\n`
    ics += `DTSTAMP:${created}\n`
    ics += `DTSTART:${dtstart}\n`
    ics += `DTEND:${dtend}\n`
    ics += `SUMMARY:${escapeICSText(task.title)}\n`
    if (task.description) {
      ics += `DESCRIPTION:${escapeICSText(task.description)}\n`
    }
    ics += `PRIORITY:${10 - task.leverageScore}\n` // Higher leverage = higher priority
    ics += 'STATUS:CONFIRMED\n'
    if (task.tags && task.tags.length > 0) {
      ics += `CATEGORIES:${task.tags.join(',')}\n`
    }
    ics += 'END:VEVENT\n'
  })

  ics += 'END:VCALENDAR\n'
  return ics
}

/**
 * Format date for ICS file (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Escape special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Download file helper
 */
export function downloadFile(data: string, filename: string, mimeType: string) {
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export handlers for UI
 */
export const exportHandlers = {
  async json() {
    const { exportAllData, downloadBackup } = await import('./backup')
    const data = await exportAllData()
    downloadBackup(data, `lifer-backup-${Date.now()}.json`)
  },

  async csv() {
    const tasksCSV = await exportTasksToCSV()
    downloadFile(tasksCSV, `lifer-tasks-${Date.now()}.csv`, 'text/csv')
  },

  async csvPractices() {
    const practicesCSV = await exportPracticesToCSV()
    downloadFile(practicesCSV, `lifer-practices-${Date.now()}.csv`, 'text/csv')
  },

  async markdown() {
    const markdown = await exportToMarkdown()
    downloadFile(markdown, `lifer-export-${Date.now()}.md`, 'text/markdown')
  },

  async calendar() {
    const ics = await exportToCalendar()
    downloadFile(ics, `lifer-tasks-${Date.now()}.ics`, 'text/calendar')
  }
}
