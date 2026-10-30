/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Wallet,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { PlanVerificationResult, Trip, Itinerary } from '../types/travel.js';

interface PlanVerificationPanelProps {
  trip: Trip;
  itinerary: Itinerary;
  verification: PlanVerificationResult | null;
}

export const PlanVerificationPanel: React.FC<PlanVerificationPanelProps> = ({
  trip,
  itinerary,
  verification
}) => {
  if (!verification) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400">
        Verification data loading...
      </div>
    );
  }

  const isVerified = verification.overall_status === 'verified';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" /> Multi-Agent Constraint Audit Engine
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Itinerary Plan Verification Panel
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Validates that budget limits, transit buffers, dietary constraints, and opening hours are mathematically satisfied.
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-2xl border flex items-center gap-2 self-start sm:self-auto ${
              isVerified
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <span className="text-xs font-bold block uppercase tracking-wider">
                {isVerified ? 'Audit Passed' : 'Advisory Warnings'}
              </span>
              <span className="text-[10px] opacity-75 font-mono">
                Itinerary {itinerary.version} Status
              </span>
            </div>
          </div>
        </div>

        {/* 4 Core Verification Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {/* 1. Budget Check */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-400" /> Budget Check
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  verification.budget_check.passed
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-rose-950 text-rose-400'
                }`}
              >
                {verification.budget_check.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              ₹{verification.budget_check.total_cost.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {verification.budget_check.message}
            </p>
          </div>

          {/* 2. Timing & Buffers */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Timing Check
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  verification.timing_check.passed
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-rose-950 text-rose-400'
                }`}
              >
                {verification.timing_check.passed ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              0 Overlaps
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {verification.timing_check.message}
            </p>
          </div>

          {/* 3. Preference Match */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Preference Match
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">
                {verification.preference_match_percentage}%
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              High Affinity
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Prioritizes royal heritage sights and relaxed daytime pace.
            </p>
          </div>

          {/* 4. Constraint Compliance */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Constraints
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  verification.constraint_compliance.passed
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-rose-950 text-rose-400'
                }`}
              >
                {verification.constraint_compliance.passed ? 'PASS' : 'WARNING'}
              </span>
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {trip.constraints.dietary ? trip.constraints.dietary.toUpperCase() : 'STANDARD'}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {verification.constraint_compliance.message}
            </p>
          </div>
        </div>

        {/* Open Issues & Suggested Fixes */}
        {verification.open_issues.length > 0 ? (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Open Issues & Recommended Fixes ({verification.open_issues.length})
            </h4>
            <div className="space-y-2">
              {verification.open_issues.map((issue, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-200 block">{issue}</strong>
                    {verification.suggested_fixes[idx] && (
                      <span className="text-emerald-400 text-[11px] block mt-0.5">
                        Suggested Fix: {verification.suggested_fixes[idx]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 pt-6 border-t border-slate-800 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero open issues detected. All constraints, budgets, and operating hours are verified.</span>
          </div>
        )}
      </div>
    </div>
  );
};
