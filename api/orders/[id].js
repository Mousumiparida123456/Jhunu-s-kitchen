import { prisma } from '../../server/prisma.js';
import { sendJson } from '../../server/http.js';
import { getOrder } from '../../server/services.js';

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

function buildMockTrackPayload(orderId) {
  const eta = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  return {
    order: {
      id: orderId,
      customerName: 'Customer',
      customerPhone: '',
      deliveryAddress: 'Address from latest order',
      specialInstructions: '',
      status: 'Pending',
      paymentMethod: 'upi',
      paymentStatus: 'PaymentLinkGenerated',
      subtotal: 0,
      discount: 0,
      deliveryCharge: 0,
      total: 0,
      items: [{ name: 'Your selected meals', quantity: 1, priceRupees: 0 }],
      estimatedDeliveryAt: eta,
      estimatedDeliveryLabel: '25-30 min',
      timeline: [
        {
          status: 'Pending',
          label: 'Order Received',
          note: 'Order is accepted in dummy tracking mode.',
          changedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
    mock: true,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });

    const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
    if (!id) return sendJson(res, 400, { error: 'Missing id' });

    try {
      const payload = await getOrder(prisma, String(id));
      if (!payload) return sendJson(res, 404, { error: 'Order not found' });
      return sendJson(res, 200, payload);
    } catch (e) {
      if (isDbUnavailableError(e)) {
        return sendJson(res, 200, buildMockTrackPayload(String(id)));
      }
      return sendJson(res, e?.statusCode || 500, { error: 'Tracking service is temporarily unavailable. Please try again shortly.' });
    }
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, { error: 'Tracking service is temporarily unavailable. Please try again shortly.' });
  }
}
