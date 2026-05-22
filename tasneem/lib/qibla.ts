// Qibla = great-circle bearing from the user's location to the Kaaba in Makkah.
const KAABA = { lat: 21.4224779, lng: 39.8251832 };

export function qiblaBearing(lat: number, lng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  return bearing;
}

export function distanceToKaabaKm(lat: number, lng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat), φ2 = toRad(KAABA.lat);
  const Δφ = toRad(KAABA.lat - lat);
  const Δλ = toRad(KAABA.lng - lng);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
