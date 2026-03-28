import { sendJson } from '../server/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });
  return sendJson(res, 200, { ok: true });
}

