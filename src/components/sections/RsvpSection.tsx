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
    <section id="rsvp" className="py-32 md:py-60 bg-stone-950 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
      <div className="container mx-auto px-6 relative z-10 max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display italic text-6xl md:text-[8rem] mb-12 text-imperial-gold font-light">Почта</h2>
          <p className="text-sm uppercase tracking-[0.6em] text-white/30 mb-20">
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
              className="py-20 border border-imperial-gold/20 backdrop-blur-xl rounded-xl bg-stone-900/20"
            >
              <Ornament displayContent={displayContent} className="mx-auto mb-10" />
              <h3 className="text-4xl font-display mb-6 italic">Ваш ответъ принятъ</h3>
              <p className="text-white/80 font-display text-xl px-8">Мы бесконечно польщены вашим ответом. До встречи на усадебном пиру.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-12">
              
              {/* STEP 1 */}
              <div className="bg-stone-900/30 border border-white/10 rounded-xl p-6 md:p-8 space-y-6 relative hover:border-imperial-gold/20 transition-all pt-10">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-stone-950 border border-imperial-gold/40 rounded-full text-[10px] uppercase tracking-[0.2em] text-imperial-gold font-bold">
                  Шагъ 1. Сведенiя о гостяхъ
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">
                      Имя Вашего Величества <span className="text-imperial-gold">*</span>
                    </label>
                    <input 
                      required
                      type="text" 
                      placeholder="Имя и Фамилия"
                      className="w-full bg-stone-950 border border-white/20 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-lg font-light placeholder:text-white/30 text-white"
                      value={formState.name}
                      onChange={e => setFormState({...formState, name: e.target.value})}
                    />
                    <p className="text-[10px] text-white/40 italic">Пожалуйста, напишите Ваше имя и фамилию</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">Будете одинъ или съ парой?</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-stone-950 border border-white/20 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-lg font-light appearance-none cursor-pointer text-white pr-10"
                        value={formState.guests}
                        onChange={e => {
                          const val = e.target.value;
                          setFormState(prev => ({
                            ...prev,
                            guests: val,
                            guest2Name: val === "1" ? "" : prev.guest2Name
                          }));
                        }}
                      >
                        <option value="1" className="bg-stone-950 text-white">Буду одинъ</option>
                        <option value="2" className="bg-stone-950 text-white">Будемъ вдвоемъ</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
                        ▼
                      </div>
                    </div>
                    <p className="text-[10px] text-white/40 italic">Укажите, придете ли Вы одинъ или со спутникомъ</p>
                  </div>
                </div>

                <div className={`space-y-3 transition-all duration-300 ${formState.guests !== "2" ? "opacity-30" : "opacity-100"}`}>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-white/40 font-bold block flex items-center gap-2">
                    <span>Имя спутника / спутницы</span>
                    {formState.guests === "2" && <span className="text-imperial-gold font-bold">*</span>}
                  </label>
                  <input 
                    required={formState.guests === "2"}
                    disabled={formState.guests !== "2"}
                    type="text" 
                    placeholder={formState.guests === "2" ? "Имя спутника" : "Поле закрыто (выберите 'Будем вдвоем' выше)"}
                    className="w-full bg-stone-950 border border-white/20 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-lg font-light placeholder:text-white/30 text-white disabled:bg-stone-900/40 disabled:border-white/5 disabled:cursor-not-allowed"
                    value={formState.guest2Name}
                    onChange={e => setFormState({...formState, guest2Name: e.target.value})}
                  />
                  {formState.guests === "2" ? (
                    <p className="text-[10px] text-imperial-gold italic font-medium animate-fadeIn">Пожалуйста, впишите имя Вашего спутника</p>
                  ) : (
                    <p className="text-[10px] text-white/40 italic">Станет активным, когда выбрано «Будем вдвоем»</p>
                  )}
                </div>
              </div>

              {/* STEP 2 */}
              <div className="bg-stone-900/30 border border-white/10 rounded-xl p-6 md:p-8 space-y-6 relative hover:border-imperial-gold/20 transition-all pt-10">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-stone-950 border border-imperial-gold/40 rounded-full text-[10px] uppercase tracking-[0.2em] text-imperial-gold font-bold">
                  Шагъ 2. Участiе и пожелания
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">Намерены ли быть?</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-stone-950 border border-white/20 focus:border-imperial-gold rounded-lg px-4 py-4 focus:outline-none transition-colors font-display text-lg font-light appearance-none cursor-pointer text-white pr-10"
                        value={formState.attending}
                        onChange={e => setFormState({...formState, attending: e.target.value})}
                      >
                        <option value="yes" className="bg-stone-950">
                          {formState.guests === "2" ? "С радостiю прибудемъ" : "С радостiю прибуду"}
                        </option>
                        <option value="no" className="bg-stone-950">
                          {formState.guests === "2" ? "Къ сожаленiю, отклонимъ" : "Къ сожаленiю, отклоню"}
                        </option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-[10px]">
                        ▼
                      </div>
                    </div>
                    <p className="text-[10px] text-white/40 italic">Подтвердите Ваше присутствие</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-bold block">Письмо молодымъ</label>
                    <textarea 
                      rows={2}
                      placeholder="Особые пожелания, пожелания по меню..."
                      className="w-full bg-stone-950 border border-white/20 focus:border-imperial-gold rounded-lg px-4 py-3 focus:outline-none transition-colors font-display text-lg font-light resize-none placeholder:text-white/30 text-white min-h-[58px]"
                      value={formState.message}
                      onChange={e => setFormState({...formState, message: e.target.value})}
                    />
                    <p className="text-[10px] text-white/40 italic">Пожелания, предпочтения или комментарии (необязательно)</p>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="bg-stone-900/30 border border-white/10 rounded-xl p-6 md:p-8 space-y-6 relative hover:border-imperial-gold/20 transition-all pt-10">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-stone-950 border border-imperial-gold/40 rounded-full text-[10px] uppercase tracking-[0.2em] text-imperial-gold font-bold">
                  Шагъ 3. Подпись и отправка
                </div>

                <div className="space-y-6 pt-2">
                  <p className="text-xs md:text-sm text-white/70 leading-relaxed">
                    Для отправки Вашего ответа, мы просим обязательно подтвердить личность кнопкой ниже (это займет 5 секунд и надежно защитит усадебную книгу от спама).
                  </p>

                  {!yandexUser ? (
                    <div className="space-y-4">
                      {/* Pulse-glow effect for Yandex login */}
                      <button 
                        type="button"
                        onClick={handleYandexLogin}
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-4 bg-red-600/15 border border-red-500/50 hover:border-red-500 hover:bg-red-600/30 py-5 transition-all group disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.1)] rounded-lg animate-pulse"
                      >
                        <span className="w-8 h-8 rounded-full bg-[#f33] flex items-center justify-center text-white font-bold italic text-base shadow-[0_0_8px_rgba(243,51,51,0.4)]">
                          {isLoggingIn ? "..." : "Я"}
                        </span>
                        <div className="text-left">
                          <p className="text-xs uppercase tracking-widest text-[#ffa2a2] font-bold group-hover:text-white">
                            {isLoggingIn ? "Ожиданiе ответа..." : "НАЖМИТЕ ДЛЯ ПОДТВЕРЖДЕНИЯ ЧЕРЕЗ ЯНДЕКС"}
                          </p>
                          <p className="text-[10px] text-white/50">Безопасный вход без лишних хлопот за 1 клик</p>
                        </div>
                      </button>
                      
                      <div className="bg-amber-500/10 border border-amber-500/30 py-3 px-4 rounded-lg text-xs text-amber-200/90 leading-normal flex items-start gap-2.5">
                        <span className="text-amber-400 font-bold block pt-0.5">⚠️</span>
                        <span>
                          <strong>Внимание:</strong> Кнопка «Запечатать письмо» станет активной и доступной для нажатия только после того, как Вы нажмете на красную кнопку подтверждения Яндекс выше.
                        </span>
                      </div>
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
                        <p className="text-xs font-sans font-bold text-green-400 tracking-wider uppercase">Личность подтверждена! ✓</p>
                        <p className="text-lg font-display italic text-white leading-normal">{yandexUser.real_name || yandexUser.display_name}</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleLogout}
                        className="text-white/40 hover:text-white/80 hover:underline text-xs tracking-wider cursor-pointer font-sans bg-transparent py-1 px-3 border border-white/10 rounded-md transition-colors"
                      >
                        Выйти / Другой профиль
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={!yandexUser || isSubmitting}
                    className={`w-full border py-5 text-xs md:text-sm uppercase tracking-[0.5em] transition-all duration-300 font-bold rounded-lg cursor-pointer ${
                      yandexUser && !isSubmitting
                      ? "border-imperial-gold/50 bg-imperial-gold/10 text-imperial-gold hover:bg-imperial-gold hover:text-stone-950 hover:shadow-[0_0_20px_rgba(212,175,55,0.35)]" 
                      : "border-white/10 text-white/30 bg-stone-900/60 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? "Отправка..." : (yandexUser ? "Запечатать письмо и отправить" : "Запечатать письмо (сначала подтвердите личность выше)")}
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
