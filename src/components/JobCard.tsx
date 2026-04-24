import Link from 'next/link';
import { Edit, Trash2, ArrowRight, Eye } from 'lucide-react';

export default function JobCard({ job, onEdit, onDelete }: { job: any, onEdit?: (id: string) => void, onDelete?: (id: string) => void }) {
    return (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-lg transition-all group relative">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{job.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{job.department || 'Engineering'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
              Active
            </span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/jobs/${job._id || job.id}`} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="View Details">
                  <Eye className="w-3.5 h-3.5" />
                </Link>
                {onEdit && (
                    <button onClick={() => onEdit(job._id)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="Edit Role"><Edit className="w-3.5 h-3.5" /></button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(job._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete Role"><Trash2 className="w-3.5 h-3.5" /></button>
                )}
            </div>
          </div>
        </div>
        
        <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-400 mb-4 h-10">
          {job.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {job.skills?.slice(0, 3).map((skill: string) => (
            <span key={skill} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md font-medium">
              {skill}
            </span>
          ))}
          {job.skills?.length > 3 && (
             <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md">+{job.skills.length - 3}</span>
          )}
        </div>
        
        <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center text-sm">
           <span className="text-gray-400 text-xs font-medium">{new Date(job.createdAt).toLocaleDateString()}</span>
           <Link href={`/jobs/${job._id || job.id}`} className="text-primary-600 hover:text-primary-500 font-bold text-xs flex items-center gap-1 transition-all">
              MANAGE <ArrowRight className="w-3.5 h-3.5" />
           </Link>
        </div>
      </div>
    );
}
