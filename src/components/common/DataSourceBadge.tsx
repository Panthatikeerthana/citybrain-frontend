import React from 'react';
import { Activity, Database, Sparkles, Layers } from 'lucide-react';

export type DataSourceVariant = 'live' | 'demo' | 'simulated' | 'rule-based' | 'hybrid';

interface DataSourceBadgeProps {
  source: DataSourceVariant;
  endpoint?: string;
  className?: string;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({ source, endpoint, className = '' }) => {
  if (source === 'live') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2FAF7] border border-[#9CE3D1] text-[#11654F] text-xs font-mono font-semibold ${className}`} title={endpoint ? `Live API: ${endpoint}` : 'Live Telemetry Stream'}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#188568] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#188568]"></span>
        </span>
        <Activity className="w-3 h-3 text-[#188568]" />
        <span>LIVE API {endpoint ? `(${endpoint})` : ''}</span>
      </div>
    );
  }

  if (source === 'hybrid') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4FAFA] border border-[#84BCC0] text-[#347277] text-xs font-mono font-semibold ${className}`} title="Aggregated multi-layer spatial telemetry">
        <Layers className="w-3 h-3 text-[#438C91]" />
        <span>MULTI-LAYER SPATIAL</span>
      </div>
    );
  }

  if (source === 'rule-based') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F4FAFA] border border-[#84BCC0] text-[#347277] text-xs font-mono font-semibold ${className}`} title="Rule-based heuristic model (Demo)">
        <Sparkles className="w-3 h-3 text-[#438C91]" />
        <span>RULE-BASED DEMO MODEL</span>
      </div>
    );
  }

  if (source === 'simulated') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F8F5] border border-[#E1E7E2] text-[#697773] text-xs font-mono font-semibold ${className}`} title="Simulated sensor indicators for visualization">
        <Sparkles className="w-3 h-3 text-[#697773]" />
        <span>SIMULATED TELEMETRY</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs font-mono font-semibold ${className}`} title="Verified local demonstration dataset">
      <Database className="w-3 h-3 text-[#188568]" />
      <span>DEMO DATASET</span>
    </div>
  );
};
