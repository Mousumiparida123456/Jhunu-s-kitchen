import { OrderStatus } from '@prisma/client';

export function toUiStatus(status) {
  switch (status) {
    case OrderStatus.Pending:
      return 'Pending';
    case OrderStatus.Preparing:
      return 'Preparing';
    case OrderStatus.OutForDelivery:
      return 'Out for Delivery';
    case OrderStatus.Delivered:
      return 'Delivered';
    default:
      return 'Pending';
  }
}

export function fromUiStatus(status) {
  switch (status) {
    case 'Pending':
      return OrderStatus.Pending;
    case 'Preparing':
      return OrderStatus.Preparing;
    case 'Out for Delivery':
      return OrderStatus.OutForDelivery;
    case 'Delivered':
      return OrderStatus.Delivered;
    default:
      return null;
  }
}

