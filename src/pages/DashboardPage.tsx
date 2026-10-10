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
  Bot
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
    waterIssues,
    wasteRecords
  } = useCityBrain();


  // Metrics
  const highPriorityEmergencies = emergencies.filter(e => e.severity === 'Critical' || e.severity === 'High');
  const avgCongestion = traffic.length > 0 
    ? Math.round(traffic.reduce((acc, curr) => acc + curr.congestion, 0) / traffic.length) 
    : 62;
  const activeComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;

  // Chart data: Traffic congestion rankings
  const trafficChartData = traffic.slice(0, 6).map(t => ({
    name: t.location.split(' ')[0],
    congestion: t.congestion,
    vehicles: t.vehicles,
    status: t.status,
  }));

  // Chart data: Environmental hourly simulation trends
  const envTrendData = [
    { time: '06:00', aqi: 110, temp: 24, humidity: 82 },
    { time: '09:00', aqi: 145, temp: 28, humidity: 74 },
    { time: '12:00', aqi: 168, temp: 33, humidity: 55 },
    { time: '15:00', aqi: 152, temp: 34, humidity: 52 },
    { time: '18:00', aqi: 178, temp: 29, humidity: 68 },
    { time: '21:00', aqi: 160, temp: 27, humidity: 75 },
  ];

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
              source={systemStatus.trafficSource === 'live' ? 'live' : 'demo'} 
              endpoint={systemStatus.trafficSource === 'live' ? '/api/traffic' : undefined} 
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active City Incidents"
          value={emergencies.length}
          subValue={`${highPriorityEmergencies.length} High Priority`}
          icon={AlertTriangle}
          accentColor={highPriorityEmergencies.length > 0 ? 'rose' : 'amber'}
          trend={{
            value: '+2 new',
            direction: 'up',
            label: 'past hour',
          }}
          onClick={() => navigate('/emergency')}
        />

        <StatCard
          title="Traffic Congestion Index"
          value={`${avgCongestion}%`}
          subValue={systemStatus.trafficSource === 'live' ? 'Live Telemetry' : 'Demo Sensor Grid'}
          icon={Car}
          accentColor={avgCongestion > 70 ? 'amber' : 'emerald'}
          trend={{
            value: avgCongestion > 65 ? '+5.4%' : '-2.1%',
            direction: avgCongestion > 65 ? 'up' : 'down',
            label: 'vs 1hr avg',
          }}
          onClick={() => navigate('/traffic')}
        />

        <StatCard
          title="Environmental Status"
          value={`${weather.temperature || 31.4}°C`}
          subValue={`AQI 142 • ${weather.condition || 'Partly Cloudy'}`}
          icon={CloudSun}
          accentColor="teal"
          trend={{
            value: `${weather.rainfall || 14.5}mm`,
            direction: 'neutral',
            label: 'Rainfall',
          }}
          onClick={() => navigate('/weather')}
        />

        <StatCard
          title="Citizen Complaints"
          value={activeComplaintsCount}
          subValue="Local Portal Queue"
          icon={FileText}
          accentColor="emerald"
          trend={{
            value: `${complaints.filter(c => c.status === 'Resolved').length} resolved`,
            direction: 'down',
            label: 'today',
          }}
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
                <span>Major Corridor Congestion Levels</span>
              </h2>
              <p className="text-xs text-[#697773]">Peak flow velocity & bottleneck indicators</p>
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
          </div>

          <div className="mt-4 pt-3 border-t border-[#E1E7E2] flex items-center justify-between text-xs text-[#697773]">
            <span>Highest Bottleneck: <strong className="text-[#D64545]">Hitec City (88%)</strong></span>
            <span className="font-mono text-[11px]">Threshold: 75% Alarm</span>
          </div>
        </div>

        {/* Chart 2: Environmental Trends (AQI & Temp) */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Wind className="w-4 h-4 text-[#438C91]" />
                <span>Atmospheric Trends & AQI Curve</span>
              </h2>
              <p className="text-xs text-[#697773]">Simulated diurnal pollution & temperature cycle</p>
            </div>
            <DataSourceBadge source="simulated" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={envTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
                <XAxis dataKey="time" stroke="#697773" fontSize={11} />
                <YAxis stroke="#697773" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="aqi" stroke="#C49A24" fill="#C49A24" fillOpacity={0.15} name="AQI (Simulated)" />
                <Area type="monotone" dataKey="temp" stroke="#188568" fill="#188568" fillOpacity={0.15} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E1E7E2] flex items-center justify-between text-xs text-[#697773]">
            <span>Peak AQI: <strong className="text-[#D97732]">178 (Moderate/Unhealthy)</strong></span>
            <span className="font-mono text-[11px]">Auto-refresh 30s</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Priority Incidents & Predicted City Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Incidents */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D64545]" />
              <span>Live Emergency Incidents</span>
            </h2>
            <button
              onClick={() => navigate('/emergency')}
              className="text-xs text-[#188568] hover:text-[#11654F] font-semibold"
            >
              Dispatch Center →
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {emergencies.slice(0, 3).map((incident) => (
              <div
                key={incident.id}
                onClick={() => navigate('/emergency')}
                className="p-3.5 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#202B29] group-hover:text-[#188568] transition-colors">
                    {incident.title}
                  </span>
                  <SeverityBadge severity={incident.severity} size="sm" />
                </div>
                <p className="text-xs text-[#697773] line-clamp-1 mb-2">
                  {incident.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#697773] font-mono">
                  <span>📍 {incident.location}</span>
                  <span className="text-[#188568] font-semibold">{incident.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI Predictive Risk Flagging */}
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#188568]" />
              <h2 className="text-base font-bold text-[#202B29]">
                Predictive Risk Matrix
              </h2>
            </div>
            <DataSourceBadge source="rule-based" />
          </div>

          <div className="space-y-3 flex-1">
            {riskPredictions.slice(0, 3).map((risk) => (
              <div
                key={risk.id}
                onClick={() => navigate('/risk-prediction')}
                className="p-3.5 rounded-lg bg-[#F2FAF7] border border-[#E2F4EF] hover:border-[#188568]/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#202B29] group-hover:text-[#188568] transition-colors">
                    {risk.title}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#11654F] border border-[#9CE3D1]">
                    Risk {risk.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-[#4E5F5B] mb-2 font-sans">
                  💡 <strong className="text-[#11654F]">Action:</strong> {risk.recommendedAction}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#697773] font-mono">
                  <span>Horizon: {risk.timeHorizon}</span>
                  <SeverityBadge severity={risk.severity} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Matrix to All Smart City Pillars */}
      <div className="bg-white p-6 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#188568]" />
          <span>Integrated Urban Operations Hub</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Traffic Control', path: '/traffic', count: `${traffic.length} Nodes`, icon: Car, color: 'text-[#188568]' },
            { label: 'Water Utilities', path: '/water', count: `${waterIssues.length} Incidents`, icon: Droplets, color: 'text-[#438C91]' },
            { label: 'Solid Waste', path: '/waste', count: `${wasteRecords.length} Zones`, icon: Trash2, color: 'text-[#C49A24]' },
            { label: 'Air Pollution', path: '/pollution', count: '5 CAAQMS', icon: Wind, color: 'text-[#438C91]' },
            { label: 'What-If Sim', path: '/simulator', count: 'Interactive', icon: Sliders, color: 'text-[#188568]' },
            { label: 'AI Assistant', path: '/assistant', count: 'Query Engine', icon: Bot, color: 'text-[#188568]' },
          ].map((mod, idx) => (
            <div
              key={idx}
              onClick={() => navigate(mod.path)}
              className="p-3.5 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/50 hover:bg-white transition-all cursor-pointer text-center group shadow-sm"
            >
              <mod.icon className={`w-5 h-5 mx-auto mb-2 ${mod.color} group-hover:scale-105 transition-transform`} />
              <div className="text-xs font-semibold text-[#202B29] group-hover:text-[#188568]">{mod.label}</div>
              <div className="text-[10px] text-[#697773] font-mono mt-0.5">{mod.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
