"use client";

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import api from '@/lib/axios';

export const useSyncManager = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await db.syncQueue.where('status').equals('pending').count();
    setPendingCount(count);
  }, []);

  const flushSyncQueue = useCallback(async () => {
    const items = await db.syncQueue.where('status').equals('pending').toArray();
    if (items.length === 0) return;

    setIsSyncing(true);
    for (const item of items) {
      try {
        await db.syncQueue.update(item.id!, { status: 'syncing' });

        if (item.type === 'PROGRESS_UPDATE') {
          const { lesson_id, student_id } = item.payload;
          await api.post(`/progress/complete/${lesson_id}`, null, {
            params: { student_id }
          });
        } else if (item.type === 'ASSIGNMENT_SUBMISSION') {
          await api.post('/assignments/submit', item.payload);
        }

        await db.syncQueue.delete(item.id!);
      } catch (error) {
        console.error('Sync failed for item', item.id, error);
        await db.syncQueue.update(item.id!, { status: 'failed' });
      }
    }
    setIsSyncing(false);
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flushSyncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    if (navigator.onLine) {
      flushSyncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushSyncQueue, refreshPendingCount]);

  const addToQueue = async (type: 'PROGRESS_UPDATE' | 'ASSIGNMENT_SUBMISSION', payload: any) => {
    await db.syncQueue.add({
      type,
      payload,
      timestamp: Date.now(),
      status: 'pending',
    });

    setPendingCount((c) => c + 1);

    if (navigator.onLine) {
      flushSyncQueue();
    }
  };

  return { isOnline, isSyncing, pendingCount, addToQueue };
};
