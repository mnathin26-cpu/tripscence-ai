# TripSense AI — Intelligent Travel Planning & Replanning Agent

TripSense AI is a production-ready, secure full-stack web application designed for intelligent multi-agent travel itinerary generation, disruption detection, automatic replanning with human approval, and an on-trip Travel Companion with street-level maps, live traffic overlays, and safety advisories.

---

## 1. System Architecture & Multi-Agent Design

TripSense AI implements a **Coordinator-Specialist Multi-Agent Pattern**:

```
                              ┌────────────────────────────────────────┐
                              │         User Request / Browser         │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │        Trip Coordinator Agent          │
                              │  • Ingests constraints & preferences   │
                              │  • Orchestrates specialist agents      │
                              │  • Verifies budget, timing & routes    │
                              │  • Synthesizes natural explanations    │
                              └───────┬───────────────┬────────────────┘
                                      │               │
        ┌─────────────────────────────┼───────────────┼─────────────────────────────┐
        │                             │               │                             │
        ▼                             ▼               ▼                             ▼
┌───────────────┐             ┌───────────────┐ ┌───────────────┐           ┌───────────────┐
│  Hotel Agent  │             │Transport Agent│ │  Food Agent   │           │ Weather Agent │
│ • Lowest Cost │             │ • Trains/Air  │ │ • Dietary     │           │ • 24h Hourly  │
│ • Best Value  │             │ • Metro/Cabs  │ │ • Meal costs  │           │ • 10-day Daily│
│ • Best Comfort│             │ • Carbon & Lug│ │ • Veg/Vegan/GF│           │ • Packing tips│
└───────────────┘             └───────────────┘ └───────────────┘           └───────────────┘
        │                             │               │                             │
        ▼                             ▼               ▼                             ▼
┌───────────────┐             ┌───────────────┐ ┌───────────────┐           ┌───────────────┐
│Exploration Agt│             │  Route Agent  │ │  Hazard Agent │           │Navigation Agt │
│ • Sights/Arts │             │ • Traffic Live│ │ • Landslides  │           │ • Turn-by-turn│
│ • Medical/ATM │             │ • Alternative │ │ • Road closures│          │ • Distance/ETA│
└───────────────┘             └───────────────┘ └───────────────┘           └───────────────┘
```

### Why this design improves modularity:
- **Decoupled Specialist Logic:** Hotel, transport, and dining providers are isolated behind structured repository interfaces. Real flight (e.g. Amadeus), hotel, Google Places, Google Weather, and Google Routes APIs can replace the simulated providers without modifying the core agent coordination logic.
- **Structured JSON Schema:** Each specialist returns standardized schemas containing options, price, rating, pros, cons, preference match score (0-100), and constraint compliance status, enabling deterministic validation and side-by-side diffing.
- **Server-Side Secrets Protection:** All Gemini AI calls (`@google/genai`) and API keys are strictly executed on the server side (`server/agents/geminiClient.ts`), never leaking keys to the client bundle.
- **Human-in-the-Loop Approval:** No consequential action (booking, charging, itinerary overwrite) occurs automatically. When a disruption triggers replanning, a proposed revision (v2) is generated with clear cost deltas and requires explicit user approval.

---

## 2. Core Features

1. **Multi-Agent Travel Planner:**
   - Origin, destination, dates, number of travellers, budget slider, currency switcher.
   - Travel style selection (budget, balanced, comfort, luxury).
   - Strict constraints engine: 100% vegetarian, vegan, halal, non-smoking rooms, wheelchair step-free access, avoid departures before 7:00 AM.
2. **Budget Package Builder:**
   - 3 generated packages: **Economy Package**, **Balanced Package**, and **Premium Package**.
   - Comparative feature table and 1-click active package switcher.
3. **Simulated Disruption & Replanning:**
   - Flight cancelled
   - Return train delayed by 4 hours
   - Hotel unavailable for final night
   - Budget reduced by 20%
   - Mountain landslide / road closure
   - Side-by-side diff with cost changes, time changes, and human approval modal.
4. **On-Trip Travel Companion:**
   - Street-level Leaflet map with user GPS marker, destination pin, and traffic-aware colored polylines (green, orange, red).
   - Weather forecast with current metrics, 24h hourly, 10-day daily, and seasonal packing tips.
   - Nearby places exploration with 1-click "Add to itinerary" sending items to the Coordinator Agent for timing and budget validation.
   - Route traffic conditions with alternative expressway routes (e.g. Delhi-Mumbai Expressway NE-4).
   - Natural hazard warnings with severity levels (low, moderate, high, critical).
   - Turn-by-turn navigation HUD with distance, ETA, and maneuver icons.
5. **Conversational Natural Language Search Bot:**
   - Allows users to search locations in plain English (e.g., *"Find a pure veg rooftop restaurant with sunset view"*).
6. **Plan Verification Panel:**
   - Budget check (Pass/Fail)
   - Timing check (Pass/Fail)
   - Preference match score (%)
   - Constraint compliance audit (Pass/Fail)
7. **Privacy-First Data Policy:**
   - Explicit geolocation consent.
   - Coarse/in-memory GPS handling; zero coordinate logging in persistent server analytics.
   - Local storage used for user search history with instant purge button.
8. **Automated Testing & API Diagnostics Page:**
   - Unit tests covering budget calculations, date overlap detection, dietary filtering, disruption replanning, and cross-user authorization barriers.
   - Interactive REST API inspector.

---

## 3. Preloaded Jaipur Demonstration Scenario

TripSense AI includes a preconfigured scenario:
- **Origin:** Delhi
- **Destination:** Jaipur
- **Duration:** 4 Days, 2 Travellers
- **Budget:** INR 45,000
- **Constraints:** Heritage sightseeing, vegetarian food, mid-range comfort, no departures before 7:00 AM.
- **Demo Disruption Flow:**
  1. Return train is cancelled / delayed.
  2. Selected hotel unavailable for final night.
  3. Budget reduced to INR 38,000.
  4. App replans using Transport and Hotel agents, generates v2 revision, shows cost delta, and requests user approval.

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check endpoint returning status and Gemini config status |
| `POST` | `/api/auth/register` | User registration with role (`traveller` / `admin`) |
| `POST` | `/api/auth/login` | Secure authentication with password hashing & session token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `POST` | `/api/auth/logout` | Invalidate active session |
| `GET` | `/api/trips` | List trips (traveller views own; admin views all) |
| `POST` | `/api/trips` | Create trip and trigger multi-agent v1 itinerary generation |
| `GET` | `/api/trips/:id` | Get trip details, itineraries, disruptions, approvals, logs |
| `GET` | `/api/trips/:id/packages` | Generate Economy, Balanced, and Premium packages |
| `GET` | `/api/trips/:id/verify` | Run verification checks (budget, timing, constraints) |
| `POST` | `/api/trips/:id/disrupt` | Simulate disruption and generate v2 replanned itinerary |
| `POST` | `/api/trips/:id/approvals/:id` | Human approval action (approve or reject revision) |
| `GET` | `/api/companion/destination-overview` | Destination metadata, weather, safety, hazards, route |
| `GET` | `/api/companion/weather` | Weather forecast data |
| `GET` | `/api/companion/nearby-places` | Nearby attractions, dining, emergency services |
| `GET` | `/api/companion/route-conditions` | Traffic conditions and alternative expressway routes |
| `POST` | `/api/search/nlp` | Natural Language location search bot powered by Gemini |
| `POST` | `/api/feedback` | User crowd feedback and map correction submission |
| `POST` | `/api/demo/preload-jaipur` | Reset and preload the official Jaipur 4-day demo scenario |

---

## 5. Security & Privacy Design

- **Password Hashing:** Passwords hashed with Node.js `crypto.scryptSync` using cryptographically secure random 16-byte salts.
- **Session Tokens:** Cryptographically random 32-byte tokens with 24-hour expiration.
- **Role-Based Access Control (RBAC):** `traveller` and `admin` roles. Travelers cannot access or edit other users' trips. Admins can view audit logs and triage feedback.
- **No Secrets in Client Bundles:** All Gemini AI calls are handled strictly by Express server routes via `@google/genai`.
- **Location Minimization:** Browser GPS requires explicit user consent, is processed in memory for the navigation HUD, and is never stored in public server analytics.

---

## 6. Deployment Instructions

### AI Studio Publish
1. Open the project in Google AI Studio.
2. Ensure your `GEMINI_API_KEY` is configured in **Settings > Secrets**.
3. Click **Publish** to deploy directly to Cloud Run. The dev server runs on port 3000 with health check at `/health`.

### Self-Hosting via ZIP Download
1. Download or clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```
4. Build the client application:
   ```bash
   npm run build
   ```
5. Run the production server:
   ```bash
   NODE_ENV=production node server.ts
   # or in dev mode:
   npm run dev
   ```
6. Access the application at `http://localhost:3000`. Verify health at `http://localhost:3000/health`.
