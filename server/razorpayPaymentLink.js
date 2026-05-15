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

function isDbConnectivityError(error) {
  const msg = String(error?.message || '');
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('Connection refused') ||
    msg.includes('Timed out') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('P1001')
  );
}

export async function createRazorpayPaymentLinkForOrder({
  orderId,
  phone,
  prisma = defaultPrisma,
}) {
  const isMock = process.env.MOCK_PAYMENT === 'true';
  const keyId = isMock ? 'mock_key' : requiredEnv('RAZORPAY_KEY_ID');
  const keySecret = isMock ? 'mock_secret' : requiredEnv('RAZORPAY_KEY_SECRET');

  const cleanPhone = toDigits(phone);
  if (cleanPhone.length !== 10) {
    const err = new Error('Phone must be 10 digits');
    err.statusCode = 400;
    throw err;
  }

  let order = null;
  try {
    order = await prisma.order.findUnique({ where: { id: orderId } });
  } catch (error) {
    if (!isMock || !isDbConnectivityError(error)) throw error;
  }

  if (!order && !isMock) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const effectiveOrder = order || {
    id: orderId || `MOCK-${Date.now()}`,
    totalRupees: 1,
    customerName: 'Customer',
    customerPhone: cleanPhone,
  };

  const amountPaise = Math.round(effectiveOrder.totalRupees * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    const err = new Error('Invalid amount');
    err.statusCode = 400;
    throw err;
  }

  let paymentLinkId = null;
  let paymentLinkUrl = null;

  if (isMock) {
    // Return a mock payment link
    paymentLinkId = `plink_mock_${Math.random().toString(36).substring(2, 9)}`;
    paymentLinkUrl = `https://rzp.io/i/mock-${effectiveOrder.id}`;
  } else {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const payload = {
      amount: amountPaise,
      currency: 'INR',
      reference_id: effectiveOrder.id,
      description: `Jhunu's Kitchen - Order ${effectiveOrder.id}`,
      customer: {
        name: effectiveOrder.customerName || 'Customer',
        contact: cleanPhone,
      },
      notify: { sms: true },
      reminder_enable: false,
      notes: { order_id: effectiveOrder.id },
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

    paymentLinkId = rpJson?.id || null;
    paymentLinkUrl = rpJson?.short_url || rpJson?.shortUrl || rpJson?.url || null;
  }

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerPhone: order.customerPhone || cleanPhone,
        paymentStatus: 'PaymentLinkGenerated',
        paymentLinkId,
        paymentLinkUrl,
      },
    });
  }

  return {
    ok: true,
    paymentLink: {
      id: paymentLinkId,
      url: paymentLinkUrl,
      isMock,
    },
  };
}
