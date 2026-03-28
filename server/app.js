import express from 'express';
import { prisma } from './prisma.js';
import { createOrder, getOrder, listMenu, listOrders, setOrderStatus } from './services.js';

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

  return app;
}

