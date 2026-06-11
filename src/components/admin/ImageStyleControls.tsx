import React from 'react';

interface ImageStyleControlsProps {
  label: string;
  style: any;
  onChange: (newStyle: any) => void;
}

export const ImageStyleControls: React.FC<ImageStyleControlsProps> = ({ 
  label, 
  style, 
  onChange 
}) => {
  return (
    <div className="p-3 bg-stone-50/50 rounded-lg space-y-3 border border-stone-100">
      <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">{label}</p>
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] text-stone-400 flex justify-between uppercase font-sans">Масштаб</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="0.5" max="5" step="0.01" 
              value={style.scale} 
              onChange={e => onChange({ ...style, scale: parseFloat(e.target.value) })}
              className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
            />
            <input 
              type="number" step="0.01"
              value={style.scale} 
              onChange={e => onChange({ ...style, scale: parseFloat(e.target.value) || 0 })}
              className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold font-sans"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-stone-400 flex justify-between uppercase font-sans">Угол (°)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="-180" max="180" step="1" 
              value={style.rotate} 
              onChange={e => onChange({ ...style, rotate: parseInt(e.target.value) })}
              className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
            />
            <input 
              type="number"
              value={style.rotate} 
              onChange={e => onChange({ ...style, rotate: parseInt(e.target.value) || 0 })}
              className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold font-sans"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-stone-400 flex justify-between uppercase font-sans">Сдвиг X (px)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="-400" max="400" step="1" 
              value={style.x} 
              onChange={e => onChange({ ...style, x: parseInt(e.target.value) })}
              className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
            />
            <input 
              type="number"
              value={style.x} 
              onChange={e => onChange({ ...style, x: parseInt(e.target.value) || 0 })}
              className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold font-sans"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-stone-400 flex justify-between uppercase font-sans">Сдвиг Y (px)</label>
          <div className="flex items-center gap-3">
            <input 
              type="range" min="-400" max="400" step="1" 
              value={style.y} 
              onChange={e => onChange({ ...style, y: parseInt(e.target.value) })}
              className="flex-grow h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-imperial-gold"
            />
            <input 
              type="number"
              value={style.y} 
              onChange={e => onChange({ ...style, y: parseInt(e.target.value) || 0 })}
              className="w-16 border rounded px-1 py-0.5 text-[10px] text-stone-600 outline-none focus:border-imperial-gold font-sans"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
