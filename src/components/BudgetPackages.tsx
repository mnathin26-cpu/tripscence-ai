/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Building,
  Car,
  Utensils,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Check,
  X,
  FileCheck2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { BudgetPackage, Trip } from '../types/travel.js';

interface BudgetPackagesProps {
  packages: BudgetPackage[];
  currentTrip: Trip;
  onSelectPackage: (pkg: BudgetPackage) => void;
  onContinueToVerification?: () => void;
}

export const BudgetPackages: React.FC<BudgetPackagesProps> = ({
  packages,
  currentTrip,
  onSelectPackage,
  onContinueToVerification
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    packages.find((p) => p.name === 'Balanced Package')?.id || packages[0]?.id
  );

  // Confirmation modal state
  const [confirmingPackage, setConfirmingPackage] = useState<BudgetPackage | null>(null);
  const [confirmedPackage, setConfirmedPackage] = useState<BudgetPackage | null>(null);

  if (!packages || packages.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
        Loading budget packages...
      </div>
    );
  }

  const handleOpenConfirmation = (pkg: BudgetPackage) => {
    setConfirmingPackage(pkg);
  };

  const handleConfirmTier = (pkg: BudgetPackage) => {
    setSelectedPkgId(pkg.id);
    setConfirmedPackage(pkg);
    onSelectPackage(pkg);
    setConfirmingPackage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sequential Workflow Order Indicator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> 6-Step Autonomous Travel Pipeline
          </span>
          <span className="text-xs text-slate-400 font-mono">Current: Step 2 of 6</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>1. Planner</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-between shadow-sm">
            <span>2. Packages</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>3. Verification</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>4. Companion</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>5. Replanning</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>6. Tests</span>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4" /> Step 2: Multi-Tier Budget Optimization
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
              Select Your Travel Tier & Create Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Compare Economy, Balanced, and Luxury tiers calibrated for {currentTrip.travellers} travellers in {currentTrip.destination}.
              Selecting your preferred option creates a locked confirmation before proceeding to Plan Verification.
            </p>
          </div>

          {confirmedPackage && onContinueToVerification && (
            <button
              onClick={onContinueToVerification}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto border border-emerald-400/40 animate-pulse"
            >
              <span>Continue to Step 3: Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Confirmation Status Pill Banner */}
        {confirmedPackage && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-heading">
                  Tier Confirmed: {confirmedPackage.name} ({confirmedPackage.travel_style.toUpperCase()})
                </strong>
                <span className="text-[11px] text-emerald-300">
                  Total ₹{confirmedPackage.total_estimated_cost.toLocaleString()} locked for {currentTrip.travellers} traveler(s).
                </span>
              </div>
            </div>
            {onContinueToVerification && (
              <button
                onClick={onContinueToVerification}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Proceed ➔
              </button>
            )}
          </div>
        )}
      </div>

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const isSelected = selectedPkgId === pkg.id;
          const isConfirmed = confirmedPackage?.id === pkg.id;
          const isEconomy = pkg.name === 'Economy Package';
          const isBalanced = pkg.name === 'Balanced Package';
          const isPremium = pkg.name === 'Premium Package';

          const accentColor = isBalanced
            ? 'border-amber-500/60 shadow-amber-500/10'
            : isPremium
            ? 'border-purple-500/60 shadow-purple-500/10'
            : 'border-slate-800 hover:border-slate-700';

          return (
            <div
              key={pkg.id}
              className={`bg-slate-900/90 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all relative ${accentColor} ${
                isSelected ? 'ring-2 ring-amber-500 bg-slate-900' : ''
              }`}
            >
              {isBalanced && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                  Recommended Value Tier
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-md">
                  Luxury Prestige Tier
                </div>
              )}

              <div className="space-y-4">
                {/* Title & Style */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {pkg.travel_style} Tier
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    {pkg.name}
                  </h3>
                </div>

                {/* Price block */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-mono text-white">
                        ₹{pkg.total_estimated_cost.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 block">Total Package</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold font-mono text-amber-400">
                        ₹{pkg.cost_per_person.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ person</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Budget Status:</span>
                    <span
                      className={`font-semibold font-mono ${
                        pkg.remaining_budget >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pkg.remaining_budget >= 0
                        ? `₹${pkg.remaining_budget.toLocaleString()} surplus`
                        : `₹${Math.abs(pkg.remaining_budget).toLocaleString()} over`}
                    </span>
                  </div>
                </div>

                {/* Inclusions */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">{pkg.hotel_option.option_name}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ₹{pkg.hotel_option.price.toLocaleString()} total ({pkg.hotel_option.duration_or_stay})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Car className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">{pkg.transport_option.option_name}</strong>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ₹{pkg.transport_option.price.toLocaleString()} round trip
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-200 block">Food Allowance</strong>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ₹{pkg.daily_food_allowance}/day per person
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk notes */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" /> Risk Considerations
                  </span>
                  <ul className="text-[11px] text-slate-400 space-y-0.5 list-disc pl-3">
                    {pkg.risk_notes.map((rn, idx) => (
                      <li key={idx}>{rn}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Selection & Confirmation Action */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => handleOpenConfirmation(pkg)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    isConfirmed
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmed & Locked Tier</span>
                    </>
                  ) : (
                    <>
                      <span>Select {pkg.name.replace(' Package', '')} Tier</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <h3 className="text-lg font-bold font-heading text-white mb-4">
          Detailed Feature Comparison Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Parameter</th>
                {packages.map((p) => (
                  <th key={p.id} className="pb-3 font-semibold text-white">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 text-slate-400">Total Price</td>
                {packages.map((p) => (
                  <td key={p.id} className="py-3 font-mono font-bold text-white">
                    ₹{p.total_estimated_cost.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-slate-400">Accommodation Tier</td>
                {packages.map((p) => (
                  <td key={p.id} className="py-3 font-medium">
                    {p.hotel_option.option_name}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-slate-400">Transport Operator</td>
                {packages.map((p) => (
                  <td key={p.id} className="py-3 font-medium">
                    {p.transport_option.option_name}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-slate-400">Preference Match</td>
                {packages.map((p) => (
                  <td key={p.id} className="py-3 font-mono text-amber-400 font-semibold">
                    {p.preference_match_score}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 text-slate-400">Cancellation Policy</td>
                {packages.map((p) => (
                  <td key={p.id} className="py-3 text-slate-400">
                    {p.travel_style === 'budget' ? 'Strict / Non-refundable' : 'Free cancellation up to 48h'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TIER SELECTION CONFIRMATION MODAL */}
      {confirmingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Create Tier Confirmation
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Review and lock your selection before plan verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingPackage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Package Details */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono text-amber-400 font-bold">
                    {confirmingPackage.travel_style.toUpperCase()} TIER
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {confirmingPackage.preference_match_score}% Match
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white font-heading">
                  {confirmingPackage.name}
                </h4>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-xl font-bold font-mono text-white">
                      ₹{confirmingPackage.total_estimated_cost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Total for {currentTrip.travellers} travellers</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold font-mono text-emerald-400">
                      ₹{confirmingPackage.remaining_budget >= 0 ? confirmingPackage.remaining_budget.toLocaleString() : 0} Surplus
                    </span>
                    <span className="text-[10px] text-slate-400 block">Remaining Budget</span>
                  </div>
                </div>
              </div>

              {/* Itemized Confirmation List */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{confirmingPackage.hotel_option.option_name}</strong>
                    <span className="text-[11px] text-slate-400">
                      ₹{confirmingPackage.hotel_option.price.toLocaleString()} · Verified accommodation
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <Car className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">{confirmingPackage.transport_option.option_name}</strong>
                    <span className="text-[11px] text-slate-400">
                      ₹{confirmingPackage.transport_option.price.toLocaleString()} · Round-trip corridor
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
                  <Utensils className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Daily Food Allowance</strong>
                    <span className="text-[11px] text-slate-400">
                      ₹{confirmingPackage.daily_food_allowance}/day per person · {currentTrip.constraints.dietary?.toUpperCase() || 'STANDARD'} compliant
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingPackage(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel / Compare Others
              </button>
              <button
                type="button"
                onClick={() => handleConfirmTier(confirmingPackage)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Lock This Tier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
