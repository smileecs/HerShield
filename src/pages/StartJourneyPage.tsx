import React, { useState } from 'react';
import { RouteOption, TrustedContact, Journey } from '../types';
import { Navigation, MapPin, Users, ShieldCheck, CheckSquare, Square, Radio, ArrowRight } from 'lucide-react';
import { apiCreateJourney } from '../services/api';

interface StartJourneyPageProps {
  selectedRoute: RouteOption;
  startLocation: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  trustedContacts: TrustedContact[];
  onJourneyStarted: (journey: Journey) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const StartJourneyPage: React.FC<StartJourneyPageProps> = ({
  selectedRoute,
  startLocation,
  destination,
  trustedContacts,
  onJourneyStarted,
  showToast,
}) => {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    trustedContacts.slice(0, 2).map((c) => c.id)
  );
  const [sharingPreference, setSharingPreference] = useState<'Live Location' | 'Status Only'>('Live Location');
  const [isStarting, setIsStarting] = useState(false);

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartJourney = async () => {
    if (selectedContactIds.length === 0) {
      if (!confirm('Start journey without notifying any trusted contacts?')) {
        return;
      }
    }

    setIsStarting(true);
    showToast('Initializing secure live tracking session...', 'info');

    try {
      const activeContacts = trustedContacts.filter((c) => selectedContactIds.includes(c.id));
      const journey = await apiCreateJourney({
        startLocation,
        destination,
        selectedRoute,
        trustedContacts: activeContacts,
        sharingPreference,
      });

      showToast('Journey started successfully! Location sharing is live.', 'success');
      onJourneyStarted(journey);
    } catch (err) {
      showToast('Failed to start journey. Please try again.', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <span>Trip Confirmation & Circle Notification</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Start Your Journey</h1>

        {/* TRIP SUMMARY CARD */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 text-sm text-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">From</span>
              <span className="font-semibold text-slate-900">{startLocation.address}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">To</span>
              <span className="font-semibold text-slate-900">{destination.address}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Selected Route: </span>
              <span className="font-bold text-teal-800">{selectedRoute.name}</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <span>📏 {selectedRoute.distanceKm} km</span>
              <span>⏱️ ~{selectedRoute.durationMin} minutes</span>
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                Score {selectedRoute.safetyScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* CHOOSE TRUSTED CONTACTS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              <span>Choose Trusted Contacts to Notify</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {selectedContactIds.length} of {trustedContacts.length} selected
            </span>
          </div>

          {trustedContacts.length === 0 ? (
            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
              No contacts in your Trusted Circle yet. You can still proceed or add contacts in the Trusted Circle tab.
            </p>
          ) : (
            <div className="space-y-2">
              {trustedContacts.map((c) => {
                const isChecked = selectedContactIds.includes(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleContact(c.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-rose-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <span className="text-sm font-bold block">{c.name}</span>
                        <span className="text-[11px] text-slate-500">{c.relationship} • {c.contact}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200">
                      {c.verificationStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SHARING OPTIONS */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-slate-900 text-sm">Location Sharing Mode</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              onClick={() => setSharingPreference('Live Location')}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                sharingPreference === 'Live Location'
                  ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Radio className={`w-5 h-5 shrink-0 mt-0.5 ${sharingPreference === 'Live Location' ? 'text-teal-700' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs text-slate-900 block">Share Live Location</span>
                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                  Trusted contacts see your animated position on the route map in real time.
                </span>
              </div>
            </label>

            <label
              onClick={() => setSharingPreference('Status Only')}
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                sharingPreference === 'Status Only'
                  ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Radio className={`w-5 h-5 shrink-0 mt-0.5 ${sharingPreference === 'Status Only' ? 'text-teal-700' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-xs text-slate-900 block">Share Journey Status Only</span>
                <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                  Trusted contacts receive notifications when you start, arrive, or end trip without continuous map position.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* START BUTTON */}
        <div className="pt-4">
          <button
            onClick={handleStartJourney}
            disabled={isStarting}
            className="w-full py-4 rounded-2xl font-black text-base bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Start Journey Now</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
