import React from "react";

export const Ornament = ({ className = "" }: { className?: string }) => (
  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`opacity-40 ${className}`}>
    <path d="M0 10C10 10 10 0 20 0C30 0 30 10 40 10C50 10 50 20 60 20" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
    <circle cx="30" cy="10" r="2" fill="var(--color-imperial-gold)"/>
    <path d="M0 10C10 10 10 20 20 20C30 20 30 10 40 10C50 10 50 0 60 0" stroke="var(--color-imperial-gold)" strokeWidth="1"/>
  </svg>
);
