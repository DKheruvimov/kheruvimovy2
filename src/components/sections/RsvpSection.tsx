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
    message: string;
  };
  setFormState: React.Dispatch<React.SetStateAction<{
    name: string;
    attending: string;
    guests: string;
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
              className="py-20 border border-imperial-gold/20 backdrop-blur-xl"
            >
              <Ornament className="mx-auto mb-10" />
              <h3 className="text-4xl font-display mb-6 italic">Ваш ответъ принятъ</h3>
              <p className="text-white/40 font-display text-xl px-8">Мы бесконечно польщены вашим ответом. До встречи на усадебном пиру.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="text-left space-y-20">
              <div className="grid md:grid-cols-2 gap-x-12 md:gap-x-20 gap-y-12">
                <div className="space-y-6">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Имя Вашего Величества</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ваше Имя"
                    className={`w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light placeholder:text-white/5 ${yandexUser ? 'text-white/40' : ''}`}
                    readOnly={!!yandexUser}
                    value={formState.name}
                    onChange={e => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-6">
                  <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Намерены ли быть?</label>
                  <select 
                    className="w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light appearance-none cursor-pointer leading-tight"
                    value={formState.attending}
                    onChange={e => setFormState({...formState, attending: e.target.value})}
                  >
                    <option value="yes" className="bg-stone-900">С радостiю прибудемъ</option>
                    <option value="no" className="bg-stone-900">Къ сожаленiю, отклонимъ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold block">Письмо молодымъ</label>
                <textarea 
                  rows={2}
                  placeholder="Особые пожелания или вопросы..."
                  className="w-full bg-transparent border-b border-white/10 pb-4 focus:outline-none focus:border-imperial-gold transition-colors font-display text-xl md:text-2xl font-light resize-none placeholder:text-white/5 leading-tight"
                  value={formState.message}
                  onChange={e => setFormState({...formState, message: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">Подтвержденiе личности</label>
                {!yandexUser ? (
                  <button 
                    type="button"
                    onClick={handleYandexLogin}
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center gap-4 bg-white/5 border border-white/10 py-6 hover:bg-white/10 transition-all group disabled:opacity-50 cursor-pointer"
                  >
                    <span className="w-8 h-8 rounded-full bg-[#f33] flex items-center justify-center text-white font-bold italic">
                      {isLoggingIn ? "..." : "Я"}
                    </span>
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-widest text-white/60 group-hover:text-white">
                        {isLoggingIn ? "Ожиданiе ответа..." : "Подтвердить через Yandex ID"}
                      </p>
                      <p className="text-[10px] text-white/30">Безопасный входъ безъ лишнихъ словъ</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 py-4 px-6 bg-imperial-gold/10 border border-imperial-gold/20 rounded">
                    <img 
                      src={`https://avatars.yandex.net/get-yapic/${yandexUser.default_avatar_id}/islands-middle`} 
                      className="w-10 h-10 rounded-full border border-imperial-gold/30"
                      alt="Yandex Avatar"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <p className="text-sm font-display italic text-imperial-gold">{yandexUser.real_name || yandexUser.display_name}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest underline decoration-imperial-gold/30">Личность подтверждена</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleLogout}
                      className="ml-auto text-white/20 hover:text-white/60 text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={!yandexUser || isSubmitting}
                className={`w-full border py-8 text-[11px] uppercase tracking-[0.7em] transition-all duration-1000 font-bold cursor-pointer ${
                  yandexUser && !isSubmitting
                  ? "border-imperial-gold/30 hover:bg-imperial-gold hover:text-stone-950" 
                  : "border-white/5 text-white/10 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Отправка..." : (yandexUser ? "Запечатать письмо" : "Требуется авторизацiя")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};
