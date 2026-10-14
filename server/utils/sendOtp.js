import nodemailer from 'nodemailer';

let transporter = null;

function getMailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendSms(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || !process.env.TWILIO_FROM) return false;

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: process.env.TWILIO_FROM, Body: body }),
  });

  if (!res.ok) throw new Error('Could not send the SMS verification code');
  return true;
}

// Delivers the OTP by email or SMS when a provider is configured.
// Returns the channel used: 'email' | 'sms' | 'console'.
export async function sendOtp({ type, value, code }) {
  const message = `Your Glassify Canteen verification code is ${code}. It expires in 5 minutes.`;

  if (type === 'email') {
    const mailer = getMailer();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: value,
        subject: 'Your Glassify Canteen verification code',
        text: message,
      });
      return 'email';
    }
  } else if (await sendSms(value, message)) {
    return 'sms';
  }

  // No provider configured: log to the server console (development fallback)
  console.log(`[OTP:${type}] ${value} -> ${code}`);
  return 'console';
}
