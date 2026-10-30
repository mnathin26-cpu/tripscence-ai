/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Plane,
  Clock,
  Building,
  CloudRain,
  TrendingDown,
  Compass,
  Mountain,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import { DisruptionSimulation } from '../types/travel.js';

interface DisruptionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (disruptionType: DisruptionSimulation['type']) => Promise<void>;
  isLoading: boolean;
}

export const DisruptionSimulatorModal: React.FC<DisruptionSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulate,
  isLoading
}) => {
  const [selectedScenario, setSelectedScenario] = useState<DisruptionSimulation['type']>('flight_cancelled');

  if (!isOpen) return null;

  const scenarios: {
    type: DisruptionSimulation['type'];
    title: string;
    description: string;
    icon: any;
    severity: string;
    agent: string;
  }[] = [
    {
      type: 'flight_cancelled',
      title: 'Return Flight / Intercity Transit Cancelled',
      description: 'Carrier cancels return departure due to airspace closure or maintenance.',
      icon: Plane,
      severity: 'High',
      agent: 'Transport Agent'
    },
    {
      type: 'train_delayed',
      title: 'Return Train Delayed by 4 Hours',
      description: 'Major signaling issue on Delhi-Jaipur corridor delays scheduled express train.',
      icon: Clock,
      severity: 'Medium',
      agent: 'Transport Agent'
    },
    {
      type: 'hotel_unavailable',
      title: 'Selected Hotel Unavailable for Final Night',
      description: 'Property reports emergency plumbing repair; cannot honor the final night stay.',
      icon: Building,
      severity: 'High',
      agent: 'Hotel Agent'
    },
    {
      type: 'budget_reduced',
      title: 'Budget Reduced by 20%',
      description: 'Traveler reduces overall expenditure cap; requires dining & activity recalibration.',
      icon: TrendingDown,
      severity: 'Medium',
      agent: 'Coordinator Agent'
    },
    {
      type: 'mountain_landslide',
      title: 'Mountain Landslide & Road Closure',
      description: 'Rockfall and torrential weather obstruct primary mountain route segment.',
      icon: Mountain,
      severity: 'Critical',
      agent: 'Hazard & Route Agent'
    },
    {
      type: 'weather_disruption',
      title: 'Heavy Rainfall / Severe Storm Alert',
      description: 'Torrential downpour renders outdoor hill forts and viewpoints inaccessible.',
      icon: CloudRain,
      severity: 'High',
      agent: 'Weather & Coordinator Agent'
    },
    {
      type: 'restaurant_closed',
      title: 'Planned Heritage Restaurant Closed for Private Event',
      description: 'Dinner venue is booked for royal wedding; alternative vegetarian dining needed.',
      icon: UtensilsCrossed,
      severity: 'Low',
      agent: 'Food Agent'
    }
  ];

  const handleRun = async () => {
    await onSimulate(selectedScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                Simulate Travel Disruption
              </h3>
              <p className="text-xs text-slate-400">
                Trigger an unexpected event to test intelligent multi-agent replanning & human verification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedScenario === s.type;
            return (
              <button
                key={s.type}
                type="button"
                onClick={() => setSelectedScenario(s.type)}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500/80 text-white shadow-lg shadow-rose-950/50'
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    isSelected ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white leading-tight">
                      {s.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {s.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-[10px]">
                    <span className="text-rose-400 font-semibold">{s.severity}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 font-mono">{s.agent}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Safety Guarantee Footer */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Zero Automatic Charges:</strong> TripSense AI never books, charges, or purchases automatically. All revised proposals require your explicit approval.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Replanning with Specialist Agents...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Disruption & Replan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
