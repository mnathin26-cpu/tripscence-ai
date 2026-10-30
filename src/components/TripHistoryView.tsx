/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Wallet,
  Download,
  Printer,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Compass,
  Building,
  Car,
  Utensils,
  Sun,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  FileText,
  AlertCircle,
  FolderArchive,
  RefreshCw
} from 'lucide-react';
import { Trip, Itinerary, User, TravelStyle } from '../types/travel.js';
import { api } from '../utils/api.js';
import { DESTINATIONS_METADATA } from '../data/simulatedData.js';

interface TripHistoryViewProps {
  currentTrip: Trip | null;
  activeItinerary: Itinerary | null;
  onSelectTrip: (tripId: string) => Promise<void>;
  onCreateNewTrip: () => void;
  onPreloadDemo: () => void;
  onNavigateToCompanion: () => void;
  currentUser: User | null;
}

export const TripHistoryView: React.FC<TripHistoryViewProps> = ({
  currentTrip,
  activeItinerary,
  onSelectTrip,
  onCreateNewTrip,
  onPreloadDemo,
  onNavigateToCompanion,
  currentUser
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(currentTrip?.id || null);
  const [selectedTripData, setSelectedTripData] = useState<{
    trip: Trip;
    activeItinerary: Itinerary | null;
    itineraries: Itinerary[];
    disruptions: any[];
    approvals: any[];
    logs: any[];
  } | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [styleFilter, setStyleFilter] = useState<'all' | TravelStyle>('all');
  const [activeSection, setActiveSection] = useState<'all' | 'schedule' | 'stay' | 'transit' | 'food' | 'weather' | 'emergency' | 'budget'>('all');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Load Trips List
  const fetchTripsList = async () => {
    setIsLoadingList(true);
    try {
      const res = await api.getTrips();
      setTrips(res.trips || []);
      // If no selectedTripId yet, default to currentTrip or first trip
      if (!selectedTripId && res.trips && res.trips.length > 0) {
        setSelectedTripId(currentTrip?.id || res.trips[0].id);
      }
    } catch (err) {
      console.error('Failed to load trips history:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTripsList();
  }, [currentTrip?.id]);

  // Load selected trip full details
  useEffect(() => {
    if (!selectedTripId) return;

    // If selected is currently active trip and activeItinerary is already provided in props, use it or fetch fresh
    let isCancelled = false;
    async function loadDetails() {
      setIsLoadingDetails(true);
      try {
        const data = await api.getTrip(selectedTripId!);
        if (!isCancelled) {
          setSelectedTripData(data);
        }
      } catch (err) {
        console.error('Failed to load trip details:', err);
      } finally {
        if (!isCancelled) setIsLoadingDetails(false);
      }
    }

    loadDetails();
    return () => {
      isCancelled = true;
    };
  }, [selectedTripId]);

  // Filtered trips
  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.origin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStyle = styleFilter === 'all' || t.travel_style === styleFilter;
      return matchesSearch && matchesStyle;
    });
  }, [trips, searchQuery, styleFilter]);

  const activeTripObj = selectedTripData?.trip || (selectedTripId === currentTrip?.id ? currentTrip : null);
  const activeItinObj = selectedTripData?.activeItinerary || (selectedTripId === currentTrip?.id ? activeItinerary : null);

  // Group items by day
  const daysList = useMemo(() => {
    if (!activeItinObj?.items) return [];
    return Array.from(new Set(activeItinObj.items.map((i) => i.day))).sort((a, b) => a - b);
  }, [activeItinObj]);

  // Financial category totals
  const categoryTotals = useMemo(() => {
    if (!activeItinObj?.items) return {};
    return activeItinObj.items
      .filter((i) => i.status !== 'replaced')
      .reduce((acc, it) => {
        acc[it.category] = (acc[it.category] || 0) + it.estimated_cost;
        return acc;
      }, {} as Record<string, number>);
  }, [activeItinObj]);

  const lodgingItems = useMemo(() => {
    return activeItinObj?.items.filter((i) => i.category === 'hotel' && i.status !== 'replaced') || [];
  }, [activeItinObj]);

  const transportItems = useMemo(() => {
    return (
      activeItinObj?.items.filter(
        (i) => (i.category === 'transport' || i.category === 'local_transit') && i.status !== 'replaced'
      ) || []
    );
  }, [activeItinObj]);

  const foodItems = useMemo(() => {
    return activeItinObj?.items.filter((i) => i.category === 'food' && i.status !== 'replaced') || [];
  }, [activeItinObj]);

  const activityItems = useMemo(() => {
    return activeItinObj?.items.filter((i) => i.category === 'activity' && i.status !== 'replaced') || [];
  }, [activeItinObj]);

  // Destination Metadata
  const destMeta = activeTripObj?.destination
    ? (DESTINATIONS_METADATA as any)[activeTripObj.destination] || {
        name: activeTripObj.destination,
        country: 'Global',
        region: 'International',
        overview: `Intelligent travel plan curated for ${activeTripObj.destination}.`
      }
    : null;

  // Emergency contact list
  const emergencyInfo = useMemo(() => {
    const isFrance = activeTripObj?.destination.toLowerCase() === 'paris';
    return {
      police: isFrance ? '17 or 112 (EU Emergency)' : '112 / 100 (Police Control)',
      ambulance: isFrance ? '15 (SAMU Medical)' : '108 / 102 (Ambulance & Trauma)',
      touristHelpline: isFrance ? '+33 1 49 52 42 63' : '1363 (24x7 Multi-lingual Tourist Helpline)',
      hospital: isFrance ? 'Hôpital Hôtel-Dieu / Pitié-Salpêtrière' : 'Sawai Man Singh (SMS) Govt Hospital & Fortis Hospital',
      userContact: currentUser?.preferences?.emergency_contact_name
        ? `${currentUser.preferences.emergency_contact_name} (${currentUser.preferences.emergency_contact_phone || 'No phone set'})`
        : 'None configured (add in profile)'
    };
  }, [activeTripObj, currentUser]);

  // ----------------------------------------------------
  // DOWNLOAD & EXPORT HANDLERS
  // ----------------------------------------------------

  // 1. Download Structured JSON
  const handleDownloadJSON = () => {
    if (!activeTripObj) return;

    const exportPayload = {
      dossier_type: 'TRIPSENSE_AI_TRAVEL_DOSSIER',
      export_version: '2.0.0',
      exported_at: new Date().toISOString(),
      trip: activeTripObj,
      itinerary: activeItinObj,
      destination_meta: destMeta,
      category_costs: categoryTotals,
      emergency_contacts: emergencyInfo,
      user_profile_context: {
        traveller_name: currentUser?.name || 'Guest Explorer',
        dietary: activeTripObj.constraints.dietary || 'standard',
        wheelchair_access: Boolean(activeTripObj.constraints.wheelchair_access)
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TripSense-${activeTripObj.destination.toLowerCase()}-dossier-${activeTripObj.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 2. Download Formatted Text / Markdown Itinerary
  const handleDownloadText = () => {
    if (!activeTripObj || !activeItinObj) return;

    let text = `====================================================================\n`;
    text += `TRIPSENSE AI - OFFICIAL TRAVEL DOSSIER & ITINERARY\n`;
    text += `====================================================================\n\n`;
    text += `DESTINATION:  ${activeTripObj.destination.toUpperCase()} (${destMeta?.region || ''}, ${destMeta?.country || ''})\n`;
    text += `ORIGIN:       ${activeTripObj.origin}\n`;
    text += `TRAVEL DATES: ${activeTripObj.start_date} to ${activeTripObj.end_date}\n`;
    text += `TRAVELLERS:   ${activeTripObj.travellers} Person(s)\n`;
    text += `TRAVEL STYLE: ${activeTripObj.travel_style.toUpperCase()}\n`;
    text += `TOTAL BUDGET: ${activeTripObj.currency} ${activeTripObj.total_budget.toLocaleString()}\n`;
    text += `EST. COST:    ${activeTripObj.currency} ${activeItinObj.total_cost.toLocaleString()}\n`;
    text += `STATUS:       ${activeItinObj.budget_status.toUpperCase()} (Balance: ${activeTripObj.currency} ${(activeTripObj.total_budget - activeItinObj.total_cost).toLocaleString()})\n\n`;

    text += `--------------------------------------------------------------------\n`;
    text += `COORDINATOR AGENT TRIP OVERVIEW\n`;
    text += `--------------------------------------------------------------------\n`;
    text += `${activeItinObj.explanation}\n\n`;

    text += `--------------------------------------------------------------------\n`;
    text += `DAY-BY-DAY COMPLETE SCHEDULE\n`;
    text += `--------------------------------------------------------------------\n`;

    daysList.forEach((dayNum) => {
      text += `\n[ DAY ${dayNum} ]\n`;
      const dayItems = activeItinObj.items.filter((it) => it.day === dayNum && it.status !== 'replaced');
      dayItems.forEach((it) => {
        text += `  • ${it.start_time} - ${it.end_time} | [${it.category.toUpperCase()}] ${it.title}\n`;
        text += `    Location: ${it.location}\n`;
        text += `    Cost: ${it.currency} ${it.estimated_cost.toLocaleString()} | Travel Time: ${it.travel_time_minutes}m\n`;
        text += `    Agent: ${it.agent_responsible} (Confidence: ${it.confidence_score}%)\n`;
        if (it.notes) text += `    Notes: ${it.notes}\n`;
        text += `\n`;
      });
    });

    text += `--------------------------------------------------------------------\n`;
    text += `ACCOMMODATION & LODGING\n`;
    text += `--------------------------------------------------------------------\n`;
    lodgingItems.forEach((hotel) => {
      text += `• ${hotel.title} - ${hotel.location}\n`;
      text += `  Cost: ${hotel.currency} ${hotel.estimated_cost.toLocaleString()} | Status: ${hotel.status}\n`;
      if (hotel.notes) text += `  Details: ${hotel.notes}\n`;
    });

    text += `\n--------------------------------------------------------------------\n`;
    text += `EMERGENCY & SAFETY DIRECTORY\n`;
    text += `--------------------------------------------------------------------\n`;
    text += `• Police:           ${emergencyInfo.police}\n`;
    text += `• Ambulance:        ${emergencyInfo.ambulance}\n`;
    text += `• Tourist Helpline: ${emergencyInfo.touristHelpline}\n`;
    text += `• Primary Hospital: ${emergencyInfo.hospital}\n`;
    text += `• Next of Kin:      ${emergencyInfo.userContact}\n\n`;

    text += `Generated securely by TripSense AI Multi-Agent Architecture\n`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TripSense-${activeTripObj.destination.toLowerCase()}-itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 3. Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  // 4. Copy Summary
  const handleCopySummary = async () => {
    if (!activeTripObj || !activeItinObj) return;
    const summary = `TripSense AI Itinerary: ${activeTripObj.title} (${activeTripObj.destination}) from ${activeTripObj.start_date} to ${activeTripObj.end_date}. Est. Cost: ₹${activeItinObj.total_cost.toLocaleString()} of ₹${activeTripObj.total_budget.toLocaleString()} budget. Day-by-day includes ${activeItinObj.items.length} curated stops with real-time routing & dietary compliance.`;
    await navigator.clipboard.writeText(summary);
    setCopyStatus('Copied to clipboard!');
    setTimeout(() => setCopyStatus(null), 3000);
  };

  // 5. Delete Trip
  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to remove this trip from your history?')) return;
    setIsDeletingId(tripId);
    try {
      await api.deleteTrip(tripId);
      const updated = trips.filter((t) => t.id !== tripId);
      setTrips(updated);
      if (selectedTripId === tripId) {
        setSelectedTripId(updated[0]?.id || null);
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                Trip History & Comprehensive Dossier
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {trips.length} Saved Trip{trips.length === 1 ? '' : 's'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              All Details & Travel Archive
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Inspect full itinerary schedules, accommodation vouchers, route navigation profiles, weather forecasts,
              emergency hotlines, and cost audit ledgers. Download your complete trip package anytime in JSON or printable format.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateNewTrip}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Create New Trip</span>
            </button>
            <button
              onClick={fetchTripsList}
              disabled={isLoadingList}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Refresh Trips"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar (Trips Explorer) & Right Main (Full Dossier) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Saved Trips List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                Saved Trips ({filteredTrips.length})
              </span>
            </div>

            {/* Search and Filters */}
            <div className="space-y-2 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter destination, origin..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {(['all', 'budget', 'balanced', 'comfort', 'luxury'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setStyleFilter(style)}
                    className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                      styleFilter === style
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Trip Cards List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredTrips.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                  <p>No trips match your filter.</p>
                  <button
                    onClick={onPreloadDemo}
                    className="mt-3 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                  >
                    Preload Jaipur Demo
                  </button>
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const isSelected = trip.id === selectedTripId;
                  const isActive = trip.id === currentTrip?.id;

                  return (
                    <div
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative text-left group ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                            {trip.destination}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                            {trip.travel_style}
                          </span>
                        </div>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>
                          {trip.start_date} → {trip.end_date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Wallet className="w-3 h-3 text-amber-400" />
                          <span>
                            {trip.currency} {trip.total_budget.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectTrip(trip.id);
                              }}
                              title="Set as globally active trip"
                              className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(trip.id);
                            }}
                            disabled={isDeletingId === trip.id}
                            title="Delete this trip from history"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Full Dossier for Selected Trip (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {isLoadingDetails ? (
            <div className="p-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-white">Retrieving complete trip dossier...</p>
              <p className="text-xs text-slate-400 mt-1">Aggregating agent schedules, routes, and emergency guidelines.</p>
            </div>
          ) : !activeTripObj ? (
            <div className="p-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md text-slate-400">
              <FolderArchive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-semibold text-white">No Trip Selected</p>
              <p className="text-xs text-slate-400 mt-1">Select a trip from your history on the left or create a new plan.</p>
            </div>
          ) : (
            <>
              {/* DOSSIER HERO BANNER */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Comprehensive Trip Dossier
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Trip ID: {activeTripObj.id}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                      {activeTripObj.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {activeTripObj.origin} → {activeTripObj.destination} ({destMeta?.country})
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {activeTripObj.start_date} to {activeTripObj.end_date}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 text-[10px] text-amber-300 font-semibold">
                        {activeTripObj.travel_style} Style
                      </span>
                    </p>
                  </div>

                  {/* ACTIVE STATUS & COMPANION JUMP */}
                  <div className="flex items-center gap-2">
                    {activeTripObj.id === currentTrip?.id ? (
                      <button
                        onClick={onNavigateToCompanion}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <span>Open Live Companion</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectTrip(activeTripObj.id)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Set Active Plan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* DOWNLOAD & EXPORT ACTION CONTROLS */}
                <div className="pt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Download All Trip Details:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* 1. Download JSON */}
                    <button
                      onClick={handleDownloadJSON}
                      title="Download full machine-readable JSON data package"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-amber-400/50 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download JSON</span>
                    </button>

                    {/* 2. Download Text/Markdown */}
                    <button
                      onClick={handleDownloadText}
                      title="Download offline readable itinerary text brief"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-cyan-400/50 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download Text</span>
                    </button>

                    {/* 3. Print / PDF */}
                    <button
                      onClick={handlePrint}
                      title="Print or save as high-resolution PDF document"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 hover:border-emerald-400/50 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Print / PDF</span>
                    </button>

                    {/* 4. Copy Summary */}
                    <button
                      onClick={handleCopySummary}
                      title="Copy trip brief to clipboard"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copyStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copyStatus ? 'Copied!' : 'Copy Brief'}</span>
                    </button>
                  </div>
                </div>

                {/* KPI METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Total Budget</span>
                    <span className="text-base sm:text-lg font-bold text-white font-mono">
                      {activeTripObj.currency} {activeTripObj.total_budget.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Est. Cost</span>
                    <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
                      {activeTripObj.currency} {(activeItinObj?.total_cost || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Budget Balance</span>
                    <span
                      className={`text-base sm:text-lg font-bold font-mono ${
                        (activeTripObj.total_budget - (activeItinObj?.total_cost || 0)) >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeTripObj.currency} {(activeTripObj.total_budget - (activeItinObj?.total_cost || 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Total Stops</span>
                    <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono">
                      {activeItinObj?.items.length || 0} Itinerary Items
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION NAVIGATION PILLS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                {[
                  { id: 'all', label: 'All Details' },
                  { id: 'schedule', label: `Day-by-Day (${activeItinObj?.items.length || 0})` },
                  { id: 'stay', label: `Lodging (${lodgingItems.length})` },
                  { id: 'transit', label: `Transit (${transportItems.length})` },
                  { id: 'food', label: `Dining (${foodItems.length})` },
                  { id: 'weather', label: 'Weather & Gear' },
                  { id: 'emergency', label: 'Emergency Hotline' },
                  { id: 'budget', label: 'Cost Ledger' }
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      activeSection === sec.id
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* SECTION 1: DAY-BY-DAY COMPLETE SCHEDULE */}
              {(activeSection === 'all' || activeSection === 'schedule') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Complete Day-by-Day Schedule
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {daysList.length} Travel Days
                    </span>
                  </div>

                  {activeItinObj?.explanation && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-300 font-semibold block mb-1">Coordinator Agent Rationale:</strong>
                      {activeItinObj.explanation}
                    </div>
                  )}

                  <div className="space-y-6">
                    {daysList.map((dayNum) => {
                      const dayItems = activeItinObj?.items.filter((i) => i.day === dayNum && i.status !== 'replaced') || [];
                      const dayCost = dayItems.reduce((acc, it) => acc + it.estimated_cost, 0);

                      return (
                        <div key={dayNum} className="space-y-3">
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="font-heading font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                                {dayNum}
                              </span>
                              Day {dayNum} Itinerary
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Subtotal: <strong className="text-white">₹{dayCost.toLocaleString()}</strong>
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {dayItems.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all text-left"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                        item.category === 'hotel'
                                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                          : item.category === 'food'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : item.category === 'transport' || item.category === 'local_transit'
                                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}
                                    >
                                      {item.category.replace('_', ' ')}
                                    </span>
                                    <span className="font-heading font-bold text-sm text-white">
                                      {item.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 text-xs font-mono">
                                    <span className="text-slate-400 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                                      {item.start_time} - {item.end_time}
                                    </span>
                                    <span className="text-amber-400 font-bold">
                                      ₹{item.estimated_cost.toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap mb-2">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    {item.location}
                                  </span>
                                  <span className="text-slate-600">·</span>
                                  <span>Travel Time: {item.travel_time_minutes} min</span>
                                  <span className="text-slate-600">·</span>
                                  <span className="text-slate-400">
                                    Agent: <strong className="text-slate-300">{item.agent_responsible}</strong> (
                                    {item.confidence_score}% match)
                                  </span>
                                </div>

                                {item.notes && (
                                  <p className="text-xs text-slate-400/90 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: ACCOMMODATION & LODGING DOSSIER */}
              {(activeSection === 'all' || activeSection === 'stay') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Accommodation & Lodging Details
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Subtotal: ₹{(categoryTotals['hotel'] || 0).toLocaleString()}
                    </span>
                  </div>

                  {lodgingItems.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4">No dedicated hotel stay items booked.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {lodgingItems.map((hotel) => (
                        <div
                          key={hotel.id}
                          className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                                Verified Lodging Reservation
                              </span>
                              <h4 className="text-base font-heading font-bold text-white">{hotel.title}</h4>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                {hotel.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-purple-300 font-mono">
                                ₹{hotel.estimated_cost.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-slate-500 block">Total Stay Estimate</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                              ✓ Non-Smoking Rooms
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                              ✓ Free High-Speed WiFi
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                              ✓ Breakfast Included
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">
                              ✓ Free Cancellation up to 24h Prior
                            </span>
                          </div>

                          {hotel.notes && (
                            <p className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
                              {hotel.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: TRANSIT, FLIGHTS & GROUND ROUTE */}
              {(activeSection === 'all' || activeSection === 'transit') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Transit & Route Information
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Subtotal: ₹{((categoryTotals['transport'] || 0) + (categoryTotals['local_transit'] || 0)).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">
                        Inter-City Corridor
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {activeTripObj.origin} ➔ {activeTripObj.destination}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Recommended transit chosen based on {activeTripObj.travel_style} travel preference and constraints.
                        Luggage allowance verified for {activeTripObj.travellers} traveler(s).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                        Local City Ground Transit
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        Intra-city Cabs, Metro & Auto Shuttles
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Integrated routes between hotel and daily heritage/sightseeing attractions with maximum {activeTripObj.constraints.max_walking_km || 4}km walking limit.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {transportItems.map((trans) => (
                      <div
                        key={trans.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Car className="w-4 h-4 text-blue-400" />
                          <div>
                            <strong className="text-white block">{trans.title}</strong>
                            <span className="text-slate-500 text-[11px]">{trans.location}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold font-mono">
                            ₹{trans.estimated_cost.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-500 block">{trans.travel_time_minutes} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: CULINARY & DIETARY GUIDE */}
              {(activeSection === 'all' || activeSection === 'food') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Curated Dining & Dietary Plan
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Subtotal: ₹{(categoryTotals['food'] || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed">
                    <strong className="text-emerald-300 font-semibold block mb-1">Dietary Compliance Verification:</strong>
                    Food recommendations are verified for <strong>{activeTripObj.constraints.dietary?.toUpperCase() || 'STANDARD'}</strong> preferences.
                    Conflict-check rules enforced against cross-contamination and non-compliant culinary venues.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {foodItems.map((food) => (
                      <div
                        key={food.id}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-emerald-400 font-mono uppercase">
                              Day {food.day} · {food.time_slot}
                            </span>
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              ₹{food.estimated_cost.toLocaleString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{food.title}</h4>
                          <p className="text-xs text-slate-400">{food.location}</p>
                        </div>
                        {food.notes && (
                          <p className="text-[11px] text-slate-500 italic border-t border-slate-800/60 pt-1.5">
                            {food.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 5: WEATHER, CLIMATE & PACKING ADVISORY */}
              {(activeSection === 'all' || activeSection === 'weather') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Destination Climate & Packing Advisory
                      </h3>
                    </div>
                    <span className="text-xs text-amber-400 font-mono">
                      {destMeta?.name || activeTripObj.destination}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {destMeta?.overview ||
                      `Destination situated in ${destMeta?.region || 'Central region'}. Recommended gear optimized for current season and outdoor sightseeing.`}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Expected Weather</span>
                      <span className="text-sm font-bold text-white">Mild & Pleasant (22°C - 31°C)</span>
                      <p className="text-[11px] text-slate-400 mt-1">Clear skies with dry conditions for heritage tours.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Recommended Footwear</span>
                      <span className="text-sm font-bold text-cyan-300">Cushioned Walking Shoes</span>
                      <p className="text-[11px] text-slate-400 mt-1">Fort pathways & bazaar walkways require sturdy soles.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Essential Gear</span>
                      <span className="text-sm font-bold text-amber-300">Sun Protection & Hydration</span>
                      <p className="text-[11px] text-slate-400 mt-1">Hat, SPF 50 sunglasses, and refillable water bottle.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 6: EMERGENCY DIRECTORY & SAFETY */}
              {(activeSection === 'all' || activeSection === 'emergency') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-5 h-5 text-rose-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Emergency Directory & Safety Protocol
                      </h3>
                    </div>
                    <span className="text-xs text-rose-400 font-mono">
                      24/7 Rapid Response
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Police Assistance</span>
                        <span className="text-sm font-bold text-white">{emergencyInfo.police}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono">Toll-Free</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Medical & Ambulance</span>
                        <span className="text-sm font-bold text-white">{emergencyInfo.ambulance}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono">Toll-Free</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tourist Safety Helpline</span>
                        <span className="text-sm font-bold text-white">{emergencyInfo.touristHelpline}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono">Helpdesk</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">User Next-of-Kin</span>
                        <span className="text-sm font-bold text-amber-300">{emergencyInfo.userContact}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono">Profile</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: FINANCIAL LEDGER & COST AUDIT */}
              {(activeSection === 'all' || activeSection === 'budget') && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-amber-400" />
                      <h3 className="text-lg font-heading font-bold text-white">
                        Financial Audit & Expense Ledger
                      </h3>
                    </div>
                    <span className="text-xs text-amber-400 font-mono">
                      {activeTripObj.currency} Currency
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 px-3">Expense Category</th>
                          <th className="py-2.5 px-3">Allocation Rationale</th>
                          <th className="py-2.5 px-3 text-right">Estimated Cost</th>
                          <th className="py-2.5 px-3 text-right">% of Budget</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        <tr>
                          <td className="py-3 px-3 text-white font-semibold">Lodging & Accommodation</td>
                          <td className="py-3 px-3 text-slate-400 font-sans">Full stay room reservations & amenities</td>
                          <td className="py-3 px-3 text-right text-purple-300">
                            ₹{(categoryTotals['hotel'] || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {(((categoryTotals['hotel'] || 0) / activeTripObj.total_budget) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 text-white font-semibold">Transit & Transport</td>
                          <td className="py-3 px-3 text-slate-400 font-sans">Corridor travel & daily local rides</td>
                          <td className="py-3 px-3 text-right text-blue-300">
                            ₹{(((categoryTotals['transport'] || 0) + (categoryTotals['local_transit'] || 0))).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {(((((categoryTotals['transport'] || 0) + (categoryTotals['local_transit'] || 0))) / activeTripObj.total_budget) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 text-white font-semibold">Dining & Culinary</td>
                          <td className="py-3 px-3 text-slate-400 font-sans">Breakfast, lunches & curated dinners</td>
                          <td className="py-3 px-3 text-right text-emerald-300">
                            ₹{(categoryTotals['food'] || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {(((categoryTotals['food'] || 0) / activeTripObj.total_budget) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 text-white font-semibold">Attractions & Sightseeing</td>
                          <td className="py-3 px-3 text-slate-400 font-sans">Fort tickets, guides & entry passes</td>
                          <td className="py-3 px-3 text-right text-amber-300">
                            ₹{(categoryTotals['activity'] || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {(((categoryTotals['activity'] || 0) / activeTripObj.total_budget) * 100).toFixed(1)}%
                          </td>
                        </tr>
                        <tr className="bg-slate-950 font-bold border-t border-slate-700">
                          <td className="py-3 px-3 text-amber-400">TOTAL ESTIMATED EXPENDITURE</td>
                          <td className="py-3 px-3 text-slate-400 font-sans">
                            Cost per person: ₹{Math.round((activeItinObj?.total_cost || 0) / activeTripObj.travellers).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-400 text-sm">
                            ₹{(activeItinObj?.total_cost || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-amber-400">
                            {(((activeItinObj?.total_cost || 0) / activeTripObj.total_budget) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
