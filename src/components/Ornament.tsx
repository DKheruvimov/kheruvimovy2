import React from "react";
import { SiteContent } from "../types";

interface OrnamentProps {
  className?: string;
  displayContent?: SiteContent;
  customHeight?: number;
}

export const Ornament = ({ className = "", displayContent, customHeight }: OrnamentProps) => {
  // If ornaments are globally disabled, don't render anything
  if (displayContent && displayContent.ornamentsEnabled === false) {
    return null;
  }

  const customUrl = displayContent?.customOrnamentUrl;
  const recolor = displayContent?.recolorCustomOrnament !== false;
  const height = customHeight || displayContent?.ornamentHeight || 20;
  const width = customUrl ? height : height * 3;

  if (customUrl) {
    if (recolor) {
      // Colorize the custom monochrome SVG/image using CSS masks
      return (
        <div
          className={`inline-block ${className}`}
          style={{
            backgroundColor: "var(--color-imperial-gold)",
            maskImage: `url(${customUrl})`,
            WebkitMaskImage: `url(${customUrl})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            width: `${width}px`,
            height: `${height}px`,
            opacity: 0.8
          }}
        />
      );
    } else {
      // Just render the image raw (e.g. if it has its own colors)
      return (
        <img
          src={customUrl}
          alt="Декорация"
          className={`inline-block object-contain opacity-85 ${className}`}
          style={{
            width: `${width}px`,
            height: `${height}px`
          }}
          referrerPolicy="no-referrer"
        />
      );
    }
  }

  // Default wave SVG ornament
  return (
    <svg width={width} height={height} viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`opacity-40 select-none ${className}`}>
      <path d="M0 10C10 10 10 0 20 0C30 0 30 10 40 10C50 10 50 20 60 20" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
      <circle cx="30" cy="10" r="2" fill="var(--color-imperial-gold)"/>
      <path d="M0 10C10 10 10 20 20 20C30 20 30 10 40 10C50 10 50 0 60 0" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
    </svg>
  );
};
