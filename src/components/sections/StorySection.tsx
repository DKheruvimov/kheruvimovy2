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
}

export const StorySection: React.FC<StorySectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  activeStoryImage,
  activeStoryStyle
}) => {
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
          <div className="absolute -bottom-6 md:-bottom-10 -left-6 md:-left-10 bg-[var(--color-quote-bg)] text-imperial-gold shadow-2xl w-56 md:w-72 aspect-square flex items-center justify-center p-6 md:p-8">
            <div className="w-fit max-w-full flex flex-col items-start gap-4 md:gap-6">
              <p className="font-display italic text-xl md:text-2xl leading-tight text-left">
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
          <h3 className="text-5xl md:text-7xl font-display italic text-estate-green leading-[1.1] font-light">
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
