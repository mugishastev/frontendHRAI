'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetAuditLogsQuery } from '@/store/api';
import { ScrollText, Activity, ShieldAlert, Cpu, User, Database } from 'lucide-react';

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useGetAuditLogsQuery();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600"><ScrollText className="w-5 h-5" /></div>
              <h1 className="text-3xl font-bold">System Admin Portal</h1>
            </div>
            <p className="text-gray-500">Governance tracking, health monitoring, and data backups.</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-xl text-xs font-bold hover:border-primary-500 transition-all flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-green-500" /> System Health: 99.9%
             </button>
             <button className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-500 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20">
                <ShieldAlert className="w-3.5 h-3.5" /> Trigger Backup
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'API Latency', value: '24ms', status: 'Optimal', icon: <Activity className="w-4 h-4" /> },
             { label: 'DB Connections', value: '12 Active', status: 'Healthy', icon: <Database className="w-4 h-4" /> },
             { label: 'AI Queue', value: '0 Tasks', status: 'Idle', icon: <Cpu className="w-4 h-4" /> },
             { label: 'Security Logs', value: 'Locked', status: 'Encrypted', icon: <ShieldAlert className="w-4 h-4" /> },
           ].map(stat => (
             <div key={stat.label} className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-primary-500">{stat.icon}</div>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase">{stat.label}</div>
                  <div className="text-sm font-black">{stat.value} — <span className="text-green-500">{stat.status}</span></div>
                </div>
             </div>
           ))}
        </div>

        <div className="bg-white dark:bg-[#1e293b] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Endpoint</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Log Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-5 h-12 bg-gray-50/10" />
                    </tr>
                  ))
                ) : logs?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                      No system activity logs found.
                    </td>
                  </tr>
                ) : (
                  logs?.map((log: any) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${log.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                             {log.userEmail[0].toUpperCase()}
                           </div>
                           <div className="text-sm font-semibold truncate max-w-[150px]">{log.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            {log.action.includes('AI') ? <Cpu className="w-3.5 h-3.5 text-purple-500" /> : <Activity className="w-3.5 h-3.5 text-gray-400" />}
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{log.action}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-gray-500">
                          {log.method} {log.endpoint}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status >= 400 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {log.status} {log.status >= 400 ? 'FAILED' : 'OK'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
