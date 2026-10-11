import { WasteRecord, SeverityLevel } from '../types';
import { apiFetch } from './api';

export const fetchWasteRecords = async (): Promise<{ data: WasteRecord[]; isLive: boolean; message: string }> => {
  const response = await apiFetch('/waste');
  if (!response.ok) {
    throw new Error(`Failed to fetch waste records: ${response.statusText}`);
  }
  const rawList = await response.json();
  const data: WasteRecord[] = rawList.map((item: any) => ({
    ...item,
    zone: item.zone || item.location,
    wasteType: item.wasteType || item.waste_type || 'Municipal Solid Waste',
    quantity: item.quantity ?? 500,
    status: item.status || 'Scheduled for Pickup',
    binCapacityLiters: item.binCapacityLiters || 1000,
    fillPercentage: Math.min(100, Math.round(((item.quantity ?? 500) / 1000) * 100)),
    collectedAt: item.collectedAt || item.collected_at || new Date().toISOString(),
    lastCollection: item.collectedAt || item.collected_at || 'Today',
    priority: (item.quantity > 800 ? 'Critical' : item.quantity > 500 ? 'High' : 'Moderate') as SeverityLevel,
    vehicleAssigned: item.vehicleAssigned || 'GHMC Route 3',
    coordinates: item.coordinates || [17.3850, 78.4867],
    isLive: true,
  }));

  return {
    data,
    isLive: true,
    message: 'Displaying municipal solid waste sensor records directly from MySQL database.',
  };
};

export const createWasteRecord = async (record: {
  location: string;
  wasteType: string;
  quantity: number;
  status: string;
}): Promise<WasteRecord> => {
  const response = await apiFetch('/waste', {
    method: 'POST',
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create waste record: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    zone: created.zone || created.location,
    fillPercentage: Math.min(100, Math.round(((created.quantity ?? 500) / 1000) * 100)),
    priority: 'Moderate' as SeverityLevel,
    isLive: true,
  };
};

export const updateWasteRecord = async (
  id: string | number,
  updatedData: Partial<{
    location: string;
    wasteType: string;
    quantity: number;
    status: string;
  }>
): Promise<WasteRecord> => {
  const response = await apiFetch(`/waste/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update waste record #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    zone: updated.zone || updated.location,
    fillPercentage: Math.min(100, Math.round(((updated.quantity ?? 500) / 1000) * 100)),
    priority: 'Moderate' as SeverityLevel,
    isLive: true,
  };
};

export const deleteWasteRecord = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/waste/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete waste record #${id}: ${response.status}`);
  }
};
