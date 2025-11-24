import React from 'react';
import type { Resources } from '../types.ts';
import { RESOURCE_CONFIG } from '../constants.ts';

interface ResourceComparisonTableProps {
  required: Resources;
  available: Resources;
}

const ResourceComparisonTable: React.FC<ResourceComparisonTableProps> = ({ required, available }) => {

    const formatValue = (key: keyof Resources, value: number) => {
        if (key === 'dramBw') {
            return value.toFixed(1);
        }
        return value.toLocaleString();
    };

    return (
        <div className="overflow-x-auto relative rounded-lg border border-base-300">
            <table className="w-full text-sm text-left text-content-200">
                <thead className="text-xs text-white uppercase bg-base-300/50">
                    <tr>
                        <th scope="col" className="px-4 py-2">Metric</th>
                        <th scope="col" className="px-4 py-2 text-right">Required</th>
                        <th scope="col" className="px-4 py-2 text-right">Available</th>
                        <th scope="col" className="px-4 py-2 text-right">Utilization</th>
                    </tr>
                </thead>
                <tbody>
                    {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => {
                        const config = RESOURCE_CONFIG[key];
                        const requiredValue = required[key];
                        const availableValue = available[key];
                        const utilization = availableValue > 0 ? (requiredValue / availableValue) * 100 : 0;

                        let utilColor = 'text-green-400';
                        if (utilization > 75) utilColor = 'text-yellow-400';
                        if (utilization > 90) utilColor = 'text-orange-400';
                        if (utilization > 100) utilColor = 'text-red-500';

                        return (
                            <tr key={key} className="border-b border-base-300 bg-base-200/20 last:border-b-0 hover:bg-base-200/60">
                                <th scope="row" className="px-4 py-2 font-medium text-white whitespace-nowrap">
                                    {config.name} <span className="text-content-200 text-xs">({config.unit})</span>
                                </th>
                                <td className="px-4 py-2 text-right font-mono">{formatValue(key, requiredValue)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatValue(key, availableValue)}</td>
                                <td className={`px-4 py-2 text-right font-mono font-bold ${utilColor}`}>
                                    {utilization.toFixed(1)}%
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ResourceComparisonTable;
