import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  accentColor?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple' | 'teal';
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  accentColor = 'emerald',
  badge,
  onClick,
  className = '',
}) => {
  const iconStyleMap = {
    cyan: 'bg-[#F2FAF7] text-[#188568] border-[#E2F4EF]',
    rose: 'bg-[#FDF2F2] text-[#D64545] border-[#FADCDA]',
    amber: 'bg-[#FEF9EC] text-[#D97732] border-[#FCEBCE]',
    emerald: 'bg-[#F2FAF7] text-[#188568] border-[#E2F4EF]',
    purple: 'bg-[#F2FAF7] text-[#188568] border-[#E2F4EF]',
    teal: 'bg-[#F4FAFA] text-[#438C91] border-[#EBF4F5]',
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-xl border border-[#E1E7E2] shadow-sm hover:border-[#188568]/40 transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#697773]">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${iconStyleMap}`}>
          <Icon className="w-4 h-4 shrink-0" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202B29] font-mono">
          {value}
        </span>
        {subValue && (
          <span className="text-xs sm:text-sm text-[#697773] font-medium">
            {subValue}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E1E7E2]">
        {trend ? (
          <div className="flex items-center gap-1.5 text-xs">
            {trend.direction === 'up' && <TrendingUp className="w-3.5 h-3.5 text-[#D64545]" />}
            {trend.direction === 'down' && <TrendingDown className="w-3.5 h-3.5 text-[#23865D]" />}
            {trend.direction === 'neutral' && <Minus className="w-3.5 h-3.5 text-[#697773]" />}
            <span
              className={
                trend.direction === 'up'
                  ? 'text-[#D64545] font-semibold'
                  : trend.direction === 'down'
                  ? 'text-[#23865D] font-semibold'
                  : 'text-[#697773] font-medium'
              }
            >
              {trend.value}
            </span>
            {trend.label && <span className="text-[#697773] hidden sm:inline">{trend.label}</span>}
          </div>
        ) : (
          <span className="text-xs text-[#697773] font-sans">Urban Command Telemetry</span>
        )}

        {badge && <div>{badge}</div>}
      </div>
    </div>
  );
};
