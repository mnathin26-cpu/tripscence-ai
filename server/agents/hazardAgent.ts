/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HazardAlert } from '../../src/types/travel.js';

export class HazardAgent {
  public checkHazards(destination: string): HazardAlert[] {
    const isManali = destination.toLowerCase().includes('manali') || destination.toLowerCase().includes('hill');
    const isJaipur = destination.toLowerCase().includes('jaipur');

    const alerts: HazardAlert[] = [];
    const now = new Date();
    const startTime = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' 06:00 AM';
    const endTime = now.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' 11:00 PM';

    if (isManali) {
      alerts.push({
        id: 'haz-manali-landslide',
        destination,
        title: 'High Landslide Risk & Waterlogging Alert on Kullu-Manali Highway (NH-3)',
        severity: 'critical',
        affected_area: 'Pandoh Dam Bypass to Aut Tunnel stretch',
        hazard_type: 'landslide',
        start_time: startTime,
        end_time: endTime,
        recommended_action:
          'State Disaster Management advises immediate suspension of non-essential transit. Reroute via Bajoura-Kandi alternative or postpone mountain ascent until geological clearance.',
        should_replan: true,
        data_source: 'National Disaster Management Authority (Simulated Feed)',
        is_simulated: true
      });
    } else if (isJaipur) {
      alerts.push({
        id: 'haz-jpr-heat',
        destination,
        title: 'Mild Dry Heat & High UV Index Advisory (12:30 PM - 03:30 PM)',
        severity: 'low',
        affected_area: 'Exposed open courtyards at Amber and Nahargarh Forts',
        hazard_type: 'heatwave',
        start_time: startTime,
        end_time: endTime,
        recommended_action:
          'Shift strenuous outdoor hill fort exploration to morning hours before 11:30 AM. Stay hydrated with electrolytes; seek shaded palace corridors during peak sun.',
        should_replan: false,
        data_source: 'India Meteorological Department (Simulated Feed)',
        is_simulated: true
      });
    }

    return alerts;
  }
}

export const hazardAgent = new HazardAgent();
