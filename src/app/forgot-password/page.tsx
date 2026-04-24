'use client'

import { useForgotPasswordMutation } from '@/store/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, ArrowRight, KeyRound } from 'lucide-react';
import Logo from '@/components/Logo';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorStr, setErrorStr] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStr('');
    setMessage('');
    try {
      await forgotPassword({ email }).unwrap();
      setMessage('A reset OTP has been sent to your email.');
    } catch (err: any) {
      setErrorStr(err?.data?.error || 'Failed to initiate recovery.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-[100px] -mr-8 -mt-8"></div>

         <Logo className="mb-8 relative z-10" href="/careers" />

         <div className="space-y-2 mb-8 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary-600" />
              Reset Password
            </h2>
            <p className="text-sm text-gray-500">Enter your email to receive a recovery OTP.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {errorStr && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{errorStr}</div>
            )}
            {message && (
               <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100">{message}</div>
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
            </div>

            <button disabled={isLoading} className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
               <span>{isLoading ? 'Sending OTP...' : 'Send Recovery OTP'}</span>
               <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
               <button type="button" onClick={() => router.push('/login')} className="text-sm font-bold text-primary-600 hover:underline">
                 Back to Sign In
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}
