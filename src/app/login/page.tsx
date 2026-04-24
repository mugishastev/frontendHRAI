'use client'

import { useLoginMutation } from '@/store/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const [email, setEmail] = useState('admin@umurava.ai');
  const [password, setPassword] = useState('admin123');
  const [errorStr, setErrorStr] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStr('');
    try {
      const response = await login({ email, password }).unwrap();
      localStorage.setItem('umurava_token', response.token);
      localStorage.setItem('umurava_role', response.user.role);
      localStorage.setItem('umurava_email', response.user.email || email);
      
      const role = response.user.role;
      if (role === 'admin' || role === 'recruiter') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setErrorStr('Invalid email or password.');
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

         {/* Decorative Element */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-[100px] -mr-8 -mt-8"></div>

         <Logo className="mb-8 relative z-10 pt-4" href="/careers" />

         <div className="space-y-2 mb-8 relative z-10">
            <h2 className="text-xl font-bold">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to the HR/Admin control center.</p>
         </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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
                   placeholder="Password"
                 />
               </div>
               <div className="flex justify-end">
                  <button type="button" onClick={() => router.push('/forgot-password')} className="text-xs font-bold text-primary-600 hover:text-primary-500">
                    Forgot Password?
                  </button>
               </div>
            </div>

            <button disabled={isLoading} className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
               <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
               <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 my-6">
               <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
               <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1" />
            </div>

            <button type="button" onClick={() => alert('Redirecting to Google OAuth...')} className="w-full flex justify-center items-center gap-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold bg-white dark:bg-transparent hover:bg-gray-50 transition-all">
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
               </svg>
               <span>Google</span>
            </button>

            <div className="text-center">
               <p className="text-sm text-gray-500">
                 Don't have an account? {' '}
                 <button type="button" onClick={() => router.push('/register')} className="font-bold text-primary-600 hover:underline">
                   Create Account
                 </button>
               </p>
            </div>
         </form>
      </div>
    </div>
  );
}
