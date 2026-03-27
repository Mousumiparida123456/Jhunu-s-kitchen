import React, { useState } from 'react';

const mockOrders = [
  { id: 'JK-4921', customer: 'Rahul Sharma', items: '2x Chicken Biryani, 1x Masala Cola', total: 560, status: 'Pending', time: '10 mins ago', instructions: 'Make it spicy!' },
  { id: 'JK-4920', customer: 'Priya Patel', items: '1x Margherita Pizza', total: 220, status: 'Preparing', time: '25 mins ago', instructions: 'Extra cheese please.' },
  { id: 'JK-4919', customer: 'Amit Singh', items: '3x Momo, 2x Sweet Lassi', total: 540, status: 'Out for Delivery', time: '45 mins ago', instructions: 'Call before arriving.' },
];

export default function Admin() {
  const [orders, setOrders] = useState(mockOrders);

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return '#d32f2f'; // Primary Red
      case 'Preparing': return '#ffb300'; // Turmeric
      case 'Out for Delivery': return '#f57f17'; // Saffron
      case 'Delivered': return '#4caf50'; // Olive Green
      default: return '#757575';
    }
  };

  return (
    <div className="page-admin" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem', background: '#fdfbfa' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)'}}>
            Jhunu's Dashboard
          </h1>
          <span style={{ padding: '0.6rem 1.2rem', background: 'var(--accent-olive)', color: '#fff', borderRadius: 'var(--radius-sm)', fontWeight: '600', fontSize: '1.1rem' }}>
            Live Orders: {orders.filter(o => o.status !== 'Delivered').length}
          </span>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {orders.map(order => (
            <div key={order.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', borderTop: `5px solid ${getStatusColor(order.status)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <strong style={{ fontSize: '1.3rem', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>{order.id}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{order.time}</span>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.3rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>{order.customer}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>{order.items} <br/> <strong style={{color: 'var(--text-main)'}}>Total: ₹ {order.total}</strong></p>
                {order.instructions && <p style={{ fontSize: '0.9rem', color: 'var(--accent)', marginTop: '0.5rem', fontStyle: 'italic', background: 'var(--surface)', padding: '0.5rem', borderRadius: '4px' }}>Note: {order.instructions}</p>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontWeight: '700', color: getStatusColor(order.status), fontSize: '1rem' }}>{order.status}</span>
                
                {order.status === 'Pending' && <button onClick={() => updateStatus(order.id, 'Preparing')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Accept</button>}
                {order.status === 'Preparing' && <button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dispatch</button>}
                {order.status === 'Out for Delivery' && <button onClick={() => updateStatus(order.id, 'Delivered')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Mark Delivered</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
