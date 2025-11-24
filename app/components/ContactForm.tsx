'use client';

import { useState, type FormEvent } from 'react';

type ContactFormProps = {
    accentColor: string;
};

export function ContactForm({ accentColor }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState<{ state: 'idle' | 'success' | 'error'; message: string }>(
        {
            state: 'idle',
            message: '',
        }
    );

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

    return (
        <section
            id="contact-form"
            className="contact-section contact-form-section w-full flex items-center justify-center"
            style={{
                minHeight: '100vh',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <div className="w-full px-6 md:px-12" style={{ maxWidth: '979px', position: 'relative', zIndex: 1 }}>
                <h2 className="contact-title font-bold text-gray-900 text-left" style={{ fontWeight: 700 }}>Neem contact op</h2>
                <form
                    className="text-left contact-form"
                    style={{ color: '#808080', lineHeight: '1.6em' }}
                    onSubmit={handleContactSubmit}
                    noValidate
                >
                    <div className="contact-grid grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
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
                        style={{ borderRadius: '50px', marginTop: '36px', padding: '18px 48px' }}
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
    );
}
