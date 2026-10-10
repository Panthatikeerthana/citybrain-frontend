import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { SearchModal } from '../components/common/SearchModal';
import { NotificationDrawer } from '../components/common/NotificationDrawer';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#202B29] flex flex-col font-sans">
      {/* Fixed/Collapsible Deep Forest Green Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Clean White Top Navigation Bar */}
        <Header
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Dynamic Page Routed Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Unified Clean Bottom Footer */}
        <footer className="mt-auto border-t border-[#E1E7E2] bg-white py-4 px-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between text-xs text-[#697773] font-sans gap-2">
          <div>
            <span className="font-medium text-[#202B29]">City Brain — Urban Command & Simulation System</span>
            <span className="hidden sm:inline mx-2 text-[#C2CCC7]">•</span>
            <span>Hyderabad Metropolitan Sector</span>
          </div>
          <div className="text-[11px] text-[#697773] font-mono">
            React • TypeScript • Leaflet • Spring Boot Bridge
          </div>
        </footer>
      </div>

      {/* Global Overlays */}
      <SearchModal />
      <NotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};
