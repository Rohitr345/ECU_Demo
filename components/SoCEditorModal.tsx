import React, { useState, useEffect } from 'react';
import type { Resources, SoC } from '../types.ts';
import { RESOURCE_CONFIG } from '../constants.ts';
import { Cog6ToothIcon, XMarkIcon, PlusIcon, TrashIcon } from './icons.tsx';

type EditableSoC = SoC & { tempId?: string };

interface SoCEditorModalProps {
  soCs: EditableSoC[];
  onSave: (updatedSoCs: SoC[]) => void;
  onClose: () => void;
}

const EMPTY_RESOURCES: Resources = { kDMIPS: 0, tops: 0, isp: 0, dewarp: 0, gpu: 0, dramBw: 0 };
const TIER_OPTIONS: SoC['tier'][] = ['Entry', 'Mid-range', 'High-performance'];

const SoCEditorModal: React.FC<SoCEditorModalProps> = ({ soCs, onSave, onClose }) => {
  const [editedItems, setEditedItems] = useState<EditableSoC[]>([]);

  useEffect(() => {
    setEditedItems(JSON.parse(JSON.stringify(soCs)));
  }, [soCs]);

  const handleInputChange = (index: number, field: keyof EditableSoC | keyof Resources, value: string) => {
    const newItems = [...editedItems];
    const item = newItems[index];

    if (field in item.resources) {
        const numericValue = value === '' ? 0 : parseFloat(value);
        (item.resources as any)[field] = isNaN(numericValue) ? 0 : numericValue;
    } else if (field in item) {
        (item as any)[field] = value;
    }

    setEditedItems(newItems);
  };

  const handleAddNew = () => {
    const newItem: EditableSoC = {
      id: `new-soc-${Date.now()}`,
      tempId: `new-soc-${Date.now()}`,
      name: 'New SoC',
      vendor: 'New Vendor',
      tier: 'Entry',
      resources: { ...EMPTY_RESOURCES },
    };
    setEditedItems([...editedItems, newItem]);
  };

  const handleDelete = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const finalItems = editedItems.map(item => {
      const { tempId, ...rest } = item;
      return rest;
    });
    onSave(finalItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-base-200 rounded-xl border border-base-300 w-full max-w-7xl max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-base-300">
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl font-bold text-white">Edit SoC Portfolio</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-base-300">
            <XMarkIcon className="w-6 h-6 text-content-200" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          <div className="overflow-x-auto relative rounded-lg border border-base-300">
            <table className="w-full text-sm text-left text-content-200">
              <thead className="text-xs text-white uppercase bg-base-300/50">
                <tr>
                  <th scope="col" className="px-2 py-3 min-w-[150px]">Name</th>
                  <th scope="col" className="px-2 py-3 min-w-[150px]">Vendor</th>
                  <th scope="col" className="px-2 py-3 min-w-[150px]">Tier</th>
                  {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                    <th scope="col" key={key} className="px-2 py-3 text-right">{`${RESOURCE_CONFIG[key].name} (${RESOURCE_CONFIG[key].unit})`}</th>
                  ))}
                  <th scope="col" className="px-2 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editedItems.map((item, index) => (
                  <tr key={item.id || item.tempId} className="border-b border-base-300 bg-base-200/20">
                    <td className="px-1 py-2">
                      <input type="text" value={item.name} onChange={(e) => handleInputChange(index, 'name', e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                    </td>
                    <td className="px-1 py-2">
                      <input type="text" value={item.vendor} onChange={(e) => handleInputChange(index, 'vendor', e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                    </td>
                    <td className="px-1 py-2">
                       <select value={item.tier} onChange={(e) => handleInputChange(index, 'tier', e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md p-2 text-content-100 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary">
                        {TIER_OPTIONS.map(tier => <option key={tier} value={tier}>{tier}</option>)}
                       </select>
                    </td>
                    {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                      <td key={key} className="px-1 py-2">
                        <input type="number" value={item.resources[key]} onChange={(e) => handleInputChange(index, key, e.target.value)} className="w-full text-right bg-base-100 border border-base-300 rounded-md p-2 font-mono text-content-100 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary" />
                      </td>
                    ))}
                    <td className="px-1 py-2 text-center">
                      <button onClick={() => handleDelete(index)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full transition-colors" title="Delete">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
             <button onClick={handleAddNew} className="flex items-center gap-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary/20 hover:text-brand-primary text-content-100 px-3 py-1.5 rounded-lg transition-colors border border-base-300/50 hover:border-brand-primary/50">
              <PlusIcon className="w-4 h-4" />
              <span>Add New SoC</span>
            </button>
          </div>
        </main>

        <footer className="flex justify-end items-center p-4 border-t border-base-300 bg-base-200/50 mt-auto">
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-base-300 hover:bg-base-300/80 text-white font-semibold transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-brand-primary hover:bg-brand-primary/80 text-white font-semibold transition-colors">Save Changes</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SoCEditorModal;