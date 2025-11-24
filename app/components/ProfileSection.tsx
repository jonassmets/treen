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
                            width={280}
                            height={350}
                            className="rounded-lg"
                        />
                    </div>
                    <div className="flex-1 text-left">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Joris van den Hout</h2>
                        <p className="text-gray-600 mb-8">
                            Trainer - Facilitator - Adviseur
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
    );
}
