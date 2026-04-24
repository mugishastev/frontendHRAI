'use client'

import PublicLayout from '@/components/PublicLayout';
import { useGetJobsQuery } from '@/store/api';
import Link from 'next/link';
import { Briefcase, ArrowRight, MapPin, Clock, Bookmark, Building, DollarSign, Search, Filter, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: jobs, isLoading } = useGetJobsQuery();

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === 'All' || job.department === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(jobs?.map(j => j.department).filter(Boolean) as string[])];

  return (
    <PublicLayout>
      {/* 🏠 Hero Portal Section */}
      <div className="bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-[var(--background)] py-24 px-8 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest animate-bounce">
            <Sparkles className="w-4 h-4" /> Official Career Portal
          </div>
          <h1 className="text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Build The Future of <br/> <span className="text-primary-600 font-black">AI Recruitment</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
            Browse active roles at Umurava. Log in to your candidate account to apply and track your screenings in real-time.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-2xl border border-[var(--border)] max-w-3xl mx-auto mt-12">
             <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Find your next challenge..." 
                  className="w-full bg-transparent border-none focus:ring-0 py-4 text-lg font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl w-full md:w-auto">
               Search Jobs
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-8 no-scrollbar">
           {categories.map(cat => (
             <button 
               key={cat}
               onClick={() => setActiveFilter(cat)}
               className={`px-6 py-2.5 rounded-full text-sm font-black whitespace-nowrap transition-all border ${
                 activeFilter === cat 
                 ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' 
                 : 'bg-white dark:bg-gray-900 border-[var(--border)] text-gray-500 hover:border-primary-500'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        <div className="flex items-center justify-between mb-8">
           <h2 className="text-2xl font-black flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary-500" />
              Available Opportunities ({filteredJobs?.length || 0})
           </h2>
        </div>

        {isLoading ? (
          <div className="space-y-6">
             {[1,2,3].map(i => <div key={i} className="h-40 bg-[var(--card)] animate-pulse rounded-3xl border border-[var(--border)] w-full"></div>)}
          </div>
        ) : filteredJobs?.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-[var(--border)] rounded-[40px] bg-gray-50/50 dark:bg-gray-900/10">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">No jobs found</h3>
          </div>
        ) : (
          <div className="space-y-6">
             {filteredJobs?.map((job: any) => {
                const isClosed = job.expirationDate ? new Date(job.expirationDate) < new Date() : false;
                
                return (
                  <div key={job._id} className={`group bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[32px] p-8 transition-all relative overflow-hidden ${isClosed ? 'opacity-70' : 'hover:border-primary-400 hover:shadow-xl'}`}>
                     <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                        <div className="flex-1 space-y-6">
                           <div>
                             <Link href={`/careers/${job._id}`} className={`text-3xl font-black transition-colors ${isClosed ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white hover:text-primary-600'}`}>
                               {job.title}
                             </Link>
                             <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide">
                               <span className="flex items-center gap-2"><Building className="w-4 h-4 text-primary-500" /> {job.company || 'Umurava AI'}</span>
                               <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-500" /> {job.location || 'Remote'}</span>
                               <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary-500" /> {job.employmentType || 'Full-time'}</span>
                             </div>
                           </div>
                           <p className="text-gray-500 font-medium line-clamp-2">
                             {job.description}
                           </p>
                        </div>
                        
                        <div className="flex flex-col items-start md:items-end gap-6 min-w-[200px]">
                           <Link 
                             href={`/careers/${job._id}`} 
                             className={`w-full flex justify-center items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${isClosed ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-xl'}`}
                           >
                             <span>Apply Now</span>
                             <ArrowRight className="w-5 h-5" />
                           </Link>
                        </div>
                     </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
