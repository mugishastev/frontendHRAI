'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useDeleteNotificationMutation } from '@/store/api';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useMemo } from 'react';

export default function NotificationsPage() {
  const role = typeof window !== 'undefined' ? localStorage.getItem('umurava_role') : null;
  const { data: notifications, isLoading, refetch } = useGetNotificationsQuery(role);
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-gray-500">Stay updated with real-time alerts from your recruitment ecosystem.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as Read
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex border-b border-[var(--border)] gap-8">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-4 text-sm font-bold transition-all relative ${filter === 'all' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            All Notifications
            {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`pb-4 text-sm font-bold transition-all relative ${filter === 'unread' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Unread
            {filter === 'unread' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-[var(--border)] rounded-[40px] p-20 flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-gray-500 max-w-xs">You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div 
                  key={n._id}
                  onClick={() => !n.isRead && handleMarkRead(n._id)}
                  className={`group relative p-6 rounded-[32px] border transition-all cursor-pointer ${
                    !n.isRead 
                      ? 'bg-white dark:bg-gray-900 border-primary-100 dark:border-primary-900/30 shadow-xl shadow-primary-500/5' 
                      : 'bg-gray-50/50 dark:bg-gray-900/20 border-transparent opacity-80'
                  } hover:scale-[1.01] hover:shadow-2xl active:scale-95`}
                >
                  <div className="flex gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      !n.isRead ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-lg ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>
                        {n.desc}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 items-end justify-center">
                      <button 
                        onClick={(e) => handleDelete(e, n._id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Delete notification"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {!n.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary-600 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Showing {filteredNotifications.length} notifications
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
