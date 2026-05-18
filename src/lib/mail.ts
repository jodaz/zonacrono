import { Resend } from 'resend';
import { env } from './env';
import { RegistrationReceivedEmail } from '@/components/emails/RegistrationReceived';
import { ReservationConfirmedEmail } from '@/components/emails/ReservationConfirmed';
import { PaymentReportedEmail } from '@/components/emails/PaymentReported';
import { PaymentRejectedEmail } from '@/components/emails/PaymentRejected';
import { RegistrationApprovedEmail } from '@/components/emails/RegistrationApproved';
import { PaymentReportedOrganizerEmail } from '@/components/emails/PaymentReportedOrganizer';


let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS = 'Zonacrono <notificaciones@zonacrono.com>';

interface AthleteInfo {
  email: string;
  firstName: string;
  lastName: string;
}

interface EventInfo {
  name: string;
  slug: string;
}

/**
 * Flow 1: Registration + payment received together
 */
export async function sendRegistrationReceivedEmail(
  athlete: AthleteInfo,
  event: EventInfo,
  registrationId: string
) {
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/status/${registrationId}`;

  console.log(`[Mail] Attempting to send RegistrationReceived email to: ${athlete.email}`);
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: athlete.email,
    subject: `✅ Inscripción recibida — ${event.name}`,
    react: RegistrationReceivedEmail({
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      statusUrl,
    }),
  });
 
  if (error) {
    console.error('[Mail] Resend error (RegistrationReceived):', error);
  } else {
    console.log('[Mail] Resend success (RegistrationReceived)');
  }

  return { error };
}

/**
 * Flow 2: Registration without immediate payment (reservation)
 */
export async function sendReservationConfirmedEmail(
  athlete: AthleteInfo,
  event: EventInfo,
  registrationId: string
) {
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/status/${registrationId}`;
  console.log(`[Mail] Attempting to send ReservationConfirmed email to: ${athlete.email}`);

  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: athlete.email,
    subject: `⏳ Reserva confirmada — ${event.name}`,
    react: ReservationConfirmedEmail({
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      statusUrl,
    }),
  });

  if (error) {
    console.error('[Mail] Resend error:', error);
  } else {
    console.log('[Mail] Resend success');
  }

  return { error };
}

/**
 * Flow 2 (Report): Payment reported after reservation
 */
export async function sendPaymentReportedEmail(
  athlete: AthleteInfo,
  event: EventInfo,
  registrationId: string
) {
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/status/${registrationId}`;

  console.log(`[Mail] Attempting to send PaymentReported email to: ${athlete.email}`);
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: athlete.email,
    subject: `📄 Pago reportado — ${event.name}`,
    react: PaymentReportedEmail({
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      statusUrl,
    }),
  });
 
  if (error) {
    console.error('[Mail] Resend error (PaymentReported):', error);
  } else {
    console.log('[Mail] Resend success (PaymentReported)');
  }

  return { error };
}

/**
 * Flow (Status Change): Payment rejected by admin
 */
export async function sendPaymentRejectedEmail(
  athlete: AthleteInfo,
  event: EventInfo,
  registrationId: string,
  reason?: string
) {
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/status/${registrationId}`;

  console.log(`[Mail] Attempting to send PaymentRejected email to: ${athlete.email}`);
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: athlete.email,
    subject: `❌ Pago no aprobado — ${event.name}`,
    react: PaymentRejectedEmail({
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      statusUrl,
      reason,
    }),
  });

  if (error) {
    console.error('[Mail] Resend error (PaymentRejected):', error);
  } else {
    console.log('[Mail] Resend success (PaymentRejected)');
  }

  return { error };
}

/**
 * Flow (Status Change): Registration approved by admin
 */
export async function sendRegistrationApprovedEmail(
  athlete: AthleteInfo,
  event: EventInfo,
  registrationId: string
) {
  const statusUrl = `${env.NEXT_PUBLIC_APP_URL}/status/${registrationId}`;

  console.log(`[Mail] Attempting to send RegistrationApproved email to: ${athlete.email}`);
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: athlete.email,
    subject: `🏁 Inscripción aprobada — ${event.name}`,
    react: RegistrationApprovedEmail({
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      statusUrl,
    }),
  });

  if (error) {
    console.error('[Mail] Resend error (RegistrationApproved):', error);
  } else {
    console.log('[Mail] Resend success (RegistrationApproved)');
  }

  return { error };
}

/**
 * Flow (Report): Payment reported notification for organizer
 */
export async function sendPaymentReportedOrganizerEmail(
  organizer: { name: string; email: string },
  athlete: AthleteInfo,
  event: EventInfo,
  payment: {
    amountUsd?: number;
    amountVes?: number;
    referenceNumber: string;
  }
) {
  const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/payments`;

  console.log(`[Mail] Attempting to send PaymentReportedOrganizer email to: ${organizer.email}`);
  const { error } = await getResend().emails.send({
    from: FROM_ADDRESS,
    to: organizer.email,
    subject: `💰 Nuevo pago reportado — ${event.name}`,
    react: PaymentReportedOrganizerEmail({
      organizerName: organizer.name,
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      eventName: event.name,
      amountUsd: payment.amountUsd,
      amountVes: payment.amountVes,
      referenceNumber: payment.referenceNumber,
      dashboardUrl,
    }),
  });

  if (error) {
    console.error('[Mail] Resend error (PaymentReportedOrganizer):', error);
  } else {
    console.log('[Mail] Resend success (PaymentReportedOrganizer)');
  }

  return { error };
}
