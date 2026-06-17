import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(payload: EmailPayload) {
  const { error } = await resend.emails.send({
    from: 'PsyOasis <noreply@psyoasis.com>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
  if (error) throw error;
}

export function buildBookingConfirmationEmail(data: {
  patientName: string;
  psychologistName: string;
  date: string;
  time: string;
  mode: string;
}) {
  return {
    subject: `Booking Dikonfirmasi - PsyOasis`,
    html: `
      <h1>Halo ${data.patientName},</h1>
      <p>Sesi konsultasi Anda telah dikonfirmasi:</p>
      <ul>
        <li>Psikolog: ${data.psychologistName}</li>
        <li>Tanggal: ${data.date}</li>
        <li>Waktu: ${data.time} WIB</li>
        <li>Mode: ${data.mode}</li>
      </ul>
      <p>Silakan login ke PsyOasis untuk bergabung ke sesi tepat waktu.</p>
    `,
  };
}

export function buildBookingReminderEmail(data: {
  patientName: string;
  psychologistName: string;
  date: string;
  time: string;
}) {
  return {
    subject: `Pengingat Sesi - PsyOasis`,
    html: `
      <h1>Halo ${data.patientName},</h1>
      <p>Anda memiliki sesi konsultasi dalam 24 jam:</p>
      <ul>
        <li>Psikolog: ${data.psychologistName}</li>
        <li>Tanggal: ${data.date}</li>
        <li>Waktu: ${data.time} WIB</li>
      </ul>
      <p>Jangan lupa untuk bergabung tepat waktu.</p>
    `,
  };
}
