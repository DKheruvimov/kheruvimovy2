import React from "react";
import { motion, useTransform, MotionValue } from "motion/react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";

interface HeroSectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isLoading: boolean;
  activeHeroImage: string;
  activeHeroStyle: {
    scale: number;
    rotate: number;
    x: number;
    y: number;
  };
  scrollYProgress: MotionValue<number>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isLoading,
  activeHeroImage,
  activeHeroStyle,
  scrollYProgress
}) => {
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const names = displayContent?.names || "";
  const nameParts = names.includes(' & ') ? names.split(' & ') : [names, ""];

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="absolute inset-0 z-0"
      >
        <img 
          src={activeHeroImage} 
          alt="Historical Russian Manor" 
          className="w-full h-full object-cover brightness-[0.75] sepia-[0.1]"
          referrerPolicy="no-referrer"
          style={{
            transform: `translate3d(var(--img-hero-x, ${activeHeroStyle.x}px), var(--img-hero-y, ${activeHeroStyle.y}px), 0) rotate(var(--img-hero-rotate, ${activeHeroStyle.rotate}deg)) scale(var(--img-hero-scale, ${activeHeroStyle.scale}))`,
            willChange: "transform"
          }}
        />
        <div className="absolute inset-0 bg-stone-950/20" />
      </motion.div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={!isLoading ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
        >
          <div className="flex flex-col items-center gap-6 mb-12">
            <span className="text-white/70 uppercase tracking-[0.6em] text-[10px] md:text-xs font-semibold">
              <EditableText 
                value={displayContent.subLocation} 
                onChange={v => handlePreviewUpdate({ ...displayContent, subLocation: v })}
                canEdit={isAdminOpen}
              />
            </span>
            <div className="w-px h-16 bg-white/30" />
          </div>
          
          <h1 className="text-white text-4xl md:text-[10rem] font-display font-light mb-10 md:mb-16 leading-tight md:leading-none relative z-10">
            <EditableText 
              value={nameParts[0]} 
              onChange={v => handlePreviewUpdate({ ...displayContent, names: `${v} & ${nameParts[1]}` })}
              canEdit={isAdminOpen}
            />
            <span className="italic opacity-40 font-serif text-3xl md:text-[7rem] align-middle inline-block mx-4">&amp;</span>
            <EditableText 
              value={nameParts[1]} 
              onChange={v => handlePreviewUpdate({ ...displayContent, names: `${nameParts[0]} & ${v}` })}
              canEdit={isAdminOpen}
            />
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20">
            <div className="text-white/90 font-display text-xl md:text-4xl italic tracking-wide">
              <EditableText 
                value={displayContent.date} 
                onChange={v => handlePreviewUpdate({ ...displayContent, date: v })}
                canEdit={isAdminOpen}
              />
            </div>
            <div className="hidden md:block w-px h-12 bg-white/20" />
            <div className="flex flex-col items-center gap-2">
              <EditableText 
                className="text-white/90 font-display text-xl md:text-4xl italic tracking-wide"
                value={displayContent.location} 
                onChange={v => handlePreviewUpdate({ ...displayContent, location: v })}
                canEdit={isAdminOpen}
              />
              <EditableText 
                className="text-white/40 text-[8px] md:text-[9px] uppercase tracking-[0.4em]"
                value={displayContent.manorTitle} 
                onChange={v => handlePreviewUpdate({ ...displayContent, manorTitle: v })}
                canEdit={isAdminOpen}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
