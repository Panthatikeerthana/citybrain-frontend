import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Car, 
  AlertTriangle, 
  Droplets, 
  Trash2, 
  Wind, 
  FileText, 
  Filter, 
  Layers, 
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { useCityBrain } from '../../context/CityBrainContext';

interface CityMapProps {
  height?: string;
  selectedCategory?: string;
  selectedSeverity?: string;
  centerCoord?: [number, number];
  zoom?: number;
  onMarkerSelect?: (item: any) => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  height = '600px',
  selectedCategory: initialCategory = 'all',
  selectedSeverity: initialSeverity = 'all',
  centerCoord = [17.3950, 78.4900], // Hyderabad centroid
  zoom = 11,
  onMarkerSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    traffic,
    emergencies,
    waterIssues,
    wasteRecords,
    pollutionRecords,
    complaints,
  } = useCityBrain();

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeSeverity, setActiveSeverity] = useState<string>(initialSeverity);
  const [mapError, setMapError] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Helper to build custom HTML SVG icons for Leaflet markers
  const createCustomIcon = (type: string, color: string, label: string) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          ${label}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: centerCoord,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add Light-themed CartoDB Voyager tiles
      const tileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
        }
      );

      tileLayer.addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch (err) {
      console.error('Failed to initialize Leaflet Map:', err);
      setMapError(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when data or filters change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Traffic Markers
    if (activeCategory === 'all' || activeCategory === 'traffic') {
      traffic.forEach((t) => {
        if (!t.coordinates) return;
        const [lat, lng] = t.coordinates;
        if (activeSeverity !== 'all' && t.status.toLowerCase() !== activeSeverity.toLowerCase()) return;

        const color = t.congestion >= 75 ? '#D64545' : t.congestion >= 45 ? '#D97732' : '#23865D';
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('traffic', color, '🚦'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #188568; letter-spacing: 0.05em;">Traffic Junction</span>
              <span style="font-size: 10px; background: ${color}15; color: ${color}; border: 1px solid ${color}40; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">${t.status}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${t.location}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">
              <div>Congestion: <strong style="color:#202B29">${t.congestion}%</strong></div>
              <div>Vehicle Volume: <strong style="color:#202B29">${t.vehicles.toLocaleString()} /hr</strong></div>
              <div>Estimated Speed: <strong style="color:#202B29">${t.speedKmh || 25} km/h</strong></div>
            </div>
            <div style="font-size: 10px; color: #697773; border-top: 1px solid #E1E7E2; padding-top: 4px;">
              Source: ${t.isLive ? 'Live TomTom Telemetry' : 'Database Record'}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(t));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 2. Emergency Incidents
    if (activeCategory === 'all' || activeCategory === 'emergency') {
      emergencies.forEach((e) => {
        if (!e.coordinates) return;
        const [lat, lng] = e.coordinates;
        if (activeSeverity !== 'all' && e.severity.toLowerCase() !== activeSeverity.toLowerCase()) return;

        const color = e.severity === 'Critical' ? '#D64545' : '#D97732';
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('emergency', color, '🚨'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #D64545;">${e.category}</span>
              <span style="font-size: 10px; background: ${color}15; color: ${color}; border: 1px solid ${color}40; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">${e.severity}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${e.title}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">${e.description}</div>
            <div style="font-size: 11px; color: #188568; margin-bottom: 4px;">
              Status: <strong>${e.status}</strong> (${e.timestamp})
            </div>
            <div style="font-size: 10px; color: #697773; border-top: 1px solid #E1E7E2; padding-top: 4px;">
              Responders: ${e.respondersAssigned.join(', ')}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(e));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 3. Water Issues
    if (activeCategory === 'all' || activeCategory === 'water') {
      waterIssues.forEach((w) => {
        if (!w.coordinates) return;
        const [lat, lng] = w.coordinates;
        if (activeSeverity !== 'all' && w.severity.toLowerCase() !== activeSeverity.toLowerCase()) return;

        const color = '#438C91';
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('water', color, '💧'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #438C91;">Water Network</span>
              <span style="font-size: 10px; background: #438C9115; color: #438C91; border: 1px solid #438C9140; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">${w.severity}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${w.issueType}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">
              <div>Location: <strong style="color:#202B29">${w.location}</strong></div>
              <div>Affected: <strong style="color:#202B29">${w.affectedHouseholds} Households</strong></div>
              <div>Pressure: <strong style="color:#202B29">${w.pressurePsi} PSI</strong></div>
            </div>
            <div style="font-size: 11px; color: #438C91;">Status: ${w.status}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(w));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 4. Waste Records
    if (activeCategory === 'all' || activeCategory === 'waste') {
      wasteRecords.forEach((ws) => {
        if (!ws.coordinates) return;
        const [lat, lng] = ws.coordinates;
        if (activeSeverity !== 'all' && ws.priority.toLowerCase() !== activeSeverity.toLowerCase()) return;

        const color = ws.fillPercentage >= 85 ? '#D64545' : '#C49A24';
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('waste', color, '🗑️'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #C49A24;">Solid Waste</span>
              <span style="font-size: 10px; background: ${color}15; color: ${color}; border: 1px solid ${color}40; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">${ws.priority}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${ws.location}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">
              <div>Bin Fill: <strong style="color:#202B29">${ws.fillPercentage}%</strong> (${ws.binCapacityLiters}L)</div>
              <div>Status: <strong style="color:#202B29">${ws.status}</strong></div>
              ${ws.vehicleAssigned ? `<div>Vehicle: <strong style="color:#202B29">${ws.vehicleAssigned}</strong></div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(ws));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 5. Pollution Air Quality Stations
    if (activeCategory === 'all' || activeCategory === 'pollution') {
      pollutionRecords.forEach((p) => {
        if (!p.coordinates) return;
        const [lat, lng] = p.coordinates;
        const color = p.aqi > 150 ? '#D64545' : p.aqi > 100 ? '#D97732' : '#23865D';

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('pollution', color, '💨'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #438C91;">AQI Station</span>
              <span style="font-size: 10px; background: ${color}15; color: ${color}; border: 1px solid ${color}40; padding: 2px 6px; border-radius: 9999px; font-weight: 600;">AQI ${p.aqi}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${p.stationName}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">
              <div>PM2.5: <strong style="color:#202B29">${p.pm25} µg/m³</strong> | PM10: <strong style="color:#202B29">${p.pm10}</strong></div>
              <div>Status: <strong style="color:#202B29">${p.status}</strong></div>
            </div>
            <div style="font-size: 10px; color: #697773; border-top: 1px solid #E1E7E2; padding-top: 4px;">
              Note: Regional simulated indicators
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(p));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    // 6. Citizen Complaints
    if (activeCategory === 'all' || activeCategory === 'complaints') {
      complaints.forEach((c) => {
        if (!c.coordinates) return;
        const [lat, lng] = c.coordinates;
        if (activeSeverity !== 'all' && c.severity.toLowerCase() !== activeSeverity.toLowerCase()) return;

        const marker = L.marker([lat, lng], {
          icon: createCustomIcon('complaint', '#188568', '📝'),
        });

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #188568;">Citizen Grievance</span>
              <span style="font-size: 10px; background: rgba(24, 133, 104, 0.1); color: #188568; border: 1px solid rgba(24, 133, 104, 0.3); padding: 2px 6px; border-radius: 9999px; font-weight: 600;">${c.category}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; color: #202B29; margin: 0 0 4px 0;">${c.title}</h4>
            <div style="font-size: 12px; color: #697773; margin-bottom: 6px;">
              <div>Location: <strong style="color:#202B29">${c.location}</strong></div>
              <div>Status: <strong style="color:#202B29">${c.status}</strong></div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => onMarkerSelect?.(c));
        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [activeCategory, activeSeverity, traffic, emergencies, waterIssues, wasteRecords, pollutionRecords, complaints]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(centerCoord, zoom);
    }
  };

  if (mapError) {
    return (
      <div 
        style={{ height }}
        className="w-full rounded-xl bg-white border border-[#E1E7E2] shadow-sm flex flex-col items-center justify-center p-6 text-center"
      >
        <AlertTriangle className="w-10 h-10 text-[#C49A24] mb-3" />
        <h3 className="text-base font-semibold text-[#202B29] mb-1">Interactive Map Offline Fallback</h3>
        <p className="text-sm text-[#697773] max-w-md mb-4">
          OpenStreetMap tiles could not be rendered. All smart city spatial telemetry remains fully active in tabular and dashboard views.
        </p>
        <button
          onClick={() => {
            setMapError(false);
            window.location.reload();
          }}
          className="px-4 py-2 bg-[#188568] hover:bg-[#11654F] text-white rounded-lg text-xs font-medium transition-colors"
        >
          Retry Map Engine Initialization
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#E1E7E2] shadow-sm bg-white">
      {/* Top Filter Bar Over Map */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-[400] flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-lg border border-[#E1E7E2] shadow-sm">
        {/* Category Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Layers', icon: Layers },
            { id: 'traffic', label: 'Traffic', icon: Car },
            { id: 'emergency', label: 'Incidents', icon: AlertTriangle },
            { id: 'water', label: 'Water', icon: Droplets },
            { id: 'waste', label: 'Waste', icon: Trash2 },
            { id: 'pollution', label: 'AQI', icon: Wind },
            { id: 'complaints', label: 'Complaints', icon: FileText },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#188568] text-white font-semibold'
                  : 'text-[#697773] hover:text-[#202B29] hover:bg-[#F7F8F5]'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Severity filter dropdown */}
        <div className="hidden md:flex items-center gap-1 border-l border-[#E1E7E2] pl-2">
          <Filter className="w-3.5 h-3.5 text-[#697773]" />
          <select
            value={activeSeverity}
            onChange={(e) => setActiveSeverity(e.target.value)}
            className="bg-white border border-[#E1E7E2] text-[#202B29] text-xs rounded-md px-2 py-1 outline-none font-sans"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical / Severe</option>
            <option value="high">High</option>
            <option value="moderate">Moderate</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button
          onClick={resetView}
          className="p-1.5 text-[#697773] hover:text-[#202B29] hover:bg-[#F7F8F5] rounded-md ml-auto"
          title="Reset Map Centroid (Hyderabad)"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actual Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Bottom Floating Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E1E7E2] text-xs flex items-center gap-3 hidden sm:flex shadow-sm">
        <span className="font-mono text-[10px] uppercase text-[#697773] tracking-wider">Legend:</span>
        <div className="flex items-center gap-1 text-[#202B29]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D64545]"></span>
          <span className="text-[11px]">Critical / High Congestion</span>
        </div>
        <div className="flex items-center gap-1 text-[#202B29]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#C49A24]"></span>
          <span className="text-[11px]">Moderate</span>
        </div>
        <div className="flex items-center gap-1 text-[#202B29]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#23865D]"></span>
          <span className="text-[11px]">Low / Optimal</span>
        </div>
      </div>
    </div>
  );
};
