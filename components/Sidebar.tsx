
import React, { useMemo } from 'react';
import { EditorConfig, THEMES, GRADIENTS } from '../types';
import { Zap, Maximize2, ALargeSmall, Layout, Frame, Circle, FileText, HardDrive, ShieldCheck, Gauge, ZoomIn, MoveDiagonal, Type } from 'lucide-react';

interface SidebarProps {
  config: EditorConfig;
  setConfig: React.Dispatch<React.SetStateAction<EditorConfig>>;
  code: string;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, code }) => {
  const updateConfig = (key: keyof EditorConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const scaleOptions = [
    { label: 'Standard', val: 1 },
    { label: 'Retina', val: 2 },
    { label: '4K Pro', val: 3 },
    { label: 'Ultra', val: 4 }
  ];

  const estimatedSize = useMemo(() => {
    const baseKB = 92; 
    const charWeight = 0.012; 
    const lineWeight = 1.15;    
    
    const lines = code.split('\n').length;
    const chars = code.length;

    const fontSizeMultiplier = config.fontSize / 16;
    const contentWeight = (baseKB + (lines * lineWeight * fontSizeMultiplier) + (chars * charWeight));
    const resMultiplier = Math.pow(config.exportScale, 2);
    const zoomMultiplier = config.frameScale > 1 ? config.frameScale * 0.8 : 1;
    const paddingMultiplier = (config.padding / 64) + 0.5;
    const qualityFactor = Math.pow(config.pdfQuality / 100, 2.2);
    
    const size = (contentWeight * resMultiplier * zoomMultiplier * paddingMultiplier * qualityFactor).toFixed(1);
    return parseFloat(size);
  }, [config.exportScale, config.pdfQuality, config.frameScale, config.fontSize, config.padding, code]);

  const Toggle = ({ label, checked, onChange, icon: Icon }: { label: string, checked: boolean, onChange: (val: boolean) => void, icon?: React.ElementType }) => (
    <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all duration-300 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${checked ? 'text-purple-400' : 'text-slate-500'}`} />}
        <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-500 focus:outline-none ${
          checked ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-slate-800'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="w-80 bg-slate-950/50 backdrop-blur-3xl border-l border-white/5 p-6 flex flex-col gap-8 h-screen overflow-y-auto custom-scrollbar z-40">
      
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <HardDrive className="w-12 h-12 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-400" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Storage Predictor</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tighter">
              {estimatedSize >= 1000 ? (estimatedSize / 1000).toFixed(2) : estimatedSize}
              <span className="text-sm font-bold text-slate-500 ml-1.5">{estimatedSize >= 1000 ? 'MB' : 'KB'}</span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">Estimated Output Size</p>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700"
               style={{ width: `${Math.min(100, (estimatedSize / 3500) * 100)}%` }}
             />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">PDF Fidelity</h3>
        <div className="space-y-6">
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <Maximize2 className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-bold text-slate-200">Resolution Scale</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {scaleOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => updateConfig('exportScale', opt.val)}
                  className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex flex-col items-center gap-0.5 ${
                    config.exportScale === opt.val 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-xl shadow-purple-900/40' 
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="opacity-50 text-[8px]">{opt.val}x</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                <label>Frame Zoom (Big)</label>
              </div>
              <span className="text-slate-200 font-mono">{Math.round(config.frameScale * 100)}%</span>
            </div>
            <input 
              type="range" min="0.5" max="2.5" step="0.05"
              value={config.frameScale}
              onChange={(e) => updateConfig('frameScale', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-bold text-slate-200">Compression Quality</p>
              </div>
              <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded text-emerald-400">{config.pdfQuality}%</span>
            </div>
            <input 
              type="range" min="30" max="100" step="1"
              value={config.pdfQuality}
              onChange={(e) => updateConfig('pdfQuality', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Typography & Layout</h3>
        <div className="space-y-6">
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ALargeSmall className="w-3.5 h-3.5 text-indigo-400" />
                <label>Font Size</label>
              </div>
              <span className="text-slate-200 font-mono">{config.fontSize}px</span>
            </div>
            <input 
              type="range" min="8" max="60" step="1"
              value={config.fontSize}
              onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <MoveDiagonal className="w-3.5 h-3.5 text-rose-400" />
                <label>Canvas Padding (200% Scale)</label>
              </div>
              <span className="text-slate-200 font-mono">{config.padding}px</span>
            </div>
            <input 
              type="range" min="0" max="400" step="4"
              value={config.padding}
              onChange={(e) => updateConfig('padding', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <p className="text-[8px] text-slate-600 mt-2 text-center uppercase font-bold tracking-widest">Increase padding for extreme background exposure</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Frame Aesthetics</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layout className="w-4 h-4 text-blue-400" />
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Texture</label>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => updateConfig('background', g)}
                  className={`h-8 w-full rounded-lg border-2 ${g} transition-all duration-300 ${config.background === g ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/30' : 'border-white/5 hover:border-white/20'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
             <Toggle label="MacOS UI Buttons" checked={config.showWindowButtons} onChange={(v) => updateConfig('showWindowButtons', v)} icon={Circle} />
             <Toggle label="Line Numbering" checked={config.showLineNumbers} onChange={(v) => updateConfig('showLineNumbers', v)} icon={ShieldCheck} />
             <Toggle label="Edge Rounding" checked={config.rounded} onChange={(v) => updateConfig('rounded', v)} icon={Frame} />
             <Toggle label="Frame Shadow" checked={config.showShadow} onChange={(v) => updateConfig('showShadow', v)} icon={Zap} />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-6">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3">
           <div className="p-1.5 bg-emerald-500/10 rounded-lg"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></div>
           <p className="text-[9px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
             Secure engine v2.2. Farors Audited.
           </p>
        </div>
        
        <div className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] text-center leading-relaxed pb-4 border-t border-white/5 pt-6 px-2">
          Copyright © 2026 MidTherm News.<br />
          <span className="text-slate-600">All rights reserved. Farors</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
