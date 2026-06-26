export interface APODData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  ai_analysis?: string; // AI-enriched explanation
  is_fallback?: boolean;
}

export interface NearEarthObject {
  id: string;
  name: string;
  absoluteMagnitude: number;
  estimatedDiameterKm: {
    min: number;
    max: number;
  };
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  closeApproachTime: string;
  missDistanceKm: number;
  velocityKmh: number;
  orbitingBody: string;
}

export interface SpaceWeatherData {
  kpIndex: {
    current: number;
    status: 'quiet' | 'active' | 'storm';
    history: { time: string; value: number }[];
  };
  solarWind: {
    speed: number; // km/s
    density: number; // p/cm^3
    temperature: number; // K
    history: { time: string; speed: number; density: number }[];
  };
  solarFlares: {
    class: string; // e.g. M1.2, X2.5
    peakTime: string;
    region: string;
    active: boolean;
  }[];
  auroraProbability: {
    highLatitude: number; // %
    midLatitude: number; // %
    lowLatitude: number; // %
  };
  activeAlerts: {
    id: string;
    type: 'CME' | 'FLARE' | 'GEOMAGNETIC' | 'NEO';
    severity: 'info' | 'warning' | 'danger';
    message: string;
    timestamp: string;
  }[];
}

export interface ISSData {
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/h
  timestamp: number;
  crew: { name: string; craft: string }[];
}

export interface PlanetTelemetry {
  name: string;
  distanceFromSunAU: number;
  orbitalPeriodDays: number;
  diameterKm: number;
  surfaceTempC: number;
  currentVelocityKms: number;
  moonsCount: number;
  description: string;
  coordinates: { x: number; y: number; z: number };
}

export interface UpcomingLaunch {
  id: string;
  name: string;
  dateUtc: string;
  rocket: string;
  payload: string;
  description: string;
  flightNumber: number;
  patchUrl?: string;
  livestreamUrl?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cosmo';
  text: string;
  timestamp: string;
}
