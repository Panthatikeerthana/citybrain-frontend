import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  TrafficRecord, 
  WeatherData, 
  WaterIssue, 
  WasteRecord, 
  PollutionRecord, 
  EmergencyIncident, 
  CitizenComplaint, 
  RiskPrediction,
  SystemStatus
} from '../types';
import { checkBackendHealth } from '../services/api';
import { fetchTrafficData } from '../services/trafficService';
import { fetchWeatherData } from '../services/weatherService';
import { fetchWaterIssues } from '../services/waterService';
import { fetchWasteRecords } from '../services/wasteService';
import { fetchPollutionRecords } from '../services/pollutionService';
import { fetchEmergencyIncidents, updateIncidentStatus } from '../services/emergencyService';
import { getComplaints, submitComplaint as addComplaintToStorage } from '../services/complaintService';
import { evaluateUrbanRisks } from '../services/riskService';

interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  link?: string;
}

interface CityBrainContextType {
  systemStatus: SystemStatus;
  traffic: TrafficRecord[];
  weather: WeatherData;
  waterIssues: WaterIssue[];
  wasteRecords: WasteRecord[];
  pollutionRecords: PollutionRecord[];
  emergencies: EmergencyIncident[];
  complaints: CitizenComplaint[];
  riskPredictions: RiskPrediction[];
  notifications: AlertNotification[];
  unreadCount: number;
  isLoading: boolean;
  lastRefresh: Date;
  refreshAllData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addComplaint: (complaint: Omit<CitizenComplaint, 'id' | 'createdAt' | 'status' | 'isLocalDemo'>) => CitizenComplaint;
  updateEmergencyStatus: (id: string, status: EmergencyIncident['status']) => Promise<void>;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const CityBrainContext = createContext<CityBrainContextType | undefined>(undefined);

export const CityBrainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [traffic, setTraffic] = useState<TrafficRecord[]>([]);
  const [weather, setWeather] = useState<WeatherData>({} as WeatherData);
  const [waterIssues, setWaterIssues] = useState<WaterIssue[]>([]);
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([]);
  const [pollutionRecords, setPollutionRecords] = useState<PollutionRecord[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    backendConnected: false,
    backendUrl: 'http://localhost:8080/api',
    lastChecked: new Date().toLocaleTimeString(),
    trafficSource: 'demo',
    weatherSource: 'demo',
    latencyMs: 0,
  });

  const [notifications, setNotifications] = useState<AlertNotification[]>([
    {
      id: 'notif-1',
      title: 'High Congestion Alert',
      message: 'LB Nagar Corridor congestion reached 81% (1,560 veh/hr).',
      type: 'critical',
      timestamp: '2 mins ago',
      read: false,
      link: '/traffic',
    },
    {
      id: 'notif-2',
      title: 'Severe Incident Dispatched',
      message: 'Multi-vehicle collision on LB Nagar Flyover ramp. Units en route.',
      type: 'warning',
      timestamp: '14 mins ago',
      read: false,
      link: '/emergency',
    },
    {
      id: 'notif-3',
      title: 'Drain Inundation Risk',
      message: 'Culvert overflow risk flagged at Uppal Low-Lying Underpass.',
      type: 'critical',
      timestamp: '30 mins ago',
      read: false,
      link: '/risk-prediction',
    },
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  const refreshAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Health check
      const health = await checkBackendHealth();

      // 2. Parallel data fetching
      const [
        trafficRes,
        weatherRes,
        waterRes,
        wasteRes,
        pollutionRes,
        emergencyRes,
      ] = await Promise.all([
        fetchTrafficData(),
        fetchWeatherData(),
        fetchWaterIssues(),
        fetchWasteRecords(),
        fetchPollutionRecords(),
        fetchEmergencyIncidents(),
      ]);

      const localComplaints = getComplaints();

      setTraffic(trafficRes.data);
      setWeather(weatherRes.data);
      setWaterIssues(waterRes.data);
      setWasteRecords(wasteRes.data);
      setPollutionRecords(pollutionRes.data);
      setEmergencies(emergencyRes.data);
      setComplaints(localComplaints);

      // Evaluate dynamic risks based on updated data
      const evaluatedRisks = evaluateUrbanRisks(
        trafficRes.data,
        weatherRes.data,
        emergencyRes.data,
        wasteRes.data
      );
      setRiskPredictions(evaluatedRisks);

      setSystemStatus({
        backendConnected: health.isConnected,
        backendUrl: 'http://localhost:8080/api',
        lastChecked: new Date().toLocaleTimeString(),
        trafficSource: trafficRes.isLive ? 'live' : 'demo',
        weatherSource: weatherRes.isLive ? 'live' : 'demo',
        latencyMs: health.latencyMs,
      });

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing City Brain telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    // Auto sync every 30 seconds
    const interval = setInterval(refreshAllData, 30000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addComplaint = (complaint: Omit<CitizenComplaint, 'id' | 'createdAt' | 'status' | 'isLocalDemo'>) => {
    const created = addComplaintToStorage(complaint);
    setComplaints(getComplaints());
    
    // Add an alert notification
    const newNotif: AlertNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Citizen Grievance',
      message: `${created.title} (${created.location})`,
      type: created.severity === 'High' || created.severity === 'Critical' ? 'critical' : 'info',
      timestamp: 'Just now',
      read: false,
      link: '/complaints',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return created;
  };

  const updateEmergencyStatus = async (id: string, status: EmergencyIncident['status']) => {
    const updated = await updateIncidentStatus(id, status);
    setEmergencies(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <CityBrainContext.Provider
      value={{
        systemStatus,
        traffic,
        weather,
        waterIssues,
        wasteRecords,
        pollutionRecords,
        emergencies,
        complaints,
        riskPredictions,
        notifications,
        unreadCount,
        isLoading,
        lastRefresh,
        refreshAllData,
        markNotificationRead,
        clearNotifications,
        addComplaint,
        updateEmergencyStatus,
        searchOpen,
        setSearchOpen,
      }}
    >
      {children}
    </CityBrainContext.Provider>
  );
};

export const useCityBrain = () => {
  const context = useContext(CityBrainContext);
  if (!context) {
    throw new Error('useCityBrain must be used within a CityBrainProvider');
  }
  return context;
};
