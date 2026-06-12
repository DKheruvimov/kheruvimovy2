import React from "react";
import { motion } from "motion/react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";
import { Ornament } from "../Ornament";

interface RsvpSectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isSubmitted: boolean;
  isSubmitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  formState: {
    name: string;
    attending: string;
    guests: string;
    guest2Name: string;
    message: string;
  };
  setFormState: React.Dispatch<React.SetStateAction<{
    name: string;
    attending: string;
    guests: string;
    guest2Name: string;
    message: string;
  }>>;
  yandexUser: any;
  isLoggingIn: boolean;
  handleYandexLogin: () => void;
  handleLogout: () => void;
  isMobile: boolean;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isSubmitted,
  isSubmitting,
  handleSubmit,
  formState,
  setFormState,
  yandexUser,
  isLoggingIn,
  handleYandexLogin,
  handleLogout
}) => {
  return (
    <section id="rsvp" className="py-24 md:py-48 bg-stone-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
      <div className="container mx-auto px-6 relative z-10 max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display italic text-6xl md:text-[8rem] mb-8 text-imperial-gold font-light">Почта</h2>
          <p className="text-sm uppercase tracking-[0.6em] text-white/30 mb-16">
            Смиренно просим подтвердить Ваше присутствiе до{' '}
            <EditableText 
              value={displayContent.rsvpDeadline} 
              onChange={v => handlePreviewUpdate({ ...displayContent, rsvpDeadline: v })}
              canEdit={isAdminOpen}
            />
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 border border-imperial-gold/20 backdrop-blur-xl rounded-xl bg-stone-900/20"
            >
              <Ornament displayContent={displayContent} className="mx-auto mb-8" />
              <h3 className="text-3xl font-display mb-4 italic">Ваш ответъ принятъ</h3>
              <p className="text-white/80 font-display text-lg px-8">Мы бесконечно польщены вашим ответом. До встречи на усадебном пиру.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left">
              <div className="bg-stone-900/30 border border-white/10 rounded-2xl p-6 md:p-10 space-y-8 relative transition-all duration-500 hover:border-imperial-gold/20 shadow-2xl backdrop-blur-md">
                
                {/* Elegant Vintage Heading */}
                <div className="text-center pb-6 border-b border-white/10">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-imperial-gold font-bold">Усадебное приглашенiе</span>
                  <p className="text-xs text-white/40 italic mt-2 font-display">Камерный ужинъ • Индивидуальный ответъ</p>
                </div>

                {/* Form fields */}
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">
                      Ваше Славное Имя <span className="text-imperial-gold">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Имя и Фамилия"
                      className="w-full bg-stone-950 border border-white/15 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-lg font-light placeholder:text-white/35 text-white"
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                    />
                  </div>

                  {/* Yes/No selection with beautiful radio options */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">
                      Намерены ли присутствовать?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, attending: 'yes' })}
                        className={`py-4 px-6 rounded-lg border text-sm font-display italic transition-all text-center cursor-pointer flex items-center justify-center gap-3 ${
                          formState.attending === 'yes'
                            ? 'border-imperial-gold bg-imperial-gold/10 text-imperial-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                            : 'border-white/10 bg-stone-950/50 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${formState.attending === 'yes' ? 'bg-imperial-gold' : 'bg-white/30'}`} />
                        С радостiю прибуду
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, attending: 'no' })}
                        className={`py-4 px-6 rounded-lg border text-sm font-display italic transition-all text-center cursor-pointer flex items-center justify-center gap-3 ${
                          formState.attending === 'no'
                            ? 'border-red-500/50 bg-red-500/5 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.05)]'
                            : 'border-white/10 bg-stone-950/50 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${formState.attending === 'no' ? 'bg-red-400' : 'bg-white/30'}`} />
                        Къ сожаленiю, отклоню
                      </button>
                    </div>
                  </div>

                  {/* Letter message wishes */}
                  <div className="space-y-3 pt-2">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">
                      Пожелания или комментарии к меню
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Напишите Ваши пожелания, особенности питания или музыкальные предпочтения..."
                      className="w-full bg-stone-950 border border-white/15 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-[15px] font-light resize-none placeholder:text-white/30 text-white min-h-[90px]"
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                    />
                  </div>
                </div>

                {/* Verification & Consent Step */}
                <div className="pt-6 border-t border-white/10 space-y-6">
                  <div>
                    <h4 className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold mb-2">Подтвержденiе личности</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      Чтобы запечатать Ваше приглашение, мы смиренно просим войти через Яндекс-аккаунт. Это защитит усадебную книгу и мгновенно оповестит молодоженов в Telegram.
                    </p>
                  </div>

                  {!yandexUser ? (
                    <div className="space-y-4">
                      {/* Pulse-glow effect for Yandex login */}
                      <button 
                        type="button"
                        onClick={handleYandexLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-4 bg-red-600/15 border border-red-500/40 hover:border-red-500 hover:bg-red-600/30 py-5 transition-all group disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-lg"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#f33] flex items-center justify-center text-white font-bold italic text-base shadow-[0_0_8px_rgba(243,51,51,0.4)]">
                          {isLoggingIn ? "..." : "Я"}
                        </span>
                        <div className="text-left">
                          <p className="text-[11px] uppercase tracking-widest text-[#ffa2a2] font-bold group-hover:text-white">
                            {isLoggingIn ? "Ожидаем ответа..." : "НАЖМИТЕ ДЛЯ ПОДТВЕРЖДЕНИЯ ЧЕРЕЗ ЯНДЕКС"}
                          </p>
                          <p className="text-[10px] text-white/50">Безопасный вход без пароля в 1 клик</p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4 py-4 px-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <img 
                        src={`https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`} 
                        className="w-10 h-10 rounded-full border-2 border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                        alt="Yandex Avatar"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-center sm:text-left flex-grow">
                        <p className="text-[10px] font-sans font-bold text-green-400 tracking-wider uppercase">Личность подтверждена! ✓</p>
                        <p className="text-base font-display italic text-white leading-normal">{yandexUser.real_name || yandexUser.display_name}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleLogout}
                        className="text-white/40 hover:text-white/85 hover:underline text-[10px] uppercase tracking-wider cursor-pointer font-sans bg-transparent py-1 px-3 border border-white/10 rounded-md transition-colors"
                      >
                        Выйти
                      </button>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={!yandexUser || isSubmitting}
                    className={`w-full border py-5 text-xs uppercase tracking-[0.5em] transition-all duration-300 font-bold rounded-lg cursor-pointer ${
                      yandexUser && !isSubmitting
                      ? "border-imperial-gold bg-imperial-gold/15 text-imperial-gold hover:bg-imperial-gold hover:text-stone-950 hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]" 
                      : "border-white/10 text-white/30 bg-stone-900/60 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Отправляем..." : (yandexUser ? "Запечатать письмо и отправить" : "Запечатать письмо (сначала подтвердите личность)")}
                  </button>
                </div>

              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
