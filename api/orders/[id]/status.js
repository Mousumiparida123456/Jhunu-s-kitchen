import { prisma } from '../../../server/prisma.js';
import { readJsonBody, sendJson } from '../../../server/http.js';
import { setOrderStatus } from '../../../server/services.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'PATCH') return sendJson(res, 405, { error: 'Method Not Allowed' });

    const id = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
    if (!id) return sendJson(res, 400, { error: 'Missing id' });

    const body = await readJsonBody(req);
    try {
      const payload = await setOrderStatus(prisma, String(id), body?.status);
      return sendJson(res, 200, payload);
    } catch (e) {
      return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
    }
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
  }
}
