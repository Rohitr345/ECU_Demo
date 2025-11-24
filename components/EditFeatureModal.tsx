import React, { useState, useEffect } from 'react';
import type { ADASFeature, ADASFunction, Sensor } from '../types.ts';
import { Cog6ToothIcon, XMarkIcon } from './icons.tsx';

interface FeatureFormModalProps {
  feature: ADASFeature | null; // Null for 'add' mode, ADASFeature for 'edit' mode
  category: 'Driving' | 'Parking';
  allFunctions: ADASFunction[];
  allSensors: Sensor[];
  onClose: () => void;
  onSave: (updatedFeature: ADASFeature) => void;
  onCreate: (newFeatureData: Omit<ADASFeature, 'id' | 'resources'>) => void;
}

const FeatureFormModal: React.FC<FeatureFormModalProps> = ({ feature, category, allFunctions, allSensors, onClose, onSave, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFunctionIds, setSelectedFunctionIds] = useState<string[]>([]);
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);

  const isEditMode = !!feature;

  useEffect(() => {
    if (feature) { // Edit mode
      setName(feature.name);
      setDescription(feature.description);
      
      const paddedFunctions = [...(feature.mandatoryFunctionIds || [])];
      while (paddedFunctions.length < 5) paddedFunctions.push('');
      setSelectedFunctionIds(paddedFunctions.slice(0, 5));

      const paddedSensors = [...(feature.mandatorySensorIds || [])];
      while (paddedSensors.length < 5) paddedSensors.push('');
      setSelectedSensorIds(paddedSensors.slice(0, 5));
    } else { // Add mode
        setName('');
        setDescription('');
        setSelectedFunctionIds(Array(5).fill(''));
        setSelectedSensorIds(Array(5).fill(''));
    }
  }, [feature]);

  const handleFunctionChange = (index: number, value: string) => {
    const newIds = [...selectedFunctionIds];
    newIds[index] = value;
    setSelectedFunctionIds(newIds);
  };

  const handleSensorChange = (index: number, value: string) => {
    const newIds = [...selectedSensorIds];
    newIds[index] = value;
    setSelectedSensorIds(newIds);
  };

  const handleConfirm = () => {
    if (isEditMode && feature) {
      const updatedFeature: ADASFeature = {
        ...feature,
        name,
        description,
        mandatoryFunctionIds: selectedFunctionIds.filter(id => id),
        mandatorySensorIds: selectedSensorIds.filter(id => id),
      };
      onSave(updatedFeature);
    } else {
        const newFeatureData: Omit<ADASFeature, 'id' | 'resources'> = {
            name,
            description,
            category,
            mandatoryFunctionIds: selectedFunctionIds.filter(id => id),
            mandatorySensorIds: selectedSensorIds.filter(id => id),
        };
        onCreate(newFeatureData);
    }
    onClose();
  };
  
  const renderSelect = (
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
    options: {id: string; name: string}[]
  ) => (
      <select 
          value={value} 
          onChange={onChange}
          className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
      >
          <option value="">-- None --</option>
          {options.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
      </select>
  );

  const title = isEditMode ? `Edit Feature: ${feature.name}` : `Add New ${category} Feature`;
  const saveButtonText = isEditMode ? 'Save Changes' : 'Create Feature';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-base-200 rounded-xl border border-base-300 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300">
            <XMarkIcon className="w-6 h-6 text-content-200" />
          </button>
        </header>

        <main className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label htmlFor="feature-name" className="block text-sm font-medium text-content-200 mb-1">Feature Name</label>
            <input
              type="text"
              id="feature-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="e.g., Advanced Lane Keeping"
            />
          </div>
          <div>
            <label htmlFor="feature-description" className="block text-sm font-medium text-content-200 mb-1">Description</label>
            <textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              placeholder="A short description of what this feature does."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Associated Functions</h3>
              {selectedFunctionIds.map((id, index) => (
                <div key={`func-${index}`}>
                  {renderSelect(
                    id,
                    (e) => handleFunctionChange(index, e.target.value),
                    allFunctions
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-white">Associated Sensors</h3>
              {selectedSensorIds.map((id, index) => (
                <div key={`sensor-${index}`}>
                  {renderSelect(
                    id,
                    (e) => handleSensorChange(index, e.target.value),
                    allSensors
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className="flex justify-end items-center p-4 border-t border-base-300 bg-base-200/50 rounded-b-xl">
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 hover:bg-base-300/80 text-white font-semibold transition-colors">Cancel</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-primary/80 text-white font-semibold transition-colors">{saveButtonText}</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FeatureFormModal;