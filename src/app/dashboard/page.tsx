'use client'

import DashboardLayout from '@/components/DashboardLayout';
import JobCard from '@/components/JobCard';
import { useGetJobsQuery, useGetStatsQuery } from '@/store/api';
import { useState, useEffect } from 'react';
import { PlusCircle, Search, Briefcase, Users, CheckCircle, Brain, Target } from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboard() {
  const { data: jobs, isLoading: jobsLoading, error } = useGetJobsQuery();
  const { data: stats } = useGetStatsQuery();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('umurava_role'));
  }, []);

  const isAdmin = role === 'admin';

  // Mock data for the chart if stats haven't loaded yet
  const chartData = stats?.applicationsOverTime || [
    { date: 'Mon', count: 0 },
    { date: 'Tue', count: 0 },
    { date: 'Wed', count: 0 },
    { date: 'Thu', count: 0 },
    { date: 'Fri', count: 0 },
    { date: 'Sat', count: 0 },
    { date: 'Sun', count: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              {isAdmin ? 'System Intelligence Center' : 'Recruiter Command Center'}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              {isAdmin ? 'Monitoring global talent flow and platform performance.' : 'Orchestrate your hiring pipeline with AI precision.'}
            </p>
          </div>
          
          <Link href="/jobs/new" className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary-500/25 active:scale-95">
            <PlusCircle className="w-5 h-5" />
            <span>Create New Role</span>
          </Link>
        </header>

        {/* 5 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
           <StatCard 
             title="Active Jobs" 
             value={stats?.totalJobs ?? 0} 
             trend="+2 this week" 
             icon={<Briefcase className="w-5 h-5" />} 
             color="blue"
           />
           <StatCard 
             title="Total Talent" 
             value={stats?.totalCandidates ?? 0} 
             trend="Profiles Ingested" 
             icon={<Users className="w-5 h-5" />} 
             color="indigo"
           />
           <StatCard 
             title="AI Shortlisted" 
             value={stats?.shortlistedCandidates ?? 0} 
             trend="Top Tier Matches" 
             icon={<Target className="w-5 h-5" />} 
             color="emerald"
           />
           <StatCard 
             title="Screenings" 
             value={stats?.completedScreenings ?? 0} 
             trend="Gemini Powered" 
             icon={<Brain className="w-5 h-5" />} 
             color="purple"
           />
           <StatCard 
             title="Active Users" 
             value={stats?.totalUsers ?? 0} 
             trend="Admin & Recruiters" 
             icon={<CheckCircle className="w-5 h-5" />} 
             color="orange"
           />
        </div>

        {/* Analytics Section - THE GRAPH */}
        <div className="glass p-8 rounded-[32px] border border-white/20 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Brain className="w-32 h-32 text-primary-500" />
           </div>
           
           <div className="flex justify-between items-end mb-8 relative z-10">
              <div>
                 <h2 className="text-2xl font-bold">Application Ingestion Trends</h2>
                 <p className="text-gray-500 text-sm">Volume of new candidate profiles tracked over the last 7 days.</p>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-100">
                 Real-time Analytics
              </div>
           </div>

           <div className="h-[300px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorShort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    itemStyle={{fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    name="Total Applied"
                    stroke="#4f46e5" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="shortlisted" 
                    name="AI Shortlisted"
                    stroke="#10b981" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorShort)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h2 className="text-2xl font-bold">Active Hiring Roles</h2>
                <p className="text-gray-500 text-sm">Select a role to manage applicants or trigger AI screening.</p>
             </div>
             <div className="relative border border-[var(--border)] rounded-2xl bg-[var(--card)] focus-within:ring-4 focus-within:ring-primary-500/10 flex transition-all w-full sm:w-80">
                <Search className="w-4 h-4 ml-4 self-center text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter by job title or department..." 
                  className="pl-3 pr-4 py-3 bg-transparent focus:outline-none text-sm w-full"
                />
             </div>
          </div>

          {jobsLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-[var(--card)] animate-pulse rounded-[24px] border border-[var(--border)]"></div>)}
             </div>
          ) : error ? (
             <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 text-red-500 rounded-[32px] border border-red-200 dark:border-red-800">
               <h3 className="text-xl font-bold mb-2">Connectivity Error</h3>
               <p>Failed to load data from the HRAI Intelligence API. Please check your backend status.</p>
             </div>
          ) : jobs?.length === 0 ? (
             <div className="p-20 text-center bg-[var(--card)] border border-[var(--border)] rounded-[40px] flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                 <Briefcase className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-2xl font-bold mb-2">No Active Roles Found</h3>
               <p className="text-gray-500 max-w-md mx-auto">It looks like you haven't posted any jobs yet. Create your first role to start screening talent with Gemini AI.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {jobs?.map((job: any) => (
                <JobCard key={job._id || job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, trend, icon, color }: { title: string, value: string | number, trend: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: 'bg-blue-500/10 text-blue-600',
    indigo: 'bg-indigo-500/10 text-indigo-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    purple: 'bg-purple-500/10 text-purple-600',
    orange: 'bg-orange-500/10 text-orange-600',
  };

  return (
    <div className="glass p-6 rounded-[24px] border border-white/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue}`}>
           {icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-primary-500 transition-colors">
          Real-time
        </div>
      </div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</h3>
      <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">{value}</div>
      <div className="flex items-center space-x-1">
         <div className="w-1 h-1 rounded-full bg-primary-500 animate-pulse"></div>
         <span className="text-[10px] text-gray-500 font-medium">{trend}</span>
      </div>
    </div>
  );
}
