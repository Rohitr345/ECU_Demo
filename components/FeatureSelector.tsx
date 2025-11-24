import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { CheckCircleIcon, SquaresPlusIcon, CarIcon, ParkingIcon, PencilIcon, PlusIcon } from './icons.tsx';
import { ADASFeature } from '../types.ts';
import FeatureFormModal from './EditFeatureModal.tsx';

const FeatureCard: React.FC<{ feature: ADASFeature, onEdit: (feature: ADASFeature) => void }> = ({ feature, onEdit }) => {
  const { selectedFeatureIds, toggleFeature } = useAppContext();
  const isSelected = selectedFeatureIds.has(feature.id);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(feature);
  };

  return (
    <div
      onClick={() => toggleFeature(feature)}
      className={`
        bg-base-200 rounded-lg p-4 cursor-pointer transition-all duration-300
        border-2 
        ${isSelected ? 'border-brand-primary ring-2 ring-brand-primary/50' : 'border-base-300 hover:border-brand-secondary'}
        relative overflow-hidden group
      `}
    >
      <div className="flex flex-col h-full">
        <h3 className="font-bold text-white text-lg">{feature.name}</h3>
        <p className="text-content-200 text-sm mt-1 flex-grow">{feature.description}</p>
        
        {isSelected && (
          <div className="absolute top-3 right-3 text-brand-primary">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        )}
        
        <button
          onClick={handleEditClick}
          className="absolute bottom-3 right-3 bg-base-300/50 hover:bg-brand-primary/20 text-content-200 hover:text-brand-primary p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={`Edit ${feature.name}`}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const FeatureCategory: React.FC<{
  title: string;
  icon: React.ReactNode;
  features: ADASFeature[];
  onEditFeature: (feature: ADASFeature) => void;
  onAddFeature: (category: 'Driving' | 'Parking') => void;
}> = ({ title, icon, features, onEditFeature, onAddFeature }) => {
    const handleAddClick = () => {
        onAddFeature(title as 'Driving' | 'Parking');
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
                {icon}
                <h3 className="text-xl font-semibold text-content-100">{title}</h3>
            </div>
            <button
                onClick={handleAddClick}
                className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-1.5 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50"
                title={`Add ${title} Feature`}
            >
                <PlusIcon className="w-4 h-4" />
                <span>Add Feature</span>
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(feature => (
            <FeatureCard key={feature.id} feature={feature} onEdit={onEditFeature} />
          ))}
        </div>
      </div>
    );
};


const FeatureSelector: React.FC = () => {
  const { selectedFeatureIds, clearSelection, selectableFeatures, adasFunctions, sensors, updateFeature, addFeature } = useAppContext();
  
  const [modalState, setModalState] = useState<{
      mode: 'add' | 'edit' | null;
      feature?: ADASFeature;
      category?: 'Driving' | 'Parking';
  }>({ mode: null });

  const drivingFeatures = selectableFeatures.filter(f => f.category === 'Driving');
  const parkingFeatures = selectableFeatures.filter(f => f.category === 'Parking');

  const handleEditFeature = (feature: ADASFeature) => {
    setModalState({ mode: 'edit', feature: feature });
  };
  
  const handleAddFeature = (category: 'Driving' | 'Parking') => {
      setModalState({ mode: 'add', category: category });
  }

  const handleCloseModal = () => {
    setModalState({ mode: null });
  };

  const handleSaveFeature = (updatedFeature: ADASFeature) => {
    updateFeature(updatedFeature);
  };
  
  const handleCreateFeature = (newFeatureData: Omit<ADASFeature, 'id' | 'resources'>) => {
      addFeature(newFeatureData);
  }

  const coreFunctions = adasFunctions.filter(f => !f.isFeature);
  
  return (
    <>
        <section className="bg-base-200/50 rounded-xl p-6 border border-base-300">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
            <SquaresPlusIcon className="w-7 h-7 text-brand-primary" />
            <h2 className="text-2xl font-bold text-white">1. Select Features</h2>
            </div>
            {selectedFeatureIds.size > 0 && (
            <div className="flex items-center gap-4">
                <button 
                onClick={clearSelection}
                className="text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors"
                >
                Clear All
                </button>
            </div>
            )}
        </div>
        <div className="space-y-8">
            <FeatureCategory 
                title="Driving"
                icon={<CarIcon className="w-6 h-6 text-brand-secondary" />}
                features={drivingFeatures}
                onEditFeature={handleEditFeature}
                onAddFeature={handleAddFeature}
            />
            <FeatureCategory 
                title="Parking"
                icon={<ParkingIcon className="w-6 h-6 text-brand-secondary" />}
                features={parkingFeatures}
                onEditFeature={handleEditFeature}
                onAddFeature={handleAddFeature}
            />
        </div>
        </section>

        {modalState.mode && (
            <FeatureFormModal 
                feature={modalState.mode === 'edit' ? modalState.feature! : null}
                category={modalState.mode === 'add' ? modalState.category! : modalState.feature!.category}
                allFunctions={coreFunctions}
                allSensors={sensors}
                onClose={handleCloseModal}
                onSave={handleSaveFeature}
                onCreate={handleCreateFeature}
            />
        )}
    </>
  );
};

export default FeatureSelector;