import React from 'react';
import type { ADASFeature, ADASFunction, Resources, Sensor, SoC } from '../types.ts';
import { ChipIcon, SquaresPlusIcon, CalculatorIcon, LightBulbIcon, StarIcon, CpuChipIcon, VideoCameraIcon, Cog6ToothIcon } from './icons.tsx';
import { RESOURCE_CONFIG } from '../constants.ts';

interface ReportGeneratorProps {
  selectedFeatures: ADASFeature[];
  mandatoryFunctions: ADASFunction[];
  mandatorySensors: Sensor[];
  totalResources: Resources;
  bestFitSoC: SoC;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ selectedFeatures, mandatoryFunctions, mandatorySensors, totalResources, bestFitSoC }) => {
  
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
  
  const thStyle: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #334155' };
  const thStyleRight: React.CSSProperties = { ...thStyle, textAlign: 'right' };
  const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #334155' };
  const tdStyleRight: React.CSSProperties = { ...tdStyle, textAlign: 'right', fontFamily: 'monospace' };
  const nameTdStyle: React.CSSProperties = { ...tdStyle, color: 'white', fontWeight: 'bold' };

  return (
    <div style={{ width: '1600px', padding: '32px', backgroundColor: '#0F172A', color: '#CBD5E1', fontFamily: 'sans-serif', border: '1px solid #334155' }}>
      <header style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '1px solid #334155', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <ChipIcon className="w-10 h-10 text-brand-primary" />
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'white', letterSpacing: '-0.025em' }}>ADAS SoC Selection Summary</h1>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* COLUMN 1: SELECTED FEATURES */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <SquaresPlusIcon className="w-7 h-7 text-brand-primary" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Selected Features</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedFeatures.map(feature => (
              <div key={feature.id} style={{ backgroundColor: '#1E293B', padding: '12px', borderRadius: '0.5rem' }}>
                <h3 style={{ fontWeight: 'bold', color: 'white' }}>{feature.name}</h3>
                <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '4px' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMN 2: REQUIRED COMPONENTS */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CalculatorIcon className="w-7 h-7 text-brand-primary" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Required Components</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* SENSORS TABLE */}
              <div>
                  <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '12px'}}>Required Sensors</h3>
                  <div style={{ borderRadius: '0.5rem', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={thStyle}>Sensor</th>
                                {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                    <th scope="col" key={key} style={thStyleRight}>{RESOURCE_CONFIG[key].name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{backgroundColor: 'rgba(30, 41, 59, 0.2)'}}>
                            {mandatorySensors.map(sensor => (
                                <tr key={sensor.id}>
                                    <th scope="row" style={nameTdStyle}>{sensor.name}</th>
                                    {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                        <td key={key} style={tdStyleRight}>
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
                  <h3 style={{fontSize: '1.125rem', fontWeight: '600', color: 'white', marginBottom: '12px'}}>Required Functions</h3>
                  <div style={{ borderRadius: '0.5rem', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={thStyle}>Function</th>
                                {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                    <th scope="col" key={key} style={thStyleRight}>{RESOURCE_CONFIG[key].name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{backgroundColor: 'rgba(30, 41, 59, 0.2)'}}>
                            {mandatoryFunctions.map(func => (
                                <tr key={func.id}>
                                    <th scope="row" style={nameTdStyle}>{func.name}</th>
                                    {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                                        <td key={key} style={tdStyleRight}>
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
        </section>

        {/* COLUMN 3: TOTALS & SUGGESTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TOTALS */}
          <section>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Cog6ToothIcon className="w-7 h-7 text-brand-primary" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Total Requirements</h2>
            </div>
            <div style={{ borderRadius: '0.5rem', border: '2px solid #00A9FF', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: 'white' }}>
                  <thead style={{ backgroundColor: 'rgba(0, 169, 255, 0.3)', fontSize: '12px', textTransform: 'uppercase' }}>
                      <tr>
                          <th style={{ ...thStyle, borderBottom: '1px solid #00A9FF' }}>Metric</th>
                          {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                              <th scope="col" key={key} style={{...thStyleRight, borderBottom: '1px solid #00A9FF'}}>{`${RESOURCE_CONFIG[key].name} (${RESOURCE_CONFIG[key].unit})`}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody style={{backgroundColor: 'rgba(0, 169, 255, 0.2)'}}>
                      <tr style={{ fontWeight: 'bold' }}>
                          <th scope="row" style={{...tdStyle, borderBottom: 'none', fontSize: '16px'}}>Total Required</th>
                          {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map(key => (
                              <td key={key} style={{ ...tdStyleRight, borderBottom: 'none', fontSize: '18px'}}>
                                  {formatValue(key, totalResources[key])}
                              </td>
                          ))}
                      </tr>
                  </tbody>
              </table>
            </div>
          </section>

          {/* SUGGESTION */}
          <section style={{ backgroundColor: '#1E293B', borderRadius: '0.75rem', padding: '24px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <LightBulbIcon className="w-7 h-7 text-brand-primary" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>SoC Suggestion</h2>
            </div>
            <div style={{ backgroundColor: '#0F172A', borderRadius: '0.5rem', padding: '16px', border: '2px solid #00A9FF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>{bestFitSoC.name}</h3>
                  <p style={{ fontSize: '14px', color: '#94A3B8' }}>{bestFitSoC.vendor} - {bestFitSoC.tier}</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(0, 169, 255, 0.1)', color: '#00A9FF', fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px' }}>
                  <StarIcon className="w-4 h-4" />
                  Best Fit
                </span>
              </div>
              
              <div style={{ marginTop: '24px', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                 <h4 style={{ fontWeight: '600', color: 'white', textAlign: 'center', marginBottom: '16px', fontSize: '1.125rem' }}>Resource Utilization</h4>
                 <div style={{ borderRadius: '0.5rem', border: '1px solid #334155', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ backgroundColor: 'rgba(51, 65, 85, 0.5)', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}>
                            <tr>
                                <th style={thStyle}>Metric</th>
                                <th style={thStyleRight}>Required</th>
                                <th style={thStyleRight}>Available</th>
                                <th style={thStyleRight}>Utilization</th>
                            </tr>
                        </thead>
                        <tbody style={{backgroundColor: 'rgba(30, 41, 59, 0.2)'}}>
                            {(Object.keys(RESOURCE_CONFIG) as Array<keyof Resources>).map((key, index, arr) => {
                                const rKey = key as keyof Resources;
                                const config = RESOURCE_CONFIG[rKey];
                                const requiredValue = totalResources[rKey];
                                const availableValue = bestFitSoC.resources[rKey];
                                const utilization = availableValue > 0 ? (requiredValue / availableValue) * 100 : 0;

                                let utilColor = '#4ade80'; // text-green-400
                                if (utilization > 75) utilColor = '#facc15'; // text-yellow-400
                                if (utilization > 90) utilColor = '#fb923c'; // text-orange-400
                                if (utilization > 100) utilColor = '#ef4444'; // text-red-500

                                const isLastRow = index === arr.length - 1;
                                const rowTdStyle = isLastRow ? { ...tdStyle, borderBottom: 'none' } : tdStyle;
                                const rowTdStyleRight = isLastRow ? { ...tdStyleRight, borderBottom: 'none' } : tdStyleRight;
                                const rowNameTdStyle = isLastRow ? { ...nameTdStyle, borderBottom: 'none' } : nameTdStyle;
                                
                                return (
                                    <tr key={key}>
                                        <th scope="row" style={rowNameTdStyle}>
                                            {config.name} <span style={{ color: '#94A3B8', fontSize: '12px' }}>({config.unit})</span>
                                        </th>
                                        <td style={rowTdStyleRight}>
                                            {formatValue(rKey, requiredValue)}
                                        </td>
                                        <td style={rowTdStyleRight}>
                                            {formatValue(rKey, availableValue)}
                                        </td>
                                        <td style={{ ...rowTdStyleRight, fontWeight: 'bold', color: utilColor }}>
                                            {utilization.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ReportGenerator;
