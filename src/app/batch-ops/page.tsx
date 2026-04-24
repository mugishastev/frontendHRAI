'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetBatchStatusQuery, useRunScreeningMutation } from '@/store/api';
import { useState } from 'react';
import { BrainCircuit, CheckCircle, Clock, AlertTriangle, Loader2, Play, RefreshCw } from 'lucide-react';

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  COMPLETED: { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle className="w-4 h-4" />, label: 'Completed' },
  PENDING:   { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Loader2 className="w-4 h-4 animate-spin" />, label: 'Running' },
  FAILED:    { color: 'text-red-600 bg-red-50 border-red-200', icon: <AlertTriangle className="w-4 h-4" />, label: 'Failed' },
  NOT_RUN:   { color: 'text-gray-500 bg-gray-100 border-gray-200', icon: <Clock className="w-4 h-4" />, label: 'Not Run' },
};

export default function BatchOperationsPage() {
  const { data: jobs, isLoading, refetch } = useGetBatchStatusQuery();
  const [runScreening, { isLoading: isRunning }] = useRunScreeningMutation();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const handleRun = async (jobId: string, title: string) => {
    if (!confirm(`Run AI Screening for "${title}"?`)) return;
    try {
      setActiveJobId(jobId);
      await runScreening(jobId).unwrap();
      refetch();
    } catch (e: any) {
      alert(e?.data?.error || 'Screening failed. Ensure this job has applicants.');
    } finally {
      setActiveJobId(null);
    }
  };

  const totalCandidates = jobs?.reduce((s, j) => s + j.applicantCount, 0) ?? 0;
  const completed = jobs?.filter(j => j.screeningStatus === 'COMPLETED').length ?? 0;
  const pending  = jobs?.filter(j => j.screeningStatus === 'NOT_RUN').length ?? 0;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600"><BrainCircuit className="w-5 h-5" /></div>
              <h1 className="text-3xl font-bold">AI Screening</h1>
            </div>
            <p className="text-gray-500">Trigger or re-run AI screening across all active job roles.</p>
          </div>
          <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Roles', value: jobs?.length ?? 0, color: 'bg-blue-500' },
            { label: 'Screenings Completed', value: completed, color: 'bg-green-500' },
            { label: 'Awaiting Screening', value: pending, color: 'bg-orange-500' },
          ].map(card => (
            <div key={card.label} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-3 h-10 rounded-full ${card.color}`} />
              <div>
                <div className="text-2xl font-black">{card.value}</div>
                <div className="text-xs text-gray-500 font-semibold">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/30">
            <h2 className="font-bold text-lg">Jobs Screening Status</h2>
            <p className="text-sm text-gray-500">{totalCandidates} total candidates across all roles</p>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-gray-400 animate-pulse">Loading batch status...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">
                    <th className="px-6 py-3 font-bold">Role</th>
                    <th className="px-6 py-3 font-bold">Department</th>
                    <th className="px-6 py-3 font-bold">Candidates</th>
                    <th className="px-6 py-3 font-bold">AI Results</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Last Run</th>
                    <th className="px-6 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {jobs?.map((job) => {
                    const s = statusConfig[job.screeningStatus] ?? statusConfig.NOT_RUN;
                    return (
                      <tr key={job.jobId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{job.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{job.department}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{job.applicantCount}</span>
                          <span className="text-gray-400 text-xs ml-1">applicants</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">{job.resultCount > 0 ? `${job.resultCount} ranked` : '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.color}`}>
                            {s.icon} {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {job.lastRun ? new Date(job.lastRun).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            disabled={job.applicantCount === 0 || (isRunning && activeJobId === job.jobId)}
                            onClick={() => handleRun(job.jobId, job.title)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow active:scale-95 min-w-[100px] justify-center"
                          >
                            {isRunning && activeJobId === job.jobId ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Screening...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                {job.screeningStatus === 'COMPLETED' ? 'Re-run' : 'Run AI'}
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
