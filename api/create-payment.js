import Razorpay from 'razorpay';
import { readJsonBody, sendJson } from '../server/http.js';

function toDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Only POST allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const amount = Number(body?.amount);
    const phone = toDigits(body?.phone);

    if (!Number.isFinite(amount) || amount <= 0) return sendJson(res, 400, { error: 'Invalid amount' });
    if (phone.length !== 10) return sendJson(res, 400, { error: 'Phone must be 10 digits' });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const payment = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      description: 'Test Payment',
      customer: {
        contact: phone,
      },
      notify: {
        sms: true,
        email: false,
      },
    });

    return sendJson(res, 200, {
      success: true,
      link: payment?.short_url,
    });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: 'Error creating payment' });
  }
}
