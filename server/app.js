import express from 'express';
import { prisma } from './prisma.js';
import { createOrder, getDashboardOverview, getOrder, listMenu, listOrders, setOrderStatus } from './services.js';
import { createRazorpayPaymentLinkForOrder } from './razorpayPaymentLink.js';

function toSafeErrorMessage(error, fallback) {
  const msg = String(error?.message || '');
  if (msg.includes('prisma.') || msg.includes("Can't reach database server") || msg.includes('Invalid `prisma.')) {
    return fallback;
  }
  return msg || fallback;
}

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

  app.get('/api/dashboard', async (_req, res) => {
    const payload = await getDashboardOverview(prisma);
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
      const status = e?.statusCode || 500;
      const fallback =
        status >= 500
          ? 'Order service is temporarily unavailable. Please try again in a moment.'
          : 'Could not place order';
      res.status(status).json({ error: toSafeErrorMessage(e, fallback) });
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
      const fallback = 'Payment link service is temporarily unavailable. Please try again shortly.';
      res.status(e?.statusCode || 500).json({
        error: toSafeErrorMessage(e, fallback),
        ...(e?.details ? { details: e.details } : {}),
      });
    }
  });

  app.post('/api/payments/mock-success', async (req, res) => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: 'orderId required' });

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'Paid',
          status: 'Preparing',
          statusTimeline: [
            ...(Array.isArray(order.statusTimeline) ? order.statusTimeline : []),
            {
              status: 'Paid',
              label: 'Payment Successful',
              note: 'Payment confirmed via mock success simulator.',
              changedAt: new Date().toISOString(),
            },
            {
              status: 'Preparing',
              label: 'Preparing',
              note: 'Kitchen is now preparing your order.',
              changedAt: new Date().toISOString(),
            },
          ],
        },
      });

      res.json({ ok: true, order: { id: updated.id, status: updated.status, paymentStatus: updated.paymentStatus } });
    } catch (e) {
      res.status(500).json({ error: e?.message || 'Error' });
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
