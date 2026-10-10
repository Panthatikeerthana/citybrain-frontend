import { CitizenComplaint } from '../types';
import { DEMO_COMPLAINTS } from '../data/demoData';

const STORAGE_KEY = 'citybrain_citizen_complaints';

export const getComplaints = (): CitizenComplaint[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
    return DEMO_COMPLAINTS;
  }
  try {
    return JSON.parse(stored);
  } catch (err) {
    return DEMO_COMPLAINTS;
  }
};

export const submitComplaint = (complaint: Omit<CitizenComplaint, 'id' | 'createdAt' | 'status' | 'isLocalDemo'>): CitizenComplaint => {
  const current = getComplaints();
  const newComplaint: CitizenComplaint = {
    ...complaint,
    id: `CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Submitted',
    createdAt: 'Just now',
    isLocalDemo: true,
  };

  const updated = [newComplaint, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newComplaint;
};

export const updateComplaintStatus = (id: string, status: CitizenComplaint['status']): CitizenComplaint[] => {
  const current = getComplaints();
  const updated = current.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
