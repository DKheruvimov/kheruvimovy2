import React, { useState } from 'react';
import { Users, Trash2 } from 'lucide-react';

interface RsvpsTabProps {
  rsvps: any[];
  isLoadingRsvps: boolean;
  onDeleteRsvp: (id: string, name: string) => Promise<void> | void;
}

export const RsvpsTab: React.FC<RsvpsTabProps> = ({
  rsvps,
  isLoadingRsvps,
  onDeleteRsvp,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 flex justify-between items-center font-sans">
        Список гостей
        <span className="text-stone-400 font-normal">{rsvps.length} подтверждений</span>
      </h3>
      
      {isLoadingRsvps ? (
        <div className="flex items-center justify-center py-20 text-stone-300 italic font-sans">Загрузка списка...</div>
      ) : rsvps.length === 0 ? (
        <div className="text-center py-20 font-sans">
          <Users className="mx-auto text-stone-100 mb-4" size={48} />
          <p className="text-stone-300 italic">Гостей пока нет</p>
        </div>
      ) : (
        <div className="space-y-4 font-sans">
          {rsvps.map((rsvp: any) => (
            <div key={rsvp.id} className="p-4 bg-stone-50 rounded-lg border border-stone-100 group hover:border-imperial-gold/30 transition-all text-stone-700">
              <div className="flex items-start gap-4">
                {rsvp.avatarUrl && (
                  <img src={rsvp.avatarUrl} className="w-12 h-12 rounded-full border border-stone-200" referrerPolicy="no-referrer" alt="Avatar" />
                )}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-semibold text-base leading-tight flex flex-wrap items-center gap-x-2">
                      <span>{rsvp.name}</span>
                      {rsvp.guests === "2" && rsvp.guest2Name && (
                        <>
                          <span className="text-stone-400 text-xs font-normal">и</span>
                          <span>{rsvp.guest2Name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-imperial-gold font-bold bg-imperial-gold/10 px-1.5 py-0.5 rounded leading-none ml-1">Пара</span>
                        </>
                      )}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] uppercase tracking-tighter px-2 py-0.5 rounded ${rsvp.attending === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rsvp.attending === 'yes' ? 'Будет' : 'Отклонил'}
                      </span>
                      {confirmDeleteId === rsvp.id ? (
                        <div className="flex items-center gap-1 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 text-[9px] font-sans">
                          <button
                            onClick={() => {
                              onDeleteRsvp(rsvp.id, rsvp.name);
                              setConfirmDeleteId(null);
                            }}
                            className="font-bold text-red-650 hover:text-red-700 cursor-pointer uppercase"
                          >
                            Да
                          </button>
                          <span className="text-stone-300 text-[8px]">|</span>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="font-bold text-stone-550 hover:text-stone-700 cursor-pointer uppercase"
                          >
                            Нет
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(rsvp.id)}
                          className="p-1 px-1.5 text-stone-300 hover:text-red-600 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                          title="Удалить гостя"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">{rsvp.yandexEmail}</p>
                  {rsvp.message && (
                    <div className="mt-3 p-3 bg-white border border-stone-100 rounded text-xs text-stone-600 italic">
                      «{rsvp.message}»
                    </div>
                  )}
                  <p className="text-[8px] text-stone-300 mt-3 uppercase tracking-widest">
                    {new Date(rsvp.timestamp).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
