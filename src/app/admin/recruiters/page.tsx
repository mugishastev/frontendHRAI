'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetUsersQuery, useCreateRecruiterMutation, useDeleteRecruiterMutation } from '@/store/api';
import { Users, Trash2, PlusCircle, ShieldCheck, User, X, Eye } from 'lucide-react';
import { useState } from 'react';

export default function UserManagementPage() {
  const { data: users, isLoading } = useGetUsersQuery();
  const [createRecruiter, { isLoading: isCreating }] = useCreateRecruiterMutation();
  const [deleteRecruiter] = useDeleteRecruiterMutation();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'recruiter' });
  const [formError, setFormError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await createRecruiter(formData).unwrap();
      setFormData({ email: '', password: '', role: 'recruiter' });
      setShowForm(false);
    } catch (err: any) {
      setFormError(err?.data?.error || 'Failed to create account');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete account "${email}"? This is permanent.`)) return;
    await deleteRecruiter(id);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600"><Users className="w-5 h-5" /></div>
              <h1 className="text-3xl font-bold">User Management</h1>
            </div>
            <p className="text-gray-500">View and manage all platform users (Admins, Recruiters, and Applicants).</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-md transition-all"
          >
            {showForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Recruiter/Admin'}
          </button>
        </header>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <h2 className="font-bold text-lg">New Platform User</h2>
            {formError && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{formError}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[var(--border)] pb-6">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input required type="email" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500/50 outline-none" placeholder="recruiter@umurava.ai"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <input required type="password" className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500/50 outline-none" placeholder="Min. 8 characters"
                  minLength={8} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            <div className="space-y-4">
               <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Role & Permissions</label>
               <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <select className="w-full px-4 py-2 border border-[var(--border)] rounded-lg bg-transparent" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="recruiter">Standard Recruiter</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                  <div className="flex-[2] flex flex-wrap gap-3">
                     {[
                       { id: 'manage_jobs', label: 'Manage Jobs' },
                       { id: 'run_screening', label: 'Screen Talent' },
                       { id: 'view_analytics', label: 'View Insights' },
                       { id: 'delete_data', label: 'Delete Allowed' }
                     ].map(p => (
                       <label key={p.id} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-[var(--border)] cursor-pointer hover:border-primary-500 transition-colors">
                         <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                         <span className="text-xs font-semibold">{p.label}</span>
                       </label>
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isCreating} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-60">
                <PlusCircle className="w-4 h-4" />
                {isCreating ? 'Creating...' : 'Grant Access & Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[var(--border)] bg-gray-50/50 dark:bg-gray-900/30 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">All Platform Users</h2>
              <p className="text-sm text-gray-500">{users?.length ?? 0} accounts total</p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-gray-400 animate-pulse">Loading accounts...</div>
          ) : users?.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-4 opacity-40" />
              <p>No user accounts found. Add one above.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-gray-500 bg-gray-50/30 dark:bg-gray-800/20">
                  <th className="px-6 py-3 font-bold">User</th>
                  <th className="px-6 py-3 font-bold">Role</th>
                  <th className="px-6 py-3 font-bold">Active Permissions</th>
                  <th className="px-6 py-3 font-bold">Created</th>
                  <th className="px-6 py-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users?.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${user.role === 'admin' ? 'bg-gradient-to-tr from-primary-600 to-primary-400' : 'bg-gradient-to-tr from-blue-600 to-cyan-400'}`}>
                          {user.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        user.role === 'admin' 
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' 
                          : user.role === 'recruiter'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-wrap gap-1">
                          {user.role === 'admin' ? (
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Full System Access</span>
                          ) : (
                            user.permissions?.map((p: string) => (
                              <span key={p} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-500 border border-[var(--border)] uppercase">
                                {p.replace(/_/g, ' ')}
                              </span>
                            ))
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                      <button
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 transition-colors"
                        title="View Detailed Access"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.email)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
