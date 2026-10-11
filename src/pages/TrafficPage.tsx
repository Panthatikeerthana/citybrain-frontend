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
  const { traffic, liveTraffic, systemStatus, isLoading, refreshAllData } = useCityBrain();

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

  // Aggregate Metrics: prioritize verified live TomTom telemetry if available
  const isLiveActive = !!(liveTraffic?.isLive && liveTraffic?.items && liveTraffic.items.length > 0);
  const liveItems = isLiveActive ? liveTraffic!.items : [];

  const totalVehicles = traffic.reduce((acc, curr) => acc + curr.vehicles, 0);
  const avgCongestion = isLiveActive
    ? Math.round(liveItems.reduce((acc, c) => acc + c.congestionLevel, 0) / liveItems.length)
    : traffic.length > 0 
      ? Math.round(traffic.reduce((acc, curr) => acc + curr.congestion, 0) / traffic.length) 
      : 0;

  const criticalCount = isLiveActive
    ? liveItems.filter(c => c.congestionLevel >= 75).length
    : traffic.filter(t => t.congestion >= 75).length;

  const criticalNames = isLiveActive
    ? liveItems.filter(c => c.congestionLevel >= 75).map(c => c.location.split(' ')[0]).join(', ') || 'None'
    : traffic.filter(t => t.congestion >= 75).map(c => c.location.split(' ')[0]).join(', ') || 'None';

  const peakCongestionStr = isLiveActive
    ? `${[...liveItems].sort((a, b) => b.congestionLevel - a.congestionLevel)[0]?.congestionLevel ?? 0}%`
    : traffic.length > 0
      ? `${[...traffic].sort((a, b) => b.congestion - a.congestion)[0]?.congestion}%`
      : 'N/A';

  const peakLocationStr = isLiveActive
    ? [...liveItems].sort((a, b) => b.congestionLevel - a.congestionLevel)[0]?.location ?? 'No data'
    : traffic.length > 0
      ? [...traffic].sort((a, b) => b.congestion - a.congestion)[0]?.location
      : 'No data';

  const peakDetailStr = isLiveActive
    ? `${[...liveItems].sort((a, b) => b.congestionLevel - a.congestionLevel)[0]?.currentSpeed ?? 0} km/h live velocity`
    : traffic.length > 0
      ? `${[...traffic].sort((a, b) => b.congestion - a.congestion)[0]?.vehicles} veh/hr`
      : '';

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
              source={liveTraffic?.isLive ? 'live' : 'stored'} 
              endpoint={liveTraffic?.isLive ? '/api/live/traffic' : '/api/traffic'}
            />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Urban corridor flow monitoring, intersection density tracking, and bottlenecks analysis across Hyderabad.
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

      {/* Live TomTom Traffic Status Banner */}
      <div className={`p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        liveTraffic?.isLive 
          ? 'bg-[#F2FAF7] border-[#9CE3D1]' 
          : 'bg-[#FAF7F2] border-[#ECD9C6]'
      }`}>
        <div className="flex items-center gap-2.5">
          <Car className={`w-5 h-5 shrink-0 ${liveTraffic?.isLive ? 'text-[#188568]' : 'text-[#D97732]'}`} />
          <div>
            <span className={`font-bold ${liveTraffic?.isLive ? 'text-[#11654F]' : 'text-[#8C4318]'}`}>TomTom Traffic Flow Provider: </span>
            <span className={liveTraffic?.isLive ? 'text-[#188568]' : 'text-[#8C4318]'}>
              {liveTraffic?.isLive ? 'Active & Streaming live velocity' : 'Live traffic unavailable — TomTom API key required'}
            </span>
            {!liveTraffic?.isLive && (
              <span className="block text-[11px] text-[#697773] mt-0.5">
                Set <code className="bg-white px-1 py-0.5 rounded border border-[#ECD9C6] font-mono text-[10px] text-[#8C4318]">TRAFFIC_API_KEY</code> on server to stream live flow.
              </span>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded self-start sm:self-center font-mono ${
          liveTraffic?.isLive 
            ? 'bg-[#D1F2E9] text-[#11654F] border border-[#9CE3D1]' 
            : 'bg-[#FBE8D8] text-[#8C4318] border border-[#ECD9C6]'
        }`}>
          {liveTraffic?.isLive ? 'LIVE FEED ACTIVE' : 'KEY REQUIRED'}
        </span>
      </div>

      {/* Live TomTom Corridors Section (When Live Data Available) */}
      {isLiveActive && (
        <div className="bg-white p-5 rounded-xl border border-[#9CE3D1] shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E1E7E2]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#188568] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#188568]"></span>
              </span>
              <h2 className="text-sm font-bold text-[#202B29] uppercase tracking-wide flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#188568]" />
                Live TomTom Corridors ({liveItems.length} Monitored Segments)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#697773]">
              Provider: {liveTraffic!.provider} • Observed: {liveTraffic!.fetchedAt ? new Date(liveTraffic!.fetchedAt).toLocaleTimeString() : 'Live'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {liveItems.map((corridor, idx) => (
              <div key={idx} className="bg-[#F7F8F5] p-3 rounded-lg border border-[#E1E7E2] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#202B29] truncate" title={corridor.location}>
                      {corridor.location}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      corridor.status === 'Heavy' || corridor.status === 'Road Closed' ? 'bg-red-100 text-red-800' :
                      corridor.status === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {corridor.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-lg font-black text-[#202B29]">
                      {corridor.currentSpeed} <span className="text-xs font-normal text-[#697773]">km/h</span>
                    </span>
                    <span className="text-xs font-bold font-mono text-[#188568]">
                      {corridor.congestionLevel}% Congestion
                    </span>
                  </div>

                  <div className="w-full bg-[#E1E7E2] rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${corridor.congestionLevel}%`,
                        backgroundColor: corridor.congestionLevel > 70 ? '#D64545' : corridor.congestionLevel > 40 ? '#D97732' : '#23865D'
                      }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-[#86928E] font-mono mt-2.5 pt-1.5 border-t border-[#E1E7E2] flex justify-between">
                  <span>Free: {corridor.freeFlowSpeed} km/h</span>
                  <span>Conf: {Math.round(corridor.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traffic KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Network Congestion"
          value={avgCongestion > 0 ? `${avgCongestion}%` : 'N/A'}
          subValue={isLiveActive ? 'Live TomTom Flow' : (avgCongestion > 65 ? 'Heavy Load' : avgCongestion > 0 ? 'Moderate Flow' : 'No records')}
          icon={Gauge}
          accentColor={avgCongestion > 70 ? 'amber' : 'emerald'}
          trend={{
            value: isLiveActive ? `${liveItems.length} live TomTom corridors` : `${traffic.length} stored nodes`,
            direction: 'neutral',
          }}
        />

        <StatCard
          title={isLiveActive ? "Monitored Network Velocity" : "Total Hourly Flow Rate"}
          value={isLiveActive 
            ? `${Math.round(liveItems.reduce((acc, c) => acc + c.currentSpeed, 0) / liveItems.length)} km/h` 
            : (totalVehicles > 0 ? totalVehicles.toLocaleString() : 'N/A')}
          subValue={isLiveActive ? "Average Corridor Speed" : "Vehicles / Hour"}
          icon={TrendingUp}
          accentColor="teal"
          trend={{
            value: isLiveActive ? `Free-flow ~${Math.round(liveItems.reduce((acc, c) => acc + c.freeFlowSpeed, 0) / liveItems.length)} km/h` : `${traffic.length} stored nodes`,
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Critical Bottlenecks"
          value={criticalCount}
          subValue="Threshold > 75%"
          icon={ShieldAlert}
          accentColor="rose"
          trend={{
            value: criticalNames,
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Peak Traffic Node"
          value={peakCongestionStr}
          subValue={peakLocationStr}
          icon={Activity}
          accentColor="amber"
          trend={{
            value: peakDetailStr,
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
          {traffic.length > 0 ? (
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#697773] text-xs border border-dashed border-[#E1E7E2] rounded-lg">
              <Car className="w-8 h-8 text-[#C2CCC7] mb-2" />
              <p className="font-semibold text-[#202B29]">No traffic records stored in database yet.</p>
              <p className="text-[11px] text-[#86928E] mt-1">Live traffic stream requires TomTom API key (TRAFFIC_API_KEY).</p>
            </div>
          )}
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
              {filteredTraffic.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#697773]">
                    No traffic records found in database. Live traffic stream requires TomTom API key configuration.
                  </td>
                </tr>
              ) : (
                filteredTraffic.map((row) => (
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
                        {row.isLive ? 'LIVE' : 'STORED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
