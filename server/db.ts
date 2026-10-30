/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  Trip,
  Itinerary,
  ItineraryItem,
  DisruptionSimulation,
  ApprovalAction,
  AgentLog,
  User,
  UserProfilePreferences,
  UserFeedbackReport
} from '../src/types/travel.js';

interface DatabaseSchema {
  users: Array<User & { password_hash: string; salt: string }>;
  trips: Trip[];
  itineraries: Itinerary[];
  itinerary_items: ItineraryItem[];
  disruptions: DisruptionSimulation[];
  approvals: ApprovalAction[];
  agent_logs: AgentLog[];
  user_feedback: UserFeedbackReport[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'tripsense_relational.json');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrCreate();
  }

  private loadOrCreate(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database, initializing fresh seed.', e);
    }

    const initial = this.seedDatabase();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
    }
  }

  private seedDatabase(): DatabaseSchema {
    const salt1 = crypto.randomBytes(16).toString('hex');
    const salt2 = crypto.randomBytes(16).toString('hex');

    const demoUser: User & { password_hash: string; salt: string } = {
      id: 'usr-traveller-1',
      email: 'traveller@tripsense.ai',
      name: 'Rohan Sharma',
      role: 'traveller',
      password_hash: hashPassword('password123', salt1),
      salt: salt1,
      created_at: new Date().toISOString()
    };

    const adminUser: User & { password_hash: string; salt: string } = {
      id: 'usr-admin-1',
      email: 'admin@tripsense.ai',
      name: 'Priya Mehta (Admin)',
      role: 'admin',
      password_hash: hashPassword('adminpass123', salt2),
      salt: salt2,
      created_at: new Date().toISOString()
    };

    // Preloaded Demo Jaipur Trip (4-day heritage trip for 2 people with INR 45,000 budget)
    const tripId = 'trip-jaipur-demo';
    const demoTrip: Trip = {
      id: tripId,
      user_id: demoUser.id,
      title: 'Royal Heritage Escapade in Jaipur',
      origin: 'Delhi',
      destination: 'Jaipur',
      start_date: '2026-11-12',
      end_date: '2026-11-15',
      travellers: 2,
      total_budget: 45000,
      currency: 'INR',
      travel_style: 'comfort',
      preferences: {
        heritage: true,
        sightseeing: true,
        food: true,
        shopping: true,
        nightlife: false,
        nature: false,
        accessibility: true
      },
      constraints: {
        dietary: 'vegetarian',
        non_smoking_rooms: true,
        wheelchair_access: true,
        avoid_early_departure: true,
        notes: 'Strict vegetarian food, no crack-of-dawn departures before 7 AM'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // v1 Initial Itinerary Items
    const itineraryId = 'itin-jaipur-v1';
    const items: ItineraryItem[] = [
      // Day 1: Arrival & Old City
      {
        id: 'item-d1-1',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'morning',
        start_time: '08:30 AM',
        end_time: '12:45 PM',
        title: 'Ajmer Shatabdi Express to Jaipur Junction',
        category: 'transport',
        location: 'New Delhi Railway Station to Jaipur Junction',
        coordinates: { lat: 26.9200, lng: 75.7950 },
        estimated_cost: 1840, // 2 travellers * 920
        currency: 'INR',
        travel_time_minutes: 255,
        agent_responsible: 'Transport Agent',
        confidence_score: 95,
        assumptions: 'Comfortable mid-morning train; departs after 8 AM constraint.',
        status: 'confirmed',
        notes: 'Reserved Chair Car seats with breakfast tea service.'
      },
      {
        id: 'item-d1-2',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'afternoon',
        start_time: '01:15 PM',
        end_time: '02:30 PM',
        title: 'Check-in: Shahpura House Heritage Haveli (3 Nights)',
        category: 'hotel',
        location: 'Bani Park, Jaipur',
        coordinates: { lat: 26.9295, lng: 75.7905 },
        estimated_cost: 14400, // 3 nights * 4800
        currency: 'INR',
        travel_time_minutes: 20,
        agent_responsible: 'Hotel Agent',
        confidence_score: 94,
        assumptions: 'Selected Best Value tier haveli with elevator and non-smoking rooms.',
        status: 'confirmed',
        notes: 'Complimentary traditional welcome drink and luggage assistance.'
      },
      {
        id: 'item-d1-3',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'afternoon',
        start_time: '02:45 PM',
        end_time: '04:00 PM',
        title: 'Traditional Pure Vegetarian Lunch at LMB (Laxmi Misthan)',
        category: 'food',
        location: 'Johari Bazaar, Pink City',
        coordinates: { lat: 26.9205, lng: 75.8270 },
        estimated_cost: 1300, // 2 x 650
        currency: 'INR',
        travel_time_minutes: 25,
        agent_responsible: 'Food Agent',
        confidence_score: 98,
        assumptions: 'Pure vegetarian restaurant fulfilling dietary constraint.',
        status: 'confirmed',
        notes: 'Famous Rajasthani thali and piping hot Ghewar.'
      },
      {
        id: 'item-d1-4',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'evening',
        start_time: '04:30 PM',
        end_time: '07:00 PM',
        title: 'Hawa Mahal & Bapu Bazaar Textile Stroll',
        category: 'activity',
        location: 'Badi Choupad, Pink City',
        coordinates: { lat: 26.9239, lng: 75.8267 },
        estimated_cost: 400, // 2 x 200
        currency: 'INR',
        travel_time_minutes: 15,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 96,
        assumptions: 'Gentle walking pace within 2 km radius.',
        status: 'confirmed',
        notes: 'Photography spots from street terrace and block-printed handicraft shopping.'
      },
      {
        id: 'item-d1-5',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'night',
        start_time: '08:00 PM',
        end_time: '09:45 PM',
        title: 'Dinner at Peacock Rooftop Restaurant',
        category: 'food',
        location: 'Hathroi Fort, Jaipur',
        coordinates: { lat: 26.9142, lng: 75.7925 },
        estimated_cost: 1100,
        currency: 'INR',
        travel_time_minutes: 20,
        agent_responsible: 'Food Agent',
        confidence_score: 92,
        status: 'confirmed'
      },

      // Day 2: Royal Palaces & Fortresses
      {
        id: 'item-d2-1',
        itinerary_id: itineraryId,
        day: 2,
        date: '2026-11-13',
        time_slot: 'morning',
        start_time: '09:00 AM',
        end_time: '01:00 PM',
        title: 'Excursion to Amber Fort & Sheesh Mahal',
        category: 'activity',
        location: 'Amer Hill, Jaipur',
        coordinates: { lat: 26.9855, lng: 75.8513 },
        estimated_cost: 1100, // 2 x 550 entry
        currency: 'INR',
        travel_time_minutes: 35,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 96,
        assumptions: 'Morning departure to avoid afternoon sun and crowds.',
        status: 'confirmed',
        notes: 'Wheelchair access available via back palace ramp.'
      },
      {
        id: 'item-d2-2',
        itinerary_id: itineraryId,
        day: 2,
        date: '2026-11-13',
        time_slot: 'afternoon',
        start_time: '01:15 PM',
        end_time: '02:30 PM',
        title: 'Royal Vegetarian Dining at 1135 AD Ramparts',
        category: 'food',
        location: 'Amber Fort Level 2',
        coordinates: { lat: 26.9855, lng: 75.8513 },
        estimated_cost: 2600,
        currency: 'INR',
        travel_time_minutes: 5,
        agent_responsible: 'Food Agent',
        confidence_score: 93,
        status: 'confirmed'
      },
      {
        id: 'item-d2-3',
        itinerary_id: itineraryId,
        day: 2,
        date: '2026-11-13',
        time_slot: 'afternoon',
        start_time: '03:15 PM',
        end_time: '05:30 PM',
        title: 'City Palace Museum & Jantar Mantar Observatory',
        category: 'activity',
        location: 'City Palace Complex, Jaipur',
        coordinates: { lat: 26.9258, lng: 75.8236 },
        estimated_cost: 1000, // (300+200)*2
        currency: 'INR',
        travel_time_minutes: 30,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 95,
        status: 'confirmed'
      },
      {
        id: 'item-d2-4',
        itinerary_id: itineraryId,
        day: 2,
        date: '2026-11-13',
        time_slot: 'evening',
        start_time: '06:00 PM',
        end_time: '07:30 PM',
        title: 'Nahargarh Fort Sunset Viewpoint',
        category: 'activity',
        location: 'Aravalli Hills Ridge',
        coordinates: { lat: 26.9372, lng: 75.8155 },
        estimated_cost: 400,
        currency: 'INR',
        travel_time_minutes: 25,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 90,
        status: 'confirmed'
      },

      // Day 3: Arts & Culture
      {
        id: 'item-d3-1',
        itinerary_id: itineraryId,
        day: 3,
        date: '2026-11-14',
        time_slot: 'morning',
        start_time: '09:30 AM',
        end_time: '12:30 PM',
        title: 'Albert Hall Museum & Ram Niwas Gardens',
        category: 'activity',
        location: 'Ram Niwas Garden',
        coordinates: { lat: 26.9116, lng: 75.8195 },
        estimated_cost: 300,
        currency: 'INR',
        travel_time_minutes: 20,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 95,
        status: 'confirmed'
      },
      {
        id: 'item-d3-2',
        itinerary_id: itineraryId,
        day: 3,
        date: '2026-11-14',
        time_slot: 'afternoon',
        start_time: '01:00 PM',
        end_time: '02:30 PM',
        title: 'Organic Garden Lunch at Anokhi Cafe',
        category: 'food',
        location: 'C-Scheme, Jaipur',
        coordinates: { lat: 26.9080, lng: 75.8030 },
        estimated_cost: 960,
        currency: 'INR',
        travel_time_minutes: 15,
        agent_responsible: 'Food Agent',
        confidence_score: 96,
        status: 'confirmed'
      },
      {
        id: 'item-d3-3',
        itinerary_id: itineraryId,
        day: 3,
        date: '2026-11-14',
        time_slot: 'evening',
        start_time: '06:30 PM',
        end_time: '10:30 PM',
        title: 'Chokhi Dhani Heritage Village Cultural Dinner & Folk Dance',
        category: 'activity',
        location: 'Tonk Road',
        coordinates: { lat: 26.7680, lng: 75.8340 },
        estimated_cost: 2400, // 2 x 1200
        currency: 'INR',
        travel_time_minutes: 40,
        agent_responsible: 'Food Agent',
        confidence_score: 97,
        status: 'confirmed'
      },

      // Day 4: Return Journey
      {
        id: 'item-d4-1',
        itinerary_id: itineraryId,
        day: 4,
        date: '2026-11-15',
        time_slot: 'morning',
        start_time: '09:00 AM',
        end_time: '11:30 AM',
        title: 'Hotel Check-out & Souvenir Stroll in Johari Bazaar',
        category: 'activity',
        location: 'Johari Bazaar',
        coordinates: { lat: 26.9205, lng: 75.8270 },
        estimated_cost: 0,
        currency: 'INR',
        travel_time_minutes: 15,
        agent_responsible: 'Coordinator Agent',
        confidence_score: 95,
        status: 'confirmed'
      },
      {
        id: 'item-d4-2',
        itinerary_id: itineraryId,
        day: 4,
        date: '2026-11-15',
        time_slot: 'afternoon',
        start_time: '12:00 PM',
        end_time: '01:30 PM',
        title: 'Brunch at Rawat Mishthan Bhandar',
        category: 'food',
        location: 'Station Road',
        coordinates: { lat: 26.9228, lng: 75.7995 },
        estimated_cost: 440,
        currency: 'INR',
        travel_time_minutes: 10,
        agent_responsible: 'Food Agent',
        confidence_score: 95,
        status: 'confirmed'
      },
      {
        id: 'item-d4-3',
        itinerary_id: itineraryId,
        day: 4,
        date: '2026-11-15',
        time_slot: 'afternoon',
        start_time: '03:45 PM',
        end_time: '07:25 PM',
        title: 'Return Train: Vande Bharat Express to New Delhi',
        category: 'transport',
        location: 'Jaipur Junction to New Delhi Railway Station',
        coordinates: { lat: 28.6430, lng: 77.2140 },
        estimated_cost: 2500, // 2 x 1250
        currency: 'INR',
        travel_time_minutes: 220,
        agent_responsible: 'Transport Agent',
        confidence_score: 97,
        status: 'confirmed',
        notes: 'High speed Vande Bharat Express return journey.'
      },
      // Local city cab day package (3 days)
      {
        id: 'item-local-cab',
        itinerary_id: itineraryId,
        day: 1,
        date: '2026-11-12',
        time_slot: 'morning',
        start_time: '12:45 PM',
        end_time: '07:00 PM',
        title: 'Dedicated AC Tourist Cab with Driver (4 Days Sightseeing)',
        category: 'local_transit',
        location: 'Jaipur City & Amer Circuit',
        coordinates: { lat: 26.9124, lng: 75.7873 },
        estimated_cost: 6500,
        currency: 'INR',
        travel_time_minutes: 0,
        agent_responsible: 'Transport Agent',
        confidence_score: 96,
        status: 'confirmed',
        notes: 'Covers all hotel-to-attraction and dinner transfers, tolls, and parking.'
      }
    ];

    const totalCost = items.reduce((sum, item) => sum + item.estimated_cost, 0); // ~34,440 INR

    const demoItinerary: Itinerary = {
      id: itineraryId,
      trip_id: tripId,
      version: 1,
      title: 'v1 Initial Baseline Plan',
      total_cost: totalCost,
      currency: 'INR',
      budget_status: 'under_budget',
      explanation: 'Optimized for royal heritage sights, vegetarian dining, mid-range comfort, and relaxed departures after 8:00 AM.',
      items,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const initialLogs: AgentLog[] = [
      {
        id: 'log-1',
        trip_id: tripId,
        agent_name: 'Coordinator Agent',
        action: 'Ingest and validate user constraints',
        reasoning: 'Confirmed 4-day trip from Delhi to Jaipur for 2 travellers. Budget limit: INR 45,000. Dietary: Vegetarian.',
        data_source: 'Simulated Engine',
        timestamp: new Date().toISOString()
      },
      {
        id: 'log-2',
        trip_id: tripId,
        agent_name: 'Transport Agent',
        action: 'Selected Ajmer Shatabdi & Vande Bharat Express trains',
        reasoning: 'Filtered out flights due to high carbon and transfers; filtered out early 6 AM trains to respect no-early-departure constraint.',
        data_source: 'Simulated Engine',
        timestamp: new Date().toISOString()
      },
      {
        id: 'log-3',
        trip_id: tripId,
        agent_name: 'Hotel Agent',
        action: 'Selected Shahpura House (Best Value)',
        reasoning: 'Mid-range heritage haveli at INR 4,800/night with elevator, 94% preference match, compliant with non-smoking.',
        data_source: 'Simulated Engine',
        timestamp: new Date().toISOString()
      },
      {
        id: 'log-4',
        trip_id: tripId,
        agent_name: 'Food Agent',
        action: 'Curated 100% vegetarian culinary itinerary',
        reasoning: 'Strict exclusion of non-vegetarian establishments; prioritized LMB, Peacock, Chokhi Dhani, and Anokhi.',
        data_source: 'Simulated Engine',
        timestamp: new Date().toISOString()
      }
    ];

    return {
      users: [demoUser, adminUser],
      trips: [demoTrip],
      itineraries: [demoItinerary],
      itinerary_items: items,
      disruptions: [],
      approvals: [],
      agent_logs: initialLogs,
      user_feedback: []
    };
  }

  // --- User Operations ---
  public getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { password_hash, salt, ...safe } = user;
    return safe;
  }

  public createUser(email: string, password: string, name: string, role: 'traveller' | 'admin' = 'traveller'): User {
    if (this.getUserByEmail(email)) {
      throw new Error('User already exists with this email');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const newUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      email,
      name,
      role,
      password_hash: hashPassword(password, salt),
      salt,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    const { password_hash: _p, salt: _s, ...safe } = newUser;
    return safe;
  }

  public verifyPassword(email: string, passwordAttempt: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const hash = hashPassword(passwordAttempt, user.salt);
    if (hash === user.password_hash) {
      const { password_hash, salt, ...safe } = user;
      return safe;
    }
    return null;
  }

  public updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      email?: string;
      phone?: string;
      avatar_url?: string;
      bio?: string;
      preferences?: UserProfilePreferences;
    }
  ): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
      const exists = this.getUserByEmail(updates.email);
      if (exists && exists.id !== userId) {
        throw new Error('Email is already taken by another account');
      }
      user.email = updates.email.trim();
    }

    if (updates.name && updates.name.trim()) {
      user.name = updates.name.trim();
    }
    if (updates.phone !== undefined) {
      user.phone = updates.phone;
    }
    if (updates.avatar_url !== undefined) {
      user.avatar_url = updates.avatar_url;
    }
    if (updates.bio !== undefined) {
      user.bio = updates.bio;
    }
    if (updates.preferences !== undefined) {
      user.preferences = {
        ...(user.preferences || {}),
        ...updates.preferences
      };
    }

    this.save();
    const { password_hash: _p, salt: _s, ...safe } = user;
    return safe;
  }

  public changeUserPassword(userId: string, oldPasswordAttempt: string, newPassword: string): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const oldHash = hashPassword(oldPasswordAttempt, user.salt);
    if (oldHash !== user.password_hash) {
      throw new Error('Current password does not match');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    user.salt = newSalt;
    user.password_hash = hashPassword(newPassword, newSalt);
    this.save();
    return true;
  }

  // --- Trip Operations ---
  public getTripsByUserId(userId: string): Trip[] {
    return this.data.trips.filter((t) => t.user_id === userId);
  }

  public getAllTrips(): Trip[] {
    return this.data.trips;
  }

  public getTripById(tripId: string): Trip | null {
    return this.data.trips.find((t) => t.id === tripId) || null;
  }

  public createTrip(tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>): Trip {
    const trip: Trip = {
      ...tripData,
      id: `trip-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.trips.unshift(trip);
    this.save();
    return trip;
  }

  public updateTrip(tripId: string, updates: Partial<Trip>): Trip | null {
    const idx = this.data.trips.findIndex((t) => t.id === tripId);
    if (idx === -1) return null;
    this.data.trips[idx] = {
      ...this.data.trips[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.trips[idx];
  }

  public deleteTrip(tripId: string): boolean {
    const prevLen = this.data.trips.length;
    this.data.trips = this.data.trips.filter((t) => t.id !== tripId);
    this.data.itineraries = this.data.itineraries.filter((i) => i.trip_id !== tripId);
    this.save();
    return this.data.trips.length < prevLen;
  }

  // --- Itinerary Operations ---
  public getItinerariesByTripId(tripId: string): Itinerary[] {
    return this.data.itineraries.filter((i) => i.trip_id === tripId);
  }

  public getActiveItinerary(tripId: string): Itinerary | null {
    return (
      this.data.itineraries.find((i) => i.trip_id === tripId && i.is_active) ||
      this.data.itineraries.filter((i) => i.trip_id === tripId).pop() ||
      null
    );
  }

  public saveItinerary(itinerary: Itinerary, makeActive = true): Itinerary {
    if (makeActive) {
      this.data.itineraries.forEach((i) => {
        if (i.trip_id === itinerary.trip_id) i.is_active = false;
      });
      itinerary.is_active = true;
    }
    const existingIndex = this.data.itineraries.findIndex((i) => i.id === itinerary.id);
    if (existingIndex >= 0) {
      this.data.itineraries[existingIndex] = itinerary;
    } else {
      this.data.itineraries.push(itinerary);
    }
    // Also update itinerary_items table
    this.data.itinerary_items = this.data.itinerary_items.filter((it) => it.itinerary_id !== itinerary.id);
    this.data.itinerary_items.push(...itinerary.items);
    this.save();
    return itinerary;
  }

  // --- Disruptions & Approvals ---
  public addDisruption(disruption: DisruptionSimulation): DisruptionSimulation {
    this.data.disruptions.unshift(disruption);
    this.save();
    return disruption;
  }

  public getDisruptionsByTripId(tripId: string): DisruptionSimulation[] {
    return this.data.disruptions.filter((d) => d.trip_id === tripId);
  }

  public updateDisruptionStatus(disruptionId: string, status: DisruptionSimulation['status']): boolean {
    const d = this.data.disruptions.find((item) => item.id === disruptionId);
    if (d) {
      d.status = status;
      this.save();
      return true;
    }
    return false;
  }

  public addApproval(approval: ApprovalAction): ApprovalAction {
    this.data.approvals.unshift(approval);
    this.save();
    return approval;
  }

  public getApprovalsByTripId(tripId: string): ApprovalAction[] {
    return this.data.approvals.filter((a) => a.trip_id === tripId);
  }

  public resolveApproval(approvalId: string, approved: boolean, approvedBy: string, rejectionReason?: string): ApprovalAction | null {
    const a = this.data.approvals.find((item) => item.id === approvalId);
    if (!a) return null;
    a.approved = approved;
    a.approved_by = approvedBy;
    a.approved_at = new Date().toISOString();
    if (rejectionReason) a.rejection_reason = rejectionReason;
    this.save();
    return a;
  }

  // --- Agent Logs ---
  public logAgentAction(tripId: string, agentName: string, action: string, reasoning: string, dataSource: AgentLog['data_source'] = 'Simulated Engine', metadata?: Record<string, unknown>): AgentLog {
    const log: AgentLog = {
      id: `log-${crypto.randomUUID().slice(0, 8)}`,
      trip_id: tripId,
      agent_name: agentName,
      action,
      reasoning,
      data_source: dataSource,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.data.agent_logs.push(log);
    this.save();
    return log;
  }

  public getLogsByTripId(tripId: string): AgentLog[] {
    return this.data.agent_logs.filter((l) => l.trip_id === tripId);
  }

  public getAllLogs(): AgentLog[] {
    return this.data.agent_logs;
  }

  // --- User Feedback Loop ---
  public addFeedback(feedback: Omit<UserFeedbackReport, 'id' | 'created_at' | 'status'>): UserFeedbackReport {
    const report: UserFeedbackReport = {
      ...feedback,
      id: `fb-${crypto.randomUUID().slice(0, 8)}`,
      created_at: new Date().toISOString(),
      status: 'submitted'
    };
    this.data.user_feedback.unshift(report);
    this.save();
    return report;
  }

  public getAllFeedback(): UserFeedbackReport[] {
    return this.data.user_feedback;
  }

  public updateFeedbackStatus(id: string, status: UserFeedbackReport['status']): boolean {
    const fb = this.data.user_feedback.find((f) => f.id === id);
    if (fb) {
      fb.status = status;
      this.save();
      return true;
    }
    return false;
  }

  // Reset database to initial seed demo
  public resetToSeed(): void {
    this.data = this.seedDatabase();
    this.save();
  }
}

export const db = new RelationalDatabase();
