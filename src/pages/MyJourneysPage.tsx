import React, { useState } from 'react';
import { Journey } from '../types';
import { History, MapPin, Calendar, Clock, CheckCircle2, XCircle, Trash2, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiDeleteJourneyHistory } from '../services/api';
import { LeafletMap } from '../components/LeafletMap';

interface MyJourneysPageProps {
  journeys: Journey[];
  activeJourney: Journey | null;
  onViewActiveJourney: () => void;
  onJourneysUpdated: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
}

export const MyJourneysPage: React.FC<MyJourneysPageProps> = ({
  journeys,
  activeJourney,
  onViewActiveJourney,
  onJourneysUpdated,
  showToast,
}) => {
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this journey record from your history?')) {
      await apiDeleteJourneyHistory(id);
      showToast('Journey record removed from history', 'info');
      onJourneysUpdated();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-800">
          <History className="w-4 h-4 text-teal-700" />
          <span>Journey Logs & History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">My Journeys</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Review past travel history, route safety scores, and sharing log details.
        </p>
      </section>

      {/* ACTIVE JOURNEY BANNER */}
      {activeJourney && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
              <span>Active Journey Running</span>
            </div>
            <h3 className="text-lg font-extrabold">{activeJourney.destination.address}</h3>
            <p className="text-xs text-emerald-100">
              Selected Route: {activeJourney.selectedRoute.name} ({activeJourney.progressPercent || 0}% progress)
            </p>
          </div>

          <button
            onClick={onViewActiveJourney}
            className="px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Open Active Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* JOURNEY HISTORY CARDS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Past Journey History ({journeys.length})</h2>

        {journeys.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
            <History className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800">No Journey History Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your completed and saved trips will appear here with route details and safety records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {journeys.map((j) => {
              const isCompleted = j.status === 'completed';
              const dateFormatted = new Date(j.startTime).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={j.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cancelled</span>
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                        <span>{j.startLocation.address} → {j.destination.address}</span>
                      </div>
                      <p className="text-xs text-slate-500 pl-5">
                        Route: <span className="font-semibold text-slate-700">{j.selectedRoute.name}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block">Est Duration</span>
                        <span className="font-bold text-slate-800">{j.selectedRoute.durationMin} mins</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Safety Score</span>
                        <span className="font-bold text-teal-800">{j.selectedRoute.safetyScore}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Notified</span>
                        <span className="font-bold text-slate-800">{j.trustedContacts.length} contacts</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => setSelectedJourney(j)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Map & Details</span>
                    </button>

                    <button
                      onClick={() => handleDelete(j.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Journey Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* JOURNEY DETAIL MODAL */}
      {selectedJourney && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Journey Log Detail</span>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedJourney.startLocation.address} to {selectedJourney.destination.address}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJourney(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <LeafletMap
              routes={[selectedJourney.selectedRoute]}
              selectedRouteId={selectedJourney.selectedRoute.id}
              startLocation={selectedJourney.startLocation}
              destination={selectedJourney.destination}
              className="h-[280px] w-full rounded-2xl"
              interactive={false}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Status</span>
                <span className="font-extrabold text-emerald-700 capitalize">{selectedJourney.status}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Safety Score</span>
                <span className="font-extrabold text-violet-700">{selectedJourney.selectedRoute.safetyScore}/100</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Sharing Preference</span>
                <span className="font-extrabold text-slate-800">{selectedJourney.sharingPreference}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Distance</span>
                <span className="font-extrabold text-slate-800">{selectedJourney.selectedRoute.distanceKm} km</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Notified Trusted Contacts:</span>
              <div className="flex flex-wrap gap-2">
                {selectedJourney.trustedContacts.map((c, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700">
                    👩 {c.name} ({c.relationship})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
