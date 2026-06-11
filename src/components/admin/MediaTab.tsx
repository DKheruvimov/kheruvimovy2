import React, { useState } from 'react';
import { HardDrive, FileText, Check, Copy, Trash2 } from 'lucide-react';

interface MediaTabProps {
  mediaFiles: any[];
  isLoadingMedia: boolean;
  mediaError: string;
  onCopyUrl: (url: string) => void;
  onDeleteMedia: (name: string) => void;
  isDeletingMediaName: string | null;
  copiedUrl: string | null;
}

export const MediaTab: React.FC<MediaTabProps> = ({
  mediaFiles,
  isLoadingMedia,
  mediaError,
  onCopyUrl,
  onDeleteMedia,
  isDeletingMediaName,
  copiedUrl,
}) => {
  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(null);
  return (
    <div className="space-y-6 pb-24 font-sans text-stone-800">
      <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
        <div className="flex items-center gap-2">
          <HardDrive className="text-imperial-gold" size={16} />
          <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest font-sans">Управление хранилищем (Медиатека)</p>
        </div>
        <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
          Здесь отображаются все загруженные вами файлы во внутреннее хранилище сервера (<code className="bg-stone-100 px-1 py-0.5 rounded text-[9px] font-mono select-all">/data/uploads</code>). Вы можете скопировать ссылку на любой файл или безвозвратно удалить его для освобождения свободного места.
        </p>
      </div>

      {isLoadingMedia ? (
        <div className="py-12 text-center text-stone-400 text-xs">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-imperial-gold/40 border-t-imperial-gold mb-3"></div>
          <p className="font-display italic text-base">Загрузка файлов...</p>
        </div>
      ) : mediaError ? (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg text-center font-semibold">
          {mediaError}
        </div>
      ) : mediaFiles.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-xl p-8 bg-stone-50/50">
          <FileText className="mx-auto text-stone-300 mb-3" size={32} />
          <p className="font-display italic text-lg text-stone-400">В хранилище пока нет файлов</p>
          <p className="text-[10px] text-stone-400 mt-1">Они появятся здесь автоматически после загрузки изображений или виньеток в формах редактирования.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-bold uppercase font-sans">
            <span>Файлы в системе ({mediaFiles.length})</span>
            <span>Общий объем: {(mediaFiles.reduce((acc, f) => acc + (f.size || 0), 0) / (1024 * 1024)).toFixed(2)} MB</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {mediaFiles.map((file) => {
              const isImg = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
              return (
                <div 
                  key={file.name} 
                  className="group relative border border-stone-100 rounded-xl overflow-hidden bg-stone-50 shadow-sm hover:shadow-md transition-all flex flex-col h-44 text-left"
                >
                  {/* Preview Area */}
                  <div className="h-28 bg-stone-100 flex items-center justify-center overflow-hidden border-b border-stone-100 p-1 relative">
                    {isImg ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FileText size={32} className="text-stone-300" />
                    )}

                    {/* Quick selection or delete action overlay */}
                    <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {confirmDeleteName === file.name ? (
                        <div className="flex gap-1.5 bg-red-600 text-white rounded-full px-2.5 py-1 text-[9px] items-center animate-fadeIn font-semibold font-sans">
                          <button
                            onClick={() => {
                              onDeleteMedia(file.name);
                              setConfirmDeleteName(null);
                            }}
                            className="hover:underline cursor-pointer uppercase"
                          >
                            Да, удалить
                          </button>
                          <span className="opacity-50">|</span>
                          <button
                            onClick={() => setConfirmDeleteName(null)}
                            className="hover:underline cursor-pointer uppercase"
                          >
                            Нет
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => onCopyUrl(file.url)}
                            className="p-2 bg-white rounded-full text-stone-700 hover:text-imperial-gold shadow hover:scale-110 transition-transform cursor-pointer"
                            title="Скопировать ссылку"
                          >
                            {copiedUrl === file.url ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteName(file.name)}
                            disabled={isDeletingMediaName === file.name}
                            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 shadow hover:scale-110 transition-transform cursor-pointer"
                            title="Удалить безвозвратно"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title details */}
                  <div className="p-2 bg-white flex-grow flex flex-col justify-between text-left">
                    <p 
                      className="text-[10px] font-mono text-stone-700 truncate font-semibold" 
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex justify-between items-center text-[8px] text-stone-400 font-bold uppercase mt-0.5">
                      <span>{(file.size / 1024).toFixed(1)} KB</span>
                      <span>{new Date(file.mtime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
