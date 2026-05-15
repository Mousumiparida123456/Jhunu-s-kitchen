import { OrderStatus } from '@prisma/client';
import { generateOrderId } from './orderId.js';
import { fallbackMenuItems } from './menuSeedData.js';
import { fromUiStatus, toUiStatus } from './status.js';

const PAYMENT_METHODS = new Set(['upi', 'cod']);
const STATUS_SEQUENCE = [OrderStatus.Pending, OrderStatus.Preparing, OrderStatus.OutForDelivery, OrderStatus.Delivered];

function createHttpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isDbUnavailableError(error) {
  const msg = String(error?.message || '');
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('Unable to open the database file') ||
    msg.includes('Error code 14') ||
    msg.includes('Invalid `prisma.') ||
    msg.includes('P1001')
  );
}

function trimOrNull(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function buildStatusEvent(status, note) {
  return {
    status,
    label: toUiStatus(status),
    note,
    changedAt: new Date().toISOString(),
  };
}

function estimateDeliveryIso(status, createdAt) {
  if (status === OrderStatus.Delivered) return null;
  const base = createdAt instanceof Date ? createdAt : new Date(createdAt || Date.now());
  return new Date(base.getTime() + 35 * 60 * 1000).toISOString();
}

function formatEta(isoString) {
  if (!isoString) return 'Delivered';

  const etaTime = new Date(isoString).getTime();
  if (!Number.isFinite(etaTime)) return '25-30 min';

  const minutesLeft = Math.round((etaTime - Date.now()) / 60000);
  if (minutesLeft <= 0) return 'Arriving shortly';
  if (minutesLeft <= 5) return 'Less than 5 min';
  return `${minutesLeft} min`;
}

function toDashboardOrder(order) {
  return {
    id: order.id,
    customer: order.customerName ?? 'Customer',
    customerPhone: order.customerPhone ?? '',
    address: order.deliveryAddress ?? '',
    items: order.items.map((item) => `${item.quantity}x ${item.name}`).join(', '),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    total: order.totalRupees,
    status: toUiStatus(order.status),
    paymentMethod: order.paymentMethod ?? 'unknown',
    paymentStatus: order.paymentStatus,
    time: order.createdAt.toISOString(),
    instructions: order.specialInstructions,
    estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
  };
}

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
    orders: orders.map(toDashboardOrder),
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
      customerName: order.customerName ?? 'Customer',
      customerPhone: order.customerPhone ?? '',
      deliveryAddress: order.deliveryAddress ?? '',
      specialInstructions: order.specialInstructions ?? '',
      status: toUiStatus(order.status),
      paymentMethod: order.paymentMethod ?? 'unknown',
      paymentStatus: order.paymentStatus,
      subtotal: order.subtotalRupees,
      discount: order.discountRupees,
      deliveryCharge: order.deliveryChargeRupees,
      total: order.totalRupees,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        priceRupees: i.priceRupees,
      })),
      estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
      estimatedDeliveryLabel: formatEta(order.estimatedDeliveryAt?.toISOString() ?? null),
      timeline: Array.isArray(order.statusTimeline) ? order.statusTimeline : [],
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
    customerName: trimOrNull(payload?.customerName),
    customerPhone: normalizePhone(payload?.customerPhone),
    deliveryAddress: trimOrNull(payload?.deliveryAddress),
    specialInstructions: trimOrNull(payload?.specialInstructions),
    paymentMethod: trimOrNull(payload?.paymentMethod)?.toLowerCase() ?? null,
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

async function hydrateOrderItems(prisma, items) {
  const ids = items.map((item) => item.menuItemId).filter(Boolean);
  const names = items.map((item) => item.name.toLowerCase()).filter(Boolean);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      OR: [
        ...(ids.length > 0 ? [{ id: { in: ids } }] : []),
        ...(names.length > 0 ? [{ name: { in: items.map((item) => item.name) } }] : []),
      ],
    },
  });
  const menuById = new Map(menuItems.map((item) => [item.id, item]));
  const menuByName = new Map(menuItems.map((item) => [item.name.toLowerCase(), item]));

  return items.map((item) => {
    const matched = item.menuItemId
      ? menuById.get(item.menuItemId)
      : menuByName.get(item.name.toLowerCase());

    if (!matched) {
      throw createHttpError(400, `Menu item "${item.name}" is not available`);
    }

    return {
      menuItemId: matched.id,
      name: matched.name,
      priceRupees: matched.priceRupees,
      quantity: item.quantity,
    };
  });
}

function validateOrderPayload(normalized) {
  if (normalized.items.length === 0) {
    throw createHttpError(400, 'Add at least one item to place an order');
  }
  if (!normalized.customerName || normalized.customerName.length < 2) {
    throw createHttpError(400, 'Customer name must be at least 2 characters');
  }
  if (normalized.customerPhone.length !== 10) {
    throw createHttpError(400, 'Phone number must be 10 digits');
  }
  if (!normalized.deliveryAddress || normalized.deliveryAddress.length < 10) {
    throw createHttpError(400, 'Delivery address is too short');
  }
  if (!normalized.paymentMethod || !PAYMENT_METHODS.has(normalized.paymentMethod)) {
    throw createHttpError(400, 'Select a valid payment method');
  }
  if (normalized.specialInstructions && normalized.specialInstructions.length > 280) {
    throw createHttpError(400, 'Special instructions must stay under 280 characters');
  }
}

export async function createOrder(prisma, payload) {
  const normalized = normalizeOrderPayload(payload);
  validateOrderPayload(normalized);
  let hydratedItems = [];
  const isMockPayment = process.env.MOCK_PAYMENT === 'true';
  try {
    hydratedItems = await hydrateOrderItems(prisma, normalized.items);
  } catch (error) {
    if (!isMockPayment || !isDbUnavailableError(error)) throw error;
    hydratedItems = normalized.items.map((item) => ({
      menuItemId: item.menuItemId,
      name: item.name,
      priceRupees: Math.max(0, Math.round(item.priceRupees || 0)),
      quantity: Math.max(1, Math.round(item.quantity || 1)),
    }));
  }

  const totals = computeTotals(hydratedItems);

  let id = null;
  if (isMockPayment) {
    id = generateOrderId();
  } else {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateOrderId();
      const exists = await prisma.order.findUnique({ where: { id: candidate } });
      if (!exists) {
        id = candidate;
        break;
      }
    }
  }
  if (!id) {
    const err = new Error('Failed to generate order id');
    err.statusCode = 500;
    throw err;
  }

  try {
    const order = await prisma.order.create({
      data: {
        id,
        customerName: normalized.customerName,
        customerPhone: normalized.customerPhone,
        deliveryAddress: normalized.deliveryAddress,
        specialInstructions: normalized.specialInstructions,
        paymentMethod: normalized.paymentMethod,
        paymentStatus: normalized.paymentMethod === 'cod' ? 'CashOnDelivery' : 'Pending',
        status: OrderStatus.Pending,
        statusTimeline: [buildStatusEvent(OrderStatus.Pending, 'Order placed successfully')],
        estimatedDeliveryAt: estimateDeliveryIso(OrderStatus.Pending),
        ...totals,
        items: {
          create: hydratedItems.map((i) => ({
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
        paymentStatus: order.paymentStatus,
        estimatedDeliveryAt: order.estimatedDeliveryAt?.toISOString() ?? null,
      },
    };
  } catch (error) {
    if (!isMockPayment || !isDbUnavailableError(error)) throw error;
    return {
      order: {
        id,
        status: 'Pending',
        total: totals.totalRupees,
        paymentStatus: normalized.paymentMethod === 'cod' ? 'CashOnDelivery' : 'Pending',
        estimatedDeliveryAt: estimateDeliveryIso(OrderStatus.Pending),
      },
      mock: true,
    };
  }
}

export async function setOrderStatus(prisma, id, uiStatus) {
  const status = fromUiStatus(uiStatus);
  if (!status) {
    throw createHttpError(400, 'Invalid status');
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw createHttpError(404, 'Order not found');
  }

  const currentIndex = STATUS_SEQUENCE.indexOf(existing.status);
  const nextIndex = STATUS_SEQUENCE.indexOf(status);
  if (nextIndex < currentIndex) {
    throw createHttpError(400, 'Status cannot move backwards');
  }

  const previousTimeline = Array.isArray(existing.statusTimeline) ? existing.statusTimeline : [];
  const nextTimeline =
    existing.status === status
      ? previousTimeline
      : [...previousTimeline, buildStatusEvent(status, `Kitchen updated order to ${toUiStatus(status)}`)];

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusTimeline: nextTimeline,
      estimatedDeliveryAt: estimateDeliveryIso(status, existing.createdAt),
    },
  });

  return { order: { id: order.id, status: toUiStatus(order.status) } };
}

export async function getDashboardOverview(prisma) {
  const [orders, menuItems] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 100,
    }),
    prisma.menuItem.count(),
  ]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((order) => order.createdAt >= todayStart);
  const liveOrders = orders.filter((order) => order.status !== OrderStatus.Delivered);
  const revenueToday = todayOrders.reduce((sum, order) => sum + order.totalRupees, 0);
  const avgOrderValue = todayOrders.length > 0 ? Math.round(revenueToday / todayOrders.length) : 0;

  const itemTally = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      itemTally.set(item.name, (itemTally.get(item.name) || 0) + item.quantity);
    }
  }

  const topItems = [...itemTally.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return {
    metrics: {
      totalOrders: orders.length,
      liveOrders: liveOrders.length,
      ordersToday: todayOrders.length,
      revenueToday,
      avgOrderValue,
      menuItems,
    },
    topItems,
    recentOrders: orders.slice(0, 6).map(toDashboardOrder),
  };
}
