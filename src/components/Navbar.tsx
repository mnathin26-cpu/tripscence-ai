/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Terminal,
  Search,
  Lock,
  User as UserIcon,
  LogOut,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { User } from '../types/travel.js';

interface NavbarProps {
  activeTab: 'planner' | 'history' | 'companion' | 'replanning' | 'verification' | 'packages' | 'diagnostics' | 'admin';
  setActiveTab: (tab: 'planner' | 'history' | 'companion' | 'replanning' | 'verification' | 'packages' | 'diagnostics' | 'admin') => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSearchBot: () => void;
  onOpenPrivacy: () => void;
  onPreloadDemo: () => void;
  isPreloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
  onOpenSearchBot,
  onOpenPrivacy,
  onPreloadDemo,
  isPreloading
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-heading font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                  TripSense <span className="text-amber-400">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                  Multi-Agent Travel & Replanning
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links in exact requested order: 1.planner, 2.package, 3.verification, 4.companion, 5.replanning, 6.test */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            {/* 1. PLANNER */}
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'planner'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>1. Planner</span>
            </button>

            {/* 2. PACKAGES */}
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'packages'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>2. Packages</span>
            </button>

            {/* 3. VERIFICATION */}
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'verification'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Verification</span>
            </button>

            {/* 4. COMPANION */}
            <button
              onClick={() => setActiveTab('companion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'companion'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>4. Companion</span>
            </button>

            {/* 5. REPLANNING */}
            <button
              onClick={() => setActiveTab('replanning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'replanning'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>5. Replanning</span>
            </button>

            {/* 6. TESTS / DIAGNOSTICS */}
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              <span>6. Tests</span>
            </button>

            {/* DOSSIER & HISTORY */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border-l border-slate-800 ml-1 pl-2.5 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>Dossier</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* 1-Click Jaipur Demo Button */}
            <button
              onClick={onPreloadDemo}
              disabled={isPreloading}
              title="Preload Jaipur 4-Day Demo Scenario with ₹45,000 budget"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{isPreloading ? 'Loading...' : 'Preload Jaipur Demo'}</span>
            </button>

            {/* NLP Search Bot Quick Trigger */}
            <button
              onClick={onOpenSearchBot}
              title="Search places with Natural Language AI"
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-amber-400 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Privacy & Location Manager */}
            <button
              onClick={onOpenPrivacy}
              title="Location & Local Storage Privacy"
              className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <button
                  onClick={onOpenProfile}
                  title="Click to edit profile, credentials and travel preferences"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-left group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                    {currentUser.avatar_url || '🧭'}
                  </div>
                  <div className="flex flex-col hidden sm:block">
                    <span className="text-xs font-semibold text-white group-hover:text-amber-300 leading-tight transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-amber-400/90 capitalize flex items-center gap-1">
                      <span>{currentUser.role}</span>
                      <span className="text-slate-500 text-[9px] group-hover:text-amber-300">⚙️</span>
                    </span>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar in exact requested order */}
      <div className="lg:hidden flex items-center justify-start py-2 border-t border-slate-800/60 bg-slate-950 px-2 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('planner')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'planner' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          1. Planner
        </button>
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'packages' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          2. Packages
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'verification' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          3. Verification
        </button>
        <button
          onClick={() => setActiveTab('companion')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'companion' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          4. Companion
        </button>
        <button
          onClick={() => setActiveTab('replanning')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'replanning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          5. Replanning
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'diagnostics' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          6. Tests
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${
            activeTab === 'history' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Dossier
        </button>
      </div>
    </header>
  );
};
