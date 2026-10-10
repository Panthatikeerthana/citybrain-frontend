import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Car, 
  CloudSun, 
  Droplets, 
  Trash2, 
  Wind, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Sliders, 
  Bot, 
  ChevronLeft, 
  ChevronRight,
  Radio,
  Building2,
  X
} from 'lucide-react';
import { useCityBrain } from '../../context/CityBrainContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { traffic, emergencies, complaints, riskPredictions } = useCityBrain();

  const highCongestionCount = traffic.filter(t => t.congestion >= 75).length;
  const criticalEmergencyCount = emergencies.filter(e => e.severity === 'Critical' || e.severity === 'High').length;
  const highRiskCount = riskPredictions.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const openComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

  const navItems = [
    {
      to: '/',
      label: 'Command Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      to: '/map',
      label: 'Live City Map',
      icon: Map,
      badge: undefined,
    },
    {
      to: '/traffic',
      label: 'Traffic Control',
      icon: Car,
      badge: highCongestionCount > 0 ? { count: highCongestionCount, color: 'bg-[#D97732] text-white' } : undefined,
    },
    {
      to: '/weather',
      label: 'Weather & Climate',
      icon: CloudSun,
      badge: undefined,
    },
    {
      to: '/water',
      label: 'Water Management',
      icon: Droplets,
      badge: undefined,
    },
    {
      to: '/waste',
      label: 'Waste Management',
      icon: Trash2,
      badge: undefined,
    },
    {
      to: '/pollution',
      label: 'Air Quality (AQI)',
      icon: Wind,
      badge: undefined,
    },
    {
      to: '/emergency',
      label: 'Emergency Response',
      icon: AlertTriangle,
      badge: criticalEmergencyCount > 0 ? { count: criticalEmergencyCount, color: 'bg-[#D64545] text-white' } : undefined,
    },
    {
      to: '/complaints',
      label: 'Citizen Complaints',
      icon: FileText,
      badge: openComplaintsCount > 0 ? { count: openComplaintsCount, color: 'bg-[#188568] text-white' } : undefined,
    },
    {
      to: '/risk-prediction',
      label: 'Risk Prediction',
      icon: ShieldAlert,
      badge: highRiskCount > 0 ? { count: highRiskCount, color: 'bg-[#D97732] text-white' } : undefined,
    },
    {
      to: '/simulator',
      label: 'What-If Simulator',
      icon: Sliders,
      badge: { count: 'DEMO', color: 'bg-[#1F4D43] text-[#A8C5BD] border border-[#2A6458]' },
    },
    {
      to: '/assistant',
      label: 'AI City Assistant',
      icon: Bot,
      badge: undefined,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#202B29]/60 z-40 lg:hidden"
        />
      )}

      {/* Solid Deep Forest Green Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#173D35] text-white border-r border-[#1F4D43] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1F4D43]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-[#188568] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-wide text-white truncate leading-tight">
                  CITY BRAIN
                </span>
                <span className="text-[10px] font-mono text-[#A8C5BD] uppercase tracking-widest truncate">
                  Smart City Operations
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-md text-[#A8C5BD] hover:text-white hover:bg-[#1F4D43] lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#188568] text-white font-semibold'
                    : 'text-[#A8C5BD] hover:text-white hover:bg-[#1F4D43]'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />

              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${item.badge.color}`}
                >
                  {item.badge.count}
                </span>
              )}

              {/* Tooltip on collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#173D35] text-white text-xs rounded-md shadow-lg border border-[#1F4D43] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer info & collapse toggle button */}
        <div className="p-3 border-t border-[#1F4D43] flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden text-xs text-[#A8C5BD]">
              <Building2 className="w-4 h-4 text-[#188568] shrink-0" />
              <div className="truncate">
                <span className="text-[#A8C5BD] font-medium">Operations v2.4</span>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg text-[#A8C5BD] hover:text-white hover:bg-[#1F4D43] transition-colors ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
