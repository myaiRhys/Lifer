import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { EnergyLog, BPTAnalysis } from '../types'
import { getTasks } from './tasks'

function generateUUID(): string {
  return crypto.randomUUID()
}

function getContext(): 'morning' | 'midday' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'midday'
  return 'evening'
}

export async function getEnergyLogs(): Promise<EnergyLog[]> {
  const logs = await get(KEYS.ENERGY_LOGS)
  return logs || []
}

export async function getTodaysEnergyLogs(): Promise<EnergyLog[]> {
  const logs = await getEnergyLogs()
  const today = new Date().toISOString().split('T')[0]
  return logs.filter(l => l.timestamp.startsWith(today))
}

export async function logEnergy(energy: number, notes?: string): Promise<EnergyLog> {
  const logs = await getEnergyLogs()
  const tasks = await getTasks()

  // Count tasks completed in last hour
  const oneHourAgo = Date.now() - 3600000
  const recentTasks = tasks.filter(t =>
    t.completedAt &&
    new Date(t.completedAt).getTime() > oneHourAgo
  ).length

  const log: EnergyLog = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    energy,
    context: getContext(),
    notes,
    completedTasksInLastHour: recentTasks
  }

  logs.push(log)
  await set(KEYS.ENERGY_LOGS, logs)

  // Check if we have enough data for BPT calculation (21 days * 3 logs/day = 63)
  if (logs.length >= 63) {
    await calculateBPT()
  }

  return log
}

export async function getBPTAnalysis(): Promise<BPTAnalysis | null> {
  return await get(KEYS.BPT_ANALYSIS) || null
}

export async function calculateBPT(): Promise<BPTAnalysis> {
  const logs = await getEnergyLogs()

  // Group by hour
  const hourlyData: { [hour: number]: number[] } = {}
  logs.forEach(log => {
    const hour = new Date(log.timestamp).getHours()
    if (!hourlyData[hour]) hourlyData[hour] = []
    hourlyData[hour].push(log.energy)
  })

  // Calculate averages
  const energyCurve = Object.entries(hourlyData).map(([hour, energies]) => ({
    hour: parseInt(hour),
    avgEnergy: energies.reduce((a, b) => a + b, 0) / energies.length
  }))

  energyCurve.sort((a, b) => a.hour - b.hour)

  // Find best 2-hour window
  let bestWindow = { start: 0, end: 0, avgEnergy: 0, startHour: 9, endHour: 11 }

  for (let i = 0; i < energyCurve.length - 1; i++) {
    const windowData = energyCurve.slice(i, Math.min(i + 2, energyCurve.length))
    const windowAvg = windowData.reduce((sum, h) => sum + h.avgEnergy, 0) / windowData.length

    if (windowAvg > bestWindow.avgEnergy) {
      bestWindow = {
        start: i,
        end: i + 1,
        avgEnergy: windowAvg,
        startHour: windowData[0].hour,
        endHour: windowData[windowData.length - 1].hour + 1
      }
    }
  }

  // Calculate confidence
  const overallAvg = energyCurve.reduce((sum, h) => sum + h.avgEnergy, 0) / energyCurve.length
  const confidence = Math.min(100, Math.round(((bestWindow.avgEnergy - overallAvg) / overallAvg) * 100))

  const analysis: BPTAnalysis = {
    userId: 'current',
    dataPoints: logs.length,
    peakWindow: {
      start: `${bestWindow.startHour.toString().padStart(2, '0')}:00`,
      end: `${bestWindow.endHour.toString().padStart(2, '0')}:00`,
      confidence: Math.max(0, confidence)
    },
    energyCurve,
    lastCalculated: new Date().toISOString()
  }

  await set(KEYS.BPT_ANALYSIS, analysis)
  return analysis
}

export async function isInBPTWindow(): Promise<boolean> {
  const analysis = await getBPTAnalysis()
  if (!analysis) return false

  const currentHour = new Date().getHours()
  const bptStart = parseInt(analysis.peakWindow.start.split(':')[0])
  const bptEnd = parseInt(analysis.peakWindow.end.split(':')[0])

  return currentHour >= bptStart && currentHour < bptEnd
}

// Seed function for testing - creates 21 days of fake data
export async function seedEnergyData(): Promise<void> {
  const logs: EnergyLog[] = []
  const now = new Date()

  for (let day = 21; day >= 0; day--) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)

    // Morning log (9-11am peak)
    const morningHour = 9 + Math.floor(Math.random() * 2)
    logs.push({
      id: generateUUID(),
      timestamp: new Date(date.setHours(morningHour, 0, 0, 0)).toISOString(),
      energy: 7 + Math.floor(Math.random() * 3), // 7-9
      context: 'morning',
      completedTasksInLastHour: Math.floor(Math.random() * 3)
    })

    // Midday log (lower energy)
    logs.push({
      id: generateUUID(),
      timestamp: new Date(date.setHours(14, 0, 0, 0)).toISOString(),
      energy: 4 + Math.floor(Math.random() * 3), // 4-6
      context: 'midday',
      completedTasksInLastHour: Math.floor(Math.random() * 2)
    })

    // Evening log (moderate energy)
    logs.push({
      id: generateUUID(),
      timestamp: new Date(date.setHours(19, 0, 0, 0)).toISOString(),
      energy: 5 + Math.floor(Math.random() * 3), // 5-7
      context: 'evening',
      completedTasksInLastHour: Math.floor(Math.random() * 2)
    })
  }

  await set(KEYS.ENERGY_LOGS, logs)
  await calculateBPT()
}
