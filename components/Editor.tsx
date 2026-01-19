
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { EditorConfig } from '../types';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface EditorProps {
  code: string;
  setCode: (code: string) => void;
  config: EditorConfig;
  previewRef: React.RefObject<HTMLDivElement>;
}

const Editor: React.FC<EditorProps> = ({ code, setCode, config, previewRef }) => {
  const lineCount = code.split('\n').length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const getPrismLanguage = (lang: string) => {
    const map: Record<string, string> = {
      'js': 'javascript',
      'javascript': 'javascript',
      'ts': 'typescript',
      'typescript': 'typescript',
      'py': 'python',
      'python': 'python',
      'plain text': 'text',
      'text': 'text',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'css': 'css',
      'rust': 'rust',
      'bash': 'bash',
      'json': 'json',
      'markdown': 'markdown'
    };
    return map[lang.toLowerCase()] || 'javascript';
  };

  const highlightedCode = useMemo(() => {
    const lang = getPrismLanguage(config.language);
    const grammar = Prism.languages[lang] || Prism.languages.javascript;
    return Prism.highlight(code || '', grammar, lang);
  }, [code, config.language]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-full mx-auto animate-in fade-in duration-700 overflow-visible">
      {/* The visible frame that gets captured */}
      <div 
        ref={previewRef}
        className={`relative transition-all duration-500 ${config.background} flex items-center justify-center overflow-visible group`}
        style={{ padding: `${config.padding}px`, borderRadius: config.rounded ? '24px' : '0' }}
      >
        <div 
          className={`
            bg-[#1e1e1e] overflow-hidden transition-all duration-300 border border-white/5
            ${config.showShadow ? 'shadow-[0_50px_100px_rgba(0,0,0,0.8)]' : ''} 
            ${config.rounded ? 'rounded-2xl' : 'rounded-none'}
          `}
          style={{ 
            opacity: config.opacity / 100,
            transform: `scale(${config.frameScale})`,
            width: '100%',
            minWidth: '600px',
            maxWidth: '1200px'
          }}
        >
          {/* Mac-style title bar */}
          {config.showWindowControls && (
            <div className="flex items-center gap-2 px-6 py-4 bg-[#1e1e1e]/50 backdrop-blur-md border-b border-white/5">
              {config.showWindowButtons && (
                <div className="flex gap-2 mr-4">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
                </div>
              )}
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-1 text-center truncate pr-14">
                {config.language} • FarorsSnapshot
              </div>
            </div>
          )}

          <div className="relative flex min-h-[300px]">
            {/* Gutter / Line Numbers */}
            {config.showLineNumbers && (
              <div 
                className="flex flex-col text-right pr-4 pl-6 pt-8 select-none border-r border-white/5 text-slate-700 font-mono"
                style={{ fontSize: `${config.fontSize}px`, lineHeight: '1.8' }}
              >
                {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                  <div key={i} className="h-[1.8em]">{i + 1}</div>
                ))}
              </div>
            )}
            
            {/* Editor Surface */}
            <div className="relative flex-1">
              <pre
                ref={preRef}
                className={`
                  absolute top-0 left-0 w-full h-full p-8 m-0 
                  pointer-events-none overflow-hidden font-mono language-${getPrismLanguage(config.language)}
                `}
                style={{ fontSize: `${config.fontSize}px`, lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
              />
              
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                className={`
                  w-full min-h-[400px] p-8 bg-transparent outline-none resize-none font-mono
                  text-transparent caret-purple-500 leading-[1.8] relative z-10 no-scrollbar
                `}
                style={{ fontSize: `${config.fontSize}px` }}
                placeholder="Paste your source code here..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
