'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetScreeningQuery, useGetJobsQuery, useUpdateApplicantStatusMutation } from '@/store/api';
import { useParams } from 'next/navigation';
import { Brain, ExternalLink, ThumbsUp, AlertTriangle } from 'lucide-react';
import { use } from 'react';

export default function ScreeningResultsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const jobId = params.id;
  
  const { data: screening, isLoading: scLoading, error, refetch } = useGetScreeningQuery(jobId);
  const { data: jobs } = useGetJobsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicantStatusMutation();
  const job = jobs?.find(j => String(j._id) === jobId);

  const handleDecision = async (applicantId: string, status: string) => {
    try {
      await updateStatus({ id: applicantId, status }).unwrap();
      alert(`Candidate has been successfully ${status}.`);
      refetch(); // Refresh to show updated state if needed
    } catch (err) {
      alert("Failed to update candidate status.");
    }
  };

  if (scLoading) return <DashboardLayout><div className="p-8">Fetching AI Insights...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-primary-900 to-primary-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
             <Brain className="w-64 h-64 -mr-16 -mt-16" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">AI Screening Results</h1>
            <p className="text-primary-100">Top actionable insights for {job?.title || 'the role'}.</p>
          </div>
          <div className="relative z-10 flex gap-4 mt-4 md:mt-0">
             <div className="bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 text-center">
               <div className="text-3xl font-bold">{screening?.results?.length || 0}</div>
               <div className="text-xs uppercase tracking-wider font-semibold text-primary-100">Evaluations</div>
             </div>
             
             <button 
               className="bg-white text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-2xl font-bold shadow-md transition-all h-full"
               onClick={() => {
                 const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(screening?.results, null, 2));
                 const node = document.createElement('a');
                 node.setAttribute("href", dataStr);
                 node.setAttribute("download", `shortlist_export_${jobId}.json`);
                 document.body.appendChild(node);
                 node.click();
                 node.remove();
               }}
             >
                Export CSV / JSON
             </button>
          </div>
        </header>

        {error ? (
          <div className="p-8 bg-orange-50 dark:bg-orange-900/10 text-orange-600 rounded-2xl border border-orange-200 dark:border-orange-900/50 text-center">
            You haven't run a screening for this role yet. Or an error occurred.
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Top Shortlisted Candidates</h2>
            <div className="space-y-4">
              {screening?.results?.slice().sort((a: any, b: any) => a.rank - b.rank).map((res: any, idx: number) => {
                 const applicant = res.applicantId || {};
                 return (
                  <div key={idx} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                     
                     <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 py-4 bg-gray-50 border border-gray-100 dark:bg-gray-800/50 dark:border-gray-700 rounded-2xl">
                        <span className="text-sm text-gray-500 font-bold uppercase uppercase tracking-widest">Rank</span>
                        <span className="text-3xl font-black text-primary-600">#{res.rank}</span>
                     </div>

                     <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <h3 className="text-xl font-bold">{applicant.name || 'Unknown Candidate'}</h3>
                              <p className="text-sm text-gray-500">{applicant.email}</p>
                           </div>
                           <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                              Match: {res.matchScore}%
                           </div>
                        </div>

                        {res.summary && (
                          <div className="text-sm font-bold text-primary-600 dark:text-primary-400 italic mb-2 px-1">
                            "{res.summary}"
                          </div>
                        )}

                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm leading-relaxed border border-[var(--border)] border-l-4 border-l-primary-500">
                           {res.finalRecommendation}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                           <div>
                              <h4 className="text-xs font-bold text-green-600 uppercase flex items-center gap-1 mb-2">
                                <ThumbsUp className="w-3 h-3" /> Core Strengths
                              </h4>
                              <ul className="text-sm space-y-1">
                                {res.strengths?.map((s: string, i: number) => (
                                  <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-green-500">•</span> {s}
                                  </li>
                                ))}
                              </ul>
                           </div>
                           <div>
                              <h4 className="text-xs font-bold text-orange-600 uppercase flex items-center gap-1 mb-2">
                                <AlertTriangle className="w-3 h-3" /> Identified Gaps
                              </h4>
                              <ul className="text-sm space-y-1">
                                {res.gaps?.map((g: string, i: number) => (
                                  <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-400">
                                    <span className="text-orange-400">•</span> {g}
                                  </li>
                                ))}
                              </ul>
                           </div>
                        </div>

                        {/* Human Decision Override Controls */}
                        <div className="pt-4 mt-4 border-t border-[var(--border)] flex justify-end gap-3 flex-wrap">
                           <button 
                             disabled={isUpdating}
                             onClick={() => handleDecision(applicant._id, 'rejected')}
                             className="text-sm font-semibold rounded-lg px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                           >
                              Override & Reject
                           </button>
                           <button 
                             disabled={isUpdating}
                             onClick={() => handleDecision(applicant._id, 'shortlisted')}
                             className="text-sm font-semibold rounded-lg px-4 py-2 bg-primary-50 hover:bg-green-50 text-primary-600 hover:text-green-600 transition-colors border border-transparent hover:border-green-200 disabled:opacity-50"
                           >
                              Accept Recommendation
                           </button>
                        </div>
                     </div>
                  </div>
                 )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
