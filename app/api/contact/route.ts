import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_RECIPIENT = 'joris@treen.nu';
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'TREEN Contact <onboarding@resend.dev>';

type ContactPayload = {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export async function POST(request: Request) {
  const body: ContactPayload = await request.json().catch(() => ({}));
  const firstName = isNonEmptyString(body.firstName) ? body.firstName.trim() : '';
  const lastName = isNonEmptyString(body.lastName) ? body.lastName.trim() : '';
  const email = isNonEmptyString(body.email) ? body.email.trim() : '';
  const phone = isNonEmptyString(body.phone) ? body.phone.trim() : '';
  const message = isNonEmptyString(body.message) ? body.message.trim() : '';

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json(
      {
        error: 'Voornaam, achternaam, e-mail en bericht zijn verplicht.',
      },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Contact form submission cannot be sent.');
    return NextResponse.json(
      {
        error:
          'E-mailservice is niet geconfigureerd. Voeg RESEND_API_KEY toe aan je .env.local en start de server opnieuw.',
      },
      { status: 500 }
    );
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn('RESEND_FROM_EMAIL is not configured. Contact form submission cannot be sent.');
    return NextResponse.json(
      {
        error:
          'Afzenderadres ontbreekt. Voeg RESEND_FROM_EMAIL toe aan je .env.local (bijv. "TREEN <noreply@treen.nu>").',
      },
      { status: 500 }
    );
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `Nieuw bericht van ${firstName} ${lastName}`,
      text: `Naam: ${firstName} ${lastName}\nE-mail: ${email}\nTelefoon: ${phone || 'Niet opgegeven'}\n\nBericht:\n${message}`,
      html: `
        <h2>Nieuw bericht via treen.nu</h2>
        <p><strong>Naam:</strong> ${firstName} ${lastName}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefoon:</strong> ${phone || 'Niet opgegeven'}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send contact form submission', error);
    return NextResponse.json(
      {
        error: 'Het versturen van het bericht is mislukt. Probeer het later opnieuw.',
      },
      { status: 500 }
    );
  }
}
