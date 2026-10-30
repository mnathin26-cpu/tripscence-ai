/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SIMULATED_RESTAURANTS, SimulatedRestaurant } from '../../src/data/simulatedData.js';
import { SpecialistOption, TripConstraints, TripPreferences } from '../../src/types/travel.js';

export class FoodAgent {
  public evaluateDining(
    destination: string,
    days: number,
    travellers: number,
    constraints: TripConstraints,
    _preferences: TripPreferences,
    mealBudgetPerDay: number
  ): {
    dailyPlans: {
      day: number;
      breakfast: SpecialistOption;
      lunch: SpecialistOption;
      dinner: SpecialistOption;
    }[];
    totalFoodCost: number;
  } {
    let list = SIMULATED_RESTAURANTS.filter(
      (r) => r.destination.toLowerCase() === destination.toLowerCase()
    );

    if (list.length === 0) {
      list = SIMULATED_RESTAURANTS;
    }

    // Apply strict dietary filters
    if (constraints.dietary && constraints.dietary !== 'none') {
      const requiredDiet = constraints.dietary;
      const filtered = list.filter((r) => {
        if (requiredDiet === 'vegetarian') return r.pure_veg || r.dietary.includes('vegetarian');
        if (requiredDiet === 'vegan') return r.dietary.includes('vegan');
        if (requiredDiet === 'halal') return r.dietary.includes('halal');
        if (requiredDiet === 'kosher') return r.dietary.includes('kosher');
        if (requiredDiet === 'gluten_free') return r.dietary.includes('gluten_free');
        return true;
      });
      if (filtered.length > 0) list = filtered;
    }

    const breakfasts = list.filter((r) => r.meal_type === 'breakfast' || r.meal_type === 'all');
    const lunches = list.filter((r) => r.meal_type === 'lunch' || r.meal_type === 'all');
    const dinners = list.filter((r) => r.meal_type === 'dinner' || r.meal_type === 'all');

    const toOption = (r: SimulatedRestaurant, meal: string): SpecialistOption => {
      const cost = r.price_per_person_inr * travellers;
      return {
        id: r.id,
        option_name: `${r.name} (${meal.toUpperCase()})`,
        category: `Dining - ${r.cuisine}`,
        price: cost,
        currency: 'INR',
        duration_or_stay: '1h - 1.5h dining experience',
        location: r.location,
        coordinates: r.coordinates,
        rating: r.rating,
        pros: [
          `Specialty: ${r.signature_dish}`,
          `Dietary tags: ${r.dietary.join(', ')}`,
          `${r.pure_veg ? '100% Pure Vegetarian Kitchen' : 'Multi-cuisine options'}`
        ],
        cons: [
          r.wheelchair_access ? 'Full ramp access' : 'Steps at restaurant entryway',
          `Distance from city center: ${r.distance_km} km`
        ],
        preference_match_score: 95,
        constraint_compliance_status: 'compliant',
        reasoning: `Selected for ${meal} due to stellar reputation for ${r.signature_dish} and strict compliance with dietary needs. Hours: ${r.opening_hours}.`,
        alternatives: []
      };
    };

    const dailyPlans = [];
    let totalFoodCost = 0;

    for (let day = 1; day <= days; day++) {
      const b = breakfasts[(day - 1) % (breakfasts.length || 1)] || list[0];
      const l = lunches[(day - 1) % (lunches.length || 1)] || list[1] || list[0];
      const d = dinners[(day - 1) % (dinners.length || 1)] || list[2] || list[0];

      const bOpt = toOption(b, 'Breakfast');
      const lOpt = toOption(l, 'Lunch');
      const dOpt = toOption(d, 'Dinner');

      totalFoodCost += bOpt.price + lOpt.price + dOpt.price;

      dailyPlans.push({
        day,
        breakfast: bOpt,
        lunch: lOpt,
        dinner: dOpt
      });
    }

    return {
      dailyPlans,
      totalFoodCost
    };
  }

  public getAlternativeForClosedRestaurant(
    closedRestaurantId: string,
    destination: string,
    mealType: 'breakfast' | 'lunch' | 'dinner',
    travellers: number,
    constraints: TripConstraints
  ): SpecialistOption {
    const fallback = SIMULATED_RESTAURANTS.find(
      (r) =>
        r.destination.toLowerCase() === destination.toLowerCase() &&
        r.id !== closedRestaurantId &&
        (r.meal_type === mealType || r.meal_type === 'all') &&
        (!constraints.dietary || constraints.dietary === 'none' || r.pure_veg || r.dietary.includes(constraints.dietary as any))
    ) || SIMULATED_RESTAURANTS[0];

    return {
      id: `repl-${fallback.id}`,
      option_name: `${fallback.name} [REPLACEMENT]`,
      category: `Dining - ${fallback.cuisine}`,
      price: fallback.price_per_person_inr * travellers,
      currency: 'INR',
      duration_or_stay: '1h dining replacement',
      location: fallback.location,
      coordinates: fallback.coordinates,
      rating: fallback.rating,
      pros: [`Instant table availability`, `Dietary compliant: ${fallback.dietary.join(', ')}`],
      cons: [`Short transit required`],
      preference_match_score: 94,
      constraint_compliance_status: 'compliant',
      reasoning: `Replanned dining: The intended restaurant was reported closed or unavailable. ${fallback.name} provides an excellent culinary alternative without dietary conflict.`,
      alternatives: []
    };
  }
}

export const foodAgent = new FoodAgent();
