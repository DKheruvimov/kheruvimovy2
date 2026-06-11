import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SiteContent } from "../../types";

interface CountdownSectionProps {
  displayContent: SiteContent;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ displayContent }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    if (!displayContent.countdownDate) return;

    const calculateTimeLeft = () => {
      const target = new Date(displayContent.countdownDate!);
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [displayContent.countdownDate]);

  if (!displayContent.countdownEnabled) {
    return null;
  }

  return (
    <div className="py-20 bg-stone-950 border-y border-imperial-gold/15 text-center relative overflow-hidden">
      {/* Decorative background vectors or subtle elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(181,149,90,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-imperial-gold/20 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-imperial-gold/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-imperial-gold/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-imperial-gold/20 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-stone-400 font-sans text-[10px] uppercase tracking-[0.5em] font-medium mb-8"
        >
          До начала торжества остаётся:
        </motion.p>

        {timeLeft.isOver ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display italic text-3xl text-imperial-gold tracking-widest pt-2"
          >
            Счастливый день насталъ!
          </motion.div>
        ) : (
          <div className="flex justify-center items-center gap-2 sm:gap-8 max-w-lg mx-auto">
            {/* Days */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-display text-4xl sm:text-6xl text-imperial-gold tracking-tight font-light min-w-[3.5rem] select-none">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-medium mt-2">Дней</span>
            </div>
            
            <div className="text-imperial-gold/30 font-display text-2xl pb-6 select-none">:</div>

            {/* Hours */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-display text-4xl sm:text-6xl text-imperial-gold tracking-tight font-light min-w-[3.5rem] select-none">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-medium mt-2">Часовъ</span>
            </div>

            <div className="text-imperial-gold/30 font-display text-2xl pb-6 select-none">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-display text-4xl sm:text-6xl text-imperial-gold tracking-tight font-light min-w-[3.5rem] select-none">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-medium mt-2">Минутъ</span>
            </div>

            <div className="text-imperial-gold/30 font-display text-2xl pb-6 select-none">:</div>

            {/* Seconds */}
            <div className="flex flex-col items-center flex-1">
              <span className="font-display text-4xl sm:text-6xl text-imperial-gold tracking-tight font-light min-w-[3.5rem] select-none">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-stone-500 font-medium mt-2">Секундъ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
