'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const HERO_PARAGRAPHS = [
  'Sinds 2020 run ik TREEN, waar ik organisaties, teams en professionals begeleid in persoonlijk leiderschap, communicatie, gedrag en samenwerking. Daarvoor werkte ik meer dan tien jaar als trainer, coach en adviseur bij onder andere Spraakwater, Zuidema, LinQue Consult en Teylingereind. Die veelzijdige achtergrond — van gesloten jeugdhulpverlening en het onderwijsveld tot overheid en bedrijfsleven — vormt de solide basis onder mijn aanpak.',
  'Ik heb van nature een mensgerichte oriëntatie en geloof dat echte verandering begint bij het individu: jezelf kennen, je rol begrijpen en het grotere systeem zien waar je deel van uitmaakt. Vanuit dat inzicht ontstaat ruimte voor ontwikkeling. Mijn stijl is nuchter, warm en gericht op wat er écht gebeurt in de groep. In een open en veilig speelveld wordt alles bespreekbaar en durven mensen te experimenteren, hun patronen te herkennen en stappen te zetten die blijven hangen — praktisch waar het moet, verdiepend waar het kan.',
  'Ik werk met teams en professionals die willen groeien en samenwerken met meer lef en bewustzijn. Zij zoeken iemand die scherpte en veiligheid moeiteloos kan combineren; iemand die beweging brengt zonder de mens uit het oog te verliezen. Dat is precies waar ik op mijn best ben: soepel, kwetsbaar en vanzelfsprekend, vanuit vertrouwen.',
] as const;

export function HeroSection() {
  const signatureRef = useRef<HTMLDivElement | null>(null);
  const scrollRevealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const signatureFrameRef = useRef<number | null>(null);
  const signatureBaseScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const updateSignature = () => {
      const element = signatureRef.current;
      if (!element) return;

      if (signatureBaseScrollRef.current === null) {
        signatureBaseScrollRef.current = window.scrollY;
      }

      const delta = window.scrollY - signatureBaseScrollRef.current;
      const translateY = Math.max(-400, -delta * 0.45);
      element.style.transform = `translate3d(0, ${translateY}px, 0)`;
    };

    const schedule = () => {
      if (signatureFrameRef.current !== null) return;
      signatureFrameRef.current = window.requestAnimationFrame(() => {
        signatureFrameRef.current = null;
        updateSignature();
      });
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (signatureFrameRef.current !== null) {
        window.cancelAnimationFrame(signatureFrameRef.current);
      }
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      signatureBaseScrollRef.current = null;
    };
  }, []);

  useEffect(() => {
    const elements = scrollRevealRefs.current.filter(
      (el): el is HTMLDivElement => Boolean(el)
    );
    if (elements.length === 0) {
      return undefined;
    }

    const handleScroll = () => {
      const viewportHeight = window.innerHeight || 1;
      elements.forEach((el) => {
        const speed = Number(el.dataset.speed ?? 0.15);
        const rect = el.getBoundingClientRect();
        const offset = ((rect.top - viewportHeight / 2) / viewportHeight) * speed * 200;
        el.style.setProperty('--parallax-offset', `${offset}px`);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section className="hero-section w-full flex items-center justify-center" style={{
      minHeight: 'max(100svh, 720px)',
      padding: 'clamp(32px, 5vh, 60px) 0',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      display: 'flex'
    }}>
      <div
        className="hero-shell w-full px-6 md:px-12"
        style={{
          margin: 'auto',
          maxWidth: '979px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 'clamp(24px, 3.5vh, 40px)'
        }}
      >
        {/* Hero Title */}
        <h1 className="hero-title font-bold text-gray-900 text-left" style={{ fontWeight: 700 }}>
          Fijn dat je hier bent.<br />
          Ik help mensen en teams groeien door helderheid, humor en écht contact.
        </h1>

        {/* Three Column Layout */}
        <div className="hero-columns-wrapper">
          <div className="hero-columns scroll-reveal" data-speed="0.16" ref={(el) => { scrollRevealRefs.current[0] = el; }}>
            {HERO_PARAGRAPHS.map((paragraph, idx) => (
              <p key={`hero-paragraph-${idx}`} className="hero-paragraph">{paragraph}</p>
            ))}
            <div className="signature-stack">
              <div className="mobile-signature">
                <Image
                  src="/signature.png"
                  alt="Handtekening van Joris"
                  width={256}
                  height={120}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  priority
                />
              </div>
              <div className="pt-2 md:pt-2 mt-12 flex md:justify-start">
                <div className="w-44 md:w-56" style={{ maxWidth: '240px' }}>
                  <div
                    ref={signatureRef}
                    className="signature-container"
                    style={{ width: '100%' }}
                  >
                    <Image
                      src="/signature.png"
                      alt="Handtekening van Joris"
                      width={256}
                      height={120}
                      priority
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
