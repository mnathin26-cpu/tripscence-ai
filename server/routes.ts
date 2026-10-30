/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { db } from './db.js';
import { coordinatorAgent } from './agents/coordinatorAgent.js';
import { weatherAgent } from './agents/weatherAgent.js';
import { explorationAgent } from './agents/explorationAgent.js';
import { safetyAgent } from './agents/safetyAgent.js';
import { routeAgent } from './agents/routeAgent.js';
import { hazardAgent } from './agents/hazardAgent.js';
import { navigationAgent } from './agents/navigationAgent.js';
import { nlpSearchAgent } from './agents/nlpSearchAgent.js';
import { DESTINATIONS_METADATA } from '../src/data/simulatedData.js';

export const apiRouter = Router();

// In-memory token store for session verification
const activeSessions = new Map<string, { userId: string; role: string; expires: number }>();

// Simple auth middleware
function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing authorization token' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
  }

  // Attach user to req
  (req as any).user = { id: session.userId, role: session.role };
  next();
}

function requireAdmin(req: Request, res: Response, next: () => void) {
  requireAuth(req, res, () => {
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' });
    }
    next();
  });
}

// ----------------------------------------------------
// Health Check (Requirement 13)
// ----------------------------------------------------
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'TripSense AI',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ----------------------------------------------------
// Authentication Endpoints
// ----------------------------------------------------
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const userRole = role === 'admin' ? 'admin' : 'traveller';
    const user = db.createUser(email, password, name, userRole);
    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      userId: user.id,
      role: user.role,
      expires: Date.now() + 24 * 3600 * 1000 // 24 hours
    });
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const user = db.verifyPassword(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    expires: Date.now() + 24 * 3600 * 1000
  });

  res.json({ user, token });
});

apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = db.getUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

apiRouter.put('/auth/profile', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, email, phone, avatar_url, bio, preferences } = req.body;
    const updatedUser = db.updateUserProfile(userId, {
      name,
      email,
      phone,
      avatar_url,
      bio,
      preferences
    });
    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
});

apiRouter.post('/auth/password', requireAuth, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }
    db.changeUserPassword(userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to change password' });
  }
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ message: 'Logged out successfully' });
});

// ----------------------------------------------------
// Trip Endpoints
// ----------------------------------------------------
apiRouter.get('/trips', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  // Admin can see all, traveller only their own
  const trips = user.role === 'admin' ? db.getAllTrips() : db.getTripsByUserId(user.id);
  res.json({ trips });
});

apiRouter.get('/trips/:id', requireAuth, (req: Request, res: Response) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  // Security check: only owner or admin can view
  const user = (req as any).user;
  if (user.role !== 'admin' && trip.user_id !== user.id) {
    return res.status(403).json({ error: 'Access denied: not your trip' });
  }

  const itineraries = db.getItinerariesByTripId(trip.id);
  const activeItinerary = db.getActiveItinerary(trip.id);
  const disruptions = db.getDisruptionsByTripId(trip.id);
  const approvals = db.getApprovalsByTripId(trip.id);
  const logs = db.getLogsByTripId(trip.id);

  res.json({
    trip,
    activeItinerary,
    itineraries,
    disruptions,
    approvals,
    logs
  });
});

apiRouter.post('/trips', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      title,
      origin,
      destination,
      start_date,
      end_date,
      travellers,
      total_budget,
      currency,
      travel_style,
      preferences,
      constraints
    } = req.body;

    if (!origin || !destination || !start_date || !end_date || !total_budget) {
      return res.status(400).json({ error: 'Missing required trip parameters' });
    }

    const trip = db.createTrip({
      user_id: userId,
      title: title || `Trip to ${destination}`,
      origin,
      destination,
      start_date,
      end_date,
      travellers: Number(travellers) || 1,
      total_budget: Number(total_budget),
      currency: currency || 'INR',
      travel_style: travel_style || 'balanced',
      preferences: preferences || {},
      constraints: constraints || {}
    });

    // Automatically generate initial v1 itinerary
    const itinerary = await coordinatorAgent.generateItinerary(trip);

    res.json({ trip, itinerary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create trip' });
  }
});

apiRouter.put('/trips/:id', requireAuth, (req: Request, res: Response) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const user = (req as any).user;
  if (user.role !== 'admin' && trip.user_id !== user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updated = db.updateTrip(trip.id, req.body);
  res.json({ trip: updated });
});

apiRouter.delete('/trips/:id', requireAuth, (req: Request, res: Response) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const user = (req as any).user;
  if (user.role !== 'admin' && trip.user_id !== user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.deleteTrip(trip.id);
  res.json({ success: true, message: 'Trip deleted' });
});

// ----------------------------------------------------
// Itinerary & Packages Endpoints
// ----------------------------------------------------
apiRouter.post('/trips/:id/generate', requireAuth, async (req: Request, res: Response) => {
  try {
    const trip = db.getTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const itinerary = await coordinatorAgent.generateItinerary(trip);
    res.json({ itinerary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/trips/:id/packages', requireAuth, (req: Request, res: Response) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const packages = coordinatorAgent.generateBudgetPackages(trip);
  res.json({ packages });
});

apiRouter.get('/trips/:id/verify', requireAuth, (req: Request, res: Response) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  const itinerary = db.getActiveItinerary(trip.id);
  if (!itinerary) return res.status(404).json({ error: 'No active itinerary found' });

  const verification = coordinatorAgent.verifyPlan(trip, itinerary);
  res.json({ verification });
});

// ----------------------------------------------------
// Disruption Simulator & Replanning Flow
// ----------------------------------------------------
apiRouter.post('/trips/:id/disrupt', requireAuth, async (req: Request, res: Response) => {
  try {
    const { disruption_type } = req.body;
    if (!disruption_type) {
      return res.status(400).json({ error: 'disruption_type is required' });
    }

    const result = await coordinatorAgent.simulateDisruptionAndReplan(
      req.params.id,
      disruption_type
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/trips/:id/approvals/:approvalId', requireAuth, (req: Request, res: Response) => {
  const { approved, rejection_reason } = req.body;
  const user = (req as any).user;
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const resolved = db.resolveApproval(
    req.params.approvalId,
    Boolean(approved),
    user.id,
    rejection_reason
  );

  if (!resolved) return res.status(404).json({ error: 'Approval not found' });

  // If approved, activate the revised itinerary!
  if (approved) {
    const itineraries = db.getItinerariesByTripId(trip.id);
    const latestRevision = itineraries[itineraries.length - 1];
    if (latestRevision) {
      db.saveItinerary(latestRevision, true);
    }
  }

  res.json({ approval: resolved });
});

// ----------------------------------------------------
// Travel Companion Endpoints
// ----------------------------------------------------
apiRouter.get('/companion/destination-overview', (req: Request, res: Response) => {
  const destination = (req.query.destination as string) || 'Jaipur';
  const meta = DESTINATIONS_METADATA[destination] || DESTINATIONS_METADATA['Jaipur'];
  const weather = weatherAgent.getWeatherForDestination(destination);
  const safety = safetyAgent.getSafetyGuidance(destination);
  const hazards = hazardAgent.checkHazards(destination);
  const route = routeAgent.getRouteConditions('Delhi', destination);

  res.json({
    destination: meta,
    weather,
    safety,
    hazards,
    route
  });
});

apiRouter.get('/companion/weather', (req: Request, res: Response) => {
  const destination = (req.query.destination as string) || 'Jaipur';
  const weather = weatherAgent.getWeatherForDestination(destination);
  res.json({ weather });
});

apiRouter.get('/companion/nearby-places', (req: Request, res: Response) => {
  const destination = (req.query.destination as string) || 'Jaipur';
  const places = explorationAgent.getNearbyPlaces(destination);
  res.json({ places });
});

apiRouter.get('/companion/safety', (req: Request, res: Response) => {
  const destination = (req.query.destination as string) || 'Jaipur';
  const safety = safetyAgent.getSafetyGuidance(destination);
  res.json({ safety });
});

apiRouter.get('/companion/route-conditions', (req: Request, res: Response) => {
  const origin = (req.query.origin as string) || 'Delhi';
  const destination = (req.query.destination as string) || 'Jaipur';
  const route = routeAgent.getRouteConditions(origin, destination);
  res.json({ route });
});

apiRouter.get('/companion/hazards', (req: Request, res: Response) => {
  const destination = (req.query.destination as string) || 'Jaipur';
  const hazards = hazardAgent.checkHazards(destination);
  res.json({ hazards });
});

apiRouter.get('/companion/directions', (req: Request, res: Response) => {
  const mode = (req.query.mode as any) || 'driving';
  const directions = navigationAgent.getDirections({ lat: 26.9124, lng: 75.7873 }, { lat: 26.9855, lng: 75.8513 }, mode);
  res.json({ directions });
});

// ----------------------------------------------------
// NLP Search Bot Endpoint
// ----------------------------------------------------
apiRouter.post('/search/nlp', async (req: Request, res: Response) => {
  try {
    const { query, destination } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const result = await nlpSearchAgent.search(query, destination || 'Jaipur');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// User Feedback Loop
// ----------------------------------------------------
apiRouter.post('/feedback', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { destination, category, place_name, comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'Comment is required' });

  const report = db.addFeedback({
    user_id: user.id,
    destination: destination || 'Jaipur',
    category: category || 'general',
    place_name,
    comment
  });
  res.json({ feedback: report });
});

apiRouter.get('/feedback', requireAdmin, (_req: Request, res: Response) => {
  const reports = db.getAllFeedback();
  res.json({ feedback: reports });
});

apiRouter.patch('/feedback/:id', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = db.updateFeedbackStatus(req.params.id, status);
  res.json({ success: updated });
});

// ----------------------------------------------------
// Admin Diagnostics & System Audit Logs
// ----------------------------------------------------
apiRouter.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  const allTrips = db.getAllTrips();
  const allLogs = db.getAllLogs();
  const allFeedback = db.getAllFeedback();
  res.json({
    total_trips: allTrips.length,
    total_logs: allLogs.length,
    total_feedback: allFeedback.length,
    recent_logs: allLogs.slice(-20).reverse()
  });
});

// ----------------------------------------------------
// Demo Scenario Preloader (Requirement 10)
// ----------------------------------------------------
apiRouter.post('/demo/preload-jaipur', (_req: Request, res: Response) => {
  db.resetToSeed();
  const demoTrip = db.getTripById('trip-jaipur-demo');
  const demoItinerary = db.getActiveItinerary('trip-jaipur-demo');
  res.json({
    message: 'Preloaded official 4-day Delhi to Jaipur demo scenario',
    trip: demoTrip,
    itinerary: demoItinerary
  });
});
