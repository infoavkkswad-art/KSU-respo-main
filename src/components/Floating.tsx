import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

import { brand } from '@/data/brand';


/* ==========================================================================
   KAWAD SWAD 2.0
   FLOATING ACTION SYSTEM

   Contains:
   - Route scroll reset
   - WhatsApp conversion action

   Visual authority:
   - Central design tokens
   - Central elevation
   - Central motion
   - Central z-index
   ========================================================================== */


/* ==========================================================================
   SCROLL TO TOP
   ========================================================================== */

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}


/* ==========================================================================
   WHATSAPP BUTTON
   ========================================================================== */

export function WhatsAppButton() {
  return (
    <a
      href={brand.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        fixed
        bottom-4
        right-4
        z-toast
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        bg-green-500
        text-white
        shadow-floating
        transition-all
        duration-300
        ease-ks-standard
        hover:-translate-y-1
        hover:scale-105
        hover:bg-green-600
        hover:shadow-green-glow
        active:translate-y-0
        active:scale-95
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-brand-saffron
        focus-visible:ring-offset-2
        focus-visible:ring-offset-brand-ivory
        sm:bottom-5
        sm:right-5
      "
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle
        className="
          h-7
          w-7
          transition-transform
          duration-300
          ease-ks-standard
          group-hover:scale-105
        "
        aria-hidden="true"
      />

      {/* Online / attention indicator */}
      <span
        className="
          absolute
          -right-0.5
          -top-0.5
          h-3.5
          w-3.5
          rounded-full
          border-2
          border-white
          bg-brand-red
          animate-pulse
        "
        aria-hidden="true"
      />
    </a>
  );
}
