/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DestinationWeather, DailyForecast, HourlyForecast, WeatherCondition } from '../../src/types/travel.js';

export class WeatherAgent {
  public getWeatherForDestination(destination: string): DestinationWeather {
    const isJaipur = destination.toLowerCase().includes('jaipur');
    const isDelhi = destination.toLowerCase().includes('delhi');
    const isGoa = destination.toLowerCase().includes('goa');
    const isManali = destination.toLowerCase().includes('manali');

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';

    let current: WeatherCondition;
    let climateOverview: string;
    let packingSuggestions: string[];
    let itineraryAdvice: string;
    let baseTemp = 28;

    if (isJaipur) {
      baseTemp = 27;
      current = {
        timestamp,
        temperature_c: 27,
        feels_like_c: 28,
        humidity_percent: 38,
        wind_kmh: 12,
        visibility_km: 9,
        uv_index: 6,
        precipitation_chance: 5,
        weather_description: 'Pleasant & Sunny with Gentle Breeze',
        weather_icon: 'sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Dry subtropical autumn weather with pleasant golden sunlight, low humidity, and cool evenings around 16°C.';
      packingSuggestions = [
        'Light cotton daytime wear',
        'Light shawl or jacket for breezy evening rooftop dining',
        'UV sunglasses & broad-spectrum sunscreen',
        'Comfortable walking shoes with rubber grip for stone forts'
      ];
      itineraryAdvice = 'Outstanding outdoor weather. Ideal for visiting Amber Fort and Nahargarh sunset in morning and late afternoon.';
    } else if (isDelhi) {
      baseTemp = 29;
      current = {
        timestamp,
        temperature_c: 29,
        feels_like_c: 30,
        humidity_percent: 45,
        wind_kmh: 9,
        visibility_km: 7,
        uv_index: 5,
        precipitation_chance: 10,
        weather_description: 'Hazy Sunshine with Mild Warmth',
        weather_icon: 'haze',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Mild continental autumn climate with warm sunny afternoons and moderate morning mist.';
      packingSuggestions = [
        'Breathable daytime apparel',
        'N95 mask for transit through congested traffic corridors',
        'Refillable insulated water bottle'
      ];
      itineraryAdvice = 'Schedule outdoor heritage walks at Humayun\'s Tomb and Qutub Minar before noon; visit indoor galleries like National Museum mid-day.';
    } else if (isGoa) {
      baseTemp = 31;
      current = {
        timestamp,
        temperature_c: 31,
        feels_like_c: 35,
        humidity_percent: 74,
        wind_kmh: 16,
        visibility_km: 10,
        uv_index: 8,
        precipitation_chance: 20,
        weather_description: 'Tropical Warmth & Ocean Breeze',
        weather_icon: 'cloud-sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Tropical maritime climate characterized by abundant sunshine, humid ocean breezes, and golden beach hours.';
      packingSuggestions = [
        'Linen shirts & beachwear',
        'Waterproof dry-bag for catamaran and boat trips',
        'Eco-friendly reef-safe sunscreen',
        'Mosquito repellent for sunset garden restaurants'
      ];
      itineraryAdvice = 'Perfect for coastal boat tours and fort sunsets. Keep midday reserved for air-conditioned Latin Quarter cafes.';
    } else if (destination.toLowerCase().includes('paris')) {
      baseTemp = 16;
      current = {
        timestamp,
        temperature_c: 16,
        feels_like_c: 15,
        humidity_percent: 68,
        wind_kmh: 14,
        visibility_km: 10,
        uv_index: 4,
        precipitation_chance: 25,
        weather_description: 'Crisp Parisian Autumn with Dappled Sun',
        weather_icon: 'cloud-sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Temperate Western European maritime climate with breezy river afternoons, mild mornings around 11°C, and occasional light autumn drizzle.';
      packingSuggestions = [
        'Layered trench coat or wool cardigan',
        'Compact folding umbrella for Parisian drizzle',
        'Stylish comfortable walking sneakers for cobblestone streets',
        'Light scarf for evening Seine river cruises'
      ];
      itineraryAdvice = 'Splendid conditions for outdoor walks in the Tuileries Gardens and Montmartre; reserve the Louvre and Musée d\'Orsay during afternoon hours.';
    } else if (destination.toLowerCase().includes('agra')) {
      baseTemp = 28;
      current = {
        timestamp,
        temperature_c: 28,
        feels_like_c: 29,
        humidity_percent: 42,
        wind_kmh: 8,
        visibility_km: 6,
        uv_index: 6,
        precipitation_chance: 5,
        weather_description: 'Clear Sunny Skies with Morning Yamuna Mist',
        weather_icon: 'sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Subtropical Gangetic plain climate with golden sunrise conditions, warm midday sun, and cool evenings around 15°C.';
      packingSuggestions = [
        'Cotton breathable clothes for daytime monument touring',
        'Light shawl for dawn sunrise visits to the Taj Mahal',
        'Sunglasses & hat for exposed marble courtyard walks'
      ];
      itineraryAdvice = 'Arrive at Taj Mahal for sunrise (06:15 AM) for magical golden light and minimal crowds; visit shaded Agra Fort palaces in early afternoon.';
    } else if (destination.toLowerCase().includes('tamil') || destination.toLowerCase().includes('madurai') || destination.toLowerCase().includes('chennai')) {
      baseTemp = 30;
      current = {
        timestamp,
        temperature_c: 30,
        feels_like_c: 34,
        humidity_percent: 72,
        wind_kmh: 14,
        visibility_km: 9,
        uv_index: 8,
        precipitation_chance: 15,
        weather_description: 'Warm & Tropical with Gentle Temple Breeze',
        weather_icon: 'sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Tropical peninsular climate characterized by warm daytime temperatures, soft evening sea/inland breezes, and lush post-monsoon greenery.';
      packingSuggestions = [
        'Modest lightweight cotton apparel (shoulders & knees covered for temples)',
        'Socks for hot temple stone courtyards where shoes are removed',
        'Handkerchief or small towel for tropical warmth',
        'Hydrating electrolytes'
      ];
      itineraryAdvice = 'Visit Meenakshi Amman Temple during morning pooja (07:00 AM) or evening lamp ceremonies; avoid midday bare-stone barefoot walking.';
    } else if (destination.toLowerCase().includes('ooty')) {
      baseTemp = 17;
      current = {
        timestamp,
        temperature_c: 17,
        feels_like_c: 16,
        humidity_percent: 65,
        wind_kmh: 15,
        visibility_km: 8,
        uv_index: 6,
        precipitation_chance: 30,
        weather_description: 'Chilly Hill Station Mist with Eucalyptus Breeze',
        weather_icon: 'cloud-sun',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'High-altitude sub-tropical highland climate with crisp mountain air, cool nights dropping to 8°C, and swirling Nilgiri tea-garden mists.';
      packingSuggestions = [
        'Warm fleece jacket or wool sweater for evenings',
        'Light windbreaker for open Toy Train windows',
        'Sturdy walking shoes for botanical garden slopes'
      ];
      itineraryAdvice = 'Ride the Nilgiri steam toy train in the morning for clearest mountain valley views before afternoon fog banks roll in.';
    } else {
      // Mountainous (e.g. Manali or fallback)
      baseTemp = 14;
      current = {
        timestamp,
        temperature_c: 14,
        feels_like_c: 13,
        humidity_percent: 62,
        wind_kmh: 18,
        visibility_km: 8,
        uv_index: 7,
        precipitation_chance: 45,
        weather_description: 'Chilly Mountain Air with Passing Showers',
        weather_icon: 'cloud-rain',
        source: 'Google Maps Platform Weather API (Simulated Provider)',
        is_live: false
      };
      climateOverview = 'Alpine mountain terrain with crisp high-altitude air, sharp temperature drops after twilight, and localized rain/snow at higher passes.';
      packingSuggestions = [
        'Thermal base layers & fleece jacket',
        'Windproof & waterproof outer shell',
        'Sturdy high-traction waterproof hiking boots',
        'Emergency rain poncho & offline navigation maps'
      ];
      itineraryAdvice = 'Monitor mountain pass weather closely before trekking. Complete passes before 15:00 to avoid cold front drops.';
    }

    // Build 24h hourly forecast
    const hourly: HourlyForecast[] = [];
    for (let i = 0; i < 24; i += 2) {
      const hourVal = (now.getHours() + i) % 24;
      const hourStr = `${hourVal.toString().padStart(2, '0')}:00`;
      const tempDelta = Math.sin((hourVal - 6) / 4) * 4;
      hourly.push({
        time: hourStr,
        temperature_c: Math.round(baseTemp + tempDelta),
        condition: i % 8 === 0 && isManali ? 'Passing Drizzle' : 'Clear / Part Cloud',
        precipitation_chance: isManali ? Math.min(70, 20 + i * 2) : Math.min(25, 5 + (i % 6)),
        wind_kmh: Math.round(10 + Math.random() * 8)
      });
    }

    // Build 10-day daily forecast
    const daily: DailyForecast[] = [];
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let d = 0; d < 10; d++) {
      const targetDate = new Date(now.getTime() + d * 86400000);
      const dayName = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : daysArr[targetDate.getDay()];
      const dateStr = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const rainProb = isManali ? (d % 3 === 0 ? 60 : 25) : 5 + (d * 3) % 20;

      daily.push({
        date: dateStr,
        day_name: dayName,
        temp_min_c: Math.round(baseTemp - 8 + (d % 3)),
        temp_max_c: Math.round(baseTemp + 2 - (d % 2)),
        condition: rainProb > 50 ? 'Scattered Rain' : rainProb > 20 ? 'Partly Cloudy' : 'Sunny & Clear',
        precipitation_chance: rainProb,
        recommendation:
          rainProb > 50
            ? 'Carry umbrella, prioritize covered museums'
            : 'Excellent conditions for outdoor sightseeing'
      });
    }

    return {
      destination,
      current,
      hourly,
      daily,
      climate_overview: climateOverview,
      packing_suggestions: packingSuggestions,
      itinerary_advice: itineraryAdvice
    };
  }
}

export const weatherAgent = new WeatherAgent();
