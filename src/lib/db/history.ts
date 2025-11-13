import { get, set } from 'idb-keyval'
import { KEYS } from './keys'
import type { HistoryRecord } from '../types'

export async function getHistory(): Promise<HistoryRecord[]> {
  return (await get(KEYS.HISTORY)) || []
}

export async function addHistoryRecord(record: Omit<HistoryRecord, 'id'>): Promise<void> {
  const history = await getHistory()
  const newRecord: HistoryRecord = {
    ...record,
    id: crypto.randomUUID()
  }
  history.push(newRecord)
  await set(KEYS.HISTORY, history)
}
