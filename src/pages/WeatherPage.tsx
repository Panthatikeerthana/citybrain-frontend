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
  const { liveWeather, refreshLiveTelemetry, systemStatus } = useCityBrain();

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
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE • Open-Meteo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time urban weather telemetry streamed live from Open-Meteo via Spring Boot backend proxy (`/api/live/weather`).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshLiveTelemetry(true)}
            className="text-xs font-bold text-[#188568] bg-[#188568]/10 hover:bg-[#188568]/20 border border-[#188568]/30 px-3 py-1.5 rounded-lg transition-all"
          >
            Sync Live Feed
          </button>
          <div className="text-xs font-mono text-[#697773] bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E1E7E2]">
            Last Synced: <span className="text-[#188568] font-bold">{systemStatus.lastChecked}</span>
          </div>
        </div>
      </div>

      {/* Live Open-Meteo Feed Card */}
      {liveWeather ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#173D35] text-white flex items-center justify-center shadow-md">
              <CloudSun className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-800 tracking-wider uppercase">Live Meteorological Observation</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">Open-Meteo API • LIVE</span>
              </div>
              <div className="text-2xl font-black text-[#202B29] mt-0.5">
                {liveWeather.temperature}°C • <span className="text-[#188568] text-lg font-bold">{liveWeather.condition}</span>
              </div>
              <div className="text-xs text-[#697773]">
                {liveWeather.location} ({liveWeather.latitude}, {liveWeather.longitude}) • Observed: {new Date(liveWeather.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">Humidity</span>
              <span className="text-sm font-black text-[#202B29]">{liveWeather.humidity}%</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">Precipitation</span>
              <span className="text-sm font-black text-[#202B29]">{liveWeather.precipitation} mm</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">Wind Speed</span>
              <span className="text-sm font-black text-[#202B29]">{liveWeather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border border-[#E1E7E2] rounded-xl text-center text-xs text-[#697773] flex flex-col items-center justify-center gap-2">
          <CloudSun className="w-8 h-8 text-[#C2CCC7] animate-pulse" />
          <p className="font-semibold text-[#202B29]">Connecting to live Open-Meteo meteorological feed...</p>
        </div>
      )}

      {/* Main Meteorological Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ambient Temperature"
          value={liveWeather ? `${liveWeather.temperature}°C` : 'N/A'}
          subValue={liveWeather ? liveWeather.condition : 'Connecting'}
          icon={Thermometer}
          accentColor="teal"
          trend={{
            value: 'LIVE Open-Meteo',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Relative Humidity"
          value={liveWeather ? `${liveWeather.humidity}%` : 'N/A'}
          subValue="Atmospheric moisture"
          icon={Droplets}
          accentColor="emerald"
          trend={{
            value: 'Sensor reading',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Precipitation"
          value={liveWeather ? `${liveWeather.precipitation} mm` : '0 mm'}
          subValue="Current Rain Intensity"
          icon={CloudRain}
          accentColor={liveWeather && liveWeather.precipitation > 5 ? 'amber' : 'teal'}
          trend={{
            value: liveWeather && liveWeather.precipitation > 0 ? 'Precipitation active' : 'No rain',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Wind Velocity"
          value={liveWeather ? `${liveWeather.windSpeed} km/h` : 'N/A'}
          subValue="Surface wind speed"
          icon={Wind}
          accentColor="teal"
          trend={{
            value: 'Real-time telemetry',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Detailed Live Meteorological Parameter Inspector */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#C49A24]" />
          <span>Live Atmospheric Observations (Open-Meteo Stream)</span>
        </h2>

        {liveWeather ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2]">
              <span className="text-[10px] font-mono text-[#697773] uppercase tracking-wider block font-semibold mb-1">
                Spatial Coordinate
              </span>
              <p className="text-sm font-bold text-[#202B29]">{liveWeather.location}</p>
              <p className="text-xs text-[#697773] font-mono mt-1">
                Latitude: {liveWeather.latitude} • Longitude: {liveWeather.longitude}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2]">
              <span className="text-[10px] font-mono text-[#697773] uppercase tracking-wider block font-semibold mb-1">
                Observation Timestamp
              </span>
              <p className="text-sm font-bold text-[#202B29]">
                {new Date(liveWeather.observationTime).toLocaleString()}
              </p>
              <p className="text-xs text-[#188568] font-semibold mt-1">
                Status: Live verified telemetry
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2]">
              <span className="text-[10px] font-mono text-[#697773] uppercase tracking-wider block font-semibold mb-1">
                Weather Code & Condition
              </span>
              <p className="text-sm font-bold text-[#202B29]">{liveWeather.condition}</p>
              <p className="text-xs text-[#697773] font-mono mt-1">
                WMO Code: {liveWeather.weatherCode}
              </p>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[#697773] border border-dashed border-[#E1E7E2] rounded-lg">
            No live weather stream available. Click "Sync Live Feed" above to refresh.
          </div>
        )}
      </div>
    </div>
  );
};
