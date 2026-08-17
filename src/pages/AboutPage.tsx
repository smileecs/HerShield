import React from 'react';
import { Info, Shield, Lock, Lightbulb, Users, CheckCircle2, AlertTriangle, Building2, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* HEADER */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6C4AB6] flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">About HerShield</h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          HerShield is a modern safety-technology application engineered for women's safe urban mobility. It pairs facility-driven route safety scoring with active journey status sharing.
        </p>
      </section>

      {/* METHODOLOGY OF SAFETY INFORMATION SCORE */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#6C4AB6]">
          <Lightbulb className="w-4 h-4 text-[#6C4AB6]" />
          <span>Safety Information Methodology</span>
        </div>

        <h2 className="text-2xl font-black text-slate-900">How Safety Scores Are Calculated</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Safety Information Scores (ranging from 0 to 100) are computed using a multi-factor urban data algorithm:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Building2 className="w-4 h-4 text-[#6C4AB6]" />
              <span>Public Facilities Density (35%)</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Proximity to 24/7 pharmacies, police assistance booths, hospitals, transit interchanges, and active commercial storefronts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Street Illumination Rating (30%)</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Municipal street lighting coverage percentage and lumen brightness index along pedestrian corridors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Main-Road vs Alley Coverage (20%)</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              Percentage of the route following wide, visible main avenues compared to narrow unlit backstreets.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Users className="w-4 h-4 text-pink-600" />
              <span>Community Inputs & Incident Volume (15%)</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal">
              User community observations regarding lighting outages, isolated stretches, or recent safety reports.
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT RULES & ETHICAL SAFETY PHILOSOPHY */}
      <section className="bg-slate-900 text-white p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-400" />
          <span>Product Safety Rules & Ethical Commitments</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">No Guaranteed Predictions:</strong> We explicitly label scores as "Safety Information Scores" and never make false claims such as "100% safe routes".
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Active-Bound Location Privacy:</strong> Location tracking operates strictly during active journeys. We never track users continuously in the background.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">User-Consent Circle Sharing:</strong> Journeys are only shared with contacts explicitly chosen by the user for that specific trip.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
