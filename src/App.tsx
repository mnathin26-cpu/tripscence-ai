/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { TripForm } from './components/TripForm.js';
import { ItineraryView } from './components/ItineraryView.js';
import { BudgetPackages } from './components/BudgetPackages.js';
import { TravelCompanion } from './components/TravelCompanion.js';
import { ReplanningComparison } from './components/ReplanningComparison.js';
import { DisruptionSimulatorModal } from './components/DisruptionSimulatorModal.js';
import { NLPSearchBot } from './components/NLPSearchBot.js';
import { PlanVerificationPanel } from './components/PlanVerificationPanel.js';
import { TestingDiagnostics } from './components/TestingDiagnostics.js';
import { AdminPanel } from './components/AdminPanel.js';
import { AuthModal } from './components/AuthModal.js';
import { UserFeedbackModal } from './components/UserFeedbackModal.js';
import { PrivacyLocationModal } from './components/PrivacyLocationModal.js';
import { ProfileModal } from './components/ProfileModal.js';
import { TripHistoryView } from './components/TripHistoryView.js';
import { api } from './utils/api.js';
import {
  Trip,
  Itinerary,
  BudgetPackage,
  PlanVerificationResult,
  DisruptionSimulation,
  ApprovalAction,
  DestinationWeather,
  NearbyPlace,
  RouteCondition,
  HazardAlert,
  User
} from './types/travel.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'planner' | 'history' | 'companion' | 'replanning' | 'verification' | 'packages' | 'diagnostics' | 'admin'
  >('planner');

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Trip & Itinerary State
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [allItineraries, setAllItineraries] = useState<Itinerary[]>([]);
  const [packages, setPackages] = useState<BudgetPackage[]>([]);
  const [verification, setVerification] = useState<PlanVerificationResult | null>(null);

  // Disruption & Replanning State
  const [activeDisruption, setActiveDisruption] = useState<DisruptionSimulation | null>(null);
  const [revisedItinerary, setRevisedItinerary] = useState<Itinerary | null>(null);
  const [activeApproval, setActiveApproval] = useState<ApprovalAction | null>(null);
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);

  // Companion State
  const [destinationMeta, setDestinationMeta] = useState<any>(null);
  const [weather, setWeather] = useState<DestinationWeather | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [routeConditions, setRouteConditions] = useState<RouteCondition | null>(null);
  const [hazards, setHazards] = useState<HazardAlert[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchBotOpen, setIsSearchBotOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Loading States
  const [isLoadingTrip, setIsLoadingTrip] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isPreloadingDemo, setIsPreloadingDemo] = useState(false);

  // Initial Load: check auth & load initial trip
  useEffect(() => {
    async function init() {
      try {
        const meRes = await api.getMe().catch(() => null);
        if (meRes?.user) {
          setCurrentUser(meRes.user);
        } else {
          // Auto login default demo user for frictionless review
          const demoLogin = await api.login('traveller@tripsense.ai', 'password123').catch(() => null);
          if (demoLogin?.user) setCurrentUser(demoLogin.user);
        }
      } catch (e) {
        console.warn('Initial auth check notice:', e);
      }

      await loadTripData('trip-jaipur-demo');
    }

    init();
  }, []);

  const loadTripData = async (tripId: string) => {
    try {
      const data = await api.getTrip(tripId);
      setCurrentTrip(data.trip);
      setActiveItinerary(data.activeItinerary);
      setAllItineraries(data.itineraries || []);

      if (data.disruptions && data.disruptions.length > 0) {
        setActiveDisruption(data.disruptions[0]);
        if (data.itineraries.length > 1) {
          setRevisedItinerary(data.itineraries[data.itineraries.length - 1]);
        }
      }

      if (data.approvals && data.approvals.length > 0) {
        setActiveApproval(data.approvals[0]);
      }

      // Load packages & verification
      const [pkgRes, verRes, compRes, placesRes] = await Promise.all([
        api.getPackages(tripId).catch(() => ({ packages: [] })),
        api.verifyPlan(tripId).catch(() => ({ verification: null })),
        api.getDestinationOverview(data.trip.destination).catch(() => null),
        api.getNearbyPlaces(data.trip.destination).catch(() => ({ places: [] }))
      ]);

      setPackages(pkgRes.packages || []);
      setVerification(verRes.verification || null);

      if (compRes) {
        setDestinationMeta(compRes.destination);
        setWeather(compRes.weather);
        setHazards(compRes.hazards || []);
        setRouteConditions(compRes.route);
      }
      setNearbyPlaces(placesRes.places || []);
    } catch (err) {
      console.error('Failed to load trip data:', err);
    }
  };

  // Preload Official Jaipur Demo
  const handlePreloadDemo = async () => {
    setIsPreloadingDemo(true);
    try {
      await api.preloadJaipurDemo();
      await loadTripData('trip-jaipur-demo');
      setActiveTab('planner');
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreloadingDemo(false);
    }
  };

  // Create new Trip
  const handleCreateTrip = async (tripData: any) => {
    setIsLoadingTrip(true);
    try {
      const res = await api.createTrip(tripData);
      await loadTripData(res.trip.id);
      setActiveTab('planner');
    } catch (err: any) {
      alert(`Trip creation error: ${err.message}`);
    } finally {
      setIsLoadingTrip(false);
    }
  };

  // Simulate Disruption
  const handleSimulateDisruption = async (type: DisruptionSimulation['type']) => {
    if (!currentTrip) return;
    setIsReplanning(true);
    try {
      const res = await api.simulateDisruption(currentTrip.id, type);
      setActiveDisruption(res.disruption);
      setRevisedItinerary(res.revisedItinerary);
      setActiveApproval(res.approval);

      // Reload verification for revised plan
      const verRes = await api.verifyPlan(currentTrip.id);
      setVerification(verRes.verification);

      setActiveTab('replanning');
    } catch (err: any) {
      alert(`Replanning error: ${err.message}`);
    } finally {
      setIsReplanning(false);
    }
  };

  // Resolve Human Approval for Replan
  const handleResolveApproval = async (approvalId: string, approved: boolean, reason?: string) => {
    if (!currentTrip) return;
    setIsReplanning(true);
    try {
      await api.resolveApproval(currentTrip.id, approvalId, approved, reason);
      await loadTripData(currentTrip.id);
      if (approved) {
        setActiveTab('planner');
      }
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsReplanning(false);
    }
  };

  // Switch to a Budget Package
  const handleSelectPackage = (pkg: BudgetPackage) => {
    if (!currentTrip || !activeItinerary) return;
    // Update active itinerary total cost and style
    const updated = {
      ...activeItinerary,
      total_cost: pkg.total_estimated_cost,
      title: `${pkg.name} Active (${pkg.travel_style.toUpperCase()})`
    };
    setActiveItinerary(updated);
    alert(`Switched active selection to ${pkg.name}. Total cost: ₹${pkg.total_estimated_cost.toLocaleString()}.`);
  };

  // Add Place to Itinerary from Companion
  const handleAddPlaceToItinerary = async (place: NearbyPlace) => {
    if (!activeItinerary || !currentTrip) return;

    const newItem = {
      id: `item-add-${crypto.randomUUID().slice(0, 6)}`,
      itinerary_id: activeItinerary.id,
      day: 2,
      date: currentTrip.start_date,
      time_slot: 'afternoon' as const,
      start_time: '04:00 PM',
      end_time: '05:30 PM',
      title: place.name,
      category: place.category === 'food' ? 'food' : 'activity' as any,
      location: place.address || place.name,
      coordinates: place.coordinates,
      estimated_cost: place.approx_cost * currentTrip.travellers,
      currency: currentTrip.currency,
      travel_time_minutes: place.travel_time_minutes,
      agent_responsible: 'Coordinator Agent' as const,
      confidence_score: 96,
      assumptions: 'Added by user via Travel Companion exploration.',
      status: 'confirmed' as const,
      notes: place.description
    };

    const updatedItems = [...activeItinerary.items, newItem];
    const newTotal = updatedItems.reduce((s, it) => s + it.estimated_cost, 0);

    const updatedItin = {
      ...activeItinerary,
      items: updatedItems,
      total_cost: newTotal
    };

    setActiveItinerary(updatedItin);
    alert(`Added ${place.name} to Day 2 afternoon itinerary.`);
  };

  // Refresh Route Traffic
  const handleRefreshRoute = async () => {
    if (!currentTrip) return;
    try {
      const res = await api.getRouteConditions('Delhi', currentTrip.destination);
      setRouteConditions(res.route);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Global Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          await api.logout();
          setCurrentUser(null);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSearchBot={() => setIsSearchBotOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onPreloadDemo={handlePreloadDemo}
        isPreloading={isPreloadingDemo}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: TRIP PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Trip Form Builder */}
            <TripForm
              onSubmitTrip={handleCreateTrip}
              isLoading={isLoadingTrip}
              onPreloadJaipurDemo={handlePreloadDemo}
            />

            {/* Generated Itinerary & Daily Timeline */}
            {currentTrip && activeItinerary && (
              <ItineraryView
                trip={currentTrip}
                itinerary={activeItinerary}
                onOpenDisruptionModal={() => setIsDisruptionModalOpen(true)}
                onViewHistory={() => setActiveTab('history')}
              />
            )}
          </div>
        )}

        {/* TAB 2: TRIP HISTORY & COMPREHENSIVE DOSSIER */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <TripHistoryView
              currentTrip={currentTrip}
              activeItinerary={activeItinerary}
              onSelectTrip={async (tripId) => {
                await loadTripData(tripId);
              }}
              onCreateNewTrip={() => setActiveTab('planner')}
              onPreloadDemo={handlePreloadDemo}
              onNavigateToCompanion={() => setActiveTab('companion')}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* TAB 3: BUDGET PACKAGES */}
        {activeTab === 'packages' && currentTrip && (
          <div className="animate-in fade-in duration-300">
            <BudgetPackages
              packages={packages}
              currentTrip={currentTrip}
              onSelectPackage={handleSelectPackage}
            />
          </div>
        )}

        {/* TAB 3: TRAVEL COMPANION */}
        {activeTab === 'companion' && currentTrip && (
          <div className="animate-in fade-in duration-300">
            <TravelCompanion
              trip={currentTrip}
              itinerary={activeItinerary}
              destinationMeta={destinationMeta}
              weather={weather}
              places={nearbyPlaces}
              route={routeConditions}
              hazards={hazards}
              onAddPlaceToItinerary={handleAddPlaceToItinerary}
              onRefreshRoute={handleRefreshRoute}
              onOpenFeedback={() => setIsFeedbackModalOpen(true)}
              onSimulateHazardReplanning={() => handleSimulateDisruption('mountain_landslide')}
            />
          </div>
        )}

        {/* TAB 4: DISRUPTION & REPLANNING */}
        {activeTab === 'replanning' && currentTrip && (
          <div className="animate-in fade-in duration-300">
            <ReplanningComparison
              trip={currentTrip}
              originalItinerary={allItineraries[0] || activeItinerary!}
              revisedItinerary={revisedItinerary}
              disruption={activeDisruption}
              approval={activeApproval}
              onResolveApproval={handleResolveApproval}
              isLoading={isReplanning}
            />
          </div>
        )}

        {/* TAB 5: PLAN VERIFICATION */}
        {activeTab === 'verification' && currentTrip && activeItinerary && (
          <div className="animate-in fade-in duration-300">
            <PlanVerificationPanel
              trip={currentTrip}
              itinerary={activeItinerary}
              verification={verification}
            />
          </div>
        )}

        {/* TAB 6: DIAGNOSTICS & TESTS */}
        {activeTab === 'diagnostics' && (
          <div className="animate-in fade-in duration-300">
            <TestingDiagnostics />
          </div>
        )}

        {/* TAB 7: ADMIN */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-300">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Floating Natural Language Search Bot Widget Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsSearchBotOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer border border-amber-400"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
          <span>Ask AI Location Bot</span>
        </button>
      </div>

      {/* Modals */}
      <DisruptionSimulatorModal
        isOpen={isDisruptionModalOpen}
        onClose={() => setIsDisruptionModalOpen(false)}
        onSimulate={handleSimulateDisruption}
        isLoading={isReplanning}
      />

      <NLPSearchBot
        isOpen={isSearchBotOpen}
        onClose={() => setIsSearchBotOpen(false)}
        destination={currentTrip?.destination || 'Jaipur'}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      <UserFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        destination={currentTrip?.destination || 'Jaipur'}
      />

      <PrivacyLocationModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {currentUser && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onProfileUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TripSense AI · Intelligent Multi-Agent Travel Planning & Replanning</span>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-white">Privacy Policy</button>
            <button onClick={() => setActiveTab('diagnostics')} className="hover:text-white">Diagnostics</button>
            <button onClick={() => setIsFeedbackModalOpen(true)} className="hover:text-white">Report Issue</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
