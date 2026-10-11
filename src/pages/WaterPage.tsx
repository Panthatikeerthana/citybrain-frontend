import React, { useState } from 'react';
import { 
  Droplets, 
  Search, 
  AlertTriangle, 
  Gauge, 
  Users, 
  Wrench, 
  Activity,
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
  CartesianGrid 
} from 'recharts';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { WaterIssue, SeverityLevel } from '../types';
import { createWaterIssue, updateWaterIssue, deleteWaterIssue } from '../services/waterService';

export const WaterPage: React.FC = () => {
  const { waterIssues, refreshAllData } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WaterIssue | null>(null);

  const [createForm, setCreateForm] = useState({
    location: '',
    issueType: 'Pipeline Leakage',
    severity: 'High',
    description: '',
    status: 'Reported',
  });

  const [editForm, setEditForm] = useState({
    location: '',
    issueType: '',
    severity: '',
    description: '',
    status: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const filtered = waterIssues.filter(item => {
    const issueTypeName = item.issueType || item.issue_type || '';
    const matchesSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issueTypeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    return matchesSearch && matchesSev;
  });

  const totalAffectedHouseholds = waterIssues.reduce((acc, curr) => acc + (curr.affectedHouseholds || 0), 0);
  const activeRepairs = waterIssues.filter(w => w.status === 'Repair in Progress' || w.status === 'Inspecting').length;
  const criticalLeaks = waterIssues.filter(w => w.severity === 'High' || w.severity === 'Critical').length;

  const chartData = waterIssues.map(w => ({
    name: w.location.split(' ')[0],
    households: w.affectedHouseholds || 0,
    pressure: w.pressurePsi || 0,
  }));

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.location.trim()) {
      setActionError('Location is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await createWaterIssue(createForm);
      await refreshAllData();
      setActionSuccess('Water issue record created in MySQL.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        location: '',
        issueType: 'Pipeline Leakage',
        severity: 'High',
        description: '',
        status: 'Reported',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create water issue.');
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
      await updateWaterIssue(editingItem.id, editForm);
      await refreshAllData();
      setActionSuccess(`Water issue #${editingItem.id} updated in MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingItem(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Delete water issue #${id} from MySQL?`)) return;

    setDeletingId(id);
    setActionError(null);

    try {
      await deleteWaterIssue(id);
      await refreshAllData();
      setActionSuccess(`Record #${id} removed from MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item: WaterIssue) => {
    setEditingItem(item);
    setEditForm({
      location: item.location,
      issueType: item.issueType || item.issue_type || 'Pipeline Leakage',
      severity: item.severity,
      description: item.description || '',
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
              <Droplets className="w-6 h-6 text-[#438C91]" />
              <span>Water Supply & Pipeline Management</span>
            </h1>
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Telemetry on potable water pressure grids and active pipe bursts backed by MySQL `water_issues`.
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
            className="flex items-center gap-2 px-4 py-2 bg-[#188568] hover:bg-[#11654F] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Water Issue</span>
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
          title="Total Logged Issues"
          value={waterIssues.length}
          subValue="MySQL Table: water_issues"
          icon={Database}
          accentColor="emerald"
          trend={{
            value: 'Live MySQL grid',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Active Pipeline Leaks"
          value={criticalLeaks}
          subValue="High Severity"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Priority triage',
            direction: 'up',
          }}
        />

        <StatCard
          title="Field Repairs in Progress"
          value={activeRepairs}
          subValue="Crews on site"
          icon={Wrench}
          accentColor="amber"
          trend={{
            value: 'HMWSSB Units',
            direction: 'down',
          }}
        />

        <StatCard
          title="Average Network Pressure"
          value="24.5 PSI"
          subValue="Optimal Range: 25-40 PSI"
          icon={Gauge}
          accentColor="teal"
          trend={{
            value: 'Hyderabad Grid',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
          <h2 className="text-base font-bold text-[#202B29] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#188568]" />
            <span>Affected Households by Municipal Zone</span>
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E7E2" />
                <XAxis dataKey="name" stroke="#697773" fontSize={11} />
                <YAxis stroke="#697773" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} households`, 'Affected Population']}
                />
                <Bar dataKey="households" fill="#188568" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E1E7E2]">
          <h2 className="text-base font-bold text-[#202B29]">Active Water Pipeline Incidents ({filtered.length} in MySQL)</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search pipeline / location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Severities</option>
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
                <th className="py-3 px-4">Location & Sector</th>
                <th className="py-3 px-4">Issue Classification</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E7E2]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#697773]">
                    No water network issues recorded yet. Click "Report Pipeline Issue" above to add real records to MySQL.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F7F8F5] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#188568] font-bold">#{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-[#202B29]">{item.location}</td>
                  <td className="py-3 px-4 text-[#202B29]">{item.issueType || item.issue_type}</td>
                  <td className="py-3 px-4 text-[#4E5F5B] max-w-xs truncate">{item.description || 'No notes provided'}</td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={item.severity as SeverityLevel || 'Moderate'} size="sm" />
                  </td>
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
              <h3 className="text-base font-bold text-[#202B29]">Report Water Issue (MySQL)</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-[#697773]" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Uppal Sector 3"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Issue Type</label>
                  <select
                    value={createForm.issueType}
                    onChange={(e) => setCreateForm({ ...createForm, issueType: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Pipeline Leakage">Pipeline Leakage</option>
                    <option value="Low Pressure">Low Pressure</option>
                    <option value="Water Contamination">Water Contamination</option>
                    <option value="Supply Disruption">Supply Disruption</option>
                    <option value="Valve Malfunction">Valve Malfunction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Severity</label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#188568] text-white rounded text-xs font-bold">Save in MySQL</button>
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
              <h3 className="text-base font-bold text-[#202B29]">Edit Water Issue #{editingItem.id}</h3>
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
                  <label className="block text-xs font-semibold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Reported">Reported</option>
                    <option value="Inspecting">Inspecting</option>
                    <option value="Repair in Progress">Repair in Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Severity</label>
                  <select
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E1E7E2]">
                <button type="button" onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-[#F7F8F5] rounded text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-[#188568] text-white rounded text-xs font-bold">Update in MySQL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
