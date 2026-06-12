import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface IntegrationsTabProps {
  yandexClientId: string;
  setYandexClientId: (val: string) => void;
  yandexClientSecret: string;
  setYandexClientSecret: (val: string) => void;
  isSavingYandex: boolean;
  yandexStatusMessage: string;
  onSaveConfig: () => void;

  // Telegram fields
  telegramBotToken: string;
  setTelegramBotToken: (val: string) => void;
  telegramChatId: string;
  setTelegramChatId: (val: string) => void;
  telegramApiBaseUrl: string;
  setTelegramApiBaseUrl: (val: string) => void;
  isSavingTelegram: boolean;
  telegramStatusMessage: string;
  onSaveTelegramConfig: () => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  yandexClientId,
  setYandexClientId,
  yandexClientSecret,
  setYandexClientSecret,
  isSavingYandex,
  yandexStatusMessage,
  onSaveConfig,

  telegramBotToken,
  setTelegramBotToken,
  telegramChatId,
  setTelegramChatId,
  telegramApiBaseUrl,
  setTelegramApiBaseUrl,
  isSavingTelegram,
  telegramStatusMessage,
  onSaveTelegramConfig
}) => {
  const [idFields, setIdFields] = useState<string[]>(['']);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const parsed = telegramChatId.split(',').map(s => s.trim()).filter(Boolean);
    const currentClean = idFields.filter(Boolean).map(s => s.trim());
    const isDifferent = parsed.join(',') !== currentClean.join(',');
    if (isDifferent) {
      setIdFields(parsed.length > 0 ? parsed : ['']);
    }
  }, [telegramChatId]);

  const handleFieldChange = (index: number, value: string) => {
    const newFields = [...idFields];
    newFields[index] = value;
    setIdFields(newFields);
    setTelegramChatId(newFields.filter(Boolean).map(s => s.trim()).join(', '));
  };

  const handleAddField = () => {
    const newFields = [...idFields, ''];
    setIdFields(newFields);
    setTelegramChatId(newFields.filter(Boolean).map(s => s.trim()).join(', '));
  };

  const handleRemoveField = (index: number) => {
    let newFields = idFields.filter((_, i) => i !== index);
    if (newFields.length === 0) {
      newFields = [''];
    }
    setIdFields(newFields);
    setTelegramChatId(newFields.filter(Boolean).map(s => s.trim()).join(', '));
  };

  const handleTestBot = async () => {
    if (!telegramBotToken) {
      setTestError('Пожалуйста, укажите токен вашего Telegram-бота.');
      return;
    }
    setIsTesting(true);
    setTestError('');
    setTestResult(null);

    const adminToken = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/admin/telegram-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ 
          botToken: telegramBotToken,
          apiBaseUrl: telegramApiBaseUrl
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setTestError(errData.error || 'Ошибка при тестировании соединения.');
      }
    } catch (err: any) {
      console.error(err);
      setTestError('Не удалось подключиться к серверу: ' + (err.message || ''));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. TELEGRAM SECTION */}
      <div className="space-y-6">
        <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
          <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest font-sans">Интеграция с Telegram</p>
          <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-sans">
            Настройте отправку мгновенных уведомлений о подтверждении присутствия гостей прямо в личные сообщения с ботом для вас обоих (без создания общих групп). Поддерживает перечисление нескольких ID через запятую.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Токен Telegram-бота (Bot Token)</label>
            <input 
              type="text" 
              placeholder="Например, 123456789:ABCdefGhIJKlmNoPQ..."
              className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
              value={telegramBotToken}
              onChange={e => setTelegramBotToken(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-400 uppercase font-bold font-sans">Альтернативный адрес API (API Base URL)</label>
            <input 
              type="text" 
              placeholder="https://api.telegram.org"
              className="w-full border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
              value={telegramApiBaseUrl}
              onChange={e => setTelegramApiBaseUrl(e.target.value)}
            />
            <p className="text-[9px] text-stone-400 mt-1 leading-normal font-sans">
              По умолчанию: <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-stone-600">https://api.telegram.org</code>. 
              Если ваш сервер (например, в российском облаке Cloud.ru / Сбер) блокирует прямые запросы к доменам Telegram, укажите адрес надежного прокси или зеркала (например, <code className="font-mono bg-stone-100 px-1 py-0.5 rounded text-stone-600">https://api.telegram-proxy.org</code> или аналогичный).
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] text-stone-400 uppercase font-bold font-sans block mb-1">ID чатов пользователей</label>
            
            <div className="space-y-2">
              {idFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Например: 123456789"
                    className="flex-1 border-b border-stone-200 py-1.5 focus:border-imperial-gold outline-none text-sm bg-transparent font-mono text-stone-750"
                    value={field}
                    onChange={e => handleFieldChange(idx, e.target.value)}
                  />
                  {idFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-1 px-2 border border-red-200 hover:bg-red-50 text-red-500 rounded transition-colors"
                      title="Удалить ID"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddField}
              className="flex items-center gap-1 text-[10px] text-imperial-gold font-bold uppercase tracking-wider py-1 hover:text-stone-800 transition-colors"
            >
              <Plus size={14} />
              Добавить ID чата
            </button>
          </div>
        </div>

        {telegramStatusMessage && (
          <div className={`p-3 text-[11px] rounded font-semibold font-sans ${
            telegramStatusMessage.includes('успешно') || telegramStatusMessage.includes('благополучно')
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {telegramStatusMessage}
          </div>
        )}

        <button 
          onClick={onSaveTelegramConfig}
          disabled={isSavingTelegram}
          className={`w-full py-3 px-6 rounded-full text-[10px] uppercase tracking-widest font-sans font-bold text-center gap-2 transition-all flex items-center justify-center cursor-pointer ${
            isSavingTelegram 
            ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
            : 'bg-stone-900 text-imperial-gold hover:bg-stone-800 shadow-md'
          }`}
        >
          {isSavingTelegram ? 'Сохранение...' : 'Сохранить Telegram'}
        </button>

        {/* Diagnostic Connection Verification Tool */}
        <div className="bg-stone-50 border border-stone-150 rounded-xl p-5 space-y-4 font-sans mt-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Проверить связь с ботом</h4>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-normal">
                Опросить сервера Telegram, проверить статус токена и активность вебхука в реальном времени.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestBot}
              disabled={isTesting || !telegramBotToken}
              className={`flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                isTesting 
                ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                : 'bg-white text-stone-700 hover:text-stone-900 hover:border-imperial-gold/35 border-stone-200 shadow-sm'
              }`}
            >
              {isTesting ? 'Проверка...' : 'Проверить'}
            </button>
          </div>

          {testError && (
            <div className="p-3 bg-red-50 text-red-600 rounded text-[11px] font-medium border border-red-100/60 whitespace-pre-wrap">
              ⚠️ {testError}
            </div>
          )}

          {testResult && (
            <div className="space-y-3 pt-3 text-[11px] border-t border-stone-100">
              {/* Token validity */}
              <div className="flex justify-between items-center bg-white px-3 py-2 rounded border border-stone-100">
                <span className="text-stone-400 font-semibold">Статус токена:</span>
                {testResult.me?.ok ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">
                    🟢 Активен {testResult.me.result?.username ? `(@${testResult.me.result.username})` : ''}
                  </span>
                ) : (
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    🔴 Ошибка (Токен недействителен)
                  </span>
                )}
              </div>

              {/* Registered Webhook URL */}
              <div className="flex flex-col gap-1 bg-white px-3 py-2 rounded border border-stone-100">
                <div className="flex justify-between items-center w-full">
                  <span className="text-stone-400 font-semibold">Webhook на сервере Telegram:</span>
                  <span className="font-mono text-[9px] bg-stone-50 border px-1.5 py-0.5 rounded text-stone-600 truncate max-w-[200px]" title={testResult.webhookInfo?.result?.url || 'нет'}>
                    {testResult.webhookInfo?.result?.url || 'не установлен'}
                  </span>
                </div>
                {testResult.webhookUrl && !testResult.webhookUrl.includes('-pre-') && (
                  <div className="text-[10px] text-amber-600 leading-normal bg-amber-50/50 p-2 border border-amber-100/50 rounded mt-2 font-sans font-medium">
                    ⚠️ <b>Ограничение отладчика:</b> Вы находитесь на тестовом адресе разработки (DEV). Данная среда приватна и защищена OAuth-авторизацией, поэтому служба Telegram не может достучаться до неё. 
                    <br/><br/>
                    <b>Решение:</b> Перейдите по ссылке <b>Опубликованного проекта (Shared App URL)</b> с суффиксом <code className="bg-amber-100 px-1 border border-amber-200 rounded font-mono text-[9px]">-pre-</code>. Там бот заработает на 100% моментально, так как запросы доставляются публично и без ограничений!
                  </div>
                )}
              </div>

              {/* Status parameters */}
              <div className="bg-white px-3 py-2.5 rounded border border-stone-100 space-y-2 text-[10px] leading-relaxed text-stone-500">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-semibold">Очередь недоставленных апдейтов:</span>
                  <span className={`font-mono font-bold ${testResult.webhookInfo?.result?.pending_update_count > 0 ? 'text-amber-500' : 'text-stone-700'}`}>
                    {testResult.webhookInfo?.result?.pending_update_count || 0}
                  </span>
                </div>

                {testResult.webhookInfo?.result?.last_error_message ? (
                  <div className="pt-2 border-t border-stone-100/80">
                    <span className="text-red-500 font-bold block mb-1">Последняя ошибка от Telegram:</span>
                    <p className="bg-red-50/55 p-2 rounded text-red-700 font-mono text-[9px] break-all leading-normal border border-red-100/30">
                      {testResult.webhookInfo.result.last_error_message}
                    </p>
                    <span className="text-stone-400 text-[9px] block mt-1">
                      Время ошибки: {new Date(testResult.webhookInfo.result.last_error_date * 1000).toLocaleString('ru-RU')}
                    </span>
                  </div>
                ) : (
                  testResult.me?.ok && (
                    <div className="text-green-600 font-medium pt-1 border-t border-stone-100/80">
                      ✓ Ошибок подключения со стороны серверов Telegram не зафиксировано.
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-stone-100 pt-6 space-y-3 font-sans">
          <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Инструкция по настройке Telegram-бота</h4>
          <ol className="text-[11px] text-stone-400 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Найдите бота <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-imperial-gold underline hover:text-imperial-gold/80 transition-colors">@BotFather</a> в Telegram и создайте нового бота командой <code className="bg-stone-50 px-1 border rounded font-mono text-[10px]">/newbot</code>.</li>
            <li>Скопируйте предоставленный <b>API Token</b>, вставьте его в поле выше и нажмите кнопку <b>Сохранить Telegram</b> внизу. <span className="text-imperial-gold font-semibold">Это обязательный шаг! Только после этого сервер подключит бота и активирует его вебхук.</span></li>
            <li>Теперь вы и ваша невеста по отдельности должны найти вашего созданного бота в поиске Telegram, нажать <b>Запустить (Start)</b> и отправить ему команду <code className="bg-stone-50 px-1 border rounded font-mono text-[10px]">/chatid</code>.</li>
            <li>Так как вебхук уже активен, бот мгновенно ответит вашим персональным ID чата.</li>
            <li>Добавьте ваши ID в поля ввода выше (нажмите кнопку «Добавить ID чата», чтобы появилось второе поле) и нажмите кнопку <b>Сохранить Telegram</b> ещё раз.</li>
            <li><b>Использование списка гостей:</b> Каждый из вас может отправить команду <code className="bg-stone-50 px-1 border rounded font-mono text-[10px]">/guests</code> (или нажать кнопку меню на клавиатуре) прямо в личный чат с ботом, чтобы получить актуальный отчёт.</li>
          </ol>
        </div>
      </div>

      <div className="border-t border-stone-200 my-8"></div>

      {/* 2. YANDEX SECTION */}
      <div className="space-y-6">
        <div className="bg-imperial-gold/5 p-4 rounded-lg border border-imperial-gold/10">
          <p className="text-[10px] text-imperial-gold font-bold uppercase tracking-widest font-sans">Параметры Yandex OAuth</p>
          <p className="text-[10px] text-stone-500 mt-1 leading-relaxed font-sans">
            Настройте Client ID и Client Secret своего приложения Yandex OAuth. После этого вход и привязка по клику заработают автоматически на любом устройстве.
          </p>
        </div>

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
          {isSavingYandex ? 'Сохранение...' : 'Сохранить Yandex'}
        </button>

        <div className="border-t border-stone-100 pt-6 space-y-3 font-sans">
          <h4 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Инструкция по настройке Yandex ID</h4>
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
    </div>
  );
};
