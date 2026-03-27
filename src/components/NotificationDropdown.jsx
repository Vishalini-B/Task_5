import React from 'react';
import { Bell, X, Check, Trash2, Calendar, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function NotificationDropdown({ notifications, onMarkAsRead, onDelete, onClose }) {

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'bill': return <Calendar className="text-amber-500" size={18} />;
      case 'budget': return <AlertTriangle className="text-rose-500" size={18} />;
      case 'streak': return <Zap className="text-orange-500" size={18} />;
      case 'insight': return <TrendingUp className="text-indigo-500" size={18} />;
      default: return <Bell className="text-slate-500" size={18} />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
      
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
          <X size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={20} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 font-medium">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">We'll notify you about your finances here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 hover:bg-slate-50 transition-colors group relative",
                  !notification.isRead && "bg-indigo-50/30"
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    !notification.isRead ? "bg-white shadow-sm" : "bg-slate-100"
                  )}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm font-semibold truncate",
                        !notification.isRead ? "text-slate-900" : "text-slate-600"
                      )}>
                        {notification.title}
                      </p>

                      <span className="text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                        {format(new Date(notification.date), 'MMM d, h:mm a')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <button 
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Check size={12} />
                          Mark as read
                        </button>
                      )}

                      <button 
                        onClick={() => onDelete(notification.id)}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Stay on top of your finances
          </p>
        </div>
      )}
    </div>
  );
}