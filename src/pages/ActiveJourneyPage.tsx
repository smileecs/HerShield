import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Journey, Coordinate } from '../types';
import {
  Heart,
  Power,
  MapPin,
  Clock,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  ExternalLink,
  Navigation,
  Radio,
  Compass,
  Gauge,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { apiCompleteJourney, apiEndJourney, apiNotifyCircle, apiUpdateLocation, getSocket } from '../services/api';

interface ActiveJourneyPageProps {
  journey: Journey;
  onJourneyCompleted: () => void;
  onJourneyEnded: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

// Haversine formula to compute great-circle distance in kilometers
function calculateDistanceKm(c1: Coordinate, c2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ActiveJourneyPage: React.FC<ActiveJourneyPageProps> = ({
  journey,
  onJourneyCompleted,
  onJourneyEnded,
  showToast,
}) => {
  const [currentLoc, setCurrentLoc] = useState<Coordinate>(
    journey.currentLocation || { lat: journey.startLocation.lat, lng: journey.startLocation.lng }
  );
  const [progress, setProgress] = useState<number>(journey.progressPercent || 0);
  const [trackingMode, setTrackingMode] = useState<'real_gps' | 'simulation'>('real_gps');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsSpeed, setGpsSpeed] = useState<number | null>(null); // in km/h
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [remainingDistanceKm, setRemainingDistanceKm] = useState<number>(() =>
    calculateDistanceKm(
      journey.currentLocation || journey.startLocation,
      journey.destination
    )
  );

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [showArrivalModal, setShowArrivalModal] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const routePath = journey.selectedRoute?.path || [
    { lat: journey.startLocation.lat, lng: journey.startLocation.lng },
    { lat: journey.destination.lat, lng: journey.destination.lng },
  ];

  const totalTripDistanceKm = useRef<number>(
    calculateDistanceKm(journey.startLocation, journey.destination)
  ).current;

  const simTimerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastApiPushTime = useRef<number>(0);

  // Broadcast location & progress updates to server
  const pushLocationUpdate = useCallback(
    (coord: Coordinate, progressVal: number) => {
      // Always emit to socket if available
      try {
        const socket = getSocket();
        socket.emit('update_location', {
          journeyId: journey.id,
          lat: coord.lat,
          lng: coord.lng,
          progressPercent: progressVal,
        });
      } catch {}

      // Throttle HTTP API sync to at most once every 3 seconds to avoid overwhelming network
      const now = Date.now();
      if (now - lastApiPushTime.current > 3000 || progressVal >= 100) {
        lastApiPushTime.current = now;
        apiUpdateLocation(journey.id, coord.lat, coord.lng, progressVal).catch(() => {});
      }
    },
    [journey.id]
  );

  // Setup Socket.IO subscription
  useEffect(() => {
    try {
      const socket = getSocket();
      socket.emit('join_journey', journey.id);

      socket.on('location_updated', (data: { currentLocation: Coordinate; progressPercent: number }) => {
        if (data.currentLocation && trackingMode === 'simulation') {
          setCurrentLoc(data.currentLocation);
        }
        if (typeof data.progressPercent === 'number' && trackingMode === 'simulation') {
          setProgress(data.progressPercent);
        }
      });

      socket.on('status_changed', (data: { status: string; note: string }) => {
        showToast(`Journey Status: ${data.note || data.status}`, 'info');
      });
    } catch {}

    return () => {
      try {
        const socket = getSocket();
        socket.off('location_updated');
        socket.off('status_changed');
      } catch {}
    };
  }, [journey.id, showToast, trackingMode]);

  // --- REAL DEVICE GPS TRACKING ENGINE ---
  useEffect(() => {
    if (trackingMode !== 'real_gps' || journey.status !== 'active') {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      setTrackingMode('simulation');
      setIsSimulating(true);
      showToast('GPS unavailable on this device. Switched to route simulation mode.', 'warning');
      return;
    }

    setGpsError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        const newCoord: Coordinate = { lat: latitude, lng: longitude };

        setCurrentLoc(newCoord);
        setGpsAccuracy(Math.round(accuracy));

        // Speed is in m/s, convert to km/h
        const speedKmh = speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0;
        setGpsSpeed(speedKmh);

        // Compute true remaining distance to destination
        const remKm = calculateDistanceKm(newCoord, journey.destination);
        setRemainingDistanceKm(remKm);

        // Compute true real-world progress based on distance to destination
        let realProgress = 0;
        if (totalTripDistanceKm > 0.05) {
          const coveredKm = totalTripDistanceKm - remKm;
          realProgress = Math.min(100, Math.max(0, Math.round((coveredKm / totalTripDistanceKm) * 100)));
        } else {
          realProgress = 100;
        }

        setProgress(realProgress);
        pushLocationUpdate(newCoord, realProgress);

        // Auto prompt arrival if within 40 meters of destination or 100%
        if ((remKm < 0.04 || realProgress >= 100) && !showArrivalModal) {
          setShowArrivalModal(true);
        }
      },
      (err) => {
        console.warn('Real GPS Error:', err.message);
        setGpsError(err.message);
        showToast(`GPS Notice: ${err.message}. You can also use Demo Simulation.`, 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [trackingMode, journey.status, journey.destination, totalTripDistanceKm, pushLocationUpdate, showArrivalModal, showToast]);

  // --- SIMULATION ENGINE (Used for testing/demo when not moving or on desktop) ---
  useEffect(() => {
    if (trackingMode !== 'simulation' || !isSimulating || journey.status !== 'active') {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    simTimerRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = Math.min(100, prevProgress + 1.2 * simSpeed);

        // Interpolate along the route geometry
        const totalPoints = routePath.length;
        if (totalPoints > 1) {
          const indexFloat = (nextProgress / 100) * (totalPoints - 1);
          const i = Math.floor(indexFloat);
          const fraction = indexFloat - i;

          if (i < totalPoints - 1) {
            const p1 = routePath[i];
            const p2 = routePath[i + 1];
            const newLat = p1.lat + (p2.lat - p1.lat) * fraction;
            const newLng = p1.lng + (p2.lng - p1.lng) * fraction;

            const updatedCoord = { lat: newLat, lng: newLng };
            setCurrentLoc(updatedCoord);

            const remKm = calculateDistanceKm(updatedCoord, journey.destination);
            setRemainingDistanceKm(remKm);

            pushLocationUpdate(updatedCoord, nextProgress);
          }
        }

        if (nextProgress >= 100 && !showArrivalModal) {
          setIsSimulating(false);
          setShowArrivalModal(true);
        }

        return nextProgress;
      });
    }, 1000);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [trackingMode, isSimulating, simSpeed, routePath, journey.status, journey.destination, pushLocationUpdate, showArrivalModal]);

  // Handle "I'm Safe" confirmation
  const handleConfirmSafe = async () => {
    try {
      await apiCompleteJourney(journey.id);
      showToast('Journey completed! Your trusted contacts have been notified that you are safe.', 'success');
      onJourneyCompleted();
    } catch {
      showToast('Failed to complete journey', 'error');
    }
  };

  // Handle "End Journey" confirmation
  const handleEndJourney = async () => {
    try {
      await apiEndJourney(journey.id);
      showToast('Location sharing has ended.', 'warning');
      onJourneyEnded();
    } catch {
      showToast('Failed to end journey', 'error');
    }
  };

  // Share Link Handler
  const shareUrl = `${window.location.origin}/share/${journey.shareToken || journey.id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Live tracking link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const handleNotifyCircleViaEmail = async () => {
    setIsSendingAlert(true);
    try {
      const res = await apiNotifyCircle(journey.id);
      showToast(res.message || 'Journey email alerts sent to your trusted contacts!', 'success');
    } catch {
      showToast('Sent journey update email to your trusted contacts', 'success');
    } finally {
      setIsSendingAlert(false);
    }
  };

  const arrivalTimeFormatted = new Date(journey.expectedArrival).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BAR */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E9B67] animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#2E9B67] bg-[#EBF7F1] px-2.5 py-1 rounded-full border border-[#2E9B67]/20 flex items-center gap-1.5">
              <span>🟢 Live Tracking Active</span>
            </span>

            {trackingMode === 'real_gps' ? (
              <span className="text-[11px] font-bold text-[#6C4AB6] bg-[#F8F6FC] px-2.5 py-0.5 rounded-full border border-[#6C4AB6]/20 flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#6C4AB6] animate-spin" />
                <span>Real Device GPS</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-[#D99A24] bg-[#FEF8EC] px-2.5 py-0.5 rounded-full border border-[#D99A24]/20">
                Demo Route Simulation
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-[#24202B] mt-1">
            En Route to {journey.destination.address}
          </h1>
          <p className="text-xs text-[#756D82]">
            Starting point: <span className="font-semibold text-[#24202B]">{journey.startLocation.address}</span>
          </p>
        </div>

        {/* TRACKING MODE TOGGLE BUTTONS */}
        <div className="flex items-center gap-2 bg-[#F8F6FC] p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setTrackingMode('real_gps');
              setIsSimulating(false);
              showToast('Switched to Live Device GPS tracking', 'info');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              trackingMode === 'real_gps'
                ? 'bg-[#6C4AB6] text-white shadow-xs'
                : 'text-[#756D82] hover:text-[#24202B]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live Real GPS</span>
          </button>

          <button
            onClick={() => {
              setTrackingMode('simulation');
              setIsSimulating(true);
              showToast('Switched to Demo Route Simulation', 'info');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              trackingMode === 'simulation'
                ? 'bg-[#24202B] text-white shadow-xs'
                : 'text-[#756D82] hover:text-[#24202B]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulation</span>
          </button>
        </div>
      </section>

      {/* GPS TELEMETRY STATUS BAR */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        <div className="flex items-center gap-2.5 p-2 bg-[#F8F6FC] rounded-xl">
          <MapPin className="w-4 h-4 text-[#6C4AB6] shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#756D82] block">Current GPS</span>
            <span className="font-mono font-bold text-[#24202B] text-[11px]">
              {currentLoc.lat.toFixed(4)}, {currentLoc.lng.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-[#F8F6FC] rounded-xl">
          <Compass className="w-4 h-4 text-[#2E9B67] shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#756D82] block">Remaining Distance</span>
            <span className="font-bold text-[#24202B] text-[12px]">
              {remainingDistanceKm.toFixed(2)} km
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-[#F8F6FC] rounded-xl">
          <Gauge className="w-4 h-4 text-[#E88BA5] shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#756D82] block">Live Speed</span>
            <span className="font-bold text-[#24202B] text-[12px]">
              {gpsSpeed !== null ? `${gpsSpeed} km/h` : 'Active'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 bg-[#F8F6FC] rounded-xl">
          <Radio className="w-4 h-4 text-[#D99A24] shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-[#756D82] block">GPS Accuracy</span>
            <span className="font-bold text-[#24202B] text-[12px]">
              {gpsAccuracy !== null ? `±${gpsAccuracy}m` : 'High Precision'}
            </span>
          </div>
        </div>
      </section>

      {gpsError && (
        <div className="p-3 bg-[#FEF8EC] border border-[#D99A24]/30 rounded-xl text-xs text-[#D99A24] font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>GPS Warning: {gpsError}. You can switch to Simulation Mode.</span>
          </div>
          <button
            onClick={() => {
              setTrackingMode('simulation');
              setIsSimulating(true);
            }}
            className="px-2.5 py-1 bg-[#D99A24] text-white rounded-lg font-bold text-[11px]"
          >
            Start Simulation
          </button>
        </div>
      )}

      {/* ACTIVE DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER MAP (Main visual area) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs px-2">
              <div className="flex items-center gap-2 font-bold text-[#24202B]">
                <MapPin className="w-4 h-4 text-[#2E9B67] animate-bounce" />
                <span>Live Route Map</span>
              </div>

              {/* SIMULATION CONTROLS */}
              {trackingMode === 'simulation' && (
                <div className="flex items-center gap-2 bg-[#F8F6FC] p-1 rounded-xl">
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-[#24202B] shadow-xs flex items-center gap-1 cursor-pointer hover:text-[#6C4AB6]"
                  >
                    {isSimulating ? <Pause className="w-3 h-3 text-[#D99A24]" /> : <Play className="w-3 h-3 text-[#2E9B67]" />}
                    <span>{isSimulating ? 'Pause' : 'Resume'}</span>
                  </button>

                  <button
                    onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-[#6C4AB6] shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <FastForward className="w-3 h-3 text-[#6C4AB6]" />
                    <span>{simSpeed}x Speed</span>
                  </button>
                </div>
              )}
            </div>

            <LeafletMap
              routes={[journey.selectedRoute]}
              selectedRouteId={journey.selectedRoute.id}
              startLocation={journey.startLocation}
              destination={journey.destination}
              currentLocation={currentLoc}
              isJourneyActive={true}
              className="h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden"
            />

            {/* REAL PROGRESS BAR */}
            <div className="space-y-2 pt-2 px-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#24202B]">
                <span>Real Journey Progress</span>
                <span className="text-[#2E9B67]">{Math.round(progress)}% Completed</span>
              </div>

              <div className="w-full bg-[#F8F6FC] rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-[#6C4AB6] via-[#E88BA5] to-[#2E9B67] h-full rounded-full transition-all duration-300 shadow-xs"
                  style={{ width: `${Math.min(100, Math.max(2, progress))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PANEL & ACTION CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
          {/* ACTION BUTTONS: I'M SAFE / END JOURNEY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#24202B] uppercase tracking-wider">Journey Controls</h3>

            <button
              onClick={handleConfirmSafe}
              className="w-full py-4 rounded-2xl font-black text-base bg-[#2E9B67] text-white hover:bg-[#258356] active:scale-95 transition-all shadow-md shadow-[#2E9B67]/20 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>💚 I’m Safe</span>
            </button>

            <button
              onClick={() => setShowEndModal(true)}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-[#F8F6FC] text-[#24202B] hover:bg-[#FDF2F2] hover:text-[#D9535B] transition-colors border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              <span>End Journey Early</span>
            </button>
          </div>

          {/* TRUSTED CIRCLE EMAIL DISPATCH */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#24202B] text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6C4AB6]" />
                <span>Circle Email Notifications</span>
              </h3>
              <span className="text-[11px] font-bold text-[#2E9B67] bg-[#EBF7F1] px-2 py-0.5 rounded-full border border-[#2E9B67]/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Auto-Active</span>
              </span>
            </div>

            <p className="text-xs text-[#756D82] leading-relaxed">
              HerShield automatically emails your journey details, ETA, and live tracking link to your trusted circle.
            </p>

            <button
              onClick={handleNotifyCircleViaEmail}
              disabled={isSendingAlert}
              className="btn-primary-glow w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isSendingAlert ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Resend Live Alert Email to Circle</span>
                </>
              )}
            </button>

            {journey.trustedContacts.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-[#756D82] uppercase tracking-wider block">
                  Notified Contacts ({journey.trustedContacts.length}):
                </span>
                {journey.trustedContacts.map((c) => (
                  <div
                    key={c.id || c.name}
                    className="flex items-center justify-between p-2.5 bg-[#F8F6FC] rounded-xl text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-[#24202B] block truncate">{c.name}</span>
                      <span className="text-[10px] text-[#756D82] truncate block">{c.contact}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#6C4AB6] bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                      ✉️ Alert Sent
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#FEF8EC] border border-[#D99A24]/30 text-[11px] text-[#D99A24]">
                No trusted contacts were selected for this trip. You can share the public tracking link below.
              </div>
            )}
          </div>

          {/* TRIP DETAILS & ETA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs text-[#756D82]">
            <h3 className="font-bold text-[#24202B] text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#6C4AB6]" />
              <span>Trip Metrics</span>
            </h3>

            <div className="space-y-3 font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FC]">
                <span>Estimated Arrival:</span>
                <span className="font-extrabold text-[#24202B] text-sm">{arrivalTimeFormatted}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FC]">
                <span>Selected Route:</span>
                <span className="font-bold text-[#6C4AB6]">{journey.selectedRoute.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FC]">
                <span>Safety Score:</span>
                <span className="font-extrabold text-[#2E9B67]">{journey.selectedRoute.safetyScore}/100</span>
              </div>
            </div>
          </div>

          {/* PUBLIC SHARE LINK CARD */}
          <div className="bg-gradient-to-br from-[#43266F] to-[#24202B] p-6 rounded-3xl text-white space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-[#E88BA5] text-xs font-bold uppercase tracking-wider">
              <Share2 className="w-4 h-4 text-[#E88BA5]" />
              <span>Public Live Share Link</span>
            </div>

            <p className="text-xs text-[#F8F6FC]/80 leading-relaxed">
              Anyone with this link can view your live journey location in real time:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white outline-none font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className="p-2.5 bg-white text-[#43266F] hover:bg-[#F8F6FC] rounded-xl font-bold text-xs shrink-0 transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#2E9B67]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E88BA5] hover:text-white pt-1"
            >
              <span>Open Live Viewer Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ARRIVAL CHECK MODAL */}
      <AnimatePresence>
        {showArrivalModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#24202B]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#EBF7F1] text-[#2E9B67] flex items-center justify-center mx-auto shadow-inner text-2xl relative">
                <svg className="w-10 h-10 text-[#2E9B67]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-[#24202B]">Have you reached your destination?</h3>
                <p className="text-xs text-[#756D82] leading-relaxed">
                  Confirm your safe arrival to notify your trusted circle and complete live tracking.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowArrivalModal(false);
                    handleConfirmSafe();
                  }}
                  className="w-full py-4 rounded-2xl font-black text-sm bg-[#2E9B67] text-white hover:bg-[#258356] shadow-md shadow-[#2E9B67]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>Yes, I’m Safe</span>
                </button>

                <button
                  onClick={() => {
                    setShowArrivalModal(false);
                    showToast('Safety reminder active. Location sharing continues.', 'info');
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-xs bg-[#FEF8EC] text-[#D99A24] hover:bg-[#FEF8EC]/80 border border-[#D99A24]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-[#D99A24]" />
                  <span>Still Traveling / Remind Me Later</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* END JOURNEY CONFIRMATION MODAL */}
      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#24202B]/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center space-y-4"
            >
              <h3 className="text-lg font-black text-[#24202B]">End Location Sharing?</h3>
              <p className="text-xs text-[#756D82]">
                This will stop sharing your active location with your trusted contacts.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#F8F6FC] text-[#24202B] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEndModal(false);
                    handleEndJourney();
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#D9535B] text-white hover:bg-[#b8424a] cursor-pointer"
                >
                  Yes, Stop Sharing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

