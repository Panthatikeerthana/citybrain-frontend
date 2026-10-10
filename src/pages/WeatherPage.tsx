import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sun, 
  Thermometer, 
  CloudRain, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { DataSourceBadge } from '../components/common/DataSourceBadge';

export const WeatherPage: React.FC = () => {
  const { weather, systemStatus } = useCityBrain();

  const forecastData = weather.forecast || [
    { time: '12:00', temp: 31, rainfall: 0.0, humidity: 62 },
    { time: '14:00', temp: 33, rainfall: 0.2, humidity: 58 },
    { time: '16:00', temp: 30, rainfall: 4.5, humidity: 72 },
    { time: '18:00', temp: 28, rainfall: 12.0, humidity: 85 },
    { time: '20:00', temp: 27, rainfall: 6.8, humidity: 80 },
    { time: '22:00', temp: 26, rainfall: 1.0, humidity: 78 },
  ];

  const microClimates = [
    { location: 'Gachibowli High-Tech Ridge', temp: 30.8, humidity: 65, rainfall: 8.2, aqi: 98, status: 'Clear Sky' },
    { location: 'Secunderabad Basin', temp: 31.9, humidity: 71, rainfall: 14.0, aqi: 142, status: 'Overcast' },
    { location: 'Uppal Lowland Drainage Sector', temp: 31.2, humidity: 76, rainfall: 18.5, aqi: 154, status: 'Rain Warning' },
    { location: 'Old City / Charminar Core', temp: 32.5, humidity: 69, rainfall: 11.2, aqi: 165, status: 'Humid' },
    { location: 'Medchal North Perimeter', temp: 29.8, humidity: 74, rainfall: 6.0, aqi: 82, status: 'Light Breeze' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <CloudSun className="w-6 h-6 text-[#438C91]" />
              <span>Meteorological & Climate Intelligence</span>
            </h1>
            <DataSourceBadge 
              source={systemStatus.weatherSource === 'live' ? 'live' : 'demo'} 
              endpoint={systemStatus.weatherSource === 'live' ? '/api/weather' : undefined}
            />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time urban weather stations, precipitation modeling, and micro-climate anomaly tracking.
          </p>
        </div>

        <div className="text-xs font-mono text-[#697773] bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E1E7E2]">
          Last Synced: <span className="text-[#188568] font-bold">{systemStatus.lastChecked}</span>
        </div>
      </div>

      {/* Main Meteorological Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ambient Temperature"
          value={`${weather.temperature || 31.4}°C`}
          subValue={`Feels like ${weather.feelsLike || 34.2}°C`}
          icon={Thermometer}
          accentColor="teal"
          trend={{
            value: weather.condition || 'Partly Cloudy',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Relative Humidity"
          value={`${weather.humidity || 68}%`}
          subValue="Elevated moisture"
          icon={Droplets}
          accentColor="emerald"
          trend={{
            value: '+4% vs morning',
            direction: 'up',
          }}
        />

        <StatCard
          title="Precipitation Accumulation"
          value={`${weather.rainfall || 14.5} mm`}
          subValue="24h Recorded Sum"
          icon={CloudRain}
          accentColor={weather.rainfall && weather.rainfall > 10 ? 'amber' : 'teal'}
          trend={{
            value: 'Peak rain at 18:00',
            direction: 'up',
          }}
        />

        <StatCard
          title="Wind Velocity & Vector"
          value={`${weather.windSpeed || 18.2} km/h`}
          subValue="SSW Breeze"
          icon={Wind}
          accentColor="teal"
          trend={{
            value: `Pressure: ${weather.pressure || 1011} hPa`,
            direction: 'neutral',
          }}
        />
      </div>

      {/* Weather Forecast & Rain Chart */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#188568]" />
              <span>Hourly Temperature & Rainfall Intensity Forecast</span>
            </h2>
            <p className="text-xs text-[#697773]">Diurnal temperature curve alongside precipitation volume projection</p>
          </div>
          <span className="text-xs font-mono text-[#188568] font-semibold">Hyderabad Metro Model</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
              <XAxis dataKey="time" stroke="#697773" fontSize={11} />
              <YAxis yAxisId="left" stroke="#188568" fontSize={11} domain={[20, 40]} unit="°C" />
              <YAxis yAxisId="right" orientation="right" stroke="#438C91" fontSize={11} domain={[0, 20]} unit="mm" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="right" dataKey="rainfall" name="Rainfall (mm)" fill="#438C91" radius={[4, 4, 0, 0]} opacity={0.85} />
              <Line yAxisId="left" type="monotone" dataKey="temp" name="Temp (°C)" stroke="#188568" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Micro-Climate Zones Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#C49A24]" />
          <span>Regional Micro-Climate Station Reports</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">Station Location</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Rainfall (24h)</th>
                <th className="py-3 px-4">AQI</th>
                <th className="py-3 px-4 text-right">Weather Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {microClimates.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202B29]">{item.location}</td>
                  <td className="py-3 px-4 font-mono text-[#188568] font-bold">{item.temp}°C</td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">{item.humidity}%</td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">
                    <span className={item.rainfall > 15 ? 'text-[#D97732] font-bold' : ''}>
                      {item.rainfall} mm
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.aqi > 150 ? 'bg-[#FDF2F2] text-[#D64545] border border-[#FADCDA]' : 'bg-[#F7F8F5] text-[#202B29] border border-[#E1E7E2]'
                    }`}>
                      {item.aqi}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-[#697773] text-xs">{item.status}</span>
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
