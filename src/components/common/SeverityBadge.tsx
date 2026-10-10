import React from 'react';
import { SeverityLevel } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'sm' }) => {
  const norm = severity.toLowerCase();

  let styles = 'bg-[#F7F8F5] text-[#697773] border-[#E1E7E2]';
  let dotColor = 'bg-[#697773]';

  if (norm === 'critical' || norm === 'severe') {
    styles = 'bg-[#FDF2F2] text-[#D64545] border-[#FADCDA] font-semibold';
    dotColor = 'bg-[#D64545]';
  } else if (norm === 'high') {
    styles = 'bg-[#FEF6F0] text-[#D97732] border-[#FCDDC6] font-semibold';
    dotColor = 'bg-[#D97732]';
  } else if (norm === 'moderate' || norm === 'medium') {
    styles = 'bg-[#FEF9EC] text-[#C49A24] border-[#FCEBCE] font-semibold';
    dotColor = 'bg-[#C49A24]';
  } else if (norm === 'low' || norm === 'good') {
    styles = 'bg-[#F2FAF5] text-[#23865D] border-[#E1F3E9] font-semibold';
    dotColor = 'bg-[#23865D]';
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{severity}</span>
    </span>
  );
};
