import { prisma as defaultPrisma } from './prisma.js';

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
  amountRupees,
  prisma = defaultPrisma,
}) {
  const isMock = process.env.MOCK_PAYMENT === 'true';
  const hasRazorpayKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const shouldAttemptRazorpay = hasRazorpayKeys && toDigits(phone).length === 10;
  const keyId = shouldAttemptRazorpay ? process.env.RAZORPAY_KEY_ID : null;
  const keySecret = shouldAttemptRazorpay ? process.env.RAZORPAY_KEY_SECRET : null;

  const cleanPhone = toDigits(phone);
  const effectivePhone = cleanPhone.length === 10 ? cleanPhone : '9999999999';
  if (!isMock && cleanPhone.length !== 10) {
    const err = new Error('Phone must be 10 digits');
    err.statusCode = 400;
    throw err;
  }

  let order = null;
  if (!isMock) {
    try {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    } catch (error) {
      if (!isDbConnectivityError(error)) throw error;
    }
  }

  if (!isMock && !order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const safeAmountFromBody = Number.isFinite(amountRupees) ? Math.max(1, Math.round(amountRupees)) : null;
  const effectiveOrder = order || {
    id: orderId || `MOCK-${Date.now()}`,
    totalRupees: safeAmountFromBody || 1,
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
  let provider = 'mock';
  let warning = null;

  if (!shouldAttemptRazorpay) {
    paymentLinkId = `plink_mock_${Math.random().toString(36).substring(2, 9)}`;
    paymentLinkUrl = `https://rzp.io/i/mock-${effectiveOrder.id}`;
    warning = 'Using mock link. Razorpay SMS requires valid keys and phone.';
  } else {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const payload = {
      amount: amountPaise,
      currency: 'INR',
      reference_id: effectiveOrder.id,
      description: `Jhunu's Kitchen - Order ${effectiveOrder.id} (Dummy/Test Mode)` ,
      customer: {
        name: effectiveOrder.customerName || 'Customer',
        contact: effectivePhone,
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
      paymentLinkId = `plink_mock_${Math.random().toString(36).substring(2, 9)}`;
      paymentLinkUrl = `https://rzp.io/i/mock-${effectiveOrder.id}`;
      warning = `Razorpay SMS link failed (${rpRes.status}). Fallback mock link used.`;
    } else {
      paymentLinkId = rpJson?.id || null;
      paymentLinkUrl = rpJson?.short_url || rpJson?.shortUrl || rpJson?.url || null;
      provider = 'razorpay';
    }
  }

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerPhone: order.customerPhone || effectivePhone,
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
      isMock: !shouldAttemptRazorpay || String(paymentLinkUrl || '').includes('/mock-'),
    },
    provider,
    ...(warning ? { warning } : {}),
  };
}
