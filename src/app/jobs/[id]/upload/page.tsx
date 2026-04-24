'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useBulkUploadApplicantsMutation } from '@/store/api';
import { useParams, useRouter } from 'next/navigation';
import { useState, use, useRef } from 'react';
import { UploadCloud, CheckCircle, FileText, AlertCircle, Trash2, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

export default function UploadCandidatePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const jobId = params.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [bulkUpload, { isLoading }] = useBulkUploadApplicantsMutation();
  const [jsonInput, setJsonInput] = useState('[\n  {\n    "name": "Jane Doe",\n    "email": "jane@example.com",\n    "skills": ["React", "Typescript", "Node.js"],\n    "experience": "4 Years",\n    "education": "BSc Computer Science",\n    "structuredProfile": { "linkedin": "linked.com/in/jane", "github": "github.com/jane" }\n  }\n]');
  const [uploadMode, setUploadMode] = useState<'json' | 'csv'>('json');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => {
           // Basic mapping of common CSV headers to our schema
           return {
             name: row.name || row['Full Name'] || row.Name,
             email: row.email || row.Email || row['Email Address'],
             phone: row.phone || row.Phone || row['Phone Number'] || 'N/A',
             skills: row.skills ? row.skills.split(',').map((s: string) => s.trim()) : [],
             experience: row.experience || row.Experience || row['Years of Experience'],
             resumeUrl: row.resumeUrl || row.Resume || row['Resume URL'],
             structuredProfile: { ...row } // Keep all data in structured profile
           };
        });
        setJsonInput(JSON.stringify(data, null, 2));
        setUploadMode('json'); // Switch to editor to let user review
      },
      error: (err) => {
        setError("Failed to parse CSV file: " + err.message);
      }
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const applicants = JSON.parse(jsonInput);
      if (!Array.isArray(applicants)) throw new Error("Must be an array of applicants");
      
      await bulkUpload({ jobId, applicants }).unwrap();
      router.push(`/jobs/${jobId}`);
    } catch (error: any) {
      setError(error.message || 'Invalid JSON format or Upload failed.');
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Ingest Candidates</h1>
                  <p className="text-sm text-gray-500">Bulk import talent profiles for AI screening.</p>
                </div>
           </div>
           
           <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
             <button 
               onClick={() => setUploadMode('json')}
               className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMode === 'json' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400'}`}
             >
               JSON Editor
             </button>
             <button 
               onClick={() => setUploadMode('csv')}
               className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${uploadMode === 'csv' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-400'}`}
             >
               CSV Upload
             </button>
           </div>
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
             <form onSubmit={handleUpload} className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] shadow-sm overflow-hidden flex flex-col h-[600px]">
                <div className="p-4 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Payload Editor</span>
                  </div>
                  <button type="button" onClick={() => setJsonInput('[]')} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <textarea 
                  required 
                  className="flex-1 w-full px-6 py-6 font-mono text-sm border-none bg-transparent focus:ring-0 resize-none outline-none scrollbar-thin" 
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="[{ ... }]"
                ></textarea>

                <div className="p-6 border-t border-[var(--border)] bg-white dark:bg-gray-900 flex justify-between items-center">
                   <p className="text-xs text-gray-400">
                     Tip: The AI performs better when you include `resumeUrl` or `resumeText`.
                   </p>
                   <button type="submit" disabled={isLoading} className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-primary-500/20 disabled:opacity-75">
                     <CheckCircle className="w-5 h-5" />
                     <span>{isLoading ? 'Processing...' : 'Deploy Candidates'}</span>
                   </button>
                </div>
             </form>
           </div>

           <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer bg-white dark:bg-[#1e293b] border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-500 p-8 rounded-[32px] text-center transition-all hover:bg-primary-50/50"
              >
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Upload Spreadsheet</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Support for CSV files. Automatically maps Name, Email, Skills, and Resume URLs.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-[32px] text-white space-y-4">
                 <h4 className="text-sm font-bold flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-primary-400" />
                   Ingestion Rules
                 </h4>
                 <ul className="text-xs space-y-3 text-gray-400">
                   <li className="flex gap-2">
                     <span className="text-primary-500 font-bold">1.</span>
                     Ensure CSV headers include "name" and "email".
                   </li>
                   <li className="flex gap-2">
                     <span className="text-primary-500 font-bold">2.</span>
                     If "resumeUrl" is provided, AI will automatically parse the PDF/DOCX.
                   </li>
                   <li className="flex gap-2">
                     <span className="text-primary-500 font-bold">3.</span>
                     Bulk uploads are limited to 100 candidates per batch.
                   </li>
                 </ul>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
