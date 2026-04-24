'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetAuditLogsQuery } from '@/store/api';
import { Save, Shield, Database, ScrollText, Cpu, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
   const [activeTab, setActiveTab] = useState<'config' | 'permissions' | 'logs'>('config');
   const [saved, setSaved] = useState(false);
   const { data: logs, isLoading: logsLoading } = useGetAuditLogsQuery();

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
   };

   return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        <header>
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600"><Database className="w-5 h-5" /></div>
             <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
          </div>
          <p className="text-gray-500">Govern environment variables, security protocols, and system logs.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
           
           {/* Sidebar Tabs */}
           <div className="lg:w-64 flex flex-col space-y-2">
              {[
                { id: 'config', label: 'System Config', icon: <Cpu className="w-4 h-4" /> },
                { id: 'permissions', label: 'Recruiter Permissions', icon: <Shield className="w-4 h-4" /> },
                { id: 'logs', label: 'API Usage Logs', icon: <Activity className="w-4 h-4" /> },
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-white dark:bg-gray-800 border border-[var(--border)] text-gray-500 hover:border-primary-500'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
           </div>

           {/* Main Content Area */}
           <div className="flex-1 min-w-0">
              
              {/* TAB 1: System Config */}
              {activeTab === 'config' && (
                <form onSubmit={handleSave} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-sm space-y-8 animate-in fade-in duration-300">
                   <div className="flex justify-between items-center border-b border-[var(--border)] pb-6">
                      <div>
                        <h2 className="text-xl font-bold">AI & Database Configuration</h2>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">Requires Node Restart</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Gemini Model Tier</label>
                         <select className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-transparent font-bold">
                            <option>Gemini 1.5 Flash (Standard)</option>
                            <option>Gemini 1.5 Pro (Advanced Logic)</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Screening Temperature</label>
                         <input type="range" className="w-full" min="0" max="1" step="0.1" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Master Gemini API Key</label>
                      <input type="password" value="****************************************" disabled className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-gray-50/50 dark:bg-gray-900/30 opacity-60" />
                      <p className="text-[10px] text-gray-400 italic">Managed via environment variables (.env.local)</p>
                   </div>

                   <div className="pt-6 border-t border-[var(--border)] flex justify-end">
                      <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary-500/20">
                         {saved ? 'Settings Updated!' : 'Update Environment Config'}
                      </button>
                   </div>
                </form>
              )}

              {/* TAB 2: Recruiter Permissions */}
              {activeTab === 'permissions' && (
                <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300">
                   <div>
                      <h2 className="text-xl font-bold">Recruiter Permissions Matrix</h2>
                      <p className="text-sm text-gray-500">Define the global security boundaries for standard recruiter accounts.</p>
                   </div>
                   
                   <div className="space-y-3">
                      {[
                        { title: 'Job Lifecycle Management', desc: 'Allow recruiters to create, edit and delete their own job postings.', default: true },
                        { title: 'AI Screening Execution', desc: 'Allow recruiters to trigger Gemini AI evaluation on applicants.', default: true },
                        { title: 'Candidate Communication', desc: 'Send automated emails via SMTP integration.', default: true },
                        { title: 'Bulk Data Export', desc: 'Export applicant CSVs and reports.', default: false },
                      ].map(p => (
                        <div key={p.title} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                           <div className="max-w-[80%]">
                              <h3 className="font-bold text-sm">{p.title}</h3>
                              <p className="text-xs text-gray-500">{p.desc}</p>
                           </div>
                           <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${p.default ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${p.default ? 'right-1' : 'left-1'}`} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* TAB 3: API Usage Logs */}
              {activeTab === 'logs' && (
                 <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-300">
                    <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                       <h2 className="text-xl font-bold">API Usage Logs Tracker</h2>
                       <button className="text-xs font-bold text-primary-600 hover:underline">View Full Audit History</button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs">
                          <thead>
                             <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-[var(--border)]">
                                <th className="px-6 py-4 font-black uppercase text-gray-400">Activity</th>
                                <th className="px-6 py-4 font-black uppercase text-gray-400">Entity</th>
                                <th className="px-6 py-4 font-black uppercase text-gray-400">Timestamp</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                             {logsLoading ? (
                               <tr><td colSpan={3} className="p-10 text-center animate-pulse">Synchronizing Logs...</td></tr>
                             ) : logs?.slice(0, 10).map((log: any) => (
                               <tr key={log._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${log.status >= 400 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                           <Activity className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-bold">{log.action}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-gray-500 font-medium">{log.userEmail}</td>
                                  <td className="px-6 py-4 text-gray-400 italic">{new Date(log.createdAt).toLocaleString()}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              )}

           </div>

        </div>

      </div>
    </DashboardLayout>
   )
}
