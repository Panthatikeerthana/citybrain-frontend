# City Brain — AI-Powered Intelligent Urban Management and Prediction System

> *"Sense the city. Predict the problem. Plan the response."*

**City Brain** is an intelligent, multi-domain municipal command center and predictive intelligence platform designed for urban authorities, command center operators, and citizens in the **Greater Hyderabad Metropolitan Area**. It unifies real-time external telemetry (Open-Meteo live weather, Open-Meteo ambient air quality, and TomTom traffic flow), persistent relational data (MySQL), Google Gemini generative AI reasoning, and interactive spatial analytics into a single operations-grade management platform.

---

## 🌟 Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (Warm-white `#F7F8F5` and Forest-green `#173D35` aesthetic)
- **Routing**: React Router 6 (SPA with `vercel.json` rewrites)
- **Data Visualizations**: Recharts (diurnal trends, junction flow rankings)
- **Spatial Mapping**: Leaflet + OpenStreetMap & CartoDB tiles
- **Icons**: Lucide React
- **Hosting**: Vercel

### Backend
- **Framework**: Java 17 + Spring Boot
- **Persistence**: Spring Data JPA + Hibernate
- **Security**: Spring Security + Stateless JWT Authentication (HMAC-SHA512)
- **HTTP Client**: Native Java `HttpClient` with connection timeouts
- **Build Tool**: Apache Maven (wrapper included)
- **Hosting**: Render (Docker containerized) / Linux PaaS

### Database
- **Engine**: MySQL 8.0+ / Cloud MySQL (TiDB, Aiven, Railway, AWS RDS)
- **Schema**: 9 relational tables with foreign keys and safe schema updates

### External Feeds & AI
- **Generative AI**: Google Gemini API (`gemini-1.5-flash`) via backend proxy
- **Live Weather**: Open-Meteo Weather Forecast API
- **Live Air Quality**: Open-Meteo Air Quality API (US AQI & particulate matter)
- **Live Traffic**: TomTom Traffic Flow API

---

## 🏛️ Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React 18 Frontend      │
                          │      (Vercel SPA)        │
                          └─────────────┬────────────┘
                                        │ HTTPS + JWT Bearer
                                        ▼
                          ┌──────────────────────────┐
                          │   Spring Boot Backend    │
                          │   (Render Container)     │
                          └──────┬──────────┬────────┘
                                 │          │
         ┌───────────────────────┴──┐     ┌─┴────────────────────────┐
         │ Relational Persistence   │     │ External Live Feeds & AI │
         ▼                          │     ▼                          ▼
┌──────────────────┐                │  ┌────────────┐        ┌─────────────┐
│  Cloud MySQL     │                │  │ Open-Meteo │        │   Google    │
│  - app_users     │                │  │ (Weather & │        │   Gemini    │
│  - traffic       │                │  │  Air Qual) │        │  AI Engine  │
│  - weather       │                │  └────────────┘        └─────────────┘
│  - complaints    │                │  ┌────────────┐
│  - emergencies   │                │  │   TomTom   │
│  - water_issues  │                │  │  Traffic   │
│  - waste_records │                │  │  Flow API  │
│  - pollution     │                │  └────────────┘
│  - risks         │                │
└──────────────────┘                └────────────────────────────────
```

---

## ⚡ Core Modules & Features

1. **Authentication & Access Control**:
   - BCrypt password hashing.
   - Stateless JWT authentication with Bearer tokens.
   - Protected routes, public-only routes, session restoration via `GET /api/auth/me`.
2. **Command Dashboard**:
   - Executive urban KPIs (active emergencies, complaints queue, average congestion).
   - Real-time Live Telemetry Grid (Open-Meteo live weather, live AQI, TomTom traffic status).
3. **Citizen Grievance Redressal**:
   - Full MySQL CRUD for citizen grievances (potholes, drainage, streetlights).
   - Category filtering, priority scoring, and status transitions (`OPEN`, `IN_PROGRESS`, `RESOLVED`).
4. **Emergency Management**:
   - Dispatch coordination for fire, medical, police, and multi-vehicle collisions.
5. **Water Network Intelligence**:
   - Municipal pipeline monitoring, pressure analysis (PSI), and leak tracking.
6. **Solid Waste Management**:
   - Bin accumulation tracking, commercial tonnage records, and route allocation.
7. **Air Quality Monitoring**:
   - Dual-source monitoring: Live Open-Meteo ambient AQI + MySQL monitoring station records.
8. **Predictive Urban Risk Engine**:
   - Rule-based hazard matrices forecasting monsoon inundation, grid failures, and bottlenecks.
9. **AI City Assistant (Gemini)**:
   - Natural language assistant reasoning over real-time database context.
   - Rate limiting (15 requests/min) and prompt isolation.
   - Clear demarcation between **LIVE EXTERNAL FEEDS** and **STORED HISTORICAL RECORDS**.
10. **Interactive Spatial Map**:
    - Leaflet GIS canvas with interactive markers for Hyderabad junctions, stations, and incidents.

---

## 🔐 Environment Variables

> [!IMPORTANT]
> **Zero Secrets Policy**: Never commit real API keys, database credentials, or JWT secrets to Git. Configure these variables in your hosting dashboard or local `.env` files.

### Backend Environment Variables (`citybrain-backend`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `8080` | Port on which Spring Boot binds (automatically set by Render) |
| `SPRING_PROFILES_ACTIVE` | Optional | `prod` | Activates production configuration |
| `DB_URL` | **Yes** | `jdbc:mysql://<host>:3306/citybrain` | JDBC connection string |
| `DB_USERNAME` | **Yes** | `admin` | MySQL database username |
| `DB_PASSWORD` | **Yes** | `***` | MySQL database password |
| `JWT_SECRET` | **Yes** | `<64+ char secret>` | Cryptographic secret for signing JWT tokens |
| `FRONTEND_URL` | **Yes** | `https://your-frontend.vercel.app` | Allowed CORS origin for production frontend |
| `GEMINI_API_KEY` | Optional | `***` | Google Gemini API key (enables generative AI assistant) |
| `GEMINI_MODEL` | Optional | `gemini-1.5-flash` | Gemini model identifier |
| `TRAFFIC_API_KEY` | Optional | `***` | TomTom Traffic Flow API key (enables live corridor speeds) |

### Frontend Environment Variables (`citybrain-frontend`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes (Prod)** | `/api` | Base URL of deployed backend (e.g. `https://citybrain-backend.onrender.com/api`) |

---

## 🚀 Local Development Setup

### Prerequisites
- JDK 17+ installed
- Node.js 18+ and npm installed
- MySQL 8.0+ running locally on port 3306

### 1. Database Setup
```bash
mysql -u root -p < production_schema.sql
```

### 2. Backend Setup
```bash
cd citybrain-backend
./mvnw clean spring-boot:run
```
Backend will start on `http://localhost:8080`. Public health check available at `http://localhost:8080/api/health`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🌐 Production Deployment Guide

### A. Deploy Database (Cloud MySQL)
1. Provision a managed MySQL database (e.g., [Aiven](https://aiven.io/), [TiDB Serverless](https://tidbcloud.com/), or [Railway](https://railway.app/)).
2. Import `production_schema.sql` into the database.
3. Note the connection URL, username, and password.

### B. Deploy Backend to Render
1. Push `citybrain-backend` to GitHub.
2. In the Render Dashboard, create a **New Web Service** connected to your repository.
3. Select **Docker** environment (or Maven runtime). Render will detect the included `Dockerfile` and `render.yaml`.
4. Add the required environment variables:
   - `SPRING_PROFILES_ACTIVE=prod`
   - `DB_URL=jdbc:mysql://<host>:<port>/<dbname>?useSSL=true`
   - `DB_USERNAME=<user>`
   - `DB_PASSWORD=<password>`
   - `JWT_SECRET=<random-64-character-string>`
   - `FRONTEND_URL=https://<your-app>.vercel.app`
   - `GEMINI_API_KEY=<your-gemini-key>`
   - `TRAFFIC_API_KEY=<your-tomtom-key>`
5. Click **Deploy**. Verify the deployment via `https://<your-backend>.onrender.com/api/health`.

### C. Deploy Frontend to Vercel
1. Push `citybrain-frontend` to GitHub.
2. In the Vercel Dashboard, import the repository.
3. Framework Preset: **Vite**.
4. Root Directory: `./` (or `frontend`).
5. Build Command: `npm run build`, Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL=https://<your-backend>.onrender.com/api`
7. Click **Deploy**.
8. Copy the deployed Vercel domain and update `FRONTEND_URL` on your Render backend service.

---

## 🛡️ Security & Privacy Notice
- The application automatically scrubs API keys and database credentials from outgoing HTTP error messages.
- Rate limiting enforces a maximum of 15 generative AI requests per minute per user.
- If live API keys are not supplied, the platform fails gracefully to structured metadata rather than inventing simulated numbers.
