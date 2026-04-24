'use client'

import Sidebar from './Sidebar';
import { Bell, Search, User, ChevronRight, X, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useSearchJobsQuery } from '@/store/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: notifications, isLoading: isNoteLoading } = useGetNotificationsQuery(userRole);
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const { data: searchResults, isFetching: isSearching } = useSearchJobsQuery(searchTerm, { skip: searchTerm.length < 2 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('umurava_token');
    const email = localStorage.getItem('umurava_email') || 'User';
    const role = localStorage.getItem('umurava_role');
    
    if (!token) {
      router.push('/login');
      return;
    }

    setUserEmail(email);
    setUserRole(role);
    setIsReady(true);
  }, [router]);

  if (!isReady) return null; // Strict Guard: No rendering until auth is verified

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(p => p);
    if (paths.length === 0) return [{ label: 'Dashboard', href: '/' }];
    
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      const label = path
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = userEmail ? userEmail.split('@')[0].substring(0, 2).toUpperCase() : 'HR';
  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
        
        {/* Dynamic Top Header */}
        <header className="h-16 border-b border-[var(--border)] bg-white dark:bg-[#0f172a] flex items-center justify-between px-6 flex-shrink-0 z-20">
           <div className="flex items-center space-x-2 text-sm font-medium">
             <span className="text-gray-400">Control Center</span>
             {breadcrumbs.map((bc, idx) => (
               <div key={idx} className="flex items-center space-x-2">
                 <ChevronRight className="w-3 h-3 text-gray-300" />
                 <span className={idx === breadcrumbs.length - 1 ? "text-primary-600 font-bold" : "text-gray-500"}>
                   {bc.label}
                 </span>
               </div>
             ))}
           </div>

           <div className="flex items-center space-x-5 text-gray-400">
              <div className="relative group hidden sm:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Universal Search..." 
                  className="pl-9 pr-9 py-1.5 bg-gray-50 dark:bg-gray-800 border-[var(--border)] border rounded-full text-xs focus:ring-2 focus:ring-primary-500/50 w-48 lg:w-64 transition-all"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {searchTerm.length >= 2 && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1e293b] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
                      <span>Live Results</span>
                      {isSearching && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults?.length === 0 ? (
                        <p className="p-4 text-xs text-center text-gray-500">No matches found</p>
                      ) : (
                        searchResults?.map((job: any) => (
                          <div 
                            key={job._id} 
                            onClick={() => { router.push(`/jobs/${job._id}`); setSearchTerm(''); }}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-[var(--border)] last:border-0 transition-colors"
                          >
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{job.title}</p>
                            <p className="text-[10px] text-gray-500 uppercase">{job.department}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1e293b] border border-[var(--border)] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <span className="font-bold text-sm">Notifications ({unreadCount})</span>
                        <button onClick={() => markAllRead()} className="text-[10px] text-primary-600 font-bold uppercase tracking-wider hover:underline">Mark all as read</button>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications?.length === 0 ? (
                          <div className="p-10 text-center opacity-40">
                            <Bell className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications?.map((note: any) => (
                            <NotificationItem 
                              key={note._id}
                              title={note.title} 
                              desc={note.desc}
                              time={new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              badge={note.type === 'success' ? 'bg-green-500' : note.type === 'error' ? 'bg-red-500' : 'bg-primary-500'}
                              isRead={note.isRead}
                            />
                          ))
                        )}
                        <div className="p-3 text-center border-t border-[var(--border)]">
                          <button className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors">View All Notifications</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-3 border-l border-[var(--border)] pl-5">
                <div className="flex flex-col items-end hidden lg:flex">
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{userEmail}</span>
                  <span className="text-[10px] text-primary-600 font-black uppercase tracking-widest">Active Access</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-xs shadow-lg border-2 border-white dark:border-gray-800">
                   {initials}
                </div>
              </div>
           </div>
        </header>

        {/* Dynamic Outlet Body */}
        <main className="flex-1 overflow-y-auto w-full bg-[#f8fafc] dark:bg-[#0f172a]">
          {children}
        </main>

      </div>
    </div>
  );
}

function NotificationItem({ title, desc, time, badge, isRead }: { title: string, desc: string, time: string, badge: string, isRead: boolean }) {
  return (
    <div className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-[var(--border)] last:border-0 cursor-pointer group ${!isRead ? 'bg-primary-500/5' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className={`w-2 h-2 mt-1.5 rounded-full ${badge} flex-shrink-0 group-hover:scale-125 transition-transform ${!isRead ? 'animate-pulse' : 'opacity-40'}`}></div>
        <div className="flex-1 space-y-0.5">
          <p className={`text-sm leading-none ${!isRead ? 'font-black text-gray-900 dark:text-gray-100' : 'font-bold text-gray-500'}`}>{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{desc}</p>
          <p className="text-[10px] text-gray-400 font-medium pt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}
