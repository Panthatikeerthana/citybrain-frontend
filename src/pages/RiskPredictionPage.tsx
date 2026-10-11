import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Layers,
  Info,
  Lightbulb,
  BrainCircuit
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { RiskPrediction, SeverityLevel } from '../types';
import { 
  createRiskPrediction, 
  updateRiskPrediction, 
  deleteRiskPrediction 
} from '../services/riskService';

export const RiskPredictionPage: React.FC = () => {
  const { riskPredictions, refreshAllData } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RiskPrediction | null>(null);

  const [createForm, setCreateForm] = useState({
    location: '',
    riskType: 'Traffic Gridlock',
    riskLevel: 'High',
    probability: 0.85,
    description: '',
  });

  const [editForm, setEditForm] = useState({
    location: '',
    riskType: '',
    riskLevel: '',
    probability: 0.5,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const filteredRisks = riskPredictions.filter((item) => {
    const loc = item.location || '';
    const desc = item.description || item.whyFlagged || '';
    const rType = item.riskType || item.risk_type || '';
    const rSev = (item.severity || item.riskLevel || item.risk_level || 'Medium').toLowerCase();

    const matchesSearch = loc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || rSev === filterSeverity.toLowerCase();
    const matchesTyp = filterType === 'all' || rType === filterType;
    return matchesSearch && matchesSev && matchesTyp;
  });

  const criticalRisksCount = riskPredictions.filter(r => (r.severity === 'Critical' || r.severity === 'High' || r.riskLevel === 'Critical' || r.riskLevel === 'High')).length;
  const avgRiskScore = riskPredictions.length > 0
    ? Math.round(riskPredictions.reduce((acc, curr) => acc + (curr.riskScore || Math.round((curr.probability || 0) * 100)), 0) / riskPredictions.length)
    : null;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.location.trim() || !createForm.description.trim()) {
      setActionError('Location and Description are required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      await createRiskPrediction({
        location: createForm.location,
        riskType: createForm.riskType,
        riskLevel: createForm.riskLevel,
        probability: Number(createForm.probability),
        description: createForm.description,
      });

      await refreshAllData();
      setActionSuccess('Risk prediction registered in MySQL.');
      setTimeout(() => setActionSuccess(null), 3000);
      setShowCreateModal(false);
      setCreateForm({
        location: '',
        riskType: 'Traffic Gridlock',
        riskLevel: 'High',
        probability: 0.85,
        description: '',
      });
    } catch (err: any) {
      setActionError(err.message || 'Failed to create risk prediction.');
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
      await updateRiskPrediction(editingItem.id, {
        location: editForm.location,
        riskType: editForm.riskType,
        riskLevel: editForm.riskLevel,
        probability: Number(editForm.probability),
        description: editForm.description,
      });

      await refreshAllData();
      setActionSuccess(`Risk prediction #${editingItem.id} updated in MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
      setEditingItem(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm(`Delete risk model #${id} from MySQL?`)) return;

    setDeletingId(id);
    setActionError(null);

    try {
      await deleteRiskPrediction(id);
      await refreshAllData();
      setActionSuccess(`Record #${id} removed from MySQL.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (item: RiskPrediction) => {
    setEditingItem(item);
    setEditForm({
      location: item.location,
      riskType: item.riskType || item.risk_type || 'Traffic Gridlock',
      riskLevel: item.riskLevel || item.risk_level || 'High',
      probability: item.probability ?? 0.75,
      description: item.description || item.whyFlagged || '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#188568]" />
              <span>Predictive Urban Risk Intelligence Engine</span>
            </h1>
            <DataSourceBadge source="live" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Preemptive cross-domain risk models persisted in MySQL table `risk_predictions`.
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
            <span>Add Risk Model</span>
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
          title="Active Risk Models"
          value={riskPredictions.length}
          subValue="MySQL Table: risk_predictions"
          icon={Database}
          accentColor={(avgRiskScore ?? 0) > 75 ? 'rose' : 'emerald'}
          trend={{
            value: 'Live MySQL Grid',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="High Priority Flags"
          value={criticalRisksCount}
          subValue="Immediate Action Window"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Correlated telemetry',
            direction: 'up',
          }}
        />

        <StatCard
          title="Predictive Lead Time"
          value="1 - 6 Hours"
          subValue="Pre-emptive Window"
          icon={Clock}
          accentColor="emerald"
          trend={{
            value: 'Before physical incident',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="Data Model Source"
          value="MySQL Live"
          subValue="REST Service"
          icon={BrainCircuit}
          accentColor="teal"
          trend={{
            value: 'Spring Security Protected',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Main Filter & List Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Preemptive Risk Alerts & Pattern Matrix</h2>
            <span className="text-xs font-mono font-semibold text-[#188568]">({filteredRisks.length} in MySQL)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search risk, location, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] w-52 sm:w-60"
              />
            </div>

            {/* Risk Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Risk Types</option>
              <option value="Traffic Gridlock">Traffic Gridlock</option>
              <option value="Urban Flash Flood">Urban Flash Flood</option>
              <option value="Air Pollution Surge">Air Pollution Surge</option>
              <option value="Water Supply Shortage">Water Supply Shortage</option>
              <option value="Waste Accumulation Hazard">Waste Accumulation Hazard</option>
            </select>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#F7F8F5] border border-[#E1E7E2] text-[#202B29] text-xs rounded-lg px-3 py-1.5 outline-none focus:border-[#188568]"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        {/* Risk Prediction Cards */}
        <div className="space-y-4">
          {filteredRisks.length === 0 ? (
            <div className="py-12 text-center text-[#697773] border border-dashed border-[#E1E7E2] rounded-lg bg-white">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-[#C2CCC7]" />
              <p className="text-xs font-semibold">Insufficient real data for prediction.</p>
              <p className="text-[11px] text-[#859490] mt-1">
                Predictive risk models require real operational data or sensor records. Log operational issues or add calibrated risk records to initialize predictive analytics.
              </p>
            </div>
          ) : (
            filteredRisks.map((risk) => {
              const score = risk.riskScore ?? (risk.probability != null ? Math.round(risk.probability * 100) : 0);
              const patterns = risk.detectedPatterns || (risk.probability != null ? [
                `Probability indexed at ${Math.round(risk.probability * 100)}%`,
                `Identified risk corridor at ${risk.location}`
              ] : [`Identified risk corridor at ${risk.location}`]);
              const whyText = risk.whyFlagged || risk.description || 'Pre-emptive operational anomaly threshold exceeded.';
              const actionText = risk.recommendedAction || `Dispatch preventive response unit to ${risk.location}.`;

              return (
                <div
                  key={risk.id}
                  className="p-5 rounded-xl bg-white border border-[#E1E7E2] shadow-sm hover:border-[#188568]/40 transition-all space-y-3"
                >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 rounded-lg bg-[#188568]/10 text-[#188568] border border-[#188568]/20 text-xs font-mono font-bold">
                      Risk Score: {score}/100
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#697773] block font-semibold">
                        {risk.riskType || risk.risk_type} • DB ID: {risk.id}
                      </span>
                      <h3 className="font-bold text-base text-[#202B29]">
                        {risk.title || `${risk.riskType || risk.risk_type} at ${risk.location}`}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={risk.severity as SeverityLevel || risk.riskLevel as SeverityLevel || 'Moderate'} size="sm" />
                    
                    {/* Actions */}
                    <button
                      onClick={() => openEditModal(risk)}
                      className="p-1.5 bg-white hover:bg-[#F7F8F5] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#188568]"
                      title="Edit risk in MySQL"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(risk.id)}
                      disabled={deletingId === risk.id}
                      className="p-1.5 bg-white hover:bg-[#FDF2F2] border border-[#E1E7E2] rounded text-[#697773] hover:text-[#D64545]"
                      title="Delete risk from MySQL"
                    >
                      {deletingId === risk.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D64545]" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Detected Patterns */}
                <div className="bg-[#F7F8F5] p-3.5 rounded-lg border border-[#E1E7E2]">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#697773] mb-2 flex items-center gap-1.5 font-bold">
                    <Layers className="w-3.5 h-3.5 text-[#188568]" />
                    <span>Multi-Sensor Precursor Patterns</span>
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#202B29]">
                    {patterns.map((pat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#188568] shrink-0 font-bold">•</span>
                        <span>{pat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Explainability & Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#F7F8F5] rounded-lg border border-[#E1E7E2]">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#202B29] mb-1">
                      <Info className="w-3.5 h-3.5 text-[#D97732]" />
                      <span>Why was this flagged?</span>
                    </div>
                    <p className="text-xs text-[#697773] leading-relaxed font-sans">
                      {whyText}
                    </p>
                  </div>

                  <div className="p-3 bg-[#188568]/5 rounded-lg border border-[#188568]/20">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#188568] mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-[#188568]" />
                      <span>Recommended Mitigation Response</span>
                    </div>
                    <p className="text-xs text-[#202B29] leading-relaxed font-sans">
                      {actionText}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E7E2] mb-4">
              <h3 className="text-base font-bold text-[#202B29]">Register Risk Model (MySQL)</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-[#697773]" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Uppal Low-Lying Underpass"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Risk Type</label>
                  <select
                    value={createForm.riskType}
                    onChange={(e) => setCreateForm({ ...createForm, riskType: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Traffic Gridlock">Traffic Gridlock</option>
                    <option value="Urban Flash Flood">Urban Flash Flood</option>
                    <option value="Air Pollution Surge">Air Pollution Surge</option>
                    <option value="Water Supply Shortage">Water Supply Shortage</option>
                    <option value="Waste Accumulation Hazard">Waste Accumulation Hazard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Risk Level</label>
                  <select
                    value={createForm.riskLevel}
                    onChange={(e) => setCreateForm({ ...createForm, riskLevel: e.target.value })}
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
                <label className="block text-xs font-semibold mb-1">Probability (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={createForm.probability}
                  onChange={(e) => setCreateForm({ ...createForm, probability: Number(e.target.value) })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description / Risk Reason *</label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
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
              <h3 className="text-base font-bold text-[#202B29]">Edit Risk Model #{editingItem.id}</h3>
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
                  <label className="block text-xs font-semibold mb-1">Risk Type</label>
                  <select
                    value={editForm.riskType}
                    onChange={(e) => setEditForm({ ...editForm, riskType: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Traffic Gridlock">Traffic Gridlock</option>
                    <option value="Urban Flash Flood">Urban Flash Flood</option>
                    <option value="Air Pollution Surge">Air Pollution Surge</option>
                    <option value="Water Supply Shortage">Water Supply Shortage</option>
                    <option value="Waste Accumulation Hazard">Waste Accumulation Hazard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Risk Level</label>
                  <select
                    value={editForm.riskLevel}
                    onChange={(e) => setEditForm({ ...editForm, riskLevel: e.target.value })}
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
                <label className="block text-xs font-semibold mb-1">Probability</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={editForm.probability}
                  onChange={(e) => setEditForm({ ...editForm, probability: Number(e.target.value) })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs"
                  required
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
