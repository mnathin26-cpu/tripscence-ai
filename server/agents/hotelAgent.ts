/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SIMULATED_HOTELS, SimulatedHotel } from '../../src/data/simulatedData.js';
import { SpecialistOption, TripConstraints, TripPreferences } from '../../src/types/travel.js';

export class HotelAgent {
  public evaluateHotels(
    destination: string,
    nights: number,
    totalBudget: number,
    preferences: TripPreferences,
    constraints: TripConstraints,
    requestedStyle: string
  ): {
    selected: SpecialistOption;
    options: SpecialistOption[];
  } {
    // Filter hotels for the destination
    let available = SIMULATED_HOTELS.filter(
      (h) => h.destination.toLowerCase() === destination.toLowerCase()
    );

    if (available.length === 0) {
      available = SIMULATED_HOTELS;
    }

    // Convert each hotel into structured SpecialistOption
    const options: SpecialistOption[] = available.map((hotel) => {
      const totalPrice = hotel.price_per_night_inr * nights;

      // Calculate constraint compliance
      const violations: string[] = [];
      if (constraints.non_smoking_rooms && !hotel.non_smoking) {
        violations.push('Smoking permitted in sections');
      }
      if (constraints.wheelchair_access && !hotel.accessibility) {
        violations.push('Lacks elevator / step-free ramp');
      }
      if (constraints.pet_allowed && !hotel.pet_friendly) {
        violations.push('Pets not permitted');
      }

      let complianceStatus: SpecialistOption['constraint_compliance_status'] = 'compliant';
      if (violations.length > 0) {
        complianceStatus = violations.length === 1 ? 'minor_warning' : 'non_compliant';
      }

      // Calculate preference match score
      let matchScore = 75;
      if (preferences.heritage && hotel.name.toLowerCase().includes('heritage')) matchScore += 15;
      if (preferences.accessibility && hotel.accessibility) matchScore += 10;
      if (hotel.rating >= 4.7) matchScore += 10;
      if (totalPrice > totalBudget * 0.6) matchScore -= 20;
      matchScore = Math.min(100, Math.max(20, matchScore));

      const pros = [...hotel.pros];
      const cons = [...hotel.cons];
      if (violations.length > 0) {
        cons.push(`Constraint note: ${violations.join(', ')}`);
      }

      return {
        id: hotel.id,
        option_name: hotel.name,
        category: 'Hotel Accommodation',
        price: totalPrice,
        currency: 'INR',
        duration_or_stay: `${nights} nights (₹${hotel.price_per_night_inr}/night)`,
        location: hotel.location,
        coordinates: hotel.coordinates,
        rating: hotel.rating,
        pros,
        cons,
        preference_match_score: matchScore,
        constraint_compliance_status: complianceStatus,
        reasoning: `${hotel.tier.replace('_', ' ').toUpperCase()} option: Located ${hotel.distance_from_center_km} km from central heritage circuit with ${hotel.rating}★ rating. ${hotel.cancellation_policy}.`,
        alternatives: [],
        tier: hotel.tier
      };
    });

    // Sort to find lowest cost, best value, and best comfort
    const lowestCost = [...options].sort((a, b) => a.price - b.price)[0] || options[0];
    const bestValue = options.find((o) => o.tier === 'best_value') || options[0];
    const bestComfort = options.find((o) => o.tier === 'best_comfort') || options[options.length - 1];

    // Populate alternatives for each
    const tierOptions = [lowestCost, bestValue, bestComfort].filter(Boolean);
    tierOptions.forEach((opt) => {
      opt.alternatives = tierOptions
        .filter((o) => o.id !== opt.id)
        .map((o) => ({
          name: o.option_name,
          price: o.price,
          reason: `${o.tier?.replace('_', ' ')} alternative (₹${o.price})`
        }));
    });

    let selected = bestValue;
    if (requestedStyle === 'budget') selected = lowestCost;
    if (requestedStyle === 'luxury' || requestedStyle === 'comfort') {
      selected = requestedStyle === 'luxury' ? bestComfort : bestValue;
    }

    return {
      selected,
      options: tierOptions
    };
  }

  public getAlternativeForUnavailableHotel(
    currentHotelId: string,
    destination: string,
    nightsRemaining: number,
    maxBudgetPerNight: number
  ): SpecialistOption {
    const candidates = SIMULATED_HOTELS.filter(
      (h) =>
        h.destination.toLowerCase() === destination.toLowerCase() &&
        h.id !== currentHotelId &&
        h.price_per_night_inr <= maxBudgetPerNight * 1.2
    ).sort((a, b) => b.rating - a.rating);

    const replacement = candidates[0] || SIMULATED_HOTELS[1];
    const price = replacement.price_per_night_inr * nightsRemaining;

    return {
      id: replacement.id,
      option_name: `${replacement.name} (Replacement Stay)`,
      category: 'Hotel Accommodation',
      price,
      currency: 'INR',
      duration_or_stay: `${nightsRemaining} night(s) emergency replacement`,
      location: replacement.location,
      coordinates: replacement.coordinates,
      rating: replacement.rating,
      pros: ['Immediate room availability confirmed', ...replacement.pros],
      cons: ['Requires luggage relocation between properties'],
      preference_match_score: 91,
      constraint_compliance_status: 'compliant',
      reasoning: `Replanned hotel booking: Selected high-rated ${replacement.name} nearby to seamlessly complete the stay without leaving the central zone.`,
      alternatives: [],
      tier: replacement.tier
    };
  }
}

export const hotelAgent = new HotelAgent();
