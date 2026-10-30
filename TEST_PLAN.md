# TripSense AI — Test Plan & Verification Matrix

## 1. Scope & Objectives

This test plan defines the automated, unit, integration, and security test protocols for TripSense AI. Testing ensures mathematical accuracy of budgets, schedule non-overlap, strict constraint compliance, multi-agent disruption replanning, and user data isolation.

## 2. Test Cases & Verification Results

| Test ID | Test Category | Scenario | Expected Outcome | Status |
|---|---|---|---|---|
| `TC-01` | Budget Integrity | Sum of individual itinerary items matches recorded total | Total item costs equal `total_cost` and remain within allocated budget limit | **PASS** |
| `TC-02` | Timing & Buffers | Daily schedule overlap check | Zero duplicate timestamps on same day; transit buffers $\ge 15$ mins | **PASS** |
| `TC-03` | Dietary Constraints | Strict vegetarian filtering | Excludes all non-veg restaurants; only pure-veg or certified options included | **PASS** |
| `TC-04` | Timing Constraints | Avoid early departure (&lt; 7:00 AM) | Excludes 06:10 AM trains when constraint is active | **PASS** |
| `TC-05` | Disruption: Transit | Return train cancelled / delayed 4h | Transport Agent proposes alternative AC highway cab; generates v2 plan | **PASS** |
| `TC-06` | Disruption: Hotel | Final night hotel unavailable | Hotel Agent selects neighboring 4-star boutique replacement; calculates cost delta | **PASS** |
| `TC-07` | Disruption: Budget | User reduces budget by 20% | Coordinator Agent scales dining/activity allocations down to match new cap | **PASS** |
| `TC-08` | Disruption: Hazard | Mountain landslide / heavy rain | Hazard Agent triggers alternative route; replaces outdoor fort with indoor museum | **PASS** |
| `TC-09` | Human Approval | Approval workflow enforcement | Revised itinerary remains inactive until human user clicks "Approve" | **PASS** |
| `TC-10` | Security: Auth | Access another user's trip without token | Server responds with HTTP 401/403; cross-user data isolation maintained | **PASS** |
| `TC-11` | Security: Secret Leak | Client bundle inspection | No Gemini API keys or internal database credentials exposed in frontend | **PASS** |
| `TC-12` | Weather Parser | Hourly and 10-day forecast parsing | Accurately returns 24h hourly and 10 daily forecast cards with temp ranges | **PASS** |
| `TC-13` | NLP Search Bot | Natural language location search | Interprets plain English prompts and returns relevant rated places with reasoning | **PASS** |

## 3. How to Run the Tests

1. In the TripSense AI application, navigate to the **Diagnostics & Tests** tab in the top navigation bar.
2. Click **Execute All Tests**.
3. View real-time test execution logs, pass/fail status, and latency duration.
4. Select the **REST API Inspector** tab to view raw JSON responses for endpoints like `/health`, `/api/companion/destination-overview`, and `/api/companion/hazards`.
