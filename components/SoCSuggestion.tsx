import React from 'react';
import type { Resources, SoC } from '../types.ts';
import { BoltIcon, ExclamationTriangleIcon, LightBulbIcon, StarIcon } from './icons.tsx';
import ResourceComparisonTable from './ResourceComparisonTable.tsx';

const SoCCard: React.FC<{ soc: SoC, isBestFit: boolean, requiredResources: Resources }> = ({ soc, isBestFit, requiredResources }) => (
  <div className={`
    bg-base-200 rounded-lg p-4 border-2 transition-all
    ${isBestFit ? 'border-brand-primary ring-2 ring-brand-primary/50' : 'border-base-300'}
  `}>
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-xl font-bold text-white">{soc.name}</h4>
        <p className="text-sm text-content-200">{soc.vendor} - {soc.tier}</p>
      </div>
      {isBestFit && (
        <span className="flex items-center gap-1.5 bg-brand-primary/10 text-brand-primary text-xs font-bold px-3 py-1 rounded-full">
          <StarIcon className="w-4 h-4" />
          Best Fit
        </span>
      )}
    </div>
    <div className="mt-4">
      <ResourceComparisonTable required={requiredResources} available={soc.resources} />
    </div>
  </div>
);

const SoCSuggestion: React.FC<{
  suitableSoCs: SoC[];
  bestFitSoC: SoC | null;
  requiredResources: Resources;
  headerAction?: React.ReactNode;
}> = ({ suitableSoCs, bestFitSoC, requiredResources, headerAction }) => {
  const hasSelection = Object.values(requiredResources).some(v => (v as number) > 0);

  return (
    <section className="bg-base-200/50 rounded-xl p-6 border border-base-300 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
                <LightBulbIcon className="w-7 h-7 text-brand-primary" />
                <h2 className="text-2xl font-bold text-white">3. SoC Suggestion</h2>
            </div>
            {headerAction}
        </div>
        
        {!hasSelection ? (
             <div className="flex-grow flex flex-col justify-center items-center text-center">
                 <BoltIcon className="w-12 h-12 text-base-300 mb-4" />
                <p className="text-content-200">SoC recommendations will appear here once features are selected.</p>
            </div>
        ) : suitableSoCs.length > 0 ? (
            <div className="space-y-4">
                {suitableSoCs.map(soc => (
                    <SoCCard 
                        key={soc.id} 
                        soc={soc} 
                        isBestFit={soc.id === bestFitSoC?.id}
                        requiredResources={requiredResources}
                    />
                ))}
            </div>
        ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mb-4"/>
                <h3 className="text-xl font-bold text-white mb-1">No Suitable SoC Found</h3>
                <p className="text-red-300">The required resources exceed the capabilities of all available SoCs in the database. Consider reducing features or sourcing a more powerful chip.</p>
            </div>
        )}
    </section>
  );
};

export default SoCSuggestion;