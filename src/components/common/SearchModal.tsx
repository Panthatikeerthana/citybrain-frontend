import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Car, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  Wind, 
  FileText, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useCityBrain } from '../../context/CityBrainContext';

export const SearchModal: React.FC = () => {
  const { 
    searchOpen, 
    setSearchOpen, 
    traffic, 
    emergencies, 
    waterIssues, 
    wasteRecords, 
    complaints, 
    riskPredictions 
  } = useCityBrain();

  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      category: string;
      path: string;
      icon: any;
      severity?: string;
    }> = [];

    // Search Traffic
    traffic.forEach((t) => {
      if (t.location.toLowerCase().includes(q)) {
        results.push({
          id: `traffic-${t.id}`,
          title: `${t.location} — ${t.congestion}% Congestion (${t.vehicles} vehicles)`,
          category: 'Traffic Junction',
          path: '/traffic',
          icon: Car,
          severity: t.status,
        });
      }
    });

    // Search Emergencies
    emergencies.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)) {
        results.push({
          id: `emergency-${e.id}`,
          title: `${e.title} (${e.location})`,
          category: 'Emergency Incident',
          path: '/emergency',
          icon: AlertTriangle,
          severity: e.severity,
        });
      }
    });

    // Search Water
    waterIssues.forEach((w) => {
      if (w.location.toLowerCase().includes(q) || w.issueType.toLowerCase().includes(q)) {
        results.push({
          id: `water-${w.id}`,
          title: `${w.issueType} at ${w.location}`,
          category: 'Water Utility',
          path: '/water',
          icon: Droplets,
          severity: w.severity,
        });
      }
    });

    // Search Waste
    wasteRecords.forEach((ws) => {
      if (ws.location.toLowerCase().includes(q) || ws.zone.toLowerCase().includes(q)) {
        results.push({
          id: `waste-${ws.id}`,
          title: `${ws.location} — Bin ${ws.fillPercentage}% Full (${ws.status})`,
          category: 'Waste Management',
          path: '/waste',
          icon: Trash2,
          severity: ws.priority,
        });
      }
    });

    // Search Complaints
    complaints.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({
          id: `complaint-${c.id}`,
          title: `${c.title} — ${c.location}`,
          category: 'Citizen Complaint',
          path: '/complaints',
          icon: FileText,
          severity: c.severity,
        });
      }
    });

    // Search Risks
    riskPredictions.forEach((r) => {
      if (r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.riskType.toLowerCase().includes(q)) {
        results.push({
          id: `risk-${r.id}`,
          title: `${r.title} [Score: ${r.riskScore}]`,
          category: 'Risk Prediction',
          path: '/risk-prediction',
          icon: ShieldAlert,
          severity: r.severity,
        });
      }
    });

    return results;
  }, [query, traffic, emergencies, waterIssues, wasteRecords, complaints, riskPredictions]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#202B29]/60">
      <div 
        className="w-full max-w-2xl bg-white border border-[#E1E7E2] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E1E7E2] gap-3">
          <Search className="w-5 h-5 text-[#188568] shrink-0" />
          <input
            type="text"
            placeholder="Search Hyderabad locations, traffic nodes, incidents, or complaints..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[#202B29] placeholder-[#697773] text-sm sm:text-base font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#697773] hover:text-[#202B29]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="px-2 py-1 bg-[#F7F8F5] text-[#697773] text-xs rounded-md border border-[#E1E7E2] hover:text-[#202B29]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[#697773] text-sm">
              <p className="font-semibold text-[#202B29]">Quick Command Navigation</p>
              <p className="text-xs mt-1 text-[#697773]">Try searching: "Uppal", "LB Nagar", "Pipeline", "Waterlogging", or "Pollution"</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-[#697773] text-sm">
              No matching records found for "{query}".
            </div>
          ) : (
            searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setSearchOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F7F8F5] cursor-pointer border border-transparent hover:border-[#E1E7E2] transition-all group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-[#F2FAF7] border border-[#E2F4EF] text-[#188568]">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-semibold text-[#202B29] group-hover:text-[#188568] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#697773] flex items-center gap-2">
                      <span>{item.category}</span>
                      {item.severity && (
                        <span className="text-[#697773] font-mono text-[10px]">
                          • Severity: {item.severity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#697773] group-hover:text-[#188568] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#F7F8F5] border-t border-[#E1E7E2] flex items-center justify-between text-xs text-[#697773] font-mono">
          <span>Navigation Quick-Launcher</span>
          <span>City Brain Search Engine</span>
        </div>
      </div>
    </div>
  );
};
