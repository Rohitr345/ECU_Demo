export interface AppState {
    adasFunctions: (ADASFunction & { isFeature?: boolean, description?: string, category?: 'Driving' | 'Parking', mandatoryFunctionIds?: string[], mandatorySensorIds?: string[] })[];
    sensors: Sensor[];
    soCs: SoC[];
    selectedFeatureIds: string[]; // Store as array for JSON serialization
}

export interface Resources {
  kDMIPS: number; // Kilo Dhrystone Million Instructions Per Second
  tops: number;   // Tera Operations Per Second (for AI)
  isp: number;    // Image Signal Processing (MP/s)
  dewarp: number; // Dewarping (MP/s)
  gpu: number;    // GPU Visualization (GFLOPS or similar metric)
  dramBw: number; // DRAM Bandwidth (GB/s)
}

export interface ADASFunction {
  id: string;
  name:string;
  resources: Resources;
}

export interface ADASFeature extends ADASFunction {
  description: string;
  category: 'Driving' | 'Parking';
  mandatoryFunctionIds: string[];
  mandatorySensorIds: string[];
}

export interface Sensor {
  id: string;
  name: string;
  resources: Resources;
}

export interface SoC {
  id: string;
  name: string;
  vendor: string;
  tier: 'Entry' | 'Mid-range' | 'High-performance';
  resources: Resources;
}