import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
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
  isMobile: boolean;
}

interface DetailItemProps {
  detail: any;
  idx: number;
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isMobile: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({
  detail,
  idx,
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isMobile,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isActive = isMobile && isInView;

  const Icon = { MapPin, Info, Heart }[detail.icon] || Info;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.8 }}
      className={`flex gap-10 detail-item ${isActive ? "is-active" : ""}`}
    >
      <div className="flex-shrink-0 w-16 h-16 border flex items-center justify-center detail-item-icon-container">
        <Icon className="w-6 h-6 detail-item-icon" />
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
    </motion.div>
  );
};

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  activeDetailsImage,
  activeDetailsStyle,
  isMobile
}) => {
  return (
    <section className="py-32 md:py-60 container mx-auto px-6 max-w-6xl relative">
      <div className="space-y-6 mb-16 md:mb-24">
        <h2 className="text-imperial-gold font-sans text-xs uppercase tracking-[0.6em] font-bold">Наставления</h2>
        <h3 className="text-5xl md:text-6xl font-display italic text-estate-green font-light">Усадебный устав</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-20 items-start">
        <div className="flex flex-col gap-16 order-2 md:order-1">
          <div className="space-y-16">
            {displayContent.details.map((detail, idx) => (
              <DetailItem 
                key={idx}
                detail={detail}
                idx={idx}
                displayContent={displayContent}
                handlePreviewUpdate={handlePreviewUpdate}
                isAdminOpen={isAdminOpen}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.02 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="relative p-4 md:p-12 border border-imperial-gold/10 order-1 md:order-2 w-full max-w-md mx-auto md:max-w-none md:mt-2"
        >
          <div className="absolute inset-0 border border-imperial-gold/5 m-4" />
          <div className="relative overflow-hidden aspect-[4/5]">
            <img 
              src={activeDetailsImage} 
              alt="Manor Aesthetics" 
              className="w-full h-full object-cover contrast-[1.1] grayscale-[0.05]"
              referrerPolicy="no-referrer"
              style={{
                transform: `translate3d(var(--img-details-x, ${activeDetailsStyle.x}px), var(--img-details-y, ${activeDetailsStyle.y}px), 0) rotate(var(--img-details-rotate, ${activeDetailsStyle.rotate}deg)) scale(var(--img-details-scale, ${activeDetailsStyle.scale}))`,
                willChange: 'transform'
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
