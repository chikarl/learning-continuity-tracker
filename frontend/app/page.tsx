"use client";

import React, { useState } from 'react';
import StudentDashboard from '@/components/StudentDashboard';
import TeacherDashboard from '@/components/TeacherDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { LayoutDashboard, GraduationCap, Users, Shield, LogOut, Menu, X } from 'lucide-react';

type Role = 'student' | 'teacher' | 'admin';

export default function Home() {
  const [role, setRole] = useState<Role>('student');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Lessons', icon: GraduationCap },
    { name: 'My Classes', icon: Users },
    { name: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">
              G
            </div>
            <span className="font-bold text-xl tracking-tight">GDG Continuity</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-gray-600 font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <item.icon size={20} />
                {item.name}
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100">
            <div className="p-4 bg-gray-50 rounded-2xl mb-4">
              <p className="text-xs text-gray-500 font-bold mb-2 uppercase tracking-widest">Switch View (Demo)</p>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setRole('student')}
                  className={`text-sm px-3 py-2 rounded-lg text-left font-medium ${role === 'student' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-white'}`}
                >
                  Student
                </button>
                <button 
                  onClick={() => setRole('teacher')}
                  className={`text-sm px-3 py-2 rounded-lg text-left font-medium ${role === 'teacher' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-white'}`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => setRole('admin')}
                  className={`text-sm px-3 py-2 rounded-lg text-left font-medium ${role === 'admin' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-white'}`}
                >
                  Admin
                </button>
              </div>
            </div>
            <button className="flex items-center gap-3 px-4 py-3 text-red-600 font-medium rounded-xl hover:bg-red-50 w-full transition-colors">
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="lg:hidden p-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">G</div>
            <span className="font-bold">GDG</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <div className="animate-in fade-in duration-500">
          {role === 'student' && <StudentDashboard />}
          {role === 'teacher' && <TeacherDashboard />}
          {role === 'admin' && <AdminDashboard />}
        </div>
      </main>
    </div>
  );
}
