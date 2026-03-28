import crypto from 'node:crypto';

export function generateOrderId() {
  const num = crypto.randomInt(1000, 10000);
  return `JK-${num}`;
}

