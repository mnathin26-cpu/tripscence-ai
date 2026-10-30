/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Layers, AlertTriangle } from 'lucide-react';
import { NearbyPlace, RouteCondition } from '../types/travel.js';

interface InteractiveMapProps {
  destinationCoords: { lat: number; lng: number };
  destinationName: string;
  userCoords: { lat: number; lng: number; accuracy?: number } | null;
  places: NearbyPlace[];
  route?: RouteCondition | null;
  onSelectPlace?: (place: NearbyPlace) => void;
  selectedPlace?: NearbyPlace | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  destinationCoords,
  destinationName,
  userCoords,
  places,
  route,
  onSelectPlace,
  selectedPlace
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'attractions' | 'food' | 'emergency'>('all');
  const [trafficVisible, setTrafficVisible] = useState(true);

  // Initialize Leaflet
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      try {
        const L = (window as any).L || (await import('leaflet'));

        if (!isMounted || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [destinationCoords.lat, destinationCoords.lng],
          zoom: 13,
          zoomControl: false
        });

        // Add zoom control to top-right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // OpenStreetMap Dark/CartoDB Dark Matter tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(map);

        leafletMapRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);

        setMapLoaded(true);
      } catch (err) {
        console.error('Leaflet initialization failed:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Center when destination coords change
  useEffect(() => {
    if (leafletMapRef.current && destinationCoords) {
      leafletMapRef.current.setView([destinationCoords.lat, destinationCoords.lng], 13);
    }
  }, [destinationCoords]);

  // Update Place Markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    markersGroupRef.current.clearLayers();

    // Filter places
    const filteredPlaces = places.filter((p) => {
      if (activeLayer === 'all') return true;
      if (activeLayer === 'attractions') return p.category === 'attraction' || p.category === 'culture';
      if (activeLayer === 'food') return p.category === 'food';
      if (activeLayer === 'emergency') return p.category === 'emergency';
      return true;
    });

    filteredPlaces.forEach((place) => {
      if (!place.coordinates) return;

      const isSelected = selectedPlace?.id === place.id;
      const isEmergency = place.category === 'emergency';
      const isFood = place.category === 'food';

      const color = isEmergency ? '#ef4444' : isFood ? '#f59e0b' : '#3b82f6';
      const size = isSelected ? 36 : 28;

      const iconHtml = `
        <div style="
          background: ${color};
          color: white;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 2px solid white;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transform: translate(-50%, -50%);
        ">
          ${isEmergency ? '🚑' : isFood ? '🍽️' : '🏛️'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [size, size]
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon: customIcon });

      const popupContent = `
        <div style="min-width: 190px; padding: 4px;">
          <h4 style="font-weight: 700; margin-bottom: 4px; font-size: 13px;">${place.name}</h4>
          <p style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">${place.description.slice(0, 90)}...</p>
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 600;">
            <span style="color: #f59e0b;">★ ${place.rating}</span>
            <span style="color: #10b981;">₹${place.approx_cost}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      markersGroupRef.current.addLayer(marker);
    });

    // Destination City Center Pin
    const destIcon = L.divIcon({
      className: 'dest-center-marker',
      html: `
        <div style="
          background: #8b5cf6;
          color: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(139,92,246,0.6);
          white-space: nowrap;
          border: 1px solid white;
          transform: translate(-50%, -100%);
        ">
          📍 ${destinationName} Center
        </div>
      `,
      iconSize: [80, 24]
    });
    const destMarker = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon });
    markersGroupRef.current.addLayer(destMarker);
  }, [places, activeLayer, selectedPlace, destinationCoords, destinationName, onSelectPlace]);

  // Update Route Polyline & Traffic
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (routePolylineRef.current) {
      leafletMapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (route && route.route_polyline && route.route_polyline.length > 1 && trafficVisible) {
      // Traffic color: green for low, amber for moderate, red for heavy
      const trafficColor =
        route.congestion_level === 'severe'
          ? '#ef4444'
          : route.congestion_level === 'heavy'
          ? '#f97316'
          : route.congestion_level === 'moderate'
          ? '#f59e0b'
          : '#10b981';

      const polyline = L.polyline(route.route_polyline, {
        color: trafficColor,
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        dashArray: undefined
      }).addTo(leafletMapRef.current);

      routePolylineRef.current = polyline;
    }
  }, [route, trafficVisible]);

  // Update User GPS Marker
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (userMarkerRef.current) {
      leafletMapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-gps-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 18px;
              height: 18px;
              background: #06b6d4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 16px #06b6d4;
            "></div>
            <div style="
              position: absolute;
              top: -6px;
              left: -6px;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: rgba(6,182,212,0.25);
              animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          </div>
        `,
        iconSize: [20, 20]
      });

      const marker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(leafletMapRef.current);
      marker.bindPopup(`<b>Your Live Location</b><br/>GPS Accuracy: ±${Math.round(userCoords.accuracy || 20)}m`);
      userMarkerRef.current = marker;
    }
  }, [userCoords]);

  const fitBoundsToAll = () => {
    if (!leafletMapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const points: [number, number][] = [[destinationCoords.lat, destinationCoords.lng]];
    if (userCoords) points.push([userCoords.lat, userCoords.lng]);
    if (route?.route_polyline) points.push(...route.route_polyline);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      leafletMapRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else {
      leafletMapRef.current.setView([destinationCoords.lat, destinationCoords.lng], 13);
    }
  };

  return (
    <div className="relative w-full h-[420px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control HUD Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeLayer === 'all' ? 'bg-amber-500 text-black shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveLayer('attractions')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeLayer === 'attractions' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🏛️ Sights
          </button>
          <button
            onClick={() => setActiveLayer('food')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeLayer === 'food' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🍽️ Food
          </button>
          <button
            onClick={() => setActiveLayer('emergency')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              activeLayer === 'emergency' ? 'bg-rose-600 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚑 24/7 Med
          </button>
        </div>

        <button
          onClick={() => setTrafficVisible(!trafficVisible)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-lg transition-colors ${
            trafficVisible
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Traffic Polyline: {trafficVisible ? 'On' : 'Off'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={fitBoundsToAll}
          title="Fit view to route & destination"
          className="p-2.5 bg-slate-900/90 text-white hover:bg-slate-800 rounded-xl border border-slate-700/80 shadow-xl transition-all"
        >
          <Compass className="w-4 h-4 text-amber-400" />
        </button>
        {userCoords && (
          <button
            onClick={() => {
              if (leafletMapRef.current && userCoords) {
                leafletMapRef.current.setView([userCoords.lat, userCoords.lng], 15);
              }
            }}
            title="Locate my position"
            className="p-2.5 bg-cyan-600 text-white hover:bg-cyan-500 rounded-xl shadow-xl transition-all"
          >
            <Navigation className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Traffic Congestion Pill */}
      {route && trafficVisible && (
        <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-xs shadow-xl flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              route.congestion_level === 'severe'
                ? 'bg-rose-500 animate-ping'
                : route.congestion_level === 'moderate'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-slate-300">
            Route Traffic: <strong className="capitalize text-white">{route.congestion_level}</strong>
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-400 font-medium">ETA: {Math.round(route.live_traffic_duration_minutes / 60)}h {route.live_traffic_duration_minutes % 60}m</span>
        </div>
      )}
    </div>
  );
};
