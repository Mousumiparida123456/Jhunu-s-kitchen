import React, { useEffect, useMemo, useState } from 'react';

const mockOrders = [
  { id: 'JK-4921', customer: 'Rahul Sharma', items: '2x Chicken Biryani, 1x Masala Cola', total: 560, status: 'Pending', time: '10 mins ago', instructions: 'Make it spicy!' },
  { id: 'JK-4920', customer: 'Priya Patel', items: '1x Margherita Pizza', total: 220, status: 'Preparing', time: '25 mins ago', instructions: 'Extra cheese please.' },
  { id: 'JK-4919', customer: 'Amit Singh', items: '3x Momo, 2x Sweet Lassi', total: 540, status: 'Out for Delivery', time: '45 mins ago', instructions: 'Call before arriving.' },
];

function formatTimeAgo(value) {
  if (!value) return '';
  if (value.includes?.('ago')) return value;

  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return value;

  const mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} mins ago`;

  const hours = Math.round(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.round(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export default function Admin() {
  const [orders, setOrders] = useState(mockOrders);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled && Array.isArray(data.orders)) {
          setOrders(data.orders);
          setApiOnline(true);
        }
      } catch {
        if (!cancelled) setApiOnline(false);
      }
    }

    load();
    const interval = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async (id, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

    try {
      if (!apiOnline) return;
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch {
      // If the API fails, keep the optimistic UI update (demo-friendly).
    }
  };

  const liveOrders = useMemo(() => orders.filter((o) => o.status !== 'Delivered').length, [orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#d32f2f'; // Primary Red
      case 'Preparing':
        return '#ffb300'; // Turmeric
      case 'Out for Delivery':
        return '#f57f17'; // Saffron
      case 'Delivered':
        return '#4caf50'; // Olive Green
      default:
        return '#757575';
    }
  };

  return (
    <div className="page-admin" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem', background: '#fdfbfa' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>Jhunu's Dashboard</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
              {apiOnline ? 'Database connected' : 'Using demo data (start the API to connect DB)'}
            </div>
          </div>
          <span style={{ padding: '0.6rem 1.2rem', background: 'var(--accent-olive)', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '1.1rem' }}>
            Live Orders: {liveOrders}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: `5px solid ${getStatusColor(order.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.3rem', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{order.id}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formatTimeAgo(order.time)}</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.3rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{order.customer}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {order.items} <br /> <strong style={{ color: 'var(--text-main)' }}>Total: ₹ {order.total}</strong>
                </p>
                {order.instructions && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '0.5rem', fontStyle: 'italic', background: 'var(--surface)', padding: '0.5rem', borderRadius: '4px' }}>
                    Note: {order.instructions}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontWeight: '700', color: getStatusColor(order.status), fontSize: '1rem' }}>{order.status}</span>

                {order.status === 'Pending' && (
                  <button onClick={() => updateStatus(order.id, 'Preparing')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Accept
                  </button>
                )}
                {order.status === 'Preparing' && (
                  <button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Dispatch
                  </button>
                )}
                {order.status === 'Out for Delivery' && (
                  <button onClick={() => updateStatus(order.id, 'Delivered')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
