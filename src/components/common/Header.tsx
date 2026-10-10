import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Menu, 
  Clock
} from 'lucide-react';
import { useCityBrain } from '../../context/CityBrainContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenNotifications }) => {
  const { 
    systemStatus, 
    unreadCount, 
    isLoading, 
    refreshAllData, 
    setSearchOpen 
  } = useCityBrain();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E1E7E2] px-4 sm:px-6 flex items-center justify-between gap-4 shadow-sm">
      {/* Left side: Mobile menu toggle + System title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#697773] hover:text-[#202B29] hover:bg-[#F7F8F5] lg:hidden transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#188568]">
              City Brain Operations Hub
            </span>
            <span className="text-[#C2CCC7]">•</span>
            <span className="text-xs text-[#697773] font-medium">
              Hyderabad Sector
            </span>
          </div>
          <p className="text-xs text-[#697773] hidden md:block">
            Intelligent Urban Operations & Risk Prediction
          </p>
        </div>
      </div>

      {/* Center / Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Status indicator */}
        <div 
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            systemStatus.backendConnected 
              ? 'bg-[#F2FAF7] border-[#9CE3D1] text-[#11654F]' 
              : 'bg-[#F7F8F5] border-[#E1E7E2] text-[#697773]'
          }`}
          title={systemStatus.backendConnected ? `Connected to Spring Boot (port 8080) - Latency: ${systemStatus.latencyMs}ms` : 'Spring Boot backend offline - Operating in verified demo mode'}
        >
          {systemStatus.backendConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#188568]"></span>
              <Wifi className="w-3.5 h-3.5 text-[#188568]" />
              <span>LIVE API</span>
              <span className="text-xs font-mono">{systemStatus.latencyMs}ms</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#438C91]"></span>
              <WifiOff className="w-3.5 h-3.5 text-[#697773]" />
              <span>DEMO MODE</span>
            </>
          )}
        </div>

        {/* Global Live Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[#188568]" />
          <span className="font-semibold">{currentTime}</span>
          <span className="text-[#697773] text-[10px]">IST</span>
        </div>

        {/* Global Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#697773] hover:text-[#202B29] text-xs transition-colors shadow-sm"
          title="Search city locations, incidents, or telemetry"
        >
          <Search className="w-3.5 h-3.5 text-[#697773]" />
          <span className="hidden sm:inline text-[#202B29]">Search City Brain...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[#F7F8F5] rounded border border-[#E1E7E2] text-[#697773] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Refresh button */}
        <button
          onClick={() => refreshAllData()}
          disabled={isLoading}
          className={`p-2 rounded-lg bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#697773] hover:text-[#188568] transition-colors shadow-sm ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          title="Refresh All City Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#188568]' : ''}`} />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#697773] hover:text-[#202B29] transition-colors shadow-sm"
          title="View Urgent Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D64545] px-1 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
