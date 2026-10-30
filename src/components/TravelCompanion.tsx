/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  CloudSun,
  ShieldAlert,
  Car,
  AlertTriangle,
  Navigation,
  Clock,
  PhoneCall,
  Search,
  CheckCircle2,
  Plus,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Eye,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Zap,
  Milestone
} from 'lucide-react';
import {
  DestinationWeather,
  NearbyPlace,
  RouteCondition,
  HazardAlert,
  NavigationStep,
  Trip,
  Itinerary
} from '../types/travel.js';
import { InteractiveMap } from './InteractiveMap.js';

interface TravelCompanionProps {
  trip: Trip;
  itinerary: Itinerary | null;
  destinationMeta: any;
  weather: DestinationWeather | null;
  places: NearbyPlace[];
  route: RouteCondition | null;
  hazards: HazardAlert[];
  onAddPlaceToItinerary: (place: NearbyPlace) => Promise<void>;
  onRefreshRoute: () => Promise<void>;
  onOpenFeedback: () => void;
  onSimulateHazardReplanning: (hazard: HazardAlert) => void;
}

export const TravelCompanion: React.FC<TravelCompanionProps> = ({
  trip,
  itinerary,
  destinationMeta,
  weather,
  places,
  route,
  hazards,
  onAddPlaceToItinerary,
  onRefreshRoute,
  onOpenFeedback,
  onSimulateHazardReplanning
}) => {
  const [weatherTab, setWeatherTab] = useState<'current' | 'hourly' | 'daily' | 'packing'>('current');
  const [placeCategory, setPlaceCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // GPS Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [liveNavigationActive, setLiveNavigationActive] = useState<boolean>(false);
  const [navigationMode, setNavigationMode] = useState<'driving' | 'walking' | 'transit'>('driving');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [navSteps, setNavSteps] = useState<NavigationStep[]>([]);
  const [isRerouting, setIsRerouting] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(54);
  const [rerouteActive, setRerouteActive] = useState<boolean>(false);
  const [obstacleAlert, setObstacleAlert] = useState<string | null>(null);

  // Safety accordion open state
  const [safetySectionOpen, setSafetySectionOpen] = useState<string>('emergency');

  // Voice announcement helper using Web Speech API
  const announceVoice = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && voiceEnabled) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }
  };

  // Request browser GPS position with high accuracy
  const requestGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        // Fallback location based on destination
        const dest = trip.destination.toLowerCase();
        let fallback = { lat: 26.9124, lng: 75.7873 }; // Jaipur
        if (dest.includes('paris')) fallback = { lat: 48.8566, lng: 2.3522 };
        else if (dest.includes('agra')) fallback = { lat: 27.1767, lng: 78.0081 };
        else if (dest.includes('tamil') || dest.includes('madurai')) fallback = { lat: 9.9252, lng: 78.1198 };
        else if (dest.includes('ooty')) fallback = { lat: 11.4102, lng: 76.6950 };
        else if (dest.includes('delhi')) fallback = { lat: 28.6139, lng: 77.2090 };

        setUserLocation({ ...fallback, accuracy: 25 });
        setLocationError(`GPS notice: Using local ${trip.destination} simulation coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Build destination-aware navigation steps
  const getStepsForDestination = (isDetour: boolean): NavigationStep[] => {
    const dest = trip.destination.toLowerCase();

    if (dest.includes('paris')) {
      if (isDetour) {
        return [
          {
            step_number: 1,
            instruction: 'Diverted via Boulevard des Maréchaux to avoid Porte de Saint-Cloud gridlock',
            distance_meters: 1100,
            duration_seconds: 140,
            maneuver: 'turn-right',
            street_name: 'Boulevard des Maréchaux'
          },
          {
            step_number: 2,
            instruction: 'Continue along Quai de Grenelle parallel to the Seine river promenade',
            distance_meters: 1800,
            duration_seconds: 220,
            maneuver: 'straight',
            street_name: 'Quai de Grenelle'
          },
          {
            step_number: 3,
            instruction: 'Arrive at Eiffel Tower Esplanade East Portal (Saved 12 mins)',
            distance_meters: 0,
            duration_seconds: 0,
            maneuver: 'arrive',
            street_name: 'Champ de Mars / Tour Eiffel'
          }
        ];
      }
      return [
        {
          step_number: 1,
          instruction: 'Head south on Voie d’Accès towards Autoroute du Nord (A1)',
          distance_meters: 1200,
          duration_seconds: 150,
          maneuver: 'straight',
          street_name: 'A1 Autoroute du Nord'
        },
        {
          step_number: 2,
          instruction: 'Merge onto Boulevard Périphérique Ouest towards Porte Maillot',
          distance_meters: 4800,
          duration_seconds: 420,
          maneuver: 'roundabout',
          street_name: 'Boulevard Périphérique'
        },
        {
          step_number: 3,
          instruction: 'Take exit 12 toward Avenue des Champs-Élysées & Arc de Triomphe',
          distance_meters: 2400,
          duration_seconds: 300,
          maneuver: 'turn-right',
          street_name: 'Avenue de la Grande Armée'
        },
        {
          step_number: 4,
          instruction: 'Turn right onto Quai Branly riverfront avenue toward Eiffel Tower',
          distance_meters: 1800,
          duration_seconds: 240,
          maneuver: 'turn-right',
          street_name: 'Quai Branly'
        },
        {
          step_number: 5,
          instruction: 'Arrive at Eiffel Tower Esplanade security gate',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Champ de Mars'
        }
      ];
    }

    if (dest.includes('agra')) {
      if (isDetour) {
        return [
          {
            step_number: 1,
            instruction: 'Diverted via VIP Fatehabad Express Corridor to bypass Tajganj market jam',
            distance_meters: 2200,
            duration_seconds: 200,
            maneuver: 'turn-left',
            street_name: 'VIP Fatehabad Road'
          },
          {
            step_number: 2,
            instruction: 'Follow Shilpgram Electric Eco-cart shuttle corridor directly to East Gate',
            distance_meters: 1100,
            duration_seconds: 120,
            maneuver: 'straight',
            street_name: 'Shilpgram Access Lane'
          },
          {
            step_number: 3,
            instruction: 'Arrive at Taj Mahal East Gate forecourt (Saved 15 mins)',
            distance_meters: 0,
            duration_seconds: 0,
            maneuver: 'arrive',
            street_name: 'Taj Mahal East Forecourt'
          }
        ];
      }
      return [
        {
          step_number: 1,
          instruction: 'Exit Yamuna Expressway Toll Plaza and merge onto Agra Inner Ring Road',
          distance_meters: 8500,
          duration_seconds: 520,
          maneuver: 'straight',
          street_name: 'Agra Inner Ring Road'
        },
        {
          step_number: 2,
          instruction: 'Turn right onto Fatehabad Road towards Taj Protected Heritage Zone',
          distance_meters: 3400,
          duration_seconds: 380,
          maneuver: 'turn-right',
          street_name: 'Fatehabad Road'
        },
        {
          step_number: 3,
          instruction: 'Park vehicle at Shilpgram tourist complex parking area',
          distance_meters: 900,
          duration_seconds: 140,
          maneuver: 'straight',
          street_name: 'Shilpgram Complex'
        },
        {
          step_number: 4,
          instruction: 'Board green electric shuttle golf cart to Taj Mahal East Gate',
          distance_meters: 800,
          duration_seconds: 120,
          maneuver: 'straight',
          street_name: 'Electric Vehicle Corridor'
        },
        {
          step_number: 5,
          instruction: 'Arrive at Taj Mahal East Gate main security checkpoint',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Taj Mahal Forecourt'
        }
      ];
    }

    if (dest.includes('tamil') || dest.includes('madurai')) {
      if (isDetour) {
        return [
          {
            step_number: 1,
            instruction: 'Diverted via Vaigai River North Bank Road bypassing central market bottleneck',
            distance_meters: 2100,
            duration_seconds: 190,
            maneuver: 'turn-right',
            street_name: 'North Bank Road'
          },
          {
            step_number: 2,
            instruction: 'Cross Albert Victor Bridge onto South Masi Street',
            distance_meters: 1400,
            duration_seconds: 180,
            maneuver: 'straight',
            street_name: 'South Masi Street'
          },
          {
            step_number: 3,
            instruction: 'Arrive at Meenakshi Amman Temple South Tower Gopuram (Saved 14 mins)',
            distance_meters: 0,
            duration_seconds: 0,
            maneuver: 'arrive',
            street_name: 'South Chitrai Street'
          }
        ];
      }
      return [
        {
          step_number: 1,
          instruction: 'Depart Madurai Junction Station toward Town Hall Road',
          distance_meters: 800,
          duration_seconds: 120,
          maneuver: 'straight',
          street_name: 'Town Hall Road'
        },
        {
          step_number: 2,
          instruction: 'Turn left onto West Veli Street towards historic concentric temple rings',
          distance_meters: 1600,
          duration_seconds: 240,
          maneuver: 'turn-left',
          street_name: 'West Veli Street'
        },
        {
          step_number: 3,
          instruction: 'Enter pedestrian zone along West Chitrai Street towards stone temple tower',
          distance_meters: 950,
          duration_seconds: 180,
          maneuver: 'straight',
          street_name: 'West Chitrai Street'
        },
        {
          step_number: 4,
          instruction: 'Arrive at Arulmigu Meenakshi Amman Temple Tower Entrance',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Meenakshi Temple South Gopuram'
        }
      ];
    }

    if (dest.includes('ooty')) {
      return [
        {
          step_number: 1,
          instruction: 'Head north along Coonoor-Ooty Highway (NH-181) through tea garden bends',
          distance_meters: 5200,
          duration_seconds: 480,
          maneuver: 'straight',
          street_name: 'NH-181 Nilgiri Highway'
        },
        {
          step_number: 2,
          instruction: 'Take second exit at Charing Cross roundabout towards Commercial Road',
          distance_meters: 1800,
          duration_seconds: 240,
          maneuver: 'roundabout',
          street_name: 'Commercial Road'
        },
        {
          step_number: 3,
          instruction: 'Arrive at Ooty Lake boathouse and Nilgiri Mountain Railway terminus',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Ooty Lake Road'
        }
      ];
    }

    // Default Jaipur steps
    if (isDetour) {
      return [
        {
          step_number: 1,
          instruction: 'Diverted via Delhi Bypass Road (NH-48) to avoid Johari Bazaar congestion',
          distance_meters: 3600,
          duration_seconds: 320,
          maneuver: 'turn-left',
          street_name: 'Delhi Bypass Road'
        },
        {
          step_number: 2,
          instruction: 'Take Amer Link ramp directly arriving at Amber Fort North Gate (Saved 15 mins)',
          distance_meters: 2100,
          duration_seconds: 220,
          maneuver: 'straight',
          street_name: 'Amer Link Road'
        },
        {
          step_number: 3,
          instruction: 'Arrive at Amber Palace Entrance Gate',
          distance_meters: 0,
          duration_seconds: 0,
          maneuver: 'arrive',
          street_name: 'Amber Fort Forecourt'
        }
      ];
    }

    return [
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
        instruction: 'Turn right onto Amer Road (NH-248) toward Jal Mahal lake promenade',
        distance_meters: 4200,
        duration_seconds: 520,
        maneuver: 'turn-right',
        street_name: 'Amer Road / Jal Mahal'
      },
      {
        step_number: 4,
        instruction: 'Ascend fort hill approach road; stay in the right lane',
        distance_meters: 3100,
        duration_seconds: 400,
        maneuver: 'straight',
        street_name: 'Amer Palace Approach'
      },
      {
        step_number: 5,
        instruction: 'Arrive at Amber Fort & Palace main gate entrance',
        distance_meters: 0,
        duration_seconds: 0,
        maneuver: 'arrive',
        street_name: 'Amber Fort Forecourt'
      }
    ];
  };

  // Turn-by-turn navigation steps initial load
  useEffect(() => {
    if (liveNavigationActive) {
      const steps = getStepsForDestination(rerouteActive);
      setNavSteps(steps);
      setCurrentStepIdx(0);
      announceVoice(`Starting live navigation to ${trip.destination}. ${steps[0].instruction}`);
    }
  }, [liveNavigationActive, trip.destination, rerouteActive]);

  // Live Drive Simulation Timer
  useEffect(() => {
    let timer: any = null;
    if (isSimulatingDrive && liveNavigationActive && navSteps.length > 0) {
      timer = setInterval(() => {
        // Modulate speed realistically (48 to 64 km/h)
        const jitter = Math.floor(Math.random() * 12) - 6;
        setSimulatedSpeed(Math.max(35, Math.min(80, 52 + jitter)));

        setCurrentStepIdx((prevIdx) => {
          if (prevIdx < navSteps.length - 1) {
            const nextIdx = prevIdx + 1;
            announceVoice(navSteps[nextIdx].instruction);
            return nextIdx;
          } else {
            // Reached destination
            announceVoice(`You have arrived at your destination in ${trip.destination}!`);
            setIsSimulatingDrive(false);
            return prevIdx;
          }
        });
      }, 5000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulatingDrive, liveNavigationActive, navSteps]);

  // Handle Obstacle Reroute Trigger
  const handleSimulateObstacle = () => {
    setIsRerouting(true);
    const newRerouteState = !rerouteActive;
    setRerouteActive(newRerouteState);

    setTimeout(() => {
      setIsRerouting(false);
      const updatedSteps = getStepsForDestination(newRerouteState);
      setNavSteps(updatedSteps);
      setCurrentStepIdx(0);

      if (newRerouteState) {
        setObstacleAlert('Heavy bottleneck & flash construction detected on main artery. Recalculated dynamic bypass route (-14 mins).');
        announceVoice('Heavy congestion ahead. Recalculating route via bypass corridor. Estimated fourteen minutes saved.');
      } else {
        setObstacleAlert('Traffic cleared. Restored standard primary route.');
        announceVoice('Restored standard direct route.');
      }
    }, 700);
  };

  const destCoords = destinationMeta?.coordinates || { lat: 26.9124, lng: 75.7873 };

  // Filter nearby places
  const filteredPlaces = places.filter((p) => {
    if (placeCategory === 'all') return true;
    if (placeCategory === 'attraction') return p.category === 'attraction' || p.category === 'culture';
    if (placeCategory === 'food') return p.category === 'food';
    if (placeCategory === 'shopping') return p.category === 'shopping';
    if (placeCategory === 'emergency') return p.category === 'emergency';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Destination Overview Dashboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Travel Companion Dashboard</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 font-mono font-normal">
                {destinationMeta?.region}, {destinationMeta?.country}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-normal">
                {destinationMeta?.timezone || 'IST (UTC+5:30)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              {trip.destination} On-Trip Guide & Live Monitoring
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {destinationMeta?.overview || 'Real-time weather forecast, traffic route conditions, nearby sights, local safety advisories, and navigation assistance.'}
            </p>
          </div>

          {/* Quick GPS & Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={requestGPSLocation}
              disabled={isLocating}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>{userLocation ? 'GPS Calibrated' : isLocating ? 'Locating...' : 'Enable GPS'}</span>
            </button>

            <button
              onClick={() => setLiveNavigationActive(!liveNavigationActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                liveNavigationActive
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{liveNavigationActive ? 'Exit HUD' : 'Live Navigation'}</span>
            </button>

            <button
              onClick={onOpenFeedback}
              title="Report incorrect data or road obstacle"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Natural Hazard Alert Banner if any */}
        {hazards.length > 0 && (
          <div className="mt-6 space-y-2">
            {hazards.map((haz) => (
              <div
                key={haz.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  haz.severity === 'critical'
                    ? 'bg-rose-950/40 border-rose-500/80 text-rose-200'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-white">
                        {haz.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 font-mono">
                        {haz.is_simulated ? 'Simulated Hazard Feed' : 'Official Alert'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {haz.recommended_action}
                    </p>
                  </div>
                </div>

                {haz.should_replan && (
                  <button
                    onClick={() => onSimulateHazardReplanning(haz)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 self-start sm:self-auto shadow-md"
                  >
                    Trigger Hazard Replanning
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>Street-Level Map & Live Traffic Corridor</span>
            </h2>
            <span className="text-xs text-slate-400">
              Interactive pins for monuments, restaurants, and emergency hospitals with live traffic polyline.
            </span>
          </div>

          {locationError && (
            <span className="text-[11px] text-amber-400/90 italic">
              {locationError}
            </span>
          )}
        </div>

        <InteractiveMap
          destinationCoords={destCoords}
          destinationName={trip.destination}
          userCoords={userLocation}
          places={places}
          route={route}
          onSelectPlace={(place) => setSelectedPlace(place)}
          selectedPlace={selectedPlace}
        />
      </div>

      {/* 3. Advanced Live Navigation Turn-by-Turn HUD */}
      {liveNavigationActive && navSteps.length > 0 && (
        <div className="bg-slate-900 border-2 border-cyan-500/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in slide-in-from-top-4">
          {/* Top HUD Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <div className={`w-3.5 h-3.5 rounded-full ${isSimulatingDrive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
                <div className={`w-2 h-2 rounded-full absolute ${isSimulatingDrive ? 'bg-emerald-300' : 'bg-cyan-300'}`} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <span>Advanced HUD Active</span>
                  {isSimulatingDrive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                      LIVE DRIVE SIMULATOR ON
                    </span>
                  )}
                  {rerouteActive && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      DETOUR ACTIVE (-14m)
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Turn-by-turn guidance to {trip.destination} · Step {currentStepIdx + 1} of {navSteps.length}
                </span>
              </div>
            </div>

            {/* Controls: Mode, Voice, and Obstacle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Voice Mute / Unmute */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !voiceEnabled;
                  setVoiceEnabled(nextState);
                  if (nextState) announceVoice('Voice navigation enabled');
                }}
                className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
                title={voiceEnabled ? 'Mute Voice Announcements' : 'Enable Voice Announcements'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{voiceEnabled ? 'Voice On' : 'Muted'}</span>
              </button>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['driving', 'walking', 'transit'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setNavigationMode(m as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs capitalize font-semibold transition-all ${
                      navigationMode === m ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Dynamic Obstacle / Reroute button */}
              <button
                type="button"
                onClick={handleSimulateObstacle}
                disabled={isRerouting}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  rerouteActive
                    ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border-amber-500/40'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isRerouting ? 'Rerouting...' : rerouteActive ? 'Restore Route' : 'Simulate Obstacle / Detour'}</span>
              </button>
            </div>
          </div>

          {/* Obstacle Alert Banner if active */}
          {obstacleAlert && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{obstacleAlert}</span>
              </div>
              <button
                onClick={() => setObstacleAlert(null)}
                className="text-amber-400 hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Current Step Prominent Banner with Speedometer & Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950 border border-cyan-500/30">
            {/* Step Direction */}
            <div className="lg:col-span-3 flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg shadow-cyan-950/50">
                {currentStepIdx === 0 ? '⬆️' : currentStepIdx === navSteps.length - 1 ? '🏁' : currentStepIdx % 2 === 1 ? '➡️' : '↗️'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                    Step {currentStepIdx + 1} of {navSteps.length}
                  </span>
                  <span>{navSteps[currentStepIdx]?.distance_meters > 0 ? `In ${navSteps[currentStepIdx]?.distance_meters}m` : 'Destination point'}</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold font-heading text-white leading-snug">
                  {navSteps[currentStepIdx]?.instruction}
                </h4>
                <div className="flex items-center gap-3 text-xs text-cyan-300 font-mono">
                  <span>🛣️ {navSteps[currentStepIdx]?.street_name}</span>
                  {navSteps[currentStepIdx]?.duration_seconds > 0 && (
                    <span className="text-slate-400">· ~{Math.ceil(navSteps[currentStepIdx]?.duration_seconds / 60)} min</span>
                  )}
                </div>
              </div>
            </div>

            {/* Speedometer Gauge & Stats */}
            <div className="flex items-center justify-between lg:flex-col lg:justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center gap-2">
              <div className="flex items-center gap-2 lg:gap-1">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Live Speed</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-cyan-300">
                  {isSimulatingDrive ? simulatedSpeed : '0'}
                </span>
                <span className="text-xs text-slate-500 font-mono">km/h</span>
              </div>
              <div className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-[10px] text-slate-400">
                Limit: 50 km/h
              </div>
            </div>
          </div>

          {/* Progress Bar & ETA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Milestone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Route Completion: {Math.round(((currentStepIdx + 1) / navSteps.length) * 100)}%</span>
              </span>
              <span>
                Remaining: {navSteps.slice(currentStepIdx).reduce((acc, s) => acc + s.distance_meters, 0) / 1000} km
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${((currentStepIdx + 1) / navSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Footer: Drive Simulator, Speech Announcement, and Step navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {/* Play / Pause Simulator */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isSimulatingDrive;
                  setIsSimulatingDrive(nextState);
                  if (nextState) {
                    announceVoice('Starting drive simulation. GPS tracking engaged.');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSimulatingDrive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {isSimulatingDrive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isSimulatingDrive ? 'Pause Simulation' : 'Start Drive Simulation'}</span>
              </button>

              {/* Reset to Step 1 */}
              <button
                type="button"
                onClick={() => {
                  setCurrentStepIdx(0);
                  setIsSimulatingDrive(false);
                  announceVoice('Navigation reset to beginning.');
                }}
                title="Restart Route"
                className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Re-announce speech */}
              <button
                type="button"
                onClick={() => announceVoice(navSteps[currentStepIdx]?.instruction)}
                title="Voice Speak Instruction"
                className="p-2 rounded-xl bg-slate-950 text-cyan-400 hover:text-cyan-300 border border-slate-800 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => {
                  const prev = Math.max(0, currentStepIdx - 1);
                  setCurrentStepIdx(prev);
                  announceVoice(navSteps[prev]?.instruction);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-white border border-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Previous Step
              </button>
              <button
                disabled={currentStepIdx === navSteps.length - 1}
                onClick={() => {
                  const next = Math.min(navSteps.length - 1, currentStepIdx + 1);
                  setCurrentStepIdx(next);
                  announceVoice(navSteps[next]?.instruction);
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-black disabled:opacity-40 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Next Maneuver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Weather & Climate Module */}
      {weather && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold font-heading text-white">
                  Weather & Climate Forecast
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {weather.current.source} · Updated: {weather.current.timestamp}
              </span>
            </div>

            {/* Weather Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setWeatherTab('current')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  weatherTab === 'current' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setWeatherTab('hourly')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  weatherTab === 'hourly' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                24h Hourly
              </button>
              <button
                onClick={() => setWeatherTab('daily')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  weatherTab === 'daily' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                10-Day Daily
              </button>
              <button
                onClick={() => setWeatherTab('packing')}
                className={`px-3 py-1.5 rounded-lg font-semibold ${
                  weatherTab === 'packing' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Packing Tips
              </button>
            </div>
          </div>

          {/* Current Conditions Tab */}
          {weatherTab === 'current' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Temperature</span>
                  <span className="text-3xl font-bold font-mono text-white mt-1 block">
                    {weather.current.temperature_c}°C
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Feels like {weather.current.feels_like_c}°C
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Humidity</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-white mt-1 block">
                    {weather.current.humidity_percent}%
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Precip: {weather.current.precipitation_chance}%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Wind</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-white mt-1 block">
                    {weather.current.wind_kmh} km/h
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Visibility: {weather.current.visibility_km} km
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>UV Index</span>
                  </div>
                  <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                    {weather.current.uv_index}
                  </span>
                  <span className="text-[11px] text-slate-500">Moderate Exposure</span>
                </div>
              </div>

              {/* Weather Advice Box */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong>Weather-Aware Recommendation:</strong> {weather.itinerary_advice}
              </div>
            </div>
          )}

          {/* Hourly Tab */}
          {weatherTab === 'hourly' && (
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
              {weather.hourly.map((h, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <span className="text-slate-400 block font-mono text-[11px]">{h.time}</span>
                  <span className="text-base font-bold text-white block my-1">{h.temperature_c}°</span>
                  <span className="text-[10px] text-cyan-400 block">{h.precipitation_chance}% rain</span>
                </div>
              ))}
            </div>
          )}

          {/* Daily 10-day Tab */}
          {weatherTab === 'daily' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {weather.daily.map((d, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{d.day_name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{d.date}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white font-mono">{d.temp_max_c}°</span>
                    <span className="text-xs text-slate-500 font-mono">{d.temp_min_c}°</span>
                  </div>
                  <span className="text-slate-400 text-[11px] block">{d.condition}</span>
                  <span className="text-[10px] text-amber-400/90 block pt-1 border-t border-slate-900">
                    {d.recommendation}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Packing Advice Tab */}
          {weatherTab === 'packing' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">{weather.climate_overview}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {weather.packing_suggestions.map((tip: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Route Traffic & Road Conditions Module */}
      {route && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold font-heading text-white">
                  Route Traffic & Road Conditions
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {route.origin} to {route.destination} corridor ({route.distance_km} km) · Last updated: {route.last_updated}
              </span>
            </div>

            <button
              onClick={onRefreshRoute}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Refresh Traffic</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Live Traffic Duration</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {Math.floor(route.live_traffic_duration_minutes / 60)}h {route.live_traffic_duration_minutes % 60}m
              </div>
              <span className="text-[11px] text-slate-500">
                Normal: {Math.floor(route.normal_duration_minutes / 60)}h {route.normal_duration_minutes % 60}m (+{route.live_traffic_duration_minutes - route.normal_duration_minutes}m delay)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 md:col-span-2 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Active Roadblocks & Lane Work ({route.roadblocks.length})
              </span>
              <div className="space-y-2">
                {route.roadblocks.map((rb, idx) => (
                  <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-300">{rb.description}</strong>
                      <span className="text-slate-500 block text-[11px]">Location: {rb.location} (+{rb.delay_minutes} min delay)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Routes */}
          {route.alternative_routes.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Alternative Fast Routes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {route.alternative_routes.map((alt) => (
                  <div key={alt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{alt.name}</h4>
                      {alt.savings_minutes > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Saves {alt.savings_minutes} mins
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{alt.reason}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                      <span>{Math.floor(alt.duration_minutes / 60)}h {alt.duration_minutes % 60}m</span>
                      <span>Tolls: ₹{alt.tolls_inr}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Nearby Places & Exploration Carousel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">
              Nearby Places & Exploration
            </h3>
            <span className="text-xs text-slate-400">
              Curated attractions, dining spots, and 24/7 hospitals around {trip.destination}.
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'attraction', 'food', 'shopping', 'emergency'].map((cat) => (
              <button
                key={cat}
                onClick={() => setPlaceCategory(cat)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                  placeCategory === cat ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.slice(0, 9).map((place) => (
            <div
              key={place.id}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              {place.photo && (
                <div className="h-36 w-full overflow-hidden relative">
                  <img
                    src={place.photo}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-400">
                    ★ {place.rating}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white">
                    {place.category.toUpperCase()}
                  </div>
                </div>
              )}

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {place.description}
                  </p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                    <span>{place.distance_km} km away</span>
                    <span>·</span>
                    <span>{place.opening_hours}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {place.approx_cost === 0 ? 'Free Entry' : `₹${place.approx_cost}`}
                  </span>

                  <button
                    onClick={() => onAddPlaceToItinerary(place)}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1 border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Itinerary</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Safety, Scams & Precautions Module */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold font-heading text-white">
              Safety Guidelines & Tourist Precautions
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Official Advisory Checklist
          </span>
        </div>

        <div className="space-y-3">
          {/* Emergency Contacts */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <button
              onClick={() => setSafetySectionOpen(safetySectionOpen === 'emergency' ? '' : 'emergency')}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>Local Emergency Hotlines & Hospitals</span>
              </div>
              {safetySectionOpen === 'emergency' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {safetySectionOpen === 'emergency' && (
              <div className="p-4 pt-0 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80">
                  <strong className="text-rose-400 block font-mono">112</strong>
                  <span className="text-slate-300">National Emergency Universal Response (Police / Fire / Ambulance)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80">
                  <strong className="text-amber-400 block font-mono">1363 / 1800-111-363</strong>
                  <span className="text-slate-300">Ministry of Tourism Multi-lingual Helpline</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80">
                  <strong className="text-cyan-400 block font-mono">+91-141-2560291</strong>
                  <span className="text-slate-300">Sawai Man Singh (SMS) Hospital 24/7 Trauma Unit</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80">
                  <strong className="text-purple-400 block font-mono">1091</strong>
                  <span className="text-slate-300">Women Tourist Safety Response</span>
                </div>
              </div>
            )}
          </div>

          {/* Scam Awareness */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <button
              onClick={() => setSafetySectionOpen(safetySectionOpen === 'scams' ? '' : 'scams')}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Scam & Pickpocket Awareness Tips</span>
              </div>
              {safetySectionOpen === 'scams' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {safetySectionOpen === 'scams' && (
              <div className="p-4 pt-0 border-t border-slate-800 space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 space-y-1">
                  <strong className="text-white">Gemstone Export "Commission" Scheme</strong>
                  <p className="text-slate-400">Politely decline strangers offering you jewelry parcels to sell abroad. Only purchase certified stones with official receipts.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 space-y-1">
                  <strong className="text-white">Unauthorized Monument "Guides"</strong>
                  <p className="text-slate-400">Hire only Archaeological Survey of India (ASI) guides carrying verifiable photo ID badges at the monument ticket office.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
