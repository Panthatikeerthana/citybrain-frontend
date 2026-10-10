import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  Lightbulb, 
  Layers, 
  Info,
  Clock
} from 'lucide-react';
import { useCityBrain } from '../context/CityBrainContext';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { DataSourceBadge } from '../components/common/DataSourceBadge';

export const RiskPredictionPage: React.FC = () => {
  const { riskPredictions } = useCityBrain();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredRisks = riskPredictions.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.whyFlagged.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = filterSeverity === 'all' || item.severity.toLowerCase() === filterSeverity.toLowerCase();
    const matchesTyp = filterType === 'all' || item.riskType === filterType;
    return matchesSearch && matchesSev && matchesTyp;
  });

  const criticalRisksCount = riskPredictions.filter(r => r.severity === 'Critical' || r.severity === 'High').length;
  const avgRiskScore = Math.round(riskPredictions.reduce((acc, curr) => acc + curr.riskScore, 0) / (riskPredictions.length || 1));

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
            <DataSourceBadge source="rule-based" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Rule-based multi-factor correlation engine analyzing cross-domain telemetry anomalies for preemptive risk mitigation.
          </p>
        </div>

        {/* Explainability Tag */}
        <div className="flex items-center gap-2 text-xs text-[#188568] bg-[#188568]/10 border border-[#188568]/20 p-2.5 rounded-lg font-medium shrink-0">
          <BrainCircuit className="w-4 h-4 text-[#188568] shrink-0" />
          <span>Transparent Rule-Based Heuristic Model</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active City Risk Index"
          value={`${avgRiskScore}/100`}
          subValue="Elevated Anomaly Load"
          icon={ShieldAlert}
          accentColor={avgRiskScore > 75 ? 'rose' : 'emerald'}
          trend={{
            value: 'Correlated across 4 domains',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="High Priority Risk Flags"
          value={criticalRisksCount}
          subValue="Immediate Action Window"
          icon={AlertTriangle}
          accentColor="rose"
          trend={{
            value: 'Gridlock & Inundation risks',
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
            value: 'Before physical escalation',
            direction: 'neutral',
          }}
        />

        <StatCard
          title="AI Model Status"
          value="Rule Heuristic"
          subValue="Production Fallback"
          icon={Sparkles}
          accentColor="teal"
          trend={{
            value: 'Zero false-alarm hallucination',
            direction: 'neutral',
          }}
        />
      </div>

      {/* Main Filter & List Section */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E1E7E2]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#202B29]">Preemptive Risk Alerts & Pattern Matrix</h2>
            <span className="text-xs font-mono font-semibold text-[#188568]">({filteredRisks.length} flagged)</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#697773] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search risk, reason, location..."
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
            </select>
          </div>
        </div>

        {/* Risk Prediction Cards */}
        <div className="space-y-4">
          {filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="p-5 rounded-xl bg-white border border-[#E1E7E2] shadow-sm hover:border-[#188568]/40 transition-all space-y-3"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-[#188568]/10 text-[#188568] border border-[#188568]/20 text-xs font-mono font-bold">
                    Risk Score: {risk.riskScore}/100
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#697773] block font-semibold">
                      {risk.riskType} • {risk.impactZone}
                    </span>
                    <h3 className="font-bold text-base text-[#202B29]">{risk.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#438C91] bg-[#F7F8F5] px-2.5 py-1 rounded-lg border border-[#E1E7E2] font-semibold">
                    ⏱️ {risk.timeHorizon}
                  </span>
                  <SeverityBadge severity={risk.severity} size="sm" />
                </div>
              </div>

              {/* Detected Patterns */}
              <div className="bg-[#F7F8F5] p-3.5 rounded-lg border border-[#E1E7E2]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#697773] mb-2 flex items-center gap-1.5 font-bold">
                  <Layers className="w-3.5 h-3.5 text-[#188568]" />
                  <span>Detected Multi-Sensor Precursor Patterns</span>
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#202B29]">
                  {risk.detectedPatterns.map((pat, idx) => (
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
                    {risk.whyFlagged}
                  </p>
                </div>

                <div className="p-3 bg-[#188568]/5 rounded-lg border border-[#188568]/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#188568] mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-[#188568]" />
                    <span>Recommended Mitigation Response</span>
                  </div>
                  <p className="text-xs text-[#202B29] leading-relaxed font-sans">
                    {risk.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

