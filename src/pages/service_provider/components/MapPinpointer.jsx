import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, Loader2 } from 'lucide-react';
import { toast } from '../../../utils/toast';

const MapPinpointer = ({ latitude, longitude, onCoordinatesChange, isDarkMode }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);

  // Load Leaflet JS & CSS dynamically from CDN to avoid bundler conflicts with React 19
  useEffect(() => {
    let scriptLoaded = false;
    let linkAdded = false;

    const loadLeafletAssets = async () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      // Check if Leaflet CSS link is already in document head
      let leafletCSS = document.querySelector('link[href*="leaflet.css"]');
      if (!leafletCSS) {
        leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        leafletCSS.crossOrigin = '';
        document.head.appendChild(leafletCSS);
        linkAdded = true;
      }

      // Check if Leaflet script is already in document body
      let leafletJS = document.querySelector('script[src*="leaflet.js"]');
      if (!leafletJS) {
        leafletJS = document.createElement('script');
        leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletJS.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        leafletJS.crossOrigin = '';
        leafletJS.onload = () => {
          setMapLoaded(true);
        };
        document.body.appendChild(leafletJS);
        scriptLoaded = true;
      } else {
        // Script already existed but window.L might not be resolved yet
        const checkL = setInterval(() => {
          if (window.L) {
            clearInterval(checkL);
            setMapLoaded(true);
          }
        }, 100);
      }
    };

    loadLeafletAssets();

    return () => {
      // We don't necessarily delete scripts/styles to avoid re-fetching on toggle,
      // but we will clean up map instances in another useEffect
    };
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !window.L || !containerRef.current) return;

    const L = window.L;
    const initialLat = Number(latitude) || 28.5245; // Defaults to Gorakhpur (approx) or Delhi region
    const initialLng = Number(longitude) || 77.2066;

    if (!mapRef.current) {
      const mapInstance = L.map(containerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Custom marker icon styled with FASHIONFEVER primary rose-pink color theme
      const customIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center relative">
            <span class="absolute flex h-5 w-5 -top-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#da016a] opacity-40"></span>
              <span class="relative inline-flex rounded-full h-5 w-5 bg-[#da016a] opacity-80 border-2 border-white"></span>
            </span>
            <div class="w-8 h-8 flex items-center justify-center bg-[#da016a] text-white rounded-full shadow-lg border-2 border-white transform translate-y-[-16px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const markerInstance = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true
      }).addTo(mapInstance);

      // Marker drag updates coordinates
      markerInstance.on('dragend', () => {
        const pos = markerInstance.getLatLng();
        onCoordinatesChange(pos.lat, pos.lng);
      });

      // Clicking on map drops marker
      mapInstance.on('click', (e) => {
        markerInstance.setLatLng(e.latlng);
        onCoordinatesChange(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = mapInstance;
      markerRef.current = markerInstance;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Sync marker position when lat/lng are updated manually in text boxes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !window.L) return;

    const markerPos = markerRef.current.getLatLng();
    const targetLat = Number(latitude) || 0;
    const targetLng = Number(longitude) || 0;

    if (Math.abs(markerPos.lat - targetLat) > 0.0001 || Math.abs(markerPos.lng - targetLng) > 0.0001) {
      markerRef.current.setLatLng([targetLat, targetLng]);
      mapRef.current.panTo([targetLat, targetLng]);
    }
  }, [latitude, longitude]);

  // OpenStreetMap Nominatim Geocoding API Search
  const handleGeocodeSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);

        onCoordinatesChange(newLat, newLng);
        if (mapRef.current) {
          mapRef.current.setView([newLat, newLng], 14);
        }
        toast.success(`Centered on: ${result.display_name.split(',')[0]}`);
      } else {
        toast.error("Location not found on map. Try entering a nearby city or landmark.");
      }
    } catch (err) {
      console.error("Geocoding fetch error:", err);
      toast.error("Network error. Location search is unavailable.");
    } finally {
      setGeocoding(false);
    }
  };

  // Locate current position using browser Geolocation GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Your browser doesn't support device GPS location");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;

        onCoordinatesChange(uLat, uLng);
        if (mapRef.current) {
          mapRef.current.setView([uLat, uLng], 15);
        }
        toast.success("Retrieved current device GPS coordinates!");
        setLocating(false);
      },
      (err) => {
        console.error("GPS retrieval failed:", err);
        toast.error("Location permission denied or retrieval timed out.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-3 mt-4">
      {/* Top search & geolocation control row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleGeocodeSearch} className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Search city/address to pinpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-4 pr-10 py-2 rounded-xl text-xs font-semibold outline-none border transition-all ${
              isDarkMode
                ? 'bg-gray-950 border-gray-800 text-white focus:border-primary/40'
                : 'bg-gray-50 border-gray-150 text-gray-850 focus:bg-white focus:border-primary/20'
            }`}
          />
          <button
            type="submit"
            disabled={geocoding || !mapLoaded}
            className="absolute right-2 text-gray-400 hover:text-primary transition-colors cursor-pointer"
          >
            {geocoding ? (
              <Loader2 size={14} className="animate-spin text-primary" />
            ) : (
              <Search size={14} />
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleLocateUser}
          disabled={locating || !mapLoaded}
          className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all duration-200 cursor-pointer border ${
            isDarkMode
              ? 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
              : 'bg-gray-50 border-gray-150 text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          {locating ? (
            <Loader2 size={13} className="animate-spin text-primary" />
          ) : (
            <Navigation size={13} className="text-primary" />
          )}
          <span>{locating ? 'Locating...' : 'Locate Me'}</span>
        </button>
      </div>

      {/* Leaflet container container */}
      <div 
        className={`w-full h-64 md:h-72 rounded-2xl overflow-hidden border relative z-0 ${
          isDarkMode ? 'border-gray-800' : 'border-gray-150'
        }`}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-500/5 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 z-10">
            <Loader2 size={28} className="animate-spin text-primary mb-2" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
              Initializing Map Tiles...
            </p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: '100%' }} />
      </div>
      
      <p className="text-xs font-medium text-gray-400 uppercase leading-normal tracking-wide">
        💡 Drag the pink pin or click anywhere on the map to pinpoint your exact salon coordinates.
      </p>
    </div>
  );
};

export default MapPinpointer;
