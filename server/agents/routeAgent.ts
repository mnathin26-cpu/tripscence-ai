/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouteCondition } from '../../src/types/travel.js';

export class RouteAgent {
  public getRouteConditions(origin = 'Delhi', destination = 'Jaipur'): RouteCondition {
    const isDelhiJaipur =
      origin.toLowerCase().includes('delhi') && destination.toLowerCase().includes('jaipur');
    const isDelhiAgra =
      (origin.toLowerCase().includes('delhi') && destination.toLowerCase().includes('agra')) ||
      destination.toLowerCase().includes('agra');
    const isParis = destination.toLowerCase().includes('paris');
    const isTamilNadu = destination.toLowerCase().includes('tamil') || destination.toLowerCase().includes('madurai');

    let routePolyline: [number, number][];
    let distance_km = 288;
    let normal_duration_minutes = 270;
    let live_traffic_duration_minutes = 305;
    let congestion_level: RouteCondition['congestion_level'] = 'moderate';
    let roadblocks = [
      {
        description: 'Flyover maintenance and lane narrowing near Manesar junction',
        location: 'NH48 Km 44, Haryana',
        delay_minutes: 22
      }
    ];
    let alternative_routes = [
      {
        id: 'route-ne4-expressway',
        name: 'Delhi-Mumbai Expressway (NE-4) via Sohna & Dausa',
        duration_minutes: 245,
        distance_km: 295,
        tolls_inr: 495,
        savings_minutes: 60,
        reason: 'Brand new 8-lane access-controlled expressway with 120 km/h speed limit. Bypasses all industrial bottlenecks.'
      }
    ];

    if (isDelhiAgra) {
      distance_km = 215;
      normal_duration_minutes = 170;
      live_traffic_duration_minutes = 195;
      congestion_level = 'low';
      roadblocks = [
        {
          description: 'Jewar Airport construction intersection speed regulation',
          location: 'Yamuna Expressway Km 58',
          delay_minutes: 10
        }
      ];
      alternative_routes = [
        {
          id: 'route-ye-expressway',
          name: 'Yamuna 6-Lane Expressway (Direct Non-Stop)',
          duration_minutes: 165,
          distance_km: 210,
          tolls_inr: 415,
          savings_minutes: 30,
          reason: 'Ultra-smooth high-speed access-controlled concrete highway directly entering Agra ring road.'
        }
      ];
      routePolyline = [
        [28.6139, 77.2090], // Delhi Central
        [28.5355, 77.3910], // Noida Toll Gate
        [28.3512, 77.5341], // Greater Noida Zero Point
        [28.1250, 77.6250], // Jewar Interchange
        [27.7850, 77.7210], // Mathura Bypass
        [27.3510, 77.8920], // Khandauli Toll Plaza
        [27.1767, 78.0081]  // Agra Center
      ];
    } else if (isParis) {
      distance_km = 34;
      normal_duration_minutes = 38;
      live_traffic_duration_minutes = 52;
      congestion_level = 'heavy';
      roadblocks = [
        {
          description: 'Porte de la Chapelle morning corridor congestion',
          location: 'A1 Autoroute du Nord Km 12',
          delay_minutes: 14
        }
      ];
      alternative_routes = [
        {
          id: 'route-paris-a3',
          name: 'A3 Autoroute via Porte de Bagnolet & Seine Quays',
          duration_minutes: 42,
          distance_km: 37,
          tolls_inr: 0,
          savings_minutes: 10,
          reason: 'Bypasses northern tunnel slow-downs with panoramic views across the Seine riverbanks.'
        }
      ];
      routePolyline = [
        [49.0097, 2.5479], // CDG Airport
        [48.9512, 2.4410], // Le Bourget
        [48.9050, 2.3610], // Saint-Denis Stade de France
        [48.8867, 2.3431], // Porte de la Chapelle / Montmartre
        [48.8606, 2.3376], // Louvre / Châtelet
        [48.8584, 2.2945]  // Eiffel Tower
      ];
    } else if (isTamilNadu) {
      distance_km = 450;
      normal_duration_minutes = 410;
      live_traffic_duration_minutes = 435;
      congestion_level = 'low';
      roadblocks = [
        {
          description: 'Trichy bypass flyover surface leveling',
          location: 'NH44 Km 312',
          delay_minutes: 12
        }
      ];
      alternative_routes = [
        {
          id: 'route-tn-nh44',
          name: 'NH-44 Four-Lane Golden Quadrilateral Corridor',
          duration_minutes: 395,
          distance_km: 445,
          tolls_inr: 380,
          savings_minutes: 25,
          reason: 'Direct national highway connecting Chennai, Trichy and Madurai with excellent surface quality.'
        }
      ];
      routePolyline = [
        [13.0827, 80.2707], // Chennai Central
        [12.6840, 79.9830], // Chengalpattu
        [11.9401, 79.4861], // Viluppuram
        [10.7905, 78.7047], // Tiruchirappalli (Trichy)
        [10.3624, 77.9695], // Dindigul
        [9.9252, 78.1198]   // Madurai Meenakshi Center
      ];
    } else {
      // Default Delhi -> Jaipur
      routePolyline = [
        [28.6139, 77.2090], // New Delhi Central
        [28.5355, 77.3910], // Noida / DND
        [28.4595, 77.0266], // Gurgaon Cyber City / NH48
        [28.3248, 76.9015], // Manesar Industrial Hub
        [28.1884, 76.8193], // Dharuhera Toll
        [28.0021, 76.6214], // Bawal / Neemrana
        [27.7025, 76.3541], // Behror Midpoint Oasis
        [27.4241, 76.0125], // Kotputli Interchange
        [27.1685, 75.9241], // Shahpura Bypass
        [27.0125, 75.8821], // Chandwaji / Amer Outskirts
        [26.9855, 75.8513], // Amber Fort Foothills
        [26.9124, 75.7873]  // Jaipur City Center
      ];
    }

    const now = new Date();
    const last_updated = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;

    return {
      origin,
      destination,
      distance_km,
      normal_duration_minutes,
      live_traffic_duration_minutes,
      congestion_level,
      roadblocks,
      alternative_routes,
      route_polyline: routePolyline,
      last_updated,
      is_live_data: false
    };
  }
}

export const routeAgent = new RouteAgent();
