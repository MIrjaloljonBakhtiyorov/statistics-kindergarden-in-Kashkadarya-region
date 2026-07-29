import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, ExternalLink, Loader2, LocateFixed, MapPin, Minus, Plus } from 'lucide-react';

type LocationPickerProps = {
  lat?: string | number | null;
  lng?: string | number | null;
  onChange?: (value: { lat: number | null; lng: number | null }) => void;
  readOnly?: boolean;
  label?: string;
  markerLabel?: string;
  showCoordinates?: boolean;
  showControls?: boolean;
  hideHeader?: boolean;
  className?: string;
  mapClassName?: string;
};

const TILE_SIZE = 256;
const DEFAULT_LAT = 38.8606;
const DEFAULT_LNG = 65.789;
const DEFAULT_ZOOM = 13;
const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

const toNumber = (value?: string | number | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampLat = (lat: number) => Math.max(-85.0511, Math.min(85.0511, lat));
const clampLng = (lng: number) => Math.max(-180, Math.min(180, lng));

const lngToX = (lng: number, zoom: number) => ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
const latToY = (lat: number, zoom: number) => {
  const sinLat = Math.sin((clampLat(lat) * Math.PI) / 180);
  return (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * TILE_SIZE * 2 ** zoom;
};
const xToLng = (x: number, zoom: number) => (x / (TILE_SIZE * 2 ** zoom)) * 360 - 180;
const yToLat = (y: number, zoom: number) => {
  const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * 2 ** zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

export const LocationPicker = ({
  lat,
  lng,
  onChange,
  readOnly = false,
  label = 'Lokatsiya',
  markerLabel,
  showCoordinates = true,
  showControls = true,
  hideHeader = false,
  className = '',
  mapClassName = 'h-[260px] sm:h-[320px] lg:aspect-[16/7] lg:h-auto lg:min-h-[220px]',
}: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 320 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const selectedLat = toNumber(lat);
  const selectedLng = toNumber(lng);
  const centerLat = selectedLat ?? DEFAULT_LAT;
  const centerLng = selectedLng ?? DEFAULT_LNG;
  const centerX = lngToX(centerLng, zoom);
  const centerY = latToY(centerLat, zoom);
  const hasLocation = selectedLat != null && selectedLng != null;

  useEffect(() => {
    if (!mapRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(1, entry.contentRect.height),
      });
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  const tiles = useMemo(() => {
    const tileCount = 2 ** zoom;
    const centerTileX = Math.floor(centerX / TILE_SIZE);
    const centerTileY = Math.floor(centerY / TILE_SIZE);
    const radiusX = Math.ceil(size.width / TILE_SIZE / 2) + 1;
    const radiusY = Math.ceil(size.height / TILE_SIZE / 2) + 1;
    const rows = [];

    for (let dx = -radiusX; dx <= radiusX; dx += 1) {
      for (let dy = -radiusY; dy <= radiusY; dy += 1) {
        const x = centerTileX + dx;
        const y = centerTileY + dy;
        if (y < 0 || y >= tileCount) continue;
        const wrappedX = ((x % tileCount) + tileCount) % tileCount;
        rows.push({
          key: `${wrappedX}-${y}`,
          src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - centerX + size.width / 2,
          top: y * TILE_SIZE - centerY + size.height / 2,
        });
      }
    }

    return rows;
  }, [centerX, centerY, size.height, size.width, zoom]);

  const setLocation = (nextLat: number | null, nextLng: number | null) => {
    onChange?.({
      lat: nextLat == null ? null : Number(clampLat(nextLat).toFixed(6)),
      lng: nextLng == null ? null : Number(clampLng(nextLng).toFixed(6)),
    });
  };

  const handleMapClick = (event: MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = centerX - rect.width / 2 + (event.clientX - rect.left);
    const y = centerY - rect.height / 2 + (event.clientY - rect.top);
    setLocation(yToLat(y, zoom), xToLng(x, zoom));
  };

  const useCurrentLocation = () => {
    if (readOnly) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError("Brauzer joriy lokatsiyani qo'llab-quvvatlamaydi");
      return;
    }

    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
        setZoom((value) => Math.max(value, 16));
        setLocating(false);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Lokatsiyaga ruxsat berilmadi"
          : error.code === error.TIMEOUT
            ? "Lokatsiyani aniqlash vaqti tugadi"
            : "Joriy lokatsiyani aniqlab bo'lmadi";
        setLocationError(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const mapsUrl = hasLocation ? `https://www.google.com/maps?q=${selectedLat},${selectedLng}` : '';
  const locationText = hasLocation && showCoordinates
    ? `${selectedLat?.toFixed(6)}, ${selectedLng?.toFixed(6)}`
    : hasLocation
      ? 'Xaritada belgilangan joy'
      : "Xaritadan joy tanlanmagan";

  return (
    <div className={`rounded-lg border border-emerald-100 bg-white p-4 shadow-sm ${className}`}>
      {!hideHeader && <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{label}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">
            {locationText}
          </p>
        </div>
        {showControls && <div className="grid grid-cols-1 gap-2 sm:flex sm:shrink-0">
          {!readOnly && (
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-emerald-700 disabled:cursor-wait disabled:opacity-70"
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              {locating ? 'Aniqlanmoqda' : 'Joriy joy'}
            </button>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-center text-[10px] font-black uppercase tracking-widest text-white">
              Google map <ExternalLink size={13} />
            </a>
          )}
        </div>}
      </div>}

      {locationError && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
          {locationError}. Brauzerda lokatsiyaga ruxsat bering yoki xaritadan qo'lda belgilang.
        </div>
      )}

      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 ${mapClassName} ${readOnly ? '' : 'cursor-crosshair'}`}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={tile.src}
            alt=""
            draggable={false}
            className="absolute h-64 w-64 select-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <MapPin className="fill-emerald-600 text-white drop-shadow-lg" size={42} />
          <span className="mt-1 rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-700 shadow-sm">
            {markerLabel || (hasLocation ? 'Tanlangan joy' : 'Markaz')}
          </span>
        </div>
        {!readOnly && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-white/92 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
            <Crosshair size={13} /> Xaritadan bosing
          </div>
        )}
        <div className="absolute right-3 top-3 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.min(MAX_ZOOM, value + 1));
            }}
            className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            aria-label="Xaritani kattalashtirish"
          >
            <Plus size={16} />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.max(MIN_ZOOM, value - 1));
            }}
            className="flex h-9 w-9 items-center justify-center text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            aria-label="Xaritani kichiklashtirish"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latitude</span>
            <input
              type="number"
              step="0.000001"
              value={selectedLat ?? ''}
              onChange={(event) => setLocation(event.target.value === '' ? null : Number(event.target.value), selectedLng)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-300"
            />
          </label>
          <label>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longitude</span>
            <input
              type="number"
              step="0.000001"
              value={selectedLng ?? ''}
              onChange={(event) => setLocation(selectedLat, event.target.value === '' ? null : Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-emerald-300"
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
