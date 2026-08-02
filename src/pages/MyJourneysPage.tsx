import React, { useState } from 'react';
import { Journey } from '../types';
import { History, MapPin, Calendar, CheckCircle2, XCircle, Trash2, Eye, ArrowRight } from 'lucide-react';
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
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6C4AB6]">
          <History className="w-4 h-4 text-[#6C4AB6]" />
          <span>Journey Logs & History</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#24202B]">My Journeys</h1>
        <p className="text-xs sm:text-sm text-[#756D82]">
          Review past travel history, route safety scores, and sharing log details.
        </p>
      </section>

      {/* ACTIVE JOURNEY BANNER */}
      {activeJourney && (
        <div className="bg-gradient-to-r from-[#6C4AB6] to-[#43266F] text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#2E9B67] animate-green-pulse"></span>
              <span>Active Journey Running</span>
            </div>
            <h3 className="text-lg font-extrabold">{activeJourney.destination.address}</h3>
            <p className="text-xs text-[#F8F6FC]/80">
              Selected Route: {activeJourney.selectedRoute.name} ({activeJourney.progressPercent || 0}% progress)
            </p>
          </div>

          <button
            onClick={onViewActiveJourney}
            className="px-5 py-3 rounded-2xl bg-white text-[#43266F] font-extrabold text-xs hover:bg-[#F8F6FC] transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <span>Open Active Dashboard</span>
            <ArrowRight className="w-4 h-4 text-[#6C4AB6]" />
          </button>
        </div>
      )}

      {/* JOURNEY HISTORY CARDS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#24202B]">Past Journey History ({journeys.length})</h2>

        {journeys.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-3">
            <History className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-[#24202B]">No Journey History Yet</h3>
            <p className="text-xs text-[#756D82] max-w-sm mx-auto">
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
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          isCompleted ? 'bg-[#EBF7F1] text-[#2E9B67]' : 'bg-[#FDF2F2] text-[#D9535B]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E9B67]" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#D9535B]" />
                            <span>Cancelled</span>
                          </>
                        )}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-[#756D82] font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{dateFormatted}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[#24202B] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#6C4AB6] shrink-0" />
                        <span>{j.startLocation.address} → {j.destination.address}</span>
                      </div>
                      <p className="text-xs text-[#756D82] pl-5">
                        Route: <span className="font-semibold text-[#24202B]">{j.selectedRoute.name}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F6FC] border border-slate-100 flex items-center justify-between text-xs text-[#756D82]">
                      <div>
                        <span className="text-slate-400 block">Est Duration</span>
                        <span className="font-bold text-[#24202B]">{j.selectedRoute.durationMin} mins</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Safety Score</span>
                        <span className="font-bold text-[#6C4AB6]">{j.selectedRoute.safetyScore}/100</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Notified</span>
                        <span className="font-bold text-[#24202B]">{j.trustedContacts.length} contacts</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => setSelectedJourney(j)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F8F6FC] text-[#6C4AB6] hover:bg-[#6C4AB6]/10 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Map & Details</span>
                    </button>

                    <button
                      onClick={() => handleDelete(j.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#D9535B] hover:bg-[#FDF2F2] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24202B]/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-[#6C4AB6] uppercase tracking-wider">Journey Log Detail</span>
                <h3 className="text-lg font-black text-[#24202B]">
                  {selectedJourney.startLocation.address} to {selectedJourney.destination.address}
                </h3>
              </div>
              <button
                onClick={() => setSelectedJourney(null)}
                className="px-3 py-1.5 rounded-xl bg-[#F8F6FC] text-[#24202B] font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <LeafletMap
              routes={[selectedJourney.selectedRoute]}
              selectedRouteId={selectedJourney.selectedRoute.id}
              startLocation={selectedJourney.startLocation}
              destination={selectedJourney.destination}
              className="h-[280px] w-full rounded-2xl overflow-hidden"
              interactive={false}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F8F6FC] rounded-xl">
                <span className="text-[#756D82] block">Status</span>
                <span className="font-extrabold text-[#2E9B67] capitalize">{selectedJourney.status}</span>
              </div>
              <div className="p-3 bg-[#F8F6FC] rounded-xl">
                <span className="text-[#756D82] block">Safety Score</span>
                <span className="font-extrabold text-[#6C4AB6]">{selectedJourney.selectedRoute.safetyScore}/100</span>
              </div>
              <div className="p-3 bg-[#F8F6FC] rounded-xl">
                <span className="text-[#756D82] block">Sharing Preference</span>
                <span className="font-extrabold text-[#24202B]">{selectedJourney.sharingPreference}</span>
              </div>
              <div className="p-3 bg-[#F8F6FC] rounded-xl">
                <span className="text-[#756D82] block">Distance</span>
                <span className="font-extrabold text-[#24202B]">{selectedJourney.selectedRoute.distanceKm} km</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F6FC] border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-[#24202B] block">Notified Trusted Contacts:</span>
              <div className="flex flex-wrap gap-2">
                {selectedJourney.trustedContacts.map((c, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-[#24202B]">
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
