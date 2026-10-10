import { WasteRecord } from '../types';
import { DEMO_WASTE_RECORDS } from '../data/demoData';

export const fetchWasteRecords = async (): Promise<{ data: WasteRecord[]; isLive: boolean; message: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return {
    data: DEMO_WASTE_RECORDS,
    isLive: false,
    message: 'Displaying municipal solid waste sensor demo data. Backend API endpoint ready for integration.',
  };
};
