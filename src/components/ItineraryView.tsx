/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Sparkles,
  Bot,
  Car,
  Utensils,
  Building,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  Download,
  FileText,
  FolderArchive
} from 'lucide-react';
import { Itinerary, ItineraryItem, Trip } from '../types/travel.js';

interface ItineraryViewProps {
  trip: Trip;
  itinerary: Itinerary;
  onOpenDisruptionModal: () => void;
  onViewHistory?: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  trip,
  itinerary,
  onOpenDisruptionModal,
  onViewHistory
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Group items by day
  const days = Array.from(new Set(itinerary.items.map((i) => i.day))).sort((a, b) => a - b);
  const activeItems = itinerary.items.filter((i) => i.day === selectedDay && i.status !== 'replaced');

  // Calculate category cost breakdown
  const categoryTotals = itinerary.items
    .filter((i) => i.status !== 'replaced')
    .reduce((acc, it) => {
      acc[it.category] = (acc[it.category] || 0) + it.estimated_cost;
      return acc;
    }, {} as Record<string, number>);

  const hotelTotal = categoryTotals['hotel'] || 0;
  const transportTotal = (categoryTotals['transport'] || 0) + (categoryTotals['local_transit'] || 0);
  const foodTotal = categoryTotals['food'] || 0;
  const activityTotal = categoryTotals['activity'] || 0;
  const totalCost = itinerary.total_cost;
  const remainingBudget = trip.total_budget - totalCost;

  const handleDownloadDossier = () => {
    const exportPayload = {
      dossier_type: 'TRIPSENSE_AI_TRAVEL_DOSSIER',
      export_version: '2.0.0',
      exported_at: new Date().toISOString(),
      trip,
      itinerary,
      category_costs: categoryTotals,
      total_budget: trip.total_budget,
      total_cost: itinerary.total_cost,
      remaining_balance: trip.total_budget - itinerary.total_cost,
      days_count: days.length
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TripSense-${trip.destination.toLowerCase()}-dossier.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Coordinator Summary & Budget Meter */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Coordinator Agent Explanation
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[11px] text-slate-400 font-mono">
                Version {itinerary.version}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white">
              {itinerary.title}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {itinerary.explanation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                title="Open separated page showing all details and trip history"
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
              >
                <FolderArchive className="w-4 h-4 text-amber-400" />
                <span>Full Dossier & History</span>
              </button>
            )}

            <button
              onClick={handleDownloadDossier}
              title="Download structured JSON dossier of all trip details"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Download Details</span>
            </button>

            <button
              onClick={onOpenDisruptionModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-orange-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/40"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Simulate Disruption</span>
            </button>
          </div>
        </div>

        {/* Budget Progress & Breakdown Cards */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-2 gap-1 font-mono">
            <div className="text-slate-400">
              Total Estimated: <strong className="text-white font-bold">₹{totalCost.toLocaleString()}</strong> of ₹{trip.total_budget.toLocaleString()} budget
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-semibold ${
                  remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {remainingBudget >= 0
                  ? `₹${remainingBudget.toLocaleString()} Surplus Remaining`
                  : `₹${Math.abs(remainingBudget).toLocaleString()} Deficit`}
              </span>
              <span className="text-slate-600">·</span>
              <span className="capitalize text-slate-300 font-sans">
                {itinerary.budget_status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
            <div
              style={{ width: `${Math.min(100, (hotelTotal / trip.total_budget) * 100)}%` }}
              title={`Hotel: ₹${hotelTotal}`}
              className="bg-indigo-500 h-full transition-all"
            />
            <div
              style={{ width: `${Math.min(100, (transportTotal / trip.total_budget) * 100)}%` }}
              title={`Transport: ₹${transportTotal}`}
              className="bg-cyan-500 h-full transition-all"
            />
            <div
              style={{ width: `${Math.min(100, (foodTotal / trip.total_budget) * 100)}%` }}
              title={`Food: ₹${foodTotal}`}
              className="bg-amber-500 h-full transition-all"
            />
            <div
              style={{ width: `${Math.min(100, (activityTotal / trip.total_budget) * 100)}%` }}
              title={`Activities: ₹${activityTotal}`}
              className="bg-emerald-500 h-full transition-all"
            />
          </div>

          {/* Category Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>Accommodation</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                ₹{hotelTotal.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transport & Transit</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                ₹{transportTotal.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Culinary & Food</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                ₹{foodTotal.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monuments & Sights</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                ₹{activityTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {days.map((day) => {
          const dayItems = itinerary.items.filter((i) => i.day === day && i.status !== 'replaced');
          const dayDate = dayItems[0]?.date || `Day ${day}`;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDay === day
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {day}</span>
              <span className="text-[10px] opacity-75 font-mono">({dayDate})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline Slots: Morning, Afternoon, Evening */}
      <div className="space-y-4">
        {activeItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
            No scheduled items for this day.
          </div>
        ) : (
          activeItems.map((item) => {
            const isHotel = item.category === 'hotel';
            const isTransport = item.category === 'transport' || item.category === 'local_transit';
            const isFood = item.category === 'food';

            const agentBadgeColor =
              item.agent_responsible === 'Hotel Agent'
                ? 'text-indigo-400 bg-indigo-950/60 border-indigo-800'
                : item.agent_responsible === 'Transport Agent'
                ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
                : item.agent_responsible === 'Food Agent'
                ? 'text-amber-400 bg-amber-950/60 border-amber-800'
                : 'text-purple-400 bg-purple-950/60 border-purple-800';

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    {/* Time & Slot Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-amber-400 font-semibold">
                        <Clock className="w-3 h-3" />
                        {item.start_time} - {item.end_time}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="uppercase text-[10px] tracking-wider font-semibold text-slate-300">
                        {item.time_slot}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${agentBadgeColor}`}>
                        {item.agent_responsible}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-emerald-400 text-[10px] font-semibold">
                        {item.confidence_score}% match
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Location & Travel time */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {item.location}
                      </span>
                      {item.travel_time_minutes > 0 && (
                        <>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 font-mono">
                            ~{item.travel_time_minutes} min transit buffer
                          </span>
                        </>
                      )}
                    </div>

                    {/* Assumptions or Notes */}
                    {item.assumptions && (
                      <p className="text-xs text-slate-400/90 italic pt-1 flex items-start gap-1">
                        <Info className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                        <span>Assumption: {item.assumptions}</span>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-slate-300 pt-0.5">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Estimated Cost */}
                  <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                    <div className="text-base sm:text-lg font-bold font-mono text-white">
                      ₹{item.estimated_cost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.category === 'hotel'
                        ? 'Accommodation'
                        : item.category === 'transport'
                        ? 'Fare total'
                        : item.category === 'food'
                        ? 'Estimated meal'
                        : 'Activity entry'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
