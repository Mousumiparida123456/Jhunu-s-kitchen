import { prisma } from '../server/prisma.js';
import { sendJson } from '../server/http.js';
import { listMenu } from '../server/services.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });
    const payload = await listMenu(prisma);
    return sendJson(res, 200, payload);
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
  }
}
