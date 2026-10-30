/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SIMULATED_ATTRACTIONS,
  SIMULATED_RESTAURANTS,
  EMERGENCY_SERVICES,
  DESTINATIONS_METADATA
} from '../../src/data/simulatedData.js';
import { NearbyPlace, TripConstraints, TripPreferences } from '../../src/types/travel.js';

export class ExplorationAgent {
  public getNearbyPlaces(
    destination: string,
    preferences?: TripPreferences,
    constraints?: TripConstraints,
    _userCoordinates?: { lat: number; lng: number }
  ): NearbyPlace[] {
    const destMeta = DESTINATIONS_METADATA[destination] || DESTINATIONS_METADATA['Jaipur'];
    const places: NearbyPlace[] = [];

    // 1. Attractions
    const attractions = SIMULATED_ATTRACTIONS.filter(
      (a) => a.destination.toLowerCase() === destination.toLowerCase()
    );
    attractions.forEach((a) => {
      let fitsPref = true;
      if (preferences) {
        if (preferences.heritage && a.category === 'heritage') fitsPref = true;
        if (preferences.shopping && a.category === 'shopping') fitsPref = true;
      }

      let fitsAccess = true;
      if (constraints?.wheelchair_access && !a.wheelchair_access) {
        fitsAccess = false;
      }

      places.push({
        id: a.id,
        destination_id: destination,
        name: a.name,
        category: a.category === 'shopping' ? 'shopping' : a.category === 'culture' ? 'culture' : 'attraction',
        photo: a.photo,
        rating: a.rating,
        price_level: a.entry_fee_inr === 0 ? 1 : a.entry_fee_inr < 300 ? 2 : 3,
        approx_cost: a.entry_fee_inr,
        currency: 'INR',
        opening_hours: a.opening_hours,
        distance_km: Math.round((Math.hypot(a.coordinates.lat - destMeta.coordinates.lat, a.coordinates.lng - destMeta.coordinates.lng) * 111) * 10) / 10,
        travel_time_minutes: Math.round(10 + Math.random() * 20),
        description: a.description,
        fits_preferences: fitsPref,
        fits_dietary: true,
        fits_accessibility: fitsAccess,
        weather_suitable: true,
        coordinates: a.coordinates,
        address: a.location,
        is_live_data: false
      });
    });

    // 2. Restaurants
    const restaurants = SIMULATED_RESTAURANTS.filter(
      (r) => r.destination.toLowerCase() === destination.toLowerCase()
    );
    restaurants.forEach((r) => {
      let fitsDiet = true;
      if (constraints?.dietary && constraints.dietary !== 'none') {
        if (constraints.dietary === 'vegetarian' && !r.pure_veg && !r.dietary.includes('vegetarian')) fitsDiet = false;
        if (constraints.dietary === 'vegan' && !r.dietary.includes('vegan')) fitsDiet = false;
      }

      places.push({
        id: r.id,
        destination_id: destination,
        name: r.name,
        category: 'food',
        photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        rating: r.rating,
        price_level: r.price_per_person_inr < 400 ? 1 : r.price_per_person_inr < 1000 ? 2 : 3,
        approx_cost: r.price_per_person_inr,
        currency: 'INR',
        opening_hours: r.opening_hours,
        distance_km: r.distance_km,
        travel_time_minutes: Math.round(r.distance_km * 3 + 5),
        description: `${r.cuisine}. Signature dish: ${r.signature_dish}. Pure veg: ${r.pure_veg ? 'Yes' : 'No'}.`,
        fits_preferences: true,
        fits_dietary: fitsDiet,
        fits_accessibility: r.wheelchair_access,
        weather_suitable: true,
        coordinates: r.coordinates,
        address: r.location,
        is_live_data: false
      });
    });

    // 3. Emergency & Essential Services
    const emergencies = EMERGENCY_SERVICES.filter(
      (e) => e.destination.toLowerCase() === destination.toLowerCase()
    );
    emergencies.forEach((e) => {
      places.push({
        id: e.id,
        destination_id: destination,
        name: e.name,
        category: 'emergency',
        photo: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        price_level: 1,
        approx_cost: 0,
        currency: 'INR',
        opening_hours: 'Open 24/7 (Emergency Response)',
        distance_km: 1.5,
        travel_time_minutes: 8,
        description: `Official emergency support (${e.category.toUpperCase()}). Emergency Hotline: ${e.phone}.`,
        fits_preferences: true,
        fits_dietary: true,
        fits_accessibility: true,
        weather_suitable: true,
        coordinates: e.coordinates,
        address: e.address,
        is_live_data: false
      });
    });

    return places;
  }
}

export const explorationAgent = new ExplorationAgent();
