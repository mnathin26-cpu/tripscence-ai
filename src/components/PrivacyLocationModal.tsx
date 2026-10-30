/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Trash2, CheckCircle2, MapPin, Database } from 'lucide-react';

interface PrivacyLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyLocationModal: React.FC<PrivacyLocationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [cleared, setCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearLocalData = () => {
    localStorage.removeItem('tripsense_local_activity');
    localStorage.removeItem('tripsense_gps_cache');
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                Privacy & Data Minimization Policy
              </h3>
              <p className="text-xs text-slate-400">Your privacy rights and location controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Location Data Policy</span>
            </div>
            <p className="text-slate-400">
              Precise GPS coordinates are requested strictly after explicit browser consent. Coordinates are processed client-side and ephemeral in-memory for navigation HUD maneuvers; they are <strong>never</strong> logged into long-term public analytics databases.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Local Storage Isolation</span>
            </div>
            <p className="text-slate-400">
              Sensitive user search queries and navigation activity are stored only in your local browser sandbox (localStorage) rather than uploaded to remote tracking endpoints.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Automatic Charging Guarantee</span>
            </div>
            <p className="text-slate-400">
              TripSense AI operates on a human-in-the-loop paradigm. The agent will never automatically execute bookings, charge credit cards, or send external emails without your explicit approval.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearLocalData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>{cleared ? 'Cleared All Local Logs!' : 'Purge Local Activity Logs'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
