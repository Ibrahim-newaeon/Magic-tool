import React from 'react';
import { BrandKit } from '../types/offerTemplate';
import { Palette, Type, Box, Layers } from 'lucide-react';
import { Button } from './Button';

interface BrandSettingsProps {
  brandKit: BrandKit;
  onChange: (kit: BrandKit) => void;
  onClose: () => void;
}

export const BrandSettings: React.FC<BrandSettingsProps> = ({ brandKit, onChange, onClose }) => {
  
  const fonts = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Playfair Display', value: '"Playfair Display", serif' },
    { name: 'Montserrat', value: '"Montserrat", sans-serif' },
    { name: 'Roboto Mono', value: '"Roboto Mono", monospace' },
    { name: 'Permanent Marker', value: '"Permanent Marker", cursive' },
  ];

  const radiuses = ['none', 'sm', 'md', 'lg', 'full'];
  const shadows = ['none', 'soft', 'strong'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette size={20} className="text-pink-500" /> Brand Kit
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
           
           {/* Colors */}
           <div className="space-y-3">
             <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Palette size={16} /> Brand Colors
             </h3>
             <div className="grid grid-cols-3 gap-4">
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Primary</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={brandKit.primaryColor} 
                        onChange={e => onChange({...brandKit, primaryColor: e.target.value})}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs font-mono text-slate-400">{brandKit.primaryColor}</span>
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Secondary</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={brandKit.secondaryColor} 
                        onChange={e => onChange({...brandKit, secondaryColor: e.target.value})}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs font-mono text-slate-400">{brandKit.secondaryColor}</span>
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Accent</label>
                   <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={brandKit.accentColor} 
                        onChange={e => onChange({...brandKit, accentColor: e.target.value})}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-xs font-mono text-slate-400">{brandKit.accentColor}</span>
                   </div>
                </div>
             </div>
           </div>

           {/* Fonts */}
           <div className="space-y-3">
             <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Type size={16} /> Typography
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Primary Font</label>
                   <select 
                     value={brandKit.primaryFont}
                     onChange={e => onChange({...brandKit, primaryFont: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white"
                   >
                     {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Secondary Font</label>
                   <select 
                     value={brandKit.secondaryFont}
                     onChange={e => onChange({...brandKit, secondaryFont: e.target.value})}
                     className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white"
                   >
                     {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                   </select>
                </div>
             </div>
           </div>

           {/* Shapes */}
           <div className="space-y-3">
             <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Box size={16} /> Shape & Style
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Corner Radius</label>
                   <div className="flex bg-slate-950 rounded-lg p-1">
                      {radiuses.map(r => (
                        <button
                          key={r}
                          onClick={() => onChange({...brandKit, defaultBorderRadius: r as any})}
                          className={`flex-1 py-1 text-[10px] rounded ${brandKit.defaultBorderRadius === r ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                        >
                          {r}
                        </button>
                      ))}
                   </div>
                </div>
                <div>
                   <label className="text-xs text-slate-500 mb-1 block">Shadow Depth</label>
                   <div className="flex bg-slate-950 rounded-lg p-1">
                      {shadows.map(s => (
                        <button
                          key={s}
                          onClick={() => onChange({...brandKit, defaultShadow: s as any})}
                          className={`flex-1 py-1 text-[10px] rounded ${brandKit.defaultShadow === s ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
           </div>
           
           {/* Preview */}
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mt-4">
              <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider">Style Preview</label>
              <div 
                className="w-full h-24 flex items-center justify-center text-center p-4"
                style={{
                    backgroundColor: brandKit.primaryColor,
                    borderRadius: brandKit.defaultBorderRadius === 'full' ? '24px' : brandKit.defaultBorderRadius === 'lg' ? '16px' : brandKit.defaultBorderRadius === 'md' ? '8px' : brandKit.defaultBorderRadius === 'sm' ? '4px' : '0px',
                    boxShadow: brandKit.defaultShadow === 'strong' ? '0 10px 15px -3px rgba(0, 0, 0, 0.5)' : brandKit.defaultShadow === 'soft' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                 <div>
                    <h4 style={{ fontFamily: brandKit.primaryFont, color: brandKit.secondaryColor }} className="text-lg font-bold">Brand Heading</h4>
                    <p style={{ fontFamily: brandKit.secondaryFont, color: brandKit.accentColor }} className="text-sm">Subtitle Style</p>
                 </div>
              </div>
           </div>

        </div>
        
        <div className="p-6 border-t border-slate-800">
           <Button onClick={onClose} className="w-full">Save Changes</Button>
        </div>
      </div>
    </div>
  );
};
