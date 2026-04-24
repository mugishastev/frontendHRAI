'use client'

import React from 'react';
import { CheckCircle2, Circle, Clock, Info } from 'lucide-react';

const stages = [
  { id: 'applied', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'interviewing', label: 'Interview' },
  { id: 'hired', label: 'Offer' }
];

interface Props {
  currentStatus: string;
}

export default function ApplicationTimeline({ currentStatus }: Props) {
  // Map internal statuses to timeline stages
  const statusToStageMap: Record<string, number> = {
    'applied': 0,
    'under_review': 1,
    'shortlisted': 2,
    'interviewing': 3,
    'interview_scheduled': 3,
    'hired': 4,
    'offer': 4,
    'rejected': -1
  };

  const currentIndex = statusToStageMap[currentStatus] ?? 0;
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="w-full py-8 px-4">
      <div className="relative flex items-center justify-between">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 z-0"></div>
        
        {/* Active Progress Line */}
        {!isRejected && (
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 z-0 transition-all duration-500" 
              style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
            ></div>
        )}

        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isRejected && isCurrent ? 'bg-red-500 border-red-200 text-white' :
                  isCompleted ? 'bg-primary-500 border-primary-100 text-white' :
                  isCurrent ? 'bg-white dark:bg-gray-900 border-primary-500 text-primary-600 scale-125 shadow-xl shadow-primary-500/20' :
                  'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
                 isRejected && isCurrent ? <XCircle className="w-5 h-5" /> :
                 <Circle className="w-5 h-5 fill-current" />}
              </div>
              <div className="absolute -bottom-8 w-24 text-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isCurrent ? 'text-primary-600 dark:text-primary-400' : 
                  isRejected && isCurrent ? 'text-red-500' :
                  'text-gray-400'
                }`}>
                  {isRejected && isCurrent ? 'Rejected' : stage.label}
                </span>
              </div>
              
              {isCurrent && !isRejected && (
                  <div className="absolute -top-12 bg-primary-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg animate-bounce shadow-lg shadow-primary-500/30">
                    Current Step
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function XCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
