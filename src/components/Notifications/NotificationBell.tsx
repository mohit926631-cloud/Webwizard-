import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../types';
import { apiService } from '../../services/api';
import { Bell, CheckCheck, Trash2, CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface Props {
  userId?: string;
  onOpenProject?: (projectId: string) => void;
}

export const NotificationBell: React.FC<Props> = ({ userId, onOpenProject }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const list = await apiService.getNotifications();
      setNotifications(list);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setLoading(true);
    await apiService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLoading(false);
  };

  const handleClearAll = async () => {
    setLoading(true);
    await apiService.clearNotifications();
    setNotifications([]);
    setLoading(false);
  };

  const handleMarkRead = async (id: string, projectId?: string) => {
    await apiService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (projectId && onOpenProject) {
      setIsOpen(false);
      onOpenProject(projectId);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 transition-all text-slate-300 hover:text-white"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-md shadow-indigo-600/40 ring-2 ring-slate-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* HEADER */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ACTIONS ROW */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={handleMarkAllRead}
                disabled={loading || unreadCount === 0}
                className="hover:text-indigo-400 flex items-center gap-1.5 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <button
                onClick={handleClearAll}
                disabled={loading}
                className="hover:text-rose-400 flex items-center gap-1.5 font-medium disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear notifications
              </button>
            </div>
          )}

          {/* NOTIFICATION LIST */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-60" />
                <p>No notifications yet.</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Alerts from website generation & AI edits will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.projectId)}
                  className={`p-3.5 transition-colors cursor-pointer flex gap-3 ${
                    notif.read ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-indigo-950/20 hover:bg-indigo-900/30 border-l-2 border-indigo-500'
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-xs font-bold truncate ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
