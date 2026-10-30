# TripSense AI — System Limitations & Disclosure

## 1. Simulation vs. Real-Time External APIs

TripSense AI includes high-fidelity simulated datasets for hotels, transit carriers, restaurants, and attractions across Indian destinations (Jaipur, Delhi, Goa, Manali).
- **Simulated Provider Data:** Prices, room inventory, train seat classes, and weather reports are simulated to allow deterministic testing and offline reliability.
- **Pluggable Real APIs:** The architecture has clean repository interfaces (`hotelAgent.ts`, `transportAgent.ts`, `weatherAgent.ts`, `routeAgent.ts`). Integrating live Google Places, Google Routes, Google Weather, or global airline APIs requires standard API keys, billing setup, and provider compliance review.
- **Labels:** Simulated data is clearly badged in the UI as *"Simulated Provider"* or *"Simulated Feed"*.

## 2. Bookings, Charges, and Financial Transactions

- **No Live Financial Transactions:** TripSense AI never connects to banking rails, payment gateways, or merchant booking APIs automatically.
- **Explicit Human Approval Required:** All itinerary replanning proposals require explicit user approval. The agent will never automatically book, pay for, charge, or send emails on behalf of the user.

## 3. Geolocation & Navigation Accuracy

- **Browser GPS Accuracy:** Browser geolocation accuracy depends on the user's hardware, satellite visibility, WiFi positioning, and permissions. In indoor or dense urban environments, accuracy may vary between 10m and 100m.
- **Advisory Navigation HUD:** The turn-by-turn navigation HUD displays simplified visual instructions. It is not intended as a replacement for dedicated vehicular heads-up navigation or official traffic enforcement directives.

## 4. Emergency & Safety Guidance

- **General Advisory Guidance:** Safety information, scam awareness, and hazard alerts are advisory and curated for general tourist awareness.
- **Official Authority Primacy:** Travelers must always obey official local civil defense, disaster management authorities, police advisories, and emergency services.

## 5. Privacy & Data Minimization

- **No Raw Coordinate Retention:** Precise GPS coordinates are kept in volatile memory for live navigation HUD rendering and are never logged to persistent remote tracking tables.
- **Local Storage:** User activity and location logs can be purged at any time via the Privacy modal.
