'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetJobsQuery, useUpdateJobMutation } from '@/store/api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { Edit3, CheckCircle } from 'lucide-react';

export default function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const jobId = params.id;
  const router = useRouter();
  
  const { data: jobs, isLoading: isFetching } = useGetJobsQuery();
  const [updateJob, { isLoading }] = useUpdateJobMutation();
  
  const jobToEdit = jobs?.find(j => String(j._id) === jobId);

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
  });

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || '',
        department: jobToEdit.department || '',
        company: jobToEdit.company || '',
        location: jobToEdit.location || '',
        employmentType: jobToEdit.employmentType || 'Full-time',
        salaryRange: jobToEdit.salaryRange || '',
        description: jobToEdit.description || '',
        requirements: jobToEdit.requirements?.join(', ') || '',
        skills: jobToEdit.skills?.join(', ') || '',
        experienceLevel: jobToEdit.experienceLevel || 'Mid-Level',
        expirationDate: jobToEdit.expirationDate ? new Date(jobToEdit.expirationDate).toISOString().split('T')[0] : '',
      });
    }
  }, [jobToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requirements: formData.requirements.split(',').map(s => s.trim()),
        skills: formData.skills.split(',').map(s => s.trim()),
        expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
      };
      await updateJob({ id: jobId, body: payload }).unwrap();
      router.push('/manage-jobs');
    } catch (error: any) {
      const msg = error?.data?.error || error?.message || 'Unknown error occurred';
      console.error('Failed to update job:', error);
      alert(`Failed to update job: ${msg}`);
    }
  };

  if (isFetching || !jobToEdit) return <DashboardLayout><div className="p-8">Loading Job...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <header>
          <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
               <Edit3 className="w-5 h-5" />
             </div>
             <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
          </div>
          <p className="text-gray-500">Make changes to the live role parameters.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input required type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Senior Frontend Engineer" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Engineering" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Umurava AI" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. Kigali, Rwanda (Remote)" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range (Optional)</label>
              <input type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" placeholder="e.g. $80k - $120k / year" value={formData.salaryRange} onChange={(e) => setFormData({...formData, salaryRange: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Job Description</label>
             <textarea required rows={4} className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium">Key Requirements (Comma Separated)</label>
             <textarea required rows={3} className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})}></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Skills</label>
              <input required type="text" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} />
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

          <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-4">
            <button type="button" onClick={() => router.push('/manage-jobs')} className="px-6 py-3 font-medium text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md disabled:opacity-75">
              <CheckCircle className="w-5 h-5" />
              <span>{isLoading ? 'Saving Changes...' : 'Save Updates'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
