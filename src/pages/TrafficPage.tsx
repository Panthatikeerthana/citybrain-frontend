import React, { useState, useMemo } from 'react';
import { 
  Car, 
  Search, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Gauge, 
  RefreshCw
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

export const TrafficPage: React.FC = () => {
  const { traffic, systemStatus, isLoading, refreshAllData } = useCityBrain();

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sortField, setSortField] = useState<'congestion' | 'vehicles' | 'location'>('congestion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered and sorted traffic list
  const filteredTraffic = useMemo(() => {
    return traffic
      .filter((item) => {
        const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || item.status.toLowerCase() === severityFilter.toLowerCase();
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (sortOrder === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [traffic, searchTerm, severityFilter, sortField, sortOrder]);

  // Aggregate Metrics
  const totalVehicles = traffic.reduce((acc, curr) => acc + curr.vehicles, 0);
  const avgCongestion = traffic.length > 0 
    ? Math.round(traffic.reduce((acc, curr) => acc + curr.congestion, 0) / traffic.length) 
    : 0;
  const criticalJunctions = traffic.filter(t => t.congestion >= 75);
  const highestCongestionJunction = [...traffic].sort((a, b) => b.congestion - a.congestion)[0];

  const handleSort = (field: 'congestion' | 'vehicles' | 'location') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getBarColor = (congestion: number) => {
    if (congestion >= 75) return '#D64545';
    if (congestion >= 50) return '#D97732';
    return '#23865D';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Car className="w-6 h-6 text-[#188568]" />
              <span>Traffic Management & Congestion Analytics</span>
            </h1>
            <DataSourceBadge 
              source={systemStatus.trafficSource === 'live' ? 'live' : 'demo'} 
              endpoint={systemStatus.trafficSource === 'live' ? '/api/traffic' : undefined}
            />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time urban corridor flow monitoring, intersection density tracking, and bottlenecks analysis across Hyderabad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAllData()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#188568]' : 'text-[#188568]'}`} />
            <span>Sync Traffic Feed</span>
          </button>
        </div>
      </div>

      {/* Traffic KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Network Congestion"
          value={`${avgCongestion}%`}
          subValue={avgCongestion > 65 ? 'Heavy Load' : 'Moderate Flow'}
          icon={Gauge}
          accentColor={avgCongestion > 70 ? 'amber' : 'emerald'}
          trend={{
            value: `${traffic.length} active monitored nodes`,
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Total Hourly Flow Rate"
          value={totalVehicles.toLocaleString()}
          subValue="Vehicles / Hour"
          icon={TrendingUp}
          accentColor="teal"
          trend={{
            value: '+8.2%',
            direction: 'up',
            label: 'peak surge',
          }}
        />

        <StatCard
          title="Critical Bottlenecks"
          value={criticalJunctions.length}
          subValue="Threshold > 75%"
          icon={ShieldAlert}
          accentColor="rose"
          trend={{
            value: criticalJunctions.map(c => c.location.split(' ')[0]).join(', ') || 'None',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Peak Traffic Node"
          value={highestCongestionJunction ? `${highestCongestionJunction.congestion}%` : 'N/A'}
          subValue={highestCongestionJunction ? highestCongestionJunction.location : 'Calculating'}
          icon={Activity}
          accentColor="amber"
          trend={{
            value: highestCongestionJunction ? `${highestCongestionJunction.vehicles} veh/hr` : '',
            direction: 'up',
          }}
        />
      </div>

      {/* Traffic Congestion Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#188568]" />
              <span>Congestion Level Comparison by Junction</span>
            </h2>
            <p className="text-xs text-[#697773]">Color-coded saturation levels: Green (&lt;50%), Amber (50-74%), Red (≥75%)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1 text-[#202B29]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#23865D]"></span> Low
            </span>
            <span className="flex items-center gap-1 text-[#202B29]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D97732]"></span> Moderate
            </span>
            <span className="flex items-center gap-1 text-[#202B29]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#D64545]"></span> High / Severe
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={traffic} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
              <XAxis 
                dataKey="location" 
                stroke="#697773" 
                fontSize={11} 
                interval={0}
                angle={-25}
                textAnchor="end"
              />
              <YAxis stroke="#697773" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(value: any, name: any, item: any) => [
                  `${value}% (${item.payload.vehicles.toLocaleString()} veh/hr, ~${item.payload.speedKmh || 20} km/h)`,
                  'Congestion Index'
                ]}
              />
              <Bar dataKey="congestion" radius={[4, 4, 0, 0]}>
                {traffic.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.congestion)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Table with Search & Sorting */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#202B29]">
              Location Telemetry Table
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#F7F8F5] text-[#188568] border border-[#E1E7E2] font-semibold">
              {filteredTraffic.length} records
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search junction (e.g. Uppal, LB Nagar)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] w-56 sm:w-64"
              />
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#697773]" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-[#202B29] transition-colors"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center gap-1">
                    <span>Location / Corridor</span>
                    <ArrowUpDown className="w-3 h-3 text-[#697773]" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-[#202B29] transition-colors"
                  onClick={() => handleSort('congestion')}
                >
                  <div className="flex items-center gap-1">
                    <span>Congestion Level</span>
                    <ArrowUpDown className="w-3 h-3 text-[#697773]" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-[#202B29] transition-colors"
                  onClick={() => handleSort('vehicles')}
                >
                  <div className="flex items-center gap-1">
                    <span>Vehicles / Hr</span>
                    <ArrowUpDown className="w-3 h-3 text-[#697773]" />
                  </div>
                </th>
                <th className="py-3 px-4">Est. Speed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recorded At</th>
                <th className="py-3 px-4 text-right">Data Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {filteredTraffic.map((row) => (
                <tr key={row.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202B29] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getBarColor(row.congestion) }}></span>
                    <span>{row.location}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#E1E7E2] rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${row.congestion}%`, 
                            backgroundColor: getBarColor(row.congestion) 
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-[#202B29]">{row.congestion}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">
                    {row.vehicles.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#697773]">
                    ~{row.speedKmh || 25} km/h
                  </td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={row.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 font-mono text-[#697773] text-[11px]">
                    {row.recorded_at ? new Date(row.recorded_at).toLocaleTimeString() : 'Recent'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      row.isLive 
                        ? 'bg-[#F2FAF7] text-[#11654F] border border-[#9CE3D1]' 
                        : 'bg-[#F7F8F5] text-[#697773] border border-[#E1E7E2]'
                    }`}>
                      {row.isLive ? 'LIVE' : 'DEMO'}
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
