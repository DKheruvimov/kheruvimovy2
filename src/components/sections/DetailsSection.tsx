import React from "react";
import { motion } from "motion/react";
import { MapPin, Info, Heart } from "lucide-react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";

interface DetailsSectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  activeDetailsImage: string;
  activeDetailsStyle: {
    scale: number;
    rotate: number;
    x: number;
    y: number;
  };
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  activeDetailsImage,
  activeDetailsStyle
}) => {
  return (
    <section className="py-32 md:py-60 container mx-auto px-6 max-w-6xl relative">
      <div className="grid md:grid-cols-2 gap-20 items-center">
        <div className="flex flex-col gap-16 order-2 md:order-1">
          <div className="space-y-6">
            <h2 className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold">Наставления</h2>
            <h3 className="text-5xl md:text-6xl font-display italic text-estate-green font-light">Усадебный устав</h3>
          </div>
          
          <div className="space-y-16">
            {displayContent.details.map((detail, idx) => {
              const Icon = { MapPin, Info, Heart }[detail.icon] || Info;
              return (
                <div key={idx} className="flex gap-10 group">
                  <div className="flex-shrink-0 w-16 h-16 border border-stone-100 flex items-center justify-center group-hover:bg-hover-accent transition-all duration-500">
                    <Icon className="text-stone-300 w-6 h-6 group-hover:text-imperial-gold transition-colors" />
                  </div>
                  <div className="space-y-3">
                    <h5 className="font-display text-2xl text-estate-green italic">
                      <EditableText 
                        value={detail.title} 
                        onChange={v => {
                          const newDetails = [...displayContent.details];
                          newDetails[idx] = { ...detail, title: v };
                          handlePreviewUpdate({ ...displayContent, details: newDetails });
                        }}
                        canEdit={isAdminOpen}
                      />
                    </h5>
                    <p className="text-stone-500 font-light leading-loose">
                      <EditableText 
                        multiline
                        value={detail.content} 
                        onChange={v => {
                          const newDetails = [...displayContent.details];
                          newDetails[idx] = { ...detail, content: v };
                          handlePreviewUpdate({ ...displayContent, details: newDetails });
                        }}
                        canEdit={isAdminOpen}
                      />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="order-1 md:order-2 imperial-frame overflow-hidden"
        >
          <img 
            src={activeDetailsImage} 
            alt="Manor Aesthetics" 
            className="w-full aspect-[4/5] object-cover contrast-[1.1] grayscale-[0.05]"
            referrerPolicy="no-referrer"
            style={{
              transform: `translate3d(var(--img-details-x, ${activeDetailsStyle.x}px), var(--img-details-y, ${activeDetailsStyle.y}px), 0) rotate(var(--img-details-rotate, ${activeDetailsStyle.rotate}deg)) scale(var(--img-details-scale, ${activeDetailsStyle.scale}))`,
              willChange: 'transform'
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};
