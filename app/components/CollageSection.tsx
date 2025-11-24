'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

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

export function CollageSection() {
    const [imageFiles, setImageFiles] = useState<string[]>([]);
    const collageSectionRef = useRef<HTMLElement | null>(null);
    const collageItemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const scrollFrameRef = useRef<number | null>(null);
    const mobileDriftFrameRef = useRef<number | null>(null);

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

    return (
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
    );
}
