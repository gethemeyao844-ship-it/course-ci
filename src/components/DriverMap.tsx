import { useState } from 'react';
import { Navigation, MapPin, Crosshair, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useGeolocation, type GeoCoords } from '@/hooks/useGeolocation';

interface DriverMapProps {
  deliveryAddress: string;
  deliveryCoords: GeoCoords | null;
  commune?: string;
}

export function DriverMap({ deliveryAddress, deliveryCoords, commune }: DriverMapProps) {
  const geo = useGeolocation();
  const [refreshKey, setRefreshKey] = useState(0);

  const hasDeliveryCoords =
    deliveryCoords &&
    typeof deliveryCoords.lat === 'number' &&
    typeof deliveryCoords.lng === 'number' &&
    deliveryCoords.lat >= -90 && deliveryCoords.lat <= 90 &&
    deliveryCoords.lng >= -180 && deliveryCoords.lng <= 180;

  const driverCoords = geo.coords;

  const handleLocate = async () => {
    await geo.request();
    setRefreshKey((k) => k + 1);
  };

  // Build OSM embed: show both points with a bounding box
  let mapSrc: string | null = null;
  if (hasDeliveryCoords && driverCoords) {
    const minLat = Math.min(deliveryCoords!.lat, driverCoords.lat) - 0.002;
    const maxLat = Math.max(deliveryCoords!.lat, driverCoords.lat) + 0.002;
    const minLng = Math.min(deliveryCoords!.lng, driverCoords.lng) - 0.002;
    const maxLng = Math.max(deliveryCoords!.lng, driverCoords.lng) + 0.002;
    mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${deliveryCoords!.lat},${deliveryCoords!.lng}`;
  } else if (hasDeliveryCoords) {
    mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${deliveryCoords!.lng - 0.005},${deliveryCoords!.lat - 0.003},${deliveryCoords!.lng + 0.005},${deliveryCoords!.lat + 0.003}&layer=mapnik&marker=${deliveryCoords!.lat},${deliveryCoords!.lng}`;
  }

  // Navigation links
  const navLink =
    hasDeliveryCoords && driverCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${driverCoords.lat},${driverCoords.lng}&destination=${deliveryCoords!.lat},${deliveryCoords!.lng}&travelmode=driving`
      : hasDeliveryCoords
      ? `https://www.google.com/maps/dir/?api=1&destination=${deliveryCoords!.lat},${deliveryCoords!.lng}&travelmode=driving`
      : deliveryAddress
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(deliveryAddress + (commune ? ', ' + commune : ''))}&travelmode=driving`
      : null;

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-bold text-navy-900 flex items-center gap-2">
        <Navigation size={18} className="text-orange-500" /> Navigation vers le client
      </h3>

      {/* No coords at all */}
      {!hasDeliveryCoords && !deliveryAddress.trim() && (
        <div className="flex items-start gap-2 text-sm text-error-600 bg-error-50 rounded-lg px-3 py-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Position du client indisponible</p>
            <p className="text-xs mt-1">Le client n'a pas fourni de coordonnées GPS ni d'adresse. Contactez-le par téléphone pour obtenir l'adresse exacte.</p>
          </div>
        </div>
      )}

      {/* Has address but no coords */}
      {!hasDeliveryCoords && deliveryAddress.trim() && (
        <div className="flex items-start gap-2 text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Coordonnées GPS non disponibles</p>
            <p className="text-xs mt-1">
              Le client n'a pas activé le GPS. Adresse fournie : <strong>{deliveryAddress}{commune ? `, ${commune}` : ''}</strong>.
              Utilisez la navigation par adresse ci-dessous.
            </p>
          </div>
        </div>
      )}

      {/* Delivery address */}
      {deliveryAddress.trim() && (
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Adresse de livraison</h4>
            <p className="text-sm font-semibold text-navy-900">{deliveryAddress}</p>
            {commune && <p className="text-xs text-gray-400">{commune}</p>}
            {hasDeliveryCoords && (
              <p className="text-xs text-success-600 mt-0.5">GPS: {deliveryCoords!.lat.toFixed(5)}, {deliveryCoords!.lng.toFixed(5)}</p>
            )}
          </div>
        </div>
      )}

      {/* Driver location button */}
      <div>
        <button
          type="button"
          onClick={handleLocate}
          disabled={geo.status === 'loading'}
          className="w-full flex items-center justify-center gap-2 border-2 border-navy-200 text-navy-800 hover:bg-navy-50 font-semibold rounded-xl px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {geo.status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin" /> Localisation de votre position...</>
          ) : driverCoords ? (
            <><RefreshCw size={18} /> Mettre à jour ma position</>
          ) : (
            <><Crosshair size={18} /> Activer ma position pour l'itinéraire</>
          )}
        </button>

        {driverCoords && (
          <p className="text-xs text-success-600 mt-1.5 text-center">
            Votre position : {driverCoords.lat.toFixed(5)}, {driverCoords.lng.toFixed(5)}
          </p>
        )}

        {geo.status === 'error' && geo.error && (
          <div className="flex items-start gap-2 text-sm text-error-600 bg-error-50 rounded-lg px-3 py-2 mt-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{geo.error}</span>
          </div>
        )}
      </div>

      {/* Map */}
      {mapSrc && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <iframe
            key={refreshKey}
            title="Itinéraire de livraison"
            src={mapSrc}
            className="w-full h-56 border-0"
            loading="lazy"
          />
        </div>
      )}

      {/* Navigate button */}
      {navLink && (
        <a
          href={navLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Navigation size={20} /> Naviguer vers le client
          <ExternalLink size={16} className="opacity-70" />
        </a>
      )}

      {/* Privacy notice */}
      <p className="text-xs text-gray-400 flex items-start gap-1">
        <AlertCircle size={12} className="shrink-0 mt-0.5" />
        Votre position reste sur votre appareil. Seule la position de livraison du client est partagée avec vous pour cette mission.
      </p>
    </div>
  );
}
