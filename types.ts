
export interface EditorConfig {
  theme: string;
  background: string;
  language: string;
  fontSize: number;
  padding: number;
  frameScale: number; // Added to control the relative size of the code box
  showLineNumbers: boolean;
  showWindowControls: boolean; 
  showWindowButtons: boolean;  
  showShadow: boolean;
  rounded: boolean;
  opacity: number;
  compactMode: boolean; 
  jpgQuality: number; 
  pdfQuality: number; 
  exportScale: number; 
}

export const THEMES = [
  { name: 'Dracula', value: 'dracula' },
  { name: 'Nord', value: 'nord' },
  { name: 'Monokai', value: 'monokai' },
  { name: 'One Dark', value: 'one-dark' },
  { name: 'Night Owl', value: 'night-owl' },
  { name: 'Vibrant', value: 'vibrant' }
];

export const GRADIENTS = [
  'bg-gradient-to-br from-purple-500 to-pink-500',
  'bg-gradient-to-br from-cyan-500 to-blue-500',
  'bg-gradient-to-br from-orange-400 to-rose-400',
  'bg-gradient-to-br from-emerald-400 to-cyan-400',
  'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-tr from-slate-900 to-slate-700',
  'bg-[#1e1e1e]',
  'bg-white'
];
