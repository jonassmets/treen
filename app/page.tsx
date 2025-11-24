'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { ProfileSection } from './components/ProfileSection';
import { CollageSection } from './components/CollageSection';
import { ContactForm } from './components/ContactForm';
import { Footer } from './components/Footer';

const BRIGHT_COLORS = [
  '#FFD700', // Gold
  '#FF6B9D', // Pink
  '#4ECDC4', // Turquoise
  '#95E1D3', // Mint
  '#FFA07A', // Light Salmon
  '#98D8C8', // Sea Green
  '#FFB6D9', // Light Pink
  '#B4E7CE', // Pale Green
  '#FFEAA7', // Light Yellow
  '#74B9FF', // Sky Blue
  '#A29BFE', // Lavender
  '#FD79A8', // Hot Pink
  '#FDCB6E', // Mustard
  '#6C5CE7', // Bright Purple
  '#FF7675', // Coral Red
] as const;

export default function Home() {
  const [accentColor] = useState(
    () => BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const root = document.documentElement;
    const previousAccent = root.style.getPropertyValue('--accent-color');
    const previousHtmlBg = root.style.backgroundColor;
    const previousBodyBg = document.body.style.backgroundColor;

    root.style.setProperty('--accent-color', accentColor);
    root.style.backgroundColor = accentColor;
    document.body.style.backgroundColor = '#ffffff';

    return () => {
      if (previousAccent) {
        root.style.setProperty('--accent-color', previousAccent);
      } else {
        root.style.removeProperty('--accent-color');
      }
      root.style.backgroundColor = previousHtmlBg;
      document.body.style.backgroundColor = previousBodyBg;
    };
  }, [accentColor]);

  return (
    <main className="bg-white" style={{
      fontSize: '20px',
      position: 'relative'
    }}>
      <HeroSection />
      <ProfileSection accentColor={accentColor} />
      <CollageSection />
      <ContactForm accentColor={accentColor} />
      <Footer />
    </main>
  );
}
