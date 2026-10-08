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
  selectedClinicId?: string;
  onClinicSelect?: (clinic: Clinic) => void;
};

const DEFAULT_CENTER: [number, number] = [22.339347563319834, 114.15269326513197];
const MAP_TIME_ZONE = 'Asia/Hong_Kong';

function isClinicOpenNow(clinic: MappedClinic, now: Date) {
  if (clinic.isOpen24Hours || /24\s*hours/i.test(clinic.openingHours ?? '')) return true;

  const hours = clinic.openingHours ?? '';
  const range = hours.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
  if (!range) return false;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MAP_TIME_ZONE,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  const weekdaySchedule = /weekdays/i.test(hours);
  if (weekdaySchedule && (weekday === 'Sat' || weekday === 'Sun')) return false;

  const toMinutes = (time: string) => {
    const match = time.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!match) return 0;
    let parsedHour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') parsedHour += 12;
    return parsedHour * 60 + Number(match[2]);
  };

  const currentMinutes = hour * 60 + minute;
  const opensAt = toMinutes(range[1]);
  const closesAt = toMinutes(range[2]);
  return closesAt < opensAt
    ? currentMinutes >= opensAt || currentMinutes < closesAt
    : currentMinutes >= opensAt && currentMinutes < closesAt;
}

function createClinicIcon(leaflet: typeof import('leaflet'), isOpen: boolean) {
  const color = isOpen ? '#24a148' : '#d94b4b';
  return leaflet.divIcon({
    className: 'clinic-marker-icon',
    html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg)"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
    popupAnchor: [0, -24],
  });
}

export function MapView({
  location,
  permissionStatus,
  clinics,
  selectedClinicId,
  onClinicSelect,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const clinicMarkersRef = useRef<Map<string, Marker>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      if (!containerRef.current || mapRef.current) return;
      const leaflet = await import('leaflet');
      if (cancelled || !containerRef.current) return;

      const map = leaflet.map(containerRef.current).setView(DEFAULT_CENTER, 13);
      const relocateControl = new leaflet.Control({ position: 'topright' });
      relocateControl.onAdd = () => {
        const button = leaflet.DomUtil.create('button', 'leaflet-relocate-button');
        button.type = 'button';
        button.title = 'Relocate to current position';
        button.setAttribute('aria-label', 'Relocate to current position');
        button.innerHTML = 'Locate';
        button.style.cssText =
          'padding:8px 10px;border:1px solid #c8ced6;border-radius:6px;background:#fff;color:#176b87;font-weight:600;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.18)';
        leaflet.DomEvent.disableClickPropagation(button);
        leaflet.DomEvent.on(button, 'click', () => {
          map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
        });
        return button;
      };
      relocateControl.addTo(map);
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        })
        .addTo(map);
      mapRef.current = map;
      setMapReady(true);
    }

    void createMap();
    return () => {
      cancelled = true;
      mapRef.current?.stopLocate();
      mapRef.current?.remove();
      mapRef.current = null;
      clinicMarkersRef.current.clear();
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    let cancelled = false;
    async function syncClinicMarkers() {
      const leaflet = await import('leaflet');
      if (cancelled || !mapRef.current) return;

      const visibleClinicIds = new Set(clinics.map((clinic) => clinic.id));
      for (const [clinicId, marker] of clinicMarkersRef.current) {
        if (!visibleClinicIds.has(clinicId)) {
          marker.remove();
          clinicMarkersRef.current.delete(clinicId);
        }
      }

      for (const clinic of clinics) {
        const icon = createClinicIcon(leaflet, isClinicOpenNow(clinic, new Date()));
        const existingMarker = clinicMarkersRef.current.get(clinic.id);
        const marker = existingMarker ?? leaflet.marker([clinic.latitude, clinic.longitude]).addTo(mapRef.current!);

        marker
          .setLatLng([clinic.latitude, clinic.longitude])
          .setIcon(icon)
          .bindPopup(clinic.name)
          .off('click')
          .on('click', () => onClinicSelect?.(clinic));

        if (!existingMarker) clinicMarkersRef.current.set(clinic.id, marker);
      }
    }

    void syncClinicMarkers();
    return () => {
      cancelled = true;
    };
  }, [clinics, mapReady, onClinicSelect]);

  useEffect(() => {
    const updateClinicMarkerColors = async () => {
      const leaflet = await import('leaflet');
      const now = new Date();
      clinics.forEach((clinic) => {
        const marker = clinicMarkersRef.current.get(clinic.id);
        marker?.setIcon(createClinicIcon(leaflet, isClinicOpenNow(clinic, now)));
      });
    };

    void updateClinicMarkerColors();
    const interval = setInterval(() => void updateClinicMarkerColors(), 60_000);
    return () => clearInterval(interval);
  }, [clinics, mapReady]);

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

  useEffect(() => {
    if (!selectedClinicId || !mapReady || !mapRef.current) return;
    const clinic = clinics.find((item) => item.id === selectedClinicId);
    if (!clinic) return;

    mapRef.current.flyTo([clinic.latitude, clinic.longitude], 16, { duration: 1 });
  }, [clinics, mapReady, selectedClinicId]);
  return (
    <div ref={containerRef} style={styles}></div>
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
