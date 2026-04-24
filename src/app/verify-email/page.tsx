'use client'

import { useVerifyEmailMutation } from '@/store/api';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import Logo from '@/components/Logo';

import { Suspense } from 'react';

function VerifyEmailContent() {
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [otp, setOtp] = useState('');
  const [errorStr, setErrorStr] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStr('');
    try {
      const response = await verifyEmail({ email, otp }).unwrap();
      localStorage.setItem('umurava_token', response.token);
      localStorage.setItem('umurava_role', response.user.role);
      localStorage.setItem('umurava_email', response.user.email);
      router.push('/applicants/dashboard');
    } catch (err: any) {
      setErrorStr(err?.data?.error || 'Verification failed. Check your OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-[100px] -mr-8 -mt-8"></div>

         <Logo className="mb-8 relative z-10" href="/careers" />

         <div className="space-y-2 mb-8 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" />
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-500">We've sent a 6-digit OTP to <span className="font-bold text-gray-900 dark:text-white">{email}</span></p>
         </div>

         <form onSubmit={handleVerify} className="space-y-6 relative z-10">
            {errorStr && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{errorStr}</div>
            )}

            <div className="space-y-4">
               <div className="relative">
                 <input 
                   type="text" 
                   required
                   maxLength={6}
                   value={otp}
                   onChange={e => setOtp(e.target.value)}
                   className="w-full px-4 py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 bg-transparent rounded-2xl focus:border-primary-500 focus:ring-0 text-center text-3xl font-black tracking-[0.5em] transition-all" 
                   placeholder="000000"
                 />
               </div>
            </div>

            <button disabled={isLoading} className="w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-xl shadow-primary-500/20">
               <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
               <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
               <p className="text-xs text-gray-400">Didn't receive code? <button type="button" className="text-primary-600 font-bold hover:underline">Resend</button></p>
               <button type="button" onClick={() => router.push('/login')} className="text-sm font-bold text-gray-500 hover:text-primary-600">
                 Back to Sign In
               </button>
            </div>
         </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
