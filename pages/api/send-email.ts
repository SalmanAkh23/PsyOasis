import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail, buildBookingConfirmationEmail, buildBookingReminderEmail } from '../../lib/email';

type SendEmailBody = {
  type: 'booking-confirmation' | 'booking-reminder';
  to: string;
  data: Record<string, string>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, to, data } = req.body as SendEmailBody;

    if (!to) {
      return res.status(400).json({ error: 'Missing recipient email' });
    }

    let payload: { subject: string; html: string };

    switch (type) {
      case 'booking-confirmation':
        payload = buildBookingConfirmationEmail({
          patientName: data.patientName || '',
          psychologistName: data.psychologistName || '',
          date: data.date || '',
          time: data.time || '',
          mode: data.mode || '',
        });
        break;
      case 'booking-reminder':
        payload = buildBookingReminderEmail({
          patientName: data.patientName || '',
          psychologistName: data.psychologistName || '',
          date: data.date || '',
          time: data.time || '',
        });
        break;
      default:
        return res.status(400).json({ error: 'Unknown email type' });
    }

    await sendEmail({ to, subject: payload.subject, html: payload.html });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('send-email error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
