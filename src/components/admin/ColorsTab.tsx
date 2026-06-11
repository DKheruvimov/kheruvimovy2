import React from 'react';
import { SiteContent } from '../../types';

interface ColorsTabProps {
  content: SiteContent;
  onChange: (field: keyof SiteContent, value: any) => void;
}

export const ColorsTab: React.FC<ColorsTabProps> = ({ content, onChange }) => {
  return (
    <div className="space-y-8 pb-20">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Усадебная палитра</h3>
      <div className="grid grid-cols-1 gap-8">
        {/* Primary Color */}
        <div className="space-y-3">
          <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
            Основной цвет (Золото)
            <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.primary}</span>
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
              value={content.colors?.primary || "#b5955a"}
              onChange={e => onChange('colors', { ...content.colors, primary: e.target.value, accent: e.target.value })}
            />
            <div className="flex-grow space-y-1">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                value={content.colors?.primary || ""}
                onChange={e => onChange('colors', { ...content.colors, primary: e.target.value, accent: e.target.value })}
              />
              <p className="text-[8px] text-stone-300 uppercase tracking-widest">Влияет на орнаменты, иконки и акценты</p>
            </div>
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-3">
          <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
            Цвет текста
            <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.text}</span>
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
              value={content.colors?.text || "#2d342d"}
              onChange={e => onChange('colors', { ...content.colors, text: e.target.value })}
            />
            <div className="flex-grow space-y-1">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                value={content.colors?.text || ""}
                onChange={e => onChange('colors', { ...content.colors, text: e.target.value })}
              />
              <p className="text-[8px] text-stone-300 uppercase tracking-widest">Основной цвет заголовков и описаний</p>
            </div>
          </div>
        </div>

        {/* Hover Color */}
        <div className="space-y-3">
          <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
            Цвет заливки (Hover)
            <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.hover}</span>
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
              value={content.colors?.hover || "#2d342d"}
              onChange={e => onChange('colors', { ...content.colors, hover: e.target.value })}
            />
            <div className="flex-grow space-y-1">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                value={content.colors?.hover || ""}
                onChange={e => onChange('colors', { ...content.colors, hover: e.target.value })}
              />
              <p className="text-[8px] text-stone-300 uppercase tracking-widest">Цвет элементов при наведiи (например, иконки)</p>
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-3">
          <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
            Фон страниц
            <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.bg}</span>
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
              value={content.colors?.bg || "#faf7f0"}
              onChange={e => onChange('colors', { ...content.colors, bg: e.target.value })}
            />
            <div className="flex-grow space-y-1">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                value={content.colors?.bg || ""}
                onChange={e => onChange('colors', { ...content.colors, bg: e.target.value })}
              />
              <p className="text-[8px] text-stone-300 uppercase tracking-widest">Общий фон светлых секций</p>
            </div>
          </div>
        </div>

        {/* Quote Block Color */}
        <div className="space-y-3">
          <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
            Фон блока цитаты
            <span className="font-mono lowercase text-[8px] opacity-50 tracking-normal">{content.colors?.quoteBg}</span>
          </label>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              className="w-12 h-12 rounded-lg border-2 border-stone-100 cursor-pointer overflow-hidden"
              value={content.colors?.quoteBg || "#2d342d"}
              onChange={e => onChange('colors', { ...content.colors, quoteBg: e.target.value })}
            />
            <div className="flex-grow space-y-1">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 outline-none text-xs font-mono bg-transparent"
                value={content.colors?.quoteBg || ""}
                onChange={e => onChange('colors', { ...content.colors, quoteBg: e.target.value })}
              />
              <p className="text-[8px] text-stone-300 uppercase tracking-widest">Цвет «зелёного» квадрата за историей</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
