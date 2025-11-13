import { get, keys } from 'idb-keyval'
import { set } from 'idb-keyval'
import { KEYS } from './keys'

export async function exportAllData(): Promise<string> {
  const allKeys = await keys()
  const data: Record<string, any> = {}

  for (const key of allKeys) {
    data[key as string] = await get(key)
  }

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data
  }

  return JSON.stringify(exportData, null, 2)
}

export async function importAllData(jsonString: string): Promise<boolean> {
  try {
    const imported = JSON.parse(jsonString)

    if (!imported.version || !imported.data) {
      throw new Error('Invalid backup file format')
    }

    // Import all data
    for (const [key, value] of Object.entries(imported.data)) {
      await set(key, value)
    }

    return true
  } catch (error) {
    console.error('Import failed:', error)
    return false
  }
}

export function downloadBackup(data: string, filename: string = 'lifer-backup.json') {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function readBackupFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
