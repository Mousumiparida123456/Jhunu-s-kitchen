import React, { useState } from 'react';

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    if (orderId.trim() === '') return;
    
    setLoading(true);
    setTrackingData(null); // Clear previous if any
    
    // Simulate API delay for dramatic effect
    setTimeout(() => {
      setLoading(false);
      
      // Mock tracking logic
      setTrackingData({
        id: orderId.toUpperCase(),
        status: 'Preparing', // Mock live status
        items: 'Chicken Biryani, Sweety Lassi',
        estimatedTime: '25-30 min',
        steps: [
          { name: 'Order Received', completed: true, active: false, details: 'We received your order securely.' },
          { name: 'Preparing', completed: true, active: true, details: 'Jhunu is actively preparing your beautiful meal with love and care.' },
          { name: 'Out for Delivery', completed: false, active: false, details: 'Our delivery partner is on the way.' },
          { name: 'Delivered', completed: false, active: false, details: 'Enjoy your hot, home-cooked meal!' }
        ]
      });
    }, 1500);
  };

  return (
    <div className="page-track" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center'}}>
          Track Your Meal
        </h1>
        <p style={{textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto 3rem auto'}}>
          Enter your unique Order ID straight from your receipt below to see live updates directly from Jhunu's Kitchen.
        </p>

        <div style={{ maxWidth: '500px', margin: '0 auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          <form style={{ display: 'flex', gap: '0.8rem', marginBottom: trackingData ? '2rem' : '0' }} onSubmit={handleTrack}>
            <input 
              type="text" 
              placeholder="e.g. JK-4921" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontSize: '1.1rem', outline: 'none', fontFamily: 'var(--font-body)' }}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0 1.5rem', fontSize: '1.1rem', minWidth: '120px' }}>
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {trackingData && (
            <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
               <h3 style={{ fontSize: '1.6rem', borderBottom: '2px solid var(--accent)', paddingBottom: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                 Order {trackingData.id}
               </h3>
               
               <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Estimated Delivery:</span>
                  <strong style={{ color: 'var(--accent-olive)', fontSize: '1.2rem' }}>{trackingData.estimatedTime}</strong>
               </div>

               <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '3px solid rgba(62, 39, 35, 0.1)' }}>
                 {trackingData.steps.map((step, index) => (
                   <div key={index} style={{ marginBottom: index === trackingData.steps.length - 1 ? '0' : '2.5rem', position: 'relative' }}>
                     <div style={{ 
                        position: 'absolute', 
                        left: '-37px', 
                        top: '0', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        background: step.completed ? 'var(--primary)' : '#fff',
                        border: `3px solid ${step.completed ? 'var(--primary)' : 'rgba(62, 39, 35, 0.2)'}`,
                        boxShadow: step.active ? '0 0 0 6px rgba(211, 47, 47, 0.15)' : 'none',
                        transition: 'all 0.3s ease'
                     }}></div>
                     <span style={{ 
                        fontWeight: step.active ? '700' : '600', 
                        color: step.active ? 'var(--primary)' : (step.completed ? 'var(--text-main)' : 'var(--text-muted)'),
                        fontSize: '1.2rem',
                        display: 'block',
                        marginBottom: '0.3rem'
                     }}>
                       {step.name}
                     </span>
                     {(step.active || step.completed) && <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{step.details}</p>}
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
