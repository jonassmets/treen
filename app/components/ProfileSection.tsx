'use client';

import Image from 'next/image';

type ProfileSectionProps = {
    accentColor: string;
};

export function ProfileSection({ accentColor }: ProfileSectionProps) {
    return (
        <section
            id="contact-details"
            className="profile-section contact-details-section w-full flex items-center justify-center"
            style={{
                minHeight: 'min(100vh, 900px)',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                display: 'flex',
                alignItems: 'center',
                padding: 'clamp(44px, 10vh, 140px) 0'
            }}
        >
            <div className="w-full px-6 md:px-12" style={{ maxWidth: '979px' }}>
                <div className="profile-stack flex flex-col md:flex-row gap-16 items-start text-left">
                    <div className="profile-photo-wrapper">
                        <Image
                            src="/profile.jpg"
                            alt="Joris van den Hout"
                            width={480}
                            height={600}
                            className="rounded-lg"
                            style={{
                                borderRadius: 'calc(var(--sizeRd, var(--rd, 5px)) - var(--sizeBrw, var(--brw, 2px)))',
                                '--rd': '14px', /* Defining vars to ensure it works nicely */
                                '--brw': '2px'
                            } as React.CSSProperties}
                        />
                    </div>
                    <div className="flex-1 text-left">
                        <h2 style={{
                            fontSize: '29px',
                            lineHeight: '1.3em',
                            fontWeight: 400,
                            color: '#1a1a1a',
                            marginBottom: '16px'
                        }}>Joris van den Hout</h2>
                        <p style={{
                            fontSize: '20px',
                            lineHeight: '32px',
                            color: '#4d4d4d',
                            marginBottom: '32px'
                        }}>
                            Trainer - Facilitator - Adviseur
                        </p>
                        <div className="space-y-2 mb-8">
                            <p style={{ fontSize: '20px', lineHeight: '32px', color: '#4d4d4d' }}>
                                <a
                                    href="tel:+31642005580"
                                    className="transition-colors"
                                    style={{ color: '#4d4d4d' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#4d4d4d'}
                                >
                                    +31 6 42 00 55 80
                                </a>
                            </p>
                            <p style={{ fontSize: '20px', lineHeight: '32px', color: '#4d4d4d' }}>
                                <a
                                    href="mailto:joris@treen.nu"
                                    className="underline transition-colors"
                                    style={{ color: '#4d4d4d' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#4d4d4d'}
                                >
                                    joris@treen.nu
                                </a>
                            </p>
                        </div>
                        <a
                            href="https://nl.linkedin.com/in/jorisvandenhout"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline transition-colors"
                            style={{
                                fontSize: '20px',
                                lineHeight: '32px',
                                color: '#1a1a1a'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = accentColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a1a'}
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
