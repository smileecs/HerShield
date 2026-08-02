import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteOption, SafetyMarker, Coordinate } from '../types';

interface LeafletMapProps {
  routes?: RouteOption[];
  selectedRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  startLocation?: { address: string; lat: number; lng: number };
  destination?: { address: string; lat: number; lng: number };
  currentLocation?: Coordinate;
  isJourneyActive?: boolean;
  className?: string;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  routes = [],
  selectedRouteId,
  onSelectRoute,
  startLocation = { lat: 28.6139, lng: 77.2090, address: 'Central Square Metro Station' },
  destination = { lat: 28.6328, lng: 77.2197, address: 'University Women\'s Hostel' },
  currentLocation,
  isJourneyActive = false,
  className = 'h-[420px] w-full rounded-2xl',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy prior map instance if existing
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [startLocation.lat, startLocation.lng],
        zoom: 14,
        zoomControl: interactive,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
      });

      // CartoDB Voyager Tile Layer (Modern, crisp light aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !markersGroup) return;

    // Clear existing overlay markers/polylines
    markersGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Custom Icon Creators
    const createHtmlIcon = (html: string, className = '', size: [number, number] = [32, 32]) => {
      return L.divIcon({
        html,
        className: `custom-map-icon ${className}`,
        iconSize: size,
        iconAnchor: [size[0] / 2, size[1] / 2],
      });
    };

    // 1. Start Marker
    if (startLocation) {
      const startHtml = `
        <div class="flex items-center justify-center w-9 h-9 bg-teal-700 text-white rounded-full shadow-lg border-2 border-white ring-4 ring-teal-600/20 font-bold text-xs">
          📍
        </div>
      `;
      const startMarker = L.marker([startLocation.lat, startLocation.lng], {
        icon: createHtmlIcon(startHtml, '', [36, 36]),
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-semibold text-teal-800 uppercase tracking-wider">Start Point</div>
          <div class="text-sm font-medium text-slate-800">${startLocation.address}</div>
        </div>
      `);
      markersGroup.addLayer(startMarker);
      bounds.push([startLocation.lat, startLocation.lng]);
    }

    // 2. Destination Marker
    if (destination) {
      const destHtml = `
        <div class="flex items-center justify-center w-9 h-9 bg-rose-600 text-white rounded-full shadow-lg border-2 border-white ring-4 ring-rose-500/20 font-bold text-xs">
          🏁
        </div>
      `;
      const destMarker = L.marker([destination.lat, destination.lng], {
        icon: createHtmlIcon(destHtml, '', [36, 36]),
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-semibold text-rose-700 uppercase tracking-wider">Destination</div>
          <div class="text-sm font-medium text-slate-800">${destination.address}</div>
        </div>
      `);
      markersGroup.addLayer(destMarker);
      bounds.push([destination.lat, destination.lng]);
    }

    // 3. Render Routes Polylines
    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const polylineCoords = route.path.map((p) => [p.lat, p.lng] as [number, number]);

      polylineCoords.forEach((c) => bounds.push(c));

      // Color scheme based on route safety
      const routeColor = isSelected
        ? route.safetyScore >= 80
          ? '#0f766e' // teal-700
          : route.safetyScore >= 70
          ? '#d97706' // amber-600
          : '#e11d48' // rose-600
        : '#94a3b8'; // slate-400

      const polyline = L.polyline(polylineCoords, {
        color: routeColor,
        weight: isSelected ? 6 : 3,
        opacity: isSelected ? 0.95 : 0.5,
        dashArray: isSelected ? undefined : '6, 8',
      });

      if (interactive && onSelectRoute) {
        polyline.on('click', () => onSelectRoute(route.id));
      }

      markersGroup.addLayer(polyline);

      // Render Safety Markers for Selected Route
      if (isSelected && route.safetyMarkers) {
        route.safetyMarkers.forEach((sm: SafetyMarker) => {
          const iconEmoji = {
            police: '🛡️',
            hospital: '🏥',
            lighting: '💡',
            transit: '🚌',
            store: '🏪',
            incident: '⚠️',
          }[sm.type] || '📍';

          const bgClass = sm.type === 'incident' ? 'bg-amber-500' : sm.type === 'police' ? 'bg-teal-800' : 'bg-emerald-600';

          const markerHtml = `
            <div class="flex items-center justify-center w-7 h-7 ${bgClass} text-white rounded-full shadow-md border border-white text-xs">
              ${iconEmoji}
            </div>
          `;

          const smMarker = L.marker([sm.lat, sm.lng], {
            icon: createHtmlIcon(markerHtml, '', [28, 28]),
          }).bindPopup(`
            <div class="p-1 max-w-[200px] font-sans">
              <div class="font-semibold text-xs text-slate-900 flex items-center gap-1">
                <span>${iconEmoji}</span> ${sm.title}
              </div>
              <div class="text-xs text-slate-600 mt-0.5">${sm.description}</div>
            </div>
          `);

          markersGroup.addLayer(smMarker);
        });
      }
    });

    // 4. Render Active Journey User Location Marker
    if (isJourneyActive && currentLocation) {
      const liveHtml = `
        <div class="relative flex items-center justify-center w-10 h-10">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <div class="relative flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full shadow-xl border-2 border-white ring-2 ring-emerald-500 text-xs font-bold">
            🚶‍♀️
          </div>
        </div>
      `;
      const liveMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: createHtmlIcon(liveHtml, '', [40, 40]),
        zIndexOffset: 1000,
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Journey Position
          </div>
          <div class="text-xs text-slate-600 mt-1">Updates streamed to Trusted Circle</div>
        </div>
      `);
      markersGroup.addLayer(liveMarker);
      bounds.push([currentLocation.lat, currentLocation.lng]);
    }

    // Auto fit map bounds if we have points
    if (bounds.length > 0) {
      try {
        map.fitBounds(L.latLngBounds(bounds), {
          padding: [40, 40],
          maxZoom: 16,
        });
      } catch (err) {
        console.warn('Map bounds fit warning:', err);
      }
    }
  }, [routes, selectedRouteId, startLocation, destination, currentLocation, isJourneyActive, interactive, onSelectRoute]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-inner border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className={className} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span> Start
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Destination
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-1 bg-teal-700 rounded-full"></span> Recommended Route
        </div>
      </div>
    </div>
  );
};
