import { RiskPrediction, TrafficRecord, WeatherData, EmergencyIncident, WasteRecord } from '../types';
import { DEMO_RISK_PREDICTIONS } from '../data/demoData';

export const evaluateUrbanRisks = (
  trafficList: TrafficRecord[],
  weather: WeatherData,
  emergencies: EmergencyIncident[],
  wasteList: WasteRecord[]
): RiskPrediction[] => {
  const dynamicRisks: RiskPrediction[] = [...DEMO_RISK_PREDICTIONS];

  // Dynamically evaluate high congestion hot spots
  const highCongestion = trafficList.filter(t => t.congestion >= 75);
  highCongestion.forEach((t) => {
    const existingIndex = dynamicRisks.findIndex(r => r.location.toLowerCase().includes(t.location.toLowerCase()));
    if (existingIndex === -1) {
      dynamicRisks.unshift({
        id: `RSK-DYN-${t.id}`,
        riskType: 'Traffic Gridlock',
        title: `Congestion Spike at ${t.location} (${t.congestion}%)`,
        location: t.location,
        riskScore: Math.min(95, Math.round(t.congestion * 1.05)),
        severity: t.congestion > 85 ? 'Critical' : 'High',
        detectedPatterns: [
          `Traffic congestion reached ${t.congestion}% with ${t.vehicles.toLocaleString()} vehicles/hr`,
          `Observed speed degraded to ${t.speedKmh || 15} km/h`,
          `Upstream queuing detected`
        ],
        recommendedAction: `Adjust traffic light cycle time at ${t.location} junctions and dispatch mobile traffic unit.`,
        timestamp: 'Real-time Rule Analysis',
        whyFlagged: `Congestion exceeds 75% threshold with heavy vehicle load.`,
        timeHorizon: 'Next 1 Hour',
        impactZone: `${t.location} Sector`,
        isRuleBasedDemo: true,
      });
    }
  });

  return dynamicRisks;
};
