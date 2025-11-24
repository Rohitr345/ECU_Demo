import React, { useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import type { ADASFunction, SoC, Sensor, Resources } from '../types.ts';
import { Cog6ToothIcon, XMarkIcon, ArrowDownTrayIcon, DocumentArrowUpIcon } from './icons.tsx';

// Make SheetJS library available from the script tag
declare var XLSX: any;

const DataManagementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { soCs, setSoCs, sensors, setSensors, adasFunctions, setAdasFunctions } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = (file: File, type: 'socs' | 'sensors' | 'features') => {
        const reader = new FileReader();

        const processJson = (data: any) => {
            // Basic validation can be improved
            if (!Array.isArray(data)) throw new Error("Invalid format: expected an array.");
            switch (type) {
                case 'socs': setSoCs(data as SoC[]); break;
                case 'sensors': setSensors(data as Sensor[]); break;
                case 'features': setAdasFunctions(data as ADASFunction[]); break;
            }
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} portfolio imported successfully!`);
        };

        const processXlsx = (arrayBuffer: ArrayBuffer) => {
            const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Convert flat JSON from excel to nested resources structure
            const formattedData = jsonData.map((row: any) => {
                const resources: Partial<Resources> = {};
                const baseData: { [key: string]: any } = {};

                Object.keys(row).forEach(key => {
                    const resourceKeyMatch = key.match(/resources\.(.*)/);
                    if (resourceKeyMatch) {
                        const resourceKey = resourceKeyMatch[1] as keyof Resources;
                        resources[resourceKey] = parseFloat(row[key]) || 0;
                    } else {
                        baseData[key] = row[key];
                    }
                });

                if(type === 'features') {
                    // Handle comma-separated strings for function/sensor IDs
                    if (baseData.mandatoryFunctionIds && typeof baseData.mandatoryFunctionIds === 'string') {
                        baseData.mandatoryFunctionIds = baseData.mandatoryFunctionIds.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                        baseData.mandatoryFunctionIds = [];
                    }
                    if (baseData.mandatorySensorIds && typeof baseData.mandatorySensorIds === 'string') {
                        baseData.mandatorySensorIds = baseData.mandatorySensorIds.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                        baseData.mandatorySensorIds = [];
                    }
                }

                return { ...baseData, resources };
            });

            processJson(formattedData);
        };
        
        if (file.name.endsWith('.json')) {
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string;
                    const data = JSON.parse(text);
                    processJson(data);
                } catch (err) {
                    alert(`Error parsing JSON file: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
             reader.onload = (e) => {
                try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    processXlsx(arrayBuffer);
                } catch (err) {
                     alert(`Error parsing XLSX file: ${err instanceof Error ? err.message : 'Unknown error'}`);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert("Unsupported file type. Please use .json or .xlsx");
        }
    };

    const triggerImport = (type: 'socs' | 'sensors' | 'features') => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ".json, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                handleFileImport(file, type);
            }
        };
        input.click();
    };

    const handleExport = (data: any[], filename: string) => {
        try {
            // Flatten nested resources for Excel compatibility
            const flattenedData = data.map(item => {
                const flatItem: {[key: string]: any} = { ...item };
                delete flatItem.resources;

                for (const key in item.resources) {
                    flatItem[`resources.${key}`] = item.resources[key];
                }

                // Convert arrays to comma-separated strings for Excel
                if (Array.isArray(flatItem.mandatoryFunctionIds)) {
                    flatItem.mandatoryFunctionIds = flatItem.mandatoryFunctionIds.join(', ');
                }
                if (Array.isArray(flatItem.mandatorySensorIds)) {
                    flatItem.mandatorySensorIds = flatItem.mandatorySensorIds.join(', ');
                }

                return flatItem;
            });

            const worksheet = XLSX.utils.json_to_sheet(flattenedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
            XLSX.writeFile(workbook, `${filename}.xlsx`);
        } catch (err) {
             alert(`Error exporting to XLSX: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };
    
    const DataSection: React.FC<{
        title: string;
        onImport: () => void;
        onExport: () => void;
        templateFile: string;
    }> = ({ title, onImport, onExport, templateFile }) => (
        <div className="bg-base-300/50 p-4 rounded-lg border border-base-300">
            <h3 className="text-lg font-semibold text-white mb-3">{title} Portfolio</h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={onImport} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-base-200 hover:bg-base-300 text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50">
                    <DocumentArrowUpIcon className="w-5 h-5" />
                    <span>Import (.xlsx/.json)</span>
                </button>
                <button onClick={onExport} className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold bg-base-200 hover:bg-base-300 text-content-100 px-3 py-2 rounded-lg transition-colors border border-base-300/50">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Export (.xlsx)</span>
                </button>
            </div>
             <div className="text-center mt-3">
                <a href={`./${templateFile}`} download className="text-sm text-brand-secondary hover:text-brand-primary underline transition-colors">Download Template</a>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-base-200 rounded-xl border border-base-300 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <Cog6ToothIcon className="w-6 h-6 text-brand-primary" />
                        <h2 className="text-xl font-bold text-white">Manage Data Portfolios</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300">
                        <XMarkIcon className="w-6 h-6 text-content-200" />
                    </button>
                </header>

                <main className="p-6 space-y-4 overflow-y-auto">
                    <p className="text-content-200 text-sm mb-4">
                        Import your own component data from Excel (.xlsx) or JSON (.json) files. Exporting generates an Excel file which you can edit and re-import.
                    </p>
                    <DataSection
                        title="SoCs"
                        onImport={() => triggerImport('socs')}
                        onExport={() => handleExport(soCs, 'soc-portfolio')}
                        templateFile="socs-template.json"
                    />
                    <DataSection
                        title="Sensors"
                        onImport={() => triggerImport('sensors')}
                        onExport={() => handleExport(sensors, 'sensor-portfolio')}
                        templateFile="sensors-template.json"
                    />
                    <DataSection
                        title="Functions & Features"
                        onImport={() => triggerImport('features')}
                        onExport={() => handleExport(adasFunctions, 'functions-features-portfolio')}
                        templateFile="features-template.json"
                    />
                </main>

                <footer className="flex justify-end items-center p-4 border-t border-base-300 bg-base-200/50">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 hover:bg-base-300/80 text-white font-semibold transition-colors">Close</button>
                </footer>
            </div>
        </div>
    );
};

export default DataManagementModal;
