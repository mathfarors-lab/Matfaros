
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, FileText, Sparkles, Trash2, Link as LinkIcon, Check, Copy, Zap, Cpu, X, ExternalLink, ChevronDown, Palette, HardDrive, AlertTriangle } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import { EditorConfig, GRADIENTS, THEMES } from './types';
import { detectLanguage, findSyntaxErrors } from './services/geminiService';

const DEFAULT_CODE = `/**
 * @project FarorsCodeSnapPro
 * @copyright 2026 MidTherm News
 */
function generateEpicPdf() {
  const quality = "Ultra HD";
  const status = "Ready for Export";
  
  return \`Status: \${status} at \${quality} fidelity\`;
}`;

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'css', 'html', 'rust', 'go', 'json', 'markdown', 'cpp', 'csharp', 'java', 'php', 'bash', 'plain text'
];

const App: React.FC = () => {
  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('c');
    if (sharedCode) {
      try { return atob(sharedCode); } catch { return DEFAULT_CODE; }
    }
    return DEFAULT_CODE;
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCheckingErrors, setIsCheckingErrors] = useState(false);
  const [errorLines, setErrorLines] = useState<number[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  
  const [config, setConfig] = useState<EditorConfig>({
    theme: 'dracula',
    background: GRADIENTS[0],
    language: 'javascript',
    fontSize: 16,
    padding: 64,
    frameScale: 1.1,
    showLineNumbers: true,
    showWindowControls: true,
    showWindowButtons: true,
    showShadow: true,
    rounded: true,
    opacity: 100,
    compactMode: true,
    jpgQuality: 80,
    pdfQuality: 95,
    exportScale: 2
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setShowLangMenu(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) setShowThemeMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // AI Language and Error Detection
  useEffect(() => {
    if (!code.trim()) {
      setErrorLines([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsDetecting(true);
      setIsCheckingErrors(true);
      try {
        const lang = await detectLanguage(code);
        if (lang && lang.toLowerCase() !== config.language.toLowerCase()) {
          setConfig(prev => ({ ...prev, language: lang }));
        }
        const errors = await findSyntaxErrors(code, lang);
        setErrorLines(errors);
      } catch (err) {
        console.error("AI Services failed", err);
      } finally {
        setIsDetecting(false);
        setIsCheckingErrors(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [code]);

  const exportPdf = useCallback(async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    setExportProgress(10);
    
    try {
      await document.fonts.ready;
      setExportProgress(30);
      
      const dataUrl = await htmlToImage.toJpeg(previewRef.current, {
        pixelRatio: config.exportScale,
        quality: config.pdfQuality / 100,
        cacheBust: true,
      });
      setExportProgress(60);

      const width = previewRef.current.clientWidth;
      const height = previewRef.current.clientHeight;
      const pdf = new jsPDF({
        orientation: width > height ? 'l' : 'p',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, config.pdfQuality > 85 ? 'SLOW' : 'FAST');
      setExportProgress(90);
      
      pdf.save(`farors-${config.language || 'code'}-${new Date().getTime()}.pdf`);
      setExportProgress(100);
      
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alert('PDF generation encountered an error.');
      setIsExporting(false);
      setExportProgress(0);
    }
  }, [config.exportScale, config.pdfQuality, config.language]);

  const getShareUrl = () => btoa(code);
  const clearCode = () => { 
    setCode(''); 
    setConfig(prev => ({ ...prev, language: 'plain text' }));
    setErrorLines([]);
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 font-inter selection:bg-purple-500/30">
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Export Progress Bar Overlay */}
        {isExporting && (
          <div className="absolute top-0 left-0 w-full h-1 z-[100] bg-slate-900">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        )}

        <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-9 h-9 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-purple-500/10 group-hover:scale-105 transition-transform duration-500">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-sm font-black tracking-tighter text-white">
                FarorsCodeSnap<span className="text-purple-500">Pro</span>
              </h1>
            </div>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${isDetecting ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}
                >
                  <Cpu className={`w-3.5 h-3.5 ${isDetecting ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
                    {isDetecting ? 'Detecting...' : config.language}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {showLangMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {LANGUAGES.map(lang => (
                        <button key={lang} onClick={() => { setConfig(prev => ({ ...prev, language: lang })); setShowLangMenu(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${config.language === lang ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Status Indicator */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${isCheckingErrors ? 'opacity-50' : ''} ${errorLines.length > 0 ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                <AlertTriangle className={`w-3.5 h-3.5 ${errorLines.length > 0 ? 'animate-bounce' : ''}`} />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {isCheckingErrors ? 'Auditing...' : errorLines.length > 0 ? `${errorLines.length} Issues` : 'Healthy'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowShareModal(true)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10" title="Share Snippet">
              <LinkIcon className="w-4.5 h-4.5" />
            </button>
            <button onClick={clearCode} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20" title="Clear Workspace">
              <Trash2 className="w-4.5 h-4.5" />
            </button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <button 
              onClick={exportPdf} 
              disabled={isExporting}
              className="relative group flex items-center gap-3 px-6 py-2.5 bg-white text-slate-950 rounded-xl text-xs font-black transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {isExporting ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
              {isExporting ? `${Math.round(exportProgress)}%` : 'EXPORT PDF'}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950 p-6 md:p-12 custom-scrollbar">
          <div className="min-w-full min-h-full flex items-center justify-center p-20">
             <Editor code={code} setCode={setCode} config={config} previewRef={previewRef} errorLines={errorLines} />
          </div>
        </div>

        <div className="h-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-8 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] z-20">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Engine Active</span>
            <div className="w-px h-3 bg-white/5" />
            <span>Fidelity: {config.exportScale}x Scale</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{config.language}</span>
            <div className="w-px h-3 bg-white/5" />
            <span>Farors AI Layer 2.0</span>
          </div>
        </div>
      </main>

      <Sidebar config={config} setConfig={setConfig} code={code} />

      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-purple-500/10 rounded-lg"><Sparkles className="w-5 h-5 text-purple-400" /></div>
                   <h2 className="text-xl font-bold text-white tracking-tight">Share Snippet</h2>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">Generated a high-fidelity snapshot link. Anyone with this link can view your code exactly as it appears here.</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Snippet URL</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-mono text-slate-400 truncate flex items-center">
                      {window.location.origin}/?c={getShareUrl().substring(0, 15)}...
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?c=${getShareUrl()}`); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                      className={`px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${copiedLink ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 text-center">Live Preview</div>
                <div className="aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/5 relative shadow-inner">
                   <div className="scale-[0.25] origin-top-left w-[400%] h-[400%] p-10 pointer-events-none">
                      <Editor code={code} setCode={() => {}} config={config} previewRef={null as any} errorLines={errorLines} />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Snapshot Ready</span>
                </div>
                <button onClick={() => setShowShareModal(false)} className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
