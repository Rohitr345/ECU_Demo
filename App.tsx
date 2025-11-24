import React, { useMemo, useRef, useState } from 'react';
import { useAppContext } from './context/AppContext.tsx';
import { ADASFeature, ADASFunction, Resources, Sensor, SoC } from './types.ts';
import FeatureSelector from './components/FeatureSelector.tsx';
import RequirementSummary from './components/RequirementSummary.tsx';
import SoCSuggestion from './components/SoCSuggestion.tsx';
import { ArrowDownTrayIcon, ChipIcon, CodeBracketSquareIcon, DocumentArrowUpIcon, ArrowPathIcon, ArrowDownOnSquareIcon, Cog6ToothIcon } from './components/icons.tsx';
import SoCList from './components/SoCList.tsx';
import ReportGenerator from './components/ReportGenerator.tsx';
import DataManagementModal from './components/DataUploader.tsx';

// Make html2canvas available from the script tag
declare var html2canvas: any;

const App: React.FC = () => {
  const { selectedFeatureIds, adasFunctions, sensors, soCs, selectableFeatures, resetToDefaults, loadConfiguration } = useAppContext();
  const reportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDataModalOpen, setDataModalOpen] = useState(false);

  const { 
    mandatoryFunctions, 
    mandatorySensors, 
    totalRequiredResources 
  } = useMemo(() => {
    const mandatoryFunctionIds = new Set<string>();
    const mandatorySensorIds = new Set<string>();
    
    selectedFeatureIds.forEach(featureId => {
        const feature = selectableFeatures.find(f => f.id === featureId);
        if (feature) {
            feature.mandatoryFunctionIds?.forEach(id => mandatoryFunctionIds.add(id));
            feature.mandatorySensorIds?.forEach(id => mandatorySensorIds.add(id));
        }
    });

    const resolveFunctions = (ids: Set<string>) => Array.from(ids).map(id => adasFunctions.find(f => f.id === id)).filter((f): f is ADASFunction => !!f);
    const resolveSensors = (ids: Set<string>) => Array.from(ids).map(id => sensors.find(s => s.id === id)).filter((s): s is Sensor => !!s);

    const mandatoryFuncs = resolveFunctions(mandatoryFunctionIds);
    const mandatorySens = resolveSensors(mandatorySensorIds);

    const allComponents = [...mandatoryFuncs, ...mandatorySens];

    const totalResources: Resources = {
      kDMIPS: 0, tops: 0, isp: 0, dewarp: 0, gpu: 0, dramBw: 0,
    };

    allComponents.forEach(c => {
        Object.keys(totalResources).forEach(key => {
            const resourceKey = key as keyof Resources;
            totalResources[resourceKey] += c.resources[resourceKey];
        });
    });

    return {
        mandatoryFunctions: mandatoryFuncs,
        mandatorySensors: mandatorySens,
        totalRequiredResources: totalResources,
    };
}, [selectedFeatureIds, adasFunctions, sensors, selectableFeatures]);


  const { suitableSoCs, bestFitSoC } = useMemo(() => {
    const suitable: SoC[] = soCs.filter(soc => 
      Object.keys(totalRequiredResources).every(key => {
        const resourceKey = key as keyof Resources;
        return soc.resources[resourceKey] >= totalRequiredResources[resourceKey];
      })
    );

    if (suitable.length === 0) {
      return { suitableSoCs: [], bestFitSoC: null };
    }
    
    // Find best fit: the one with the smallest "total power" that still meets requirements
    const sorted = suitable.sort((a, b) => {
      const totalPowerA = Object.values(a.resources).reduce((sum, val) => sum + (val as number), 0);
      const totalPowerB = Object.values(b.resources).reduce((sum, val) => sum + (val as number), 0);
      return totalPowerA - totalPowerB;
    });

    return {
      suitableSoCs: sorted,
      bestFitSoC: sorted[0]
    };

  }, [totalRequiredResources, soCs]);

  const selectedFeatures = useMemo(() => {
    return Array.from(selectedFeatureIds)
        .map(id => selectableFeatures.find(f => f.id === id))
        .filter((f): f is ADASFeature => f !== undefined);
  }, [selectedFeatureIds, selectableFeatures]);

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    try {
        const canvas = await html2canvas(reportRef.current, {
            scale: 2, // Higher scale for better resolution
            backgroundColor: '#0F172A',
            useCORS: true,
        });
        
        const link = document.createElement('a');
        link.download = 'adas-soc-summary.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch(err) {
        console.error("Failed to generate report image:", err);
    }
  };

  const handleSaveConfiguration = () => {
    const appState = {
        adasFunctions,
        sensors,
        soCs,
        selectedFeatureIds: Array.from(selectedFeatureIds),
    };
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'adas-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                // Basic validation
                if (data.adasFunctions && data.sensors && data.soCs && data.selectedFeatureIds) {
                    loadConfiguration(data);
                } else {
                    alert('Invalid configuration file.');
                }
            } catch (error) {
                console.error("Failed to parse configuration file:", error);
                alert('Failed to load configuration file. It may be corrupted.');
            }
        };
        reader.readAsText(file);
        // Reset file input value to allow loading the same file again
        event.target.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data to the application defaults? All your changes will be lost.')) {
        resetToDefaults();
    }
  };


  return (
    <>
    <div className="min-h-screen bg-base-100 font-sans p-4 sm:p-6 lg:p-8">
      <header className="mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-4">
                    <ChipIcon className="w-10 h-10 text-brand-primary"/>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">ADAS ECU SoC Selector</h1>
                </div>
                <p className="text-content-200 max-w-3xl mx-auto sm:mx-0 mt-2">
                  An interactive tool to estimate resource requirements for ADAS features and find the optimal System-on-Chip.
                </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <button
                    onClick={() => setDataModalOpen(true)}
                    className="flex items-center gap-2 text-sm font-semibold bg-base-200 hover:bg-base-300 text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50"
                    title="Manage Data Portfolios"
                >
                    <Cog6ToothIcon className="w-5 h-5" />
                    <span>Manage Data</span>
                </button>
                <div className="h-6 w-px bg-base-300 mx-2 hidden sm:block"></div>
                <input type="file" ref={fileInputRef} onChange={handleLoadConfiguration} accept=".json" style={{ display: 'none' }} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-semibold bg-base-200 hover:bg-base-300 text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50"
                    title="Load Session"
                >
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    <span>Load</span>
                </button>
                <button
                    onClick={handleSaveConfiguration}
                    className="flex items-center gap-2 text-sm font-semibold bg-base-200 hover:bg-base-300 text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50"
                    title="Save Session"
                >
                    <ArrowDownOnSquareIcon className="w-5 h-5" />
                    <span>Save</span>
                </button>
                 <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-sm font-semibold bg-red-900/40 hover:bg-red-900/80 text-red-300 px-3 py-2 rounded-lg transition-colors border border-red-500/30"
                    title="Reset to Defaults"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Reset</span>
                </button>
            </div>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
            <FeatureSelector />
            <RequirementSummary 
                selectedFeatures={selectedFeatures}
                mandatoryFunctions={mandatoryFunctions}
                mandatorySensors={mandatorySensors}
                totalResources={totalRequiredResources}
            />
        </div>

        <div className="flex flex-col">
            <SoCSuggestion 
                suitableSoCs={suitableSoCs}
                bestFitSoC={bestFitSoC}
                requiredResources={totalRequiredResources}
                headerAction={
                    bestFitSoC ? (
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50"
                            title="Download Summary Image"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>Download Summary</span>
                        </button>
                    ) : null
                }
            />
        </div>
      </main>

      <div className="max-w-7xl mx-auto">
        <SoCList soCs={soCs} requiredResources={totalRequiredResources}/>
      </div>

       <footer className="text-center mt-12 text-content-200 text-sm">
        <p>Built for advanced ADAS System Architecture planning.</p>
        <div className="flex justify-center items-center gap-2 mt-1">
            <CodeBracketSquareIcon className="w-4 h-4"/>
            <p>Powered by Gemini & React</p>
        </div>
      </footer>
      
      {/* Hidden component for generating the report image */}
      <div ref={reportRef} className="fixed" style={{ left: '-9999px', top: 0, zIndex: -10 }}>
        {bestFitSoC && (
            <ReportGenerator
                selectedFeatures={selectedFeatures}
                mandatoryFunctions={mandatoryFunctions}
                mandatorySensors={mandatorySensors}
                totalResources={totalRequiredResources}
                bestFitSoC={bestFitSoC}
            />
        )}
      </div>

    </div>
    
    {isDataModalOpen && <DataManagementModal onClose={() => setDataModalOpen(false)} />}
    </>
  );
};

export default App;