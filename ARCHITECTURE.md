# TripSense AI — Multi-Agent Architecture

## 1. Multi-Agent System Overview

TripSense AI uses a coordinated multi-agent architecture where specialist agents handle distinct travel domains while a central coordinator validates constraints and maintains feasibility.

```
+-------------------------------------------------------------------------+
|                               USER UI                                   |
|   Trip Form | Itinerary View | Travel Companion | Replanning Diff       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      TRIP COORDINATOR AGENT                             |
|  - Ingestion & Constraint Validation                                   |
|  - Schedule Orchestration & Buffering                                  |
|  - Budget Verification & Package Building                              |
|  - Gemini Natural Language Explanations                                |
|  - State & Version Tracking (v1, v2, v3...)                            |
|  - Human Approval Protocol Enforcer                                    |
+----+--------+--------+--------+--------+--------+--------+--------+----+
     |        |        |        |        |        |        |        |    
     v        v        v        v        v        v        v        v    
+---------++-------++-------++-------++-------++-------++-------++-------+
|  HOTEL  ||TRANS- || FOOD  ||WEATHER||EXPLO- ||SAFETY || ROUTE ||HAZARD |
|  AGENT  || PORT  || AGENT || AGENT ||RATION || AGENT || AGENT ||AGENT |
| Lowest  ||Air/Rail||Veg/   ||24h    ||Monu-  ||Scam   ||Live   ||Land- |
| Best Val||Metro  ||Vegan/ ||Hourly ||ments  ||Tips   ||Traffic||slides|
| Comfort ||Carbon ||Halal  ||10-day ||Dining  ||Emer-  ||Express||Flash |
| Room    ||Baggage||Daily  ||Packing||Hosp-  ||gency  ||Alts   ||Floods|
| Alts    ||Alts   ||Alts   ||Tips   ||itals   ||Num    ||Polyln ||Roads |
+---------++-------++-------++-------++-------++-------++-------++-------+
```

## 2. Agent Responsibilities

### Trip Coordinator Agent
- Orchestrates specialist agents.
- Maintains relational trip state in database (origin, destination, dates, budget, style, preferences, constraints).
- Checks opening hours, travel buffers between activities, and dietary adherence.
- Produces versioned itineraries (`v1` baseline, `v2` post-disruption).
- Guarantees human approval before any consequential modification is activated.

### Hotel Agent
- Analyzes destination inventory across three tiers: `lowest_cost`, `best_value`, and `best_comfort`.
- Validates non-smoking requirements, elevator accessibility, pet policies, and cancellation windows.
- Automatically selects emergency substitute properties if a reserved hotel becomes unavailable.

### Transport Agent
- Compares flights, trains, intercity taxis, and local public transit.
- Calculates estimated carbon footprint (kg CO2) and luggage allowances.
- Respects departure timing constraints (e.g. avoids departures earlier than 7:00 AM).
- Proposes immediate alternatives (e.g. private AC highway sedan or alternative train) when a carrier cancels or delays transit.

### Food Agent
- Enforces strict dietary constraints: 100% vegetarian, vegan, halal, kosher, or gluten-free.
- Plans daily breakfast, lunch, and dinner sequences respecting opening hours and geographical proximity.
- Suggests culinary substitutes if a venue is closed for private events.

### Weather Agent
- Pulls destination weather data (current conditions, 24h hourly, 10-day daily).
- Recommends activity rescheduling based on precipitation or extreme temperatures.
- Generates tailored seasonal packing suggestions.

### Exploration Agent
- Discovers monuments, museums, viewpoints, markets, and emergency medical centers.
- Generates match scores based on user preferences and accessibility.
- Integrates with the Coordinator Agent when a user clicks "Add to itinerary".

### Safety Agent
- Curates destination safety checklists, local emergency telephone numbers, and 24/7 hospital trauma centers.
- Details common tourist scams (e.g., gem export schemes, unlicensed guides).
- Enforces mountainous road precautions (night driving hazards, offline maps).

### Route Conditions Agent
- Monitors traffic congestion and normal vs live traffic travel times.
- Detects roadblocks and lane closures.
- Calculates time and toll savings for alternative routes (e.g. NE-4 Expressway).

### Hazard Agent
- Monitors heavy rainfall, landslides, flash floods, and severe visibility.
- Assesses severity (low, moderate, high, critical) and triggers replanning if travel is unsafe.

### Navigation Agent
- Generates turn-by-turn guidance, distance to maneuvers, and traffic-aware ETAs for driving, walking, and public transit.

### NLP Search Agent
- Translates natural-language user queries into semantically matching locations using Gemini (`gemini-3.8-flash`).

## 3. Data Flow for Disruption Replanning

1. **Trigger:** User or simulated feed introduces a disruption (e.g., return train cancelled).
2. **Impact Analysis:** Coordinator Agent isolates affected itinerary items.
3. **Specialist Query:** Coordinator requests replacement proposals from the responsible specialist agent (Transport Agent).
4. **Schedule Synthesis:** Coordinator recalculates timing, travel routes, and cost deltas while keeping confirmed items untouched.
5. **Human Approval:** System displays a side-by-side diff (v1 vs v2) and creates an `ApprovalAction`.
6. **Activation:** Only when the user clicks "Approve" is the revised itinerary promoted to active status.
