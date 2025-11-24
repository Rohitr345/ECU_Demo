import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { ADASFeature, ADASFunction, Sensor, SoC, AppState } from '../types.ts';
import { DEFAULT_SENSORS, DEFAULT_ADAS_FUNCTIONS, DEFAULT_SO_CS } from '../constants.ts';

const EMPTY_RESOURCES = { kDMIPS: 0, tops: 0, isp: 0, dewarp: 0, gpu: 0, dramBw: 0 };
const LOCAL_STORAGE_KEY = 'adas-soc-selector-state';

interface AppContextType {
  selectedFeatureIds: Set<string>;
  toggleFeature: (feature: ADASFeature) => void;
  clearSelection: () => void;
  updateFeature: (updatedFeature: ADASFeature) => void;
  addFeature: (featureData: Omit<ADASFeature, 'id' | 'resources'>) => void;
  
  sensors: Sensor[];
  setSensors: React.Dispatch<React.SetStateAction<Sensor[]>>;
  adasFunctions: (ADASFunction & { isFeature?: boolean, description?: string, category?: 'Driving' | 'Parking', mandatoryFunctionIds?: string[], mandatorySensorIds?: string[] })[];
  setAdasFunctions: React.Dispatch<React.SetStateAction<typeof DEFAULT_ADAS_FUNCTIONS>>;
  soCs: SoC[];
  setSoCs: React.Dispatch<React.SetStateAction<SoC[]>>;
  selectableFeatures: ADASFeature[];

  loadConfiguration: (appState: AppState) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getDefaultState = (): AppState => ({
    sensors: JSON.parse(JSON.stringify(DEFAULT_SENSORS)),
    adasFunctions: JSON.parse(JSON.stringify(DEFAULT_ADAS_FUNCTIONS)),
    soCs: JSON.parse(JSON.stringify(DEFAULT_SO_CS)),
    selectedFeatureIds: [],
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());

  // App data state, initialized with default values
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [adasFunctions, setAdasFunctions] = useState<typeof DEFAULT_ADAS_FUNCTIONS>([]);
  const [soCs, setSoCs] = useState<SoC[]>([]);
  const [selectableFeatures, setSelectableFeatures] = useState<ADASFeature[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from local storage on initial mount
  useEffect(() => {
    try {
        const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState: AppState = JSON.parse(savedStateJSON);
            setSensors(savedState.sensors);
            setAdasFunctions(savedState.adasFunctions);
            setSoCs(savedState.soCs || DEFAULT_SO_CS); // Handle legacy state without SoCs
            setSelectedFeatureIds(new Set(savedState.selectedFeatureIds));
        } else {
            // If no saved state, load defaults
            const defaults = getDefaultState();
            setSensors(defaults.sensors);
            setAdasFunctions(defaults.adasFunctions);
            setSoCs(defaults.soCs);
            setSelectedFeatureIds(new Set(defaults.selectedFeatureIds));
        }
    } catch (error) {
        console.error("Failed to load state from local storage, using defaults:", error);
        const defaults = getDefaultState();
        setSensors(defaults.sensors);
        setAdasFunctions(defaults.adasFunctions);
        setSoCs(defaults.soCs);
        setSelectedFeatureIds(new Set(defaults.selectedFeatureIds));
    }
    setIsInitialized(true);
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
        try {
            const appState: AppState = {
                sensors,
                adasFunctions,
                soCs,
                selectedFeatureIds: Array.from(selectedFeatureIds),
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
        } catch (error) {
            console.error("Failed to save state to local storage:", error);
        }
    }
  }, [sensors, adasFunctions, soCs, selectedFeatureIds, isInitialized]);

  const toggleFeature = useCallback((feature: ADASFeature) => {
    setSelectedFeatureIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feature.id)) {
        newSet.delete(feature.id);
      } else {
        newSet.add(feature.id);
      }
      return newSet;
    });
  }, []);

  const clearSelection = () => {
    setSelectedFeatureIds(new Set());
  };

  const updateFeature = useCallback((updatedFeature: ADASFeature) => {
    // We need to update the feature within the main adasFunctions array
    setAdasFunctions(prevFunctions =>
        prevFunctions.map(f => (f.id === updatedFeature.id ? { ...f, ...updatedFeature, isFeature: true } : f))
    );
  }, []);
  
  const addFeature = useCallback((featureData: Omit<ADASFeature, 'id' | 'resources'>) => {
    const newFeature: ADASFeature = {
      ...featureData,
      id: `feat-custom-${Date.now()}`,
      resources: EMPTY_RESOURCES,
    };
    // Add the new feature to the main adasFunctions list
    setAdasFunctions(prev => [...prev, { ...newFeature, isFeature: true }]);
  }, []);

  const loadConfiguration = useCallback((appState: AppState) => {
    setSensors(appState.sensors);
    setAdasFunctions(appState.adasFunctions);
    setSoCs(appState.soCs);
    setSelectedFeatureIds(new Set(appState.selectedFeatureIds));
  }, []);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const defaults = getDefaultState();
    loadConfiguration(defaults);
  }, [loadConfiguration]);

  // Update selectable features when master ADAS functions list changes
  useEffect(() => {
    if(isInitialized) {
      setSelectableFeatures(adasFunctions.filter(f => f.isFeature) as ADASFeature[]);
    }
  }, [adasFunctions, isInitialized]);

  return (
    <AppContext.Provider value={{ 
        selectedFeatureIds, 
        toggleFeature, 
        clearSelection,
        updateFeature,
        addFeature,
        sensors,
        setSensors,
        adasFunctions,
        setAdasFunctions,
        soCs,
        setSoCs,
        selectableFeatures,
        loadConfiguration,
        resetToDefaults,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};