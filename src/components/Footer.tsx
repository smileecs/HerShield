import React from 'react';
import { Shield, Heart, Lock, Globe } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-20 md:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5 fill-teal-200 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SafeRoute <span className="text-teal-400">Circle</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              SafeRoute Circle empowers women to travel smarter using safety-related route comparison data and stay safely connected with their trusted circle during active journeys.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-teal-300 border border-slate-700/80">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Location data is private & active journey-bound</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">
                  Home Landing
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('saferoute')} className="hover:text-white transition-colors">
                  Compare Routes
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('circle')} className="hover:text-white transition-colors">
                  Trusted Circle
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('journeys')} className="hover:text-white transition-colors">
                  Journey History
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors">
                  Methodology & About
                </button>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Project Note */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Important Safety Note</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Safety information scores are estimates based on available facility data and community inputs. They do not guarantee personal safety.
            </p>
            <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800/40 text-xs text-teal-200">
              <span className="font-bold">Hackathon Prototype</span> — Designed as a modern women-safety technology demonstration.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SafeRoute Circle. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for women's safe mobility everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
