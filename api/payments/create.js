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
    const amountRupees = Number(body?.amountRupees);

    if (!orderId) return sendJson(res, 400, { error: 'Missing orderId' });
    const payload = await createRazorpayPaymentLinkForOrder({ orderId, phone, amountRupees });
    return sendJson(res, 200, payload);
  } catch (e) {
    const fallbackOrderId = `MOCK-${Date.now()}`;
    return sendJson(res, 200, {
      ok: true,
      paymentLink: {
        id: `plink_mock_${Math.random().toString(36).substring(2, 9)}`,
        url: `https://rzp.io/i/mock-${fallbackOrderId}`,
        isMock: true,
      },
      warning: toSafePaymentError(e),
    });
  }
}
