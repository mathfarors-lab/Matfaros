
import React, { useMemo } from 'react';
import { EditorConfig, THEMES, GRADIENTS } from '../types';
import { Zap, Maximize2, ALargeSmall, Layout, Frame, Circle, FileText, HardDrive, ShieldCheck, Gauge, ZoomIn, MoveDiagonal } from 'lucide-react';

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
    { label: '4K Pro', val: 3 }
  ];

  // Improved heuristic for estimated image size reflecting quadratic scaling of pixel density
  const estimatedSize = useMemo(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    const scaleFactor = Math.pow(config.exportScale, 2);
    const qualityFactor = config.pdfQuality / 100;
    const paddingFactor = (config.padding / 64) + 0.5;
    
    // Base size + component factors
    const size = (0.2 + (lines * 0.01) + (chars * 0.00005)) * scaleFactor * paddingFactor * qualityFactor;
    return Math.max(0.05, size).toFixed(2);
  }, [config.exportScale, config.pdfQuality, config.padding, code]);

  const Toggle = ({ label, checked, onChange, icon: Icon }: { label: string, checked: boolean, onChange: (val: boolean) => void, icon?: React.ElementType }) => (
    <div className="flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-all group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-3.5 h-3.5 ${checked ? 'text-purple-400' : 'text-slate-500'}`} />}
        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? 'bg-purple-600' : 'bg-slate-800'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="w-80 bg-slate-950/50 backdrop-blur-3xl border-l border-white/5 p-6 flex flex-col gap-8 h-screen overflow-y-auto z-40">
      {/* File Stats Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-4 h-4 text-purple-400" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Snapshot Metrics</h3>
        </div>
        <div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {estimatedSize} <span className="text-sm font-bold text-slate-500 ml-1">MB</span>
          </div>
          <p className="text-[10px] font-medium text-slate-500 mt-1">Estimated Output Density</p>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Output Fidelity</h3>
        <div className="space-y-4">
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-purple-400" /> Export Resolution
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scaleOptions.map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => updateConfig('exportScale', opt.val)}
                  className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                    config.exportScale === opt.val 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' 
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
                <label>Frame Scaling</label>
              </div>
              <span className="text-slate-200">{Math.round(config.frameScale * 100)}%</span>
            </div>
            <input 
              type="range" min="0.5" max="2" step="0.1"
              value={config.frameScale}
              onChange={(e) => updateConfig('frameScale', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-xs font-bold text-slate-200">Format Quality</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">{config.pdfQuality}%</span>
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
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Typography</h3>
        <div className="space-y-4">
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <ALargeSmall className="w-3.5 h-3.5 text-indigo-400" />
                <label>Font Size</label>
              </div>
              <span className="text-slate-200">{config.fontSize}px</span>
            </div>
            <input 
              type="range" min="12" max="32" step="1"
              value={config.fontSize}
              onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <MoveDiagonal className="w-3.5 h-3.5 text-rose-400" />
                <label>Canvas Padding</label>
              </div>
              <span className="text-slate-200">{config.padding}px</span>
            </div>
            <input 
              type="range" min="16" max="160" step="8"
              value={config.padding}
              onChange={(e) => updateConfig('padding', parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Aesthetics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layout className="w-3.5 h-3.5 text-blue-400" />
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Background Gradient</label>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => updateConfig('background', g)}
                  className={`h-8 w-full rounded-lg border-2 ${g} transition-all ${config.background === g ? 'border-purple-500 scale-110 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
             <Toggle label="Window Buttons" checked={config.showWindowButtons} onChange={(v) => updateConfig('showWindowButtons', v)} icon={Circle} />
             <Toggle label="Line Numbers" checked={config.showLineNumbers} onChange={(v) => updateConfig('showLineNumbers', v)} icon={ShieldCheck} />
             <Toggle label="Rounded Corners" checked={config.rounded} onChange={(v) => updateConfig('rounded', v)} icon={Frame} />
             <Toggle label="Drop Shadow" checked={config.showShadow} onChange={(v) => updateConfig('showShadow', v)} icon={Zap} />
          </div>
        </div>
      </div>

      <div className="mt-auto text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center leading-relaxed">
        Built with Gemini AI & MidTherm Engine<br />
        FarorsCodeSnap Pro v1.1
      </div>
    </div>
  );
};

export default Sidebar;
