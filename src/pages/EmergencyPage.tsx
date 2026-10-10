import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Car, 
  Droplets, 
  Zap, 
  X,
  Radio,
  UserCheck
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { EmergencyIncident } from '../types';

export const EmergencyPage: React.FC = () => {
  const { emergencies, updateEmergencyStatus } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);

  const filteredIncidents = emergencies.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesSev && matchesCat;
  });

  const criticalCount = emergencies.filter(e => e.severity === 'Critical').length;
  const activeDispatches = emergencies.filter(e => e.status === 'Dispatched' || e.status === 'In Progress').length;
  const resolvedCount = emergencies.filter(e => e.status === 'Resolved').length;

  const handleStatusChange = async (incidentId: string, newStatus: EmergencyIncident['status']) => {
    await updateEmergencyStatus(incidentId, newStatus);
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Traffic Accident': return Car;
      case 'Waterlogging': return Droplets;
      case 'Fire': return Flame;
      case 'Power Outage': return Zap;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#D64545]" />
              <span>Emergency Command & Dispatch Center</span>
            </h1>
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time urban crisis triage, multi-agency response dispatch (Police, Fire, Disaster Response, 108 Emergency).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#D64545] bg-[#FDF2F2] border border-[#FADCDA] px-3 py-1.5 rounded-lg font-semibold">
          <Radio className="w-4 h-4 text-[#D64545]" />
          <span>DRF / HYDRAA Unified Channel</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reported Incidents"
          value={emergencies.length}
          subValue="Active in Queue"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Across Hyderabad',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Critical Incidents"
          value={criticalCount}
          subValue="Immediate Danger"
          icon={ShieldAlert}
          accentColor="rose"
          trend={{
            value: 'LB Nagar Flyover Pileup',
            direction: 'up',
          }}
        />

        <StatCard
          title="Units Dispatched & Active"
          value={activeDispatches}
          subValue="Field Units Operating"
          icon={UserCheck}
          accentColor="amber"
          trend={{
            value: 'Ambulance & Fire squads',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Incidents Resolved"
          value={resolvedCount}
          subValue="Cleared Today"
          icon={CheckCircle2}
          accentColor="emerald"
          trend={{
            value: 'Avg resolution 45m',
            direction: 'down',
          }}
        />
      </div>

      {/* Main Incident List & Filters */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Active Emergency Incident Feed</h2>
            <span className="text-xs font-mono text-[#697773]">({filteredIncidents.length} matching)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search incident, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] w-52 sm:w-60"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Categories</option>
              <option value="Traffic Accident">Traffic Accident</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Power Outage">Power Outage</option>
              <option value="Fire">Fire</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>
        </div>

        {/* Incident Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredIncidents.map((incident) => {
            const Icon = getCategoryIcon(incident.category);
            const isCritical = incident.severity === 'Critical';

            return (
              <div
                key={incident.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCritical 
                    ? 'bg-[#FDF2F2] border-[#FADCDA] shadow-sm' 
                    : 'bg-[#F7F8F5] border-[#E1E7E2] hover:border-[#188568]/40 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isCritical ? 'bg-[#D64545] text-white' : 'bg-white border border-[#E1E7E2] text-[#188568]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#697773] font-semibold">
                          {incident.category}
                        </span>
                        <h3 className="font-bold text-sm text-[#202B29]">{incident.title}</h3>
                      </div>
                    </div>
                    <SeverityBadge severity={incident.severity} size="sm" />
                  </div>

                  <p className="text-xs text-[#4E5F5B] mb-3 leading-relaxed">
                    {incident.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#697773] font-mono mb-4 bg-white p-2.5 rounded-lg border border-[#E1E7E2]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#188568] shrink-0" />
                      <span className="truncate font-semibold text-[#202B29]">{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#697773] shrink-0" />
                      <span>{incident.timestamp}</span>
                    </div>
                    <div className="col-span-2 text-[#202B29]">
                      Responders: <strong className="text-[#188568]">{incident.respondersAssigned.join(', ')}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E1E7E2] gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#697773]">Status:</span>
                    <span className="font-semibold text-[#188568] font-mono">{incident.status}</span>
                  </div>

                  <button
                    onClick={() => setSelectedIncident(incident)}
                    className="px-3 py-1.5 bg-[#188568] hover:bg-[#11654F] text-white text-xs rounded-lg font-semibold transition-colors shadow-sm"
                  >
                    View & Dispatch →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Detail / Action Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-xl bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-[#188568] font-bold uppercase tracking-wider">
                    Incident Dispatch Controller
                  </span>
                  <SeverityBadge severity={selectedIncident.severity} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-[#202B29]">{selectedIncident.title}</h3>
                <p className="text-xs text-[#697773] font-mono mt-0.5">ID: {selectedIncident.id}</p>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1.5 rounded-lg text-[#697773] hover:text-[#202B29] hover:bg-[#F7F8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6 text-xs text-[#202B29]">
              <div>
                <label className="text-[#697773] font-mono uppercase text-[10px] block mb-1">Incident Report Summary</label>
                <p className="bg-[#F7F8F5] p-3 rounded-lg border border-[#E1E7E2] leading-relaxed text-[#202B29]">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F8F5] rounded-lg border border-[#E1E7E2]">
                  <span className="text-[10px] font-mono text-[#697773] uppercase block mb-1">Location Coordinates</span>
                  <p className="font-mono text-[#188568] font-bold">{selectedIncident.location}</p>
                  <span className="text-[10px] text-[#697773] font-mono">[{selectedIncident.coordinates.join(', ')}]</span>
                </div>
                <div className="p-3 bg-[#F7F8F5] rounded-lg border border-[#E1E7E2]">
                  <span className="text-[10px] font-mono text-[#697773] uppercase block mb-1">Reported Source</span>
                  <p className="font-mono text-[#202B29] font-bold">{selectedIncident.reportedBy}</p>
                  <span className="text-[10px] text-[#697773] font-mono">{selectedIncident.timestamp}</span>
                </div>
              </div>

              <div>
                <label className="text-[#697773] font-mono uppercase text-[10px] block mb-1">Assigned Response Teams</label>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.respondersAssigned.map((team, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-[#F2FAF7] text-[#11654F] border border-[#9CE3D1] rounded-md font-mono text-[11px] font-semibold">
                      🛡️ {team}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div>
                <label className="text-[#697773] font-mono uppercase text-[10px] block mb-2">Update Incident Dispatch Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Dispatched', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedIncident.id, st)}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all border ${
                        selectedIncident.status === st
                          ? 'bg-[#188568] text-white border-[#188568] shadow-sm'
                          : 'bg-[#F7F8F5] text-[#202B29] hover:bg-white border-[#E1E7E2]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E1E7E2]">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-[#F7F8F5] hover:bg-[#E1E7E2] text-[#202B29] rounded-lg text-xs font-semibold border border-[#E1E7E2]"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
