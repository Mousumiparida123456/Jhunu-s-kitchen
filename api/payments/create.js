import { readJsonBody, sendJson } from '../../server/http.js';
import { createRazorpayPaymentLinkForOrder } from '../../server/razorpayPaymentLink.js';

function toSafePaymentError(error) {
  const msg = String(error?.message || '');
  if (msg.includes('prisma.') || msg.includes("Can't reach database server") || msg.includes('Invalid `prisma.')) {
    return 'Payment link service is temporarily unavailable. Please try again shortly.';
  }
  return msg || 'Payment link generation failed';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method Not Allowed' });

  try {
    const body = await readJsonBody(req);
    const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
    const phone = body?.phone;

    if (!orderId) return sendJson(res, 400, { error: 'Missing orderId' });
    const payload = await createRazorpayPaymentLinkForOrder({ orderId, phone });
    return sendJson(res, 200, payload);
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, {
      error: toSafePaymentError(e),
      ...(e?.details ? { details: e.details } : {}),
    });
  }
}
