import express from 'express';
import { prisma } from './prisma.js';
import { createOrder, getOrder, listMenu, listOrders, setOrderStatus } from './services.js';
import { createRazorpayPaymentLinkForOrder } from './razorpayPaymentLink.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.get('/api/menu', async (_req, res) => {
    const payload = await listMenu(prisma);
    res.json(payload);
  });

  app.get('/api/orders', async (_req, res) => {
    const payload = await listOrders(prisma);
    res.json(payload);
  });

  app.get('/api/orders/:id', async (req, res) => {
    const payload = await getOrder(prisma, req.params.id);
    if (!payload) return res.status(404).json({ error: 'Order not found' });
    res.json(payload);
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const payload = await createOrder(prisma, req.body);
      res.status(201).json(payload);
    } catch (e) {
      res.status(e?.statusCode || 500).json({ error: e?.message || 'Error' });
    }
  });

  app.patch('/api/orders/:id/status', async (req, res) => {
    try {
      const payload = await setOrderStatus(prisma, req.params.id, req.body?.status);
      res.json(payload);
    } catch (e) {
      res.status(e?.statusCode || 500).json({ error: e?.message || 'Error' });
    }
  });

  app.post('/api/payments/create', async (req, res) => {
    try {
      const payload = await createRazorpayPaymentLinkForOrder({
        orderId: req.body?.orderId,
        phone: req.body?.phone,
        prisma,
      });
      res.json(payload);
    } catch (e) {
      res.status(e?.statusCode || 500).json({
        error: e?.message || 'Error',
        ...(e?.details ? { details: e.details } : {}),
      });
    }
  });

  // Ensure async route errors return JSON for API callers.
  // Express 5 forwards rejected promises to this middleware automatically.
  app.use((err, req, res, next) => {
    if (!req.path?.startsWith('/api/')) return next(err);

    const statusCode = Number(err?.statusCode) || 500;
    const message = typeof err?.message === 'string' && err.message.trim() ? err.message : 'Internal Server Error';
    res.status(statusCode).json({ error: message });
  });

  return app;
}
