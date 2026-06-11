import React from "react";
import { motion } from "motion/react";
import { Wine, Utensils, Music, Heart } from "lucide-react";
import { SiteContent } from "../../types";
import { EditableText } from "../EditableText";
import { Ornament } from "../Ornament";

interface ScheduleSectionProps {
  displayContent: SiteContent;
  handlePreviewUpdate: (newContent: SiteContent) => void;
  isAdminOpen: boolean;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  displayContent,
  handlePreviewUpdate,
  isAdminOpen
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
          {displayContent.schedule.map((item, idx) => {
            const Icon = { Wine, Utensils, Music, Heart }[item.icon] || Wine;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center group border border-transparent hover:border-imperial-gold/10 p-8 transition-all duration-700"
              >
                <div className="w-12 h-12 mx-auto border border-imperial-gold/30 flex items-center justify-center mb-10 rotate-[45deg] group-hover:rotate-0 transition-transform duration-1000">
                  <Icon className="w-4 h-4 text-imperial-gold -rotate-[45deg] group-hover:rotate-0 transition-transform duration-1000" />
                </div>
                <span className="font-display italic text-3xl text-stone-300 group-hover:text-imperial-gold transition-colors block mb-4">
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
                <p className="text-stone-500 text-xs tracking-widest leading-relaxed uppercase opacity-60 group-hover:opacity-100 transition-opacity">
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
          })}
        </div>
      </div>
    </section>
  );
};
