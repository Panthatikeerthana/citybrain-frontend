import React, { useState } from 'react';
import { 
  Droplets, 
  Search, 
  AlertTriangle, 
  Gauge, 
  Users, 
  Wrench, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';

export const WaterPage: React.FC = () => {
  const { waterIssues } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = waterIssues.filter(item => {
    const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.issueType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    return matchesSearch && matchesSev;
  });

  const totalAffectedHouseholds = waterIssues.reduce((acc, curr) => acc + curr.affectedHouseholds, 0);
  const activeRepairs = waterIssues.filter(w => w.status === 'Repair in Progress').length;
  const criticalLeaks = waterIssues.filter(w => w.severity === 'High' || w.severity === 'Critical').length;

  const chartData = waterIssues.map(w => ({
    name: w.location.split(' ')[0],
    households: w.affectedHouseholds,
    pressure: w.pressurePsi,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Droplets className="w-6 h-6 text-[#438C91]" />
              <span>Water Supply & Pipeline Management</span>
            </h1>
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Telemetry on potable water pressure grids, active pipe bursts, leak detection, and maintenance response.
          </p>
        </div>

        <div className="text-xs font-mono text-[#697773] bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E1E7E2]">
          Grid Telemetry: <span className="text-[#188568] font-bold">Hyderabad Metro Water Board (HMWSSB)</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Affected Households"
          value={totalAffectedHouseholds.toLocaleString()}
          subValue="Across 5 active zones"
          icon={Users}
          accentColor="emerald"
          trend={{
            value: 'Repair crews deployed',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Active Pipeline Leaks"
          value={criticalLeaks}
          subValue="High Severity"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: '2 priority repairs',
            direction: 'up',
          }}
        />

        <StatCard
          title="Field Repairs in Progress"
          value={activeRepairs}
          subValue="Crews on site"
          icon={Wrench}
          accentColor="amber"
          trend={{
            value: 'Avg resolution 4.2h',
            direction: 'down',
          }}
        />

        <StatCard
          title="Average Network Pressure"
          value="17.7 PSI"
          subValue="Optimal Range: 25-40 PSI"
          icon={Gauge}
          accentColor="teal"
          trend={{
            value: 'Under-pressure in KPHB',
            direction: 'down',
          }}
        />
      </div>

      {/* Chart */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#188568]" />
          <span>Affected Households by Municipal Zone</span>
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
              <XAxis dataKey="name" stroke="#697773" fontSize={11} />
              <YAxis stroke="#697773" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(val: any) => [`${val} households`, 'Affected Population']}
              />
              <Bar dataKey="households" fill="#188568" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
          <h2 className="text-base font-bold text-[#202B29]">Active Water Pipeline Incidents</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search pipeline / location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Location & Sector</th>
                <th className="py-3 px-4">Issue Classification</th>
                <th className="py-3 px-4">Affected Area</th>
                <th className="py-3 px-4">Pressure</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#188568] font-bold">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#202B29]">{item.location}</td>
                  <td className="py-3 px-4 text-[#202B29]">{item.issueType}</td>
                  <td className="py-3 px-4 font-mono text-[#697773]">{item.affectedHouseholds} homes</td>
                  <td className="py-3 px-4 font-mono text-[#D97732] font-semibold">{item.pressurePsi} PSI</td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={item.severity} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4FAFA] text-[#347277] border border-[#84BCC0]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
