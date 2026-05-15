import { prisma } from '../../server/prisma.js';
import { readJsonBody, sendJson } from '../../server/http.js';
import { computeTotals, createOrder, listOrders, normalizeOrderPayload } from '../../server/services.js';
import { generateOrderId } from '../../server/orderId.js';

function toSafeErrorMessage(error, fallback) {
  const msg = String(error?.message || '');
  if (msg.includes('prisma.') || msg.includes("Can't reach database server") || msg.includes('Invalid `prisma.')) {
    return fallback;
  }
  return msg || fallback;
}

function isDbUnavailableError(error) {
  const msg = String(error?.message || '');
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('Unable to open the database file') ||
    msg.includes('Error code 14') ||
    msg.includes('Invalid `prisma.') ||
    msg.includes('P1001')
  );
}

function buildMockOrderFromRequest(body) {
  const normalized = normalizeOrderPayload(body);
  const items = normalized.items.map((item) => ({
    priceRupees: Math.max(0, Math.round(item.priceRupees || 0)),
    quantity: Math.max(1, Math.round(item.quantity || 1)),
  }));
  const totals = computeTotals(items);
  return {
    order: {
      id: generateOrderId(),
      status: 'Pending',
      total: totals.totalRupees,
      paymentStatus: normalized.paymentMethod === 'cod' ? 'CashOnDelivery' : 'Pending',
      estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    },
    mock: true,
  };
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
        if (isDbUnavailableError(e)) {
          return sendJson(res, 201, buildMockOrderFromRequest(body));
        }
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
