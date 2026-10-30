/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SIMULATED_TRANSPORTS, SimulatedTransport } from '../../src/data/simulatedData.js';
import { SpecialistOption, TripConstraints, TripPreferences } from '../../src/types/travel.js';

export class TransportAgent {
  public evaluateIntercityTransport(
    origin: string,
    destination: string,
    travellers: number,
    totalBudget: number,
    constraints: TripConstraints,
    _preferences: TripPreferences,
    requestedStyle: string
  ): {
    outbound: SpecialistOption;
    returnTrip: SpecialistOption;
    localTransitPackage: SpecialistOption;
    allOptions: SpecialistOption[];
  } {
    // Outbound options
    let outboundList = SIMULATED_TRANSPORTS.filter(
      (t) =>
        t.origin.toLowerCase().includes(origin.toLowerCase()) &&
        t.destination.toLowerCase().includes(destination.toLowerCase())
    );

    if (outboundList.length === 0) {
      outboundList = SIMULATED_TRANSPORTS.slice(0, 4);
    }

    // Return options
    let returnList = SIMULATED_TRANSPORTS.filter(
      (t) =>
        t.origin.toLowerCase().includes(destination.toLowerCase()) &&
        t.destination.toLowerCase().includes(origin.toLowerCase())
    );

    if (returnList.length === 0) {
      returnList = outboundList;
    }

    const mapToSpecialistOption = (tr: SimulatedTransport, label: 'Outbound' | 'Return'): SpecialistOption => {
      const totalPrice = tr.price_inr * travellers;
      const violations: string[] = [];

      // Check departure time constraints
      if (constraints.avoid_early_departure) {
        if (tr.departure_time.startsWith('06:') || tr.departure_time.startsWith('05:')) {
          violations.push('Departs before 07:00 AM (Early departure)');
        }
      }

      if (constraints.direct_flights_only && tr.type === 'flight' && tr.stops > 0) {
        violations.push('Non-direct flight with layovers');
      }

      let complianceStatus: SpecialistOption['constraint_compliance_status'] = 'compliant';
      if (violations.length > 0) {
        complianceStatus = violations.length === 1 ? 'minor_warning' : 'non_compliant';
      }

      let matchScore = 80;
      if (tr.carbon_kg < 25) matchScore += 10; // Eco-friendly bonus
      if (violations.length === 0) matchScore += 10;
      if (requestedStyle === 'comfort' && (tr.comfort_level === 'comfort' || tr.comfort_level === 'luxury')) {
        matchScore += 10;
      }
      matchScore = Math.min(100, Math.max(30, matchScore));

      return {
        id: tr.id,
        option_name: `${tr.operator} (${label} ${tr.type.toUpperCase()})`,
        category: `Transport - ${tr.type.toUpperCase()}`,
        price: totalPrice,
        currency: 'INR',
        duration_or_stay: `${Math.floor(tr.duration_minutes / 60)}h ${tr.duration_minutes % 60}m (${tr.departure_time} - ${tr.arrival_time})`,
        location: `${tr.origin} to ${tr.destination}`,
        rating: 4.7,
        pros: [
          `Est. Carbon footprint: ${tr.carbon_kg * travellers} kg CO2`,
          `Baggage allowance: ${tr.luggage_allowance_kg} kg/person`,
          `${tr.stops === 0 ? 'Direct Non-Stop' : `${tr.stops} stops`}`
        ],
        cons: violations.length > 0 ? violations : ['Subject to seasonal track/terminal congestion'],
        preference_match_score: matchScore,
        constraint_compliance_status: complianceStatus,
        reasoning: `${tr.operator}: ${tr.type} travel from ${tr.origin} to ${tr.destination}. Duration: ${tr.duration_minutes} mins. ${tr.cancellation_policy}.`,
        alternatives: []
      };
    };

    const outboundOptions = outboundList.map((t) => mapToSpecialistOption(t, 'Outbound'));
    const returnOptions = returnList.map((t) => mapToSpecialistOption(t, 'Return'));

    // Filter out early morning if constraint is active
    let filteredOutbound = outboundOptions;
    if (constraints.avoid_early_departure) {
      const relaxed = outboundOptions.filter((o) => o.constraint_compliance_status !== 'non_compliant');
      if (relaxed.length > 0) filteredOutbound = relaxed;
    }

    const selectedOutbound = filteredOutbound[0] || outboundOptions[0];
    const selectedReturn = returnOptions[0] || outboundOptions[0];

    // Local Transit Package
    const localTransitPackage: SpecialistOption = {
      id: 'local-transit-pkg',
      option_name: 'Dedicated City Sightseeing Cab & Metro Pass',
      category: 'Local Destination Transport',
      price: 1800 * 3, // ~5,400 INR for full stay
      currency: 'INR',
      duration_or_stay: 'Full Trip Duration (Station pickups + Daily Attraction transfers)',
      location: `${destination} City and Circuit`,
      rating: 4.8,
      pros: [
        'Air-conditioned door-to-door comfort',
        'Includes all toll taxes, parking fees, and driver allowances',
        'Eliminates street haggling and waiting times'
      ],
      cons: ['Slightly higher cost than self-hailing auto rickshaws'],
      preference_match_score: 95,
      constraint_compliance_status: 'compliant',
      reasoning: 'Guarantees reliable timely movement between monuments, restaurants, and hotel without delays.',
      alternatives: [
        { name: 'Self-hail Auto Rickshaws & Metro', price: 1500, reason: 'Budget alternative' },
        { name: 'Self-Drive Rental Car', price: 7200, reason: 'Independent driving alternative' }
      ]
    };

    return {
      outbound: selectedOutbound,
      returnTrip: selectedReturn,
      localTransitPackage,
      allOptions: [...outboundOptions, ...returnOptions]
    };
  }

  public getAlternativeForDisruptedTransport(
    cancelledTransportId: string,
    origin: string,
    destination: string,
    travellers: number,
    disruptionType: 'flight_cancelled' | 'train_delayed' | 'train_cancelled'
  ): SpecialistOption {
    // If a train is cancelled or delayed, provide luxury intercity AC sedan or express bus/train
    const alternatives = SIMULATED_TRANSPORTS.filter(
      (t) =>
        t.origin.toLowerCase().includes(origin.toLowerCase()) &&
        t.destination.toLowerCase().includes(destination.toLowerCase()) &&
        t.id !== cancelledTransportId
    );

    const replacement = alternatives[0] || {
      id: 'alt-cab-direct',
      origin,
      destination,
      type: 'taxi' as const,
      operator: 'Private Intercity Highway Sedan (Express Replanning)',
      departure_time: '16:00 PM (Guaranteed Immediate Dispatch)',
      arrival_time: '20:30 PM (Doorstep Drop)',
      duration_minutes: 270,
      price_inr: 4400,
      stops: 1,
      luggage_allowance_kg: 50,
      carbon_kg: 48,
      comfort_level: 'comfort' as const,
      cancellation_policy: 'Free cancellation up to departure'
    };

    const totalPrice = replacement.type === 'taxi' ? replacement.price_inr : replacement.price_inr * travellers;

    return {
      id: `repl-${replacement.id}`,
      option_name: `${replacement.operator} [REPLACEMENT]`,
      category: `Emergency Transport - ${replacement.type.toUpperCase()}`,
      price: totalPrice,
      currency: 'INR',
      duration_or_stay: `${Math.floor(replacement.duration_minutes / 60)}h ${replacement.duration_minutes % 60}m door-to-door`,
      location: `${replacement.origin} to ${replacement.destination}`,
      rating: 4.8,
      pros: [
        'Guaranteed immediate departure without waiting on delayed schedule',
        'Direct drop at final destination or hotel doorstep',
        'Generous luggage room'
      ],
      cons: [
        disruptionType === 'flight_cancelled'
          ? 'Ground highway travel takes longer than flight'
          : 'Slightly higher fare than original rail ticket'
      ],
      preference_match_score: 92,
      constraint_compliance_status: 'compliant',
      reasoning: `Replanned Transport: The original journey was disrupted by ${disruptionType.replace('_', ' ')}. This option restores travel schedule with minimal delay.`,
      alternatives: []
    };
  }
}

export const transportAgent = new TransportAgent();
