import { RiskPrediction, TrafficRecord, WeatherData, EmergencyIncident, WasteRecord, SeverityLevel } from '../types';
import { apiFetch } from './api';

export const fetchRiskPredictions = async (): Promise<{ data: RiskPrediction[]; isLive: boolean; message: string }> => {
  const response = await apiFetch('/risks');
  if (!response.ok) {
    throw new Error(`Failed to fetch risk predictions: ${response.statusText}`);
  }
  const rawList = await response.json();
  const data: RiskPrediction[] = rawList.map((item: any) => ({
    ...item,
    title: item.title || `${item.riskType || item.risk_type || 'Urban Risk'}: ${item.location}`,
    riskType: item.riskType || item.risk_type || 'Traffic Gridlock',
    riskLevel: item.riskLevel || item.risk_level || 'Medium',
    severity: (item.riskLevel || 'Medium') as SeverityLevel,
    probability: item.probability ?? 0.65,
    riskScore: Math.round((item.probability ?? 0.65) * 100),
    description: item.description || 'Urban risk identified across command corridor.',
    timestamp: item.predictedAt || item.predicted_at || new Date().toISOString(),
    timeHorizon: 'Next 3 Hours',
    whyFlagged: item.description || 'Predictive threshold exceeded in monitoring sector.',
    impactZone: `${item.location} Sector`,
    recommendedAction: `Deploy precautionary inspection and dispatch field unit to ${item.location}.`,
    detectedPatterns: [
      `Probability indexed at ${Math.round((item.probability ?? 0.65) * 100)}%`,
      `Telemetry threshold exceeded at ${item.location}`
    ],
    isLive: true,
  }));

  return {
    data,
    isLive: true,
    message: 'Displaying predictive risk models directly from MySQL database.',
  };
};

export const createRiskPrediction = async (risk: {
  location: string;
  riskType: string;
  riskLevel: string;
  probability: number;
  description: string;
}): Promise<RiskPrediction> => {
  const response = await apiFetch('/risks', {
    method: 'POST',
    body: JSON.stringify(risk),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create risk prediction: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    title: `${created.riskType} at ${created.location}`,
    riskScore: Math.round((created.probability ?? 0.7) * 100),
    severity: (created.riskLevel || 'Medium') as SeverityLevel,
    whyFlagged: created.description || '',
    impactZone: `${created.location} Sector`,
    recommendedAction: `Dispatch inspection unit to ${created.location}.`,
    detectedPatterns: [`Model probability: ${Math.round((created.probability ?? 0.7) * 100)}%`],
    isLive: true,
  };
};

export const updateRiskPrediction = async (
  id: string | number,
  updatedData: Partial<{
    location: string;
    riskType: string;
    riskLevel: string;
    probability: number;
    description: string;
  }>
): Promise<RiskPrediction> => {
  const response = await apiFetch(`/risks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update risk prediction #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    title: `${updated.riskType} at ${updated.location}`,
    riskScore: Math.round((updated.probability ?? 0.7) * 100),
    severity: (updated.riskLevel || 'Medium') as SeverityLevel,
    whyFlagged: updated.description || '',
    impactZone: `${updated.location} Sector`,
    recommendedAction: `Dispatch inspection unit to ${updated.location}.`,
    detectedPatterns: [`Model probability: ${Math.round((updated.probability ?? 0.7) * 100)}%`],
    isLive: true,
  };
};

export const deleteRiskPrediction = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/risks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete risk prediction #${id}: ${response.status}`);
  }
};

export const evaluateUrbanRisks = (
  trafficList: TrafficRecord[],
  _weather: WeatherData,
  _emergencies: EmergencyIncident[],
  _wasteList: WasteRecord[]
): RiskPrediction[] => {
  const dynamicRisks: RiskPrediction[] = [];

  const highCongestion = trafficList.filter(t => t.congestion >= 75);
  highCongestion.forEach((t) => {
    dynamicRisks.push({
      id: `RSK-DYN-${t.id}`,
      riskType: 'Traffic Gridlock',
      title: `Congestion Spike at ${t.location} (${t.congestion}%)`,
      location: t.location,
      riskScore: Math.min(95, Math.round(t.congestion * 1.05)),
      severity: (t.congestion > 85 ? 'Critical' : 'High') as SeverityLevel,
      detectedPatterns: [
        `Traffic congestion reached ${t.congestion}% with ${t.vehicles.toLocaleString()} vehicles/hr`,
        `Observed speed degraded to ${t.speedKmh || 15} km/h`,
      ],
      recommendedAction: `Adjust traffic light cycle time at ${t.location} junctions.`,
      timestamp: 'Real-time Rule Analysis',
      whyFlagged: `Congestion exceeds 75% threshold with heavy vehicle load.`,
      timeHorizon: 'Next 1 Hour',
      impactZone: `${t.location} Sector`,
      isRuleBasedDemo: false,
      isLive: true,
    });
  });

  return dynamicRisks;
};
