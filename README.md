# City Brain — AI-Powered Intelligent Urban Management & Prediction System

> *"Sense the city. Predict the problem. Plan the response."*

A centralized smart-city command center built for **Greater Hyderabad Metropolitan Area**, uniting traffic surveillance, meteorological telemetry, water pipeline grids, solid waste management, continuous ambient air quality, emergency dispatch, citizen grievances, predictive risk analytics, and what-if simulation into an integrated, operations-grade interface.

---

## 🌟 Technology Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/) with development proxy to Spring Boot (`/api` -> `http://localhost:8080`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom dark command center theme, glassmorphism, and responsive layout
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/) + OpenStreetMap / CartoDB Voyager tiles with custom SVG marker pins & popup inspectors
- **Charts & Data Visualizations**: [Recharts](https://recharts.org/) (Bar, Area, Composed, Radar)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

The application will be accessible at:
👉 **[http://localhost:5173](http://localhost:5173)**

### 3. Production Build
```bash
npm run build
```

---

## 🔌 Backend Connectivity & Data Integrity

The frontend includes a built-in reverse proxy in `vite.config.ts` targeting `http://localhost:8080`:

| Endpoint | Target Method | Description | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `/api/traffic` | `GET` | Live junction congestion & vehicle density | Auto-switches to verified Hyderabad demo dataset if backend is offline |
| `/api/weather` | `GET` | Ambient temperature & precipitation telemetry | Displays regional meteorological simulation model |
| `/api/*` | Other | Water, waste, incidents, grievances | Local cache & demo records with transparent `DEMO` / `SIMULATED` indicators |

### Data Transparency Principles
- **No Fabricated Live Data**: Any module running on demo or heuristic models is explicitly labeled with `DEMO DATASET`, `RULE-BASED DEMO MODEL`, or `SIMULATED TELEMETRY` badges.
- **Resilient Fallback**: If the Spring Boot backend (`citybrain-backend`) is stopped or unreachable, the application gracefully maintains full interactive functionality with verified Hyderabad baseline records (Uppal, Ghatkesar, Jodimetla, LB Nagar, Kukatpally, Hitec City, etc.).

---

## 📂 Project Architecture

```
frontend/
├── index.html                     # HTML5 Shell with Fonts and Leaflet assets
├── package.json                   # Dependencies and scripts
├── tailwind.config.js             # Command center color palette configuration
├── vite.config.ts                 # Vite setup with Spring Boot API proxy (/api -> 8080)
├── src/
│   ├── types/                     # Strong TypeScript definitions
│   │   └── index.ts               # Interfaces for Traffic, Weather, Water, Incidents, Risks...
│   ├── data/                      # Baseline Hyderabad demonstration datasets
│   │   └── demoData.ts            # Authentic locations, coordinates, and incidents
│   ├── services/                  # Centralized API layer with normalizers
│   │   ├── api.ts                 # Health-check, normalization (camelCase / snake_case)
│   │   ├── trafficService.ts      # Live probe to GET /api/traffic
│   │   ├── weatherService.ts      # Live probe to GET /api/weather
│   │   ├── emergencyService.ts    # Incident dispatch & cache
│   │   ├── complaintService.ts    # LocalStorage citizen grievance persistence
│   │   └── riskService.ts         # Multi-factor correlation risk engine
│   ├── context/
│   │   └── CityBrainContext.tsx   # Global reactive state, polling, notifications & alerts
│   ├── layout/
│   │   └── AppLayout.tsx          # Responsive Sidebar, Header, Modals & Footer shell
│   ├── components/
│   │   ├── common/                # StatCard, Badges, SearchModal, NotificationDrawer...
│   │   └── map/                   # Interactive Leaflet CityMap with multi-layer filtering
│   └── pages/
│       ├── DashboardPage.tsx      # Central Overview Command Center
│       ├── MapPage.tsx            # Full-screen GIS Spatial Map & Node Directory
│       ├── TrafficPage.tsx        # Traffic management & congestion bar analytics
│       ├── WeatherPage.tsx        # Meteorology & hourly rainfall projections
│       ├── WaterPage.tsx          # Water supply & pipeline pressure telemetry
│       ├── WastePage.tsx          # Municipal solid waste & bin fill logistics
│       ├── PollutionPage.tsx      # CAAQMS air quality index & particulate breakdown
│       ├── EmergencyPage.tsx      # Multi-agency crisis dispatch & detail inspector
│       ├── ComplaintsPage.tsx     # Citizen grievance lodgment portal & tracker
│       ├── RiskPredictionPage.tsx # Predictive risk matrix with explainability notes
│       ├── SimulatorPage.tsx      # Interactive What-if urban resilience simulator
│       └── AssistantPage.tsx      # City Brain AI assistant with operational query engine
```

---

## 🛰️ Implemented Modules

1. **Command Overview Dashboard**: Real-time KPI summaries, traffic bar charts, diurnal atmospheric curve, live emergency dispatches, and predictive risk flags.
2. **Live City Map (GIS)**: Leaflet map centered over Hyderabad with categorized markers (traffic, emergencies, water leaks, waste bins, air quality, citizen complaints), custom popups, and layer toggles.
3. **Traffic Management**: Connects to `GET /api/traffic`, handles snake_case/camelCase timestamp normalization, includes table sorting, search, severity badges, and fallback demo dataset.
4. **Weather & Climate**: Temperature, feels like, humidity, rainfall accumulation, UV index, and hourly forecast charts.
5. **Water Management**: Tracks pipeline bursts, pressure collapses (PSI), and affected household counts.
6. **Waste Management**: Bin fill gauges, overflowing warnings, and compactor truck logistics.
7. **Air Quality (AQI)**: Continuous particulate matter (PM2.5, PM10) monitoring with clear simulation disclaimer.
8. **Emergency Dispatch Center**: Police, Fire, DRF, and 108 ambulance response coordination with status updates.
9. **Citizen Grievances**: Interactive form submission with client validation and browser localStorage persistence.
10. **Predictive Risk Engine**: Multi-sensor precursor detection explaining *why* a risk was flagged with recommended mitigation actions.
11. **What-If Urban Simulator**: Interactive sliders for traffic volume, rainfall intensity, waste factor, and power grid stress with real-time radar risk recalculation.
12. **AI Operations Assistant**: Natural language query engine over current city state with quick suggested inquiries.
