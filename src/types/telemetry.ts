export type TelemetryCategory = 'all' | 'fish' | 'birds' | 'marine' | 'flower';

export type FeedBadgeType = 'LIVE FEED' | 'DEEP FEED' | 'SIMULATION';

export interface TelemetryChannel {
  id: string;
  name: string; // e.g. "PROJECT NEXUS"
  feedTitle: string; // e.g. "Fish Feed"
  subject: string; // e.g. "Swimming aquarium fish"
  category: 'Fish & Aqua' | 'Birds & Avian' | 'Deep Ocean' | 'Cyber Flora';
  filterKey: TelemetryCategory;
  badge: FeedBadgeType;
  description: string;
  videoSrc: string;
  posterSrc: string;
  nominalFps: number;
  nominalResolution: string;
  bgGradient: string;
  accentHex: string;
  accentTailwind: string;
  telemetryMetrics: {
    label: string;
    value: string;
    unit: string;
  }[];
  techSpecs: string[];
}
