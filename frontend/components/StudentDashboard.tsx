"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, AlertTriangle, ArrowRight, Download, Clock, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { db } from '@/lib/db';
import { useSyncManager } from '@/hooks/useSyncManager';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  class_level: string;
  topic: string;
  estimated_duration?: number;
  lockdown_week_reference?: number;
}

const StudentDashboard = () => {
  const router = useRouter();
  const { isOnline, isSyncing, pendingCount } = useSyncManager();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const stats = [
    { label: "Lessons Available", value: String(lessons.length || '—'), icon: BookOpen, color: "text-blue-500" },
    { label: "Downloaded", value: String(downloadedIds.size), icon: Download, color: "text-green-500" },
    { label: "Pending Sync", value: String(pendingCount), icon: AlertTriangle, color: "text-amber-500" },
  ];

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const local = await db.lessons.toArray();
        const localIds = new Set(local.map((l) => l.id));
        setDownloadedIds(localIds);

        if (navigator.onLine) {
          const res = await api.get('/lessons/');
          setLessons(res.data);
        } else {
          setLessons(
            local.map((l) => ({
              id: l.id,
              title: l.title,
              subject: l.subject,
              class_level: l.class_level || '',
              topic: l.topic || '',
              estimated_duration: l.estimated_duration,
              lockdown_week_reference: l.lockdown_week_reference,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load lessons', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, Sarah</h1>
          <p className="text-gray-500">Your learning progress is being tracked offline.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isOnline ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
          {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline Mode'}
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {isOnline ? 'All Lessons' : 'Downloaded Lessons'}
              </h2>
              {!isOnline && (
                <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-medium flex items-center gap-1">
                  <WifiOff size={11} /> Offline Mode
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
                Loading lessons...
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">
                  {isOnline ? 'No lessons available yet.' : 'No lessons downloaded. Go online to browse.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, i) => {
                  const downloaded = downloadedIds.has(lesson.id);
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/lessons/${lesson.id}`)}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                          <BookOpen className="text-primary" size={20} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 truncate">{lesson.title}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{lesson.subject}</span>
                            {lesson.class_level && <span>· {lesson.class_level}</span>}
                            {lesson.estimated_duration && (
                              <span className="flex items-center gap-1">
                                · <Clock size={10} /> {lesson.estimated_duration} min
                              </span>
                            )}
                            {lesson.lockdown_week_reference && (
                              <span className="text-amber-600 font-medium">· Catch-up</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {downloaded && (
                          <span title="Available offline">
                            <Download size={14} className="text-green-500" />
                          </span>
                        )}
                        <ArrowRight
                          size={18}
                          className="text-gray-300 group-hover:text-primary transition-colors"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Catch-up Plan */}
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> Catch-up Plan
            </h2>
            <p className="text-sm text-amber-800 mb-4">
              Priority lessons flagged by your teacher for missed school weeks.
            </p>
            <ul className="space-y-3">
              {lessons
                .filter((l) => l.lockdown_week_reference)
                .slice(0, 3)
                .map((l) => (
                  <li
                    key={l.id}
                    onClick={() => router.push(`/lessons/${l.id}`)}
                    className="flex items-start gap-2 text-sm text-amber-900 cursor-pointer hover:underline"
                  >
                    <CheckCircle className="mt-0.5 text-amber-500 flex-shrink-0" size={14} />
                    <span>{l.title} <span className="text-xs opacity-60">(Week {l.lockdown_week_reference})</span></span>
                  </li>
                ))}
              {lessons.filter((l) => l.lockdown_week_reference).length === 0 && (
                <li className="text-sm text-amber-700 opacity-70">No catch-up lessons yet.</li>
              )}
            </ul>
          </div>

          {/* Offline downloads */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Offline Downloads</h2>
            {downloadedIds.size === 0 ? (
              <p className="text-sm text-gray-400">No lessons saved offline yet. Open a lesson and click &quot;Save for Offline&quot;.</p>
            ) : (
              <div className="space-y-2">
                {lessons
                  .filter((l) => downloadedIds.has(l.id))
                  .map((l) => (
                    <div
                      key={l.id}
                      onClick={() => router.push(`/lessons/${l.id}`)}
                      className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg group cursor-pointer"
                    >
                      <span className="text-gray-600 truncate">{l.title}</span>
                      <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
