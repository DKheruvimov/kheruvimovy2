import React, { useState } from 'react';
import { motion } from "motion/react";
import { X, Key, Shield, LogIn } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
  onYandexLogin: () => void;
  isLoggingInYandex: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onLoginSuccess,
  onYandexLogin,
  isLoggingInYandex
}) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password })
      });

      if (res.ok) {
        const data = await res.json();
        onLoginSuccess(data.token);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Неверный логин или пароль');
      }
    } catch (err) {
      setError('Ошибка сети. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-md bg-white border border-stone-100 rounded shadow-2xl relative p-8 md:p-10 text-stone-900"
      >
        {/* Ornaments */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t border-l border-imperial-gold/30"></div>
        <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-imperial-gold/30"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-imperial-gold/30"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b border-r border-imperial-gold/30"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-400"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-imperial-gold/10 border border-imperial-gold/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-imperial-gold" size={24} />
          </div>
          <h2 className="font-display italic text-3xl text-stone-900 font-medium mb-1">Ворота усадьбы</h2>
          <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-bold">Вход в панель управления</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded text-red-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">Логинъ</label>
            <input 
              required
              type="text" 
              placeholder="Введите логин"
              className="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-imperial-gold rounded transition-all font-medium text-stone-700"
              value={login}
              onChange={e => setLogin(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-stone-400 font-bold block">Пароль</label>
            <input 
              required
              type="password" 
              placeholder="Введите пароль"
              className="w-full bg-stone-50 border border-stone-200 p-3 text-sm focus:outline-none focus:border-imperial-gold rounded transition-all font-medium text-stone-700"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-stone-900 text-imperial-gold py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Key size={14} />
            {isLoading ? "Авторизация..." : "Войти по паролю"}
          </button>
        </form>

        <div className="relative my-8 text-center text-[10px] text-stone-300 uppercase tracking-widest font-semibold">
          <span className="bg-white px-3 relative z-10">Или</span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-100 z-0" />
        </div>

        <button 
          type="button"
          onClick={onYandexLogin}
          disabled={isLoggingInYandex}
          className="w-full flex items-center justify-center gap-4 bg-white border border-stone-200 py-4 hover:bg-stone-50 transition-all rounded shadow-sm cursor-pointer disabled:opacity-50"
        >
          <span className="w-6 h-6 rounded-full bg-[#f33] flex items-center justify-center text-white text-xs font-bold italic">
            {isLoggingInYandex ? "..." : "Я"}
          </span>
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
              {isLoggingInYandex ? "Ожидание..." : "По велению Яндекс ID"}
            </p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};
