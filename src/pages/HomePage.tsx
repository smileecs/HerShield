import React from 'react';
import { motion } from 'motion/react';
import { Navigation, ShieldCheck, ArrowRight, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
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
      <section className="relative overflow-hidden pt-8 md:pt-14 pb-12 rounded-3xl bg-gradient-to-br from-[#F8F6FC] via-[#F3EDFB] to-[#FCEEF2] border border-[#6C4AB6]/10 p-6 md:p-12 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column Text with Staggered Animations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 text-[#6C4AB6] text-xs font-extrabold tracking-wide border border-[#6C4AB6]/20 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#6C4AB6]" />
              <span>Modern Women Safety Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#24202B] tracking-tight leading-[1.12]"
            >
              Travel Smarter. <br />
              <span className="bg-gradient-to-r from-[#6C4AB6] via-[#43266F] to-[#E88BA5] bg-clip-text text-transparent">
                Stay Connected.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-base sm:text-lg text-[#756D82] leading-relaxed max-w-xl font-normal"
            >
              Plan your journey with safety-related route information and stay seamlessly connected with the people you trust.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
            >
              <button
                onClick={onStartRoute}
                className="btn-primary-glow flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-extrabold text-sm active:scale-95 transition-all shadow-md group cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>Plan a SafeRoute</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onHowItWorks}
                className="btn-secondary-lift flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                <span>How It Works</span>
              </button>
            </motion.div>

            {/* Micro reassurance badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#756D82]"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2E9B67]" />
                <span>Facility-Based Route Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#6C4AB6]" />
                <span>User-Controlled Location Sharing</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column Interactive Map with Scale/Fade */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative bg-white p-3.5 rounded-3xl shadow-xl border border-[#6C4AB6]/15 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between pb-2.5 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2E9B67] animate-green-pulse"></span>
                  <span className="text-xs font-bold text-[#24202B]">Route Safety Visualizer</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8F6FC] text-[#6C4AB6] border border-[#6C4AB6]/20">
                  Demo Route
                </span>
              </div>

              <LeafletMap
                routes={SAMPLE_ROUTES}
                selectedRouteId="route_a"
                startLocation={SAMPLE_LOCATIONS.start}
                destination={SAMPLE_LOCATIONS.destination}
                className="h-[320px] w-full rounded-2xl overflow-hidden"
                interactive={false}
              />

              {/* Map Badge Overlay */}
              <div className="mt-3 bg-[#F8F6FC] border border-[#6C4AB6]/15 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#24202B] block">Recommended Corridor</span>
                  <span className="text-[11px] text-[#756D82]">86/100 Safety Information Score</span>
                </div>
                <button
                  onClick={onStartRoute}
                  className="px-3.5 py-1.5 rounded-xl bg-[#6C4AB6] text-white font-bold text-[11px] hover:bg-[#43266F] transition-all cursor-pointer shadow-xs"
                >
                  Inspect
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE CARDS SECTION */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#24202B] tracking-tight">
            Designed For Everyday Peace Of Mind
          </h2>
          <p className="text-sm text-[#756D82]">
            A comprehensive safety platform combining route intelligence with real-time trusted circle awareness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#F8F6FC] text-[#6C4AB6] border border-[#6C4AB6]/15 flex items-center justify-center text-2xl group-hover:bg-[#6C4AB6] group-hover:text-white transition-all duration-300">
              🗺️
            </div>
            <h3 className="text-lg font-bold text-[#24202B]">Compare Routes</h3>
            <p className="text-sm text-[#756D82] leading-relaxed">
              Compare available routes using distance, estimated travel time, lighting coverage, open facilities, and available safety information.
            </p>
            <button
              onClick={onStartRoute}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#6C4AB6] hover:text-[#43266F] pt-2 transition-colors cursor-pointer"
            >
              <span>Explore Route Comparison</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FCEEF2] text-[#E88BA5] border border-[#E88BA5]/20 flex items-center justify-center text-2xl group-hover:bg-[#E88BA5] group-hover:text-white transition-all duration-300">
              👥
            </div>
            <h3 className="text-lg font-bold text-[#24202B]">Trusted Circle</h3>
            <p className="text-sm text-[#756D82] leading-relaxed">
              Choose trusted contacts who can follow your active journey and receive instant status updates from start to arrival.
            </p>
            <button
              onClick={onGoToCircle}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#6C4AB6] hover:text-[#43266F] pt-2 transition-colors cursor-pointer"
            >
              <span>Manage Trusted Contacts</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs card-hover space-y-4 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#EBF7F1] text-[#2E9B67] border border-[#2E9B67]/20 flex items-center justify-center text-2xl group-hover:bg-[#2E9B67] group-hover:text-white transition-all duration-300">
              📍
            </div>
            <h3 className="text-lg font-bold text-[#24202B]">Journey Sharing</h3>
            <p className="text-sm text-[#756D82] leading-relaxed">
              Share your journey status or live location exclusively for the duration of your trip with encrypted web links.
            </p>
            <button
              onClick={onStartRoute}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2E9B67] hover:text-[#2E9B67]/80 pt-2 transition-colors cursor-pointer"
            >
              <span>Start Active Journey</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-[#43266F] text-white rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#E88BA5]">Step-By-Step Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-black">How HerShield Works</h2>
          <p className="text-sm text-slate-300">
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
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 space-y-2 hover:bg-white/15 transition-all"
            >
              <span className="text-xs font-black text-[#E88BA5] tracking-wider block">{item.step}</span>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-tight">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#6C4AB6] via-[#43266F] to-[#6C4AB6] rounded-3xl p-8 md:p-12 text-white text-center space-y-6 shadow-xl"
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to plan your next journey?
          </h2>
          <p className="text-sm text-purple-100 leading-relaxed">
            Experience safer mobility decisions with real-time trusted circle connectivity.
          </p>
        </div>

        <button
          onClick={onStartRoute}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm bg-white text-[#43266F] hover:bg-[#F8F6FC] hover:-translate-y-1 active:scale-95 transition-all shadow-lg cursor-pointer"
        >
          <Navigation className="w-5 h-5 text-[#6C4AB6]" />
          <span>Start SafeRoute</span>
        </button>
      </motion.section>
    </div>
  );
};
