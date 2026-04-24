'use client'

import PublicLayout from '@/components/PublicLayout';
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from '@/store/api';
import { Briefcase, Clock, CheckCircle, XCircle, ChevronRight, LayoutDashboard, User, BrainCircuit, Trash2, ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ApplicationTimeline from '@/components/ApplicationTimeline';
import Link from 'next/link';

export default function ApplicantDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const { data: applications, isLoading, refetch } = useGetMyApplicationsQuery();
  const [withdraw] = useWithdrawApplicationMutation();

  useEffect(() => {
    const token = localStorage.getItem('umurava_token');
    const role = localStorage.getItem('umurava_role');
    const storedEmail = localStorage.getItem('umurava_email');
    
    if (!token || role !== 'applicant') {
      router.push('/login');
    }
    if (storedEmail) setEmail(storedEmail);
  }, [router]);

  const handleWithdraw = async (id: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to withdraw your application for "${jobTitle}"? This action cannot be undone.`)) return;
    try {
        await withdraw(id).unwrap();
        refetch();
        setSelectedAppId(null);
    } catch (err) {
        alert('Failed to withdraw application.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired': return 'bg-green-100 text-green-700 border-green-200';
      case 'shortlisted': return 'bg-purple-600 text-white border-purple-700 shadow-md shadow-purple-500/20';
      case 'interviewing': return 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-primary-50 text-primary-600 border-primary-200';
    }
  };

  const selectedApp = applications?.find((a: any) => a._id === selectedAppId);

  return (
    <PublicLayout>
      <div className="max-w-6xl mx-auto px-8 py-16">
        
        {/* Header / Profile Card */}
        <div className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[40px] p-10 mb-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary-500/5">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="space-y-1">
                 <h1 className="text-3xl font-black tracking-tight">Applicant Dashboard</h1>
                 <div className="flex items-center gap-2 text-gray-500 font-medium italic">
                    <User className="w-4 h-4 text-primary-500" /> {email}
                 </div>
              </div>
           </div>
           
           {!selectedApp && (
               <div className="flex gap-4">
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border)] text-center">
                     <div className="text-2xl font-black text-primary-600">{applications?.length || 0}</div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Applications</div>
                  </div>
                  <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border)] text-center">
                     <div className="text-2xl font-black text-green-600">
                        {applications?.filter((a: any) => a.status === 'shortlisted' || a.status === 'hired').length || 0}
                     </div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shortlisted</div>
                  </div>
               </div>
           )}
           {selectedApp && (
               <button onClick={() => setSelectedAppId(null)} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 rounded-2xl font-black text-sm transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
               </button>
           )}
        </div>

        {selectedApp ? (
            /* Detailed Application View */
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[40px] overflow-hidden">
                    <div className="p-10 border-b border-[var(--border)] space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="space-y-1">
                                <Link href={`/careers/${selectedApp.jobId?._id}`} className="text-3xl font-black hover:text-primary-600 transition-colors inline-block">
                                    {selectedApp.jobId?.title}
                                </Link>
                                <p className="text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> UMURAVA AI &bull; {selectedApp.jobId?.department || 'GENERAL'}
                                </p>
                            </div>
                            <div className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] border shadow-md ${getStatusColor(selectedApp.status)}`}>
                                {selectedApp.status || 'applied'}
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-gray-50/50 dark:bg-gray-900/50">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Application Progress</h3>
                        <ApplicationTimeline currentStatus={selectedApp.status} />
                    </div>

                    <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h4 className="font-black text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                Review Documents
                            </h4>
                            <div className="space-y-3">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border)] flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center border border-[var(--border)]">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">Official Resume</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">PDF DOCUMENT</p>
                                        </div>
                                    </div>
                                    <a href={selectedApp.resumeUrl} target="_blank" className="p-2 hover:bg-primary-50 text-gray-400 hover:text-primary-600 rounded-lg transition-all">
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-lg flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-500" />
                                Next Steps & Tools
                            </h4>
                            <div className="p-6 bg-primary-50/30 dark:bg-primary-900/10 border-2 border-dashed border-primary-200 dark:border-primary-900 rounded-[32px] space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {selectedApp.status === 'applied' ? "Your application is currently in the initial screening phase. Our AI is analyzing your skills against the job blueprint." :
                                     selectedApp.status === 'shortlisted' ? "Great news! You have been shortlisted. The recruitment team will reach out shortly for interview scheduling." :
                                     selectedApp.status === 'interviewing' ? "You are in the interview stage. Ensure your preparation is solid." :
                                     "Wait for further updates from the talent management team."}
                                </p>
                                <button 
                                    onClick={() => handleWithdraw(selectedApp._id, selectedApp.jobId?.title)}
                                    className="w-full flex items-center justify-center gap-2 py-4 border-2 border-red-100 hover:border-red-500 text-red-400 hover:text-red-600 font-black rounded-2xl transition-all active:scale-[0.98]"
                                >
                                    <Trash2 className="w-4 h-4" /> Withdraw Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            /* Dashboard List View */
            <div className="space-y-6">
               <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black flex items-center gap-2">
                     <LayoutDashboard className="w-5 h-5 text-primary-500" />
                     Your Active Trackings
                  </h2>
               </div>
    
               {isLoading ? (
                 <div className="space-y-4">
                    {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl"></div>)}
                 </div>
               ) : applications?.length === 0 ? (
                 <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-[40px] bg-gray-50/50 dark:bg-gray-900/5">
                    <p className="text-gray-500 font-bold mb-4 text-lg">You haven't applied to any roles yet.</p>
                    <button onClick={() => router.push('/careers')} className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl hover:bg-primary-500 transition-all active:scale-95 shadow-primary-500/20">
                      Explore Jobs & Careers
                    </button>
                 </div>
               ) : (
                 <div className="grid gap-6">
                    {applications?.map((app: any) => (
                      <div key={app._id} className="flex flex-col gap-2 group">
                        <div className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[32px] p-6 hover:border-primary-400 hover:shadow-2xl hover:shadow-primary-500/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                           
                           <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                               app.status === 'hired' ? 'bg-green-500' : 
                               app.status === 'rejected' ? 'bg-red-500' :
                               app.status === 'shortlisted' ? 'bg-purple-500' : 'bg-primary-500'
                           }`} />
    
                           <div className="flex items-center gap-5 ml-2">
                              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600">
                                 <Briefcase className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="font-black text-lg group-hover:text-primary-600 transition-colors tracking-tight">{app.jobId?.title || 'Unknown Role'}</h3>
                                 <div className="flex items-center gap-4 mt-1">
                                   <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                      <Clock className="w-3.5 h-3.5" /> Applied {new Date(app.createdAt).toLocaleDateString()}
                                   </span>
                                   {app.aiScore && (
                                       <span className="text-[10px] text-purple-600 font-black uppercase tracking-widest flex items-center gap-1.5 leading-none bg-purple-50 px-2 py-1 rounded-lg border border-purple-100">
                                          <BrainCircuit className="w-3.5 h-3.5" /> AI Evaluated
                                       </span>
                                   )}
                                 </div>
                              </div>
                           </div>
    
                           <div className="flex items-center gap-6">
                              <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm ${getStatusColor(app.status)}`}>
                                 {app.status || 'applied'}
                              </div>
                              <button 
                                onClick={() => setSelectedAppId(app._id)}
                                className="px-6 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-primary-600 hover:text-white rounded-xl text-xs font-black transition-all border border-[var(--border)]"
                              >
                                 Tracking Details
                              </button>
                           </div>
                        </div>
                        
                        {app.aiSummary && (
                            <div className="mx-8 p-4 bg-primary-50/20 dark:bg-primary-900/5 border-x border-b border-[var(--border)] rounded-b-[24px] -mt-4">
                               <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic line-clamp-1">
                                  <span className="text-primary-500 font-black uppercase tracking-widest text-[9px] mr-2">Status Hint:</span>
                                  {app.aiSummary}
                               </p>
                            </div>
                        )}
                      </div>
                    ))}
                 </div>
               )}
            </div>
        )}

      </div>
      
      {/* 📌 New Footer Integration */}
      <footer className="mt-20 border-t border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50 py-12">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
                <div className="text-xl font-black text-primary-600">UMURAVA AI</div>
                <p className="text-sm text-gray-500 font-medium">Connecting world-class talent with AI-forward companies through intelligent screening.</p>
            </div>
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resources</h4>
                <ul className="space-y-2 text-sm font-bold">
                    <li><Link href="#" className="hover:text-primary-600">Help Center</Link></li>
                    <li><Link href="#" className="hover:text-primary-600">Application FAQs</Link></li>
                    <li><Link href="#" className="hover:text-primary-600">Support Chat</Link></li>
                </ul>
            </div>
            <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Legal</h4>
                <ul className="space-y-2 text-sm font-bold">
                    <li><Link href="#" className="hover:text-primary-600">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-primary-600">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-primary-600">Cookie Data</Link></li>
                </ul>
            </div>
        </div>
      </footer>
    </PublicLayout>
  );
}
