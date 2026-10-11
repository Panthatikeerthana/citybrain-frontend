import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  Wind, 
  CloudSun, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  Sliders, 
  Radio,
  RefreshCw,
  Gauge,
  Thermometer,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    traffic, 
    weather, 
    emergencies, 
    complaints, 
    riskPredictions, 
    systemStatus,
    liveWeather,
    livePollution,
    liveTraffic,
    refreshLiveTelemetry,
    waterIssues,
    wasteRecords,
    pollutionRecords
  } = useCityBrain();

  // Metrics
  const highPriorityEmergencies = emergencies.filter(e => e.severity === 'Critical' || e.severity === 'High');
  const avgCongestion = traffic.length > 0 
    ? Math.round(traffic.reduce((acc, curr) => acc + curr.congestion, 0) / traffic.length) 
    : (liveTraffic?.configured && liveTraffic.items && liveTraffic.items.length > 0 ? liveTraffic.items[0].congestionLevel : null);
  const activeComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

  // Chart data: Traffic congestion rankings from verified records
  const trafficChartData = traffic.slice(0, 6).map(t => ({
    name: t.location.split(' ')[0],
    congestion: t.congestion,
    vehicles: t.vehicles,
    status: t.status,
  }));

  // Dynamic Environmental Trend points from verified live telemetry or stored records
  const envTrendData = pollutionRecords.length > 0 
    ? pollutionRecords.slice(0, 6).map(p => ({
        time: (p.location || 'Station').split(' ')[0],
        aqi: p.aqi || 0,
        pm25: p.pm25 || 0,
      }))
    : livePollution 
    ? [{ time: 'Live Now', aqi: livePollution.aqi, pm25: livePollution.pm25 }]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202B29] tracking-tight">
              City Brain Command Center
            </h1>
            <DataSourceBadge 
              source={liveTraffic?.configured ? 'live' : 'hybrid'} 
              endpoint="/api/live" 
            />
          </div>
          <p className="text-sm text-[#697773]">
            Intelligent urban telemetry, anomaly detection, predictive risk modeling, and multi-agency coordination.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F7F8F5] text-[#202B29] text-xs font-semibold border border-[#E1E7E2] transition-colors shadow-sm"
          >
            <span>Open Spatial Map</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#188568]" />
          </button>
          <button
            onClick={() => navigate('/simulator')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#188568] hover:bg-[#11654F] text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Run What-If Simulation</span>
          </button>
        </div>
      </div>

      {/* Phase 4: Real-Time Urban Telemetry Feeds Grid */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E1E7E2] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#188568]/10 text-[#188568] flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 text-[#188568]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#202B29]">Live Telemetry Stream</h2>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE EXTERNAL FEEDS
                </span>
              </div>
              <p className="text-xs text-[#697773]">
                Direct telemetry via Spring Boot backend proxy (`/api/live/*`) • Cached 2–5m
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-[#697773] font-mono">
              Last sync: {liveWeather?.observationTime ? new Date(liveWeather.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
            </span>
            <button
              onClick={() => refreshLiveTelemetry(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E1E7E2] hover:bg-[#F7F8F5] text-xs text-[#202B29] transition-all"
              title="Force Refresh Live Telemetry"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#188568]" />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Card 1: Live Weather */}
          <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#E1E7E2] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#697773] uppercase tracking-wider flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                  Live Weather
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Open-Meteo • LIVE
                </span>
              </div>
              {liveWeather ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#202B29]">
                      {liveWeather.temperature}°C
                    </span>
                    <span className="text-xs font-semibold text-[#188568]">
                      {liveWeather.condition}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#697773] font-sans">
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">Humidity</span>
                      <span className="font-bold text-[#202B29]">{liveWeather.humidity}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">Precip</span>
                      <span className="font-bold text-[#202B29]">{liveWeather.precipitation} mm</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">Wind</span>
                      <span className="font-bold text-[#202B29]">{liveWeather.windSpeed} km/h</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-xs text-[#697773] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#188568]" />
                  <span>Connecting to Open-Meteo live weather stream...</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#86928E] font-mono mt-3 pt-2 border-t border-[#E1E7E2] flex justify-between">
              <span>{liveWeather?.location || 'Greater Hyderabad'}</span>
              <span>Observed: {liveWeather?.observationTime ? new Date(liveWeather.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
            </div>
          </div>

          {/* Card 2: Live Air Quality */}
          <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#E1E7E2] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#697773] uppercase tracking-wider flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  Live Air Quality
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Open-Meteo AQI • LIVE
                </span>
              </div>
              {livePollution ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#202B29]">
                      AQI {livePollution.aqi}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      livePollution.aqi > 150 ? 'bg-red-100 text-red-800' :
                      livePollution.aqi > 100 ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {livePollution.category}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#697773] font-sans">
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">PM2.5</span>
                      <span className="font-bold text-[#202B29]">{livePollution.pm25} µg/m³</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">PM10</span>
                      <span className="font-bold text-[#202B29]">{livePollution.pm10} µg/m³</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#E1E7E2]">
                      <span className="block text-[10px] text-[#86928E]">Dominant</span>
                      <span className="font-bold text-[#202B29]">{livePollution.dominantPollutant}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-xs text-[#697773] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#188568]" />
                  <span>Connecting to Open-Meteo air quality stream...</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-[#86928E] font-mono mt-3 pt-2 border-t border-[#E1E7E2] flex justify-between">
              <span>{livePollution?.location || 'Greater Hyderabad'}</span>
              <span>Observed: {livePollution?.observationTime ? new Date(livePollution.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
            </div>
          </div>

          {/* Card 3: Live Traffic Integration */}
          <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#E1E7E2] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#697773] uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  Live Traffic Telemetry
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  TomTom Flow API
                </span>
              </div>

              {liveTraffic?.configured && liveTraffic.items && liveTraffic.items.length > 0 ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#202B29]">
                      {liveTraffic.items[0].congestionLevel}% Congestion
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      {liveTraffic.items[0].status}
                    </span>
                  </div>
                  <div className="mt-3 bg-white p-2.5 rounded-lg border border-[#E1E7E2] text-xs">
                    <span className="font-semibold text-[#202B29]">{liveTraffic.items[0].location}</span>: {liveTraffic.items[0].currentSpeed} km/h (Free-flow: {liveTraffic.items[0].freeFlowSpeed} km/h)
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Live traffic unavailable — TomTom API key required</span>
                  </div>
                  <p className="text-[11px] text-[#697773] leading-relaxed">
                    Set <code className="bg-white px-1 py-0.5 rounded border border-[#E1E7E2] text-[#202B29] font-mono text-[10px]">TRAFFIC_API_KEY</code> on server to stream live velocity.
                  </p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-[#86928E] font-mono mt-3 pt-2 border-t border-[#E1E7E2] flex justify-between">
              <span>Database Records</span>
              <span>{traffic.length} nodes recorded</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active City Incidents"
          value={emergencies.length}
          subValue={emergencies.length === 0 ? "No active incidents" : `${highPriorityEmergencies.length} High Priority`}
          icon={AlertTriangle}
          accentColor={highPriorityEmergencies.length > 0 ? 'rose' : 'amber'}
          onClick={() => navigate('/emergency')}
        />

        <StatCard
          title="Traffic Congestion Index"
          value={avgCongestion !== null ? `${avgCongestion}%` : 'Unavailable'}
          subValue={liveTraffic?.configured ? 'Live TomTom Telemetry' : (traffic.length > 0 ? 'Database Average' : 'Key Required')}
          icon={Car}
          accentColor={avgCongestion !== null && avgCongestion > 70 ? 'amber' : 'emerald'}
          onClick={() => navigate('/traffic')}
        />

        <StatCard
          title="Environmental Status"
          value={liveWeather ? `${liveWeather.temperature}°C` : 'Connecting...'}
          subValue={livePollution ? `AQI ${livePollution.aqi} • ${liveWeather?.condition || livePollution.category}` : 'Live stream active'}
          icon={CloudSun}
          accentColor="teal"
          onClick={() => navigate('/weather')}
        />

        <StatCard
          title="Citizen Complaints"
          value={activeComplaintsCount}
          subValue={complaints.length === 0 ? "No complaints recorded yet" : `${complaints.filter(c => c.status === 'Resolved').length} resolved`}
          icon={FileText}
          accentColor="emerald"
          onClick={() => navigate('/complaints')}
        />
      </div>

      {/* Main Charts & Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Traffic Congestion by Major Junction */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Car className="w-4 h-4 text-[#188568]" />
                <span>Corridor Congestion Levels</span>
              </h2>
              <p className="text-xs text-[#697773]">Database-persisted corridor records</p>
            </div>
            <button
              onClick={() => navigate('/traffic')}
              className="text-xs text-[#188568] hover:text-[#11654F] font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            {trafficChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trafficChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
                  <XAxis dataKey="name" stroke="#697773" fontSize={11} />
                  <YAxis stroke="#697773" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    formatter={(val: any) => [`${val}%`, 'Congestion Level']}
                  />
                  <Bar dataKey="congestion" fill="#188568" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#697773] text-xs border border-dashed border-[#E1E7E2] rounded-lg">
                <Car className="w-6 h-6 text-[#C2CCC7] mb-1" />
                <span>No traffic records in database yet.</span>
                <span className="text-[11px] text-[#86928E]">Add records via Traffic module or stream via TomTom API.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Environmental Trends */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#188568]" />
                <span>Environmental Monitoring</span>
              </h2>
              <p className="text-xs text-[#697773]">Air Quality Index (AQI) readings</p>
            </div>
            <button
              onClick={() => navigate('/pollution')}
              className="text-xs text-[#188568] hover:text-[#11654F] font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            {envTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={envTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#188568" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#188568" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
                  <XAxis dataKey="time" stroke="#697773" fontSize={11} />
                  <YAxis stroke="#697773" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  />
                  <Area type="monotone" dataKey="aqi" stroke="#188568" fillOpacity={1} fill="url(#aqiGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#697773] text-xs border border-dashed border-[#E1E7E2] rounded-lg">
                <Wind className="w-6 h-6 text-[#C2CCC7] mb-1" />
                <span>No pollution records logged in database yet.</span>
                <span className="text-[11px] text-[#86928E]">Live telemetry is active above via Open-Meteo.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
