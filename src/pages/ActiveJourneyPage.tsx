import React, { useState, useEffect, useRef } from 'react';
import { Journey, Coordinate } from '../types';
import { ShieldCheck, Heart, Power, MapPin, Clock, Share2, Copy, Check, Play, Pause, FastForward, AlertTriangle, ExternalLink } from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { apiCompleteJourney, apiEndJourney, apiUpdateLocation, getSocket } from '../services/api';

interface ActiveJourneyPageProps {
  journey: Journey;
  onJourneyCompleted: () => void;
  onJourneyEnded: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
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
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [showArrivalModal, setShowArrivalModal] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const routePath = journey.selectedRoute?.path || [
    { lat: journey.startLocation.lat, lng: journey.startLocation.lng },
    { lat: journey.destination.lat, lng: journey.destination.lng },
  ];

  const timerRef = useRef<any>(null);

  // Setup Socket.IO subscription
  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_journey', journey.id);

    socket.on('location_updated', (data: { currentLocation: Coordinate; progressPercent: number }) => {
      if (data.currentLocation) {
        setCurrentLoc(data.currentLocation);
      }
      if (typeof data.progressPercent === 'number') {
        setProgress(data.progressPercent);
      }
    });

    socket.on('status_changed', (data: { status: string; note: string }) => {
      showToast(`Journey Status Update: ${data.note || data.status}`, 'info');
    });

    return () => {
      socket.off('location_updated');
      socket.off('status_changed');
    };
  }, [journey.id, showToast]);

  // Simulation movement engine along route path coordinates
  useEffect(() => {
    if (!isSimulating || journey.status !== 'active') return;

    timerRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = Math.min(100, prevProgress + 1.5 * simSpeed);

        // Interpolate lat/lng along path
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

            // Emit live location update to backend socket
            const socket = getSocket();
            socket.emit('update_location', {
              journeyId: journey.id,
              lat: newLat,
              lng: newLng,
              progressPercent: nextProgress,
            });

            // Also call API endpoint periodically
            apiUpdateLocation(journey.id, newLat, newLng, nextProgress).catch(() => {});
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, simSpeed, routePath, journey.status, journey.id, showArrivalModal]);

  // Handle "I'm Safe" confirmation
  const handleConfirmSafe = async () => {
    try {
      await apiCompleteJourney(journey.id);
      showToast('Journey completed. Your trusted contacts have been notified!', 'success');
      onJourneyCompleted();
    } catch (err) {
      showToast('Failed to complete journey', 'error');
    }
  };

  // Handle "End Journey" confirmation
  const handleEndJourney = async () => {
    try {
      await apiEndJourney(journey.id);
      showToast('Location sharing has ended.', 'warning');
      onJourneyEnded();
    } catch (err) {
      showToast('Failed to end journey', 'error');
    }
  };

  // Share Link Handler
  const shareUrl = `${window.location.origin}/share/${journey.shareToken || journey.id}`;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    showToast('Journey share link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Expected arrival format
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
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Journey Active 🟢
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            En Route to {journey.destination.address}
          </h1>
          <p className="text-xs text-slate-500">
            From: <span className="font-semibold text-slate-700">{journey.startLocation.address}</span>
          </p>
        </div>

        {/* SHARED WITH BADGES */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-500">Shared with:</span>
          {journey.trustedContacts.length === 0 ? (
            <span className="text-slate-400 italic">No contacts selected</span>
          ) : (
            journey.trustedContacts.map((tc) => (
              <span
                key={tc.id || tc.name}
                className="px-3 py-1 rounded-full bg-rose-50 text-rose-800 font-extrabold border border-rose-200 flex items-center gap-1.5"
              >
                <span>👩</span>
                <span>{tc.name}</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* ACTIVE DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CENTER MAP (Main visual area) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs px-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>Live Location Map</span>
              </div>

              {/* SIMULATION CONTROLS FOR DEMO */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-800 shadow-xs flex items-center gap-1"
                >
                  {isSimulating ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3 text-emerald-600" />}
                  <span>{isSimulating ? 'Pause GPS' : 'Resume GPS'}</span>
                </button>

                <button
                  onClick={() => setSimSpeed(simSpeed === 1 ? 2 : simSpeed === 2 ? 5 : 1)}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white text-teal-800 shadow-xs flex items-center gap-1"
                >
                  <FastForward className="w-3 h-3 text-teal-700" />
                  <span>{simSpeed}x Speed</span>
                </button>
              </div>
            </div>

            <LeafletMap
              routes={[journey.selectedRoute]}
              selectedRouteId={journey.selectedRoute.id}
              startLocation={journey.startLocation}
              destination={journey.destination}
              currentLocation={currentLoc}
              isJourneyActive={true}
              className="h-[420px] sm:h-[480px] w-full rounded-2xl"
            />

            {/* PROGRESS BAR */}
            <div className="space-y-2 pt-2 px-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Journey Progress</span>
                <span className="text-emerald-700">{Math.round(progress)}% Completed</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-gradient-to-r from-teal-700 via-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-xs"
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Journey Controls</h3>

            <button
              onClick={handleConfirmSafe}
              className="w-full py-4 rounded-2xl font-black text-base bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>💚 I’m Safe</span>
            </button>

            <button
              onClick={() => setShowEndModal(true)}
              className="w-full py-3 rounded-2xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border border-slate-200 flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" />
              <span>End Journey Early</span>
            </button>

            <button
              onClick={() => setShowArrivalModal(true)}
              className="w-full py-2 rounded-xl text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors"
            >
              Simulate Arrival Check Prompt
            </button>
          </div>

          {/* TRIP DETAILS & ETA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>Trip Metrics</span>
            </h3>

            <div className="space-y-3 font-medium">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Estimated Arrival:</span>
                <span className="font-extrabold text-slate-900 text-sm">{arrivalTimeFormatted}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Selected Route:</span>
                <span className="font-bold text-teal-800">{journey.selectedRoute.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Safety Info Score:</span>
                <span className="font-extrabold text-emerald-700">{journey.selectedRoute.safetyScore}/100</span>
              </div>
            </div>
          </div>

          {/* PUBLIC SHARE LINK CARD */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-md">
            <div className="flex items-center gap-2 text-teal-200 text-xs font-bold uppercase tracking-wider">
              <Share2 className="w-4 h-4 text-teal-300" />
              <span>Trusted Contact Link</span>
            </div>

            <p className="text-xs text-teal-100 leading-relaxed">
              Anyone with this secure link can follow your live journey status without registering.
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
                className="p-2.5 bg-white text-teal-900 hover:bg-teal-50 rounded-xl font-bold text-xs shrink-0 transition-colors"
                title="Copy Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white pt-1"
            >
              <span>Preview Trusted Contact View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ARRIVAL CHECK MODAL */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner text-2xl">
              🏁
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">Have you reached your destination?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Confirm your safe arrival to notify your trusted circle and complete location sharing.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowArrivalModal(false);
                  handleConfirmSafe();
                }}
                className="w-full py-4 rounded-2xl font-black text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-white" />
                <span>Yes, I’m Safe</span>
              </button>

              <button
                onClick={() => {
                  setShowArrivalModal(false);
                  showToast('Sending journey alert reminder to trusted contacts...', 'warning');
                }}
                className="w-full py-3 rounded-2xl font-bold text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>I Need Help / Remind Me</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END JOURNEY CONFIRMATION MODAL */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <h3 className="text-lg font-black text-slate-900">End Location Sharing?</h3>
            <p className="text-xs text-slate-600">
              This will stop sharing your active location with your trusted contacts.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndModal(false);
                  handleEndJourney();
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Yes, Stop Sharing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
