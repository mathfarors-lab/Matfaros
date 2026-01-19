
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, FileText, Sparkles, Trash2, Link as LinkIcon, Check, Copy, Zap, Cpu, X, ExternalLink, ChevronDown, Palette, HardDrive, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import { EditorConfig, GRADIENTS, THEMES } from './types';
import { detectLanguage, findSyntaxErrors, SyntaxError } from './services/geminiService';

const DEFAULT_CODE = `/**
 * Welcome to FarorsCodeSnap Pro.
 * Paste your code here to generate 
 * high-fidelity snapshots.
 */
#include <iostream>

int main() {
    std::cout << "Aesthetics matter for C++ too!" << std::endl;
    return 0;
}`;

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'c', 'cpp', 'csharp', 'rust', 'go', 'java', 'php', 'bash', 'sql', 'json', 'html', 'css', 'markdown', 'r', 'scala', 'perl', 'matlab', 'plain text'
];

const App: React.FC = () => {
  const [code, setCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedCode = params.get('code');
    if (sharedCode) {
      try { return atob(sharedCode); } catch { return DEFAULT_CODE; }
    }
    return DEFAULT_CODE;
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCheckingErrors, setIsCheckingErrors] = useState(false);
  const [syntaxErrors, setSyntaxErrors] = useState<SyntaxError[]>([]);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [config, setConfig] = useState<EditorConfig>({
    theme: 'dracula',
    background: GRADIENTS[0],
    language: 'cpp',
    fontSize: 14,
    padding: 64,
    frameScale: 1,
    showLineNumbers: true,
    showWindowControls: true,
    showWindowButtons: true,
    showShadow: true,
    rounded: true,
    opacity: 100,
    bgOpacity: 100,
    compactMode: true,
    jpgQuality: 80,
    pdfQuality: 95,
    exportScale: 2
  });

  const previewRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('codesnap-config-v2');
    if (saved) {
      try { setConfig(prev => ({ ...prev, ...JSON.parse(saved) })); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('codesnap-config-v2', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runAIAudit = useCallback(async () => {
    if (!code.trim()) return;
    setIsDetecting(true);
    setIsCheckingErrors(true);
    setQuotaExceeded(false);
    
    try {
      const detectedLang = await detectLanguage(code);
      const normalizedLang = detectedLang === 'c++' ? 'cpp' : detectedLang === 'c#' ? 'csharp' : detectedLang;
      
      if (LANGUAGES.includes(normalizedLang) && normalizedLang !== config.language) {
        setConfig(prev => ({ ...prev, language: normalizedLang }));
      }
      
      const errors = await findSyntaxErrors(code, normalizedLang);
      setSyntaxErrors(errors);
    } catch (err: any) {
      if (err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED")) {
        setQuotaExceeded(true);
      }
      console.error(err);
    } finally {
      setIsDetecting(false);
      setIsCheckingErrors(false);
    }
  }, [code, config.language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (code !== DEFAULT_CODE && code.trim()) runAIAudit();
    }, 2000);
    return () => clearTimeout(timer);
  }, [code, runAIAudit]);

  const exportAsPng = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        pixelRatio: config.exportScale,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `codesnap-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPdf = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(previewRef.current, {
        pixelRatio: Math.min(config.exportScale, 2.5),
        quality: config.pdfQuality / 100,
        backgroundColor: '#000000',
      });
      const width = previewRef.current.offsetWidth;
      const height = previewRef.current.offsetHeight;
      const pdf = new jsPDF({ orientation: width > height ? 'l' : 'p', unit: 'px', format: [width, height], compress: true });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');
      pdf.save(`codesnap-${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const getShareUrl = () => {
    const encoded = btoa(code);
    return `${window.location.origin}/?code=${encoded}`;
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200 font-sans">
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tighter text-white leading-none">FarorsCodeSnap Pro</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">MidTherm Studio</p>
              </div>
            </div>

            <div className="h-4 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-2">
              <div className="relative" ref={langMenuRef}>
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all ${isDetecting ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                >
                  <Cpu className={`w-3.5 h-3.5 ${isDetecting ? 'text-purple-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                    {isDetecting ? 'Detecting...' : config.language}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>
                {showLangMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {LANGUAGES.map(lang => (
                        <button key={lang} onClick={() => { setConfig(prev => ({ ...prev, language: lang })); setShowLangMenu(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${config.language === lang ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {quotaExceeded ? (
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-400 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Quota Reached</span>
                </div>
              ) : (
                <button 
                  onClick={runAIAudit}
                  disabled={isCheckingErrors}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all ${syntaxErrors.length > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isCheckingErrors ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {isCheckingErrors ? 'Auditing...' : syntaxErrors.length > 0 ? `${syntaxErrors.length} Issues` : 'Clean Code'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setShowShareModal(true)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"><LinkIcon className="w-4.5 h-4.5" /></button>
            <button onClick={() => { setCode(''); setSyntaxErrors([]); }} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 className="w-4.5 h-4.5" /></button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <div className="flex items-center bg-white rounded-xl p-1 shadow-lg">
              <button onClick={exportAsPng} disabled={isExporting} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />} IMAGE
              </button>
              <button onClick={exportAsPdf} disabled={isExporting} className="flex items-center gap-2 px-6 py-2 bg-white text-slate-950 rounded-lg text-[10px] font-black tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_50%_0%,_rgba(30,58,138,0.15),_transparent_70%)] p-12 md:p-24 flex items-center justify-center">
          <Editor code={code} setCode={setCode} config={config} previewRef={previewRef} syntaxErrors={syntaxErrors} />
        </div>

        <footer className="h-10 border-t border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between px-8 text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] z-20">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${quotaExceeded ? 'bg-orange-500' : 'bg-emerald-500 animate-pulse'}`} /> 
              {quotaExceeded ? 'AI Rate Limited' : 'AI Logic Ready'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-500">Lines: {code.split('\n').length}</span>
            <span className="text-slate-500">Chars: {code.length}</span>
          </div>
        </footer>
      </main>
      <Sidebar config={config} setConfig={setConfig} code={code} />
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-lg font-black tracking-tight text-white">Share Snapshot</h2>
              <button onClick={() => setShowShareModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-sm text-slate-400">Share your snippet with a persistent URL.</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs text-slate-400 font-mono truncate">{getShareUrl()}</div>
                  <button onClick={() => { navigator.clipboard.writeText(getShareUrl()); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}
                    className={`px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${copiedLink ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950 hover:bg-slate-200'}`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end">
              <button onClick={() => setShowShareModal(false)} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-800 text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
