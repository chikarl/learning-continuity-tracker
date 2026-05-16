"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { db, OfflineLesson } from '@/lib/db';
import { useSyncManager } from '@/hooks/useSyncManager';
import {
  BookOpen, Download, CheckCircle, ArrowLeft, Clock, FileText,
  Wifi, WifiOff, StickyNote, HelpCircle, PlayCircle, Loader2,
  AlertTriangle, RefreshCw, BookMarked, Timer,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tab = 'content' | 'notes' | 'quiz';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  topic: string;
  class_level: string;
  description: string;
  content_type: string;
  content_url?: string;
  estimated_duration?: number;
  lockdown_week_reference?: number;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-white rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ ease: 'easeOut', duration: 0.4 }}
    />
  </div>
);

const TabButton = ({
  label, icon: Icon, active, onClick,
}: { label: string; icon: React.ElementType; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
      active
        ? 'bg-primary text-white shadow-lg shadow-primary/25'
        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

const ContentViewer = ({ lesson }: { lesson: Lesson | OfflineLesson }) => {
  const content = 'description' in lesson ? lesson.description : lesson.content;
  const contentType = lesson.content_type?.toLowerCase();

  if (contentType === 'pdf' && 'content_url' in lesson && lesson.content_url) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-100 text-sm text-gray-500">
          <FileText size={14} className="text-primary" />
          <span>PDF Document</span>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${lesson.content_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-primary font-medium hover:underline"
          >
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${lesson.content_url}`}
          className="w-full h-[600px]"
          title="Lesson PDF"
        />
      </div>
    );
  }

  if (contentType === 'video' && 'content_url' in lesson && lesson.content_url) {
    return (
      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-black">
        <video controls className="w-full max-h-[480px]" src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/${lesson.content_url}`}>
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Text / default
  return (
    <div className="prose prose-blue max-w-none">
      {content.split('\n').map((para, i) =>
        para.trim() ? (
          <p key={i} className="text-gray-700 leading-relaxed mb-4">
            {para}
          </p>
        ) : <br key={i} />
      )}
    </div>
  );
};

const NotesTab = ({ lessonId }: { lessonId: number }) => {
  const storageKey = `lesson_notes_${lessonId}`;
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(localStorage.getItem(storageKey) || '');
  }, [storageKey]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    localStorage.setItem(storageKey, e.target.value);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        📝 Notes are saved locally and available offline.
      </p>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Write your notes here..."
        className="w-full h-72 p-5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      <p className="text-xs text-right text-gray-400">{notes.length} characters · Auto-saved</p>
    </div>
  );
};

const QuizTab = ({ lessonId }: { lessonId: number }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
      <HelpCircle size={32} className="text-primary" />
    </div>
    <h3 className="text-lg font-bold text-gray-800">Quiz Coming Soon</h3>
    <p className="text-sm text-gray-500 max-w-xs">
      Practice questions for this lesson will appear here once your teacher assigns them.
    </p>
  </div>
);

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
const LessonDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { isOnline, isSyncing, pendingCount, addToQueue } = useSyncManager();

  const [lesson, setLesson] = useState<Lesson | OfflineLesson | null>(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reading timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Scroll progress tracking
  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const scrolled = el.scrollTop;
    const total = el.scrollHeight - el.clientHeight;
    const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
    setScrollProgress(pct);
  }, []);

  // Save scroll progress to IndexedDB when user is offline or leaving
  useEffect(() => {
    if (!lesson || !isDownloaded) return;
    const saveProgress = () => {
      db.lessons.update(Number(id), {
        readingProgress: scrollProgress,
        lastReadAt: Date.now(),
      });
    };
    const debounce = setTimeout(saveProgress, 800);
    return () => clearTimeout(debounce);
  }, [scrollProgress, isDownloaded, id, lesson]);

  // Fetch lesson — offline-first
  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Check IndexedDB first
        const localLesson = await db.lessons.get(Number(id));
        if (localLesson) {
          setLesson(localLesson);
          setIsDownloaded(true);
          if (localLesson.readingProgress) {
            setScrollProgress(localLesson.readingProgress);
          }
          setIsLoading(false);
          return;
        }

        // 2. Fall back to API
        if (!navigator.onLine) {
          setError('You are offline and this lesson has not been downloaded yet.');
          setIsLoading(false);
          return;
        }

        const response = await api.get(`/lessons/${id}`);
        setLesson(response.data);
      } catch (err) {
        setError('Failed to load lesson. Please check your connection and try again.');
        console.error('Failed to fetch lesson', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const handleDownload = async () => {
    if (!lesson) return;
    const l = lesson as Lesson;
    try {
      await db.lessons.put({
        id: l.id,
        title: l.title,
        content: l.description,
        subject: l.subject,
        topic: l.topic ?? '',
        class_level: l.class_level ?? '',
        content_type: l.content_type ?? 'text',
        content_url: l.content_url,
        estimated_duration: l.estimated_duration,
        lockdown_week_reference: l.lockdown_week_reference,
        downloadedAt: Date.now(),
        readingProgress: 0,
      });
      setIsDownloaded(true);
    } catch (err) {
      console.error('Failed to save lesson offline', err);
    }
  };

  const handleMarkComplete = async () => {
    if (!lesson) return;
    // Get student_id from token (demo: hardcoded as 1)
    const student_id = 1;
    await addToQueue('PROGRESS_UPDATE', { lesson_id: Number(id), student_id });
    setIsCompleted(true);
  };

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-primary mx-auto" />
          <p className="text-gray-500 font-medium">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Lesson Unavailable</h2>
          <p className="text-gray-500 text-sm">{error || 'Lesson not found.'}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = lesson.title;
  const subject = lesson.subject;
  const duration = lesson.estimated_duration;
  const contentType = lesson.content_type;
  const topic = 'topic' in lesson ? lesson.topic : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm font-medium"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{subject} · {topic}</p>
            <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
          </div>

          {/* Reading progress pill */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <Timer size={13} className="text-primary" />
            {formatTime(elapsedSeconds)}
          </div>

          {/* Online / offline badge */}
          <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
            isOnline ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isSyncing ? 'Syncing...' : isOnline ? 'Online' : `Offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`}
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="h-0.5 bg-gray-100">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />
        </div>
      </div>

      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="max-w-5xl mx-auto px-4 pt-8 pb-24 overflow-y-auto"
      >
        {/* Hero Header */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-primary rounded-3xl overflow-hidden shadow-xl shadow-primary/20 mb-8"
        >
          <div className="relative p-8 md:p-12">
            {/* Background icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.08]">
              <BookOpen size={160} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest">
                  {subject}
                </span>
                {lesson.lockdown_week_reference && (
                  <span className="px-3 py-1 bg-amber-400/30 text-white rounded-full text-xs font-bold">
                    Catch-up · Week {lesson.lockdown_week_reference}
                  </span>
                )}
                {isDownloaded && (
                  <span className="px-3 py-1 bg-green-400/30 text-white rounded-full text-xs font-bold flex items-center gap-1">
                    <Download size={11} /> Saved Offline
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h1>

              {topic && (
                <p className="text-white/70 text-sm">{topic}</p>
              )}

              <div className="flex flex-wrap gap-6 text-white/80 text-sm pt-2">
                {duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    {duration} min read
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  {contentType || 'Text'}
                </div>
                <div className="flex items-center gap-2">
                  <BookMarked size={16} />
                  {lesson.class_level}
                </div>
              </div>

              {/* Hero progress bar */}
              <div className="pt-2">
                <ProgressBar value={scrollProgress} />
                <p className="text-white/60 text-xs mt-1">{scrollProgress}% read</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          {!isDownloaded ? (
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-primary/30 transition-all shadow-sm"
            >
              <Download size={18} className="text-primary" />
              Save for Offline
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-100 rounded-xl text-sm font-semibold text-green-700">
              <CheckCircle size={18} />
              Saved Offline
            </div>
          )}

          {!isCompleted ? (
            <button
              onClick={handleMarkComplete}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              <CheckCircle size={18} />
              Mark as Complete
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold">
              <CheckCircle size={18} />
              Completed!
              {!isOnline && <span className="text-xs opacity-80 ml-1">(Will sync when online)</span>}
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl w-fit"
        >
          <TabButton label="Content" icon={BookOpen} active={activeTab === 'content'} onClick={() => setActiveTab('content')} />
          <TabButton label="My Notes" icon={StickyNote} active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
          <TabButton label="Quiz" icon={HelpCircle} active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-10"
          >
            {activeTab === 'content' && <ContentViewer lesson={lesson} />}
            {activeTab === 'notes' && <NotesTab lessonId={Number(id)} />}
            {activeTab === 'quiz' && <QuizTab lessonId={Number(id)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LessonDetailPage;
