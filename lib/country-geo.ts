// ISO 3166-1 alpha-2 → approximate country centroid (lat, lon).
// Used for the lightweight intelligence map. Coverage matches our seed set.

export const COUNTRY_CENTROIDS: Record<string, { lat: number; lon: number; name: string }> = {
  US: { lat: 39.8283, lon: -98.5795, name: "United States" },
  GB: { lat: 55.3781, lon: -3.4360, name: "United Kingdom" },
  IE: { lat: 53.4129, lon: -8.2439, name: "Ireland" },
  DE: { lat: 51.1657, lon: 10.4515, name: "Germany" },
  FR: { lat: 46.6034, lon: 1.8883, name: "France" },
  NL: { lat: 52.1326, lon: 5.2913, name: "Netherlands" },
  ES: { lat: 40.4637, lon: -3.7492, name: "Spain" },
  IT: { lat: 41.8719, lon: 12.5674, name: "Italy" },
  SE: { lat: 60.1282, lon: 18.6435, name: "Sweden" },
  NO: { lat: 60.4720, lon: 8.4689, name: "Norway" },
  CH: { lat: 46.8182, lon: 8.2275, name: "Switzerland" },
  CA: { lat: 56.1304, lon: -106.3468, name: "Canada" },
  BR: { lat: -14.2350, lon: -51.9253, name: "Brazil" },
  MX: { lat: 23.6345, lon: -102.5528, name: "Mexico" },
  AE: { lat: 23.4241, lon: 53.8478, name: "United Arab Emirates" },
  SA: { lat: 23.8859, lon: 45.0792, name: "Saudi Arabia" },
  IL: { lat: 31.0461, lon: 34.8516, name: "Israel" },
  IN: { lat: 20.5937, lon: 78.9629, name: "India" },
  SG: { lat: 1.3521, lon: 103.8198, name: "Singapore" },
  JP: { lat: 36.2048, lon: 138.2529, name: "Japan" },
  KR: { lat: 35.9078, lon: 127.7669, name: "South Korea" },
  CN: { lat: 35.8617, lon: 104.1954, name: "China" },
  HK: { lat: 22.3193, lon: 114.1694, name: "Hong Kong" },
  AU: { lat: -25.2744, lon: 133.7751, name: "Australia" },
  NZ: { lat: -40.9006, lon: 174.8860, name: "New Zealand" },
  ZA: { lat: -30.5595, lon: 22.9375, name: "South Africa" },
  NG: { lat: 9.0820, lon: 8.6753, name: "Nigeria" },
  KE: { lat: -0.0236, lon: 37.9062, name: "Kenya" },
  EG: { lat: 26.8206, lon: 30.8025, name: "Egypt" },
  TR: { lat: 38.9637, lon: 35.2433, name: "Turkey" },
  PL: { lat: 51.9194, lon: 19.1451, name: "Poland" },
  AT: { lat: 47.5162, lon: 14.5501, name: "Austria" },
  BE: { lat: 50.5039, lon: 4.4699, name: "Belgium" },
  FI: { lat: 61.9241, lon: 25.7482, name: "Finland" },
  DK: { lat: 56.2639, lon: 9.5018, name: "Denmark" },
  PT: { lat: 39.3999, lon: -8.2245, name: "Portugal" },
  GR: { lat: 39.0742, lon: 21.8243, name: "Greece" },
  CZ: { lat: 49.8175, lon: 15.4730, name: "Czech Republic" },
  RO: { lat: 45.9432, lon: 24.9668, name: "Romania" },
  AR: { lat: -38.4161, lon: -63.6167, name: "Argentina" },
  CL: { lat: -35.6751, lon: -71.5430, name: "Chile" },
  CO: { lat: 4.5709, lon: -74.2973, name: "Colombia" },
  PE: { lat: -9.1900, lon: -75.0152, name: "Peru" },
  TH: { lat: 15.8700, lon: 100.9925, name: "Thailand" },
  MY: { lat: 4.2105, lon: 101.9758, name: "Malaysia" },
  ID: { lat: -0.7893, lon: 113.9213, name: "Indonesia" },
  VN: { lat: 14.0583, lon: 108.2772, name: "Vietnam" },
  PH: { lat: 12.8797, lon: 121.7740, name: "Philippines" },
  PK: { lat: 30.3753, lon: 69.3451, name: "Pakistan" },
  BD: { lat: 23.6850, lon: 90.3563, name: "Bangladesh" },
};

/** Equirectangular projection — lon/lat → x/y inside a [width × height] viewport. */
export function project(lon: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lon + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}
