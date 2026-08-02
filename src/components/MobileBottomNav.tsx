import React from 'react';
import { Home, Navigation, Users, Footprints, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeJourneyId?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeJourneyId,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'saferoute', label: 'SafeRoute', icon: Navigation },
    { id: 'circle', label: 'Circle', icon: Users },
    { id: 'active_journey', label: 'Journey', icon: Footprints, badge: activeJourneyId ? '🟢' : undefined },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700 scale-110' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px] animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
