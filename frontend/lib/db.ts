import Dexie, { Table } from 'dexie';

export interface OfflineLesson {
  id: number;
  title: string;
  content: string;          // maps to description
  subject: string;
  topic: string;
  class_level: string;
  content_type: string;     // pdf | text | audio | video
  content_url?: string;
  estimated_duration?: number;
  lockdown_week_reference?: number;
  downloadedAt: number;
  readingProgress?: number; // 0–100 scroll percentage
  lastReadAt?: number;
}

export interface SyncQueueItem {
  id?: number;
  type: 'PROGRESS_UPDATE' | 'ASSIGNMENT_SUBMISSION';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
}

export class ContinuityDB extends Dexie {
  lessons!: Table<OfflineLesson>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('ContinuityDB');
    this.version(1).stores({
      lessons: 'id, subject',
      syncQueue: '++id, type, status, timestamp'
    });
  }
}

export const db = new ContinuityDB();
