import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, ExternalLink, Loader2, LocateFixed, MapPin, Maximize2, Minus, Plus, X } from 'lucide-react';

type LocationPickerProps = {
  lat?: string | number | null;
  lng?: string | number | null;
  onChange?: (value: { lat: number | null; lng: number | null }) => void;
  readOnly?: boolean;
  label?: string;
  markerLabel?: string;
  extraMarkers?: Array<{
    id: string;
    lat: string | number | null;
    lng: string | number | null;
    label: string;
  }>;
  showCoordinates?: boolean;
  showCoordinateInputs?: boolean;
  showControls?: boolean;
  hideHeader?: boolean;
  className?: string;
  mapClassName?: string;
  expandable?: boolean;
  modalTitle?: string;
};

const TILE_SIZE = 256;
const DEFAULT_LAT = 38.8606;
const DEFAULT_LNG = 65.789;
const DEFAULT_ZOOM = 16;
const MIN_ZOOM = 4;
const MAX_ZOOM = 19;

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
  extraMarkers = [],
  showCoordinates = true,
  showCoordinateInputs = true,
  showControls = true,
  hideHeader = false,
  className = '',
  mapClassName = 'h-[260px] sm:h-[320px] lg:aspect-[16/7] lg:h-auto lg:min-h-[220px]',
  expandable = false,
  modalTitle = 'Xaritadan lokatsiya tanlash',
}: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const modalMapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 320 });
  const [modalSize, setModalSize] = useState({ width: 960, height: 560 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
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

  useEffect(() => {
    if (!isMapModalOpen || !modalMapRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setModalSize({
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(1, entry.contentRect.height),
      });
    });
    observer.observe(modalMapRef.current);
    return () => observer.disconnect();
  }, [isMapModalOpen]);

  const buildTiles = (viewportSize: { width: number; height: number }) => {
    const tileCount = 2 ** zoom;
    const centerTileX = Math.floor(centerX / TILE_SIZE);
    const centerTileY = Math.floor(centerY / TILE_SIZE);
    const radiusX = Math.ceil(viewportSize.width / TILE_SIZE / 2) + 1;
    const radiusY = Math.ceil(viewportSize.height / TILE_SIZE / 2) + 1;
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
          left: x * TILE_SIZE - centerX + viewportSize.width / 2,
          top: y * TILE_SIZE - centerY + viewportSize.height / 2,
        });
      }
    }

    return rows;
  };

  const tiles = useMemo(() => buildTiles(size), [centerX, centerY, size.height, size.width, zoom]);
  const modalTiles = useMemo(() => buildTiles(modalSize), [centerX, centerY, modalSize.height, modalSize.width, zoom]);

  const setLocation = (nextLat: number | null, nextLng: number | null) => {
    onChange?.({
      lat: nextLat == null ? null : Number(clampLat(nextLat).toFixed(6)),
      lng: nextLng == null ? null : Number(clampLng(nextLng).toFixed(6)),
    });
  };

  const handleMapClick = (event: MouseEvent<HTMLDivElement>, inModal = false) => {
    if (readOnly) return;
    if (expandable && !inModal) {
      setZoom((value) => Math.max(value, 16));
      setIsMapModalOpen(true);
      return;
    }
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

  const renderMap = (inModal = false) => {
    const activeTiles = inModal ? modalTiles : tiles;
    const activeSize = inModal ? modalSize : size;
    const visibleExtraMarkers = extraMarkers
      .map((marker) => {
        const markerLat = toNumber(marker.lat);
        const markerLng = toNumber(marker.lng);
        if (markerLat == null || markerLng == null) return null;
        return {
          ...marker,
          left: lngToX(markerLng, zoom) - centerX + activeSize.width / 2,
          top: latToY(markerLat, zoom) - centerY + activeSize.height / 2,
        };
      })
      .filter((marker): marker is NonNullable<typeof marker> => Boolean(marker));

    return (
      <div
        ref={inModal ? modalMapRef : mapRef}
        onClick={(event) => handleMapClick(event, inModal)}
        className={`relative overflow-hidden rounded-lg border border-white/10 bg-[#08100f] ${inModal ? 'h-[64vh] min-h-[420px] w-full' : mapClassName} ${
          readOnly ? '' : expandable && !inModal ? 'cursor-zoom-in' : 'cursor-crosshair'
        }`}
      >
        {activeTiles.map((tile) => (
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
        {visibleExtraMarkers.map((marker) => (
          <div
            key={marker.id}
            className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center"
            style={{ left: marker.left, top: marker.top }}
          >
            <MapPin className="fill-blue-600 text-white drop-shadow-lg" size={inModal ? 42 : 32} />
            <span className="mt-1 max-w-[160px] truncate rounded-full bg-[#0b1110] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-200 shadow-sm ring-1 ring-blue-400/20">
              {marker.label}
            </span>
          </div>
        ))}
        <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-full flex-col items-center">
          <MapPin className="fill-emerald-600 text-white drop-shadow-lg" size={inModal ? 52 : 42} />
          <span className="mt-1 rounded-full bg-[#0b1110] px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-200 shadow-sm ring-1 ring-emerald-400/20">
            {markerLabel || (hasLocation ? 'Tanlangan joy' : 'Markaz')}
          </span>
        </div>
        {!readOnly && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-lg bg-[#0b1110]/92 px-3 py-2 text-[12px] font-black uppercase tracking-widest text-white shadow-sm ring-1 ring-white/10">
            {expandable && !inModal ? <Maximize2 size={13} /> : <Crosshair size={13} />}
            {expandable && !inModal ? 'Xaritani kattalashtirish' : 'Xaritadan bosing'}
          </div>
        )}
        {expandable && !inModal && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.max(value, 16));
              setIsMapModalOpen(true);
            }}
            className="absolute right-14 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#0b1110] text-white shadow-sm transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
            aria-label="Xaritani kattalashtirish"
          >
            <Maximize2 size={16} />
          </button>
        )}
        <div className="absolute right-3 top-3 overflow-hidden rounded-lg border border-white/10 bg-[#0b1110] shadow-sm">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.min(MAX_ZOOM, value + 1));
            }}
            className="flex h-9 w-9 items-center justify-center text-white transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
            aria-label="Xaritani kattalashtirish"
          >
            <Plus size={16} />
          </button>
          <div className="h-px bg-white/10" />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setZoom((value) => Math.max(MIN_ZOOM, value - 1));
            }}
            className="flex h-9 w-9 items-center justify-center text-white transition-colors hover:bg-emerald-500/20 hover:text-emerald-200"
            aria-label="Xaritani kichiklashtirish"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-[#0b1110] p-4 shadow-sm ${className}`}>
      {!hideHeader && <div className="mb-3 flex flex-col gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-black uppercase leading-snug tracking-[0.12em] text-emerald-200">{label}</p>
          <p className="mt-1 break-words text-[13px] font-extrabold leading-snug text-slate-300">
            {locationText}
          </p>
        </div>
        {showControls && <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          {!readOnly && (
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-center text-[12px] font-black uppercase tracking-[0.12em] text-emerald-200 disabled:cursor-wait disabled:opacity-70"
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
              {locating ? 'Aniqlanmoqda' : 'Joriy joy'}
            </button>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-center text-[12px] font-black uppercase tracking-[0.12em] text-white">
              Google map <ExternalLink size={13} />
            </a>
          )}
        </div>}
      </div>}

      {locationError && (
        <div className="mb-3 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[13px] font-bold text-amber-200">
          {locationError}. Brauzerda lokatsiyaga ruxsat bering yoki xaritadan qo'lda belgilang.
        </div>
      )}

      {renderMap(false)}

      {!readOnly && showCoordinateInputs && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label>
            <span className="text-[12px] font-black uppercase tracking-widest text-slate-300">Latitude</span>
            <input
              type="number"
              step="0.000001"
              value={selectedLat ?? ''}
              onChange={(event) => setLocation(event.target.value === '' ? null : Number(event.target.value), selectedLng)}
              className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#08100f] px-3 text-base font-extrabold text-white outline-none focus:border-emerald-400/60"
            />
          </label>
          <label>
            <span className="text-[12px] font-black uppercase tracking-widest text-slate-300">Longitude</span>
            <input
              type="number"
              step="0.000001"
              value={selectedLng ?? ''}
              onChange={(event) => setLocation(selectedLat, event.target.value === '' ? null : Number(event.target.value))}
              className="mt-2 h-12 w-full rounded-lg border border-white/10 bg-[#08100f] px-3 text-base font-extrabold text-white outline-none focus:border-emerald-400/60"
            />
          </label>
        </div>
      )}

      {isMapModalOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-transparent p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onClick={() => setIsMapModalOpen(false)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#111615] shadow-[0_30px_90px_rgba(0,0,0,0.42)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">{label}</p>
                <h3 className="text-lg font-black leading-tight text-white">{modalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0b1110] text-white shadow-sm transition-colors hover:bg-white/10"
                aria-label="Modalni yopish"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3">
              {renderMap(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
