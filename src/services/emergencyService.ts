import { EmergencyIncident } from '../types';
import { DEMO_EMERGENCIES } from '../data/demoData';

const LOCAL_INCIDENTS_KEY = 'citybrain_emergency_incidents';

export const fetchEmergencyIncidents = async (): Promise<{ data: EmergencyIncident[]; isLive: boolean; message: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  
  const saved = localStorage.getItem(LOCAL_INCIDENTS_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        data: parsed,
        isLive: false,
        message: 'Loaded demo incident records from local command cache.',
      };
    } catch {
      // ignore
    }
  }

  return {
    data: DEMO_EMERGENCIES,
    isLive: false,
    message: 'Loaded verified Hyderabad emergency response demo events.',
  };
};

export const updateIncidentStatus = async (
  incidentId: string, 
  newStatus: EmergencyIncident['status']
): Promise<EmergencyIncident[]> => {
  const current = (await fetchEmergencyIncidents()).data;
  const updated = current.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc);
  localStorage.setItem(LOCAL_INCIDENTS_KEY, JSON.stringify(updated));
  return updated;
};
