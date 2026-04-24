'use client'

import PublicLayout from '@/components/PublicLayout';
import { useGetJobsQuery } from '@/store/api';
import Link from 'next/link';
import { 
  Briefcase, ArrowRight, MapPin, Clock, Search, Filter, 
  Sparkles, Building, Globe, Layers, List, LayoutGrid
} from 'lucide-react';
import { useState } from 'react';

export default function CareersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
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
      {/* 🏠 Header */}
      <div className="bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-[var(--background)] py-20 px-8 border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Join the AI Revolution
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            Explore <span className="text-primary-600">Open Roles</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium">
            Discover opportunities across Engineering, Design, and Product. Let our AI find your perfect match.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-[24px] shadow-xl border border-[var(--border)] max-w-2xl mx-auto mt-8">
             <div className="flex-1 flex items-center px-4 w-full">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full bg-transparent border-none focus:ring-0 py-3 text-base font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto">
               Search
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Filters & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            activeFilter === cat 
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' 
                            : 'bg-white dark:bg-gray-900 border-[var(--border)] text-gray-500 hover:border-primary-500'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-[var(--border)] self-start md:self-center">
                <button 
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-400'}`}
                >
                    <List className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600' : 'text-gray-400'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
            </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
             {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-[var(--card)] animate-pulse rounded-2xl border border-[var(--border)] w-full"></div>)}
          </div>
        ) : filteredJobs?.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-[32px] bg-gray-50/30">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No jobs match your search</h3>
            <p className="text-gray-500 mt-2">Try different keywords or browse all categories.</p>
          </div>
        ) : viewMode === 'table' ? (
          /* 📋 TABLE VIEW (New Requested Layout) */
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-[var(--border)]">
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Position</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Department</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Location</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Date</th>
                    <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredJobs?.map((job: any) => (
                    <tr key={job._id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                           <Link href={`/careers/${job._id}`} className="font-black text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors text-lg mb-1">
                             {job.title}
                           </Link>
                           <span className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-tight">
                              <Building className="w-3.5 h-3.5" /> {job.company || 'Umurava AI'}
                           </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            <Layers className="w-4 h-4 text-primary-500" /> {job.department || 'General'}
                         </span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                                <Globe className="w-4 h-4 text-indigo-500" /> {job.location || 'Remote'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{job.employmentType || 'Full-time'}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-sm font-bold text-gray-500 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-400" /> {new Date(job.createdAt).toLocaleDateString()}
                         </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <Link 
                           href={`/careers/${job._id}`} 
                           className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                         >
                           View Details <ArrowRight className="w-4 h-4" />
                         </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* 🗂️ GRID VIEW (4 Columns) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredJobs?.map((job: any) => (
                <div key={job._id} className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[32px] p-6 hover:border-primary-400 transition-all hover:shadow-xl group relative overflow-hidden flex flex-col h-full">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500" />
                   
                   <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                         <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-primary-100 dark:border-primary-900/50">{job.department}</span>
                         <span className="text-[10px] text-gray-400 font-bold">{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary-600 transition-colors">
                        {job.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold uppercase tracking-tight mb-4">
                         <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500" /> {job.location}</span>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-500" /> {job.employmentType}</span>
                      </div>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-grow">
                        {job.description}
                      </p>
                      
                      <div className="pt-4 border-t border-[var(--border)] mt-auto flex items-center justify-between">
                         <span className="text-xs font-bold text-primary-500">{job.salaryRange || 'View Salary'}</span>
                         <Link 
                           href={`/careers/${job._id}`} 
                           className="inline-flex items-center gap-1 text-gray-900 dark:text-white font-black text-xs hover:text-primary-600 transition-all"
                         >
                            APPLY NOW <ArrowRight className="w-3.5 h-3.5" />
                         </Link>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
