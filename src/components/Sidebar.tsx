'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, Briefcase, Users, Settings, Sparkles, BrainCircuit, 
  BarChart3, UserCog, LogOut, ChevronDown, Globe, ScrollText,
  ShieldCheck, Cpu, Database
} from 'lucide-react';

import Logo from './Logo';

interface NavGroupProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function NavGroup({ label, defaultOpen = true, children }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <span>{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      {open && <div className="space-y-1 mt-1">{children}</div>}
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
        active
          ? 'bg-primary-500/10 text-primary-600 font-semibold shadow-sm border border-primary-100 dark:border-primary-900/40'
          : 'hover:bg-[var(--background)] hover:text-primary-500 text-gray-600 dark:text-gray-300'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const role = localStorage.getItem('umurava_role');
    const email = localStorage.getItem('umurava_email') || '';
    if (role === 'admin') setIsAdmin(true);
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('umurava_token');
    localStorage.removeItem('umurava_role');
    localStorage.removeItem('umurava_email');
    router.push('/login');
  };

  if (!isMounted) return null;

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] hidden md:flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <Logo href="/" />
      </div>

      {/* Nav */}
      <div className="flex-1 w-full flex flex-col justify-between overflow-y-auto">
        <nav className="p-4 space-y-6 w-full">

          {/* RECRUITER VIEW (Operational) */}
          {!isAdmin && (
            <>
              <NavGroup label="Recruitment Menu">
                <NavItem href="/dashboard" icon={<Home className="w-4.5 h-4.5" />} label="Dashboard" active={pathname === '/dashboard'} />
                <NavItem href="/manage-jobs" icon={<Briefcase className="w-4.5 h-4.5" />} label="Manage Jobs" active={pathname === '/manage-jobs'} />
                <NavItem href="/shortlist-hub" icon={<ShieldCheck className="w-4.5 h-4.5" />} label="Shortlist Hub" active={pathname === '/shortlist-hub'} />
                <NavItem href="/hiring-crm" icon={<Users className="w-4.5 h-4.5" />} label="Manage Applicants" active={pathname === '/hiring-crm'} />
                <NavItem href="/batch-ops" icon={<Cpu className="w-4.5 h-4.5" />} label="AI Screening" active={pathname === '/batch-ops'} />
              </NavGroup>

              <NavGroup label="Insights & Portal">
                <NavItem href="/insights" icon={<BarChart3 className="w-4.5 h-4.5" />} label="Recruitment Insights" active={pathname === '/insights'} />
                <NavItem href="/careers" icon={<Globe className="w-4.5 h-4.5" />} label="Careers Portal" active={pathname === '/careers'} />
              </NavGroup>
            </>
          )}

          {/* ADMIN VIEW (Governance) */}
          {isAdmin && (
            <>
              <NavGroup label="Platform Oversight">
                <NavItem href="/dashboard" icon={<Home className="w-4.5 h-4.5" />} label="System Dashboard" active={pathname === '/dashboard'} />
                <NavItem href="/shortlist-hub" icon={<ShieldCheck className="w-4.5 h-4.5" />} label="Shortlist Hub" active={pathname === '/shortlist-hub'} />
                <NavItem href="/insights" icon={<BarChart3 className="w-4.5 h-4.5" />} label="Global Analytics" active={pathname === '/insights'} />
                <NavItem href="/batch-ops" icon={<Cpu className="w-4.5 h-4.5" />} label="Bulk Actions" active={pathname === '/batch-ops'} />
              </NavGroup>

              <NavGroup label="User & Role Management">
                <NavItem href="/admin/recruiters" icon={<UserCog className="w-4.5 h-4.5" />} label="Recruiter Accounts" active={pathname === '/admin/recruiters'} />
                <NavItem href="/admin/recruiters" icon={<ShieldCheck className="w-4.5 h-4.5" />} label="Access Control (AD)" active={pathname === '/admin/recruiters#roles'} />
              </NavGroup>

              <NavGroup label="System Control">
                <NavItem href="/settings" icon={<Database className="w-4.5 h-4.5" />} label="Environment Config" active={pathname === '/settings'} />
                <NavItem href="/settings" icon={<BrainCircuit className="w-4.5 h-4.5" />} label="AI Control Center" active={pathname === '/settings#ai'} />
                <NavItem href="/admin/logs" icon={<ScrollText className="w-4.5 h-4.5" />} label="System Admin (Logs)" active={pathname === '/admin/logs'} />
              </NavGroup>
            </>
          )}

        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div
          className="flex items-center justify-between p-2 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer border border-transparent hover:border-[var(--border)]"
          onClick={handleLogout}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${isAdmin ? 'bg-gradient-to-tr from-primary-600 to-primary-400' : 'bg-gradient-to-tr from-blue-600 to-cyan-400'}`}>
              {userEmail ? userEmail[0].toUpperCase() : (isAdmin ? 'AD' : 'RC')}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold truncate text-gray-900 dark:text-gray-100">
                {isAdmin ? 'Platform Admin' : 'Talent Manager'}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {userEmail || 'Active Session'}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 bg-transparent group-hover:bg-red-50 dark:group-hover:bg-red-900/30 group-hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4 translate-x-[1px]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
