import { prisma } from '../../server/prisma.js';
import { readJsonBody, sendJson } from '../../server/http.js';
import { createOrder, listOrders } from '../../server/services.js';

export default async function handler(req, res) {
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
      return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
    }
  }

  return sendJson(res, 405, { error: 'Method Not Allowed' });
}

