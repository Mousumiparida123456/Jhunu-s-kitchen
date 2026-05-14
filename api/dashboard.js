import { prisma } from '../server/prisma.js';
import { sendJson } from '../server/http.js';
import { getDashboardOverview } from '../server/services.js';

export default async function handler(_req, res) {
  try {
    const payload = await getDashboardOverview(prisma);
    return sendJson(res, 200, payload);
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
  }
}
