import React, { useState } from 'react';
import { 
  Trash2, 
  Search, 
  Truck, 
  AlertTriangle, 
  Recycle 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';

export const WastePage: React.FC = () => {
  const { wasteRecords } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const filtered = wasteRecords.filter(item => {
    const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPri = filterPriority === 'all' || item.priority.toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesPri;
  });

  const overflowingCount = wasteRecords.filter(w => w.fillPercentage >= 85).length;
  const vehiclesDeployed = wasteRecords.filter(w => w.vehicleAssigned).length;
  const avgFillRate = Math.round(wasteRecords.reduce((acc, curr) => acc + curr.fillPercentage, 0) / wasteRecords.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-[#C49A24]" />
              <span>Municipal Solid Waste Management</span>
            </h1>
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Smart IoT waste bin sensors, collection logistics routing, and sanitation priority alerts.
          </p>
        </div>

        <div className="text-xs font-mono text-[#697773] bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E1E7E2]">
          Agency: <span className="text-[#D97732] font-bold">GHMC Sanitation Control</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Bin Saturation"
          value={`${avgFillRate}%`}
          subValue="Across 5 Super-Zones"
          icon={Trash2}
          accentColor={avgFillRate > 75 ? 'amber' : 'teal'}
          trend={{
            value: '+6% fill since 06:00',
            direction: 'up',
          }}
        />

        <StatCard
          title="Critical / Overflowing Bins"
          value={overflowingCount}
          subValue="Fill Level > 85%"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Immediate pickup required',
            direction: 'up',
          }}
        />

        <StatCard
          title="Compactor Trucks En Route"
          value={vehiclesDeployed}
          subValue="Active collection route"
          icon={Truck}
          accentColor="emerald"
          trend={{
            value: '4 GHMC vehicles active',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Recycling Segregation"
          value="68.4%"
          subValue="Dry / Wet Compliance"
          icon={Recycle}
          accentColor="emerald"
          trend={{
            value: '+3.1% this month',
            direction: 'up',
          }}
        />
      </div>

      {/* Bin Capacity Visual Grid */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-[#188568]" />
          <span>Real-time Bin Saturation by Location</span>
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wasteRecords} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
              <XAxis dataKey="location" stroke="#697773" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#697773" fontSize={11} domain={[0, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(val: any) => [`${val}% Capacity`, 'Fill Level']}
              />
              <Bar dataKey="fillPercentage" radius={[4, 4, 0, 0]}>
                {wasteRecords.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fillPercentage >= 85 ? '#D64545' : entry.fillPercentage >= 65 ? '#D97732' : '#23865D'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
          <h2 className="text-base font-bold text-[#202B29]">Waste Collection Schedule & Telemetry</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search zone / location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">Bin Node ID</th>
                <th className="py-3 px-4">Location & Zone</th>
                <th className="py-3 px-4">Fill Percentage</th>
                <th className="py-3 px-4">Capacity</th>
                <th className="py-3 px-4">Waste Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Assigned Vehicle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#188568] font-bold">{item.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#202B29]">{item.location}</div>
                    <div className="text-[10px] text-[#697773] font-mono">{item.zone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-[#E1E7E2] rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${item.fillPercentage}%`,
                            backgroundColor: item.fillPercentage >= 85 ? '#D64545' : item.fillPercentage >= 65 ? '#D97732' : '#23865D'
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[#202B29]">{item.fillPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">{item.binCapacityLiters}L</td>
                  <td className="py-3 px-4 text-[#202B29]">{item.wasteType}</td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={item.priority} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.vehicleAssigned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#11654F] bg-[#F2FAF7] px-2 py-0.5 rounded border border-[#9CE3D1] font-semibold">
                        <Truck className="w-3 h-3 text-[#188568]" />
                        <span>{item.vehicleAssigned}</span>
                      </span>
                    ) : (
                      <span className="text-[#697773] font-mono text-[11px]">Unassigned</span>
                    )}
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
