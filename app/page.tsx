'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';

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

type CollageLayout = {
  size: number;
  top: string;
  speedFactor: number;
  offset: number;
};

type CollageImage = CollageLayout & {
  src: string;
  alt: string;
};

const COLLAGE_LAYOUTS: CollageLayout[] = [
  { size: 620, top: '0vh', speedFactor: 0.8, offset: 10 },
  { size: 580, top: '80vh', speedFactor: 0.4, offset: 50 },
  { size: 560, top: '180vh', speedFactor: 0.2, offset: 30 },
  { size: 680, top: '111vh', speedFactor: 0.7, offset: 70 },
  { size: 540, top: '230vh', speedFactor: 0.55, offset: 20 },
  { size: 200, top: '160vh', speedFactor: 0.1, offset: 10 },
];

const ENTRY_Y_OFFSETS = [0.42, 0.22, 0.08, -0.04, 0.15, 0];

const IMAGE_FOLDER = '/image%20section';

const buildImageSrc = (fileName: string) => `${IMAGE_FOLDER}/${encodeURIComponent(fileName)}`;

export default function Home() {
  const [accentColor] = useState(
    () => BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)]
  );
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ state: 'idle' | 'success' | 'error'; message: string }>(
    {
      state: 'idle',
      message: '',
    }
  );
  const signatureRef = useRef<HTMLDivElement | null>(null);
  const collageSectionRef = useRef<HTMLElement | null>(null);
  const collageItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRevealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollFrameRef = useRef<number | null>(null);
  const mobileDriftFrameRef = useRef<number | null>(null);
  const signatureFrameRef = useRef<number | null>(null);
  const signatureBaseScrollRef = useRef<number | null>(null);

  const collageImages = useMemo<CollageImage[]>(() => {
    if (imageFiles.length === 0) return [];
    return imageFiles.map((file, idx) => {
      const layout = COLLAGE_LAYOUTS[idx % COLLAGE_LAYOUTS.length];
      return {
        ...layout,
        src: buildImageSrc(file),
        alt: `Collagebeeld ${idx + 1}`,
      };
    });
  }, [imageFiles]);

  const collageHeightVh = useMemo(() => {
    if (collageImages.length === 0) return 240;
    const maxTop = collageImages.reduce((max, img) => {
      const numeric = parseFloat(img.top);
      if (!Number.isFinite(numeric)) {
        return max;
      }
      return Math.max(max, numeric);
    }, 0);

    return Math.max(240, maxTop + 100);
  }, [collageImages]);

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      firstName: formData.get('firstName')?.toString().trim() ?? '',
      lastName: formData.get('lastName')?.toString().trim() ?? '',
      email: formData.get('email')?.toString().trim() ?? '',
      phone: formData.get('phone')?.toString().trim() ?? '',
      message: formData.get('message')?.toString().trim() ?? '',
    };

    setIsSubmitting(true);
    setFormStatus({ state: 'idle', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : 'Het versturen van het bericht is mislukt. Probeer het later opnieuw.'
        );
      }

      setFormStatus({
        state: 'success',
        message: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
      });
      form.reset();
    } catch (error) {
      setFormStatus({
        state: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Het versturen van het bericht is mislukt. Probeer het later opnieuw.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (collageImages.length === 0 || typeof window === 'undefined') {
      collageItemRefs.current = [];
      return undefined;
    }

    collageItemRefs.current = collageItemRefs.current.slice(0, collageImages.length);

    const setupDesktop = () => {
      const updatePositions = () => {
        const section = collageSectionRef.current;
        if (!section) {
          scrollFrameRef.current = null;
          return;
        }

        const viewportHeight = window.innerHeight || 1;
        const viewportWidth = window.innerWidth || 1;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight || viewportHeight;
        const rangeStart = sectionTop - viewportHeight;
        const rangeEnd = sectionTop + sectionHeight;
        const totalRange = rangeEnd - rangeStart || 1;

        const rawProgress = (window.scrollY - rangeStart) / totalRange;
        const progress = Math.min(1, Math.max(0, rawProgress));

        collageItemRefs.current.forEach((item, idx) => {
          const config = collageImages[idx];
          if (!item || !config) return;

          const travelDistance = viewportWidth * 2.2 + config.size + config.offset;
          const translateX =
            viewportWidth + config.offset - progress * travelDistance * config.speedFactor;
          const entryYOffset = ENTRY_Y_OFFSETS[idx % ENTRY_Y_OFFSETS.length] ?? 0;
          const translateY = viewportHeight * entryYOffset * (1 - progress);

          item.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        });

        scrollFrameRef.current = null;
      };

      const scheduleUpdate = () => {
        if (scrollFrameRef.current === null) {
          scrollFrameRef.current = window.requestAnimationFrame(updatePositions);
        }
      };

      scheduleUpdate();
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate);

      return () => {
        if (scrollFrameRef.current !== null) {
          window.cancelAnimationFrame(scrollFrameRef.current);
          scrollFrameRef.current = null;
        }
        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', scheduleUpdate);
      };
    };

    const setupMobile = () => {
      // Guard clause – only run this pathway when the requested mobile breakpoint is active.
      if (window.innerWidth > 768) {
        return setupDesktop();
      }

      const getStates = () => {
        const viewportWidth = window.innerWidth || 1;
        const viewportHeight = window.innerHeight || 1;

        return collageItemRefs.current.map((item, idx) => {
          if (!item) return null;
          const rect = item.getBoundingClientRect();
          const baseSpeed = idx % 2 === 0 ? 0.35 : 0.55;
          return {
            width: rect.width || (collageImages[idx]?.size ?? 320),
            x: viewportWidth + Math.random() * viewportWidth,
            y: ((viewportHeight / (collageItemRefs.current.length + 1)) * (idx + 1)) + idx * 10,
            speed: baseSpeed * (0.5 + Math.random() * 0.5),
            wiggleAmplitude: 4 + Math.random() * 4,
            wiggleFrequency: (Math.PI * 2) / (2000 + Math.random() * 2000),
            phase: Math.random() * Math.PI * 2,
          };
        });
      };

      let states = getStates();

      const animate = (timestamp: number) => {
        if (window.innerWidth > 768) {
          return;
        }

        collageItemRefs.current.forEach((item, idx) => {
          const state = states[idx];
          if (!item || !state) return;

          state.x -= state.speed;
          // Restart the drift once an image exits the viewport to keep the loop seamless.
          if (state.x < -state.width) {
            state.x = (window.innerWidth || 1) + Math.random() * (window.innerWidth || 1) * 0.4;
            state.y = Math.random() * ((window.innerHeight || 1) * 0.8);
            // Random phase offsets double as wiggle delays so every item feels unique.
            state.phase = Math.random() * Math.PI * 2;
          }
          const wiggle = Math.sin(timestamp * state.wiggleFrequency + state.phase) * state.wiggleAmplitude;
          item.style.transform = `translate3d(${state.x}px, ${state.y + wiggle}px, 0)`;
        });

        mobileDriftFrameRef.current = window.requestAnimationFrame(animate);
      };

      mobileDriftFrameRef.current = window.requestAnimationFrame(animate);

      const handleResize = () => {
        if (window.innerWidth > 768) {
          return;
        }
        states = getStates();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (mobileDriftFrameRef.current !== null) {
          window.cancelAnimationFrame(mobileDriftFrameRef.current);
          mobileDriftFrameRef.current = null;
        }
        window.removeEventListener('resize', handleResize);
      };
    };

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    let activeCleanup = mediaQuery.matches ? setupMobile() : setupDesktop();

    const handleChange = (event: MediaQueryListEvent) => {
      activeCleanup?.();
      activeCleanup = event.matches ? setupMobile() : setupDesktop();
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      activeCleanup?.();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [collageImages]);

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

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadImages = async () => {
      try {
        const response = await fetch('/api/collage-images', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load collage images: ${response.status}`);
        }
        const files: unknown = await response.json();
        if (!Array.isArray(files)) {
          throw new Error('Unexpected payload when loading collage images');
        }
        if (isMounted) {
          setImageFiles(files.filter((item): item is string => typeof item === 'string'));
        }
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
        console.error('Unable to fetch collage images', error);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <main className="bg-white" style={{ 
      fontSize: '20px', 
      position: 'relative'
    }}>
      {/* Hero Section - Entry Text + Paragraphs */}
      <section className="hero-section w-full flex items-center justify-center" style={{ 
        minHeight: '100vh',
        height: '100vh',
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div
          className="hero-shell w-full px-6 md:px-12"
          style={{
            maxWidth: '979px',
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
  {/* Hero Title */}
  <h1 className="hero-title font-bold text-gray-900 text-left" style={{ fontWeight: 700, fontSize: '70px', lineHeight: '1.1em', marginBottom: '100px' }}>
          Fijn dat je hier bent.<br />
          Ik help mensen en teams groeien door helderheid, humor en écht contact.
        </h1>

    {/* Three Column Layout */}
    <div className="hero-grid grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20 items-start">
          {/* Column 1 - Longest */}
          <div
            className="space-y-8 text-left scroll-reveal"
            data-speed="0.18"
            style={{ color: '#808080', lineHeight: '1.6em', wordWrap: 'break-word', overflowWrap: 'break-word' }}
            ref={(el) => {
              scrollRevealRefs.current[0] = el;
            }}
          >
            <p>
              Sinds 2020 run ik TREEN, waar ik organisaties, teams en individuele professionals begeleid in persoonlijk leiderschap, communicatie, gedrag en samenwerking. Daarvoor werkte ik meer dan tien jaar als trainer, coach en adviseur bij onder andere Spraakwater, Zuidema, LinQue Consult en Teylingereind. Die brede achtergrond — van zorg en onderwijs tot overheid en bedrijfsleven — vormt de solide basis onder mijn aanpak.
            </p>
          </div>

          {/* Column 2 - Medium */}
          <div
            className="space-y-8 text-left scroll-reveal"
            data-speed="0.12"
            style={{ color: '#808080', lineHeight: '1.6em', wordWrap: 'break-word', overflowWrap: 'break-word' }}
            ref={(el) => {
              scrollRevealRefs.current[1] = el;
            }}
          >
            <p>
              Mijn stijl is nuchter, warm en altijd gericht op wat er écht gebeurt in de groep. Ik creëer een open en veilige sfeer waarin mensen durven experimenteren, hun eigen patronen leren herkennen en stappen zetten die blijven hangen. Praktisch waar het moet, verdiepend waar het kan — altijd met aandacht voor de balans tussen individuele groei en groepsdynamiek.
            </p>
          </div>

          {/* Column 3 - Shortest */}
          <div
            className="space-y-8 text-left scroll-reveal"
            data-speed="0.2"
            style={{ color: '#808080', lineHeight: '1.6em', wordWrap: 'break-word', overflowWrap: 'break-word' }}
            ref={(el) => {
              scrollRevealRefs.current[2] = el;
            }}
          >
            <p>
              Ik werk met teams en professionals die willen groeien, die met meer lef én meer bewustzijn willen samenwerken, en daarbij iemand zoeken die scherpte en veiligheid moeiteloos weet te combineren. Iemand die beweging brengt zonder de mens uit het oog te verliezen.
            </p>
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
            <div className="pt-6 md:pt-4 flex md:justify-end">
              <div className="w-48 md:w-64" style={{ maxWidth: '260px' }}>
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
      </section>

      {/* Profile Section - Below the fold */}
      <section
        id="contact-details"
        className="profile-section contact-details-section w-full flex items-center justify-center"
        style={{ 
        minHeight: '100vh', 
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        display: 'flex',
        alignItems: 'center'
        }}
      >
        <div className="w-full px-6 md:px-12" style={{ maxWidth: '979px' }}>
        <div className="profile-stack flex flex-col md:flex-row gap-16 items-start text-left">
          <div className="profile-photo-wrapper">
            <Image 
              src="/profile.jpg" 
              alt="Joris van den Hout" 
              width={280} 
              height={350}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Joris van den Hout</h2>
            <p className="text-gray-600 mb-8">
              Trainer - Facilitator - Adviseur - Ademcoach
            </p>
            <div className="space-y-2 mb-8">
              <p className="text-gray-600">
                <a 
                  href="tel:+31642005580" 
                  className="transition-colors"
                  style={{ color: '#808080' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#808080'}
                >
                  +31 6 42 00 55 80
                </a>
              </p>
              <p className="text-gray-600">
                <a 
                  href="mailto:joris@treen.nu" 
                  className="underline transition-colors"
                  style={{ color: '#808080' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#808080'}
                >
                  joris@treen.nu
                </a>
              </p>
              <p className="text-gray-600">Wijk bij Duurstede</p>
            </div>
            <a 
              href="https://nl.linkedin.com/in/jorisvandenhout" 
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors"
              style={{ color: '#1a1a1a' }}
              onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a1a'}
            >
              LinkedIn
            </a>
          </div>
        </div>
        </div>
      </section>

      {/* Floating Collage Section */}
      <section
        ref={collageSectionRef}
        className="w-full float-collage"
        style={{
          scrollSnapAlign: 'start',
          scrollSnapStop: 'always',
          marginTop: '-100px',
          paddingBottom: '100px',
          height: `${collageHeightVh}vh`,
        }}
        aria-label="Driftende foto-collage"
      >
        {collageImages.map((img, idx) => (
          <div
            key={`float-${img.src}-${idx}`}
            className="float-item"
            style={
              {
                '--size': `${img.size}px`,
                '--top': img.top,
              } as CSSProperties
            }
            ref={(el) => {
              collageItemRefs.current[idx] = el;
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.size}
              height={Math.round(img.size * 0.7)}
              className="float-media"
              loading="lazy"
              sizes="(max-width: 768px) 60vw, 420px"
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
        ))}
      </section>

      {/* Contact Form */}
      <section
        id="contact-form"
        className="contact-section contact-form-section w-full flex items-center justify-center"
        style={{ 
        minHeight: '100vh', 
        scrollSnapAlign: 'start',
        scrollSnapStop: 'always',
        display: 'flex',
        alignItems: 'center',
        marginTop: '-100px'
      }}
      >
        <div className="w-full px-6 md:px-12" style={{ maxWidth: '979px', position: 'relative', zIndex: 1 }}>
        <h2 className="contact-title font-bold text-gray-900 text-left" style={{ fontWeight: 700, fontSize: '70px', lineHeight: '1.1em', marginBottom: '100px' }}>Neem contact op</h2>
        <form
          className="text-left contact-form"
          style={{ color: '#808080', lineHeight: '1.6em' }}
          onSubmit={handleContactSubmit}
          noValidate
        >
          <div className="contact-grid grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                style={{ 
                  color: '#808080', 
                  border: '1px solid #e5e5e5',
                  transition: 'border-color 0.3s',
                  padding: '16px 20px'
                }}
                onFocus={(e) => e.target.style.borderColor = accentColor}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                placeholder="Voornaam"
              />
            </div>
            <div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                style={{ 
                  color: '#808080', 
                  border: '1px solid #e5e5e5',
                  transition: 'border-color 0.3s',
                  padding: '16px 20px'
                }}
                onFocus={(e) => e.target.style.borderColor = accentColor}
                onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                placeholder="Achternaam"
              />
            </div>
          </div>
          <div style={{ marginTop: '32px' }}>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
              style={{ 
                color: '#808080', 
                border: '1px solid #e5e5e5',
                transition: 'border-color 0.3s',
                padding: '16px 20px'
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              placeholder="E-mail"
            />
          </div>
          <div style={{ marginTop: '32px' }}>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
              style={{ 
                color: '#808080', 
                border: '1px solid #e5e5e5',
                transition: 'border-color 0.3s',
                padding: '16px 20px'
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              placeholder="Telefoon"
            />
          </div>
          <div style={{ marginTop: '32px' }}>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none resize-none"
              style={{ 
                color: '#808080', 
                border: '1px solid #e5e5e5',
                transition: 'border-color 0.3s',
                padding: '16px 20px'
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
              placeholder="Bericht"
            ></textarea>
          </div>
          <button
            type="submit"
            className="contact-submit bg-gray-900 text-white font-semibold transition-colors disabled:opacity-60"
            style={{ borderRadius: '50px', marginTop: '48px', padding: '20px 60px' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Versturen…' : 'Verstuur'}
          </button>
          {formStatus.message && (
            <p
              className="mt-6 text-sm"
              style={{
                color:
                  formStatus.state === 'error'
                    ? '#dc2626'
                    : formStatus.state === 'success'
                      ? '#16a34a'
                      : '#808080',
              }}
              aria-live="polite"
            >
              {formStatus.message}
            </p>
          )}
        </form>
        </div>
      </section>

      {/* Footer */}
      <div className="site-footer w-full px-6 md:px-12 py-16 border-t border-gray-200 flex justify-center" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '979px', width: '100%' }}>
          <div className="text-gray-500 text-sm flex justify-between items-center">
          <p>© 2025 TREEN. All Rights Reserved.</p>
          <p>KVK: 76870111 | BTW-ID NL003118400B65</p>
        </div>
        </div>
      </div>
    </main>
  );
}
