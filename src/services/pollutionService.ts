import { PollutionRecord } from '../types';
import { DEMO_POLLUTION_RECORDS } from '../data/demoData';

export const fetchPollutionRecords = async (): Promise<{ data: PollutionRecord[]; isLive: boolean; message: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    data: DEMO_POLLUTION_RECORDS,
    isLive: false,
    message: 'Illustrative simulated air-quality indicators. Not direct calibrated sensor measurements.',
  };
};
