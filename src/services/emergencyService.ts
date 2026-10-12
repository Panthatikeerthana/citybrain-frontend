import { EmergencyIncident } from '../types';
import { apiFetch, resolveCoordinates } from './api';

export const fetchEmergencyIncidents = async (): Promise<{ data: EmergencyIncident[]; isLive: boolean; message: string }> => {
  const response = await apiFetch('/emergencies');
  if (!response.ok) {
    throw new Error(`Failed to fetch emergency incidents: ${response.statusText}`);
  }
  const rawList = await response.json();
  const incidents: EmergencyIncident[] = rawList.map((item: any) => ({
    ...item,
    title: item.title || `${item.type || 'Emergency'} at ${item.location}`,
    category: item.type || 'Traffic Accident',
    severity: item.severity || 'Medium',
    status: item.status || 'REPORTED',
    timestamp: item.reportedAt || item.reported_at || new Date().toISOString(),
    reportedAt: item.reportedAt || item.reported_at || new Date().toISOString(),
    respondersAssigned: item.respondersAssigned || ['DRF Unit 4', 'Traffic Police Unit'],
    coordinates: item.coordinates || resolveCoordinates(item.location),
    isLive: true,
  }));

  return {
    data: incidents,
    isLive: true,
    message: 'Loaded verified Hyderabad emergency response events directly from MySQL database.',
  };
};

export const getEmergencyById = async (id: string | number): Promise<EmergencyIncident> => {
  const response = await apiFetch(`/emergencies/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch emergency #${id}: ${response.statusText}`);
  }
  const item = await response.json();
  return {
    ...item,
    title: item.title || `${item.type || 'Emergency'} at ${item.location}`,
    category: item.type || 'Traffic Accident',
    severity: item.severity || 'Medium',
    status: item.status || 'REPORTED',
    timestamp: item.reportedAt || item.reported_at || new Date().toISOString(),
    respondersAssigned: item.respondersAssigned || ['DRF Unit 4', 'Traffic Police Unit'],
    isLive: true,
  };
};

export const createEmergencyIncident = async (incident: {
  type: string;
  location: string;
  severity: string;
  description: string;
  status?: string;
}): Promise<EmergencyIncident> => {
  const payload = {
    type: incident.type,
    location: incident.location,
    severity: incident.severity,
    description: incident.description,
    status: incident.status || 'REPORTED',
  };

  const response = await apiFetch('/emergencies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to create emergency: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    title: `${created.type} at ${created.location}`,
    category: created.type,
    timestamp: created.reportedAt || new Date().toISOString(),
    respondersAssigned: ['DRF Unit 4', 'Traffic Police Unit'],
    isLive: true,
  };
};

export const updateEmergencyIncident = async (
  id: string | number,
  updatedData: Partial<{
    type: string;
    location: string;
    severity: string;
    description: string;
    status: string;
  }>
): Promise<EmergencyIncident> => {
  const response = await apiFetch(`/emergencies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to update emergency #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    title: `${updated.type} at ${updated.location}`,
    category: updated.type,
    timestamp: updated.reportedAt || new Date().toISOString(),
    respondersAssigned: ['DRF Unit 4', 'Traffic Police Unit'],
    isLive: true,
  };
};

export const updateIncidentStatus = async (
  incidentId: string | number, 
  newStatus: string
): Promise<EmergencyIncident[]> => {
  await updateEmergencyIncident(incidentId, { status: newStatus });
  const all = await fetchEmergencyIncidents();
  return all.data;
};

export const deleteEmergencyIncident = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/emergencies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete emergency #${id}: ${response.status}`);
  }
};
