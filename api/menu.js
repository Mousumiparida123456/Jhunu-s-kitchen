import { prisma } from '../server/prisma.js';
import { sendJson } from '../server/http.js';
import { listMenu } from '../server/services.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });
  const payload = await listMenu(prisma);
  return sendJson(res, 200, payload);
}

