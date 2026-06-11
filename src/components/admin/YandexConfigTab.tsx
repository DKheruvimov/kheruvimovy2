import React from 'react';

interface YandexConfigTabProps {
  yandexClientId: string;
  setYandexClientId: (val: string) => void;
  yandexClientSecret: string;
  setYandexClientSecret: (val: string) => void;
  isSavingYandex: boolean;
  yandexStatusMessage: string;
  onSaveConfig: () => void;
}

export const YandexConfigTab: React.FC<YandexConfigTabProps> = ({
  yandexClientId,
  setYandexClientId,
  yandexClientSecret,
  setYandexClientSecret,
  isSavingYandex,
  yandexStatusMessage,
  onSaveConfig,
}) => {
  return (
    <div className="space-y-8 pb-20">
      <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
        <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest font-sans">Параметры Yandex OAuth</p>
        <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-sans">
          Настройте Client ID и Client Secret своего приложения Yandex OAuth. После этого вход и привязка по клику заработают автоматически на любом устройстве.
        </p>
      </div>

      <section className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Yandex Client ID</label>
            <input 
              type="text" 
              placeholder="Например, 4e74..."
              className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
              value={yandexClientId}
              onChange={e => setYandexClientId(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Yandex Client Secret</label>
            <input 
              type="password" 
              placeholder="••••••••••••••••••••••••••••••••"
              className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
              value={yandexClientSecret}
              onChange={e => setYandexClientSecret(e.target.value)}
            />
          </div>
        </div>

        {yandexStatusMessage && (
          <div className={`p-3 text-[11px] rounded font-semibold font-sans ${
            yandexStatusMessage.includes('успешно') || yandexStatusMessage.includes('благополучно')
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {yandexStatusMessage}
          </div>
        )}

        <button 
          onClick={onSaveConfig}
          disabled={isSavingYandex}
          className={`w-full py-3 px-6 rounded-full text-[10px] uppercase tracking-widest font-sans font-bold text-center gap-2 transition-all flex items-center justify-center cursor-pointer ${
            isSavingYandex 
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
            : 'bg-stone-900 text-imperial-gold hover:bg-stone-800 shadow-md'
          }`}
        >
          {isSavingYandex ? 'Сохранение...' : 'Сохранить ключи'}
        </button>
      </section>

      <div className="border-t border-stone-100 pt-6 space-y-3 font-sans">
        <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Инструкция по настройке</h4>
        <ol className="text-[11px] text-stone-400 space-y-2 list-decimal list-inside leading-relaxed">
          <li>Перейдите в <a href="https://oauth.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-imperial-gold underline hover:text-imperial-gold/80 transition-colors">Яндекс ID OAuth</a> и создайте приложение.</li>
          <li>Выберите пункт <b>«Веб-сервисы»</b> как тип платформы.</li>
          <li>Укажите Redirect URI (поддерживает и localhost для тестов):<br/>
            <code className="bg-stone-50 text-stone-600 p-1.5 border border-stone-100 rounded text-[9px] font-mono mt-1 block select-all break-all">{window.location.origin}/auth/callback/yandex</code>
          </li>
          <li>Отметьте необходимые права доступа (Scopes) в блоке «Яндекс Паспорт»:
            <ul className="list-disc list-inside pl-4 mt-1 font-sans text-[10px] text-stone-400 space-y-1">
              <li>Доступ к адресу электронной почты (<b>email</b>)</li>
              <li>Доступ к имени, фамилии и полу (<b>info</b>)</li>
              <li>Доступ к логину, имени и аватару (<b>login</b>)</li>
            </ul>
          </li>
          <li>Скопируйте полученные <b>ID</b> и <b>Пароль (Secret)</b> и вставьте их на этой вкладке.</li>
        </ol>
      </div>
    </div>
  );
};
