import React, { useState } from 'react';
import { 
  Wind, 
  Activity, 
  ShieldCheck, 
  Flame,
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Database
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
import { PollutionRecord, SeverityLevel } from '../types';
import { 
  createPollutionRecord, 
  updatePollutionRecord, 
  deletePollutionRecord 
} from '../services/pollutionService';

export const PollutionPage: React.FC = () => {
  const { pollutionRecords, livePollution, refreshLiveTelemetry, refreshAllData } = useCityBrain();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PollutionRecord | null>(null);

  const [createForm, setCreateForm] = useState({
    location: '',
    aqi: 95,
    pm25: 42.0,
    pm10: 80.0,
    status: 'Moderate',
  });

  const [editForm, setEditForm] = useState({
    location: '',
    aqi: 0,
    pm25: 0,
    pm10: 0,
    status: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const avgAqi = pollutionRecords.length 
    ? Math.round(pollutionRecords.reduce((acc, curr) => acc + curr.aqi, 0) / pollutionRecords.length)
    : 0;
  const highestStation = [...pollutionRecords].sort((a, b) => b.aqi - a.aqi)[0];

  const getAqiColor = (aqi: number) => {
    if (aqi > 200) return '#D64545';
    if (aqi > 150) return '#D97732';
    if (aqi > 100) return '#C49A24';
    return '#23865D';
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.location.trim()) {
      setActionError('Location is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await createPollutionRecord({
        location: createForm.location,
        aqi: Number(createForm.aqi),
        pm25: Number(createForm.pm25),
        pm10: Number(createForm.pm10),
        status: createForm.status,
      });

      await refreshAllData();
      setActionSuccess('Pollution record stored in MySQL.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        location: '',
        aqi: 95,
        pm25: 42.0,
        pm10: 80.0,
        status: 'Moderate',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create pollution record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      await updatePollutionRecord(editingItem.id, {
        location: editForm.location,
        aqi: Number(editForm.aqi),
        pm25: Number(editForm.pm25),
        pm10: Number(editForm.pm10),
        status: editForm.status,
      });

      await refreshAllData();
      setActionSuccess(`Pollution record #${editingItem.id} updated in MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingItem(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Delete pollution station record #${id} from MySQL?`)) return;

    setDeletingId(id);
    setActionError(null);

    try {
      await deletePollutionRecord(id);
      await refreshAllData();
      setActionSuccess(`Record #${id} deleted from MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item: PollutionRecord) => {
    setEditingItem(item);
    setEditForm({
      location: item.location || item.stationName || '',
      aqi: item.aqi,
      pm25: item.pm25,
      pm10: item.pm10,
      status: item.status,
    });
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
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Continuous ambient air quality monitoring telemetry backed by MySQL `pollution_records`.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAllData()}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#188568]" />
            <span>Sync DB</span>
          </button>

          <button
            onClick={() => {
              setShowCreateModal(true);
              setActionError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#438C91] hover:bg-[#347277] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Sensor Station</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#F2FAF7] border border-[#9CE3D1] rounded-lg text-xs text-[#11654F] flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#188568] shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-[#FDF2F2] border border-[#FADCDA] rounded-lg text-xs text-[#D64545] flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-[#D64545] shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Phase 4: Live Open-Meteo Air Quality Telemetry Card */}
      {livePollution && (
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-white p-5 rounded-xl border border-teal-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#173D35] text-white flex items-center justify-center shadow-md">
              <Wind className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-teal-800 tracking-wider uppercase">Live Air Quality Observation</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-200 text-teal-900 font-bold">Open-Meteo AQI</span>
              </div>
              <div className="text-2xl font-black text-[#202B29] mt-0.5">
                US AQI {livePollution.aqi} • <span className="text-[#188568] text-lg font-bold">{livePollution.category}</span>
              </div>
              <div className="text-xs text-[#697773]">
                {livePollution.location} • European AQI: {livePollution.europeanAqi} • Observed: {new Date(livePollution.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-2 rounded-lg border border-teal-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">PM2.5</span>
              <span className="text-sm font-black text-[#202B29]">{livePollution.pm25} µg/m³</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-teal-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">PM10</span>
              <span className="text-sm font-black text-[#202B29]">{livePollution.pm10} µg/m³</span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-teal-200 text-center">
              <span className="text-[10px] text-[#86928E] block uppercase font-bold">Dominant</span>
              <span className="text-sm font-black text-[#202B29]">{livePollution.dominantPollutant}</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Stations"
          value={pollutionRecords.length}
          subValue="MySQL Table: pollution_records"
          icon={Database}
          accentColor={avgAqi > 150 ? 'rose' : avgAqi > 100 ? 'amber' : 'teal'}
          trend={{
            value: 'Live MySQL Grid',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Average AQI"
          value={avgAqi}
          subValue="Air Quality Index"
          icon={Wind}
          accentColor={avgAqi > 150 ? 'rose' : avgAqi > 100 ? 'amber' : 'teal'}
          trend={{
            value: avgAqi > 100 ? 'Sensitive / Unhealthy' : 'Moderate',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Peak Pollution Zone"
          value={highestStation ? (highestStation.location || highestStation.stationName) : 'None'}
          subValue={`AQI ${highestStation ? highestStation.aqi : 0}`}
          icon={Flame}
          accentColor="rose"
          trend={{
            value: 'CPCB Guidelines',
            direction: 'up',
          }}
        />

        <StatCard
          title="Air Safety Index"
          value={avgAqi < 100 ? 'Good' : 'Elevated'}
          subValue="Sector-wide average"
          icon={ShieldCheck}
          accentColor="emerald"
          trend={{
            value: 'Hyderabad Air Grid',
            direction: 'neutral',
          }}
        />
      </div>

      {/* AQI Comparison Chart */}
      {pollutionRecords.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#188568]" />
                <span>Station-Wise Air Quality Index (AQI)</span>
              </h2>
              <p className="text-xs text-[#697773]">Sensor telemetry persisted in MySQL</p>
            </div>
            <span className="text-xs font-mono text-[#697773]">CPCB Scale</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutionRecords} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
                <XAxis dataKey="location" stroke="#697773" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#697773" fontSize={11} domain={[0, 300]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px' }}
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
      )}

      {/* Station Pollution Breakdown Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <h2 className="text-base font-bold text-[#202B29] mb-4">Ambient Air Pollution Station Readings ({pollutionRecords.length} in MySQL)</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">DB ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">AQI Value</th>
                <th className="py-3 px-4">PM2.5</th>
                <th className="py-3 px-4">PM10</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {pollutionRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#697773]">
                    No pollution records stored in database yet. Click "Log Sensor Station" above to record real sensor measurements, or view the live Open-Meteo AQI above.
                  </td>
                </tr>
              ) : (
                pollutionRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#188568] font-bold">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#202B29]">{item.location}</td>
                    <td className="py-3 px-4">
                      <span 
                        className="font-mono font-bold px-2 py-0.5 rounded text-white text-xs"
                        style={{ backgroundColor: getAqiColor(item.aqi) }}
                      >
                        {item.aqi}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#202B29]">{item.pm25} µg/m³</td>
                    <td className="py-3 px-4 font-mono text-[#202B29]">{item.pm10} µg/m³</td>
                    <td className="py-3 px-4">
                      <SeverityBadge severity={item.status as SeverityLevel || 'Moderate'} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#188568]"
                          title="Edit in MySQL"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 bg-white hover:bg-[#FDF2F2] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#D64545]"
                          title="Delete from MySQL"
                        >
                          {deletingId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D64545]" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29]">Log Pollution Reading (MySQL)</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-[#697773]" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Uppal Junction"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">AQI</label>
                  <input
                    type="number"
                    value={createForm.aqi}
                    onChange={(e) => setCreateForm({ ...createForm, aqi: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">PM2.5</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.pm25}
                    onChange={(e) => setCreateForm({ ...createForm, pm25: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">PM10</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.pm10}
                    onChange={(e) => setCreateForm({ ...createForm, pm10: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status Category</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Unhealthy">Unhealthy</option>
                  <option value="Very Unhealthy">Very Unhealthy</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#438C91] text-white rounded text-xs font-bold">Save in MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29]">Edit Reading #{editingItem.id}</h3>
              <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-[#697773]" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">AQI</label>
                  <input
                    type="number"
                    value={editForm.aqi}
                    onChange={(e) => setEditForm({ ...editForm, aqi: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">PM2.5</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.pm25}
                    onChange={(e) => setEditForm({ ...editForm, pm25: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">PM10</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.pm10}
                    onChange={(e) => setEditForm({ ...editForm, pm10: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                >
                  <option value="Good">Good</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Unhealthy">Unhealthy</option>
                  <option value="Very Unhealthy">Very Unhealthy</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#438C91] text-white rounded text-xs font-bold">Update in MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
