"use client";

import React, { useState } from 'react';
import { Plus, Users, Book, ClipboardList, Send, FileText } from 'lucide-react';
import NewLessonModal from './NewLessonModal';

const TeacherDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const students = [
    { name: "Sarah John", gap: "45%", risk: "high", lastActive: "2h ago" },
    { name: "Michael Abed", gap: "12%", risk: "low", lastActive: "1d ago" },
    { name: "Aisha Yusuf", gap: "28%", risk: "medium", lastActive: "5h ago" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class 10-B Overview</h1>
          <p className="text-gray-500">Manage your students and upload new learning modules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} /> New Lesson
        </button>
      </div>

      <NewLessonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          // Refresh logic would go here
          console.log("Lesson created!");
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Progress Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="text-primary" size={20} /> Student Progress Tracking
          </h2>
          <div className="space-y-4">
            {students.map((student, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{student.name}</h4>
                    <p className="text-xs text-gray-500">Last active: {student.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Gap</p>
                    <p className={`font-bold ${
                      student.risk === 'high' ? 'text-red-500' : 
                      student.risk === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>{student.gap}</p>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-primary">
                    <FileText size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Recent Uploads */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex flex-col items-center gap-2">
                <ClipboardList size={24} />
                <span className="text-xs font-bold">New Quiz</span>
              </button>
              <button className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all flex flex-col items-center gap-2">
                <Send size={24} />
                <span className="text-xs font-bold">Announce</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Recent Uploads</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
                <Book className="text-blue-500" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900 line-clamp-1">Mathematics_W3.pdf</p>
                  <p className="text-[10px] text-blue-700">Uploaded 1h ago • 2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
                <Book className="text-purple-500" size={18} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900 line-clamp-1">History_Intro.pdf</p>
                  <p className="text-[10px] text-purple-700">Uploaded 3d ago • 1.1 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
