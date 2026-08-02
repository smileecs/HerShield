import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Search, Info, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { RouteOption } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { SAMPLE_ROUTES, SAMPLE_LOCATIONS } from '../data/mockData';

interface SafeRoutePageProps {
  onSelectRouteForJourney: (route: RouteOption, startLoc: any, destLoc: any) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const SafeRoutePage: React.FC<SafeRoutePageProps> = ({ onSelectRouteForJourney, showToast }) => {
  const [startInput, setStartInput] = useState(SAMPLE_LOCATIONS.start.address);
  const [destInput, setDestInput] = useState(SAMPLE_LOCATIONS.destination.address);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_a');
  const [isSearching, setIsSearching] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState<RouteOption[]>(SAMPLE_ROUTES);

  const [startCoords, setStartCoords] = useState(SAMPLE_LOCATIONS.start);
  const [destCoords, setDestCoords] = useState(SAMPLE_LOCATIONS.destination);

  // Current Location button handler
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      showToast('Fetching your GPS location...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newStart = {
            address: `Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setStartCoords(newStart);
          setStartInput(newStart.address);
          showToast('Updated starting point to current location', 'success');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          showToast('Unable to fetch precise location. Using default city center.', 'warning');
        }
      );
    } else {
      showToast('Geolocation is not supported by your browser', 'warning');
    }
  };

  const handleFindRoutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destInput.trim()) {
      showToast('Please enter a destination', 'warning');
      return;
    }

    setIsSearching(true);
    showToast('Analyzing safety information & calculating route options...', 'info');

    setTimeout(() => {
      setIsSearching(false);
      setActiveRoutes([...SAMPLE_ROUTES]);
      showToast('Found 3 routes with safety information scores', 'success');
    }, 600);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER & INPUT FORM */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6C4AB6] mb-1">
            <Navigation className="w-4 h-4 text-[#6C4AB6]" />
            <span>Route Safety Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#24202B]">Plan Your Journey</h1>
          <p className="text-xs sm:text-sm text-[#756D82] mt-1">
            Compare route options using facility density, lighting ratings, and reported incident levels.
          </p>
        </div>

        <form onSubmit={handleFindRoutes} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          {/* Starting Point */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-[#24202B] flex items-center justify-between">
              <span>Starting Point</span>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] text-[#6C4AB6] hover:text-[#43266F] font-bold flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-[#6C4AB6]" />
                <span>Use Current Location</span>
              </button>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#6C4AB6]" />
              <input
                type="text"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                placeholder="Enter starting location"
                className="w-full pl-10 pr-3 py-2.5 bg-[#F8F6FC] border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6C4AB6] font-medium text-[#24202B]"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="lg:col-span-5 space-y-1.5">
            <label className="block text-xs font-bold text-[#24202B]">Destination</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#E88BA5]" />
              <input
                type="text"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                placeholder="Search destination address or landmark"
                className="w-full pl-10 pr-3 py-2.5 bg-[#F8F6FC] border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E88BA5] font-medium text-[#24202B]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isSearching}
              className="btn-primary-glow w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 shadow-xs cursor-pointer"
            >
              {isSearching ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Find Routes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* INTERACTIVE MAP VISUALIZER */}
      <section className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
          <div>
            <h3 className="text-base font-bold text-[#24202B] flex items-center gap-2">
              <span>Route Safety Map</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F8F6FC] text-[#6C4AB6] border border-[#6C4AB6]/20">
                {activeRoutes.length} options mapped
              </span>
            </h3>
            <p className="text-xs text-[#756D82]">
              Click any route line on the map or select a route card below to view details.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#756D82]">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E9B67] animate-green-pulse"></span> 🟢 High Info
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D99A24]"></span> 🟡 Moderate
            </span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9535B]"></span> 🔴 Concerns
            </span>
          </div>
        </div>

        <LeafletMap
          routes={activeRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          startLocation={startCoords}
          destination={destCoords}
          className="h-[400px] sm:h-[460px] w-full rounded-2xl overflow-hidden"
        />
      </section>

      {/* ROUTE CARDS GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#24202B]">Available Route Options</h2>
          <div className="flex items-center gap-1 text-xs text-[#756D82] font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6C4AB6]" />
            <span>Sorted by Safety Information Score</span>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="p-3.5 rounded-2xl bg-[#F8F6FC] border border-[#6C4AB6]/20 text-[#24202B] text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-[#6C4AB6] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#6C4AB6]">Important Disclaimer:</span> Safety information scores are estimates based on available facility data, lighting infrastructure, and user community inputs. They do not guarantee personal safety.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeRoutes.map((route, idx) => {
            const isSelected = route.id === selectedRouteId;
            const isHighSafety = route.safetyScore >= 80;
            const isModerateSafety = route.safetyScore >= 65 && route.safetyScore < 80;

            return (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onClick={() => setSelectedRouteId(route.id)}
                className={`relative p-6 rounded-3xl transition-all cursor-pointer border flex flex-col justify-between card-hover ${
                  isSelected
                    ? 'bg-white border-[#6C4AB6] ring-2 ring-[#6C4AB6]/25 shadow-xl shadow-[#6C4AB6]/10'
                    : 'bg-white border-slate-200/80 hover:border-[#6C4AB6]/40 shadow-xs'
                }`}
              >
                {route.tag && (
                  <span
                    className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                      route.tag === 'Recommended'
                        ? 'bg-[#6C4AB6]'
                        : route.tag === 'Fastest'
                        ? 'bg-[#43266F]'
                        : 'bg-[#756D82]'
                    }`}
                  >
                    {route.tag}
                  </span>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <h3 className="text-base font-bold text-[#24202B]">{route.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-[#756D82] font-semibold mt-1">
                      <span>📏 {route.distanceKm} km</span>
                      <span>⏱️ {route.durationMin} mins</span>
                    </div>
                  </div>

                  {/* Safety Score Box */}
                  <div className="p-3.5 rounded-2xl bg-[#F8F6FC] border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#756D82] block uppercase tracking-wider">
                        Safety Info Score
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          isHighSafety
                            ? 'text-[#2E9B67]'
                            : isModerateSafety
                            ? 'text-[#D99A24]'
                            : 'text-[#D9535B]'
                        }`}
                      >
                        {route.safetyScore}
                        <span className="text-xs font-normal text-[#756D82]">/100</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          isHighSafety
                            ? 'bg-[#EBF7F1] text-[#2E9B67]'
                            : isModerateSafety
                            ? 'bg-[#FEF8EC] text-[#D99A24]'
                            : 'bg-[#FDF2F2] text-[#D9535B]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isHighSafety
                              ? 'bg-[#2E9B67] animate-green-pulse'
                              : isModerateSafety
                              ? 'bg-[#D99A24]'
                              : 'bg-[#D9535B]'
                          }`}
                        />
                        {isHighSafety
                          ? '🟢 Higher Safety Info'
                          : isModerateSafety
                          ? '🟡 Moderate'
                          : '🔴 Concerns Reported'}
                      </span>
                    </div>
                  </div>

                  {/* Details Bullet List */}
                  <ul className="space-y-2 text-xs text-[#756D82] font-medium">
                    <li className="flex items-center justify-between">
                      <span>Public Facilities:</span>
                      <span className="font-bold text-[#24202B]">{route.publicFacilitiesCount} nearby</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Main Road Coverage:</span>
                      <span className="font-bold text-[#24202B]">{route.mainRoadPercentage}%</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Lighting Quality:</span>
                      <span className="font-bold text-[#24202B]">{route.lightingRating}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Reported Incidents:</span>
                      <span
                        className={`font-bold ${
                          route.reportedIncidentsNearby === 'Low' ? 'text-[#2E9B67]' : 'text-[#D99A24]'
                        }`}
                      >
                        {route.reportedIncidentsNearby}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRouteForJourney(route, startCoords, destCoords);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'btn-primary-glow shadow-md'
                        : 'bg-[#F8F6FC] text-[#24202B] hover:bg-[#6C4AB6]/10 hover:text-[#6C4AB6]'
                    }`}
                  >
                    <span>Select Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON MATRIX BREAKDOWN */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-[#24202B]">Side-By-Side Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#756D82]">
            <thead className="bg-[#F8F6FC] border-b border-slate-200 text-[#756D82] uppercase font-extrabold text-[10px]">
              <tr>
                <th className="p-3">Route Name</th>
                <th className="p-3">Distance</th>
                <th className="p-3">ETA</th>
                <th className="p-3">Safety Score</th>
                <th className="p-3">Lighting</th>
                <th className="p-3">Facilities</th>
                <th className="p-3">Incidents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activeRoutes.map((r) => (
                <tr key={r.id} className={r.id === selectedRouteId ? 'bg-[#F8F6FC] font-bold text-[#24202B]' : ''}>
                  <td className="p-3 text-[#24202B]">{r.name}</td>
                  <td className="p-3">{r.distanceKm} km</td>
                  <td className="p-3">{r.durationMin} mins</td>
                  <td className="p-3 font-extrabold text-[#6C4AB6]">{r.safetyScore}/100</td>
                  <td className="p-3">{r.lightingRating}</td>
                  <td className="p-3">{r.publicFacilitiesCount} data points</td>
                  <td className="p-3">{r.reportedIncidentsNearby}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
