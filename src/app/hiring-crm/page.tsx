'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetCRMApplicantsQuery, useRunScreeningMutation, useUpdateApplicantStatusMutation, useSendMessageMutation } from '@/store/api';
import { Users, Search, Filter, Mail, ExternalLink, BrainCircuit, CheckCircle2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HiringCRMPage() {
  const router = useRouter();
  const { data: applicants, isLoading, refetch } = useGetCRMApplicantsQuery();
  const [runScreening, { isLoading: isRunning }] = useRunScreeningMutation();
  const [updateStatus] = useUpdateApplicantStatusMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [messageModal, setMessageModal] = useState({ open: false, email: '', name: '' });
  const [messageContent, setMessageContent] = useState('');
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setStatusLoading(id);
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      refetch();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleRunAI = async (jobId: string, candidateName: string) => {
    if (!confirm(`Trigger AI Evaluation for the "${candidateName}" role? Rankings updated via Gemini context.`)) return;
    try {
      await runScreening(jobId).unwrap();
      refetch();
    } catch (e: any) {
      alert(e?.data?.error || 'AI Failed.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;
    try {
      await sendMessage({
        email: messageModal.email,
        name: messageModal.name,
        message: messageContent
      }).unwrap();
      alert(`Message successfully sent to ${messageModal.name}!`);
      setMessageContent('');
      setMessageModal({ ...messageModal, open: false });
    } catch (err) {
      alert('Failed to send message. Please check SMTP configuration.');
    }
  };

  const filtered = applicants?.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              Manage Applicants
            </h1>
            <p className="text-gray-500 mt-1">Centralized candidate tracking and AI evaluation history.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 w-64 transition-all"
                />
             </div>
             <button onClick={() => refetch()} className="p-2 border border-[var(--border)] rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Filter className="w-5 h-5 text-gray-400" />
             </button>
          </div>
        </header>

        <div className="bg-white dark:bg-[#1e293b] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Applied Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status / AI Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-12 bg-gray-50/10" />
                    </tr>
                  ))
                ) : filtered?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered?.map((app: any) => (
                    <tr key={app._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-50 flex items-center justify-center text-primary-700 font-bold text-sm">
                            {app.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">{app.name}</div>
                            <div className="text-xs text-gray-500">{app.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold">{app.jobId?.title || 'Unknown Job'}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-medium">{app.jobId?.department || 'General'}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex flex-col gap-1.5">
                            <select 
                               value={app.status || 'applied'} 
                               onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                               className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:ring-2 transition-all w-fit cursor-pointer ${
                                 app.status === 'shortlisted' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500/20' :
                                 app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500/20' :
                                 app.status === 'hired' ? 'bg-primary-50 text-primary-700 border-primary-200 focus:ring-primary-500/20' :
                                 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500/20'
                               }`}
                            >
                               <option value="applied">Applied</option>
                               <option value="shortlisted">Shortlisted</option>
                               <option value="interviewing">Interviewing</option>
                               <option value="hired">Hired</option>
                               <option value="rejected">Rejected</option>
                            </select>
                            
                            {app.aiScore ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full rounded-full ${app.aiScore > 75 ? 'bg-green-500' : app.aiScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                          style={{ width: `${app.aiScore}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-700">{app.aiScore}%</span>
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold text-gray-400 uppercase italic">Pending AI</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right space-x-2">
                        <button 
                          onClick={() => handleRunAI(app.jobId?._id, app.name)}
                          disabled={isRunning}
                          className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-purple-600 border border-transparent hover:border-[var(--border)] transition-all shadow-sm hover:shadow-md"
                          title="Trigger AI Evaluation"
                        >
                          <BrainCircuit className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
                        </button>
                        <button 
                          onClick={() => setMessageModal({ open: true, email: app.email, name: app.name })}
                          className="p-2.5 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-500 hover:text-blue-600 border border-transparent hover:border-[var(--border)] transition-all shadow-sm hover:shadow-md"
                          title="Message Candidate"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <a 
                          href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `https://${app.resumeUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`p-2.5 inline-block rounded-xl border border-transparent transition-all shadow-sm hover:shadow-md ${
                            app.resumeUrl 
                            ? 'text-gray-500 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-700 hover:border-[var(--border)]' 
                            : 'text-gray-200 cursor-not-allowed pointer-events-none'
                          }`}
                          title={app.resumeUrl ? "View Resume" : "No Resume Provided"}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* 📧 Simple Messenger Modal */}
      {messageModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
           <div className="bg-white dark:bg-[#1e293b] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-[var(--border)]">
              <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center text-primary-600">
                       <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-gray-100">Message {messageModal.name}</h3>
                      <p className="text-xs text-gray-500">{messageModal.email}</p>
                    </div>
                 </div>
                 <button onClick={() => setMessageModal({ ...messageModal, open: false })} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message Content</label>
                    <textarea 
                      rows={6} 
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-[var(--border)] rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                      placeholder="Type your message to the candidate..."
                    ></textarea>
                 </div>
                 
                 <div className="flex gap-3">
                    <button 
                      onClick={handleSendMessage}
                      disabled={isSending || !messageContent.trim()}
                      className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSending ? 'Sending...' : 'Send Message'}
                    </button>
                    <button 
                      onClick={() => setMessageModal({ ...messageModal, open: false })}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </DashboardLayout>
  );
}

