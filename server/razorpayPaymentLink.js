import { prisma as defaultPrisma } from './prisma.js';

function requiredEnv(name) {
  const val = process.env[name];
  if (!val) {
    const err = new Error(`Missing ${name}`);
    err.statusCode = 500;
    throw err;
  }
  return val;
}

function toDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

export async function createRazorpayPaymentLinkForOrder({
  orderId,
  phone,
  prisma = defaultPrisma,
}) {
  const keyId = requiredEnv('RAZORPAY_KEY_ID');
  const keySecret = requiredEnv('RAZORPAY_KEY_SECRET');

  const cleanPhone = toDigits(phone);
  if (cleanPhone.length !== 10) {
    const err = new Error('Phone must be 10 digits');
    err.statusCode = 400;
    throw err;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const amountPaise = Math.round(order.totalRupees * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    const err = new Error('Invalid amount');
    err.statusCode = 400;
    throw err;
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const payload = {
    amount: amountPaise,
    currency: 'INR',
    reference_id: order.id,
    description: `Jhunu's Kitchen - Order ${order.id}`,
    customer: {
      name: order.customerName || 'Customer',
      contact: cleanPhone,
    },
    notify: { sms: true },
    reminder_enable: false,
    notes: { order_id: order.id },
  };

  const rpRes = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const rpText = await rpRes.text();
  let rpJson = null;
  try {
    rpJson = JSON.parse(rpText);
  } catch {
    rpJson = null;
  }

  if (!rpRes.ok) {
    const err = new Error('Failed to create payment link');
    err.statusCode = 502;
    err.details = rpJson || rpText;
    throw err;
  }

  const paymentLinkId = rpJson?.id || null;
  const paymentLinkUrl = rpJson?.short_url || rpJson?.shortUrl || rpJson?.url || null;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      customerPhone: order.customerPhone || cleanPhone,
      paymentLinkId,
      paymentLinkUrl,
    },
  });

  return {
    ok: true,
    paymentLink: {
      id: paymentLinkId,
      url: paymentLinkUrl,
    },
  };
}

