import React, { useState } from 'react';
import { Key, LogOut, Check, Link2, Unlink } from 'lucide-react';

interface AccessTabProps {
  yandexUser: any;
  linkedYandexList: any[];
  isLoadingLinks: boolean;
  onAdminLogout: () => void;
  onYandexLogin: () => void;
  onLinkYandex: () => void;
  onUnlinkYandex: (yandexId: string) => void;
}

export const AccessTab: React.FC<AccessTabProps> = ({
  yandexUser,
  linkedYandexList,
  isLoadingLinks,
  onAdminLogout,
  onYandexLogin,
  onLinkYandex,
  onUnlinkYandex,
}) => {
  const [confirmUnlinkId, setConfirmUnlinkId] = useState<string | null>(null);
  return (
    <div className="space-y-8 pb-20">
      {/* Session Section */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans">
          Текущий сеанс
        </h3>
        <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
              <Key size={14} />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-base leading-none text-stone-700">denis (Администратор)</h4>
              <p className="text-[8px] uppercase tracking-widest text-[#22c55e] font-semibold mt-1">Доступ разрешён</p>
            </div>
          </div>
          
          <button 
            onClick={onAdminLogout}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            Выйти из системы
          </button>
        </div>
      </div>

      {/* Yandex Link Section */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans">
          Интеграция с Яндекс ID
        </h3>
        
        {yandexUser ? (
          <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-4">
              <img 
                src={`https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`}
                className="w-12 h-12 rounded-full border border-stone-200"
                alt="Yandex Avatar"
              />
              <div>
                <h4 className="font-sans font-semibold text-base leading-none text-stone-700">{yandexUser.real_name || yandexUser.display_name}</h4>
                <p className="text-[9px] text-stone-400 mt-1">Логин: {yandexUser.login}</p>
              </div>
            </div>

            {linkedYandexList.some(u => String(u.yandexId) === String(yandexUser.id)) ? (
              <div className="flex items-center gap-2 text-[#22c55e] text-xs font-semibold py-2 px-3 bg-green-50 rounded border border-green-100">
                <Check size={14} />
                <span>Этот аккаунт привязан к вашей админке</span>
              </div>
            ) : (
              <button 
                onClick={onLinkYandex}
                className="w-full bg-[#f33] hover:bg-[#d00] text-white text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
              >
                <Link2 size={12} />
                Привязать этот Яндекс ID
              </button>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 border border-stone-100 rounded-lg p-5 text-center space-y-3">
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Вы можете войти под своим аккаунтом Яндекс, чтобы привязать его к панели управления. После этого вы сможете логиниться в один клик.
            </p>
            <button 
              onClick={onYandexLogin}
              className="w-full border border-stone-200 hover:bg-stone-100 text-stone-700 text-[9px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 rounded transition-colors cursor-pointer"
            >
              Войти в Яндекс
            </button>
          </div>
        )}
      </div>

      {/* Linked Users List */}
      <div>
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-imperial-gold border-b border-imperial-gold/10 pb-2 mb-4 font-sans flex justify-between items-center">
          Доверенные профили
          <span className="text-stone-400 font-normal">{linkedYandexList.length} привязано</span>
        </h3>

        {isLoadingLinks ? (
          <div className="text-center py-6 text-stone-300 italic text-xs">Загрузка данных...</div>
        ) : linkedYandexList.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-stone-200 rounded text-xs text-stone-300 italic">
            Нет привязанных профилей. Привяжите профиль Яндекс выше, чтобы заходить без ввода логина и пароля.
          </div>
        ) : (
          <div className="space-y-3">
            {linkedYandexList.map((usr: any) => (
              <div key={usr.yandexId} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100 hover:border-imperial-gold/20 transition-colors">
                {usr.avatarUrl && (
                  <img 
                    src={usr.avatarUrl} 
                    className="w-10 h-10 rounded-full border border-stone-200" 
                    alt="Avatar" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="font-sans font-semibold text-sm text-stone-700 truncate leading-none mb-1">{usr.realName || usr.login}</h4>
                  <p className="text-[8px] text-stone-400 uppercase tracking-widest">Логин: {usr.login}</p>
                </div>
                {confirmUnlinkId === usr.yandexId ? (
                  <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded px-2 py-1 animate-fadeIn flex-shrink-0 text-[10px] font-sans">
                    <button 
                      onClick={() => {
                        onUnlinkYandex(usr.yandexId);
                        setConfirmUnlinkId(null);
                      }}
                      className="text-red-650 font-bold hover:underline cursor-pointer uppercase"
                    >
                      Отвязать?
                    </button>
                    <span className="text-stone-300">|</span>
                    <button 
                      onClick={() => setConfirmUnlinkId(null)}
                      className="text-stone-550 font-bold hover:underline cursor-pointer uppercase"
                    >
                      Нет
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmUnlinkId(usr.yandexId)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded text-stone-400 transition-all flex-shrink-0 cursor-pointer"
                    title="Удалить привязку"
                  >
                    <Unlink size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
