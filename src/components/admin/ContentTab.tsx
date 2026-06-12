import React, { useState } from 'react';
import { SiteContent, defaultImageStyle } from '../../types';
import { Plus, Upload, Smartphone, Trash2, Sparkles, Play, Eye } from 'lucide-react';
import { ImageStyleControls } from './ImageStyleControls';

interface ContentTabProps {
  content: SiteContent;
  onChange: (field: keyof SiteContent, value: any) => void;
  uploadingState: Record<string, boolean>;
  isMobilePreview: boolean;
  onMobilePreviewToggle: () => void;
  isTestingPreloader: boolean;
  onTestPreloaderToggle: (val: boolean) => void;
  handleImageUploadForField: (e: React.ChangeEvent<HTMLInputElement>, field: keyof SiteContent) => void;
  handleImageUploadForCustomSection: (
    file: File,
    sectionId: string,
    imgKey: 'image' | 'imageMobile',
    onComplete: (url: string) => void
  ) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
  content,
  onChange,
  uploadingState,
  isMobilePreview,
  onMobilePreviewToggle,
  isTestingPreloader,
  onTestPreloaderToggle,
  handleImageUploadForField,
  handleImageUploadForCustomSection,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-10 pb-20 font-sans">
      <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
        <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest">Settings mode</p>
        <p className="text-[10px] text-stone-500 mt-1">Отредактируйте параметры и нажмите «Сохранить».</p>
      </div>

      {/* General Info */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Общая информация</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold">Имена на главной</label>
            <input 
              type="text" 
              className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
              value={content.names}
              onChange={e => onChange('names', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold">Дата</label>
            <input 
              type="text" 
              className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
              value={content.date}
              onChange={e => onChange('date', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold">Город</label>
            <input 
              type="text" 
              className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent"
              value={content.location}
              onChange={e => onChange('location', e.target.value)}
            />
          </div>
          
          {/* Countdown Configuration */}
          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-[10px] text-stone-500 uppercase font-bold">Таймер обратного отсчета</label>
                <p className="text-[9px] text-stone-400 tracking-wide font-light">Добавьте красивое тиканье секунд на сайт</p>
              </div>
              <button
                type="button"
                onClick={() => onChange('countdownEnabled', !content.countdownEnabled)}
                className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer shadow-sm ${
                  content.countdownEnabled
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {content.countdownEnabled ? "Включен" : "Выключен"}
              </button>
            </div>
            {content.countdownEnabled && (
              <div className="pt-1 space-y-1 entry-animation">
                <label className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">Целевая дата и время</label>
                <input 
                  type="datetime-local" 
                  className="w-full border border-stone-200 rounded px-2.5 py-1.5 focus:border-imperial-gold outline-none text-xs bg-white/50 text-stone-800"
                  value={content.countdownDate || "2026-08-25T17:00"}
                  onChange={e => onChange('countdownDate', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Favicon Configuration */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="space-y-0.5">
              <label className="text-[10px] text-stone-500 uppercase font-bold">Иконка сайта (Favicon)</label>
              <p className="text-[9px] text-stone-400 tracking-wide font-light">Добавьте иконку для отображения во вкладке браузера (рекомендуется .svg или .png)</p>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 shadow-sm text-stone-300">
                {content.faviconUrl ? (
                  <img 
                    src={content.faviconUrl} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-[10px] text-stone-300 font-bold uppercase">Fav</span>
                )}
              </div>
              
              <div className="flex-grow space-y-1.5">
                {uploadingState['faviconUrl'] ? (
                  <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка иконки...</div>
                ) : (
                  <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                    <span>Иконка URL</span>
                    <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                      <Upload size={10} />
                      Загрузить файл
                      <input 
                        type="file" 
                        accept=".svg,.png,.ico,.jpg,.jpeg,.webp" 
                        className="hidden" 
                        onChange={e => handleImageUploadForField(e, 'faviconUrl')} 
                      />
                    </span>
                  </label>
                )}
                <input 
                  type="text" 
                  className="w-full border-b border-stone-200 py-0.5 focus:border-imperial-gold outline-none text-xs bg-transparent text-stone-800"
                  value={content.faviconUrl || ""}
                  placeholder="/favicon.svg"
                  onChange={e => onChange('faviconUrl', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ornaments Configuration */}
          <div className="pt-4 border-t border-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="space-y-0.5">
                <label className="text-[10px] text-stone-500 uppercase font-bold">Усадебные виньетки (Орнаменты)</label>
                <p className="text-[9px] text-stone-400 tracking-wide font-light">Включить или настроить разделительные векторные рисунки на сайте</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={content.ornamentsEnabled !== false}
                  onChange={e => onChange('ornamentsEnabled', e.target.checked)}
                />
                <div className="w-8 h-4 bg-stone-200 rounded-full peer peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-imperial-gold"></div>
              </label>
            </div>

            {content.ornamentsEnabled !== false && (
              <div className="space-y-3 pl-2 border-l-2 border-stone-100 animate-fadeIn text-left animate-fadeIn">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center overflow-hidden p-1.5 flex-shrink-0 shadow-sm text-stone-300">
                    {content.customOrnamentUrl ? (
                      <img 
                        src={content.customOrnamentUrl} 
                        className="w-full h-full object-contain" 
                        style={content.recolorCustomOrnament !== false ? {
                          filter: 'sepia(1) saturate(5) hue-rotate(15deg) brightness(0.8)'
                        } : undefined}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[14px]">〰️</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-1.5">
                    {uploadingState['customOrnamentUrl'] ? (
                      <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка орнамента...</div>
                    ) : (
                      <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                        <span>Файл своего орнамента / лого</span>
                        <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                          <Upload size={10} />
                          Загрузить SVG / PNG
                          <input 
                            type="file" 
                            accept=".svg,.png,.jpg,.jpeg,.webp" 
                            className="hidden" 
                            onChange={e => handleImageUploadForField(e, 'customOrnamentUrl')} 
                          />
                        </span>
                      </label>
                    )}
                    <input 
                      type="text" 
                      className="w-full border-b border-stone-200 py-0.5 focus:border-imperial-gold outline-none text-xs bg-transparent text-stone-800"
                      value={content.customOrnamentUrl || ""}
                      placeholder="Оставьте пустым для стандартного"
                      onChange={e => onChange('customOrnamentUrl', e.target.value)}
                    />
                  </div>
                </div>

                {content.customOrnamentUrl && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] text-stone-500 uppercase font-bold">Окрашивать вектор в цвет золота</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={content.recolorCustomOrnament !== false}
                        onChange={e => onChange('recolorCustomOrnament', e.target.checked)}
                      />
                      <div className="w-8 h-4 bg-stone-200 rounded-full peer peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-imperial-gold"></div>
                    </label>
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100/50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-stone-500 uppercase font-bold">Высота орнамента (общая): {content.ornamentHeight || 20}px</span>
                    <span className="text-[9px] text-stone-400 font-mono">10px - 100px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      className="flex-grow accent-imperial-gold h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                      value={content.ornamentHeight || 20}
                      onChange={e => onChange('ornamentHeight', parseInt(e.target.value) || 20)}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100/50 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-stone-500 uppercase font-bold">Высота орнамента в футере: {content.footerOrnamentHeight || 20}px</span>
                    <span className="text-[9px] text-stone-400 font-mono">10px - 150px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="10" 
                      max="150" 
                      className="flex-grow accent-imperial-gold h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                      value={content.footerOrnamentHeight || 20}
                      onChange={e => onChange('footerOrnamentHeight', parseInt(e.target.value) || 20)}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-stone-500 uppercase font-bold">Орнамент в распорядке дня</span>
                    <p className="text-[8px] text-stone-400 font-light">Показывать разделительный узор под надписью «Праздничный вечер»</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={content.scheduleOrnamentEnabled === true}
                      onChange={e => onChange('scheduleOrnamentEnabled', e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-stone-200 rounded-full peer peer-checked:after:translate-x-[16px] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-imperial-gold"></div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading Screen (Preloader) Configuration */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Экран загрузки (Прелоадер)</h3>
        <div className="bg-white rounded-xl p-5 border border-stone-150 shadow-sm space-y-4 text-left">
          <p className="text-[10px] text-stone-400 -mt-1 font-sans italic">Приветственный экран с усадебным орнаментом и каллиграфическим заголовком.</p>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                <span>Основной заголовок (имена)</span>
                <span className="text-[9px] text-stone-300 font-normal select-none">В стиле каллиграфии</span>
              </label>
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-sm bg-transparent font-serif italic text-stone-800"
                value={content.preloaderTitle || ""}
                placeholder="Дениса & Дарьи"
                onChange={e => onChange('preloaderTitle', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-stone-400 uppercase font-bold flex justify-between">
                <span>Подзаголовок заставки</span>
                <span className="text-[9px] text-stone-300 font-normal select-none">Шрифт с разрядкой</span>
              </label>
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 focus:border-imperial-gold outline-none text-xs bg-transparent tracking-widest text-stone-700"
                value={content.preloaderSubtitle || ""}
                placeholder="Усадьба Херувимовых"
                onChange={e => onChange('preloaderSubtitle', e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[9px] text-stone-500 uppercase font-bold">Быстрый тест заставки</span>
              <p className="text-[8px] text-stone-400 font-light font-sans">Включить полноэкранный интерактивный предпросмотр без обновления страницы</p>
            </div>
            
            <button
              type="button"
              onClick={() => onTestPreloaderToggle(true)}
              className="px-3.5 py-1.5 bg-imperial-gold/10 hover:bg-imperial-gold/20 text-imperial-gold rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-center border border-imperial-gold/20 hover:scale-103"
            >
              <Play size={10} className="fill-current" />
              Запустить тест
            </button>
          </div>
        </div>
      </section>

      {/* Media */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Изображения</h3>
        
        {/* Quick toggle banner for the modes */}
        <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-lg ${isMobilePreview ? 'bg-imperial-gold/15 text-imperial-gold' : 'bg-stone-100 text-stone-500'}`}>
              <Smartphone size={16} />
            </span>
            <div>
              <h4 className="text-[9px] uppercase tracking-wider font-bold text-stone-400">
                Редактируемый режим:
              </h4>
              <span className="text-xs font-semibold text-stone-800">
                {isMobilePreview ? "Мобильная версия 📱" : "Компьютерная версия 💻"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onMobilePreviewToggle}
            className="px-3 py-1.5 bg-white border border-stone-200 hover:border-imperial-gold hover:text-imperial-gold text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            {isMobilePreview ? "На десктоп" : "На мобильный"}
          </button>
        </div>

        <div className="space-y-8">
          {(() => {
            const heroField = isMobilePreview ? 'heroImageMobile' : 'heroImage';
            const heroStyleField = isMobilePreview ? 'heroStyleMobile' : 'heroStyle';
            const currentHeroImage = content[heroField] as string || "";
            const currentHeroStyle = content[heroStyleField] || defaultImageStyle;
            const displayHeroSrc = currentHeroImage || content.heroImage;

            const storyField = isMobilePreview ? 'storyImageMobile' : 'storyImage';
            const storyStyleField = isMobilePreview ? 'storyStyleMobile' : 'storyStyle';
            const currentStoryImage = content[storyField] as string || "";
            const currentStoryStyle = content[storyStyleField] || defaultImageStyle;
            const displayStorySrc = currentStoryImage || content.storyImage;

            const detailsField = isMobilePreview ? 'detailsImageMobile' : 'detailsImage';
            const detailsStyleField = isMobilePreview ? 'detailsStyleMobile' : 'detailsStyle';
            const currentDetailsImage = content[detailsField] as string || "";
            const currentDetailsStyle = content[detailsStyleField] || defaultImageStyle;
            const displayDetailsSrc = currentDetailsImage || content.detailsImage;

            return (
              <>
                {/* 1. HERO IMAGE */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-stone-700 font-display italic">1. Главный экран (Hero)</h4>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                      {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                    </span>
                  </div>
                  
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                        <img src={displayHeroSrc} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        {uploadingState[heroField] ? (
                          <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                        ) : (
                          <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                            <span>Фото (URL)</span>
                            <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                              <Plus size={10} />
                              Загрузить
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleImageUploadForField(e, heroField)}
                              />
                            </span>
                          </label>
                        )}
                        <input 
                          type="text" 
                          className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                          placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                          value={currentHeroImage}
                          onChange={e => onChange(heroField, e.target.value)}
                        />
                      </div>
                    </div>
                    <ImageStyleControls 
                      label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                      style={currentHeroStyle} 
                      onChange={s => onChange(heroStyleField, s)} 
                    />
                  </div>
                </div>

                {/* 2. STORY IMAGE */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-stone-700 font-display italic">2. О нашем союзе (История)</h4>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                      {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                    </span>
                  </div>
                  
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                        <img src={displayStorySrc} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        {uploadingState[storyField] ? (
                          <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                        ) : (
                          <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                            <span>Фото (URL)</span>
                            <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                              <Plus size={10} />
                              Загрузить
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleImageUploadForField(e, storyField)}
                              />
                            </span>
                          </label>
                        )}
                        <input 
                          type="text" 
                          className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                          placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                          value={currentStoryImage}
                          onChange={e => onChange(storyField, e.target.value)}
                        />
                      </div>
                    </div>
                    <ImageStyleControls 
                      label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                      style={currentStoryStyle} 
                      onChange={s => onChange(storyStyleField, s)} 
                    />
                  </div>
                </div>

                {/* 3. DETAILS IMAGE */}
                <div className="p-4 bg-stone-50 rounded-xl space-y-4 border border-stone-200/60">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-stone-700 font-display italic">3. Детали торжества (Инфо)</h4>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                      {isMobilePreview ? "Мобильное фото" : "Десктопное фото"}
                    </span>
                  </div>
                  
                  <div className="space-y-3 p-3 bg-white rounded-lg border border-stone-150 shadow-sm">
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                        <img src={displayDetailsSrc} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        {uploadingState[detailsField] ? (
                          <div className="text-[9px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                        ) : (
                          <label className="text-[9px] text-stone-400 uppercase font-bold flex items-center justify-between w-full">
                            <span>Фото (URL)</span>
                            <span className="flex items-center gap-1 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[9px] font-bold">
                              <Plus size={10} />
                              Загрузить
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={e => handleImageUploadForField(e, detailsField)}
                              />
                            </span>
                          </label>
                        )}
                        <input 
                          type="text" 
                          className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                          placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                          value={currentDetailsImage}
                          onChange={e => onChange(detailsField, e.target.value)}
                        />
                      </div>
                    </div>
                    <ImageStyleControls 
                      label={`Настройка отображения (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                      style={currentDetailsStyle} 
                      onChange={s => onChange(detailsStyleField, s)} 
                    />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Story Text */}
      <section className="space-y-6">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2">Наша история</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold">Подзаголовок</label>
            <input 
              type="text" 
              className="w-full border-b border-stone-200 py-1 outline-none text-sm italic bg-transparent animate-none"
              value={content.storySubtitle}
              onChange={e => onChange('storySubtitle', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold">Описание</label>
            <textarea 
              rows={3}
              className="w-full border border-stone-200 p-2 text-sm outline-none focus:border-imperial-gold bg-transparent"
              value={content.storyDescription}
              onChange={e => onChange('storyDescription', e.target.value)}
            />
          </div>
          <div className="pt-2 border-t border-dashed border-stone-200">
            <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-3">Размер блока с цитатой</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-stone-400 uppercase font-bold">Компьютерная версия</label>
                  <span className="text-[10px] font-mono text-stone-500 font-semibold">{content.storyQuoteSizeDesktop ?? 288}px</span>
                </div>
                <input 
                  type="range" 
                  min={180} 
                  max={380} 
                  step={5}
                  className="w-full accent-imperial-gold cursor-pointer"
                  value={content.storyQuoteSizeDesktop ?? 288}
                  onChange={e => onChange('storyQuoteSizeDesktop', parseInt(e.target.value) || 288)}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-stone-400 uppercase font-bold">Мобильная версия</label>
                  <span className="text-[10px] font-mono text-stone-500 font-semibold">{content.storyQuoteSizeMobile ?? 180}px</span>
                </div>
                <input 
                  type="range" 
                  min={120} 
                  max={250} 
                  step={5}
                  className="w-full accent-imperial-gold cursor-pointer"
                  value={content.storyQuoteSizeMobile ?? 180}
                  onChange={e => onChange('storyQuoteSizeMobile', parseInt(e.target.value) || 180)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-imperial-gold/10 pb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold">Распорядок дня</h3>
        </div>
        <div className="space-y-4">
          {content.schedule.map((item, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-3 text-left">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-16 border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-mono bg-transparent"
                  value={item.time}
                  onChange={e => {
                    const newSchedule = [...content.schedule];
                    newSchedule[idx] = { ...item, time: e.target.value };
                    onChange('schedule', newSchedule);
                  }}
                />
                <input 
                  type="text" 
                  className="flex-grow border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-bold bg-transparent"
                  value={item.event}
                  onChange={e => {
                    const newSchedule = [...content.schedule];
                    newSchedule[idx] = { ...item, event: e.target.value };
                    onChange('schedule', newSchedule);
                  }}
                />
              </div>
              <textarea 
                rows={1}
                className="w-full border-b border-stone-100 bg-transparent py-1 text-[10px] outline-none text-stone-500 italic"
                value={item.desc}
                onChange={e => {
                  const newSchedule = [...content.schedule];
                  newSchedule[idx] = { ...item, desc: e.target.value };
                  onChange('schedule', newSchedule);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Details */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-imperial-gold/10 pb-2">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold">Усадебный устав</h3>
        </div>
        <div className="space-y-4">
          {content.details.map((item, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded border border-stone-100 space-y-3 text-left">
              <input 
                type="text" 
                className="w-full border-b border-stone-200 py-1 text-xs outline-none focus:border-imperial-gold font-bold italic bg-transparent"
                value={item.title}
                onChange={e => {
                  const newDetails = [...content.details];
                  newDetails[idx] = { ...item, title: e.target.value };
                  onChange('details', newDetails);
                }}
              />
              <textarea 
                rows={2}
                className="w-full border-b border-stone-100 bg-transparent py-1 text-[10px] outline-none text-stone-500"
                value={item.content}
                onChange={e => {
                  const newDetails = [...content.details];
                  newDetails[idx] = { ...item, content: e.target.value };
                  onChange('details', newDetails);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Section Management */}
      <section className="space-y-6 pt-6 border-t border-stone-200">
        <div className="space-y-1">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold">Управление секциями сайта</h3>
          <p className="text-[10px] text-stone-400 text-left">Здесь Вы можете изменять порядок отображения, скрывать или добавлять новые собственные разделы.</p>
        </div>
        
        <div className="space-y-4">
          {(content.sections || [
            { id: 'story', title: 'Наша история', visible: true },
            { id: 'schedule', title: 'Распорядок дня', visible: true },
            { id: 'details', title: 'Усадебный устав', visible: true },
            { id: 'rsvp', title: 'Почта', visible: true }
          ]).map((sec, idx, arr) => {
            return (
              <div key={sec.id} className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-400 font-mono">#{idx + 1}</span>
                    <span className="text-sm font-semibold text-stone-800">{sec.title || "Без названия"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const newSections = [...arr];
                        newSections[idx] = { ...sec, visible: sec.visible !== false ? false : true };
                        onChange('sections', newSections);
                      }}
                      className={`px-2 py-1 text-[9px] font-bold uppercase rounded transition-colors cursor-pointer ${
                        sec.visible !== false 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'bg-stone-200 text-stone-500 border border-stone-300'
                      }`}
                    >
                      {sec.visible !== false ? "Виден" : "Скрыт"}
                    </button>

                    {/* Reordering Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        if (idx === 0) return;
                        const newSections = [...arr];
                        newSections[idx] = arr[idx - 1];
                        newSections[idx - 1] = arr[idx];
                        onChange('sections', newSections);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Поднять выше"
                    >
                      ↑
                    </button>

                    {/* Reordering Down */}
                    <button
                      type="button"
                      disabled={idx === arr.length - 1}
                      onClick={() => {
                        if (idx === arr.length - 1) return;
                        const newSections = [...arr];
                        newSections[idx] = arr[idx + 1];
                        newSections[idx + 1] = arr[idx];
                        onChange('sections', newSections);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                      title="Опустить ниже"
                    >
                      ↓
                    </button>

                    {/* Delete Custom Section */}
                    {sec.isCustom && (
                      <div className="relative flex items-center gap-1.5 ml-1">
                        {confirmDeleteId === sec.id ? (
                          <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => {
                                const newSections = arr.filter(s => s.id !== sec.id);
                                onChange('sections', newSections);
                                setConfirmDeleteId(null);
                              }}
                              className="text-[9px] font-bold text-red-650 hover:text-red-700 cursor-pointer uppercase font-sans"
                            >
                              Да
                            </button>
                            <span className="text-stone-300 text-[8px]">|</span>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[9px] font-bold text-stone-550 hover:text-stone-700 cursor-pointer uppercase font-sans"
                            >
                              Нет
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(sec.id)}
                            className="p-1 text-red-400 hover:text-red-600 cursor-pointer ml-1"
                            title="Удалить"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Section Details Editing */}
                {sec.isCustom && (
                  <div className="pt-3 border-t border-dashed border-stone-200 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 uppercase font-bold">Название в списке</label>
                      <input 
                        type="text" 
                        className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                        value={sec.title || ""}
                        onChange={e => {
                          const newSections = [...arr];
                          newSections[idx] = { ...sec, title: e.target.value };
                          onChange('sections', newSections);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 uppercase font-bold">Подзаголовок (Subtitle)</label>
                      <input 
                        type="text" 
                        className="w-full border-b border-stone-200 py-1 text-xs outline-none bg-transparent"
                        value={sec.subtitle || ""}
                        onChange={e => {
                          const newSections = [...arr];
                          newSections[idx] = { ...sec, subtitle: e.target.value };
                          onChange('sections', newSections);
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-stone-400 uppercase font-bold">Основной текст</label>
                      <textarea 
                        rows={3}
                        className="w-full border border-stone-200 p-2 text-xs outline-none bg-transparent"
                        value={sec.content || ""}
                        onChange={e => {
                          const newSections = [...arr];
                          newSections[idx] = { ...sec, content: e.target.value };
                          onChange('sections', newSections);
                        }}
                      />
                    </div>

                    {/* Image controls aligned to isMobilePreview */}
                    <div className="space-y-2 p-2 bg-white rounded border border-stone-100 shadow-sm">
                      <div className="flex justify-between items-center pb-1 border-b border-stone-100">
                        <span className="text-[8px] uppercase font-bold text-stone-400 tracking-wider">Фото секции</span>
                        <span className="text-[8px] font-bold text-imperial-gold uppercase tracking-wider">
                          {isMobilePreview ? "Мобильная версия" : "Компьютерная версия"}
                        </span>
                      </div>

                      {(() => {
                        const imgKey = isMobilePreview ? 'imageMobile' : 'image';
                        const currentImg = sec[imgKey] || "";
                        const displayImg = currentImg || sec.image || "";
                        const styleKey = isMobilePreview ? 'imageStyleMobile' : 'imageStyle';
                        const currentStyle = sec[styleKey] || defaultImageStyle;
                        const sectionUploadId = `${sec.id}_${imgKey}`;

                        return (
                          <div className="space-y-3">
                            <div className="flex gap-2 items-center">
                              <div className="w-10 h-10 bg-stone-100 rounded overflow-hidden flex-shrink-0 border border-stone-200">
                                {displayImg && <img src={displayImg} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-grow text-left">
                                {uploadingState[sectionUploadId] ? (
                                  <div className="text-[8px] text-stone-400 uppercase font-bold animate-pulse">Загрузка изображения...</div>
                                ) : (
                                  <label className="text-[8px] text-stone-400 uppercase font-bold flex justify-between items-center bg-transparent">
                                    <span>Фото URL {isMobilePreview ? "(моб.)" : "(деск.)"}</span>
                                    <span className="flex items-center gap-0.5 cursor-pointer text-imperial-gold hover:text-stone-900 transition-colors uppercase text-[8px] font-bold">
                                      <Plus size={8} />
                                      Загрузить
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={e => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleImageUploadForCustomSection(file, sec.id, imgKey, (url) => {
                                              const newSections = [...arr];
                                              newSections[idx] = { ...sec, [imgKey]: url };
                                              onChange('sections', newSections);
                                            });
                                          }
                                        }}
                                      />
                                    </span>
                                  </label>
                                )}
                                <input 
                                  type="text" 
                                  className="w-full border-b border-stone-200 py-0.5 text-[11px] outline-none bg-transparent"
                                  placeholder={isMobilePreview ? "Использовать десктопную если пусто" : "Ссылка на десктопное изображение"}
                                  value={currentImg}
                                  onChange={e => {
                                    const newSections = [...arr];
                                    newSections[idx] = { ...sec, [imgKey]: e.target.value };
                                    onChange('sections', newSections);
                                  }}
                                />
                              </div>
                            </div>
                            <ImageStyleControls 
                              label={`Позиционирование (${isMobilePreview ? "Мобильная" : "Компьютерная"})`} 
                              style={currentStyle} 
                              onChange={s => {
                                const newSections = [...arr];
                                newSections[idx] = { ...sec, [styleKey]: s };
                                onChange('sections', newSections);
                              }} 
                            />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Custom Section */}
        <button
          type="button"
          onClick={() => {
            const defaultSecs = content.sections || [
              { id: 'story', title: 'Наша история', visible: true },
              { id: 'schedule', title: 'Распорядок дня', visible: true },
              { id: 'details', title: 'Усадебный устав', visible: true },
              { id: 'rsvp', title: 'Почта', visible: true }
            ];
            const newId = `custom_${Date.now()}`;
            const newSec = {
              id: newId,
              title: `Новый раздел`,
              subtitle: `Благородный раздел усадьбы`,
              content: `Опишите здесь все детали и прелести Вашего торжества.`,
              visible: true,
              isCustom: true,
              image: "/images/details.jpg"
            };
            onChange('sections', [...defaultSecs, newSec]);
          }}
          className="w-full py-3.5 bg-white border border-stone-200 hover:border-imperial-gold hover:text-imperial-gold text-stone-700 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <Plus size={13} />
          Создать новый собственный раздел
        </button>
      </section>
    </div>
  );
};
