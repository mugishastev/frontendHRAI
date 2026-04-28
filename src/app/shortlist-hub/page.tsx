'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetJobsQuery, useGetCRMApplicantsQuery, useUpdateApplicantStatusMutation, useGetScreeningQuery } from '@/store/api';
import { useState, useMemo } from 'react';
import { 
  Users, 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ArrowRight,
  User,
  Mail,
  Phone,
  FileText,
  Brain,
  ShieldCheck,
  AlertTriangle,
  Info,
  BadgeCheck,
  Zap,
  GraduationCap,
  History,
  MapPin,
  UserCircle,
  FileSearch
} from 'lucide-react';
import Link from 'next/link';

export default function ShortlistHub() {
  const { data: jobs, isLoading: jobsLoading } = useGetJobsQuery();
  const { data: allApplicants, isLoading: appsLoading, refetch } = useGetCRMApplicantsQuery();
  const [updateStatus] = useUpdateApplicantStatusMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);

  // Fetch screening data for the selected job (if one is selected)
  const { data: screeningData, isLoading: screeningLoading } = useGetScreeningQuery(selectedJobId, { 
    skip: selectedJobId === 'all' 
  });

  // Filter only shortlisted applicants
  const shortlisted = useMemo(() => {
    return allApplicants?.filter((app: any) => app.status === 'shortlisted') || [];
  }, [allApplicants]);

  // Apply filters
  const filteredShortlist = useMemo(() => {
    return shortlisted.filter((app: any) => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           app.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesJob = selectedJobId === 'all' || String(app.jobId?._id || app.jobId) === selectedJobId;
      return matchesSearch && matchesJob;
    });
  }, [shortlisted, searchQuery, selectedJobId]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      refetch();
      if (selectedApplicant?._id === id) {
          setSelectedApplicant(null);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              Shortlist <span className="text-primary-600">Hub</span>
            </h1>
            <p className="text-gray-500 mt-2">Centralized management for your top-tier talent across all roles.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {shortlisted.length} Shortlisted Total
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="space-y-6">
            <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl shadow-sm space-y-4">
               <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
                 <Filter className="w-4 h-4" />
                 Filter by Role
               </h3>
               <div className="space-y-2">
                 <button 
                   onClick={() => setSelectedJobId('all')}
                   className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all ${selectedJobId === 'all' ? 'bg-primary-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                 >
                   All Jobs
                 </button>
                 {jobsLoading ? (
                   <div className="p-4 animate-pulse">Loading jobs...</div>
                 ) : (
                   jobs?.map((job: any) => (
                     <button 
                       key={job._id}
                       onClick={() => setSelectedJobId(String(job._id))}
                       className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all truncate ${selectedJobId === String(job._id) ? 'bg-primary-600 text-white shadow-lg' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                     >
                       {job.title}
                     </button>
                   ))
                 )}
               </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text"
                   placeholder="Search by name or email..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                 />
               </div>
            </div>

            {/* Candidate Grid */}
            {appsLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="h-48 bg-[var(--card)] animate-pulse rounded-3xl border border-[var(--border)]"></div>)}
               </div>
            ) : filteredShortlist.length === 0 ? (
               <div className="p-20 text-center bg-[var(--card)] border border-[var(--border)] rounded-[40px] flex flex-col items-center">
                  <Users className="w-16 h-16 text-gray-200 mb-4" />
                  <h3 className="text-xl font-bold">No Shortlisted Candidates Found</h3>
                  <p className="text-gray-500">Either no one is shortlisted for this role, or your search query didn't match.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredShortlist.map((app: any) => (
                  <div 
                    key={app._id} 
                    className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl hover:shadow-xl transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => setSelectedApplicant(app)}
                         className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                       >
                         <Eye className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                       <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                         {app.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{app.name}</h3>
                          <p className="text-xs text-gray-400 truncate">Applied for: <span className="text-primary-500 font-semibold">{app.jobId?.title || 'Unknown Role'}</span></p>
                       </div>
                    </div>

                    <div className="space-y-2 mb-6">
                       <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{app.email}</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{app.phone || 'N/A'}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                       <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(app._id, 'interviewing')}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-colors"
                          >
                            Interview
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app._id, 'rejected')}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                       </div>
                       <Link href={`/jobs/${app.jobId?._id || app.jobId}`} className="text-primary-600 hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-5 h-5" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Integrated Data Detail Overlay */}
        {selectedApplicant && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
                 <div className="p-8 border-b border-[var(--border)] flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black">
                         {selectedApplicant.name[0]}
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold">{selectedApplicant.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Shortlisted</span>
                             <span className="text-gray-400 text-sm">•</span>
                             <span className="text-primary-600 font-bold text-sm">{selectedApplicant.jobId?.title}</span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedApplicant(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                       <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                 </div>

                 <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin">
                    <section className="grid grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                          <div className="flex items-center gap-2 text-sm font-medium">
                             <Mail className="w-4 h-4 text-primary-500" />
                             {selectedApplicant.email}
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                          <div className="flex items-center gap-2 text-sm font-medium">
                             <Phone className="w-4 h-4 text-primary-500" />
                             {selectedApplicant.phone || 'N/A'}
                          </div>
                       </div>
                    </section>

                    <section className="space-y-3">
                       <h4 className="text-sm font-bold flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-500" />
                          AI Intelligence Insight
                       </h4>
                        <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-xs font-bold text-indigo-600">Match Score</span>
                              <span className="text-xl font-black text-indigo-700">
                                {selectedApplicant.matchScore != null ? `${selectedApplicant.matchScore}%` : 'N/A'}
                              </span>
                           </div>
                           <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-3">
                              &ldquo;{selectedApplicant.aiReasoning || 'No AI insights available. Run AI Screening on this job to generate insights.'}&rdquo;
                           </p>
                           {selectedApplicant.aiRecommendation && (
                             <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                               <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">AI Recommendation</span>
                               <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">{selectedApplicant.aiRecommendation}</p>
                             </div>
                           )}
                           {selectedApplicant.strengths?.length > 0 && (
                             <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap gap-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 w-full mb-1">Strengths</span>
                               {selectedApplicant.strengths.map((s: string, i: number) => (
                                 <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-semibold">{s}</span>
                               ))}
                             </div>
                           )}
                           {selectedApplicant.gaps?.length > 0 && (
                             <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-wrap gap-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 w-full mb-1">Gaps</span>
                               {selectedApplicant.gaps.map((g: string, i: number) => (
                                 <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-semibold">{g}</span>
                               ))}
                             </div>
                           )}
                        </div>
                    </section>

                    {/* NEW: Resume Structure & Quality */}
                    {selectedApplicant.structuredProfile && (
                       <section className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                             <FileSearch className="w-4 h-4 text-blue-500" />
                             Resume Structure & Quality
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-[var(--border)]">
                             <div className="flex justify-between items-center mb-6">
                                <div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Completeness Score</span>
                                   <div className="text-3xl font-black text-blue-600">{selectedApplicant.structuredProfile.completenessScore}%</div>
                                </div>
                                <div className="flex gap-1">
                                   {[20, 40, 60, 80, 100].map(step => (
                                      <div key={step} className={`w-8 h-2 rounded-full ${selectedApplicant.structuredProfile.completenessScore >= step ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`} />
                                   ))}
                                </div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                   { label: 'Contact Info', key: 'contact', icon: <UserCircle className="w-3.5 h-3.5" /> },
                                   { label: 'Summary', key: 'summary', icon: <Info className="w-3.5 h-3.5" /> },
                                   { label: 'Experience', key: 'experience', icon: <History className="w-3.5 h-3.5" /> },
                                   { label: 'Skills', key: 'skills', icon: <Zap className="w-3.5 h-3.5" /> },
                                   { label: 'Education', key: 'education', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                                ].map(section => {
                                   const exists = !!selectedApplicant.structuredProfile[section.key];
                                   return (
                                      <div key={section.key} className={`flex items-center justify-between p-3 rounded-xl border ${exists ? 'bg-white dark:bg-gray-800 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-400'}`}>
                                         <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                                            {section.icon}
                                            {section.label}
                                         </div>
                                         {exists ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4 opacity-30" />}
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                       </section>
                    )}

                    <section className="space-y-3">
                       <h4 className="text-sm font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-500" />
                          Resume Transcription
                       </h4>
                       <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl text-xs font-mono text-gray-500 leading-relaxed max-h-48 overflow-y-auto">
                          {selectedApplicant.resumeText || 'No transcript available.'}
                       </div>
                    </section>

                    {/* NEW: Skill Verification Section */}
                    {(selectedApplicant.skillsVerification || selectedApplicant.extractedSkills?.length > 0) && (
                       <section className="space-y-4">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                             <BadgeCheck className="w-4 h-4 text-primary-500" />
                             AI Skill Verification
                          </h4>
                          <div className="grid grid-cols-1 gap-4">
                             {/* Verified Skills */}
                             {selectedApplicant.skillsVerification?.verified?.length > 0 && (
                                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block mb-2">Verified in Resume</span>
                                   <div className="flex flex-wrap gap-1.5">
                                      {selectedApplicant.skillsVerification.verified.map((s: string, i: number) => (
                                         <span key={i} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1">
                                            <BadgeCheck className="w-3 h-3" /> {s}
                                         </span>
                                      ))}
                                   </div>
                                </div>
                             )}

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Claimed but Missing */}
                                {selectedApplicant.skillsVerification?.claimedButMissing?.length > 0 && (
                                   <div className="p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-red-600 block mb-2 flex items-center gap-1">
                                         <AlertTriangle className="w-3 h-3" /> Claimed but Missing
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                         {selectedApplicant.skillsVerification.claimedButMissing.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-lg text-[10px] font-bold line-through opacity-70">
                                               {s}
                                            </span>
                                         ))}
                                      </div>
                                   </div>
                                )}

                                {/* Hidden Gems */}
                                {selectedApplicant.skillsVerification?.hiddenGems?.length > 0 && (
                                   <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-2 flex items-center gap-1">
                                         <Zap className="w-3 h-3" /> Hidden Gems
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                         {selectedApplicant.skillsVerification.hiddenGems.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-[10px] font-bold">
                                               {s}
                                            </span>
                                         ))}
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                       </section>
                    )}
                 </div>

                 <div className="p-8 border-t border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between gap-4">
                    <div className="flex gap-2">
                       <button 
                         onClick={() => handleStatusUpdate(selectedApplicant._id, 'interviewing')}
                         className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
                       >
                         Move to Interview
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(selectedApplicant._id, 'rejected')}
                         className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                       >
                         Reject Candidate
                       </button>
                    </div>
                    {selectedApplicant.resumeUrl && (
                       <a 
                         href={selectedApplicant.resumeUrl.startsWith('http') ? selectedApplicant.resumeUrl : `https://${selectedApplicant.resumeUrl}`} 
                         target="_blank"
                         className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                       >
                         <FileText className="w-4 h-4" />
                         Original PDF
                       </a>
                    )}
                 </div>
              </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
