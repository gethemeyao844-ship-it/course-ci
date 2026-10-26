import { useState, useCallback } from 'react';

export interface GeoCoords {
  lat: number;
  lng: number;
}

export type GeoStatus = 'idle' | 'loading' | 'success' | 'error';

export interface GeoResult {
  coords: GeoCoords | null;
  status: GeoStatus;
  error: string | null;
}

export function useGeolocation() {
  const [result, setResult] = useState<GeoResult>({
    coords: null,
    status: 'idle',
    error: null,
  });

  const request = useCallback((): Promise<GeoCoords | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        setResult({ coords: null, status: 'error', error: "La géolocalisation n'est pas supportée par ce navigateur." });
        resolve(null);
        return;
      }

      setResult({ coords: null, status: 'loading', error: null });

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setResult({ coords, status: 'success', error: null });
          resolve(coords);
        },
        (err) => {
          let msg = 'Erreur de localisation.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = "Autorisation de localisation refusée. Vous pouvez saisir l'adresse manuellement.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            msg = 'Position indisponible. Vérifiez votre connexion GPS ou saisissez l\'adresse manuellement.';
          } else if (err.code === err.TIMEOUT) {
            msg = "Délai de localisation dépassé. Réessayez ou saisissez l'adresse manuellement.";
          }
          setResult({ coords: null, status: 'error', error: msg });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    });
  }, []);

  const reset = useCallback(() => {
    setResult({ coords: null, status: 'idle', error: null });
  }, []);

  return { ...result, request, reset };
}
