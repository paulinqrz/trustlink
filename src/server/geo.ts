// Coordenada padrão da residência de referência (Consolação / Jardins, São Paulo)
export const DEFAULT_ORIGIN_LAT = -23.5558;
export const DEFAULT_ORIGIN_LNG = -46.6601;

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calcula a distância geodésica real em quilômetros entre dois pares (lat, lng)
 * usando a fórmula de Haversine (substituto leve do PostGIS ST_Distance para SQLite local).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 10) / 10;
}
