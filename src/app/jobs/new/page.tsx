'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useCreateJobMutation } from '@/store/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Briefcase, CheckCircle } from 'lucide-react';

export default function CreateJobPage() {
  const [createJob, { isLoading }] = useCreateJobMutation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    company: '',
    location: '',
    employmentType: 'Full-time',
    salaryRange: '',
    description: '',
    requirements: '',
    skills: '',
    experienceLevel: 'Mid-Level',
    expirationDate: '',
    aiBlueprint: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(s => s.trim()),
        skills: formData.skills.split(',').map(s => s.trim()),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
      };
      await createJob(payload).unwrap();
      router.push('/');
    } catch (error) {
      console.error('Failed to create job', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <header>
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
               <Briefcase className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight">Create a New Role</h1>
          </div>
          <p className="text-gray-500">Define the ideal candidate so the AI knows what to screen for.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input required type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Senior Frontend Engineer" onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Engineering" onChange={(e) => setFormData({...formData, department: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Umurava AI" onChange={(e) => setFormData({...formData, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Kigali, Rwanda (Remote)" onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" onChange={(e) => setFormData({...formData, employmentType: e.target.value})}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range (Optional)</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. $80k - $120k / year" onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Job Description</label>
             <textarea required rows={4} className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="Briefly describe the role..." onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Key Requirements (Comma Separated)</label>
             <textarea required rows={3} className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Bachelor's Degree, 5+ years React, Agile experience" onChange={(e) => setFormData({...formData, requirements: e.target.value})}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Skills</label>
              <input required type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. React, Next.js" onChange={(e) => setFormData({...formData, skills: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Closing Date (Optional)</label>
              <input type="date" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.expirationDate} onChange={(e) => setFormData({...formData, expirationDate: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t border-[var(--border)]">
             <div className="flex items-center space-x-2 text-primary-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <h3 className="text-sm font-black uppercase tracking-widest">AI Context / Recruiter Blueprint</h3>
             </div>
             <p className="text-xs text-gray-400 mb-4 font-medium italic">Describe the ideal persona or critical deal-breakers. The Gemini model will use this exact context to evaluate candidates.</p>
             <textarea rows={3} className="w-full px-4 py-3 border border-primary-200 dark:border-primary-900 rounded-xl bg-primary-50/10 focus:ring-2 focus:ring-primary-500/30" placeholder="e.g. Prioritize candidates with public GitHub contributions. High emphasis on cultural match for startup environment. Ignore candidates without specifically Node.js experience." onChange={(e) => setFormData({...formData, aiBlueprint: e.target.value})}></textarea>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button type="submit" disabled={isLoading} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md disabled:opacity-75">
              <CheckCircle className="w-5 h-5" />
              <span>{isLoading ? 'Creating Role...' : 'Publish Job Post'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
