import { openDB, IDBPDatabase } from 'idb'
import type { ReportData } from '../types'

const DB_NAME = 'resq-ai-outbox'
const STORE_NAME = 'reports'

export interface OfflineReport {
  id?: number
  data: ReportData
  timestamp: string
  synced: boolean
}

let dbPromise: Promise<IDBPDatabase>

if (typeof window !== 'undefined') {
  dbPromise = openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    },
  })
}

export const outbox = {
  async saveReport(reportData: ReportData) {
    const db = await dbPromise
    return db.add(STORE_NAME, {
      data: reportData,
      timestamp: new Date().toISOString(),
      synced: false,
    })
  },

  async getUnsyncedReports(): Promise<OfflineReport[]> {
    const db = await dbPromise
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const reports = await store.getAll()
    return reports.filter(r => !r.synced)
  },

  async markAsSynced(id: number) {
    const db = await dbPromise
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const report = await store.get(id)
    if (report) {
      report.synced = true
      await store.put(report)
    }
    await tx.done
  },

  async removeSynced() {
    const db = await dbPromise
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const reports = await store.getAll()
    for (const report of reports) {
      if (report.synced) {
        await store.delete(report.id)
      }
    }
  }
}
