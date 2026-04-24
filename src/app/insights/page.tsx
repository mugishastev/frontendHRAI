'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetStatsQuery } from '@/store/api';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Briefcase, BrainCircuit, AlertCircle } from 'lucide-react';

export default function InsightsPage() {
  const { data: stats, isLoading } = useGetStatsQuery();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('umurava_role'));
  }, []);

  const isAdmin = role === 'admin';

  const maxApplicants = Math.max(...(stats?.jobBreakdown?.map((j: any) => j.applicants) ?? [1]), 1);
  const maxDaily = Math.max(...(stats?.applicationsOverTime?.map((d: any) => d.count) ?? [1]), 1);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">

        <header>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600"><BarChart3 className="w-5 h-5" /></div>
            <h1 className="text-3xl font-bold">{isAdmin ? 'Global Insights Matrix' : 'Recruitment Performance'}</h1>
          </div>
          <p className="text-gray-500">
            {isAdmin ? 'Platform-wide analytics across all recruiters and jobs.' : 'Performance metrics for your managed hiring cycles.'}
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Jobs', value: stats?.totalJobs ?? '—', icon: <Briefcase className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Total Candidates', value: stats?.totalCandidates ?? '—', icon: <Users className="w-5 h-5" />, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
            { label: 'AI Screenings', value: stats?.completedScreenings ?? '—', icon: <BrainCircuit className="w-5 h-5" />, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            { label: 'Failed Screenings', value: stats?.failedScreenings ?? '—', icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
              <div className={`inline-flex p-2.5 rounded-xl mb-3 ${kpi.color}`}>{kpi.icon}</div>
              <div className="text-3xl font-black">{isLoading ? '...' : kpi.value}</div>
              <div className="text-xs text-gray-500 font-semibold mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Applications Chart */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h2 className="font-bold text-lg">Applications This Week</h2>
            </div>
            {isLoading ? (
              <div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ) : (
              <div className="flex items-end gap-2 h-40">
                {stats?.applicationsOverTime?.map((day: any) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md transition-all hover:opacity-80"
                      style={{ height: `${Math.max((day.count / maxDaily) * 100, day.count > 0 ? 8 : 2)}%` }}
                      title={`${day.count} applications`}
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screening Status Pie */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
              <h2 className="font-bold text-lg">Screening Overview</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Completed', value: stats?.completedScreenings ?? 0, color: 'bg-green-500', textColor: 'text-green-600' },
                { label: 'Pending / Running', value: stats?.pendingScreenings ?? 0, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
                { label: 'Failed', value: stats?.failedScreenings ?? 0, color: 'bg-red-500', textColor: 'text-red-600' },
              ].map(item => {
                const total = (stats?.completedScreenings ?? 0) + (stats?.pendingScreenings ?? 0) + (stats?.failedScreenings ?? 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{item.label}</span>
                      <span className={`font-bold ${item.textColor}`}>{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Per-Job Breakdown */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/30">
            <h2 className="font-bold text-lg">Applicants Per Role</h2>
            <p className="text-sm text-gray-500">Ranked by total applicant volume</p>
          </div>
          {isLoading ? (
            <div className="p-8 animate-pulse text-gray-400 text-center">Loading breakdown...</div>
          ) : stats?.jobBreakdown?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No job data available yet.</div>
          ) : (
            <div className="p-6 space-y-4">
              {stats?.jobBreakdown?.map((job: any) => (
                <div key={job.jobId} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{job.title}</span>
                    <span className="text-gray-500 font-medium">{job.applicants} applicants</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max((job.applicants / maxApplicants) * 100, job.applicants > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
