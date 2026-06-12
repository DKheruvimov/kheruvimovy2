import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Wine, Utensils, Music, Heart } from "lucide-react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";
import { Ornament } from "../Ornament";

interface ScheduleSectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isMobile: boolean;
}

interface ScheduleCardProps {
  item: any;
  idx: number;
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
  isMobile: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  idx,
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isMobile,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const isActive = isInView;
  
  const Icon = { Wine, Utensils, Music, Heart }[item.icon] || Wine;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.2 }}
      className={`text-center p-8 border border-transparent rounded-lg schedule-card ${
        isActive ? "is-active" : ""
      }`}
    >
      <div className="w-12 h-12 mx-auto border flex items-center justify-center mb-10 schedule-card-icon-container">
        <Icon className="w-4 h-4 text-imperial-gold schedule-card-icon" />
      </div>
      <span className="font-display italic text-3xl text-stone-300 block mb-4 schedule-card-time">
        <EditableText 
          value={item.time} 
          onChange={v => {
            const newSchedule = [...displayContent.schedule];
            newSchedule[idx] = { ...item, time: v };
            handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
          }}
          canEdit={isAdminOpen}
        />
      </span>
      <h4 className="font-display text-2xl text-estate-green mb-4">
        <EditableText 
          value={item.event} 
          onChange={v => {
            const newSchedule = [...displayContent.schedule];
            newSchedule[idx] = { ...item, event: v };
            handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
          }}
          canEdit={isAdminOpen}
        />
      </h4>
      <p className="text-stone-500 text-xs tracking-widest leading-relaxed uppercase opacity-60 schedule-card-desc">
        <EditableText 
          value={item.desc} 
          onChange={v => {
            const newSchedule = [...displayContent.schedule];
            newSchedule[idx] = { ...item, desc: v };
            handlePreviewUpdate({ ...displayContent, schedule: newSchedule });
          }}
          canEdit={isAdminOpen}
        />
      </p>
    </motion.div>
  );
};

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen,
  isMobile
}) => {
  return (
    <section className="py-32 bg-warm-cream border-y border-imperial-gold/5 relative">
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-28"
        >
          <h2 className="text-stone-400 font-sans text-xs uppercase tracking-[0.6em] font-bold mb-8">Манифест дня</h2>
          <h3 className="text-5xl md:text-7xl font-display text-estate-green italic font-light">Праздничный вечер</h3>
          {displayContent.scheduleOrnamentEnabled && (
            <div className="mt-8">
              <Ornament displayContent={displayContent} className="mx-auto" />
            </div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {displayContent.schedule.map((item, idx) => (
            <ScheduleCard 
              key={idx}
              item={item}
              idx={idx}
              displayContent={displayContent}
              handlePreviewUpdate={handlePreviewUpdate}
              isAdminOpen={isAdminOpen}
              isMobile={isMobile}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
