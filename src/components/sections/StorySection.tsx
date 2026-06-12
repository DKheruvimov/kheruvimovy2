import React from "react";
import { motion } from "motion/react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";
import { Ornament } from "../Ornament";

interface StorySectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  activeStoryImage: string;
  activeStoryStyle: {
    scale: number;
    rotate: number;
    x: number;
    y: number;
  };
  isMobile: boolean;
}

export const StorySection: React.FC<StorySectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  activeStoryImage,
  activeStoryStyle,
  isMobile
}) => {
  const size = isMobile 
    ? (displayContent.storyQuoteSizeMobile ?? 180) 
    : (displayContent.storyQuoteSizeDesktop ?? 288);

  const getQuoteStyles = () => {
    let paddingClass = "p-6 md:p-8";
    let fontClass = "text-xl md:text-3xl";
    let gapClass = "gap-4 md:gap-5";

    if (size <= 140) {
      paddingClass = "p-2.5";
      fontClass = "text-xs sm:text-sm";
      gapClass = "gap-1";
    } else if (size <= 170) {
      paddingClass = "p-3";
      fontClass = "text-sm sm:text-base";
      gapClass = "gap-1.5";
    } else if (size <= 210) {
      paddingClass = "p-4";
      fontClass = "text-base sm:text-lg";
      gapClass = "gap-2";
    } else if (size <= 250) {
      paddingClass = "p-5";
      fontClass = "text-lg md:text-xl";
      gapClass = "gap-3";
    }

    return { paddingClass, fontClass, gapClass };
  };

  const { paddingClass, fontClass, gapClass } = getQuoteStyles();

  return (
    <section className="py-24 md:py-60 px-6 container mx-auto max-w-6xl relative group">
      <div className="grid md:grid-cols-2 gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="relative p-4 md:p-12 border border-imperial-gold/10"
        >
          <div className="absolute inset-0 border border-imperial-gold/5 m-4" />
          <div className="relative overflow-hidden aspect-[4/5]">
            <img 
              src={activeStoryImage} 
              alt="The Couple" 
              className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05]"
              referrerPolicy="no-referrer"
              style={{
                transform: `translate3d(var(--img-story-x, ${activeStoryStyle.x}px), var(--img-story-y, ${activeStoryStyle.y}px), 0) rotate(var(--img-story-rotate, ${activeStoryStyle.rotate}deg)) scale(var(--img-story-scale, ${activeStoryStyle.scale}))`,
                willChange: 'transform'
              }}
            />
          </div>
          <div 
            style={{
              width: `${size}px`,
              height: `${size}px`
            }} 
            className={`absolute -bottom-6 md:-bottom-10 -left-6 md:-left-10 bg-[var(--color-quote-bg)] text-imperial-gold shadow-2xl flex items-center justify-center ${paddingClass}`}
          >
            <div className={`w-fit max-w-full flex flex-col items-start ${gapClass}`}>
              <p className={`font-display italic leading-tight text-left ${fontClass}`}>
                <EditableText 
                  multiline
                  value={displayContent.storyQuote} 
                  onChange={v => handlePreviewUpdate({ ...displayContent, storyQuote: v })}
                  canEdit={isAdminOpen}
                />
              </p>
              <div className="w-10 h-px bg-imperial-gold/40" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="flex flex-col gap-10"
        >
          <h2 className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold">
            <EditableText 
              value={displayContent.storyTitle} 
              onChange={v => handlePreviewUpdate({ ...displayContent, storyTitle: v })}
              canEdit={isAdminOpen}
            />
          </h2>
          <h3 className={`${
            (displayContent.storySubtitle || "").length > 50
              ? "text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] leading-[1.25]"
              : (displayContent.storySubtitle || "").length > 35
                ? "text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] leading-[1.2]"
                : "text-5xl md:text-7xl leading-[1.1]"
          } font-display italic text-estate-green font-light transition-all duration-300`}>
            <EditableText 
              value={displayContent.storySubtitle} 
              onChange={v => handlePreviewUpdate({ ...displayContent, storySubtitle: v })}
              canEdit={isAdminOpen}
            />
          </h3>
          <p className="text-stone-600 font-sans leading-loose text-lg font-light text-justify">
            <EditableText 
              multiline
              value={displayContent.storyDescription} 
              onChange={v => handlePreviewUpdate({ ...displayContent, storyDescription: v })}
              canEdit={isAdminOpen}
            />
          </p>
          <div className="flex items-center gap-6 mt-4">
            <Ornament displayContent={displayContent} className="w-16 opacity-100" />
            <span className="font-display italic text-2xl text-stone-400">
              <EditableText 
                value={displayContent.signature} 
                onChange={v => handlePreviewUpdate({ ...displayContent, signature: v })}
                canEdit={isAdminOpen}
              />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
