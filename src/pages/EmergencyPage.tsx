import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Car, 
  Droplets, 
  Zap, 
  X,
  Radio,
  PlusCircle,
  Edit3,
  Trash2,
  RefreshCw,
  AlertCircle,
  Database
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { EmergencyIncident, SeverityLevel } from '../types';
import { 
  createEmergencyIncident, 
  updateEmergencyIncident, 
  deleteEmergencyIncident 
} from '../services/emergencyService';

export const EmergencyPage: React.FC = () => {
  const { emergencies, refreshAllData, updateEmergencyStatus } = useCityBrain();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<EmergencyIncident | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    type: 'Traffic Accident',
    location: '',
    severity: 'High',
    description: '',
    status: 'REPORTED',
  });

  const [editForm, setEditForm] = useState({
    type: '',
    location: '',
    severity: '',
    description: '',
    status: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const filteredIncidents = emergencies.filter((item) => {
    const titleText = item.title || `${item.type || item.category}: ${item.location}`;
    const matchesSearch = titleText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    const itemCat = item.type || item.category || '';
    const matchesCat = filterCategory === 'all' || itemCat === filterCategory;
    return matchesSearch && matchesSev && matchesCat;
  });

  const criticalCount = emergencies.filter(e => e.severity === 'Critical').length;
  const activeDispatches = emergencies.filter(e => e.status === 'REPORTED' || e.status === 'IN_PROGRESS' || e.status === 'Dispatched' || e.status === 'In Progress').length;
  const resolvedCount = emergencies.filter(e => e.status === 'RESOLVED' || e.status === 'Resolved').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.location.trim() || !createForm.description.trim()) {
      setActionError('Location and Description are required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await createEmergencyIncident({
        type: createForm.type,
        location: createForm.location,
        severity: createForm.severity,
        description: createForm.description,
        status: createForm.status,
      });

      await refreshAllData();
      setActionSuccess('Emergency incident logged in MySQL successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        type: 'Traffic Accident',
        location: '',
        severity: 'High',
        description: '',
        status: 'REPORTED',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create emergency incident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      await updateEmergencyIncident(editingIncident.id, {
        type: editForm.type,
        location: editForm.location,
        severity: editForm.severity,
        description: editForm.description,
        status: editForm.status,
      });

      await refreshAllData();
      setActionSuccess(`Emergency #${editingIncident.id} updated in MySQL successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingIncident(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update emergency.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusQuickChange = async (incidentId: string | number, newStatus: string) => {
    try {
      await updateEmergencyStatus(incidentId, newStatus);
      setActionSuccess(`Status changed to ${newStatus}.`);
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Are you sure you want to permanently delete emergency incident #${id} from MySQL?`)) {
      return;
    }

    setDeletingId(id);
    setActionError(null);

    try {
      await deleteEmergencyIncident(id);
      await refreshAllData();
      setActionSuccess(`Incident #${id} removed from MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete incident.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item: EmergencyIncident) => {
    setEditingIncident(item);
    setEditForm({
      type: item.type || item.category || 'Traffic Accident',
      location: item.location,
      severity: item.severity,
      description: item.description,
      status: item.status,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Traffic Accident': return Car;
      case 'Waterlogging': return Droplets;
      case 'Fire': return Flame;
      case 'Power Outage': return Zap;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#D64545]" />
              <span>Emergency Command & Dispatch Center</span>
            </h1>
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real-time urban crisis triage and dispatch backed by MySQL `emergency_incidents` table.
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
            className="flex items-center gap-2 px-4 py-2 bg-[#D64545] hover:bg-[#B83838] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reported Incidents"
          value={emergencies.length}
          subValue="MySQL Table: emergency_incidents"
          icon={Database}
          accentColor="rose"
          trend={{
            value: 'Live Persistence',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Critical Incidents"
          value={criticalCount}
          subValue="Immediate Danger"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Priority triage',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Active In Progress"
          value={activeDispatches}
          subValue="Units on Field"
          icon={Clock}
          accentColor="amber"
          trend={{
            value: '108 / DRF Units',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          subValue="Safely Mitigated"
          icon={CheckCircle2}
          accentColor="emerald"
          trend={{
            value: 'Closed events',
            direction: 'up',
          }}
        />
      </div>

      {/* Emergency Incidents List Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Active & Logged Incidents</h2>
            <span className="text-xs font-mono text-[#D64545] font-bold">({filteredIncidents.length} records in MySQL)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search incident, location, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#D64545] w-52 sm:w-64"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#D64545]"
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#D64545]"
            >
              <option value="all">All Types</option>
              <option value="Traffic Accident">Traffic Accident</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Fire">Fire</option>
              <option value="Power Outage">Power Outage</option>
              <option value="Structural Hazard">Structural Hazard</option>
            </select>
          </div>
        </div>

        {/* Incidents Grid */}
        {filteredIncidents.length === 0 ? (
          <div className="py-12 text-center text-[#697773] border border-dashed border-[#E1E7E2] rounded-lg">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#C2CCC7]" />
            <p className="text-xs font-semibold">No emergency incidents recorded in database.</p>
            <p className="text-[11px] text-[#859490] mt-1">Use the "Log Emergency Incident" button above to record real incidents in MySQL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncidents.map((item) => {
              const IconComp = getCategoryIcon(item.type || item.category || '');
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#D64545]/40 transition-colors flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-white rounded-lg border border-[#E1E7E2] text-[#D64545] shadow-xs mt-0.5">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D64545] font-bold block mb-0.5">
                            {item.type || item.category} • DB ID: {item.id}
                          </span>
                          <h3 className="font-bold text-sm text-[#202B29]">
                            {item.title || `${item.type || item.category} at ${item.location}`}
                          </h3>
                        </div>
                      </div>
                      <SeverityBadge severity={item.severity as SeverityLevel || 'Moderate'} size="sm" />
                    </div>

                    <p className="text-xs text-[#4E5F5B] mb-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#697773] font-mono bg-white p-2.5 rounded-lg border border-[#E1E7E2] mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D64545] shrink-0" />
                        <span className="truncate text-[#202B29] font-semibold">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#697773] shrink-0" />
                        <span className="truncate">{item.timestamp || item.reportedAt || 'Just now'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E1E7E2] text-xs">
                    {/* Status Select */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#697773] font-mono text-[11px]">Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusQuickChange(item.id, e.target.value)}
                        className="bg-white border border-[#E1E7E2] text-[#202B29] text-xs font-semibold rounded px-2 py-1 outline-none"
                      >
                        <option value="REPORTED">REPORTED</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#188568] transition-colors"
                        title="Edit emergency incident in MySQL"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 bg-white hover:bg-[#FDF2F2] border border-[#E1E7E2] hover:border-[#FADCDA] rounded text-[#697773] hover:text-[#D64545] transition-colors"
                        title="Delete incident from MySQL"
                      >
                        {deletingId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D64545]" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden text-[#202B29]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#D64545]" />
                <span>Log Emergency Incident (MySQL Persistence)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#697773] hover:text-[#202B29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Incident Type <span className="text-[#D64545]">*</span>
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#D64545]"
                  >
                    <option value="Traffic Accident">Traffic Accident</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Fire">Fire</option>
                    <option value="Power Outage">Power Outage</option>
                    <option value="Structural Hazard">Structural Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Severity <span className="text-[#D64545]">*</span>
                  </label>
                  <select
                    value={createForm.severity}
                    onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#D64545]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Location <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LB Nagar Flyover"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#D64545]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Status <span className="text-[#D64545]">*</span>
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#D64545]"
                  >
                    <option value="REPORTED">REPORTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B29] mb-1">
                  Description <span className="text-[#D64545]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe incident, casualties, dispatch requirement..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#D64545] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E7E2]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#F7F8F5] hover:bg-[#E1E7E2] text-[#202B29] rounded-lg text-xs font-semibold border border-[#E1E7E2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#D64545] hover:bg-[#B83838] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Create in MySQL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden text-[#202B29]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#188568]" />
                <span>Edit Incident #{editingIncident.id} in MySQL</span>
              </h3>
              <button
                onClick={() => setEditingIncident(null)}
                className="text-[#697773] hover:text-[#202B29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none"
                  >
                    <option value="Traffic Accident">Traffic Accident</option>
                    <option value="Waterlogging">Waterlogging</option>
                    <option value="Fire">Fire</option>
                    <option value="Power Outage">Power Outage</option>
                    <option value="Structural Hazard">Structural Hazard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Severity
                  </label>
                  <select
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none"
                  >
                    <option value="REPORTED">REPORTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B29] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E7E2]">
                <button
                  type="button"
                  onClick={() => setEditingIncident(null)}
                  className="px-4 py-2 bg-[#F7F8F5] hover:bg-[#E1E7E2] text-[#202B29] rounded-lg text-xs font-semibold border border-[#E1E7E2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#188568] hover:bg-[#11654F] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
