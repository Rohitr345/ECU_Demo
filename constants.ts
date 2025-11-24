import type { ADASFeature, ADASFunction, Sensor, SoC, Resources } from './types.ts';

// Mock Resource Profiles
const EMPTY_RESOURCES = { kDMIPS: 0, tops: 0, isp: 0, dewarp: 0, gpu: 0, dramBw: 0 };

// Centralized configuration for resource display properties
export const RESOURCE_CONFIG: { [key in keyof Resources]: { name: string; unit: string; color: string } } = {
  kDMIPS: { name: 'CPU', unit: 'kDMIPS', color: '#38BDF8' },
  tops: { name: 'AI/ML', unit: 'TOPs', color: '#4ADE80' },
  isp: { name: 'ISP', unit: 'MP/s', color: '#F87171' },
  dewarp: { name: 'Dewarp', unit: 'MP/s', color: '#FACC15' },
  gpu: { name: 'GPU', unit: 'GFLOPS', color: '#A78BFA' },
  dramBw: { name: 'DRAM BW', unit: 'GB/s', color: '#F472B6' },
};

// --- SENSORS ---
export const DEFAULT_SENSORS: Sensor[] = [
  { id: 'sensor_rear_cam', name: 'Sensor 1', resources: { ...EMPTY_RESOURCES, isp: 500, dewarp: 500, dramBw: 1 } },
  { id: 'sensor_radar_gen4', name: 'Sensor 2', resources: { ...EMPTY_RESOURCES, kDMIPS: 10, dramBw: 0.7 } },
  { id: 'sensor_accelerometer', name: 'Sensor 3', resources: { ...EMPTY_RESOURCES, kDMIPS: 1, dramBw: 0.1 } },
  { id: 'sensor_fc_mc_eco', name: 'Sensor 4', resources: { ...EMPTY_RESOURCES, isp: 800, dramBw: 1.2, tops: 2 } },
  { id: 'sensor_fc_optimized', name: 'Sensor 5', resources: { ...EMPTY_RESOURCES, isp: 1200, dramBw: 1.8, tops: 4 } },
];

// --- ADAS FUNCTIONS (Software Components) ---
export const DEFAULT_ADAS_FUNCTIONS: (ADASFunction & { isFeature?: boolean, description?: string, category?: 'Driving' | 'Parking', mandatoryFunctionIds?: string[], mandatorySensorIds?: string[] })[] = [
    // Core Functions - Updated List
    { id: 'func_object_detection', name: 'Function_1', resources: { ...EMPTY_RESOURCES, kDMIPS: 20, tops: 4, dramBw: 1.5 } },
    { id: 'func_lane_detection', name: 'Function_2', resources: { ...EMPTY_RESOURCES, kDMIPS: 15, tops: 2, dramBw: 1 } },
    { id: 'func_tsr', name: 'Function_3', resources: { ...EMPTY_RESOURCES, kDMIPS: 10, tops: 1, dramBw: 0.5 } },
    { id: 'func_sensor_fusion', name: 'Function_4', resources: { ...EMPTY_RESOURCES, kDMIPS: 30, dramBw: 2 } },
    { id: 'func_path_planning', name: 'Function_5', resources: { ...EMPTY_RESOURCES, kDMIPS: 25, dramBw: 1.2 } },
    { id: 'func_vehicle_control', name: 'Function_6', resources: { ...EMPTY_RESOURCES, kDMIPS: 12, dramBw: 0.8 } },
    { id: 'func_park_assist_logic', name: 'Function_7', resources: { ...EMPTY_RESOURCES, kDMIPS: 18, isp: 500, dewarp: 500, gpu: 100, dramBw: 2.2 } },
    { id: 'func_dms', name: 'Function_8', resources: { ...EMPTY_RESOURCES, kDMIPS: 22, tops: 3, isp: 300, gpu: 50, dramBw: 1.8 } },
    { id: 'func_svm', name: 'Function_9', resources: { ...EMPTY_RESOURCES, kDMIPS: 35, isp: 2000, dewarp: 1000, gpu: 200, dramBw: 3 } },
    { id: 'func_aeb_logic', name: 'Function_10', resources: { ...EMPTY_RESOURCES, kDMIPS: 28, tops: 5, dramBw: 2.5 } },
    { id: 'func_acc_logic', name: 'Function_11', resources: { ...EMPTY_RESOURCES, kDMIPS: 16, dramBw: 1.1 } },
    { id: 'func_lka_logic', name: 'Function_12', resources: { ...EMPTY_RESOURCES, kDMIPS: 20, tops: 2.5, dramBw: 1.6 } },

    // Selectable Features
    { 
      id: 'feat_aeb', 
      name: 'Feature_d_1', 
      isFeature: true,
      description: "A sample description for this driving feature.",
      category: 'Driving',
      resources: EMPTY_RESOURCES,
      mandatoryFunctionIds: ['func_aeb_logic'],
      mandatorySensorIds: ['sensor_fc_mc_eco', 'sensor_radar_gen4']
    },
    { 
      id: 'feat_lka', 
      name: 'Feature_d_2', 
      isFeature: true,
      description: "A sample description for this driving feature.",
      category: 'Driving',
      resources: EMPTY_RESOURCES,
      mandatoryFunctionIds: ['func_lka_logic'],
      mandatorySensorIds: ['sensor_fc_mc_eco']
    },
    { 
      id: 'feat_acc', 
      name: 'Feature_d_3', 
      isFeature: true,
      description: "A sample description for this driving feature.",
      category: 'Driving',
      resources: EMPTY_RESOURCES,
      mandatoryFunctionIds: ['func_acc_logic'],
      mandatorySensorIds: ['sensor_radar_gen4']
    },
    {
      id: 'feat_traffic_jam',
      name: 'Feature_d_4',
      isFeature: true,
      description: "A sample description for this driving feature.",
      category: 'Driving',
      resources: EMPTY_RESOURCES,
      mandatoryFunctionIds: ['func_acc_logic', 'func_lka_logic'],
      mandatorySensorIds: ['sensor_fc_mc_eco', 'sensor_radar_gen4']
    },
    {
        id: 'feat_driving_ncap',
        name: 'Feature_d_5',
        isFeature: true,
        description: "A feature with a set of mandatory components.",
        category: 'Driving',
        resources: EMPTY_RESOURCES,
        mandatoryFunctionIds: ['func_aeb_logic', 'func_object_detection', 'func_lane_detection'],
        mandatorySensorIds: ['sensor_radar_gen4', 'sensor_accelerometer', 'sensor_fc_mc_eco'],
    },
    { 
      id: 'feat_auto_park', 
      name: 'Feature_p_1', 
      isFeature: true,
      description: "A sample description for this parking feature.",
      category: 'Parking',
      resources: EMPTY_RESOURCES,
      mandatoryFunctionIds: ['func_park_assist_logic'],
      mandatorySensorIds: ['sensor_rear_cam']
    },
];

// --- SoCs (System on Chip) ---
export const DEFAULT_SO_CS: SoC[] = [
  {
    id: 'soc_entry',
    name: 'SoC 001',
    vendor: 'Alpha',
    tier: 'Entry',
    resources: { kDMIPS: 50, tops: 5, isp: 1500, dewarp: 500, gpu: 100, dramBw: 8 },
  },
  {
    id: 'soc_mid',
    name: 'SoC 002',
    vendor: 'Beta',
    tier: 'Mid-range',
    resources: { kDMIPS: 100, tops: 15, isp: 3000, dewarp: 1500, gpu: 300, dramBw: 15 },
  },
  {
    id: 'soc_high',
    name: 'SoC 003',
    vendor: 'gamma',
    tier: 'High-performance',
    resources: { kDMIPS: 250, tops: 40, isp: 6000, dewarp: 3000, gpu: 800, dramBw: 30 },
  },
  {
    id: 'soc_ultra',
    name: 'SoC 004',
    vendor: 'Alpha',
    tier: 'High-performance',
    resources: { kDMIPS: 400, tops: 60, isp: 8000, dewarp: 5000, gpu: 1200, dramBw: 50 },
  },
  {
    id: 'soc_delta_mid',
    name: 'SoC 005',
    vendor: 'Delta',
    tier: 'Mid-range',
    resources: { kDMIPS: 150, tops: 20, isp: 4000, dewarp: 2000, gpu: 400, dramBw: 20 },
  }
];

export const DEFAULT_SELECTABLE_FEATURES = DEFAULT_ADAS_FUNCTIONS.filter(f => f.isFeature) as ADASFeature[];