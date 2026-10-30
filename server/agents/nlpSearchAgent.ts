/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient } from './geminiClient.js';
import {
  SIMULATED_ATTRACTIONS,
  SIMULATED_HOTELS,
  SIMULATED_RESTAURANTS
} from '../../src/data/simulatedData.js';

export interface NLPSearchResult {
  query: string;
  matched_items: {
    id: string;
    name: string;
    category: 'hotel' | 'restaurant' | 'attraction';
    location: string;
    coordinates?: { lat: number; lng: number };
    price_info: string;
    rating: number;
    match_reason: string;
    tags: string[];
    photo?: string;
  }[];
  ai_summary: string;
}

export class NLPSearchAgent {
  public async search(query: string, destination = 'Jaipur'): Promise<NLPSearchResult> {
    const ai = getGeminiClient();
    const queryLower = query.toLowerCase();

    // Prepare unified catalog for semantic lookup
    const allAttractions = SIMULATED_ATTRACTIONS.filter(
      (a) => !destination || a.destination.toLowerCase() === destination.toLowerCase()
    );
    const allRestaurants = SIMULATED_RESTAURANTS.filter(
      (r) => !destination || r.destination.toLowerCase() === destination.toLowerCase()
    );
    const allHotels = SIMULATED_HOTELS.filter(
      (h) => !destination || h.destination.toLowerCase() === destination.toLowerCase()
    );

    // If Gemini is available, query Gemini to reason and pick best items
    if (ai) {
      try {
        const catalogSummary = [
          ...allAttractions.map((a) => ({
            id: a.id,
            name: a.name,
            category: 'attraction' as const,
            location: a.location,
            desc: a.description,
            price: `₹${a.entry_fee_inr}`,
            rating: a.rating,
            tags: [a.category, a.wheelchair_access ? 'wheelchair-accessible' : 'steps']
          })),
          ...allRestaurants.map((r) => ({
            id: r.id,
            name: r.name,
            category: 'restaurant' as const,
            location: r.location,
            desc: `${r.cuisine}, ${r.signature_dish}`,
            price: `₹${r.price_per_person_inr}/person`,
            rating: r.rating,
            tags: [...r.dietary, r.pure_veg ? 'pure-veg' : 'non-veg', r.wheelchair_access ? 'accessible' : '']
          })),
          ...allHotels.map((h) => ({
            id: h.id,
            name: h.name,
            category: 'hotel' as const,
            location: h.location,
            desc: `${h.tier} hotel with ${h.amenities.join(', ')}`,
            price: `₹${h.price_per_night_inr}/night`,
            rating: h.rating,
            tags: [h.tier, ...h.amenities]
          }))
        ];

        const prompt = `You are the TripSense AI Location Search Assistant.
The user asked: "${query}" in destination: "${destination}".
Analyze the catalog items below and find up to 4 top matching places that best satisfy the user's intent (e.g. food restrictions, atmosphere, budget, accessibility, view, location).

Catalog:
${JSON.stringify(catalogSummary.slice(0, 25))}

Return JSON format with:
{
  "summary": "1-2 sentence friendly explanation of the best matches",
  "matches": [
    {
      "id": "item-id",
      "match_reason": "Specific reason why this fulfills their natural language query"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const raw = response.text;
        if (raw) {
          const parsed = JSON.parse(raw);
          const matched_items: NLPSearchResult['matched_items'] = [];

          for (const m of parsed.matches || []) {
            const attr = allAttractions.find((a) => a.id === m.id);
            if (attr) {
              matched_items.push({
                id: attr.id,
                name: attr.name,
                category: 'attraction',
                location: attr.location,
                coordinates: attr.coordinates,
                price_info: `₹${attr.entry_fee_inr} entry`,
                rating: attr.rating,
                match_reason: m.match_reason || 'Matches your travel interest',
                tags: [attr.category, attr.wheelchair_access ? 'Accessible' : 'Historic steps'],
                photo: attr.photo
              });
              continue;
            }
            const rest = allRestaurants.find((r) => r.id === m.id);
            if (rest) {
              matched_items.push({
                id: rest.id,
                name: rest.name,
                category: 'restaurant',
                location: rest.location,
                coordinates: rest.coordinates,
                price_info: `₹${rest.price_per_person_inr}/person`,
                rating: rest.rating,
                match_reason: m.match_reason || 'Matches your culinary preference',
                tags: [...rest.dietary, rest.pure_veg ? 'Pure Veg' : 'Multi-cuisine']
              });
              continue;
            }
            const hotel = allHotels.find((h) => h.id === m.id);
            if (hotel) {
              matched_items.push({
                id: hotel.id,
                name: hotel.name,
                category: 'hotel',
                location: hotel.location,
                coordinates: hotel.coordinates,
                price_info: `₹${hotel.price_per_night_inr}/night`,
                rating: hotel.rating,
                match_reason: m.match_reason || 'Matches your stay preferences',
                tags: [hotel.tier.replace('_', ' '), ...hotel.amenities.slice(0, 3)]
              });
            }
          }

          if (matched_items.length > 0) {
            return {
              query,
              matched_items,
              ai_summary: parsed.summary || `Found ${matched_items.length} great places matching your request.`
            };
          }
        }
      } catch (err) {
        console.warn('Gemini NLP search fallback to rule matcher:', err);
      }
    }

    // Fallback: Intelligent Keyword & Intent Matching
    const matched_items: NLPSearchResult['matched_items'] = [];

    // Check restaurants
    for (const r of allRestaurants) {
      let score = 0;
      if (queryLower.includes('veg') && (r.pure_veg || r.dietary.includes('vegetarian'))) score += 3;
      if (queryLower.includes('vegan') && r.dietary.includes('vegan')) score += 3;
      if (queryLower.includes('rooftop') && (r.name.toLowerCase().includes('rooftop') || r.location.toLowerCase().includes('rooftop'))) score += 4;
      if (queryLower.includes('dinner') && (r.meal_type === 'dinner' || r.meal_type === 'all')) score += 2;
      if (queryLower.includes('breakfast') && (r.meal_type === 'breakfast' || r.meal_type === 'all')) score += 2;
      if (queryLower.includes('kachori') && (r.signature_dish.toLowerCase().includes('kachori') || r.name.toLowerCase().includes('kachori'))) score += 5;
      if (queryLower.includes('romantic') && (r.name.includes('Peacock') || r.name.includes('Suvarna'))) score += 4;
      if (queryLower.includes('accessible') && r.wheelchair_access) score += 3;

      if (score >= 3) {
        matched_items.push({
          id: r.id,
          name: r.name,
          category: 'restaurant',
          location: r.location,
          coordinates: r.coordinates,
          price_info: `₹${r.price_per_person_inr}/person`,
          rating: r.rating,
          match_reason: `Recommended for ${r.signature_dish} (${r.cuisine}) with ${r.pure_veg ? '100% pure veg kitchen' : 'specialty menu'}.`,
          tags: [...r.dietary, r.pure_veg ? 'Pure Veg' : 'Multi-cuisine']
        });
      }
    }

    // Check attractions
    for (const a of allAttractions) {
      let score = 0;
      if (queryLower.includes('heritage') && a.category === 'heritage') score += 3;
      if (queryLower.includes('fort') && a.name.toLowerCase().includes('fort')) score += 4;
      if (queryLower.includes('palace') && a.name.toLowerCase().includes('palace')) score += 4;
      if (queryLower.includes('sunset') && a.category === 'viewpoint') score += 4;
      if (queryLower.includes('view') && a.category === 'viewpoint') score += 3;
      if (queryLower.includes('museum') && a.indoor) score += 3;
      if (queryLower.includes('shopping') && a.category === 'shopping') score += 4;
      if (queryLower.includes('accessible') && a.wheelchair_access) score += 3;

      if (score >= 3) {
        matched_items.push({
          id: a.id,
          name: a.name,
          category: 'attraction',
          location: a.location,
          coordinates: a.coordinates,
          price_info: a.entry_fee_inr === 0 ? 'Free Entry' : `₹${a.entry_fee_inr} entry`,
          rating: a.rating,
          match_reason: `${a.description.slice(0, 110)}...`,
          tags: [a.category, a.wheelchair_access ? 'Step-Free / Ramp' : 'Historic stairs'],
          photo: a.photo
        });
      }
    }

    // Check hotels
    for (const h of allHotels) {
      let score = 0;
      if (queryLower.includes('hotel') || queryLower.includes('stay') || queryLower.includes('resort')) score += 1;
      if (queryLower.includes('budget') && h.tier === 'lowest_cost') score += 3;
      if (queryLower.includes('luxury') && h.tier === 'best_comfort') score += 3;
      if (queryLower.includes('heritage') && h.name.toLowerCase().includes('heritage')) score += 3;
      if (queryLower.includes('accessible') && h.accessibility) score += 3;

      if (score >= 3) {
        matched_items.push({
          id: h.id,
          name: h.name,
          category: 'hotel',
          location: h.location,
          coordinates: h.coordinates,
          price_info: `₹${h.price_per_night_inr}/night`,
          rating: h.rating,
          match_reason: `${h.tier.replace('_', ' ').toUpperCase()} accommodation: ${h.amenities.slice(0, 3).join(', ')}.`,
          tags: [h.tier, ...h.amenities.slice(0, 2)]
        });
      }
    }

    const finalMatches = matched_items.slice(0, 4);

    return {
      query,
      matched_items: finalMatches.length > 0 ? finalMatches : [
        {
          id: allAttractions[0]?.id || 'attr-fallback',
          name: allAttractions[0]?.name || 'Amber Fort & Palace',
          category: 'attraction',
          location: allAttractions[0]?.location || 'Amer, Jaipur',
          coordinates: allAttractions[0]?.coordinates,
          price_info: '₹550 entry',
          rating: 4.8,
          match_reason: 'Top recommended highlight matching your destination exploration interest.',
          tags: ['Heritage', 'Highlight']
        }
      ],
      ai_summary: `Identified ${finalMatches.length} tailored recommendations for "${query}".`
    };
  }
}

export const nlpSearchAgent = new NLPSearchAgent();
