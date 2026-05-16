"use client";

import React from 'react';
import { Users, School, Map, Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const stats = [
    { label: "Total Schools", value: "124", icon: School, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Students", value: "12,402", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Regional Gap Avg", value: "32%", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Affected Areas", value: "8", icon: Map, color: "text-red-500", bg: "bg-red-50" },
  ];

  const regionalData = [
    { region: "North Zone", schools: 45, gap: "42%", status: "high-risk" },
    { region: "West Valley", schools: 32, gap: "18%", status: "medium-risk" },
    { region: "Central City", schools: 28, gap: "12%", status: "low-risk" },
    { region: "East Coast", schools: 19, gap: "55%", status: "critical" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Regional Overview</h1>
        <p className="text-gray-500">Monitoring educational continuity across all districts.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Regional Risk Analysis */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-primary" size={20} /> Regional Risk Analysis
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                  <th className="pb-4 font-medium">Region</th>
                  <th className="pb-4 font-medium">Schools</th>
                  <th className="pb-4 font-medium">Avg Gap</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {regionalData.map((data, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 font-medium">{data.region}</td>
                    <td className="py-4 text-gray-600">{data.schools}</td>
                    <td className="py-4 text-gray-600 font-semibold">{data.gap}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        data.status === 'low-risk' ? 'bg-green-100 text-green-700' :
                        data.status === 'medium-risk' ? 'bg-amber-100 text-amber-700' :
                        data.status === 'high-risk' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.status.replace('-', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Urgent Alerts</h2>
            <div className="space-y-4">
              <div className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-red-900 text-sm">School Closure Alert</h4>
                  <p className="text-xs text-red-800">12 schools in East Coast district reported closures today.</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Learning Gap Spike</h4>
                  <p className="text-xs text-amber-800">Avg gap in North Zone increased by 15% this week.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
