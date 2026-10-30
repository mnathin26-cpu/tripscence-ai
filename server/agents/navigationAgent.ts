/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NavigationStep } from '../../src/types/travel.js';

export class NavigationAgent {
  public getDirections(
    _startPoint: { lat: number; lng: number; label?: string },
    _endPoint: { lat: number; lng: number; label?: string },
    mode: 'driving' | 'transit' | 'walking' | 'two_wheeler' = 'driving'
  ): {
    steps: NavigationStep[];
    total_distance_km: number;
    estimated_duration_minutes: number;
    traffic_delay_minutes: number;
    mode: string;
  } {
    let steps: NavigationStep[] = [];
    let total_distance_km = 11.2;
    let estimated_duration_minutes = 26;

    if (mode === 'driving') {
      steps = [
        {
          step_number: 1,
          instruction: 'Head north on MI Road toward Government Hostel Chauraha',
          distance_meters: 650,
          duration_seconds: 90,
          maneuver: 'straight',
          street_name: 'Mirza Ismail Road'
        },
        {
          step_number: 2,
          instruction: 'Take the 2nd exit at the roundabout onto Sansar Chandra Road',
          distance_meters: 1400,
          duration_seconds: 240,
          maneuver: 'roundabout',
          street_name: 'Sansar Chandra Road'
        },
        {
          step_number: 3,
          instruction: 'Turn right onto Amer Road (NH-248) toward Jal Mahal',
          distance_meters: 4200,
          duration_seconds: 520,
          maneuver: 'turn-right',
          street_name: 'Amer Road / Jal Mahal Promenade'
        },
        {
          step_number: 4,
          instruction: 'Continue straight along Maota Lake causeway; prepare to ascend fort road',
          distance_meters: 3100,
          duration_seconds: 400,
          maneuver: 'straight',
          street_name: 'Amer Palace Approach'
        },
        {
          step_number: 5,
          instruction: 'Turn sharp left into Suraj Pol (Sun Gate) tourist parking area',
          distance_meters: 450,
          duration_seconds: 90,
          maneuver: 'turn-left',
          street_name: 'Suraj Pol Entrance'
        },
        {
          step_number: 6,
          instruction: 'Arrive at destination: Amber Fort & Palace ramparts',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Amber Fort Forecourt'
        }
      ];
      total_distance_km = 9.8;
      estimated_duration_minutes = 24;
    } else if (mode === 'walking') {
      steps = [
        {
          step_number: 1,
          instruction: 'Walk east through Johari Bazaar covered walkway toward Badi Choupad',
          distance_meters: 450,
          duration_seconds: 360,
          maneuver: 'straight',
          street_name: 'Johari Bazaar'
        },
        {
          step_number: 2,
          instruction: 'Cross at the pedestrian signal to Hawa Mahal entrance gate',
          distance_meters: 120,
          duration_seconds: 90,
          maneuver: 'turn-left',
          street_name: 'Hawa Mahal Frontage'
        },
        {
          step_number: 3,
          instruction: 'Arrive at destination: Hawa Mahal courtyard',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Hawa Mahal Entry'
        }
      ];
      total_distance_km = 0.57;
      estimated_duration_minutes = 8;
    } else {
      // Transit
      steps = [
        {
          step_number: 1,
          instruction: 'Board Pink Line Metro at Railway Station toward Badi Choupad',
          distance_meters: 3200,
          duration_seconds: 720,
          maneuver: 'straight',
          street_name: 'Jaipur Metro Pink Line'
        },
        {
          step_number: 2,
          instruction: 'Alight at Badi Choupad Station, take Exit 2 for Old City Palace',
          distance_meters: 350,
          duration_seconds: 240,
          maneuver: 'straight',
          street_name: 'Exit 2 Pedestrian Concourse'
        },
        {
          step_number: 3,
          instruction: 'Arrive at destination',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Badi Choupad'
        }
      ];
      total_distance_km = 3.5;
      estimated_duration_minutes = 16;
    }

    return {
      steps,
      total_distance_km,
      estimated_duration_minutes,
      traffic_delay_minutes: 4,
      mode
    };
  }
}

export const navigationAgent = new NavigationAgent();
