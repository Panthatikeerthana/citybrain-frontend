import React from 'react';
import { 
  Wind, 
  Info, 
  Activity, 
  ShieldCheck, 
  Flame 
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

export const PollutionPage: React.FC = () => {
  const { pollutionRecords } = useCityBrain();

  const avgAqi = Math.round(pollutionRecords.reduce((acc, curr) => acc + curr.aqi, 0) / pollutionRecords.length);
  const highestStation = [...pollutionRecords].sort((a, b) => b.aqi - a.aqi)[0];

  const getAqiColor = (aqi: number) => {
    if (aqi > 200) return '#D64545'; // Hazardous (Red)
    if (aqi > 150) return '#D97732'; // Unhealthy (Orange)
    if (aqi > 100) return '#C49A24'; // Moderate (Amber)
    return '#23865D'; // Good (Green)
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Wind className="w-6 h-6 text-[#438C91]" />
              <span>Air Quality Index & Ambient Emissions</span>
            </h1>
            <DataSourceBadge source="simulated" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Simulated continuous ambient air quality monitoring stations (CAAQMS) for urban dispersion analysis.
          </p>
        </div>

        {/* Disclaimer Banner */}
        <div className="flex items-center gap-2 text-xs text-[#C49A24] bg-[#FEF9EC] border border-[#FCEBCE] p-2.5 rounded-lg font-medium">
          <Info className="w-4 h-4 shrink-0 text-[#C49A24]" />
          <span>Illustrative simulation model — Not certified regulatory sensor data.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="City-Wide Average AQI"
          value={avgAqi}
          subValue="Air Quality Index"
          icon={Wind}
          accentColor={avgAqi > 150 ? 'rose' : avgAqi > 100 ? 'amber' : 'teal'}
          trend={{
            value: 'Moderate / Sensitive',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Worst Affected Area"
          value={highestStation ? highestStation.stationName.split(' ')[0] : 'LB Nagar'}
          subValue={`AQI ${highestStation ? highestStation.aqi : 178}`}
          icon={Flame}
          accentColor="rose"
          trend={{
            value: 'Dominant: PM2.5',
            direction: 'up',
          }}
        />

        <StatCard
          title="Primary Pollutant"
          value="PM 2.5"
          subValue="Fine inhalable particulate"
          icon={Activity}
          accentColor="amber"
          trend={{
            value: 'Avg 60.2 µg/m³',
            direction: 'up',
          }}
        />

        <StatCard
          title="Green Belt Air Index"
          value="48 AQI"
          subValue="Univ of Hyderabad"
          icon={ShieldCheck}
          accentColor="emerald"
          trend={{
            value: 'Good / Optimal',
            direction: 'down',
          }}
        />
      </div>

      {/* AQI Comparison Chart */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#188568]" />
              <span>Station-Wise Air Quality Index (AQI)</span>
            </h2>
            <p className="text-xs text-[#697773]">Continuous particulate matter and gaseous sensor telemetry</p>
          </div>
          <span className="text-xs font-mono text-[#697773]">CPCB Scale Compliant</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pollutionRecords} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
              <XAxis dataKey="stationName" stroke="#697773" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#697773" fontSize={11} domain={[0, 250]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                formatter={(val: any) => [`AQI ${val}`, 'Air Quality Index']}
              />
              <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                {pollutionRecords.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getAqiColor(entry.aqi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Station Pollution Breakdown Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4">Ambient Air Pollution Station Readings</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">Station Name</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">AQI Value</th>
                <th className="py-3 px-4">PM2.5 (µg/m³)</th>
                <th className="py-3 px-4">PM10 (µg/m³)</th>
                <th className="py-3 px-4">NO2</th>
                <th className="py-3 px-4">Dominant</th>
                <th className="py-3 px-4 text-right">Air Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {pollutionRecords.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#202B29]">{item.stationName}</td>
                  <td className="py-3 px-4 text-[#697773]">{item.zone}</td>
                  <td className="py-3 px-4">
                    <span 
                      className="font-mono font-bold px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: getAqiColor(item.aqi) }}
                    >
                      {item.aqi}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">{item.pm25}</td>
                  <td className="py-3 px-4 font-mono text-[#202B29]">{item.pm10}</td>
                  <td className="py-3 px-4 font-mono text-[#697773]">{item.no2}</td>
                  <td className="py-3 px-4 font-mono text-[#188568] font-bold">{item.dominantPollutant}</td>
                  <td className="py-3 px-4 text-right">
                    <SeverityBadge severity={item.status} size="sm" />
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
