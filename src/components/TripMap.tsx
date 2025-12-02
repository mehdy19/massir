import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";

interface TripMapProps {
  tripId: string;
  initialLocation?: { lat: number; lng: number } | null;
  fromCity?: string;
  toCity?: string;
}

const TripMap = ({ tripId, initialLocation, fromCity, toCity }: TripMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;

    const defaultCenter: [number, lng: number] = [3.0, 36.7]; // Algeria center
    const center: [number, number] = currentLocation 
      ? [currentLocation.lng, currentLocation.lat]
      : defaultCenter;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: center,
      zoom: currentLocation ? 12 : 6,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker if location exists
    if (currentLocation) {
      marker.current = new mapboxgl.Marker({ color: "#22c55e" })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div style="padding: 8px;">
              <p style="font-weight: bold; margin-bottom: 4px;">موقع السائق الحالي</p>
              <p style="font-size: 12px; color: #666;">${fromCity || ""} → ${toCity || ""}</p>
            </div>`
          )
        )
        .addTo(map.current);
    }

    // Subscribe to realtime location updates
    const channel = supabase
      .channel(`trip-location-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trips",
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const newLocation = payload.new.current_location as { lat: number; lng: number } | null;
          if (newLocation && map.current) {
            setCurrentLocation(newLocation);
            
            // Update or create marker
            if (marker.current) {
              marker.current.setLngLat([newLocation.lng, newLocation.lat]);
            } else {
              marker.current = new mapboxgl.Marker({ color: "#22c55e" })
                .setLngLat([newLocation.lng, newLocation.lat])
                .setPopup(
                  new mapboxgl.Popup().setHTML(
                    `<div style="padding: 8px;">
                      <p style="font-weight: bold; margin-bottom: 4px;">موقع السائق الحالي</p>
                      <p style="font-size: 12px; color: #666;">${fromCity || ""} → ${toCity || ""}</p>
                    </div>`
                  )
                )
                .addTo(map.current);
            }
            
            // Center map on new location
            map.current.flyTo({
              center: [newLocation.lng, newLocation.lat],
              zoom: 12,
              duration: 1000,
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      map.current?.remove();
    };
  }, [tripId, fromCity, toCity, mapboxToken]);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-medium">
      <div ref={mapContainer} className="absolute inset-0" />
      {!currentLocation && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <p className="text-lg font-semibold mb-2">لم يبدأ السائق مشاركة موقعه بعد</p>
            <p className="text-sm text-muted-foreground">سيظهر الموقع المباشر عند بدء الرحلة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripMap;
