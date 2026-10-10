import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CityBrainProvider } from './context/CityBrainContext';
import { AppLayout } from './layout/AppLayout';

import { DashboardPage } from './pages/DashboardPage';
import { MapPage } from './pages/MapPage';
import { TrafficPage } from './pages/TrafficPage';
import { WeatherPage } from './pages/WeatherPage';
import { WaterPage } from './pages/WaterPage';
import { WastePage } from './pages/WastePage';
import { PollutionPage } from './pages/PollutionPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { RiskPredictionPage } from './pages/RiskPredictionPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { AssistantPage } from './pages/AssistantPage';

export const App: React.FC = () => {
  return (
    <CityBrainProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="traffic" element={<TrafficPage />} />
            <Route path="weather" element={<WeatherPage />} />
            <Route path="water" element={<WaterPage />} />
            <Route path="waste" element={<WastePage />} />
            <Route path="pollution" element={<PollutionPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="risk-prediction" element={<RiskPredictionPage />} />
            <Route path="simulator" element={<SimulatorPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CityBrainProvider>
  );
};

export default App;
