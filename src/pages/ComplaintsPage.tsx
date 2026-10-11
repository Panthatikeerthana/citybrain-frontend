import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Search, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  MapPin, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CitizenComplaint, SeverityLevel } from '../types';
import { submitComplaint, updateComplaint, deleteComplaint, getComplaints } from '../services/complaintService';

export const ComplaintsPage: React.FC = () => {
  const { complaints, refreshAllData } = useCityBrain();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<CitizenComplaint | null>(null);
  
  // Form State for Create
  const [createForm, setCreateForm] = useState({
    citizenName: '',
    category: 'Road & Potholes',
    description: '',
    location: '',
    priority: 'HIGH',
    status: 'OPEN',
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState({
    citizenName: '',
    category: '',
    description: '',
    location: '',
    priority: '',
    status: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Open Edit Modal
  const openEditModal = (item: CitizenComplaint) => {
    setEditingComplaint(item);
    setEditForm({
      citizenName: item.citizenName || '',
      category: item.category || 'Road & Potholes',
      description: item.description || '',
      location: item.location || '',
      priority: item.priority || (typeof item.severity === 'string' ? item.severity : 'Medium'),
      status: item.status || 'Submitted',
    });
    setActionError(null);
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.citizenName.trim() || !createForm.description.trim() || !createForm.location.trim()) {
      setActionError('Citizen Name, Location, and Description are required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await submitComplaint({
        citizenName: createForm.citizenName,
        category: createForm.category,
        description: createForm.description,
        location: createForm.location,
        priority: createForm.priority,
        status: createForm.status,
      });

      await refreshAllData();
      setActionSuccess('Grievance lodged and saved to MySQL database successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        citizenName: '',
        category: 'Road & Potholes',
        description: '',
        location: '',
        priority: 'HIGH',
        status: 'OPEN',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit grievance to MySQL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Update Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      await updateComplaint(editingComplaint.id, {
        citizenName: editForm.citizenName,
        category: editForm.category,
        description: editForm.description,
        location: editForm.location,
        priority: editForm.priority,
        status: editForm.status,
      });

      await refreshAllData();
      setActionSuccess(`Complaint #${editingComplaint.id} updated in MySQL successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingComplaint(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Are you sure you want to permanently delete complaint #${id} from MySQL?`)) {
      return;
    }

    setDeletingId(id);
    setActionError(null);

    try {
      await deleteComplaint(id);
      await refreshAllData();
      setActionSuccess(`Complaint #${id} deleted from MySQL successfully.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete complaint.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredComplaints = complaints.filter(item => {
    const titleText = item.title || `${item.category}: ${item.location}`;
    const matchesSearch = titleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.citizenName && item.citizenName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSt = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCat && matchesSt;
  });

  const openComplaintsCount = complaints.filter(c => c.status !== 'Resolved' && c.status !== 'RESOLVED').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#188568]" />
              <span>Citizen Grievance Portal & Tracker</span>
            </h1>
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Real MySQL persistence module. Supports complete CREATE, READ, UPDATE, and DELETE operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshAllData()}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs font-semibold rounded-lg transition-colors shadow-sm"
            title="Refresh complaints from MySQL"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#188568]" />
            <span>Sync DB</span>
          </button>

          <button
            onClick={() => {
              setShowCreateModal(true);
              setActionError(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#188568] hover:bg-[#11654F] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Lodge Citizen Grievance</span>
          </button>
        </div>
      </div>

      {/* Action Notifications */}
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
          title="Total Registered Grievances"
          value={complaints.length}
          subValue="MySQL Table: citizen_complaints"
          icon={Database}
          accentColor="emerald"
          trend={{
            value: 'Live MySQL Persistence',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Under Review & Assigned"
          value={openComplaintsCount}
          subValue="Awaiting Field Clearance"
          icon={Clock}
          accentColor="amber"
          trend={{
            value: 'Resolution SLA ~24h',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Successfully Cleared"
          value={resolvedCount}
          subValue="Verified Completed"
          icon={CheckCircle2}
          accentColor="emerald"
          trend={{
            value: 'Persistent records',
            direction: 'up',
          }}
        />

        <StatCard
          title="Data Integrity Mode"
          value="MySQL Live"
          subValue="Spring Boot REST API"
          icon={Database}
          accentColor="teal"
          trend={{
            value: 'JWT Authenticated',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Complaints List Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Registered Citizen Grievances</h2>
            <span className="text-xs font-mono text-[#188568] font-bold">({filteredComplaints.length} records in MySQL)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search complaints, citizen name, areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] w-52 sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Categories</option>
              <option value="Road & Potholes">Road & Potholes</option>
              <option value="Road">Road</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Drainage">Drainage</option>
              <option value="Garbage & Sanitation">Garbage & Sanitation</option>
              <option value="Streetlight">Streetlight</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="OPEN">OPEN</option>
              <option value="Under Review">Under Review</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="Assigned">Assigned</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid */}
        {filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-[#697773] border border-dashed border-[#E1E7E2] rounded-lg">
            <Database className="w-8 h-8 mx-auto mb-2 text-[#C2CCC7]" />
            <p className="text-xs font-semibold">No citizen complaints recorded yet.</p>
            <p className="text-[11px] text-[#859490] mt-1">Use the "Lodge Citizen Grievance" button above to record real citizen complaints in MySQL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-[#F7F8F5] border border-[#E1E7E2] hover:border-[#188568]/40 transition-colors flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#188568] font-bold block mb-0.5">
                        {item.category} • DB ID: {item.id}
                      </span>
                      <h3 className="font-bold text-sm text-[#202B29]">
                        {item.title || `${item.category}: ${item.location}`}
                      </h3>
                    </div>
                    <SeverityBadge severity={item.severity as SeverityLevel || 'Moderate'} size="sm" />
                  </div>

                  <p className="text-xs text-[#4E5F5B] mb-3 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#697773] font-mono bg-white p-2.5 rounded-lg border border-[#E1E7E2] mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#188568] shrink-0" />
                      <span className="truncate text-[#202B29] font-semibold">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#697773] shrink-0" />
                      <span className="truncate">{item.createdAt || 'Just now'}</span>
                    </div>
                    <div className="col-span-2 text-[#202B29] flex items-center justify-between">
                      <span>Citizen: <strong>{item.citizenName || 'Anonymous'}</strong></span>
                      <span className="text-[10px] text-[#697773]">Priority: {item.priority || 'Medium'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E1E7E2] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#697773] font-mono">Status:</span>
                    <span className="font-semibold text-[#188568] font-mono px-2 py-0.5 bg-[#F2FAF7] rounded border border-[#9CE3D1]">
                      {item.status}
                    </span>
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#188568] transition-colors"
                      title="Edit this complaint in MySQL"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 bg-white hover:bg-[#FDF2F2] border border-[#E1E7E2] hover:border-[#FADCDA] rounded text-[#697773] hover:text-[#D64545] transition-colors"
                      title="Delete this complaint from MySQL"
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
            ))}
          </div>
        )}
      </div>

      {/* CREATE Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden text-[#202B29]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#188568]" />
                <span>Lodge Citizen Grievance (MySQL Persistence)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#697773] hover:text-[#202B29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202B29] mb-1">
                  Citizen Name <span className="text-[#D64545]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Test Citizen"
                  value={createForm.citizenName}
                  onChange={(e) => setCreateForm({ ...createForm, citizenName: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Category <span className="text-[#D64545]">*</span>
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="Road">Road</option>
                    <option value="Road & Potholes">Road & Potholes</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Traffic Violation">Traffic Violation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Priority <span className="text-[#D64545]">*</span>
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
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
                    placeholder="e.g. Uppal"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
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
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B29] mb-1">
                  Description <span className="text-[#D64545]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Large pothole near main road"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] resize-none"
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
                  className="px-5 py-2 bg-[#188568] hover:bg-[#11654F] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Create in MySQL</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Complaint Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden text-[#202B29]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#188568]" />
                <span>Update Grievance #{editingComplaint.id} in MySQL</span>
              </h3>
              <button
                onClick={() => setEditingComplaint(null)}
                className="text-[#697773] hover:text-[#202B29]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202B29] mb-1">
                  Citizen Name
                </label>
                <input
                  type="text"
                  value={editForm.citizenName}
                  onChange={(e) => setEditForm({ ...editForm, citizenName: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="Road">Road</option>
                    <option value="Road & Potholes">Road & Potholes</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Drainage">Drainage</option>
                    <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Traffic Violation">Traffic Violation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Priority
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
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
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
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
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Resolved">Resolved</option>
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
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E7E2]">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
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
                      <span>Updating in MySQL...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Changes to MySQL</span>
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
