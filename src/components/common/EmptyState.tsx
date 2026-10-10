import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-xl bg-white border border-[#E1E7E2] shadow-sm flex flex-col items-center justify-center ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-[#F2FAF7] border border-[#E2F4EF] flex items-center justify-center text-[#188568] mb-4">
        <Icon className="w-6 h-6 text-[#188568]" />
      </div>
      <h3 className="text-base font-semibold text-[#202B29] mb-1">{title}</h3>
      <p className="text-sm text-[#697773] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-[#188568] hover:bg-[#11654F] text-white font-semibold text-xs rounded-lg transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
