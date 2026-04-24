'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetJobsQuery, useGetApplicantsQuery, useRunScreeningMutation, useUpdateApplicantStatusMutation } from '@/store/api';
import { useRouter } from 'next/navigation';
import { BrainCircuit, Users, FileText, ArrowRight, CheckCircle2, XCircle, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function JobDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const jobId = params.id;
  const router = useRouter();

  const { data: jobs } = useGetJobsQuery();
  const job = jobs?.find(j => String(j._id) === jobId);
  
  const { data: applicants, isLoading: appsLoading, refetch } = useGetApplicantsQuery(jobId);
  const [runScreening, { isLoading: isScreening }] = useRunScreeningMutation();
  const [updateStatus] = useUpdateApplicantStatusMutation();

  const handleScreening = async () => {
    try {
      await runScreening(jobId).unwrap();
      router.push(`/jobs/${jobId}/screening`);
    } catch (error: any) {
      console.error('Failed to run AI screen', error?.data || error);
      alert('Error triggering screening. Ensure you have candidates and backend is alive.');
    }
  };

  const setStatus = async (id: string, status: string) => {
    await updateStatus({ id, status }).unwrap();
    refetch();
  };

  if (!job) return <DashboardLayout><div className="p-8">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">{job.department}</span>
               <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">{job.experienceLevel}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">{job.description}</p>
          </div>
          
          <div className="flex space-x-3">
             <Link href={`/jobs/${jobId}/screening`} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-5 py-2.5 rounded-xl font-medium transition-all">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                <span>AI Reports</span>
             </Link>
             
             <button 
                onClick={handleScreening} 
                disabled={isScreening || !applicants?.length}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md shadow-primary-500/20 disabled:opacity-50"
             >
                <BrainCircuit className="w-5 h-5" />
                <span>{isScreening ? 'AI is Screening...' : 'Run Ranking'}</span>
             </button>
          </div>
        </header>

        {/* Applicants Management Interface */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                Applicant Pipeline ({applicants?.length || 0})
              </h2>
              <Link href={`/jobs/${jobId}/upload`} className="text-sm bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-500 transition-colors">
                + Ingest Candidate
              </Link>
           </div>

           {appsLoading ? (
               <div className="p-8 animate-pulse text-center">Loading pipeline...</div>
           ) : applicants?.length === 0 ? (
               <div className="p-20 text-center flex flex-col items-center">
                 <Users className="w-12 h-12 text-gray-300 mb-2" />
                 <p className="text-gray-500">No applicants yet for this role.</p>
               </div>
           ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-900/30 text-xs font-black uppercase text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Candidate</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">AI Insight Preview</th>
                        <th className="px-6 py-4 text-right">Pipeline Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                       {applicants?.map((app: any) => (
                         <tr key={app._id} className="hover:bg-gray-50/20 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="font-bold">{app.name}</div>
                              <div className="text-[10px] text-gray-500">{app.email}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                app.status === 'shortlisted' ? 'bg-green-100 text-green-700' : 
                                app.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-gray-100 text-gray-500'
                              }`}>
                                {app.status || 'applied'}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <p className="text-xs text-gray-500 truncate max-w-[200px] italic">
                                {app.structuredProfile?.summary || 'Pending AI evaluation...'}
                              </p>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                 <button onClick={() => setStatus(app._id, 'shortlisted')} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/10 transition-colors" title="Shortlist">
                                   <CheckCircle2 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setStatus(app._id, 'interviewing')} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/10 transition-colors" title="Interview">
                                   <MessageSquare className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setStatus(app._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 transition-colors" title="Reject">
                                   <XCircle className="w-4 h-4" />
                                 </button>
                                 <a 
                                   href={app.resumeUrl?.startsWith('http') ? app.resumeUrl : `https://${app.resumeUrl}`} 
                                   target="_blank" 
                                   className={`p-1.5 rounded-lg border border-transparent transition-all ${
                                     app.resumeUrl 
                                     ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800' 
                                     : 'text-gray-200 cursor-not-allowed pointer-events-none'
                                   }`}
                                   title={app.resumeUrl ? "View Resume" : "No Resume Provided"}
                                 >
                                   <FileText className="w-4 h-4" />
                                 </a>
                              </div>
                           </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
               </div>
           )}
        </div>

      </div>
    </DashboardLayout>
  );
}
