import { useState } from 'react';
import { MapPin, Crosshair, Loader2, AlertCircle, Check } from 'lucide-react';
import { useGeolocation, type GeoCoords } from '@/hooks/useGeolocation';

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  coords: GeoCoords | null;
  onCoordsChange: (coords: GeoCoords | null) => void;
  commune?: string;
}

function isValidCoords(c: GeoCoords | null): boolean {
  if (!c) return false;
  return (
    typeof c.lat === 'number' &&
    typeof c.lng === 'number' &&
    c.lat >= -90 && c.lat <= 90 &&
    c.lng >= -180 && c.lng <= 180 &&
    !Number.isNaN(c.lat) && !Number.isNaN(c.lng)
  );
}

export function LocationPicker({
  address,
  onAddressChange,
  coords,
  onCoordsChange,
  commune,
}: LocationPickerProps) {
  const geo = useGeolocation();
  const [showMap, setShowMap] = useState(false);

  const handleGeolocate = async () => {
    const c = await geo.request();
    if (c) {
      onCoordsChange(c);
      setShowMap(true);
    }
  };

  const hasCoords = isValidCoords(coords);
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords!.lng - 0.005},${coords!.lat - 0.003},${coords!.lng + 0.005},${coords!.lat + 0.003}&layer=mapnik&marker=${coords!.lat},${coords!.lng}`
    : null;

  const googleMapsLink = hasCoords
    ? `https://www.google.com/maps?q=${coords!.lat},${coords!.lng}`
    : address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address + (commune ? ', ' + commune : ''))}`
    : null;

  return (
    <div className="space-y-3">
      {/* Address input */}
      <div>
        <label className="label-text">Adresse de livraison</label>
        <textarea
          className="input-field min-h-[60px] resize-none"
          placeholder="Ex: Cocody Riviera 2, près de la pharmacie..."
          value={address}
          onChange={(e) => {
            onAddressChange(e.target.value);
            if (coords) onCoordsChange(null);
          }}
        />
      </div>

      {/* Geolocate button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geo.status === 'loading'}
          className="flex items-center justify-center gap-2 border-2 border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {geo.status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin" /> Localisation en cours...</>
          ) : (
            <><Crosshair size={18} /> Utiliser ma position actuelle</>
          )}
        </button>

        {hasCoords && (
          <div className="flex items-center gap-2 text-sm text-success-700 bg-success-50 rounded-lg px-3 py-2">
            <Check size={16} />
            <span>Position GPS captée : {coords!.lat.toFixed(5)}, {coords!.lng.toFixed(5)}</span>
          </div>
        )}

        {geo.status === 'error' && geo.error && (
          <div className="flex items-start gap-2 text-sm text-error-600 bg-error-50 rounded-lg px-3 py-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{geo.error}</span>
          </div>
        )}

        {(hasCoords || showMap) && mapSrc && (
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <iframe
              title="Position de livraison"
              src={mapSrc}
              className="w-full h-48 border-0"
              loading="lazy"
            />
          </div>
        )}

        {(hasCoords || address.trim()) && googleMapsLink && (
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:text-orange-700"
          >
            <MapPin size={14} /> Voir sur Google Maps
          </a>
        )}

        {!hasCoords && !address.trim() && geo.status !== 'loading' && (
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            Autorisez la géolocalisation ou saisissez l'adresse manuellement. Le livreur utilisera ces informations pour vous trouver.
          </p>
        )}
      </div>
    </div>
  );
}
