import React from 'react';
import { Navigation, Users, MapPin, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { SAMPLE_ROUTES, SAMPLE_LOCATIONS } from '../data/mockData';

interface HomePageProps {
  onStartRoute: () => void;
  onGoToCircle: () => void;
  onHowItWorks: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartRoute, onGoToCircle, onHowItWorks }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-12 rounded-3xl bg-gradient-to-b from-teal-100/60 via-emerald-50/30 to-slate-50 border border-teal-100/80 p-6 md:p-12 shadow-xs">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/90 text-teal-900 text-xs font-extrabold tracking-wide border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Modern Safety Technology Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Travel Smarter. <br />
              <span className="bg-gradient-to-r from-teal-800 via-emerald-700 to-rose-600 bg-clip-text text-transparent">
                Stay Connected.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Plan your journey with safety-related route information and stay connected with the people you trust.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartRoute}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm bg-teal-700 text-white hover:bg-teal-800 active:scale-98 transition-all shadow-lg shadow-teal-700/25 group"
              >
                <Navigation className="w-4 h-4" />
                <span>Plan a SafeRoute</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onHowItWorks}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all shadow-xs"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Micro reassurance badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Facility-Based Route Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-teal-700" />
                <span>User-Controlled Location Sharing</span>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Preview Map */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-white p-3 rounded-3xl shadow-xl border border-slate-200/80">
              <div className="flex items-center justify-between pb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">Route Safety Visualizer</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  Demo Route
                </span>
              </div>

              <LeafletMap
                routes={SAMPLE_ROUTES}
                selectedRouteId="route_a"
                startLocation={SAMPLE_LOCATIONS.start}
                destination={SAMPLE_LOCATIONS.destination}
                className="h-[320px] w-full rounded-2xl"
                interactive={false}
              />

              {/* Map Badge Overlay */}
              <div className="mt-3 bg-teal-50/90 border border-teal-100 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-teal-900 block">Recommended Corridor</span>
                  <span className="text-[11px] text-slate-600">86/100 Safety Information Score</span>
                </div>
                <button
                  onClick={onStartRoute}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-bold text-[11px] hover:bg-teal-800 transition-colors"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed For Everyday Peace Of Mind
          </h2>
          <p className="text-sm text-slate-600">
            A comprehensive safety platform combining route intelligence with real-time trusted contact awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl group-hover:bg-teal-700 group-hover:text-white transition-colors">
              🗺️
            </div>
            <h3 className="text-lg font-bold text-slate-900">Compare Routes</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Compare available routes using distance, estimated travel time, lighting coverage, open facilities, and available safety information.
            </p>
            <button
              onClick={onStartRoute}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-700 hover:text-teal-900 pt-2"
            >
              <span>Explore Route Comparison</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-2xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              👥
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trusted Circle</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose trusted contacts who can follow your active journey and receive instant status updates from start to arrival.
            </p>
            <button
              onClick={onGoToCircle}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-700 hover:text-rose-900 pt-2"
            >
              <span>Manage Trusted Contacts</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              📍
            </div>
            <h3 className="text-lg font-bold text-slate-900">Journey Sharing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Share your journey status or live location exclusively for the duration of your trip with encrypted web links.
            </p>
            <button
              onClick={onStartRoute}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 hover:text-emerald-900 pt-2"
            >
              <span>Start Active Journey</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold tracking-wider uppercase text-teal-400">Step-By-Step Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-black">How SafeRoute Circle Works</h2>
          <p className="text-sm text-slate-400">
            Simple 6-step journey cycle designed for personal safety & contact assurance.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { step: '01', title: 'Enter Destination', desc: 'Input destination or choose saved spot' },
            { step: '02', title: 'Compare Routes', desc: 'Inspect lighting, ETA & safety score' },
            { step: '03', title: 'Choose Preferred Route', desc: 'Select best corridor for your walk or ride' },
            { step: '04', title: 'Select Trusted Contacts', desc: 'Pick who gets your active trip status' },
            { step: '05', title: 'Start Journey', desc: 'Begin live tracking session' },
            { step: '06', title: 'Confirm Arrival', desc: 'Click "I\'m Safe" to complete trip' },
          ].map((item) => (
            <div key={item.step} className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-black text-teal-400 tracking-wider block">{item.step}</span>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 rounded-3xl p-8 md:p-12 text-white text-center space-y-6 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to plan your next journey?
          </h2>
          <p className="text-sm text-teal-100 leading-relaxed">
            Experience safer mobility decisions with real-time trusted circle connectivity.
          </p>
        </div>

        <button
          onClick={onStartRoute}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-white text-teal-900 hover:bg-teal-50 active:scale-95 transition-all shadow-lg"
        >
          <Navigation className="w-5 h-5 text-teal-700" />
          <span>Start SafeRoute</span>
        </button>
      </section>
    </div>
  );
};
