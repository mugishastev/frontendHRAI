'use client'

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  href?: string;
}

export default function Logo({ className = "", iconOnly = false, href }: LogoProps) {
  const content = (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:rotate-6 transition-transform">
        <Sparkles className="w-6 h-6" />
      </div>
      {!iconOnly && (
        <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
          HRAI <span className="text-primary-600 font-black">AI</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
