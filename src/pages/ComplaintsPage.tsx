import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Search, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  MapPin,
  Sparkles
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { CitizenComplaint, SeverityLevel } from '../types';

export const ComplaintsPage: React.FC = () => {
  const { complaints, addComplaint } = useCityBrain();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: CitizenComplaint['category'];
    location: string;
    severity: SeverityLevel;
    citizenName: string;
    citizenPhone: string;
  }>({
    title: '',
    description: '',
    category: 'Road & Potholes',
    location: '',
    severity: 'Moderate',
    citizenName: '',
    citizenPhone: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.location.trim()) errs.location = 'Location in Hyderabad is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addComplaint({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      severity: formData.severity,
      citizenName: formData.citizenName || 'Concerned Resident',
      citizenPhone: formData.citizenPhone || '+91 9XXXXXXXXX',
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowSubmitModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Road & Potholes',
        location: '',
        severity: 'Moderate',
        citizenName: '',
        citizenPhone: '',
      });
    }, 1200);
  };

  const filteredComplaints = complaints.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCategory === 'all' || item.category === filterCategory;
    const matchesSt = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCat && matchesSt;
  });

  const openComplaintsCount = complaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

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
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Community reporting portal for civil infrastructure, road repairs, streetlights, drainage, and sanitation.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#188568] hover:bg-[#11654F] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge Citizen Grievance</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Grievances"
          value={complaints.length}
          subValue="Local Browser Cache"
          icon={FileText}
          accentColor="emerald"
          trend={{
            value: 'Hyd Metropolitan Area',
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
            value: 'Resolution time ~24h',
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
            value: 'Citizen feedback 4.8/5',
            direction: 'up',
          }}
        />

        <StatCard
          title="Data Integrity Mode"
          value="Local Demo"
          subValue="Persisted in localStorage"
          icon={Sparkles}
          accentColor="teal"
          trend={{
            value: 'Ready for Spring Boot API',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Complaints List Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Registered Citizen Grievances</h2>
            <span className="text-xs font-mono text-[#188568] font-bold">({filteredComplaints.length} records)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search complaints, areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] w-52 sm:w-60"
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
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints Grid */}
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
                      {item.category} • ID: {item.id}
                    </span>
                    <h3 className="font-bold text-sm text-[#202B29]">{item.title}</h3>
                  </div>
                  <SeverityBadge severity={item.severity} size="sm" />
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
                    <span>{item.createdAt}</span>
                  </div>
                  {item.citizenName && (
                    <div className="col-span-2 text-[#202B29]">
                      Filed By: <strong className="text-[#202B29]">{item.citizenName}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E1E7E2] text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#697773] font-mono">Status:</span>
                  <span className="font-semibold text-[#188568] font-mono">{item.status}</span>
                </div>

                <span className="text-[10px] font-mono text-[#697773] bg-white px-2 py-0.5 rounded border border-[#E1E7E2]">
                  Local Demo Record
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complaint Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202B29]/60 animate-fadeIn">
          <div 
            className="w-full max-w-lg bg-white border border-[#E1E7E2] rounded-xl shadow-2xl p-6 relative overflow-hidden text-[#202B29]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[#202B29] mb-1 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-[#188568]" />
              <span>Report Urban Issue / Citizen Grievance</span>
            </h3>
            <p className="text-xs text-[#697773] mb-4">
              Enter grievance details below. Submitted records will be stored in your local session cache and immediately visualized across City Brain.
            </p>

            {formSuccess ? (
              <div className="py-12 text-center text-[#188568] space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#188568]" />
                <h4 className="text-base font-bold text-[#202B29]">Grievance Registered Successfully!</h4>
                <p className="text-xs text-[#697773] font-mono">Reference Ticket ID generated.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Grievance Subject / Title <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Broken water pipe near Uppal junction"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
                  />
                  {errors.title && <p className="text-[11px] text-[#D64545] mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#202B29] mb-1">
                      Issue Category <span className="text-[#D64545]">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                    >
                      <option value="Road & Potholes">Road & Potholes</option>
                      <option value="Water Supply">Water Supply</option>
                      <option value="Garbage & Sanitation">Garbage & Sanitation</option>
                      <option value="Drainage">Drainage</option>
                      <option value="Streetlight">Streetlight</option>
                      <option value="Traffic Violation">Traffic Violation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202B29] mb-1">
                      Severity Level <span className="text-[#D64545]">*</span>
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e: any) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] outline-none focus:border-[#188568]"
                    >
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Specific Location (Hyderabad) <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LB Nagar Ring Road, Pillar 42"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568]"
                  />
                  {errors.location && <p className="text-[11px] text-[#D64545] mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202B29] mb-1">
                    Detailed Description <span className="text-[#D64545]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the issue, hazards, or symptoms observed..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none focus:border-[#188568] resize-none"
                  />
                  {errors.description && <p className="text-[11px] text-[#D64545] mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#202B29] mb-1">
                      Citizen Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Sharma"
                      value={formData.citizenName}
                      onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#202B29] mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98480 XXXXX"
                      value={formData.citizenPhone}
                      onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
                      className="w-full bg-[#F7F8F5] border border-[#E1E7E2] rounded-lg px-3 py-2 text-xs text-[#202B29] placeholder-[#697773] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E1E7E2]">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 bg-[#F7F8F5] hover:bg-[#E1E7E2] text-[#202B29] rounded-lg text-xs font-semibold border border-[#E1E7E2]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#188568] hover:bg-[#11654F] text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Grievance</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
