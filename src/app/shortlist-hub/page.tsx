'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetJobsQuery, useGetCRMApplicantsQuery, useUpdateApplicantStatusMutation, useGetScreeningQuery, useTranscribeApplicantMutation, useUpdateApplicantMutation, useBulkUpdateApplicantStatusMutation, useSendMessageMutation } from '@/store/api';
import { useState, useMemo, useEffect } from 'react';
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
  UserCircle,
  FileSearch,
  Check,
  Plus,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Tag as TagIcon,
  MessageSquare,
  BadgeCheck
} from 'lucide-react';
import Link from 'next/link';

export default function ShortlistHub() {
  const { data: jobs, isLoading: jobsLoading } = useGetJobsQuery();
  const { data: allApplicants, isLoading: appsLoading, refetch } = useGetCRMApplicantsQuery();
  const [updateStatus] = useUpdateApplicantStatusMutation();
  const [updateApplicant] = useUpdateApplicantMutation();
  const [bulkUpdateStatus] = useBulkUpdateApplicantStatusMutation();
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [transcribeApplicant, { isLoading: isTranscribing }] = useTranscribeApplicantMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'notes' | 'tags' | 'resume'>('ai');
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [quickResumeUrl, setQuickResumeUrl] = useState<string | null>(null);
  const [messageModal, setMessageModal] = useState({ open: false, email: '', name: '' });
  const [messageContent, setMessageContent] = useState('');
  const [noteText, setNoteText] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (selectedApplicant && !selectedApplicant.resumeText && selectedApplicant.resumeUrl) {
      transcribeApplicant(selectedApplicant._id);
    }
  }, [selectedApplicant, transcribeApplicant]);

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

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await bulkUpdateStatus({ ids: selectedIds, status }).unwrap();
      setSelectedIds([]);
      refetch();
    } catch (err) {
      console.error('Failed to bulk update status', err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedApplicant) return;
    try {
      const newNote = {
        content: noteText,
        author: localStorage.getItem('umurava_email') || 'Recruiter',
        createdAt: new Date()
      };
      const updatedNotes = [...(selectedApplicant.notes || []), newNote];
      await updateApplicant({ 
        id: selectedApplicant._id, 
        body: { notes: updatedNotes } 
      }).unwrap();
      setSelectedApplicant({ ...selectedApplicant, notes: updatedNotes });
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note', err);
    }
  };

  const handleAddTag = async () => {
    if (!tagInput.trim() || !selectedApplicant) return;
    try {
      const updatedTags = [...(selectedApplicant.tags || []), tagInput.trim()];
      await updateApplicant({ 
        id: selectedApplicant._id, 
        body: { tags: updatedTags } 
      }).unwrap();
      setSelectedApplicant({ ...selectedApplicant, tags: updatedTags });
      setTagInput('');
    } catch (err) {
      console.error('Failed to add tag', err);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedApplicant) return;
    try {
      const updatedTags = (selectedApplicant.tags || []).filter((t: string) => t !== tag);
      await updateApplicant({ 
        id: selectedApplicant._id, 
        body: { tags: updatedTags } 
      }).unwrap();
      setSelectedApplicant({ ...selectedApplicant, tags: updatedTags });
    } catch (err) {
      console.error('Failed to remove tag', err);
    }
  };

  const handleScheduleInterview = async (date: string) => {
    if (!selectedApplicant) return;
    try {
      await updateApplicant({ 
        id: selectedApplicant._id, 
        body: { interviewDate: date, status: 'interviewing' } 
      }).unwrap();
      setSelectedApplicant({ ...selectedApplicant, interviewDate: date, status: 'interviewing' });
    } catch (err) {
      console.error('Failed to schedule interview', err);
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
                    className={`bg-[var(--card)] border p-6 rounded-3xl hover:shadow-xl transition-all group relative overflow-hidden ${selectedIds.includes(app._id) ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-[var(--border)]'}`}
                  >
                    <div className="absolute top-4 left-4 z-10">
                       <input 
                         type="checkbox"
                         checked={selectedIds.includes(app._id)}
                         onChange={() => toggleSelect(app._id)}
                         className="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                       />
                    </div>
                     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        {app.resumeUrl && (
                          <button 
                            onClick={() => setQuickResumeUrl(app.resumeUrl)}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
                            title="Quick View Resume"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => setMessageModal({ open: true, email: app.email, name: app.name })}
                          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                          title="Message Candidate"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setSelectedApplicant(app)}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                          title="View Full CRM Details"
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
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors"
                          >
                            Interview
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app._id, 'rejected')}
                            className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                       </div>
                       <Link href={`/jobs/${app.jobId?._id || app.jobId}`} className="text-primary-600 hover:translate-x-1 transition-transform p-1">
                          <ArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 z-50 border border-white/10 animate-in slide-in-from-bottom-10">
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <div className="bg-primary-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="font-bold text-sm">Candidates Selected</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleBulkStatusUpdate('interviewing')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule Interviews
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('rejected')}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Bulk Reject
              </button>
              <button 
                onClick={() => setShowComparison(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <TableIcon className="w-4 h-4" />
                Compare Side-by-Side
              </button>
            </div>

            <button 
              onClick={() => setSelectedIds([])}
              className="ml-4 p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Side-by-Side Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0f172a] w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10 flex flex-col h-full max-h-[90vh]">
              <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                    <TableIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Talent Comparison Matrix</h2>
                    <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mt-1">Cross-referencing {selectedIds.length} top candidates</p>
                  </div>
                </div>
                <button onClick={() => setShowComparison(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                  <XCircle className="w-8 h-8 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-[var(--border)] font-bold text-xs uppercase text-gray-400 sticky left-0 z-10">Candidate</th>
                      {selectedIds.map(id => {
                        const app = allApplicants?.find(a => a._id === id);
                        return (
                          <th key={id} className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-[var(--border)] min-w-[250px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold">{app?.name[0]}</div>
                              <span className="font-bold text-gray-900 dark:text-white">{app?.name}</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    <tr>
                      <td className="p-4 font-bold text-xs uppercase text-gray-400 sticky left-0 bg-white dark:bg-[#0f172a] border-r border-[var(--border)]">Match Score</td>
                      {selectedIds.map(id => {
                        const app = allApplicants?.find(a => a._id === id);
                        return (
                          <td key={id} className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-600 rounded-full" style={{ width: `${app?.matchScore || 0}%` }} />
                              </div>
                              <span className="font-black text-primary-600">{app?.matchScore || 0}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-xs uppercase text-gray-400 sticky left-0 bg-white dark:bg-[#0f172a] border-r border-[var(--border)]">Verified Skills</td>
                      {selectedIds.map(id => {
                        const app = allApplicants?.find(a => a._id === id);
                        return (
                          <td key={id} className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {(app?.skillsVerification?.verified || app?.extractedSkills || []).slice(0, 5).map((s: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold">{s}</span>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-xs uppercase text-gray-400 sticky left-0 bg-white dark:bg-[#0f172a] border-r border-[var(--border)]">Experience</td>
                      {selectedIds.map(id => {
                        const app = allApplicants?.find(a => a._id === id);
                        return (
                          <td key={id} className="p-4 text-sm text-gray-500 leading-relaxed italic">
                            "{app?.experience?.substring(0, 100)}..."
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-xs uppercase text-gray-400 sticky left-0 bg-white dark:bg-[#0f172a] border-r border-[var(--border)]">AI Recommendation</td>
                      {selectedIds.map(id => {
                        const app = allApplicants?.find(a => a._id === id);
                        return (
                          <td key={id} className="p-4">
                            <div className="p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-2xl text-[10px] text-primary-700 leading-relaxed">
                              {app?.aiRecommendation || "Analysis pending..."}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
                    <button onClick={() => { setSelectedApplicant(null); setActiveTab('ai'); setShowResumePreview(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                       <XCircle className="w-6 h-6 text-gray-400" />
                    </button>
                 </div>

                 {/* CRM Tabs */}
                 <div className="flex px-8 border-b border-[var(--border)] bg-gray-50/30 dark:bg-gray-900/20">
                    {[
                      { id: 'ai', label: 'AI Intelligence', icon: Brain },
                      { id: 'notes', label: 'Notes', icon: MessageSquare },
                      { id: 'tags', label: 'Tags', icon: TagIcon },
                      { id: 'resume', label: 'Resume', icon: FileSearch }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative ${
                          activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                      </button>
                    ))}
                 </div>
                 <div className="p-8 overflow-y-auto flex-1 scrollbar-thin">
                    {activeTab === 'ai' && (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <section className="grid grid-cols-2 gap-4 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-3xl border border-[var(--border)]">
                       <div className="space-y-0.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email</label>
                          <div className="flex items-center gap-2 text-xs font-bold truncate">
                             <Mail className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                             {selectedApplicant.email}
                          </div>
                       </div>
                       <div className="space-y-0.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Phone</label>
                          <div className="flex items-center gap-2 text-xs font-bold">
                             <Phone className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                             {selectedApplicant.phone || 'N/A'}
                          </div>
                       </div>
                    </section>

                        <section className="space-y-3">
                           <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-500">
                           <BadgeCheck className="w-4 h-4" />
                           AI Skill Verification & Insight
                        </h4>
                            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
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
                      </div>
                    )}

                    {activeTab === 'notes' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
                        <div className="flex-1 space-y-4">
                          {(!selectedApplicant.notes || selectedApplicant.notes.length === 0) ? (
                            <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/40 rounded-[32px] border border-dashed border-gray-200">
                              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm">No internal notes yet. Add your first feedback below.</p>
                            </div>
                          ) : (
                            selectedApplicant.notes.map((note: any, i: number) => (
                              <div key={i} className="p-5 bg-white dark:bg-gray-900 border border-[var(--border)] rounded-2xl shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{note.author}</span>
                                  <span className="text-[10px] text-gray-400 font-bold">{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{note.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="sticky bottom-0 bg-white dark:bg-[#0f172a] pt-4 border-t border-[var(--border)]">
                          <textarea 
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a private note about this candidate..."
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none h-24"
                          />
                          <button 
                            onClick={handleAddNote}
                            disabled={!noteText.trim()}
                            className="mt-3 w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all disabled:opacity-50"
                          >
                            Add Internal Note
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'tags' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {(!selectedApplicant.tags || selectedApplicant.tags.length === 0) ? (
                              <p className="text-gray-400 text-sm italic">No tags assigned yet.</p>
                            ) : (
                              selectedApplicant.tags.map((tag: string, i: number) => (
                                <span key={i} className="group flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-bold border border-primary-100">
                                  <TagIcon className="w-3 h-3" />
                                  {tag}
                                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-[var(--border)] space-y-4">
                          <h4 className="text-sm font-bold">Add New Label</h4>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                              placeholder="e.g. Culture Fit, Strong Lead..."
                              className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-[var(--border)] rounded-xl text-sm focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                            />
                            <button 
                              onClick={handleAddTag}
                              className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'resume' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col items-center justify-center min-h-[400px]">
                        {selectedApplicant.resumeUrl ? (
                          !showResumePreview ? (
                            <div className="text-center p-12 bg-gray-50 dark:bg-gray-900/40 rounded-[40px] border border-dashed border-[var(--border)] max-w-sm w-full">
                               <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                  <FileText className="w-8 h-8" />
                               </div>
                               <h4 className="text-lg font-bold mb-2">Resume is ready</h4>
                               <p className="text-gray-500 text-sm mb-8">Loading resumes uses high bandwidth. Click below to view the document.</p>
                               <button 
                                 onClick={() => setShowResumePreview(true)}
                                 className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 hover:bg-primary-500 transition-all flex items-center justify-center gap-3"
                               >
                                  <Eye className="w-5 h-5" />
                                  Load Resume Document
                               </button>
                            </div>
                          ) : (
                            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[var(--border)] bg-gray-100 dark:bg-gray-900 shadow-inner relative group">
                              <iframe 
                                src={selectedApplicant.resumeUrl.includes('cloudinary.com') 
                                   ? `https://docs.google.com/gview?url=${encodeURIComponent(selectedApplicant.resumeUrl)}&embedded=true`
                                   : selectedApplicant.resumeUrl
                                } 
                                className="w-full h-full border-none"
                                title="Resume Preview"
                              />
                              <button 
                                onClick={() => setShowResumePreview(false)}
                                className="absolute top-4 right-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                              >
                                Hide Preview
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="p-20 text-center">
                            <FileSearch className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-500">No resume document found for this candidate.</p>
                          </div>
                        )}
                      </div>
                    )}
                 </div>

                 <div className="p-8 border-t border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 block">Interview Schedule</label>
                          <input 
                            type="datetime-local"
                            value={selectedApplicant.interviewDate ? new Date(selectedApplicant.interviewDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleScheduleInterview(e.target.value)}
                            className="bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs font-bold text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                          />
                       </div>
                    </div>
                    <div className="flex gap-2 self-end">
                       <button 
                         onClick={() => handleStatusUpdate(selectedApplicant._id, 'rejected')}
                         className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                       >
                         <XCircle className="w-3 h-3" />
                         Reject
                       </button>
                       <button 
                         onClick={() => handleStatusUpdate(selectedApplicant._id, 'interviewing')}
                         className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
                       >
                         <CalendarIcon className="w-3 h-3" />
                         Interview
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}
        {/* Quick Resume Modal */}
        {quickResumeUrl && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden border border-white/10 flex flex-col">
                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-sm uppercase tracking-widest">Quick Resume View</h3>
                   </div>
                   <button onClick={() => setQuickResumeUrl(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                      <XCircle className="w-6 h-6 text-gray-400" />
                   </button>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-950">
                   <iframe 
                      src={quickResumeUrl.includes('cloudinary.com') 
                         ? `https://docs.google.com/gview?url=${encodeURIComponent(quickResumeUrl)}&embedded=true`
                         : quickResumeUrl
                      } 
                      className="w-full h-full border-none"
                      title="Quick Resume Preview"
                   />
                </div>
             </div>
          </div>
        )}

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
                      <XCircle className="w-5 h-5" />
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
      </div>
    </DashboardLayout>
  );
}
