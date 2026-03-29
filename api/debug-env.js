import { sendJson } from '../server/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });

    return sendJson(res, 200, {
      ok: true,
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
        hasRazorpayKeyId: Boolean(process.env.RAZORPAY_KEY_ID),
        hasRazorpayKeySecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
        vercelEnv: process.env.VERCEL_ENV || null,
        nodeEnv: process.env.NODE_ENV || null,
      },
    });
  } catch (e) {
    return sendJson(res, 500, { error: e?.message || 'Error' });
  }
}

