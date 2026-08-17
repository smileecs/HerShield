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
        <div class="flex items-center justify-center w-9 h-9 bg-[#6C4AB6] text-white rounded-full shadow-lg border-2 border-white ring-4 ring-[#6C4AB6]/20 font-bold text-xs">
          📍
        </div>
      `;
      const startMarker = L.marker([startLocation.lat, startLocation.lng], {
        icon: createHtmlIcon(startHtml, '', [36, 36]),
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-semibold text-[#6C4AB6] uppercase tracking-wider">Start Point</div>
          <div class="text-sm font-medium text-[#24202B]">${startLocation.address}</div>
        </div>
      `);
      markersGroup.addLayer(startMarker);
      bounds.push([startLocation.lat, startLocation.lng]);
    }

    // 2. Destination Marker
    if (destination) {
      const destHtml = `
        <div class="flex items-center justify-center w-9 h-9 bg-[#E88BA5] text-white rounded-full shadow-lg border-2 border-white ring-4 ring-[#E88BA5]/30 font-bold text-xs">
          🏁
        </div>
      `;
      const destMarker = L.marker([destination.lat, destination.lng], {
        icon: createHtmlIcon(destHtml, '', [36, 36]),
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-semibold text-[#E88BA5] uppercase tracking-wider">Destination</div>
          <div class="text-sm font-medium text-[#24202B]">${destination.address}</div>
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

      // Color scheme based on route safety and selection
      const routeColor = isSelected
        ? route.safetyScore >= 80
          ? '#6C4AB6' // Primary HerShield Purple
          : route.safetyScore >= 70
          ? '#D99A24' // Warning Amber
          : '#D9535B' // Danger Red
        : '#A098AD'; // Soft Slate/Lavender Gray

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

          const bgClass = sm.type === 'incident' ? 'bg-[#D99A24]' : sm.type === 'police' ? 'bg-[#43266F]' : 'bg-[#2E9B67]';

          const markerHtml = `
            <div class="flex items-center justify-center w-7 h-7 ${bgClass} text-white rounded-full shadow-md border border-white text-xs">
              ${iconEmoji}
            </div>
          `;

          const smMarker = L.marker([sm.lat, sm.lng], {
            icon: createHtmlIcon(markerHtml, '', [28, 28]),
          }).bindPopup(`
            <div class="p-1 max-w-[200px] font-sans">
              <div class="font-semibold text-xs text-[#24202B] flex items-center gap-1">
                <span>${iconEmoji}</span> ${sm.title}
              </div>
              <div class="text-xs text-[#756D82] mt-0.5">${sm.description}</div>
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
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E9B67] opacity-75"></span>
          <div class="relative flex items-center justify-center w-8 h-8 bg-[#2E9B67] text-white rounded-full shadow-xl border-2 border-white ring-2 ring-[#2E9B67]/30 text-xs font-bold">
            🚶‍♀️
          </div>
        </div>
      `;
      const liveMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: createHtmlIcon(liveHtml, '', [40, 40]),
        zIndexOffset: 1000,
      }).bindPopup(`
        <div class="p-1 font-sans">
          <div class="text-xs font-bold text-[#2E9B67] uppercase tracking-wider flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#2E9B67] animate-pulse"></span> Live Position
          </div>
          <div class="text-xs text-[#756D82] mt-1">Updates streamed to Trusted Circle</div>
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

  // Handle Container Resizing dynamically
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-inner border border-slate-200 bg-[#F8F6FC]">
      <div ref={mapContainerRef} className={className} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-md border border-slate-200 text-[10px] sm:text-xs flex flex-wrap items-center gap-2 sm:gap-3 max-w-[calc(100%-24px)] pointer-events-none">
        <div className="flex items-center gap-1.5 font-medium text-[#24202B]">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#6C4AB6]"></span> Start
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#24202B]">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E88BA5]"></span> Destination
        </div>
        <div className="flex items-center gap-1.5 font-medium text-[#24202B]">
          <span className="w-2.5 h-1 sm:w-3 sm:h-1 bg-[#6C4AB6] rounded-full"></span> Recommended Route
        </div>
      </div>
    </div>
  );
};
