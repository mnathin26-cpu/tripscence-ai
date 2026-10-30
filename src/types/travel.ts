/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TravelStyle = 'budget' | 'balanced' | 'comfort' | 'luxury';

export type UserRole = 'traveller' | 'admin';

export interface UserProfilePreferences {
  default_currency?: string;
  default_travel_style?: TravelStyle;
  dietary?: 'none' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten_free';
  max_walking_km?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  avatar_url?: string;
  bio?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: UserProfilePreferences;
}

export interface TripPreferences {
  sightseeing?: boolean;
  nature?: boolean;
  food?: boolean;
  shopping?: boolean;
  nightlife?: boolean;
  family_friendly?: boolean;
  heritage?: boolean;
  adventure?: boolean;
  relaxation?: boolean;
  accessibility?: boolean;
  pet_friendly?: boolean;
  [key: string]: boolean | undefined;
}

export interface TripConstraints {
  non_smoking_rooms?: boolean;
  dietary?: 'none' | 'vegetarian' | 'vegan' | 'halal' | 'kosher' | 'gluten_free';
  wheelchair_access?: boolean;
  direct_flights_only?: boolean;
  max_walking_km?: number;
  avoid_early_departure?: boolean;
  pet_allowed?: boolean;
  notes?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  travellers: number;
  total_budget: number;
  currency: string;
  travel_style: TravelStyle;
  preferences: TripPreferences;
  constraints: TripConstraints;
  created_at: string;
  updated_at: string;
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string;
  day: number;
  date: string;
  time_slot: 'morning' | 'afternoon' | 'evening' | 'night';
  start_time: string;
  end_time: string;
  title: string;
  category: 'hotel' | 'transport' | 'activity' | 'food' | 'local_transit' | 'buffer';
  location: string;
  coordinates?: { lat: number; lng: number };
  estimated_cost: number;
  currency: string;
  travel_time_minutes: number;
  agent_responsible: 'Coordinator Agent' | 'Hotel Agent' | 'Transport Agent' | 'Food Agent' | 'Weather Agent' | 'Hazard Agent';
  confidence_score: number; // 0 - 100
  assumptions?: string;
  status: 'confirmed' | 'pending' | 'disrupted' | 'replaced' | 'optional';
  notes?: string;
  replacement_for_id?: string;
  place_details?: {
    rating?: number;
    dietary_tags?: string[];
    accessibility?: boolean;
    cancellation_policy?: string;
  };
}

export interface Itinerary {
  id: string;
  trip_id: string;
  version: number;
  title: string;
  total_cost: number;
  currency: string;
  budget_status: 'under_budget' | 'near_budget' | 'over_budget';
  explanation: string;
  items: ItineraryItem[];
  is_active: boolean;
  created_at: string;
  disruption_id?: string;
}

export interface SpecialistOption {
  id: string;
  option_name: string;
  category: string;
  price: number;
  currency: string;
  duration_or_stay: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  rating: number;
  pros: string[];
  cons: string[];
  preference_match_score: number; // 0-100
  constraint_compliance_status: 'compliant' | 'minor_warning' | 'non_compliant';
  reasoning: string;
  alternatives: { name: string; price: number; reason: string }[];
  tier?: 'lowest_cost' | 'best_value' | 'best_comfort';
}

export interface DisruptionSimulation {
  id: string;
  trip_id: string;
  type:
    | 'flight_cancelled'
    | 'train_delayed'
    | 'hotel_unavailable'
    | 'attraction_closed'
    | 'restaurant_closed'
    | 'weather_disruption'
    | 'budget_reduced'
    | 'preference_changed'
    | 'mountain_landslide';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_item_ids: string[];
  suggested_action: string;
  simulated_at: string;
  status: 'detected' | 'replanned' | 'approved' | 'rejected';
}

export interface ApprovalAction {
  id: string;
  trip_id: string;
  action_type: 'accept_replan' | 'switch_package' | 'add_place' | 'manual_override';
  description: string;
  previous_cost: number;
  new_cost: number;
  currency: string;
  requires_human_approval: true;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface BudgetPackage {
  id: string;
  name: 'Economy Package' | 'Balanced Package' | 'Premium Package';
  travel_style: TravelStyle;
  hotel_option: SpecialistOption;
  transport_option: SpecialistOption;
  daily_food_allowance: number;
  activities_summary: string[];
  total_estimated_cost: number;
  remaining_budget: number;
  cost_per_person: number;
  preference_match_score: number;
  risk_notes: string[];
  currency: string;
}

export interface PlanVerificationResult {
  budget_check: {
    passed: boolean;
    total_cost: number;
    allocated_budget: number;
    difference: number;
    message: string;
  };
  timing_check: {
    passed: boolean;
    overlapping_items: string[];
    insufficient_buffers: string[];
    message: string;
  };
  preference_match_percentage: number;
  constraint_compliance: {
    passed: boolean;
    violations: string[];
    message: string;
  };
  open_issues: string[];
  suggested_fixes: string[];
  overall_status: 'verified' | 'warnings' | 'failed';
}

export interface AgentLog {
  id: string;
  trip_id: string;
  agent_name: string;
  action: string;
  reasoning: string;
  data_source: 'Simulated Engine' | 'Gemini Reasoning' | 'Google Weather' | 'Google Places' | 'Google Routes';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WeatherCondition {
  timestamp: string;
  temperature_c: number;
  feels_like_c: number;
  humidity_percent: number;
  wind_kmh: number;
  visibility_km: number;
  uv_index: number;
  precipitation_chance: number;
  weather_description: string;
  weather_icon: string;
  source: string;
  is_live: boolean;
}

export interface HourlyForecast {
  time: string;
  temperature_c: number;
  condition: string;
  precipitation_chance: number;
  wind_kmh: number;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  temp_min_c: number;
  temp_max_c: number;
  condition: string;
  precipitation_chance: number;
  recommendation: string;
}

export interface DestinationWeather {
  destination: string;
  current: WeatherCondition;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  climate_overview: string;
  packing_suggestions: string[];
  itinerary_advice: string;
}

export interface NearbyPlace {
  id: string;
  destination_id: string;
  name: string;
  category: 'attraction' | 'culture' | 'nature' | 'entertainment' | 'shopping' | 'food' | 'emergency';
  photo: string;
  rating: number;
  price_level: 1 | 2 | 3 | 4;
  approx_cost: number;
  currency: string;
  opening_hours: string;
  distance_km: number;
  travel_time_minutes: number;
  description: string;
  fits_preferences: boolean;
  fits_dietary: boolean;
  fits_accessibility: boolean;
  weather_suitable: boolean;
  coordinates: { lat: number; lng: number };
  address: string;
  is_live_data: boolean;
}

export interface RouteCondition {
  origin: string;
  destination: string;
  congestion_level: 'low' | 'moderate' | 'heavy' | 'severe';
  normal_duration_minutes: number;
  live_traffic_duration_minutes: number;
  distance_km: number;
  roadblocks: { description: string; location: string; delay_minutes: number }[];
  alternative_routes: {
    id: string;
    name: string;
    duration_minutes: number;
    distance_km: number;
    tolls_inr: number;
    savings_minutes: number;
    reason: string;
  }[];
  route_polyline: [number, number][];
  last_updated: string;
  is_live_data: boolean;
}

export interface HazardAlert {
  id: string;
  destination: string;
  title: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  affected_area: string;
  hazard_type: 'rainfall' | 'landslide' | 'flood' | 'road_closure' | 'heatwave' | 'fog';
  start_time: string;
  end_time: string;
  recommended_action: string;
  should_replan: boolean;
  data_source: string;
  is_simulated: boolean;
}

export interface NavigationStep {
  step_number: number;
  instruction: string;
  distance_meters: number;
  duration_seconds: number;
  maneuver: 'turn-left' | 'turn-right' | 'straight' | 'merge' | 'roundabout' | 'arrive';
  street_name: string;
}

export interface NavigationState {
  is_active: boolean;
  current_step_index: number;
  steps: NavigationStep[];
  current_mode: 'driving' | 'transit' | 'walking' | 'two_wheeler';
  remaining_distance_km: number;
  eta: string;
  rerouting_active: boolean;
  last_gps_fix?: {
    lat: number;
    lng: number;
    accuracy_meters: number;
    timestamp: string;
  };
}

export interface UserFeedbackReport {
  id: string;
  user_id: string;
  destination: string;
  category: 'incorrect_hours' | 'route_obstacle' | 'missing_landmark' | 'hazard_report' | 'general';
  place_name?: string;
  comment: string;
  created_at: string;
  status: 'submitted' | 'under_review' | 'verified';
}
