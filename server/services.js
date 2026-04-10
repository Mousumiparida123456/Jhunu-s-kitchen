import { OrderStatus } from '@prisma/client';
import { generateOrderId } from './orderId.js';
import { fallbackMenuItems } from './menuSeedData.js';
import { fromUiStatus, toUiStatus } from './status.js';

export async function listMenu(prisma) {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return { items };
  } catch (error) {
    console.error('Failed to load menu from database, serving fallback menu instead.', error);
    return { items: fallbackMenuItems };
  }
}

export async function listOrders(prisma) {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 50,
  });

  return {
    orders: orders.map((o) => ({
      id: o.id,
      customer: o.customerName ?? 'Customer',
      items: o.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      total: o.totalRupees,
      status: toUiStatus(o.status),
      time: o.createdAt.toISOString(),
      instructions: null,
    })),
  };
}

export async function getOrder(prisma, id) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return null;

  return {
    order: {
      id: order.id,
      status: toUiStatus(order.status),
      total: order.totalRupees,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      createdAt: order.createdAt.toISOString(),
    },
  };
}

export function normalizeOrderPayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const cleanItems = items
    .map((i) => ({
      menuItemId: typeof i.menuItemId === 'string' ? i.menuItemId : null,
      name: typeof i.name === 'string' ? i.name.trim() : '',
      priceRupees: Number.isFinite(i.priceRupees) ? i.priceRupees : Number(i.priceRupees),
      quantity: Number.isFinite(i.quantity) ? i.quantity : Number(i.quantity),
    }))
    .filter((i) => i.name && Number.isFinite(i.priceRupees) && i.priceRupees >= 0 && Number.isFinite(i.quantity) && i.quantity > 0);

  return {
    customerName: typeof payload?.customerName === 'string' ? payload.customerName : null,
    customerPhone: typeof payload?.customerPhone === 'string' ? payload.customerPhone : null,
    deliveryAddress: typeof payload?.deliveryAddress === 'string' ? payload.deliveryAddress : null,
    paymentMethod: typeof payload?.paymentMethod === 'string' ? payload.paymentMethod : null,
    items: cleanItems,
  };
}

export function computeTotals(items) {
  const subtotalRupees = items.reduce((acc, i) => acc + i.priceRupees * i.quantity, 0);
  const discountRupees = subtotalRupees >= 500 ? Math.round(subtotalRupees * 0.05) : 0;
  const deliveryChargeRupees = subtotalRupees > 0 && subtotalRupees < 500 ? 40 : 0;
  const totalRupees = Math.round(subtotalRupees - discountRupees + deliveryChargeRupees);

  return { subtotalRupees, discountRupees, deliveryChargeRupees, totalRupees };
}

export async function createOrder(prisma, payload) {
  const normalized = normalizeOrderPayload(payload);
  if (normalized.items.length === 0) {
    const err = new Error('No items');
    err.statusCode = 400;
    throw err;
  }

  const totals = computeTotals(normalized.items);

  let id = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateOrderId();
    const exists = await prisma.order.findUnique({ where: { id: candidate } });
    if (!exists) {
      id = candidate;
      break;
    }
  }
  if (!id) {
    const err = new Error('Failed to generate order id');
    err.statusCode = 500;
    throw err;
  }

  const order = await prisma.order.create({
    data: {
      id,
      customerName: normalized.customerName,
      customerPhone: normalized.customerPhone,
      deliveryAddress: normalized.deliveryAddress,
      paymentMethod: normalized.paymentMethod,
      status: OrderStatus.Pending,
      ...totals,
      items: {
        create: normalized.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          priceRupees: i.priceRupees,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  return {
    order: {
      id: order.id,
      status: toUiStatus(order.status),
      total: order.totalRupees,
    },
  };
}

export async function setOrderStatus(prisma, id, uiStatus) {
  const status = fromUiStatus(uiStatus);
  if (!status) {
    const err = new Error('Invalid status');
    err.statusCode = 400;
    throw err;
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  });

  return { order: { id: order.id, status: toUiStatus(order.status) } };
}
