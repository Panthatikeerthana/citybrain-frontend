import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Search
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { CityMap } from '../components/map/CityMap';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';

export const MapPage: React.FC = () => {
  const { 
    traffic, 
    emergencies, 
    waterIssues, 
    wasteRecords, 
    pollutionRecords, 
    complaints 
  } = useCityBrain();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Consolidated issue feed for sidebar
  const allMapItems = [
    ...traffic.map(t => ({ ...t, mapType: 'traffic', title: `${t.location} Traffic Flow`, desc: `${t.congestion}% Congestion (${t.vehicles} veh/hr)`, sev: t.status, coords: t.coordinates })),
    ...emergencies.map(e => ({ ...e, mapType: 'emergency', title: e.title, desc: e.description, sev: e.severity, coords: e.coordinates })),
    ...waterIssues.map(w => ({ ...w, mapType: 'water', title: `${w.issueType} — ${w.location}`, desc: `${w.affectedHouseholds} households affected (${w.pressurePsi} PSI)`, sev: w.severity, coords: w.coordinates })),
    ...wasteRecords.map(ws => ({ ...ws, mapType: 'waste', title: `Waste Bin: ${ws.location}`, desc: `${ws.fillPercentage}% full (${ws.status})`, sev: ws.priority, coords: ws.coordinates })),
    ...pollutionRecords.map(p => ({ ...p, mapType: 'pollution', title: `${p.stationName} CAAQMS`, desc: `AQI ${p.aqi} • PM2.5 ${p.pm25} µg/m³`, sev: p.status === 'Unhealthy' ? 'High' : 'Moderate', coords: p.coordinates })),
    ...complaints.map(c => ({ ...c, mapType: 'complaints', title: c.title, desc: `${c.category} • ${c.location}`, sev: c.severity, coords: c.coordinates })),
  ];

  const filteredItems = allMapItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.mapType === selectedCategory;
    const matchesSeverity = selectedSeverity === 'all' || (item.sev && item.sev.toLowerCase() === selectedSeverity.toLowerCase());
    const matchesQuery = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <MapIcon className="w-6 h-6 text-[#188568]" />
              <span>Live Geographic Information System (GIS)</span>
            </h1>
            <DataSourceBadge source="hybrid" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time multi-layered spatial map of Greater Hyderabad Urban Area with live coordinates & sensor telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#697773] font-mono bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E1E7E2]">
          <span>Active Map Nodes:</span>
          <strong className="text-[#188568] font-bold">{filteredItems.length}</strong>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map */}
        <div className="lg:col-span-2 space-y-4">
          <CityMap
            height="620px"
            selectedCategory={selectedCategory}
            selectedSeverity={selectedSeverity}
            onMarkerSelect={(item) => setSelectedItem(item)}
          />

          {/* Selected marker detail card */}
          {selectedItem && (
            <div className="bg-white p-4 rounded-xl border border-[#188568] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#188568] font-semibold">
                    Selected Node Inspector
                  </span>
                  {selectedItem.severity && <SeverityBadge severity={selectedItem.severity} size="sm" />}
                  {selectedItem.status && <SeverityBadge severity={selectedItem.status} size="sm" />}
                </div>
                <h3 className="text-sm font-bold text-[#202B29]">
                  {selectedItem.location || selectedItem.title || selectedItem.stationName}
                </h3>
                <p className="text-xs text-[#697773] mt-0.5">
                  {selectedItem.description || selectedItem.desc || `Congestion: ${selectedItem.congestion}% • Vehicles: ${selectedItem.vehicles}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 bg-[#F7F8F5] hover:bg-[#E1E7E2] text-[#202B29] rounded-lg text-xs font-semibold border border-[#E1E7E2] shrink-0 transition-colors"
              >
                Close Inspector
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: Filterable Nodes Sidebar */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col h-[620px]">
          <div className="space-y-3 pb-3 border-b border-[#E1E7E2]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#202B29] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#188568]" />
                <span>Spatial Nodes Directory</span>
              </h2>
              <span className="text-xs font-mono text-[#697773]">{filteredItems.length} listed</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter locations or issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
              />
            </div>

            {/* Quick Category Selector */}
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'traffic', label: 'Traffic' },
                { id: 'emergency', label: 'Incidents' },
                { id: 'water', label: 'Water' },
                { id: 'waste', label: 'Waste' },
                { id: 'pollution', label: 'AQI' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`py-1 rounded-md font-medium transition-colors ${
                    selectedCategory === c.id
                      ? 'bg-[#188568] text-white font-semibold'
                      : 'bg-[#F7F8F5] text-[#697773] hover:text-[#202B29] border border-[#E1E7E2]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 pr-1">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-[#697773] text-xs">
                No spatial nodes match the active filter criteria.
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedItem(item)}
                  className="p-3 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/50 hover:bg-white transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#202B29] group-hover:text-[#188568] transition-colors truncate">
                      {item.title}
                    </span>
                    {item.sev && <SeverityBadge severity={item.sev} size="sm" />}
                  </div>
                  <p className="text-[11px] text-[#697773] line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#697773] font-mono mt-2 pt-1 border-t border-[#E1E7E2]">
                    <span className="uppercase text-[#188568] font-semibold">{item.mapType}</span>
                    <span>{item.coords ? `${item.coords[0].toFixed(2)}, ${item.coords[1].toFixed(2)}` : 'Hyderabad'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
