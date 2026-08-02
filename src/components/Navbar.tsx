import React, { useState } from 'react';
import { Shield, Navigation, Users, History, Info, User, LogOut, Menu, X, Sparkles, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeJourneyId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  isDemoMode,
  setIsDemoMode,
  activeJourneyId,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'saferoute', label: 'SafeRoute', icon: Navigation },
    { id: 'circle', label: 'Trusted Circle', icon: Users },
    { id: 'journeys', label: 'My Journeys', icon: History, badge: activeJourneyId ? 'LIVE' : undefined },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#43266F] via-[#6C4AB6] to-[#E88BA5] flex items-center justify-center text-white shadow-md shadow-[#6C4AB6]/20 group-hover:shadow-[#6C4AB6]/35 transition-all">
              <Shield className="w-5 h-5 fill-white/20 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#24202B]">
                Her<span className="text-[#6C4AB6] font-bold">Shield</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-[#756D82] uppercase -mt-1">
                Women Safety Platform
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F8F6FC] p-1 rounded-2xl border border-slate-200/70">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-[#6C4AB6] shadow-xs border border-[#6C4AB6]/20 font-bold'
                      : 'text-[#756D82] hover:text-[#24202B] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#6C4AB6]' : 'text-[#756D82]'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold uppercase bg-[#2E9B67] text-white rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              title="Toggle Demo Mode with synthetic routes & quick test data"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isDemoMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDemoMode ? 'text-emerald-600 animate-spin-slow' : 'text-slate-400'}`} />
              <span>Demo Mode</span>
              <span
                className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-emerald-600' : 'bg-slate-300'}`}
              />
            </button>

            {/* User Auth state */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl hover:bg-[#F8F6FC] transition-colors border border-slate-200/80"
                >
                  <span className="text-xs font-semibold text-[#24202B]">{user.name}</span>
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#6C4AB6]/30"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-[#24202B]">{user.name}</p>
                      <p className="text-[11px] text-[#756D82] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleNavClick('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#24202B] hover:bg-[#F8F6FC] hover:text-[#6C4AB6] transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[#6C4AB6]" />
                      <span>My Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#D9535B] hover:bg-rose-50 transition-colors text-left border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn-primary-glow flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`p-2 rounded-xl text-xs font-bold border ${
                isDemoMode ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-500'
              }`}
              title="Demo Mode"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 animate-slide-down">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500 text-white rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-5 h-5 text-teal-700" />
                  <span>Profile ({user.name})</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-teal-700 text-white shadow-md shadow-teal-700/20"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
