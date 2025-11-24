import React, { useState } from 'react';
import { ServerStackIcon, PencilIcon } from './icons.tsx';
import type { Resources, SoC } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import SoCEditorModal from './SoCEditorModal.tsx';
import ResourceComparisonTable from './ResourceComparisonTable.tsx';

const SoCList: React.FC<{ soCs: SoC[], requiredResources: Resources }> = ({ soCs, requiredResources }) => {
    const { setSoCs } = useAppContext();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [expandedSoCId, setExpandedSoCId] = useState<string | null>(null);

    // FIX: Cast value to number for type-safe comparison.
    const hasSelection = Object.values(requiredResources).some(v => (v as number) > 0);

    const handleRowClick = (socId: string) => {
        if (hasSelection) {
            setExpandedSoCId(prevId => (prevId === socId ? null : socId));
        }
    };

    return (
        <>
            <section className="bg-base-200/50 rounded-xl p-6 mt-8 border border-base-300">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <ServerStackIcon className="w-7 h-7 text-brand-primary" />
                        <h2 className="text-2xl font-bold text-white">Available SoC Portfolio</h2>
                    </div>
                    <button
                        onClick={() => setIsEditorOpen(true)}
                        className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-1.5 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50"
                        title="Edit SoC Portfolio"
                    >
                        <PencilIcon className="w-4 h-4" />
                        <span>Edit Portfolio</span>
                    </button>
                </div>
                <div className="overflow-x-auto relative rounded-lg border border-base-300">
                    <table className="w-full text-sm text-left text-content-200">
                        <thead className="text-xs text-white uppercase bg-base-300/50">
                            <tr>
                                <th scope="col" className="px-4 py-3">SoC Name</th>
                                <th scope="col" className="px-4 py-3">Vendor</th>
                                <th scope="col" className="px-4 py-3">Tier</th>
                                <th scope="col" className="px-4 py-3 text-right">CPU (kDMIPS)</th>
                                <th scope="col" className="px-4 py-3 text-right">AI (TOPs)</th>
                                <th scope="col" className="px-4 py-3 text-right">ISP (MP/s)</th>
                                <th scope="col" className="px-4 py-3 text-right">Dewarp (MP/s)</th>
                                <th scope="col" className="px-4 py-3 text-right">GPU (GFLOPS)</th>
                                <th scope="col" className="px-4 py-3 text-right">DRAM (GB/s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {soCs.map((soc: SoC) => (
                                <React.Fragment key={soc.id}>
                                    <tr 
                                        onClick={() => handleRowClick(soc.id)}
                                        className={`
                                            border-b border-base-300 bg-base-200/20 
                                            ${hasSelection ? 'hover:bg-base-200/60 cursor-pointer' : ''}
                                            ${expandedSoCId === soc.id ? 'bg-base-200/60' : ''}
                                        `}
                                    >
                                        <th scope="row" className="px-4 py-4 font-bold text-white whitespace-nowrap">
                                            {soc.name}
                                        </th>
                                        <td className="px-4 py-4">{soc.vendor}</td>
                                        <td className="px-4 py-4">{soc.tier}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.kDMIPS.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.tops}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.isp.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.dewarp.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.gpu}</td>
                                        <td className="px-4 py-4 text-right font-mono">{soc.resources.dramBw.toFixed(1)}</td>
                                    </tr>
                                    {expandedSoCId === soc.id && (
                                        <tr className="bg-base-200/40">
                                            <td colSpan={9} className="p-4">
                                                <div className="bg-base-200 p-4 rounded-lg">
                                                     <h4 className="text-md font-bold text-white text-center mb-4">Resource Utilization for {soc.name}</h4>
                                                    <ResourceComparisonTable required={requiredResources} available={soc.resources} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {isEditorOpen && (
                <SoCEditorModal
                    soCs={soCs}
                    onSave={setSoCs}
                    onClose={() => setIsEditorOpen(false)}
                />
            )}
        </>
    );
};

export default SoCList;