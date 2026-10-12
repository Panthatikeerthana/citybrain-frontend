import { CitizenComplaint } from '../types';
import { apiFetch, resolveCoordinates } from './api';

export const getComplaints = async (): Promise<CitizenComplaint[]> => {
  const response = await apiFetch('/complaints');
  if (!response.ok) {
    throw new Error(`Failed to fetch complaints: ${response.statusText}`);
  }
  const data = await response.json();
  return data.map((item: any) => ({
    ...item,
    title: item.title || `${item.category}: ${item.location}`,
    citizenName: item.citizenName || item.citizen_name || 'Anonymous Citizen',
    severity: item.priority || item.severity || 'Medium',
    priority: item.priority || 'Medium',
    status: item.status || 'Submitted',
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    coordinates: item.coordinates || resolveCoordinates(item.location),
    isLive: true,
  }));
};

export const getComplaintById = async (id: string | number): Promise<CitizenComplaint> => {
  const response = await apiFetch(`/complaints/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch complaint #${id}: ${response.statusText}`);
  }
  const item = await response.json();
  return {
    ...item,
    title: item.title || `${item.category}: ${item.location}`,
    citizenName: item.citizenName || item.citizen_name || 'Anonymous Citizen',
    severity: item.priority || item.severity || 'Medium',
    priority: item.priority || 'Medium',
    status: item.status || 'Submitted',
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    isLive: true,
  };
};

export const submitComplaint = async (
  complaint: {
    citizenName: string;
    category: string;
    description: string;
    location: string;
    priority?: string;
    status?: string;
  }
): Promise<CitizenComplaint> => {
  const payload = {
    citizenName: complaint.citizenName,
    category: complaint.category,
    description: complaint.description,
    location: complaint.location,
    priority: complaint.priority || 'Medium',
    status: complaint.status || 'Submitted',
  };

  const response = await apiFetch('/complaints', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to submit complaint: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    title: `${created.category}: ${created.location}`,
    severity: created.priority || 'Medium',
    isLive: true,
  };
};

export const updateComplaint = async (
  id: string | number,
  updatedData: Partial<{
    citizenName: string;
    category: string;
    description: string;
    location: string;
    priority: string;
    status: string;
  }>
): Promise<CitizenComplaint> => {
  const response = await apiFetch(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Failed to update complaint #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    title: `${updated.category}: ${updated.location}`,
    severity: updated.priority || 'Medium',
    isLive: true,
  };
};

export const deleteComplaint = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/complaints/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete complaint #${id}: ${response.status}`);
  }
};
