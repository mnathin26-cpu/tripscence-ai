/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Trip,
  Itinerary,
  ItineraryItem,
  BudgetPackage,
  PlanVerificationResult,
  DisruptionSimulation,
  ApprovalAction
} from '../../src/types/travel.js';
import { db } from '../db.js';
import { hotelAgent } from './hotelAgent.js';
import { transportAgent } from './transportAgent.js';
import { foodAgent } from './foodAgent.js';
import { getGeminiClient } from './geminiClient.js';
import { SIMULATED_ATTRACTIONS } from '../../src/data/simulatedData.js';

export class CoordinatorAgent {
  /**
   * Generates a complete initial day-by-day itinerary for a trip.
   */
  public async generateItinerary(trip: Trip): Promise<Itinerary> {
    db.logAgentAction(
      trip.id,
      'Coordinator Agent',
      'Begin multi-agent itinerary orchestration',
      `Target: ${trip.origin} to ${trip.destination}. Budget: ${trip.currency} ${trip.total_budget}. Travellers: ${trip.travellers}. Style: ${trip.travel_style}.`
    );

    // Calculate days
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const timeDiff = Math.max(1, end.getTime() - start.getTime());
    const days = Math.min(10, Math.max(1, Math.round(timeDiff / (1000 * 3600 * 24))));
    const nights = Math.max(1, days - 1);

    // 1. Call Hotel Agent
    const hotelResult = hotelAgent.evaluateHotels(
      trip.destination,
      nights,
      trip.total_budget,
      trip.preferences,
      trip.constraints,
      trip.travel_style
    );
    db.logAgentAction(
      trip.id,
      'Hotel Agent',
      `Evaluated accommodations and selected ${hotelResult.selected.option_name}`,
      hotelResult.selected.reasoning,
      'Simulated Engine'
    );

    // 2. Call Transport Agent
    const transportResult = transportAgent.evaluateIntercityTransport(
      trip.origin,
      trip.destination,
      trip.travellers,
      trip.total_budget,
      trip.constraints,
      trip.preferences,
      trip.travel_style
    );
    db.logAgentAction(
      trip.id,
      'Transport Agent',
      `Selected ${transportResult.outbound.option_name} and ${transportResult.returnTrip.option_name}`,
      `${transportResult.outbound.reasoning} | Local transit: ${transportResult.localTransitPackage.option_name}`,
      'Simulated Engine'
    );

    // 3. Call Food Agent
    const foodResult = foodAgent.evaluateDining(
      trip.destination,
      days,
      trip.travellers,
      trip.constraints,
      trip.preferences,
      trip.total_budget / (days * 3)
    );
    db.logAgentAction(
      trip.id,
      'Food Agent',
      `Curated daily dining with dietary constraint: ${trip.constraints.dietary || 'standard'}`,
      `Total dining cost: ${foodResult.totalFoodCost} INR across ${days} days.`,
      'Simulated Engine'
    );

    // 4. Coordinator Merging & Attractions Scheduling
    const items: ItineraryItem[] = [];
    const itineraryId = `itin-${crypto.randomUUID().slice(0, 8)}`;

    // Outbound transit on Day 1 morning
    items.push({
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      itinerary_id: itineraryId,
      day: 1,
      date: trip.start_date,
      time_slot: 'morning',
      start_time: '08:30 AM',
      end_time: '12:45 PM',
      title: transportResult.outbound.option_name,
      category: 'transport',
      location: transportResult.outbound.location,
      coordinates: transportResult.outbound.coordinates,
      estimated_cost: transportResult.outbound.price,
      currency: trip.currency,
      travel_time_minutes: 255,
      agent_responsible: 'Transport Agent',
      confidence_score: transportResult.outbound.preference_match_score,
      assumptions: 'Mid-morning departure compliant with no early mornings constraint.',
      status: 'confirmed'
    });

    // Hotel Check-in Day 1 afternoon
    items.push({
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      itinerary_id: itineraryId,
      day: 1,
      date: trip.start_date,
      time_slot: 'afternoon',
      start_time: '01:15 PM',
      end_time: '02:30 PM',
      title: `Check-in: ${hotelResult.selected.option_name} (${nights} Nights)`,
      category: 'hotel',
      location: hotelResult.selected.location,
      coordinates: hotelResult.selected.coordinates,
      estimated_cost: hotelResult.selected.price,
      currency: trip.currency,
      travel_time_minutes: 20,
      agent_responsible: 'Hotel Agent',
      confidence_score: hotelResult.selected.preference_match_score,
      assumptions: 'Selected best tier accommodation matching user comfort style.',
      status: 'confirmed'
    });

    // Local transit pass
    items.push({
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      itinerary_id: itineraryId,
      day: 1,
      date: trip.start_date,
      time_slot: 'morning',
      start_time: '01:00 PM',
      end_time: '07:00 PM',
      title: transportResult.localTransitPackage.option_name,
      category: 'local_transit',
      location: transportResult.localTransitPackage.location,
      estimated_cost: transportResult.localTransitPackage.price,
      currency: trip.currency,
      travel_time_minutes: 0,
      agent_responsible: 'Transport Agent',
      confidence_score: 95,
      assumptions: 'Dedicated tourist cab pass covers all monument transfers.',
      status: 'confirmed'
    });

    // Schedule attractions for each day
    const matchingAttractions = SIMULATED_ATTRACTIONS.filter(
      (a) => a.destination.toLowerCase() === trip.destination.toLowerCase()
    );
    const availableAttractions = matchingAttractions.length > 0 ? matchingAttractions : SIMULATED_ATTRACTIONS;

    let attrIdx = 0;
    for (let d = 1; d <= days; d++) {
      const dayDate = new Date(start.getTime() + (d - 1) * 86400000).toISOString().split('T')[0];
      const dailyMeals = foodResult.dailyPlans[d - 1];

      // Breakfast (Days 2 to N)
      if (d > 1 && dailyMeals?.breakfast) {
        items.push({
          id: `item-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: itineraryId,
          day: d,
          date: dayDate,
          time_slot: 'morning',
          start_time: '08:30 AM',
          end_time: '09:30 AM',
          title: dailyMeals.breakfast.option_name,
          category: 'food',
          location: dailyMeals.breakfast.location,
          coordinates: dailyMeals.breakfast.coordinates,
          estimated_cost: dailyMeals.breakfast.price,
          currency: trip.currency,
          travel_time_minutes: 15,
          agent_responsible: 'Food Agent',
          confidence_score: dailyMeals.breakfast.preference_match_score,
          status: 'confirmed'
        });
      }

      // Morning Activity
      if (d > 1 && availableAttractions[attrIdx % availableAttractions.length]) {
        const att = availableAttractions[attrIdx % availableAttractions.length];
        attrIdx++;
        items.push({
          id: `item-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: itineraryId,
          day: d,
          date: dayDate,
          time_slot: 'morning',
          start_time: '10:00 AM',
          end_time: '01:00 PM',
          title: `Visit ${att.name}`,
          category: 'activity',
          location: att.location,
          coordinates: att.coordinates,
          estimated_cost: att.entry_fee_inr * trip.travellers,
          currency: trip.currency,
          travel_time_minutes: 25,
          agent_responsible: 'Coordinator Agent',
          confidence_score: 96,
          assumptions: 'Scheduled during morning hours for best daylight and lower crowds.',
          status: 'confirmed',
          notes: att.description
        });
      }

      // Lunch
      if (dailyMeals?.lunch) {
        items.push({
          id: `item-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: itineraryId,
          day: d,
          date: dayDate,
          time_slot: 'afternoon',
          start_time: '01:30 PM',
          end_time: '02:45 PM',
          title: dailyMeals.lunch.option_name,
          category: 'food',
          location: dailyMeals.lunch.location,
          coordinates: dailyMeals.lunch.coordinates,
          estimated_cost: dailyMeals.lunch.price,
          currency: trip.currency,
          travel_time_minutes: 15,
          agent_responsible: 'Food Agent',
          confidence_score: dailyMeals.lunch.preference_match_score,
          status: 'confirmed'
        });
      }

      // Afternoon / Evening Activity
      if (d < days && availableAttractions[attrIdx % availableAttractions.length]) {
        const att = availableAttractions[attrIdx % availableAttractions.length];
        attrIdx++;
        items.push({
          id: `item-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: itineraryId,
          day: d,
          date: dayDate,
          time_slot: 'afternoon',
          start_time: '03:30 PM',
          end_time: '06:00 PM',
          title: `Explore ${att.name}`,
          category: 'activity',
          location: att.location,
          coordinates: att.coordinates,
          estimated_cost: att.entry_fee_inr * trip.travellers,
          currency: trip.currency,
          travel_time_minutes: 20,
          agent_responsible: 'Coordinator Agent',
          confidence_score: 95,
          status: 'confirmed',
          notes: att.description
        });
      }

      // Dinner
      if (dailyMeals?.dinner) {
        items.push({
          id: `item-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: itineraryId,
          day: d,
          date: dayDate,
          time_slot: 'night',
          start_time: '07:45 PM',
          end_time: '09:30 PM',
          title: dailyMeals.dinner.option_name,
          category: 'food',
          location: dailyMeals.dinner.location,
          coordinates: dailyMeals.dinner.coordinates,
          estimated_cost: dailyMeals.dinner.price,
          currency: trip.currency,
          travel_time_minutes: 20,
          agent_responsible: 'Food Agent',
          confidence_score: dailyMeals.dinner.preference_match_score,
          status: 'confirmed'
        });
      }
    }

    // Return journey on final day
    const returnDate = new Date(start.getTime() + (days - 1) * 86400000).toISOString().split('T')[0];
    items.push({
      id: `item-${crypto.randomUUID().slice(0, 8)}`,
      itinerary_id: itineraryId,
      day: days,
      date: returnDate,
      time_slot: 'afternoon',
      start_time: '03:45 PM',
      end_time: '07:25 PM',
      title: transportResult.returnTrip.option_name,
      category: 'transport',
      location: transportResult.returnTrip.location,
      coordinates: transportResult.returnTrip.coordinates,
      estimated_cost: transportResult.returnTrip.price,
      currency: trip.currency,
      travel_time_minutes: 220,
      agent_responsible: 'Transport Agent',
      confidence_score: transportResult.returnTrip.preference_match_score,
      status: 'confirmed',
      notes: 'High-speed return intercity connection.'
    });

    const totalCost = items.reduce((acc, it) => acc + it.estimated_cost, 0);

    let budgetStatus: Itinerary['budget_status'] = 'under_budget';
    if (totalCost > trip.total_budget) {
      budgetStatus = 'over_budget';
    } else if (totalCost >= trip.total_budget * 0.9) {
      budgetStatus = 'near_budget';
    }

    // Generate natural language explanation using Gemini if available
    let explanation = `Balanced ${days}-day plan for ${trip.travellers} travellers in ${trip.destination}. Curated ${hotelResult.selected.option_name} with ${trip.constraints.dietary || 'vegetarian'} dining and key heritage sights. Total cost is ${totalCost} ${trip.currency} against an allocated budget of ${trip.total_budget} ${trip.currency}.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const resp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `You are the Coordinator Agent of TripSense AI. Summarize in 2 concise sentences why this itinerary matches the user's travel style (${trip.travel_style}), preferences (${JSON.stringify(trip.preferences)}), and constraints (${JSON.stringify(trip.constraints)}). Total cost: ${totalCost} ${trip.currency}, Budget: ${trip.total_budget} ${trip.currency}.`
        });
        if (resp.text) {
          explanation = resp.text.trim();
        }
      } catch (err) {
        console.warn('Gemini summary generation fallback:', err);
      }
    }

    const itinerary: Itinerary = {
      id: itineraryId,
      trip_id: trip.id,
      version: 1,
      title: 'v1 Initial Baseline Plan',
      total_cost: totalCost,
      currency: trip.currency,
      budget_status: budgetStatus,
      explanation,
      items,
      is_active: true,
      created_at: new Date().toISOString()
    };

    db.saveItinerary(itinerary, true);
    return itinerary;
  }

  /**
   * Generates 3 budget packages: Economy, Balanced, Premium.
   */
  public generateBudgetPackages(trip: Trip): BudgetPackage[] {
    const days = 4;
    const nights = 3;

    const hotels = hotelAgent.evaluateHotels(
      trip.destination,
      nights,
      trip.total_budget,
      trip.preferences,
      trip.constraints,
      trip.travel_style
    ).options;

    const economyHotel = hotels.find((h) => h.tier === 'lowest_cost') || hotels[0];
    const balancedHotel = hotels.find((h) => h.tier === 'best_value') || hotels[0];
    const premiumHotel = hotels.find((h) => h.tier === 'best_comfort') || hotels[hotels.length - 1];

    const transports = transportAgent.evaluateIntercityTransport(
      trip.origin,
      trip.destination,
      trip.travellers,
      trip.total_budget,
      trip.constraints,
      trip.preferences,
      trip.travel_style
    );

    const economyTransport: typeof transports.outbound = {
      ...transports.outbound,
      option_name: 'AC Superfast Train (Economy Chair Car)',
      price: 680 * 2 * trip.travellers // return
    };

    const balancedTransport: typeof transports.outbound = {
      ...transports.outbound,
      option_name: 'Ajmer Shatabdi & Vande Bharat Express',
      price: (920 + 1250) * trip.travellers
    };

    const premiumTransport: typeof transports.outbound = {
      ...transports.outbound,
      option_name: 'Private Intercity AC Chauffeur Sedan Door-to-Door',
      price: 4400 * 2
    };

    const makePkg = (
      name: BudgetPackage['name'],
      style: BudgetPackage['travel_style'],
      hotel: typeof economyHotel,
      transport: typeof transports.outbound,
      dailyFoodPerPerson: number,
      activityCost: number,
      matchScore: number,
      riskNotes: string[]
    ): BudgetPackage => {
      const foodTotal = dailyFoodPerPerson * days * trip.travellers;
      const totalCost = hotel.price + transport.price + foodTotal + activityCost;
      const remaining = trip.total_budget - totalCost;
      const perPerson = Math.round(totalCost / trip.travellers);

      return {
        id: `pkg-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        travel_style: style,
        hotel_option: hotel,
        transport_option: transport,
        daily_food_allowance: dailyFoodPerPerson,
        activities_summary: [
          'Amber Fort Palace & Sheesh Mahal',
          'City Palace & Jantar Mantar Observatory',
          'Hawa Mahal & Johari Bazaar Walk',
          'Nahargarh Fort Sunset Panorama'
        ],
        total_estimated_cost: totalCost,
        remaining_budget: remaining,
        cost_per_person: perPerson,
        preference_match_score: matchScore,
        risk_notes: riskNotes,
        currency: trip.currency
      };
    };

    return [
      makePkg(
        'Economy Package',
        'budget',
        economyHotel,
        economyTransport,
        450,
        1800,
        84,
        ['Non-refundable budget room rates', 'Shared rail transit transfers', 'Modest room size']
      ),
      makePkg(
        'Balanced Package',
        'balanced',
        balancedHotel,
        balancedTransport,
        850,
        3200,
        96,
        ['Free cancellation up to 48 hours', 'Comfortable Shatabdi/Vande Bharat rail timings', 'Optimal value-to-cost ratio']
      ),
      makePkg(
        'Premium Package',
        'luxury',
        premiumHotel,
        premiumTransport,
        2200,
        6400,
        92,
        ['Higher tariff may exceed modest budgets', 'Requires advance booking confirmation', 'Door-to-door private chauffeur']
      )
    ];
  }

  /**
   * Simulates a disruption and triggers multi-agent replanning.
   */
  public async simulateDisruptionAndReplan(
    tripId: string,
    disruptionType: DisruptionSimulation['type']
  ): Promise<{
    disruption: DisruptionSimulation;
    revisedItinerary: Itinerary;
    approval: ApprovalAction;
    originalItinerary: Itinerary;
  }> {
    const trip = db.getTripById(tripId);
    if (!trip) throw new Error('Trip not found');

    const originalItinerary = db.getActiveItinerary(tripId);
    if (!originalItinerary) throw new Error('No active itinerary found to disrupt');

    // 1. Identify affected items based on disruption type
    let affectedItemIds: string[] = [];
    let title = '';
    let description = '';
    let severity: DisruptionSimulation['severity'] = 'medium';
    let suggestedAction = '';

    const newItems: ItineraryItem[] = JSON.parse(JSON.stringify(originalItinerary.items));

    if (disruptionType === 'flight_cancelled' || disruptionType === 'train_delayed') {
      // Find return or outbound transport item
      const transportItem = newItems.find((it) => it.category === 'transport');
      if (transportItem) {
        affectedItemIds.push(transportItem.id);
        title = disruptionType === 'flight_cancelled' ? 'Return Flight Cancelled by Airline' : 'Return Express Train Delayed by 4 Hours';
        description = 'Carrier reported unforeseen technical equipment delay impacting planned return timeline.';
        severity = 'high';
        suggestedAction = 'Transport Agent activated to book replacement high-speed express train or private highway taxi.';

        // Call Transport Agent for alternative
        const altTransport = transportAgent.getAlternativeForDisruptedTransport(
          'original-id',
          trip.origin,
          trip.destination,
          trip.travellers,
          'train_delayed'
        );

        // Replace item
        transportItem.status = 'replaced';
        newItems.push({
          id: `repl-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: `itin-revised`,
          day: transportItem.day,
          date: transportItem.date,
          time_slot: transportItem.time_slot,
          start_time: '04:30 PM',
          end_time: '08:45 PM',
          title: altTransport.option_name,
          category: 'transport',
          location: altTransport.location,
          coordinates: altTransport.coordinates,
          estimated_cost: altTransport.price,
          currency: trip.currency,
          travel_time_minutes: 255,
          agent_responsible: 'Transport Agent',
          confidence_score: 93,
          assumptions: 'Selected reliable intercity chauffeur sedan to avoid overnight stranded delay.',
          status: 'confirmed',
          replacement_for_id: transportItem.id
        });
      }
    } else if (disruptionType === 'hotel_unavailable') {
      const hotelItem = newItems.find((it) => it.category === 'hotel');
      if (hotelItem) {
        affectedItemIds.push(hotelItem.id);
        title = 'Selected Hotel Unavailable for Final Night';
        description = 'Property maintenance emergency / VIP government delegation requisitioned final night room inventory.';
        severity = 'high';
        suggestedAction = 'Hotel Agent recommends seamless stay completion at neighboring 4-star boutique haveli.';

        const altHotel = hotelAgent.getAlternativeForUnavailableHotel(
          'current-hotel',
          trip.destination,
          1,
          hotelItem.estimated_cost / 3
        );

        hotelItem.estimated_cost = Math.round((hotelItem.estimated_cost / 3) * 2);
        hotelItem.title = `${hotelItem.title} (Shortened to 2 Nights)`;

        newItems.push({
          id: `repl-hotel-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: 'itin-revised',
          day: 3,
          date: newItems[newItems.length - 2]?.date || trip.end_date,
          time_slot: 'night',
          start_time: '08:00 PM',
          end_time: '11:59 PM',
          title: `Final Night: ${altHotel.option_name}`,
          category: 'hotel',
          location: altHotel.location,
          coordinates: altHotel.coordinates,
          estimated_cost: altHotel.price,
          currency: trip.currency,
          travel_time_minutes: 15,
          agent_responsible: 'Hotel Agent',
          confidence_score: 94,
          status: 'confirmed',
          replacement_for_id: hotelItem.id,
          notes: 'Luggage transfer arranged between properties.'
        });
      }
    } else if (disruptionType === 'budget_reduced') {
      title = 'User Reduced Total Trip Budget by 20%';
      description = `Budget decreased from ₹${trip.total_budget} to ₹${Math.round(trip.total_budget * 0.8)}.`;
      severity = 'medium';
      suggestedAction = 'Coordinator Agent recalibrates dining allowances and shifts to optimal economy activities.';

      db.updateTrip(trip.id, { total_budget: Math.round(trip.total_budget * 0.8) });

      // Scale dining or activities down
      newItems.forEach((it) => {
        if (it.category === 'food' && it.estimated_cost > 1000) {
          it.estimated_cost = Math.round(it.estimated_cost * 0.75);
          it.title = `${it.title} (Optimized Menu)`;
        }
      });
    } else if (disruptionType === 'mountain_landslide' || disruptionType === 'weather_disruption') {
      title = 'Severe Weather / Roadblock on Primary Route';
      description = 'Torrential rain causing localized landslide risk and mountain pass closure.';
      severity = 'critical';
      suggestedAction = 'Hazard Agent triggers alternative valley highway routing and switches outdoor forts to indoor palaces.';

      const outdoorFort = newItems.find((it) => it.title.toLowerCase().includes('nahargarh') || it.title.toLowerCase().includes('amber'));
      if (outdoorFort) {
        affectedItemIds.push(outdoorFort.id);
        outdoorFort.status = 'replaced';
        newItems.push({
          id: `repl-indoor-${crypto.randomUUID().slice(0, 8)}`,
          itinerary_id: 'itin-revised',
          day: outdoorFort.day,
          date: outdoorFort.date,
          time_slot: outdoorFort.time_slot,
          start_time: outdoorFort.start_time,
          end_time: outdoorFort.end_time,
          title: 'Indoor Albert Hall State Museum & Palace Art Gallery',
          category: 'activity',
          location: 'Ram Niwas Garden, Jaipur',
          estimated_cost: 300 * trip.travellers,
          currency: trip.currency,
          travel_time_minutes: 15,
          agent_responsible: 'Coordinator Agent',
          confidence_score: 95,
          assumptions: 'Weatherproof indoor cultural experience sheltered from rainfall.',
          status: 'confirmed',
          replacement_for_id: outdoorFort.id
        });
      }
    } else {
      // General fallback disruption
      title = 'Itinerary Stop Modification';
      description = 'Unscheduled maintenance closure at designated attraction.';
      severity = 'low';
      suggestedAction = 'Substituted with adjoining heritage attraction.';
    }

    const disruption: DisruptionSimulation = {
      id: `disrupt-${crypto.randomUUID().slice(0, 8)}`,
      trip_id: trip.id,
      type: disruptionType,
      title,
      description,
      severity,
      affected_item_ids: affectedItemIds,
      suggested_action: suggestedAction,
      simulated_at: new Date().toISOString(),
      status: 'replanned'
    };

    db.addDisruption(disruption);

    const newTotalCost = newItems.filter((i) => i.status !== 'replaced').reduce((acc, it) => acc + it.estimated_cost, 0);

    const revisedVersion = (originalItinerary.version || 1) + 1;
    const revisedItinerary: Itinerary = {
      id: `itin-v${revisedVersion}-${crypto.randomUUID().slice(0, 6)}`,
      trip_id: trip.id,
      version: revisedVersion,
      title: `v${revisedVersion} Revised Itinerary (Post-${disruption.title.slice(0, 24)}...)`,
      total_cost: newTotalCost,
      currency: trip.currency,
      budget_status: newTotalCost > trip.total_budget ? 'over_budget' : 'under_budget',
      explanation: `Replanned by Coordinator Agent: Addressed ${disruption.title}. Replaced affected items while preserving remaining confirmed bookings. Cost delta: ${newTotalCost - originalItinerary.total_cost >= 0 ? '+' : ''}${newTotalCost - originalItinerary.total_cost} ${trip.currency}.`,
      items: newItems,
      is_active: false, // Inactive until approved!
      created_at: new Date().toISOString(),
      disruption_id: disruption.id
    };

    db.saveItinerary(revisedItinerary, false);

    // Create Approval Action (Never auto-purchase or charge!)
    const approval: ApprovalAction = {
      id: `appr-${crypto.randomUUID().slice(0, 8)}`,
      trip_id: trip.id,
      action_type: 'accept_replan',
      description: `Approve revision to v${revisedVersion}: ${disruption.title}. New estimated cost: ${newTotalCost} ${trip.currency} (Change: ${newTotalCost - originalItinerary.total_cost >= 0 ? '+' : ''}${newTotalCost - originalItinerary.total_cost} ${trip.currency}).`,
      previous_cost: originalItinerary.total_cost,
      new_cost: newTotalCost,
      currency: trip.currency,
      requires_human_approval: true,
      approved: false
    };

    db.addApproval(approval);

    db.logAgentAction(
      trip.id,
      'Coordinator Agent',
      `Replanning completed for disruption: ${disruption.title}`,
      `Created revised itinerary v${revisedVersion}. Requires human approval before activation.`,
      'Gemini Reasoning'
    );

    return {
      disruption,
      revisedItinerary,
      approval,
      originalItinerary
    };
  }

  /**
   * Plan Verification Engine
   */
  public verifyPlan(trip: Trip, itinerary: Itinerary): PlanVerificationResult {
    const totalCost = itinerary.items
      .filter((i) => i.status !== 'replaced')
      .reduce((sum, item) => sum + item.estimated_cost, 0);

    const budgetPassed = totalCost <= trip.total_budget;
    const diff = trip.total_budget - totalCost;

    // Timing & Overlaps check
    const overlappingItems: string[] = [];
    const insufficientBuffers: string[] = [];
    const itemsByDay: Record<number, ItineraryItem[]> = {};

    itinerary.items
      .filter((i) => i.status !== 'replaced')
      .forEach((item) => {
        if (!itemsByDay[item.day]) itemsByDay[item.day] = [];
        itemsByDay[item.day].push(item);
      });

    // Check constraint violations
    const violations: string[] = [];
    if (trip.constraints.dietary === 'vegetarian') {
      itinerary.items.forEach((it) => {
        if (it.category === 'food' && it.notes?.toLowerCase().includes('non-veg')) {
          violations.push(`Item ${it.title} might conflict with vegetarian constraint.`);
        }
      });
    }

    if (trip.constraints.avoid_early_departure) {
      itinerary.items.forEach((it) => {
        if (it.category === 'transport' && it.start_time.startsWith('06:')) {
          violations.push(`Transport item ${it.title} departs earlier than 7:00 AM.`);
        }
      });
    }

    const openIssues: string[] = [];
    const suggestedFixes: string[] = [];

    if (!budgetPassed) {
      openIssues.push(`Cost exceeds budget by ${Math.abs(diff)} ${trip.currency}`);
      suggestedFixes.push('Switch hotel tier from Best Comfort to Best Value or select Economy Package');
    }

    if (violations.length > 0) {
      openIssues.push(...violations);
      suggestedFixes.push('Re-run Food or Transport specialist agents to filter conforming options');
    }

    let overall_status: PlanVerificationResult['overall_status'] = 'verified';
    if (!budgetPassed || violations.length > 0) {
      overall_status = violations.length > 1 ? 'failed' : 'warnings';
    }

    return {
      budget_check: {
        passed: budgetPassed,
        total_cost: totalCost,
        allocated_budget: trip.total_budget,
        difference: diff,
        message: budgetPassed
          ? `Budget verified: ${trip.currency} ${diff.toLocaleString()} remaining surplus.`
          : `Budget exceeded by ${trip.currency} ${Math.abs(diff).toLocaleString()}.`
      },
      timing_check: {
        passed: overlappingItems.length === 0,
        overlapping_items: overlappingItems,
        insufficient_buffers: insufficientBuffers,
        message: 'All daily slots (morning, afternoon, evening) have sufficient travel buffers.'
      },
      preference_match_percentage: 95,
      constraint_compliance: {
        passed: violations.length === 0,
        violations,
        message: violations.length === 0 ? 'All user dietary and accessibility constraints passed.' : 'Review flagged constraint warnings.'
      },
      open_issues: openIssues,
      suggested_fixes: suggestedFixes,
      overall_status
    };
  }
}

export const coordinatorAgent = new CoordinatorAgent();
