import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  Car, 
  CloudRain, 
  Trash2, 
  Droplets, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Flame,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip
} from 'recharts';
import { DataSourceBadge } from '../components/common/DataSourceBadge';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';

interface SimulationState {
  trafficVolume: number; // 0.5 to 2.5
  rainfall: number; // 0 to 120 mm/hr
  wasteFactor: number; // 1.0 to 3.0
  powerStress: number; // 50 to 150 %
  staffingPercent: number; // 40 to 100 %
}

const DEFAULT_SIM: SimulationState = {
  trafficVolume: 1.0,
  rainfall: 15,
  wasteFactor: 1.0,
  powerStress: 100,
  staffingPercent: 90,
};

export const SimulatorPage: React.FC = () => {
  const [params, setParams] = useState<SimulationState>(DEFAULT_SIM);

  // Dynamic illustrative calculation engine
  const calculation = useMemo(() => {
    // Traffic gridlock risk (0 - 100)
    const trafficGridlock = Math.min(100, Math.round(
      params.trafficVolume * 45 + (params.rainfall > 30 ? (params.rainfall - 30) * 0.4 : 0)
    ));

    // Flood inundation risk (0 - 100)
    const floodRisk = Math.min(100, Math.round(
      (params.rainfall / 120) * 85 + (params.wasteFactor > 1.5 ? (params.wasteFactor - 1.5) * 15 : 0)
    ));

    // Grid overload risk (0 - 100)
    const gridOverload = Math.min(100, Math.round(
      (params.powerStress / 150) * 75 + (params.rainfall > 50 ? 20 : 0)
    ));

    // Emergency response capacity deficit (0 - 100)
    const emergencyStress = Math.min(100, Math.round(
      Math.max(0, 100 - params.staffingPercent) * 0.8 + (trafficGridlock > 70 ? 25 : 10)
    ));

    // Waste drainage blockage risk (0 - 100)
    const wasteBlockageRisk = Math.min(100, Math.round(
      (params.wasteFactor / 3.0) * 60 + (params.rainfall > 20 ? 35 : 0)
    ));

    // Overall Composite Risk Score (0 - 100)
    const overallRisk = Math.min(100, Math.round(
      trafficGridlock * 0.3 + floodRisk * 0.3 + emergencyStress * 0.2 + gridOverload * 0.1 + wasteBlockageRisk * 0.1
    ));

    // Calculate response recommendations based on parameters
    const recommendations: string[] = [];
    const criticalHotspots: string[] = [];

    if (params.rainfall >= 40) {
      recommendations.push('Pre-position high-volume trailer dewatering pumps at Uppal Basin, Begumpet Nala, and Tolichowki.');
      criticalHotspots.push('Uppal Low-Lying Depot');
    }
    if (params.trafficVolume >= 1.5) {
      recommendations.push('Enforce staggered corporate shifts on Hitec City / Cyberabad corridors and activate dynamic flyover lane reversal.');
      criticalHotspots.push('LB Nagar - Dilsukhnagar Arterial');
      criticalHotspots.push('Hitec City Mindspace Rotary');
    }
    if (params.wasteFactor >= 1.8) {
      recommendations.push('Deploy 8 additional GHMC compactor trucks for emergency clearing of storm grates to prevent choked culverts.');
    }
    if (params.powerStress >= 125) {
      recommendations.push('Initiate scheduled industrial load shedding to safeguard hospital grids and water treatment plants.');
      criticalHotspots.push('Sanathnagar Industrial Substation');
    }
    if (params.staffingPercent < 70) {
      recommendations.push('Recall reserve NDRF / Civil Defense volunteers for emergency traffic and rescue operations.');
    }
    if (recommendations.length === 0) {
      recommendations.push('City operating within safe envelope. Maintain regular automated sensor surveillance.');
    }

    return {
      overallRisk,
      trafficGridlock,
      floodRisk,
      gridOverload,
      emergencyStress,
      wasteBlockageRisk,
      recommendations,
      criticalHotspots,
    };
  }, [params]);

  const radarData = [
    { subject: 'Traffic Gridlock', score: calculation.trafficGridlock, fullMark: 100 },
    { subject: 'Flash Flood', score: calculation.floodRisk, fullMark: 100 },
    { subject: 'Power Grid Load', score: calculation.gridOverload, fullMark: 100 },
    { subject: 'Response Stress', score: calculation.emergencyStress, fullMark: 100 },
    { subject: 'Drainage Choke', score: calculation.wasteBlockageRisk, fullMark: 100 },
  ];

  // Preset Scenario Handlers
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'monsoon':
        setParams({ trafficVolume: 1.4, rainfall: 85, wasteFactor: 2.2, powerStress: 110, staffingPercent: 75 });
        break;
      case 'festival':
        setParams({ trafficVolume: 2.3, rainfall: 5, wasteFactor: 2.8, powerStress: 135, staffingPercent: 80 });
        break;
      case 'heatwave':
        setParams({ trafficVolume: 1.1, rainfall: 0, wasteFactor: 1.2, powerStress: 145, staffingPercent: 65 });
        break;
      case 'optimal':
        setParams(DEFAULT_SIM);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[#202B29] tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-[#188568]" />
              <span>What-If Urban Scenario Simulator</span>
            </h1>
            <DataSourceBadge source="rule-based" />
          </div>
          <p className="text-xs sm:text-sm text-[#697773] mt-1">
            Simulate hypothetical compound extreme weather, traffic surges, and infrastructure disruptions to evaluate civic resilience.
          </p>
        </div>

        {/* Reset button */}
        <button
          onClick={() => setParams(DEFAULT_SIM)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F7F8F5] text-[#202B29] text-xs font-semibold border border-[#E1E7E2] transition-colors shadow-sm shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Preset Scenario Quick Selectors */}
      <div className="bg-white p-4 rounded-xl border border-[#E1E7E2] shadow-sm flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-[#697773] mr-2 font-bold">Preset Scenarios:</span>
        <button
          onClick={() => applyPreset('monsoon')}
          className="px-3 py-1.5 rounded-lg bg-[#438C91]/10 hover:bg-[#438C91]/20 border border-[#438C91]/30 text-[#438C91] text-xs font-semibold transition-all"
        >
          🌧️ Monsoon Flash Flood
        </button>
        <button
          onClick={() => applyPreset('festival')}
          className="px-3 py-1.5 rounded-lg bg-[#C49A24]/10 hover:bg-[#C49A24]/20 border border-[#C49A24]/30 text-[#C49A24] text-xs font-semibold transition-all"
        >
          🎉 Festival Rush & Waste Surge
        </button>
        <button
          onClick={() => applyPreset('heatwave')}
          className="px-3 py-1.5 rounded-lg bg-[#D64545]/10 hover:bg-[#D64545]/20 border border-[#D64545]/30 text-[#D64545] text-xs font-semibold transition-all"
        >
          ☀️ Extreme Heatwave & Power Deficit
        </button>
        <button
          onClick={() => applyPreset('optimal')}
          className="px-3 py-1.5 rounded-lg bg-[#188568]/10 hover:bg-[#188568]/20 border border-[#188568]/30 text-[#188568] text-xs font-semibold transition-all"
        >
          ✨ Normal Baseline
        </button>
      </div>

      {/* Main Grid: Controls Left, Simulation Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm space-y-5">
          <h2 className="text-base font-bold text-[#202B29] pb-3 border-b border-[#E1E7E2] flex items-center justify-between">
            <span>Urban Stress Parameters</span>
            <span className="text-xs font-mono font-semibold text-[#188568]">Interactive Inputs</span>
          </h2>

          {/* Slider 1: Traffic Volume Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#202B29] font-semibold flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#188568]" />
                <span>Traffic Volume Load</span>
              </span>
              <span className="font-mono font-bold text-[#188568]">{params.trafficVolume.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={params.trafficVolume}
              onChange={(e) => setParams({ ...params, trafficVolume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#E1E7E2] rounded-lg appearance-none cursor-pointer accent-[#188568]"
            />
            <div className="flex justify-between text-[10px] text-[#697773] font-mono font-medium">
              <span>0.5x Light</span>
              <span>1.0x Normal</span>
              <span>2.5x Gridlock</span>
            </div>
          </div>

          {/* Slider 2: Rainfall Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#202B29] font-semibold flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-[#438C91]" />
                <span>Rainfall Intensity</span>
              </span>
              <span className="font-mono font-bold text-[#438C91]">{params.rainfall} mm/hr</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={params.rainfall}
              onChange={(e) => setParams({ ...params, rainfall: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#E1E7E2] rounded-lg appearance-none cursor-pointer accent-[#438C91]"
            />
            <div className="flex justify-between text-[10px] text-[#697773] font-mono font-medium">
              <span>0 mm Dry</span>
              <span>30 mm Moderate</span>
              <span>120 mm Cloudburst</span>
            </div>
          </div>

          {/* Slider 3: Solid Waste Factor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#202B29] font-semibold flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-[#C49A24]" />
                <span>Waste Accumulation Factor</span>
              </span>
              <span className="font-mono font-bold text-[#C49A24]">{params.wasteFactor.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={params.wasteFactor}
              onChange={(e) => setParams({ ...params, wasteFactor: parseFloat(e.target.value) })}
              className="w-full h-2 bg-[#E1E7E2] rounded-lg appearance-none cursor-pointer accent-[#C49A24]"
            />
            <div className="flex justify-between text-[10px] text-[#697773] font-mono font-medium">
              <span>1.0x Standard</span>
              <span>2.0x Heavy</span>
              <span>3.0x Choked</span>
            </div>
          </div>

          {/* Slider 4: Power Grid Stress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#202B29] font-semibold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#D97732]" />
                <span>Power & Transformer Load</span>
              </span>
              <span className="font-mono font-bold text-[#D97732]">{params.powerStress}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              step="5"
              value={params.powerStress}
              onChange={(e) => setParams({ ...params, powerStress: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#E1E7E2] rounded-lg appearance-none cursor-pointer accent-[#D97732]"
            />
            <div className="flex justify-between text-[10px] text-[#697773] font-mono font-medium">
              <span>50% Low</span>
              <span>100% Rated</span>
              <span>150% Overload</span>
            </div>
          </div>

          {/* Slider 5: Emergency Staffing */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#202B29] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#D64545]" />
                <span>Active Emergency Responders</span>
              </span>
              <span className="font-mono font-bold text-[#D64545]">{params.staffingPercent}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="5"
              value={params.staffingPercent}
              onChange={(e) => setParams({ ...params, staffingPercent: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#E1E7E2] rounded-lg appearance-none cursor-pointer accent-[#D64545]"
            />
            <div className="flex justify-between text-[10px] text-[#697773] font-mono font-medium">
              <span>40% Depleted</span>
              <span>75% Adequate</span>
              <span>100% Full Force</span>
            </div>
          </div>

          {/* Simulation disclaimer note */}
          <div className="p-3 bg-[#F7F8F5] rounded-lg border border-[#E1E7E2] text-[11px] text-[#697773] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#188568] shrink-0 mt-0.5" />
            <span>Interactive physics-inspired simulation model for training and scenario planning.</span>
          </div>
        </div>

        {/* Results & Radar Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Score Banner */}
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#697773] block mb-1 font-semibold">
                Projected Composite City Risk
              </span>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-extrabold font-mono ${
                  calculation.overallRisk >= 75 ? 'text-[#D64545]' : calculation.overallRisk >= 50 ? 'text-[#D97732]' : 'text-[#23865D]'
                }`}>
                  {calculation.overallRisk}/100
                </span>
                <SeverityBadge 
                  severity={calculation.overallRisk >= 75 ? 'Critical' : calculation.overallRisk >= 50 ? 'High' : 'Low'} 
                  size="md" 
                />
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs text-[#697773] block font-mono font-semibold">Response Readiness</span>
              <span className="text-lg font-bold text-[#202B29] font-mono">
                {Math.max(10, 100 - calculation.emergencyStress)}%
              </span>
            </div>
          </div>

          {/* Radar Chart Multi-Vector Risk */}
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
            <h3 className="text-sm font-bold text-[#202B29] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#188568]" />
              <span>Multi-Domain Stress Radar</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E1E7E2" />
                  <PolarAngleAxis dataKey="subject" stroke="#697773" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#697773" fontSize={10} />
                  <Radar name="Projected Risk" dataKey="score" stroke="#188568" fill="#188568" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E1E7E2', borderRadius: '0.5rem', color: '#202B29', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Suggested Response Actions */}
          <div className="bg-white p-5 rounded-xl border border-[#E1E7E2] shadow-sm">
            <h3 className="text-sm font-bold text-[#202B29] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#188568]" />
              <span>Dynamic Mitigation & Response Plan</span>
            </h3>

            <div className="space-y-2">
              {calculation.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-[#F7F8F5] rounded-lg border border-[#E1E7E2] flex items-start gap-2.5 text-xs text-[#202B29]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#188568] shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>

            {calculation.criticalHotspots.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E1E7E2] flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[#697773] font-semibold">High Risk Hotspots:</span>
                {calculation.criticalHotspots.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#D64545]/10 text-[#D64545] border border-[#D64545]/20 font-mono text-[11px] font-bold">
                    📍 {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

