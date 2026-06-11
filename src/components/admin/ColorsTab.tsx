import React from 'react';
import { SiteContent } from '../../types';

interface ColorsTabProps {
  content: SiteContent;
  onChange: (field: keyof SiteContent, value: any) => void;
}

const THEME_PRESETS = [
  {
    id: 'default',
    name: 'Основная усадебная',
    desc: 'Оливково-золотой тонъ',
    colors: {
      primary: '#b5955a',
      accent: '#b5955a',
      text: '#2d342d',
      bg: '#faf7f0',
      hover: '#2d342d',
      quoteBg: '#2d342d'
    }
  },
  {
    id: 'burgundy',
    name: 'Императорскій Бордо',
    desc: 'Винно-малиновый тонъ',
    colors: {
      primary: '#c29a53',
      accent: '#c29a53',
      text: '#421e1e',
      bg: '#fbf6f2',
      hover: '#542020',
      quoteBg: '#4e1a1a'
    }
  },
  {
    id: 'emerald',
    name: 'Благородный Изумрудъ',
    desc: 'Лесной бархатный тонъ',
    colors: {
      primary: '#b89553',
      accent: '#b89553',
      text: '#152c1e',
      bg: '#f4f7f4',
      hover: '#1e3b28',
      quoteBg: '#183321'
    }
  },
  {
    id: 'sapphire',
    name: 'Царскій Сапфиръ',
    desc: 'Глубокiй синій тонъ',
    colors: {
      primary: '#c4a25c',
      accent: '#c4a25c',
      text: '#132038',
      bg: '#f3f5f8',
      hover: '#1b2b48',
      quoteBg: '#162540'
    }
  }
];

export const ColorsTab: React.FC<ColorsTabProps> = ({ content, onChange }) => {
  const currentColors = content.colors || {
    primary: "#b5955a",
    text: "#2d342d",
    bg: "#faf7f0",
    accent: "#b5955a",
    hover: "#2d342d",
    quoteBg: "#2d342d"
  };

  const isThemeActive = (presetColors: typeof currentColors) => {
    return (
      currentColors.primary?.toLowerCase() === presetColors.primary.toLowerCase() &&
      currentColors.text?.toLowerCase() === presetColors.text.toLowerCase() &&
      currentColors.bg?.toLowerCase() === presetColors.bg.toLowerCase() &&
      currentColors.quoteBg?.toLowerCase() === presetColors.quoteBg.toLowerCase()
    );
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Гармоничные темы усадьбы</h3>
        <p className="text-[10px] text-stone-400">Выберите готовое цветовое решенiе въ благородныхъ имперскихъ оттенкахъ или настройте каждый элементъ самостоятельно ниже:</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {THEME_PRESETS.map((preset) => {
            const active = isThemeActive(preset.colors);
            return (
              <button
                key={preset.id}
                onClick={() => onChange('colors', preset.colors)}
                className={`text-left p-3 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between h-[100px] ${
                  active 
                    ? 'border-imperial-gold bg-stone-50 shadow-sm ring-1 ring-imperial-gold/30' 
                    : 'border-stone-200/60 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-display italic text-xs font-semibold text-stone-800 leading-none">{preset.name}</span>
                    {active && (
                      <span className="text-[8px] uppercase tracking-wider text-imperial-gold font-bold bg-imperial-gold/10 px-1.5 py-0.5 rounded leading-none">Активна</span>
                    )}
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 block leading-none">{preset.desc}</span>
                </div>
                
                <div className="flex gap-1.5 items-center mt-2">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: preset.colors.bg }} title="Фон" />
                    <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: preset.colors.primary }} title="Золото" />
                    <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: preset.colors.text }} title="Текст" />
                    <div className="w-5 h-5 rounded-full border border-stone-200" style={{ backgroundColor: preset.colors.quoteBg }} title="Цитата" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 pt-4">Тонкая настройка палитры</h3>
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
