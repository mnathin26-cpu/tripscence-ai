/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Building,
  Car,
  Utensils,
  Sparkles,
  Bot
} from 'lucide-react';
import { Itinerary, DisruptionSimulation, ApprovalAction, Trip } from '../types/travel.js';

interface ReplanningComparisonProps {
  trip: Trip;
  originalItinerary: Itinerary;
  revisedItinerary: Itinerary | null;
  disruption: DisruptionSimulation | null;
  approval: ApprovalAction | null;
  onResolveApproval: (approvalId: string, approved: boolean, reason?: string) => Promise<void>;
  isLoading: boolean;
}

export const ReplanningComparison: React.FC<ReplanningComparisonProps> = ({
  trip,
  originalItinerary,
  revisedItinerary,
  disruption,
  approval,
  onResolveApproval,
  isLoading
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!revisedItinerary || !disruption) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white font-heading">
          No Active Disruption Replanning Event
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Simulate a disruption such as a cancelled train, unavailable hotel, or budget cut to trigger the specialist agent replanning loop.
        </p>
      </div>
    );
  }

  const costDelta = revisedItinerary.total_cost - originalItinerary.total_cost;
  const isCostIncrease = costDelta > 0;

  // Identify replaced items
  const originalReplacedItems = originalItinerary.items.filter((i) =>
    disruption.affected_item_ids.includes(i.id)
  );

  const newReplacementItems = revisedItinerary.items.filter(
    (i) => i.replacement_for_id || disruption.affected_item_ids.includes(i.id)
  );

  return (
    <div className="space-y-6">
      {/* Disruption Alert Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-slate-900/90 border border-rose-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500 text-white tracking-wider">
                {disruption.severity} Severity Disruption
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-rose-300 font-mono">
                {new Date(disruption.simulated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              {disruption.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {disruption.description}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Cost Adjustment
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                isCostIncrease ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isCostIncrease ? `+₹${costDelta.toLocaleString()}` : `-₹${Math.abs(costDelta).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Human Approval Required Callout */}
        {approval && !approval.approved && (
          <div className="mt-6 pt-6 border-t border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-rose-500/30">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Human Approval Required
              </span>
              <p className="text-xs text-slate-300">
                Review the side-by-side diff below. TripSense AI requires your explicit confirmation before applying changes to the active itinerary.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {!showRejectInput ? (
                <>
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/50 border border-rose-800/80 transition-colors"
                  >
                    Reject Revision
                  </button>
                  <button
                    onClick={() => onResolveApproval(approval.id, true)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Activate v{revisedItinerary.version}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <button
                    onClick={() => onResolveApproval(approval.id, false, rejectReason)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {approval?.approved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Approved by User:</strong> Revision v{revisedItinerary.version} is now the active travel plan.
            </span>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Itinerary Column */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Baseline Plan
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {originalItinerary.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold font-mono text-slate-300">
                ₹{originalItinerary.total_cost.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">Total Est.</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Disrupted or Affected Items ({originalReplacedItems.length || 1})
            </div>

            {originalReplacedItems.length > 0 ? (
              originalReplacedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 line-through opacity-75"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-rose-300">{item.title}</span>
                    <span className="font-mono text-rose-400">₹{item.estimated_cost}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Day {item.day} · {item.start_time} · {item.location}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                General budget / route disruption across multiple items.
              </div>
            )}

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
              Remaining Confirmed Items ({originalItinerary.items.length - originalReplacedItems.length})
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {originalItinerary.items
                .filter((it) => !disruption.affected_item_ids.includes(it.id))
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="text-white font-medium">{it.title}</span>
                      <span className="text-[10px] text-slate-500 block">Day {it.day} · {it.time_slot}</span>
                    </div>
                    <span className="font-mono text-slate-400">₹{it.estimated_cost}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Revised Itinerary Column */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Multi-Agent Replanned
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {revisedItinerary.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold font-mono text-amber-400">
                ₹{revisedItinerary.total_cost.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {costDelta >= 0 ? `+₹${costDelta}` : `-₹${Math.abs(costDelta)}`} delta
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Replacement & Compensating Bookings
            </div>

            {newReplacementItems.length > 0 ? (
              newReplacementItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300">{item.title}</span>
                    <span className="font-mono font-bold text-emerald-400">₹{item.estimated_cost}</span>
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Day {item.day} · {item.start_time} · {item.location}
                  </div>
                  <div className="text-[10px] text-slate-400 italic mt-1.5 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>Agent: {item.agent_responsible} ({item.confidence_score}% confidence)</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                Itinerary costs and allocations recalibrated.
              </div>
            )}

            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
              Preserved Confirmed Items
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {revisedItinerary.items
                .filter((it) => it.status !== 'replaced' && !it.replacement_for_id)
                .map((it) => (
                  <div
                    key={it.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="text-slate-200 font-medium">{it.title}</span>
                      <span className="text-[10px] text-slate-500 block">Day {it.day} · {it.time_slot}</span>
                    </div>
                    <span className="font-mono text-slate-400">₹{it.estimated_cost}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
