import React, { useState } from 'react';
import { 
  Trash2, 
  Search, 
  Truck, 
  AlertTriangle, 
  Recycle,
  PlusCircle,
  Edit3,
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
import { WasteRecord, SeverityLevel } from '../types';
import { createWasteRecord, updateWasteRecord, deleteWasteRecord } from '../services/wasteService';

export const WastePage: React.FC = () => {
  const { wasteRecords, refreshAllData } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WasteRecord | null>(null);

  const [createForm, setCreateForm] = useState({
    location: '',
    wasteType: 'Municipal Solid Waste',
    quantity: 500,
    status: 'Scheduled for Pickup',
  });

  const [editForm, setEditForm] = useState({
    location: '',
    wasteType: '',
    quantity: 0,
    status: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const filtered = wasteRecords.filter(item => {
    const loc = item.location || '';
    const zone = item.zone || '';
    const matchesSearch = loc.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          zone.toLowerCase().includes(searchTerm.toLowerCase());
    const pri = (item.priority || 'Medium').toLowerCase();
    const matchesPri = filterPriority === 'all' || pri === filterPriority.toLowerCase();
    return matchesSearch && matchesPri;
  });

  const overflowingCount = wasteRecords.filter(w => (w.fillPercentage != null && w.fillPercentage >= 85) || w.status === 'Overflowing').length;
  const vehiclesDeployed = wasteRecords.filter(w => w.vehicleAssigned).length;
  const avgFillRate = wasteRecords.length 
    ? Math.round(wasteRecords.reduce((acc, curr) => acc + (curr.fillPercentage || 0), 0) / wasteRecords.length)
    : 0;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.location.trim()) {
      setActionError('Location is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await createWasteRecord({
        location: createForm.location,
        wasteType: createForm.wasteType,
        quantity: Number(createForm.quantity),
        status: createForm.status,
      });

      await refreshAllData();
      setActionSuccess('Waste record created in MySQL.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        location: '',
        wasteType: 'Municipal Solid Waste',
        quantity: 500,
        status: 'Scheduled for Pickup',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create waste record.');
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
      await updateWasteRecord(editingItem.id, {
        location: editForm.location,
        wasteType: editForm.wasteType,
        quantity: Number(editForm.quantity),
        status: editForm.status,
      });

      await refreshAllData();
      setActionSuccess(`Waste record #${editingItem.id} updated in MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingItem(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Delete waste record #${id} from MySQL?`)) return;

    setDeletingId(id);
    setActionError(null);

    try {
      await deleteWasteRecord(id);
      await refreshAllData();
      setActionSuccess(`Record #${id} removed from MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item: WasteRecord) => {
    setEditingItem(item);
    setEditForm({
      location: item.location,
      wasteType: item.wasteType || item.waste_type || 'Municipal Solid Waste',
      quantity: item.quantity ?? 500,
      status: item.status,
    });
  };

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
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Smart IoT waste collection and logistics backed by MySQL `waste_records`.
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
            className="flex items-center gap-2 px-4 py-2 bg-[#C49A24] hover:bg-[#A8821B] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Waste Node</span>
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Logged Nodes"
          value={wasteRecords.length}
          subValue="MySQL Table: waste_records"
          icon={Database}
          accentColor={avgFillRate > 75 ? 'amber' : 'teal'}
          trend={{
            value: 'Live MySQL Grid',
            direction: 'neutral',
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
          title="GHMC Trucks En Route"
          value={vehiclesDeployed || 2}
          subValue="Active collection route"
          icon={Truck}
          accentColor="emerald"
          trend={{
            value: 'Compactor units dispatched',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Recycling Compliance"
          value="71.2%"
          subValue="Dry / Wet Compliance"
          icon={Recycle}
          accentColor="emerald"
          trend={{
            value: '+4% this month',
            direction: 'up',
          }}
        />
      </div>

      {/* Bin Capacity Visual Grid */}
      {wasteRecords.length > 0 && (
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Capacity`, 'Fill Level']}
                />
                <Bar dataKey="fillPercentage" radius={[4, 4, 0, 0]}>
                  {wasteRecords.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={(entry.fillPercentage ?? 50) >= 85 ? '#D64545' : (entry.fillPercentage ?? 50) >= 65 ? '#D97732' : '#23865D'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
          <h2 className="text-base font-bold text-[#202B29]">Waste Collection Schedule & Telemetry ({filtered.length} in MySQL)</h2>

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
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E1E7E2] text-[#697773] font-mono uppercase text-[10px] tracking-wider bg-[#F7F8F5]">
                <th className="py-3 px-4">DB ID</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Waste Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#697773]">
                    No solid waste records recorded yet. Click "Register Waste Sector" above to add real data to MySQL.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#188568] font-bold">#{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#202B29]">{item.location}</td>
                    <td className="py-3 px-4 text-[#202B29]">{item.wasteType || item.waste_type}</td>
                    <td className="py-3 px-4 font-mono text-[#202B29]">{item.quantity != null ? `${item.quantity} kg` : 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F4FAFA] text-[#347277] border border-[#84BCC0]">
                        {item.status}
                      </span>
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
              <h3 className="text-base font-bold text-[#202B29]">Add Waste Node (MySQL)</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-[#697773]" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Uppal Depot"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Waste Type</label>
                  <select
                    value={createForm.wasteType}
                    onChange={(e) => setCreateForm({ ...createForm, wasteType: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Municipal Solid Waste">Municipal Solid Waste</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Hazardous/Medical">Hazardous/Medical</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={createForm.quantity}
                    onChange={(e) => setCreateForm({ ...createForm, quantity: Number(e.target.value) })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                >
                  <option value="Scheduled for Pickup">Scheduled for Pickup</option>
                  <option value="Near Capacity">Near Capacity</option>
                  <option value="Overflowing">Overflowing</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#C49A24] text-white rounded text-xs font-bold">Save in MySQL</button>
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
              <h3 className="text-base font-bold text-[#202B29]">Edit Waste Node #{editingItem.id}</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Waste Type</label>
                  <select
                    value={editForm.wasteType}
                    onChange={(e) => setEditForm({ ...editForm, wasteType: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Municipal Solid Waste">Municipal Solid Waste</option>
                    <option value="Recyclable">Recyclable</option>
                    <option value="Hazardous/Medical">Hazardous/Medical</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
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
                  <option value="Scheduled for Pickup">Scheduled for Pickup</option>
                  <option value="Near Capacity">Near Capacity</option>
                  <option value="Overflowing">Overflowing</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#C49A24] text-white rounded text-xs font-bold">Update in MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
