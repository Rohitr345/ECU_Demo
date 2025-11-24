import React, { useState } from 'react';
import type { ADASFeature, ADASFunction, Resources, Sensor } from '../types.ts';
import { CalculatorIcon, CpuChipIcon, VideoCameraIcon, PencilIcon } from './icons.tsx';
import { RESOURCE_CONFIG } from '../constants.ts';
import { useAppContext } from '../context/AppContext.tsx';
import ComponentEditorModal from './ComponentEditorModal.tsx';

const RequirementSummary: React.FC<{
  selectedFeatures: ADASFeature[];
  mandatoryFunctions: ADASFunction[];
  mandatorySensors: Sensor[];
  totalResources: Resources;
}> = ({ selectedFeatures, mandatoryFunctions, mandatorySensors, totalResources }) => {
  const { sensors, setSensors, adasFunctions, setAdasFunctions } = useAppContext();
  const [editorModal, setEditorModal] = useState<{
    open: boolean;
    type: 'sensors' | 'functions' | null;
  }>({ open: false, type: null });
  
  const hasSelection = mandatoryFunctions.length > 0 || mandatorySensors.length > 0;
  
  const formatValue = (key: keyof Resources, value: number) => {
    switch (key) {
      case 'kDMIPS':
      case 'isp':
      case 'dewarp':
        return value.toLocaleString();
      case 'dramBw':
        return value.toFixed(1);
      default:
        return value;
    }
  };

  return (
    <>
      <section className="bg-base-200/50 rounded-xl p-6 border border-base-300">
          <div className="flex items-center gap-3 mb-4">
              <CalculatorIcon className="w-7 h-7 text-brand-primary" />
              <h2 className="text-2xl font-bold text-white">2. Resource Estimation</h2>
          </div>
          
          {!hasSelection ? (
              <div className="text-center py-10">
                  <p className="text-content-200">Select features to see the required components and resource calculations.</p>
              </div>
          ) : (
              <div className="space-y-8">
                  <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Required Components Breakdown</h3>
                      <div className="space-y-6">
                          {/* SENSORS TABLE */}
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-md font-semibold text-white flex items-center gap-2"><VideoCameraIcon className="w-5 h-5 text-content-200"/>Required Sensors</h4>
                                  <button
                                      onClick={() => setEditorModal({ open: true, type: 'sensors' })}
                                      className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-1.5 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50"
                                      title="Edit Sensor List"
                                  >
                                      <PencilIcon className="w-4 h-4" />
                                      <span>Edit List</span>
                                  </button>
                              </div>
                              <div className="overflow-x-auto relative rounded-lg border border-base-300">
                                  <table className="w-full text-sm text-left text-content-200">
                                      <thead className="text-xs text-white uppercase bg-base-300/50">
                                          <tr>
                                              <th scope="col" className="px-4 py-3">Sensor</th>
                                              {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                                  <th scope="col" key={key} className="px-4 py-3 text-right">{`${RESOURCE_CONFIG[key].name} (${RESOURCE_CONFIG[key].unit})`}</th>
                                              ))}
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {mandatorySensors.map(sensor => (
                                              <tr key={sensor.id} className="border-b border-base-300 bg-base-200/20 hover:bg-base-200/60">
                                                  <th scope="row" className="px-4 py-4 font-bold text-white whitespace-nowrap">
                                                      {sensor.name}
                                                  </th>
                                                  {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                                      <td key={key} className="px-4 py-4 text-right font-mono">
                                                          {formatValue(key, sensor.resources[key])}
                                                      </td>
                                                  ))}
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                          {/* FUNCTIONS TABLE */}
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-md font-semibold text-white flex items-center gap-2"><CpuChipIcon className="w-5 h-5 text-content-200"/>Required Functions</h4>
                                  <button
                                      onClick={() => setEditorModal({ open: true, type: 'functions' })}
                                      className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-1.5 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50"
                                      title="Edit Function List"
                                  >
                                      <PencilIcon className="w-4 h-4" />
                                      <span>Edit List</span>
                                  </button>
                              </div>
                              <div className="overflow-x-auto relative rounded-lg border border-base-300">
                                  <table className="w-full text-sm text-left text-content-200">
                                      <thead className="text-xs text-white uppercase bg-base-300/50">
                                          <tr>
                                              <th scope="col" className="px-4 py-3">Function</th>
                                              {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                                  <th scope="col" key={key} className="px-4 py-3 text-right">{`${RESOURCE_CONFIG[key].name} (${RESOURCE_CONFIG[key].unit})`}</th>
                                              ))}
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {mandatoryFunctions.map(func => (
                                              <tr key={func.id} className="border-b border-base-300 bg-base-200/20 hover:bg-base-200/60">
                                                  <th scope="row" className="px-4 py-4 font-bold text-white whitespace-nowrap">
                                                      {func.name}
                                                  </th>
                                                  {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                                      <td key={key} className="px-4 py-4 text-right font-mono">
                                                          {formatValue(key, func.resources[key])}
                                                      </td>
                                                  ))}
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* TOTALS TABLE */}
                  <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Total Estimated Resources</h3>
                      <div className="overflow-x-auto relative rounded-lg border-2 border-brand-primary/50">
                          <table className="w-full text-sm text-left text-white">
                              <thead className="text-xs text-white uppercase bg-brand-primary/30">
                                  <tr>
                                      <th scope="col" className="px-4 py-3">Metric</th>
                                      {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                          <th scope="col" key={key} className="px-4 py-3 text-right">{`${RESOURCE_CONFIG[key].name} (${RESOURCE_CONFIG[key].unit})`}</th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody>
                                <tr className="text-sm font-bold bg-brand-primary/20">
                                  <th scope="row" className="px-4 py-3 text-base text-left">Total Required</th>
                                  {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                      <td key={key} className="px-4 py-3 text-right font-mono text-lg">
                                          {formatValue(key, totalResources[key])}
                                      </td>
                                  ))}
                                </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          )}
      </section>

      {editorModal.open && editorModal.type === 'sensors' && (
          <ComponentEditorModal
              title="Edit Sensor List"
              components={sensors}
              onSave={(updatedSensors) => setSensors(updatedSensors as Sensor[])}
              onClose={() => setEditorModal({ open: false, type: null })}
              componentType="sensor"
          />
      )}
      {editorModal.open && editorModal.type === 'functions' && (
          <ComponentEditorModal
              title="Edit Function List"
              components={adasFunctions.filter(f => !f.isFeature)}
              onSave={(updatedFunctions) => {
                  const features = adasFunctions.filter(f => f.isFeature);
                  setAdasFunctions([...updatedFunctions, ...features]);
              }}
              onClose={() => setEditorModal({ open: false, type: null })}
              componentType="function"
          />
      )}
    </>
  );
};

export default RequirementSummary;