import { prisma } from '../../server/prisma.js';
import { readJsonBody, sendJson } from '../../server/http.js';
import { createOrder, listOrders } from '../../server/services.js';

function toSafeErrorMessage(error, fallback) {
  const msg = String(error?.message || '');
  if (msg.includes('prisma.') || msg.includes("Can't reach database server") || msg.includes('Invalid `prisma.')) {
    return fallback;
  }
  return msg || fallback;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const payload = await listOrders(prisma);
      return sendJson(res, 200, payload);
    }

    if (req.method === 'POST') {
      const body = await readJsonBody(req);
      try {
        const payload = await createOrder(prisma, body);
        return sendJson(res, 201, payload);
      } catch (e) {
        const status = e?.statusCode || 500;
        const fallback =
          status >= 500
            ? 'Order service is temporarily unavailable. Please try again in a moment.'
            : 'Could not place order';
        return sendJson(res, status, { error: toSafeErrorMessage(e, fallback) });
      }
    }

    return sendJson(res, 405, { error: 'Method Not Allowed' });
  } catch (e) {
    const status = e?.statusCode || 500;
    const fallback =
      status >= 500
        ? 'Order service is temporarily unavailable. Please try again in a moment.'
        : 'Request failed';
    return sendJson(res, status, { error: toSafeErrorMessage(e, fallback) });
  }
}
