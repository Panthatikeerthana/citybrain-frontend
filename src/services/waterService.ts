import { WaterIssue } from '../types';
import { DEMO_WATER_ISSUES } from '../data/demoData';

export const fetchWaterIssues = async (): Promise<{ data: WaterIssue[]; isLive: boolean; message: string }> => {
  // Simulated asynchronous fetch
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    data: DEMO_WATER_ISSUES,
    isLive: false,
    message: 'Displaying water utility telemetry demo records. Backend API endpoint ready for integration.',
  };
};
