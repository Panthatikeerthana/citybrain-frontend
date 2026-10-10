import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useCityBrain } from '../../context/CityBrainContext';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ open, onClose }) => {
  const { 
    notifications, 
    markNotificationRead, 
    clearNotifications, 
    unreadCount 
  } = useCityBrain();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-[#202B29]/60"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white border-l border-[#E1E7E2] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#E1E7E2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#F2FAF7] border border-[#E2F4EF] text-[#188568]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#202B29] text-base">Alerts & Broadcasts</h3>
              <p className="text-xs text-[#697773] font-mono">
                {unreadCount} unacknowledged alert{unreadCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="p-2 rounded-lg text-[#697773] hover:text-[#D64545] hover:bg-[#F7F8F5] transition-colors"
                title="Clear all alerts"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#697773] hover:text-[#202B29] hover:bg-[#F7F8F5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-[#697773]">
              <CheckCheck className="w-10 h-10 text-[#23865D] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#202B29]">All Systems Clear</p>
              <p className="text-xs mt-1 text-[#697773]">No active emergency alerts requiring intervention.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isCritical = notif.type === 'critical';
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.link) {
                      navigate(notif.link);
                      onClose();
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                    notif.read
                      ? 'bg-[#F7F8F5] border-[#E1E7E2] text-[#697773]'
                      : isCritical
                      ? 'bg-[#FDF2F2] border-[#FADCDA] text-[#202B29] shadow-sm'
                      : 'bg-[#FEF6F0] border-[#FCDDC6] text-[#202B29]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-[#D64545] text-white'
                          : 'bg-[#D97732] text-white'
                      }`}
                    >
                      {isCritical ? <ShieldAlert className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-[#202B29] truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-[#697773] font-mono whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#4E5F5B] mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.link && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-[#188568] font-semibold group-hover:underline">
                          <span>Inspect module</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F8F5] border-t border-[#E1E7E2] text-xs text-[#697773] text-center font-mono">
          City Brain Unified Dispatch & Notification System
        </div>
      </div>
    </>
  );
};
