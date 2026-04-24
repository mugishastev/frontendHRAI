import Link from 'next/link';
import { Search, Globe, Mail, HelpCircle, Shield, FileText, Share2, MessageSquare, LayoutDashboard, LogOut, User, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { useGetNotificationsQuery } from '@/store/api';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('umurava_role');
    const email = localStorage.getItem('umurava_email');
    if (role && email) setUser({ role, email });
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notifications } = useGetNotificationsQuery(user?.role || null, { skip: !user });
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
      {/* 🏠 Header (Top Bar) */}
      <nav className="border-b border-[var(--border)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo / Branding */}
            <Logo href="/careers" />

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
               <Link href="/careers" className="text-sm font-black text-gray-400 hover:text-primary-600 transition-colors uppercase tracking-widest font-sans">Home</Link>
               <Link href="/careers" className="text-sm font-black text-primary-600 tracking-widest uppercase font-sans">Jobs</Link>
               
               {user?.role === 'applicant' && (
                 <Link href="/applicants/dashboard" className="text-sm font-black text-purple-600 hover:text-purple-500 flex items-center gap-1.5 uppercase tracking-widest font-sans">
                   My Applications
                 </Link>
               )}

               <Link href="#" className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors uppercase tracking-widest font-sans">About</Link>
               
               <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
               
               {user ? (
                 <div className="flex items-center gap-6 relative">
                    {/* Notifications Icon & Dropdown */}
                    <div className="relative group cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell className={`w-5 h-5 transition-colors ${showNotifications ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}`} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 transition-all group-hover:scale-125">
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-[#1e293b] rounded-3xl shadow-2xl border border-[var(--border)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                           <div className="p-4 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Activity Feed</span>
                              {unreadCount > 0 && <span className="text-[9px] bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full font-black uppercase">Recent</span>}
                           </div>
                           <div className="max-h-[350px] overflow-y-auto">
                              {notifications?.length === 0 ? (
                                <div className="p-10 text-center">
                                   <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                      <Bell className="w-6 h-6" />
                                   </div>
                                   <p className="text-xs font-bold text-gray-400 italic">No notifications yet.</p>
                                </div>
                              ) : (
                                notifications?.map((n: any) => (
                                  <div key={n._id} className="p-4 border-b border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-default">
                                     <div className="flex gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : 'bg-primary-500'}`} />
                                        <div className="space-y-1">
                                           <div className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight">{n.title}</div>
                                           <div className="text-[11px] text-gray-500 font-medium leading-relaxed">{n.desc}</div>
                                           <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(n.createdAt).toLocaleTimeString()}</div>
                                        </div>
                                     </div>
                                  </div>
                                ))
                              )}
                           </div>
                           <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 text-center border-t border-[var(--border)]">
                              <button className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-500 transition-colors">Clear All History</button>
                           </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700">
                       <User className="w-3.5 h-3.5 text-primary-500" /> {user.email.split('@')[0]}
                    </div>
                    
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-all hover:rotate-12">
                       <LogOut className="w-5 h-5" />
                    </button>
                 </div>
               ) : (
                 <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-xl shadow-primary-500/10 active:scale-95">
                   Portal Login
                 </Link>
               )}
            </div>

            {/* Mobile/Small Search trigger or Menu can go here, for now keep simple */}
            <button className="md:hidden p-2 text-gray-500"><Search className="w-6 h-6" /></button>
          </div>
        </div>
      </nav>

      {/* 📋 Body (Main Content) */}
      <main className="flex-1 animate-in fade-in duration-500">
        {children}
      </main>

      {/* 📌 Footer (Bottom Bar) */}
      <footer className="bg-white dark:bg-gray-950 border-t border-[var(--border)] py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
           
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-black text-sm">H</div>
                <span className="text-lg font-black dark:text-white">HRAI Platform</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Empowering the next generation of African talent through AI-contextual screening and fair career opportunities.
              </p>
              <div className="pt-4 border-t border-[var(--border)]">
                 <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Dev Team: Sohoza System</h5>
                 <p className="text-[10px] text-gray-500 font-bold">Steven, Musa, Aliance, Mugisha, Nadia</p>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 italic">Quick Explore</h4>
              <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                 <li><Link href="/careers" className="hover:text-primary-600">Open Vacancies</Link></li>
                 <li><Link href="#" className="hover:text-primary-600">AI Screening Logic</Link></li>
                 <li><Link href="#" className="hover:text-primary-600">Talent Testimonials</Link></li>
                 <li><Link href="#" className="hover:text-primary-600">Partner Program</Link></li>
              </ul>
           </div>

           <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 italic">Support & Legal</h4>
              <ul className="space-y-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                 <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> <Link href="#" className="hover:text-primary-600">Privacy Policy</Link></li>
                 <li className="flex items-center gap-2"><FileText className="w-4 h-4" /> <Link href="#" className="hover:text-primary-600">Terms of Service</Link></li>
                 <li className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> <Link href="#" className="hover:text-primary-600">Candidate Help</Link></li>
              </ul>
           </div>

           <div className="space-y-4">
              <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 italic">Get in Touch</h4>
              <p className="text-sm text-gray-500">Have questions about a role?</p>
              <a href="mailto:support@umurava.ai" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-primary-500 transition-colors">
                 <Mail className="w-4 h-4" /> support@umurava.ai
              </a>
           </div>

        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <div>&copy; {new Date().getFullYear()} HRAI Platform | Developed by Sohoza System.</div>
           <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Africa | Remote</div>
        </div>
      </footer>
    </div>
  );
}
