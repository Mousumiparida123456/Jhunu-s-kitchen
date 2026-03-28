import { prisma } from '../../server/prisma.js';
import { sendJson } from '../../server/http.js';
import { getOrder } from '../../server/services.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });

  const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  if (!id) return sendJson(res, 400, { error: 'Missing id' });

  const payload = await getOrder(prisma, String(id));
  if (!payload) return sendJson(res, 404, { error: 'Order not found' });
  return sendJson(res, 200, payload);
}

