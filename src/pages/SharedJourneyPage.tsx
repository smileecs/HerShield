import React, { useState, useEffect } from 'react';
import { Journey, Coordinate } from '../types';
import { apiGetSharedJourney, getSocket } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { ShieldCheck, Heart, MapPin, Clock, Users, ArrowLeft } from 'lucide-react';

interface SharedJourneyPageProps {
  shareToken: string;
  onGoHome: () => void;
}

export const SharedJourneyPage: React.FC<SharedJourneyPageProps> = ({ shareToken, onGoHome }) => {
  const [journey, setJourney] = useState<(Journey & { userName?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLoc, setCurrentLoc] = useState<Coordinate | undefined>(undefined);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const data = await apiGetSharedJourney(shareToken);
        if (isMounted) {
          setJourney(data);
          setCurrentLoc(data.currentLocation || { lat: data.startLocation.lat, lng: data.startLocation.lng });
          setProgress(data.progressPercent || 0);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Polling interval fallback for environments where WebSockets are unavailable (e.g. Vercel)
    const pollInterval = setInterval(() => {
      if (!isMounted) return;
      apiGetSharedJourney(shareToken)
        .then((data) => {
          if (!isMounted || !data) return;
          setJourney(data);
          if (data.currentLocation) {
            setCurrentLoc(data.currentLocation);
          }
          if (typeof data.progressPercent === 'number') {
            setProgress(data.progressPercent);
          }
        })
        .catch(() => {});
    }, 4000);

    // Subscribe to Socket.IO real-time stream
    try {
      const socket = getSocket();
      socket.emit('join_journey', shareToken);

      socket.on('location_updated', (data: { currentLocation: Coordinate; progressPercent: number }) => {
        if (data.currentLocation) {
          setCurrentLoc(data.currentLocation);
        }
        if (typeof data.progressPercent === 'number') {
          setProgress(data.progressPercent);
        }
      });

      socket.on('status_changed', (data: { status: 'active' | 'completed' | 'cancelled'; note?: string }) => {
        setJourney((prev) => (prev ? { ...prev, status: data.status as any, lastUpdateNote: data.note } : null));
      });
    } catch {
      // Sockets not available
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      try {
        const socket = getSocket();
        socket.off('location_updated');
        socket.off('status_changed');
      } catch {}
    };
  }, [shareToken]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#6C4AB6] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-600">Loading live journey share...</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Journey Link Expired or Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          This journey link may have been completed, cancelled, or is no longer available.
        </p>
        <button
          onClick={onGoHome}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#6C4AB6] text-white hover:bg-[#43266F]"
        >
          Go to HerShield
        </button>
      </div>
    );
  }

  const travelerName = journey.userName || 'Someone you trust';
  const isCompleted = journey.status === 'completed';

  const arrivalTimeFormatted = new Date(journey.expectedArrival).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C4AB6] font-black flex items-center justify-center text-sm">
            🛡️
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6C4AB6] block">
              Trusted Journey Sharing
            </span>
            <h1 className="text-lg font-black text-slate-900">
              {travelerName} is sharing their journey with you.
            </h1>
          </div>
        </div>

        <button
          onClick={onGoHome}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Completion Banner */}
      {isCompleted ? (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-3xl text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-3xl">
            💚
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black">Journey Completed</h2>
            <p className="text-sm text-emerald-100 max-w-md mx-auto">
              Your trusted contact, <span className="font-bold text-white">{travelerName}</span>, has marked the journey as complete and confirmed they are safe!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-950 font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span>🟢 Live Journey Active — Location updates streaming</span>
          </div>
          <span>Progress: {Math.round(progress)}%</span>
        </div>
      )}

      {/* MAP & METRICS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <LeafletMap
          routes={[journey.selectedRoute]}
          selectedRouteId={journey.selectedRoute.id}
          startLocation={journey.startLocation}
          destination={journey.destination}
          currentLocation={currentLoc}
          isJourneyActive={!isCompleted}
          className="h-[400px] w-full rounded-2xl"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-500 font-semibold block">Route</span>
            <span className="font-extrabold text-slate-900">{journey.selectedRoute.name}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-500 font-semibold block">Destination</span>
            <span className="font-extrabold text-slate-900">{journey.destination.address}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-500 font-semibold block">Estimated Arrival</span>
            <span className="font-extrabold text-violet-700">{arrivalTimeFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
