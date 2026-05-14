import crypto from 'node:crypto';

export function generateOrderId() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const token = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `JK-${date}-${token}`;
}
