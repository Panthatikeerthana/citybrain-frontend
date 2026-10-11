import { WaterIssue, SeverityLevel } from '../types';
import { apiFetch } from './api';

export const fetchWaterIssues = async (): Promise<{ data: WaterIssue[]; isLive: boolean; message: string }> => {
  const response = await apiFetch('/water');
  if (!response.ok) {
    throw new Error(`Failed to fetch water issues: ${response.statusText}`);
  }
  const rawList = await response.json();
  const data: WaterIssue[] = rawList.map((item: any) => ({
    ...item,
    issueType: item.issueType || item.issue_type || 'Pipeline Leakage',
    severity: (item.severity || 'Medium') as SeverityLevel,
    status: item.status || 'Reported',
    affectedHouseholds: item.affectedHouseholds ?? 120,
    pressurePsi: item.pressurePsi ?? 35,
    reportedAt: item.reportedAt || item.reported_at || new Date().toISOString(),
    zone: item.zone || item.location,
    coordinates: item.coordinates || [17.3850, 78.4867],
    isLive: true,
  }));

  return {
    data,
    isLive: true,
    message: 'Displaying water utility telemetry records directly from MySQL database.',
  };
};

export const createWaterIssue = async (issue: {
  location: string;
  issueType: string;
  severity: string;
  description: string;
  status?: string;
}): Promise<WaterIssue> => {
  const response = await apiFetch('/water', {
    method: 'POST',
    body: JSON.stringify(issue),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to create water issue: ${response.status}`);
  }

  const created = await response.json();
  return {
    ...created,
    affectedHouseholds: created.affectedHouseholds ?? 120,
    pressurePsi: created.pressurePsi ?? 35,
    issueType: created.issueType || created.issue_type || 'Pipeline Leakage',
    isLive: true,
  };
};

export const updateWaterIssue = async (
  id: string | number,
  updatedData: Partial<{
    location: string;
    issueType: string;
    severity: string;
    description: string;
    status: string;
  }>
): Promise<WaterIssue> => {
  const response = await apiFetch(`/water/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Failed to update water issue #${id}: ${response.status}`);
  }

  const updated = await response.json();
  return {
    ...updated,
    affectedHouseholds: updated.affectedHouseholds ?? 120,
    pressurePsi: updated.pressurePsi ?? 35,
    issueType: updated.issueType || updated.issue_type || 'Pipeline Leakage',
    isLive: true,
  };
};

export const deleteWaterIssue = async (id: string | number): Promise<void> => {
  const response = await apiFetch(`/water/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to delete water issue #${id}: ${response.status}`);
  }
};
