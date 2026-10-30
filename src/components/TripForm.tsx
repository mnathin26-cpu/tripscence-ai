/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  Sliders,
  Check,
  Building,
  Heart,
  ShieldCheck,
  Clock,
  Compass,
  ArrowRight,
  Globe,
  Landmark,
  Layers,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { TravelStyle, TripConstraints, TripPreferences } from '../types/travel.js';

interface TripFormProps {
  onSubmitTrip: (tripData: any) => Promise<void>;
  isLoading: boolean;
  onPreloadJaipurDemo: () => void;
  onFinishToPackages?: () => void;
  hasActiveTrip?: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  onSubmitTrip,
  isLoading,
  onPreloadJaipurDemo,
  onFinishToPackages,
  hasActiveTrip = false
}) => {
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Jaipur');
  const [startDate, setStartDate] = useState('2026-11-12');
  const [endDate, setEndDate] = useState('2026-11-15');
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState(45000);
  const [currency, setCurrency] = useState('INR');
  const [travelStyle, setTravelStyle] = useState<TravelStyle>('comfort');
  const [destinationRegionFilter, setDestinationRegionFilter] = useState<'all' | 'tamilnadu' | 'india' | 'global'>('all');

  const [preferences, setPreferences] = useState<TripPreferences>({
    heritage: true,
    sightseeing: true,
    food: true,
    shopping: true,
    nature: false,
    nightlife: false,
    accessibility: true,
    family_friendly: true
  });

  const [constraints, setConstraints] = useState<TripConstraints>({
    dietary: 'vegetarian',
    non_smoking_rooms: true,
    wheelchair_access: true,
    avoid_early_departure: true,
    direct_flights_only: false,
    max_walking_km: 4,
    notes: 'Strict vegetarian food, no crack-of-dawn departures before 7 AM'
  });

  const togglePreference = (key: keyof TripPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDestinationChange = (val: string) => {
    setDestination(val);

    // Dynamic smart presets based on destination
    if (['Paris', 'Rome'].includes(val)) {
      setCurrency('EUR');
      setBudget(2500);
      setOrigin('London');
    } else if (['New York'].includes(val)) {
      setCurrency('USD');
      setBudget(2800);
      setOrigin('Toronto');
    } else if (['London'].includes(val)) {
      setCurrency('GBP');
      setBudget(2200);
      setOrigin('Edinburgh');
    } else if (['Tokyo'].includes(val)) {
      setCurrency('JPY');
      setBudget(350000);
      setOrigin('Seoul');
    } else if (['Dubai'].includes(val)) {
      setCurrency('AED');
      setBudget(9500);
      setOrigin('Mumbai');
    } else if (['Singapore'].includes(val)) {
      setCurrency('SGD');
      setBudget(3200);
      setOrigin('Kuala Lumpur');
    } else if (['Zurich'].includes(val)) {
      setCurrency('CHF');
      setBudget(3400);
      setOrigin('Frankfurt');
    } else if (['Sydney'].includes(val)) {
      setCurrency('AUD');
      setBudget(3800);
      setOrigin('Melbourne');
    } else if (['Bali', 'Bangkok'].includes(val)) {
      setCurrency('USD');
      setBudget(1800);
      setOrigin('Singapore');
    } else if (['Chennai', 'Madurai', 'Ooty', 'Kodaikanal', 'Rameswaram', 'Thanjavur', 'Kanchipuram', 'Mahabalipuram', 'Coimbatore', 'Kanyakumari', 'Tiruchirappalli', 'Tamil Nadu'].includes(val)) {
      setCurrency('INR');
      setBudget(val === 'Ooty' || val === 'Kodaikanal' ? 32000 : 36000);
      if (val === 'Ooty') setOrigin('Coimbatore');
      else if (val === 'Madurai' || val === 'Rameswaram') setOrigin('Chennai');
      else setOrigin('Bengaluru');
    } else {
      setCurrency('INR');
      setBudget(45000);
      setOrigin('Delhi');
    }
  };

  const handleSubmit = async (e?: React.FormEvent, thenGoToPackages = false) => {
    if (e) e.preventDefault();
    await onSubmitTrip({
      title: `${travelStyle.toUpperCase()} Trip to ${destination}`,
      origin,
      destination,
      start_date: startDate,
      end_date: endDate,
      travellers,
      total_budget: budget,
      currency,
      travel_style: travelStyle,
      preferences,
      constraints
    });

    if (thenGoToPackages && onFinishToPackages) {
      onFinishToPackages();
    }
  };

  // Check if primary parameters are configured
  const isFormConfigured = Boolean(origin && destination && startDate && endDate && budget > 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300">
      {/* Subtle background luxury glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Sequential Workflow Order Indicator */}
      <div className="mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" /> 6-Step Autonomous Travel Pipeline
          </span>
          <span className="text-xs text-slate-400 font-mono">Current: Step 1 of 6</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-between shadow-sm">
            <span>1. Planner</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>2. Packages</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>3. Verification</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>4. Companion</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>5. Replanning</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-medium flex items-center gap-1">
            <span>6. Tests</span>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Trip Coordinator Agent
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white mt-1">
            Design Your Tailored Itinerary
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Select from world-class global destinations, vibrant Indian cities, or sacred Tamil Nadu temple corridors. Multi-agent specialists evaluate route timings, accommodation, and dietary compliance.
          </p>
        </div>

        {/* Demo Quick Button */}
        <button
          type="button"
          onClick={onPreloadJaipurDemo}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Preload Jaipur Demo</span>
        </button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Row 1: Origin & Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Origin City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Delhi, Chennai, London"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Destination City or Region
              </label>
              {/* Region Quick Filters */}
              <div className="flex items-center gap-1 text-[10px]">
                {(['all', 'tamilnadu', 'india', 'global'] as const).map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setDestinationRegionFilter(reg)}
                    className={`px-2 py-0.5 rounded uppercase font-semibold transition-colors cursor-pointer ${
                      destinationRegionFilter === reg
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {reg === 'tamilnadu' ? 'Tamil Nadu' : reg}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <select
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {(destinationRegionFilter === 'all' || destinationRegionFilter === 'tamilnadu') && (
                  <optgroup label="🌟 Tamil Nadu Regions & Hill Stations">
                    <option value="Tamil Nadu">Tamil Nadu (Grand Temple Corridor & Chettinad)</option>
                    <option value="Chennai">Chennai (Marina Beach, Kapaleeshwarar & Cultural Capital)</option>
                    <option value="Madurai">Madurai (Meenakshi Amman Temple & Legendary Food)</option>
                    <option value="Ooty">Ooty, Nilgiris (Tea Plantations, Toy Train & Peaks)</option>
                    <option value="Kodaikanal">Kodaikanal (Princess of Hill Stations & Pine Forests)</option>
                    <option value="Rameswaram">Rameswaram (Pamban Sea Bridge & Island Sanctuary)</option>
                    <option value="Thanjavur">Thanjavur (Brihadeeswara UNESCO Temple & Chola Art)</option>
                    <option value="Kanchipuram">Kanchipuram (City of 1,000 Temples & Pure Mulberry Silk)</option>
                    <option value="Mahabalipuram">Mahabalipuram (UNESCO Shore Temple & Rock Reliefs)</option>
                    <option value="Coimbatore">Coimbatore (Siruvani Foothills & Textile Heritage)</option>
                    <option value="Kanyakumari">Kanyakumari (Vivekananda Rock & Southernmost Tri-Sea Confluence)</option>
                    <option value="Tiruchirappalli">Tiruchirappalli / Trichy (Rockfort & Srirangam Temple)</option>
                  </optgroup>
                )}

                {(destinationRegionFilter === 'all' || destinationRegionFilter === 'india') && (
                  <optgroup label="🇮🇳 Major India Destinations">
                    <option value="Jaipur">Jaipur, Rajasthan (Royal Forts & Haveli Heritage)</option>
                    <option value="Delhi">Delhi, NCR (Red Fort, Qutub Minar & Historic Bazaars)</option>
                    <option value="Agra">Agra, Uttar Pradesh (Taj Mahal & Mughal Splendor)</option>
                    <option value="Mumbai">Mumbai, Maharashtra (Gateway of India, Marine Drive & Cinema)</option>
                    <option value="Bengaluru">Bengaluru, Karnataka (Garden City, Tech Hub & Craft Breweries)</option>
                    <option value="Goa">Goa (Sun, Sand, Latin Quarter & Coastal Cuisine)</option>
                    <option value="Manali">Manali, Himachal Pradesh (Snow Passes & Alpine Valleys)</option>
                    <option value="Kochi">Kochi, Kerala (Backwaters, Chinese Fishing Nets & Spices)</option>
                    <option value="Varanasi">Varanasi, UP (Sacred Ganga Ghats & Evening Aarti)</option>
                    <option value="Hyderabad">Hyderabad, Telangana (Charminar, Golconda & Dum Biryani)</option>
                    <option value="Kolkata">Kolkata, West Bengal (Victoria Memorial & Cultural Trams)</option>
                  </optgroup>
                )}

                {(destinationRegionFilter === 'all' || destinationRegionFilter === 'global') && (
                  <optgroup label="🌍 Global Iconic Cities">
                    <option value="Paris">Paris, France (Eiffel Tower, Louvre & Seine Romance)</option>
                    <option value="Tokyo">Tokyo, Japan (Shibuya Crossing, Senso-ji & Mount Fuji Gateway)</option>
                    <option value="London">London, UK (Big Ben, London Eye, Thames & West End)</option>
                    <option value="New York">New York, USA (Manhattan, Central Park & Broadway)</option>
                    <option value="Dubai">Dubai, UAE (Burj Khalifa, Palm Jumeirah & Desert Safaris)</option>
                    <option value="Singapore">Singapore (Marina Bay Sands, Supertrees & Gardens)</option>
                    <option value="Rome">Rome, Italy (Colosseum, Vatican & Trevi Fountain)</option>
                    <option value="Bali">Bali, Indonesia (Ubud Art, Rice Terraces & Uluwatu)</option>
                    <option value="Bangkok">Bangkok, Thailand (Grand Palace, Wat Arun & Street Food)</option>
                    <option value="Zurich">Zurich, Switzerland (Lake Zurich & Swiss Alps)</option>
                    <option value="Sydney">Sydney, Australia (Opera House, Harbour Bridge & Bondi)</option>
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Inspiration Pickers */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Featured Destinations:
          </span>
          <button
            type="button"
            onClick={() => handleDestinationChange('Madurai')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Madurai'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            🛕 Madurai Temples (₹36k)
          </button>
          <button
            type="button"
            onClick={() => handleDestinationChange('Ooty')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Ooty'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            🚂 Ooty Hills (₹32k)
          </button>
          <button
            type="button"
            onClick={() => handleDestinationChange('Paris')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Paris'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            🇫🇷 Paris (€2,500)
          </button>
          <button
            type="button"
            onClick={() => handleDestinationChange('Tokyo')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Tokyo'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            🇯🇵 Tokyo (¥350,000)
          </button>
          <button
            type="button"
            onClick={() => handleDestinationChange('Dubai')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Dubai'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            🇦🇪 Dubai (AED 9,500)
          </button>
          <button
            type="button"
            onClick={() => handleDestinationChange('Jaipur')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              destination === 'Jaipur'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            👑 Jaipur Royal (₹45k)
          </button>
        </div>

        {/* Row 2: Dates, Travellers, Budget, Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Travellers
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="1"
                max="20"
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Total Budget & Currency
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Wallet className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              >
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="SGD">SGD (S$)</option>
                <option value="CHF">CHF (Fr)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 3: Travel Style */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Travel Style Selection
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'budget', label: 'Economy / Budget', desc: 'Hostels, shared transit, high value' },
              { id: 'balanced', label: 'Balanced Value', desc: '3-star hotels, cabs, optimal mix' },
              { id: 'comfort', label: 'High Comfort', desc: '4-star heritage havelis & express rails' },
              { id: 'luxury', label: 'Luxury Prestige', desc: '5-star royal palaces & private drivers' }
            ].map((style) => (
              <button
                type="button"
                key={style.id}
                onClick={() => setTravelStyle(style.id as TravelStyle)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  travelStyle === style.id
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs capitalize text-white">{style.label}</span>
                  {travelStyle === style.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{style.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Preferences Multi-select */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Trip Experience Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'sightseeing', label: 'Sightseeing' },
              { id: 'heritage', label: 'Royal Heritage & Temples' },
              { id: 'food', label: 'Food & Culinary' },
              { id: 'shopping', label: 'Local Bazaars & Silk' },
              { id: 'nature', label: 'Nature & Gardens' },
              { id: 'nightlife', label: 'Nightlife & Lounges' },
              { id: 'family_friendly', label: 'Family Friendly' },
              { id: 'accessibility', label: 'Wheelchair / Step-Free' }
            ].map((pref) => {
              const active = Boolean(preferences[pref.id as keyof TripPreferences]);
              return (
                <button
                  type="button"
                  key={pref.id}
                  onClick={() => togglePreference(pref.id as keyof TripPreferences)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-400' : 'bg-slate-600'}`} />
                  <span>{pref.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 5: Constraints Section */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Constraints Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Dietary Constraint (Avoid conflicts)
              </label>
              <select
                value={constraints.dietary || 'vegetarian'}
                onChange={(e) => setConstraints({ ...constraints, dietary: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="vegetarian">Strict Vegetarian (No meat/fish)</option>
                <option value="vegan">100% Vegan (No dairy/animal byproducts)</option>
                <option value="halal">Halal Certified</option>
                <option value="gluten_free">Gluten Free</option>
                <option value="none">No Specific Dietary Restriction</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300">Avoid Early Departure (&lt;7:00 AM)</span>
              <input
                type="checkbox"
                checked={constraints.avoid_early_departure}
                onChange={(e) => setConstraints({ ...constraints, avoid_early_departure: e.target.checked })}
                className="accent-amber-500 h-4 w-4 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-300">Non-Smoking Rooms</span>
              <input
                type="checkbox"
                checked={constraints.non_smoking_rooms}
                onChange={(e) => setConstraints({ ...constraints, non_smoking_rooms: e.target.checked })}
                className="accent-amber-500 h-4 w-4 rounded"
              />
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION CONTROLS & FINISHER BUTTON */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Generate Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Orchestrating Multi-Agent Specialists...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Itinerary with TripSense Agents</span>
              </>
            )}
          </button>

          {/* User Requested "FINISHER BUTTON": finishes all detail selection and goes automatically to "Packages" */}
          {isFormConfigured && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSubmit(undefined, true)}
              title="Finish parameter selection and navigate directly to Step 2: Budget Packages"
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/50 hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Finish & Compare Packages (Step 2)</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
