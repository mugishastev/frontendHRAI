'use client'

import DashboardLayout from '@/components/DashboardLayout';
import JobCard from '@/components/JobCard';
import { useGetJobsQuery, useDeleteJobMutation } from '@/store/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Edit, Trash2, PlusCircle, Search } from 'lucide-react';

export default function ManageJobsPage() {
  const router = useRouter();
  const { data: jobs, isLoading } = useGetJobsQuery();
  const [deleteJob] = useDeleteJobMutation();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      await deleteJob(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Manage Jobs</h1>
             <p className="text-gray-500 mt-1">Full control over all hiring active operations.</p>
          </div>
          
          <Link href="/jobs/new" className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 active:scale-95">
            <PlusCircle className="w-5 h-5" />
            <span>Create New Role</span>
          </Link>
        </header>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] shadow-sm overflow-hidden">
           <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
             <div className="relative flex items-center border border-[var(--border)] rounded-xl bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
               <Search className="w-4 h-4 ml-4 text-gray-400" />
               <input type="text" placeholder="Search roles..." className="pl-3 pr-6 py-3 bg-transparent focus:outline-none text-sm w-64 font-medium" />
             </div>
           </div>

           {isLoading ? (
             <div className="p-20 text-center animate-pulse text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Job Operations...</div>
           ) : jobs?.length === 0 ? (
             <div className="p-24 text-center text-gray-500 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                 <Briefcase className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="font-black text-xl text-gray-900 dark:text-gray-100">No Jobs Found</h3>
               <p className="max-w-xs mt-2">Create your first job posting to see it here.</p>
             </div>
           ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
              {jobs?.map((job) => (
                <JobCard 
                  key={job._id} 
                  job={job} 
                  onEdit={(id) => router.push(`/jobs/${id}/edit`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
           )}
        </div>
      </div>
    </DashboardLayout>
  );
}
