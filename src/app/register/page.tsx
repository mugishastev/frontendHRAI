'use client'

import { useRegisterMutation } from '@/store/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, Mail, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'applicant' | 'recruiter'>('applicant');
  const [errorStr, setErrorStr] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStr('');
    
    if (password !== confirmPassword) {
      return setErrorStr('Passwords do not match.');
    }

    try {
      await register({ email, password, role }).unwrap();
      router.push(`/verify-email?email=${encodeURIComponent(email)}`); 
    } catch (err: any) {
      setErrorStr(err?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
         {/* Back Button */}
         <button 
           onClick={() => router.back()} 
           className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-20 group"
           aria-label="Go back"
         >
           <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" />
         </button>

         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-[100px] -mr-8 -mt-8"></div>

         <Logo className="mb-8 relative z-10 pt-4" href="/careers" />

         <div className="space-y-2 mb-6 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary-600" />
              Create Account
            </h2>
            <p className="text-sm text-gray-500">Join the talent community or manage hiring operations.</p>
         </div>

         {/* Role Toggle */}
         <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-8 relative z-10">
           <button 
             onClick={() => setRole('applicant')}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'applicant' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400'}`}
           >
             Applicant
           </button>
           <button 
             onClick={() => setRole('recruiter')}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === 'recruiter' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400'}`}
           >
             Recruiter
           </button>
         </div>

         <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            {errorStr && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{errorStr}</div>
            )}

            <div className="space-y-4">
               <div className="relative">
                 <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl focus:ring-2 focus:ring-primary-500" 
                   placeholder="Email address"
                 />
               </div>
               <div className="relative">
                 <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl focus:ring-2 focus:ring-primary-500" 
                   placeholder="Create Password"
                 />
               </div>
               <div className="relative">
                 <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                 <input 
                   type="password" 
                   required
                   value={confirmPassword}
                   onChange={e => setConfirmPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-transparent rounded-xl focus:ring-2 focus:ring-primary-500" 
                   placeholder="Confirm Password"
                 />
               </div>
            </div>

            <button disabled={isLoading} className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
               <span>{isLoading ? 'Creating Account...' : `Join as ${role === 'recruiter' ? 'Recruiter' : 'Applicant'}`}</span>
               <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
               <p className="text-sm text-gray-500">
                 Already have an account? {' '}
                 <button type="button" onClick={() => router.push('/login')} className="font-bold text-primary-600 hover:underline">
                   Sign In
                 </button>
               </p>
            </div>
         </form>
      </div>
    </div>
  );
}
