/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Trip,
  Itinerary,
  BudgetPackage,
  PlanVerificationResult,
  DisruptionSimulation,
  ApprovalAction,
  AgentLog,
  DestinationWeather,
  NearbyPlace,
  RouteCondition,
  HazardAlert,
  User,
  UserProfilePreferences,
  UserFeedbackReport
} from '../types/travel.js';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('tripsense_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tripsense_token', token);
    } else {
      localStorage.removeItem('tripsense_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res;
  }

  public async register(email: string, password: string, name: string, role = 'traveller'): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role })
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    bio?: string;
    preferences?: UserProfilePreferences;
  }): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/auth/password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }

  public async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Trips
  public async getTrips(): Promise<{ trips: Trip[] }> {
    return this.request<{ trips: Trip[] }>('/trips');
  }

  public async getTrip(id: string): Promise<{
    trip: Trip;
    activeItinerary: Itinerary | null;
    itineraries: Itinerary[];
    disruptions: DisruptionSimulation[];
    approvals: ApprovalAction[];
    logs: AgentLog[];
  }> {
    return this.request(`/trips/${id}`);
  }

  public async createTrip(tripData: Partial<Trip>): Promise<{ trip: Trip; itinerary: Itinerary }> {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  public async deleteTrip(id: string): Promise<{ success: boolean }> {
    return this.request(`/trips/${id}`, { method: 'DELETE' });
  }

  // Itinerary & Packages
  public async generateItinerary(tripId: string): Promise<{ itinerary: Itinerary }> {
    return this.request(`/trips/${tripId}/generate`, { method: 'POST' });
  }

  public async getPackages(tripId: string): Promise<{ packages: BudgetPackage[] }> {
    return this.request(`/trips/${tripId}/packages`);
  }

  public async verifyPlan(tripId: string): Promise<{ verification: PlanVerificationResult }> {
    return this.request(`/trips/${tripId}/verify`);
  }

  // Disruption
  public async simulateDisruption(
    tripId: string,
    disruptionType: DisruptionSimulation['type']
  ): Promise<{
    disruption: DisruptionSimulation;
    revisedItinerary: Itinerary;
    approval: ApprovalAction;
    originalItinerary: Itinerary;
  }> {
    return this.request(`/trips/${tripId}/disrupt`, {
      method: 'POST',
      body: JSON.stringify({ disruption_type: disruptionType })
    });
  }

  public async resolveApproval(
    tripId: string,
    approvalId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<{ approval: ApprovalAction }> {
    return this.request(`/trips/${tripId}/approvals/${approvalId}`, {
      method: 'POST',
      body: JSON.stringify({ approved, rejection_reason: rejectionReason })
    });
  }

  // Companion
  public async getDestinationOverview(destination: string): Promise<{
    destination: any;
    weather: DestinationWeather;
    safety: any;
    hazards: HazardAlert[];
    route: RouteCondition;
  }> {
    return this.request(`/companion/destination-overview?destination=${encodeURIComponent(destination)}`);
  }

  public async getNearbyPlaces(destination: string): Promise<{ places: NearbyPlace[] }> {
    return this.request(`/companion/nearby-places?destination=${encodeURIComponent(destination)}`);
  }

  public async getRouteConditions(origin: string, destination: string): Promise<{ route: RouteCondition }> {
    return this.request(`/companion/route-conditions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  }

  public async getDirections(mode = 'driving'): Promise<{ directions: any }> {
    return this.request(`/companion/directions?mode=${encodeURIComponent(mode)}`);
  }

  // NLP Search Bot
  public async nlpSearch(query: string, destination: string): Promise<any> {
    return this.request('/search/nlp', {
      method: 'POST',
      body: JSON.stringify({ query, destination })
    });
  }

  // Feedback
  public async submitFeedback(feedback: Partial<UserFeedbackReport>): Promise<{ feedback: UserFeedbackReport }> {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback)
    });
  }

  public async getFeedback(): Promise<{ feedback: UserFeedbackReport[] }> {
    return this.request('/feedback');
  }

  public async updateFeedback(id: string, status: string): Promise<{ success: boolean }> {
    return this.request(`/feedback/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // Admin stats
  public async getAdminStats(): Promise<any> {
    return this.request('/admin/stats');
  }

  // Preload Jaipur demo
  public async preloadJaipurDemo(): Promise<{ message: string; trip: Trip; itinerary: Itinerary }> {
    return this.request('/demo/preload-jaipur', { method: 'POST' });
  }
}

export const api = new ApiClient();
