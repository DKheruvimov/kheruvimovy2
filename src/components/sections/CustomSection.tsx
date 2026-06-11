import React from "react";
import { motion } from "motion/react";
import { SiteContent, defaultImageStyle } from "../../types";
import { EditableText } from "../EditableText";

interface CustomSectionProps {
  sec: any;
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isMobile: boolean;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  sec,
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isMobile
}) => {
  const activeCustomImg = isMobile ? (sec.imageMobile || sec.image) : sec.image;
  const activeCustomStyle = isMobile ? (sec.imageStyleMobile || sec.imageStyle || defaultImageStyle) : (sec.imageStyle || defaultImageStyle);

  const getUpdatedSectionsList = () => {
    return [...(displayContent.sections || [
      { id: 'story', title: 'Наша исторiя', visible: true },
      { id: 'schedule', title: 'Распорядокъ дня', visible: true },
      { id: 'details', title: 'Усадебный уставъ', visible: true },
      { id: 'rsvp', title: 'Почта', visible: true }
    ])];
  };

  return (
    <section key={sec.id} className="py-24 md:py-48 px-6 container mx-auto max-w-6xl relative border-y border-imperial-gold/5">
      <div className={`grid ${activeCustomImg ? 'md:grid-cols-2' : 'grid-cols-1'} gap-20 items-center`}>
        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            {sec.subtitle !== undefined && (
              <span className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold block">
                <EditableText 
                  value={sec.subtitle} 
                  onChange={v => {
                    const newList = getUpdatedSectionsList();
                    const itemIdx = newList.findIndex(s => s.id === sec.id);
                    if (itemIdx !== -1) {
                      newList[itemIdx] = { ...sec, subtitle: v };
                      handlePreviewUpdate({ ...displayContent, sections: newList });
                    }
                  }}
                  canEdit={isAdminOpen}
                />
              </span>
            )}
            {sec.title !== undefined && (
              <h3 className="text-5xl md:text-6xl font-display italic text-estate-green font-light leading-snug">
                <EditableText 
                  value={sec.title || ""} 
                  onChange={v => {
                    const newList = getUpdatedSectionsList();
                    const itemIdx = newList.findIndex(s => s.id === sec.id);
                    if (itemIdx !== -1) {
                      newList[itemIdx] = { ...sec, title: v };
                      handlePreviewUpdate({ ...displayContent, sections: newList });
                    }
                  }}
                  canEdit={isAdminOpen}
                />
              </h3>
            )}
          </div>
          
          {sec.content !== undefined && (
            <p className="text-stone-600 font-sans leading-loose text-lg font-light text-justify whitespace-pre-wrap">
              <EditableText 
                multiline
                value={sec.content || ""} 
                onChange={v => {
                  const newList = getUpdatedSectionsList();
                  const itemIdx = newList.findIndex(s => s.id === sec.id);
                  if (itemIdx !== -1) {
                    newList[itemIdx] = { ...sec, content: v };
                    handlePreviewUpdate({ ...displayContent, sections: newList });
                  }
                }}
                canEdit={isAdminOpen}
              />
            </p>
          )}
        </div>

        {activeCustomImg && (
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8 }}
            className="imperial-frame overflow-hidden relative aspect-[4/5]"
          >
            <img 
              src={activeCustomImg} 
              alt={sec.title || "Custom Section"} 
              className="w-full h-full object-cover grayscale-[0.05] contrast-[1.05]"
              referrerPolicy="no-referrer"
              style={{
                transform: `translate3d(var(--img-${sec.id}-x, ${activeCustomStyle.x}px), var(--img-${sec.id}-y, ${activeCustomStyle.y}px), 0) rotate(var(--img-${sec.id}-rotate, ${activeCustomStyle.rotate}deg)) scale(var(--img-${sec.id}-scale, ${activeCustomStyle.scale}))`,
                willChange: 'transform'
              }}
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};
