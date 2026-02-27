import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  color: string;
  className?: string;
}

// PREMIUM "DİNLE" ICON
// Concept: "Absorption". Sound waves entering a focal point (the learner's mind).
// Style: Concentric arcs with a gradient fade, pointing to a glowing core.
export function ListenIcon({ color, className }: IconProps) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.08" />
          <stop offset="1" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle Glassy Background */}
      <circle cx="50" cy="50" r="46" fill={`url(#${id}-grad)`} stroke={color} strokeOpacity="0.05" strokeWidth="1" />

      {/* Center: The Receiver (Mind/Ear) */}
      <g filter={`url(#${id}-glow)`}>
        <circle cx="40" cy="50" r="6" fill={color} opacity="0.9" />
        <circle cx="40" cy="50" r="2.5" fill="white" />
      </g>

      {/* Sound Waves: Entering from right */}
      <path
        d="M55 35C62 38 66 44 66 50C66 56 62 62 55 65"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M68 28C78 32 84 40 84 50C84 60 78 68 68 72"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M80 20C92 26 98 38 98 50C98 62 92 74 80 80"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.25"
      />
      
      {/* Dynamic particles */}
      <circle cx="70" cy="40" r="1.5" fill={color} opacity="0.4" />
      <circle cx="65" cy="58" r="1.5" fill={color} opacity="0.4" />
    </svg>
  );
}

// PREMIUM "KONUŞ" ICON
// Concept: "Projection". Voice waveform expanding outwards from a core.
// Style: Vertical bars representing voice data, enclosed in a subtle bubble.
export function SpeakIcon({ color, className }: IconProps) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-bg`} x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.1" />
          <stop offset="1" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Shape: Abstract Speech Bubble */}
      <path
        d="M50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10C27.9086 10 10 27.9086 10 50C10 65.6 19.0 79.1 32 85.9L30 92L38 88.5C41.8 89.5 45.8 90 50 90Z"
        fill={`url(#${id}-bg)`}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.1"
      />

      {/* Audio Waveform */}
      <g transform="translate(50, 50)" filter={`url(#${id}-glow)`}>
        {/* Central strong bar */}
        <rect x="-4" y="-22" width="8" height="44" rx="4" fill={color} opacity="0.9" />
        
        {/* Side bars */}
        <rect x="8" y="-14" width="6" height="28" rx="3" fill={color} opacity="0.6" />
        <rect x="18" y="-8" width="6" height="16" rx="3" fill={color} opacity="0.3" />
        
        <rect x="-14" y="-14" width="6" height="28" rx="3" fill={color} opacity="0.6" />
        <rect x="-24" y="-8" width="6" height="16" rx="3" fill={color} opacity="0.3" />
      </g>
      
      {/* Accent: Projection Lines */}
      <path d="M70 30 L74 26" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M76 50 L82 50" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M70 70 L74 74" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// PREMIUM "DÜZELT" ICON
// Concept: "Precision". A checkmark appearing on a grid/target.
// Style: Sharp, clean strokes with a "verified" badge feel.
export function CorrectIcon({ color, className }: IconProps) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.08" />
          <stop offset="1" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={color} floodOpacity="0.25"/>
        </filter>
      </defs>

      {/* Background Badge Shape */}
      <path 
        d="M50 10L85 25V50C85 70 70 88 50 95C30 88 15 70 15 50V25L50 10Z" 
        fill={`url(#${id}-grad)`} 
        stroke={color} 
        strokeOpacity="0.1" 
        strokeWidth="1"
      />

      {/* Decorative Grid Lines (Precision) */}
      <path d="M30 40H70" stroke={color} strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
      <path d="M30 60H70" stroke={color} strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
      <path d="M50 30V70" stroke={color} strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />

      {/* The Checkmark */}
      <path
        d="M32 52L44 64L68 36"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-shadow)`}
      />
      
      {/* Glow highlight on the tip */}
      <circle cx="44" cy="64" r="3" fill="white" opacity="0.4" />
    </svg>
  );
}

// PREMIUM "TEKRAR ET" ICON
// Concept: "Neuroplasticity". Infinite loop with neural nodes.
// Style: Smooth figure-8 with connecting dots.
export function RepeatIcon({ color, className }: IconProps) {
  const id = React.useId();
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="1" />
          <stop offset="0.5" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="1" />
        </linearGradient>
        <filter id={`${id}-glow`}>
           <feGaussianBlur stdDeviation="1.5" result="blur" />
           <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background Glow Circle */}
      <circle cx="50" cy="50" r="42" fill={color} fillOpacity="0.03" stroke={color} strokeOpacity="0.05" />

      {/* Infinity Loop Path */}
      {/* Optimized Horizontal Infinity Figure-8 */}
      <path
        d="M25 50 C25 25 45 25 50 50 C55 75 75 75 75 50 C75 25 55 25 50 50 C45 75 25 75 25 50 Z"
        stroke={`url(#${id}-grad)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={`url(#${id}-glow)`}
      />

      {/* Neural Nodes / Synapses */}
      {/* Node 1: Top Left Curve */}
      <circle cx="30" cy="35" r="3" fill="white" stroke={color} strokeWidth="2" />
      
      {/* Node 2: Bottom Right Curve */}
      <circle cx="70" cy="65" r="3" fill="white" stroke={color} strokeWidth="2" />
      
      {/* Node 3: Center Crossing */}
      <circle cx="50" cy="50" r="3" fill={color} />

      {/* Moving Energy / Spark (Decorative) */}
      <circle cx="70" cy="35" r="2" fill={color} opacity="0.6" />
      <circle cx="30" cy="65" r="2" fill={color} opacity="0.6" />
    </svg>
  );
}
