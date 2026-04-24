'use client'

import PublicLayout from '@/components/PublicLayout';
import { useGetJobsQuery, useCreateApplicantMutation, useUploadResumeMutation } from '@/store/api';
import { useParams, useRouter } from 'next/navigation'; // Removed useSearchParams as it's not directly used here
import { useState, useEffect } from 'react'; // Removed 'use' import
import { Briefcase, Send, CheckCircle, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function JobApplicationPage() { // Removed props from function signature
  const params = useParams(); // Correct usage for client component
  const jobId = params.id;
  const router = useRouter();

  const { data: jobs, isLoading: isJobsLoading } = useGetJobsQuery();
  const job = jobs?.find(j => String(j._id) === jobId);
  
  const [createApplicant, { isLoading: isApplying }] = useCreateApplicantMutation();
  const [uploadResume] = useUploadResumeMutation();
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('umurava_token');
    if (token) {
        setIsLoggedIn(true);
        const storedName = localStorage.getItem('umurava_name') || '';
        const storedEmail = localStorage.getItem('umurava_email') || '';
        setFormData(prev => ({ ...prev, name: storedName, email: storedEmail }));
    }
  }, []);

  const isClosed = job?.expirationDate ? new Date(job.expirationDate) < new Date() : false;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
    currentJobTitle: '',
    experience: '',
    skills: '',
    linkedinUrl: '',
    portfolioUrl: '',
    availability: ''
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Please upload a PDF/DOC under 5MB.');
      return;
    }

    // Reset previous success state
    setUploadSuccess(false);
    setUploadedFileName(file.name);

    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    setIsFileUploading(true);
    try {
      const response = await uploadResume(formDataUpload).unwrap();
      setFormData(prev => ({ ...prev, resumeUrl: response.url }));
      setUploadSuccess(true);
    } catch (error) {
      setUploadedFileName('');
      alert('File upload failed. Please try a different file or use a link.');
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        jobId,
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      await createApplicant(payload).unwrap();
      setSubmitted(true);
    } catch (error) {
      alert('Failed to submit application. Please try again.');
      console.error(error);
    }
  };

  if (isJobsLoading) return <PublicLayout><div className="p-20 text-center">Loading Role...</div></PublicLayout>;
  if (!job) return <PublicLayout><div className="p-20 text-center text-red-500 font-bold">Role not found.</div></PublicLayout>;

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-8 py-16 space-y-12">
        {/* Job Details */}
        <div className="space-y-6">
           <Link href="/" className="text-sm font-black text-primary-600 mb-8 inline-block hover:underline uppercase tracking-widest">&larr; Back to Listings</Link>
           <h1 className="text-5xl font-black tracking-tight">{job.title}</h1>
           <div className="flex flex-wrap gap-4">
              <span className="px-4 py-1.5 bg-primary-600 text-white font-black text-xs rounded-xl uppercase tracking-[0.15em] shadow-lg shadow-primary-500/30">{job.department}</span>
              <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-black text-xs rounded-xl uppercase tracking-widest border border-[var(--border)]">{job.experienceLevel}</span>
           </div>

           <div className="prose dark:prose-invert max-w-none pt-8 border-t border-[var(--border)]">
              <h3 className="text-2xl font-black mb-4">Role Overview</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">{job.description}</p>
           </div>
        </div>

        {/* Auth Guarded Application Form */}
        {isClosed ? (
           <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-[40px] p-12 text-center text-red-600">
             <h2 className="text-3xl font-black mb-2">Applications Closed</h2>
             <p className="font-bold">This job position has reached its deadline.</p>
           </div>
        ) : !isLoggedIn ? (
           <div className="bg-white dark:bg-gray-900 border-2 border-dashed border-primary-200 dark:border-primary-900 rounded-[40px] p-16 text-center space-y-8 flex flex-col items-center">
              <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Login to Apply</h2>
                <p className="text-gray-500 font-medium">To protect your candidate profile and allow AI ranking, you must be logged into your Umurava account to apply.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href="/login" className="px-10 py-4 bg-primary-600 text-white font-black rounded-2xl shadow-xl hover:bg-primary-500 transition-all active:scale-95">
                  Sign In to Apply
                </Link>
                <Link href="/register" className="px-10 py-4 border-2 border-primary-600 text-primary-600 font-black rounded-2xl hover:bg-primary-50 transition-all active:scale-95">
                  Create New Account
                </Link>
              </div>
           </div>
        ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[40px] p-10 shadow-2xl shadow-primary-500/5">
           <h2 className="text-3xl font-black mb-8 flex items-center gap-3 border-b border-[var(--border)] pb-6">
             <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center">
               <Briefcase className="w-6 h-6 text-primary-600" />
             </div>
             Quick Application Form
           </h2>

           {submitted ? (
             <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-24 h-24 bg-green-100 rounded-[32px] flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-green-700 dark:text-green-500">Application Successful!</h3>
                <p className="text-gray-500 font-bold max-w-sm">Your profile is now in the pipeline. You can track its AI ranking in your dashboard.</p>
                <button onClick={() => router.push('/applicants/dashboard')} className="mt-8 px-8 py-3 bg-primary-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                  Go to My Dashboard
                </button>
             </div>
           ) : (
             <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                     <input required type="text" value={formData.name} className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50" placeholder="Jane Doe" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address *</label>
                     <input required type="email" value={formData.email} className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50" placeholder="jane@example.com" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number *</label>
                      <input required minLength={10} type="tel" className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50" placeholder="+250..." onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-400">Resume / CV *</label>
                       <div className="flex flex-col gap-3">
                          <input 
                            required={!formData.resumeUrl}
                            type="url" 
                            value={formData.resumeUrl}
                            className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50 transition-all" 
                            placeholder="Link to Hosted Resume (Google Drive, LinkedIn...)" 
                            onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})} 
                          />
                          <div className="flex items-center gap-4">
                             <div className="h-px flex-1 bg-[var(--border)]" />
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">or upload from device</span>
                             <div className="h-px flex-1 bg-[var(--border)]" />
                          </div>
                           {uploadSuccess ? (
                             <div className="flex items-center gap-3 w-full px-5 py-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-600 rounded-2xl">
                               <div className="w-9 h-9 bg-green-100 dark:bg-green-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                                 <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Upload Verified ✓</p>
                                 <p className="text-[11px] text-green-600/80 dark:text-green-500/80 font-medium truncate mt-0.5">{uploadedFileName}</p>
                               </div>
                               <label className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest cursor-pointer hover:underline flex-shrink-0">
                                 Replace
                                 <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={isFileUploading} />
                               </label>
                             </div>
                           ) : (
                             <label className={`flex items-center gap-3 w-full px-5 py-4 border-2 border-dashed rounded-2xl transition-all ${
                               isFileUploading
                                 ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10 cursor-wait'
                                 : 'border-primary-200 dark:border-primary-900 cursor-pointer hover:bg-primary-50/50 hover:border-primary-400 group'
                             }`}>
                               {isFileUploading ? (
                                 <Loader2 className="w-5 h-5 text-primary-500 animate-spin flex-shrink-0" />
                               ) : (
                                 <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                   <Upload className="w-4 h-4 text-primary-500" />
                                 </div>
                               )}
                               <div className="text-left">
                                 <p className="text-xs font-black text-primary-600 uppercase tracking-widest">
                                   {isFileUploading ? 'Uploading to Secure Server...' : 'Choose PDF / DOC File'}
                                 </p>
                                 {!isFileUploading && (
                                   <p className="text-[10px] text-gray-400 font-medium mt-0.5">Max 5MB · PDF, DOC, DOCX</p>
                                 )}
                               </div>
                               <input
                                 type="file"
                                 className="hidden"
                                 accept=".pdf,.doc,.docx"
                                 onChange={handleFileUpload}
                                 disabled={isFileUploading}
                               />
                             </label>
                           )}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Professional Skills (Comma Separated)</label>
                    <input type="text" className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50" placeholder="React, Python, Project Management..." onChange={(e) => setFormData({...formData, skills: e.target.value})} />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Cover Letter / Pitch *</label>
                    <textarea required rows={5} className="w-full px-5 py-3.5 border border-[var(--border)] rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-primary-500/50" placeholder="Tell us why you're a match..." onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}></textarea>
                 </div>

                 <div className="pt-6">
                   <button type="submit" disabled={isApplying} className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-5 rounded-3xl font-black transition-all shadow-2xl shadow-primary-500/30 active:scale-[0.98] disabled:opacity-50">
                     <Send className="w-6 h-6" />
                     <span>{isApplying ? 'Processing AI Data...' : 'Submit Profile for Auto-Ranking'}</span>
                   </button>
                   <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-6">Secure Submission &bull; AI Powered Validation</p>
                 </div>
             </form>
           )}
        </div>
        )}
      </div>
    </PublicLayout>
  );
}
