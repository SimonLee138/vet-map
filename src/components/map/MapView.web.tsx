import type { CircleMarker, Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';

import type { MappedClinic } from '@/data/clinics';
import type { Coordinates, PermissionStatus } from '@/hooks/useLocation';
import type { Clinic } from '@/types/clinic';

type MapViewProps = {
  location: Coordinates | null;
  permissionStatus: PermissionStatus;
  clinics: MappedClinic[];
  onClinicSelect?: (clinic: Clinic) => void;
};

const DEFAULT_CENTER: [number, number] = [22.339347563319834, 114.15269326513197];

export function MapView({ location, permissionStatus, clinics, onClinicSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const clinicMarkersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      if (!containerRef.current || mapRef.current) return;
      const leaflet = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      const map = leaflet.map(containerRef.current).setView(DEFAULT_CENTER, 13);
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(map);
      const clinicIcon = leaflet.divIcon({
        className: 'clinic-marker-icon',
        html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#d94b4b;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 24],
        popupAnchor: [0, -24],
      });
      clinicMarkersRef.current = clinics.map((clinic) =>
        leaflet
          .marker([clinic.latitude, clinic.longitude], { icon: clinicIcon })
          .addTo(map)
          .bindPopup(clinic.name)
          .on('click', () => onClinicSelect?.(clinic)),
      );
      mapRef.current = map;
      setMapReady(true);
    }

    void createMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      clinicMarkersRef.current = [];
      setMapReady(false);
    };
  }, [clinics, onClinicSelect]);

  useEffect(() => {
    if (!location || !mapReady) return;
    void import('leaflet').then((leaflet) => {
      if (!mapRef.current) return;
      const coordinates: [number, number] = [location.latitude, location.longitude];
      markerRef.current?.remove();
      markerRef.current = leaflet
        .circleMarker(coordinates, {
          radius: 9,
          color: '#ffffff',
          weight: 3,
          fillColor: '#176b87',
          fillOpacity: 1,
        })
        .addTo(mapRef.current);
      mapRef.current.flyTo(coordinates, 15, { duration: 1 });
    });
  }, [location, mapReady]);

  const permissionLabel =
    permissionStatus === 'granted'
      ? 'Location permission enabled'
      : permissionStatus === 'denied'
        ? 'Location permission disabled - showing default map area'
        : 'Checking location permission...';

  return (
    <div ref={containerRef} style={styles}>
      <div style={statusStyles(permissionStatus)}>{permissionLabel}</div>
    </div>
  );
}

const styles = {
  position: 'relative' as const,
  flex: 1,
  minHeight: 360,
  width: '100%',
} as const;

const statusStyles = (permissionStatus: PermissionStatus) => ({
  position: 'absolute' as const,
  top: 12,
  left: 0,
  right: 0,
  zIndex: 1000,
  margin: '0 auto',
  width: 'fit-content',
  padding: '8px 12px',
  borderRadius: 8,
  backgroundColor: permissionStatus === 'granted' ? '#e4f5ec' : '#fff4d6',
  color: permissionStatus === 'granted' ? '#176b4d' : '#7a5511',
  fontSize: 13,
  fontWeight: 600,
});
