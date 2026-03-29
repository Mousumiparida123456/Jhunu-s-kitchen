import { sendJson } from '../server/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method Not Allowed' });
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    return sendJson(res, e?.statusCode || 500, { error: e?.message || 'Error' });
  }
}
