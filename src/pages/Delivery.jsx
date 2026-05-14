import React, { useEffect, useMemo, useState } from 'react';

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const category = item.category || 'Menu';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
}

export default function Delivery() {
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [step, setStep] = useState('order');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      try {
        setLoadingMenu(true);
        setMenuError('');
        const res = await fetch('/api/menu');
        if (!res.ok) throw new Error('Could not load menu');
        const data = await res.json();
        if (!cancelled) {
          setMenuItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (error) {
        if (!cancelled) setMenuError(error?.message || 'Could not load menu');
      } finally {
        if (!cancelled) setLoadingMenu(false);
      }
    }

    loadMenu();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => groupByCategory(menuItems), [menuItems]);

  const selectedItems = useMemo(() => {
    return menuItems
      .map((item) => ({
        menuItemId: item.id,
        name: item.name,
        priceRupees: item.priceRupees,
        quantity: quantities[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [menuItems, quantities]);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.priceRupees * item.quantity, 0),
    [selectedItems],
  );
  const discount = subtotal >= 500 ? Math.round(subtotal * 0.05) : 0;
  const deliveryCharge = subtotal > 0 && subtotal < 500 ? 40 : 0;
  const total = subtotal - discount + deliveryCharge;

  const handleQuantityChange = (id, value) => {
    const quantity = Math.max(0, Number.parseInt(value, 10) || 0);
    setQuantities((prev) => ({ ...prev, [id]: quantity }));
  };

  const handleOrderSubmit = (event) => {
    event.preventDefault();
    if (selectedItems.length === 0) {
      window.alert('Please select at least one item before ordering.');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setPaymentError('');
    setPaymentLinkUrl('');

    try {
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress,
          specialInstructions,
          paymentMethod,
          items: selectedItems,
        }),
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        throw new Error(orderData?.error || 'Failed to place order');
      }

      const createdOrderId = orderData?.order?.id;
      setOrderId(createdOrderId || '');

      if (paymentMethod === 'upi' && createdOrderId) {
        const payRes = await fetch('/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrderId,
            phone: customerPhone,
          }),
        });
        const payData = await payRes.json().catch(() => ({}));
        if (!payRes.ok) {
          throw new Error(payData?.error || 'Could not generate payment link');
        }
        setPaymentLinkUrl(payData?.paymentLink?.url || '');
      }

      setStep('success');
    } catch (error) {
      setPaymentError(error?.message || 'Checkout failed');
      if (step !== 'success') {
        setStep('payment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetOrder = () => {
    setQuantities({});
    setStep('order');
    setPaymentMethod('upi');
    setSubmitting(false);
    setOrderId('');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setSpecialInstructions('');
    setPaymentLinkUrl('');
    setPaymentError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-delivery" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center' }}>
          {step === 'success' ? 'Order Confirmed!' : 'Home Delivery'}
        </h1>
        <p style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '750px', marginInline: 'auto', lineHeight: '1.6' }}>
          {step === 'success'
            ? 'Your order is in the kitchen now. You can track it live from the order ID below.'
            : 'Freshly made meals, clean backend flow, and a polished ordering experience from menu to payment.'}
        </p>

        <div style={{ maxWidth: '760px', margin: '0 auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          {step === 'order' && (
            <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>
                  Select Your Items
                </h3>

                {loadingMenu && <div style={{ color: 'var(--text-muted)' }}>Loading menu...</div>}
                {!loadingMenu && menuError && <div style={{ color: 'var(--primary)' }}>{menuError}</div>}

                {!loadingMenu && !menuError && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {Object.entries(categories).map(([category, items]) => (
                      <div key={category}>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{category}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          {items.map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0.75rem', borderRadius: 'var(--radius-sm)', background: '#fff', border: '1px solid rgba(62, 39, 35, 0.08)' }}>
                              <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem', maxWidth: '460px' }}>{item.description}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Rs. {item.priceRupees}</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={quantities[item.id] || ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  placeholder="0"
                                  style={{ width: '64px', padding: '0.45rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', textAlign: 'center' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ marginBottom: '1rem', marginTop: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>
                  Delivery Details
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)' }}
                  />
                  <textarea
                    required
                    rows="3"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="House no, street, landmark"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', resize: 'vertical' }}
                  />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)' }}
                  />
                  <textarea
                    rows="2"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Special instructions for the kitchen or delivery partner"
                    style={{ width: '100%', padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ padding: '1.2rem', background: 'rgba(211, 47, 47, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(211, 47, 47, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <strong>Rs. {subtotal}</strong>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                    <span>Bulk order discount</span>
                    <strong>- Rs. {discount}</strong>
                  </div>
                )}
                {deliveryCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)' }}>
                    <span>Delivery charge</span>
                    <strong>+ Rs. {deliveryCharge}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(211, 47, 47, 0.2)', paddingTop: '0.65rem', marginTop: '0.3rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>Rs. {total}</strong>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '1.1rem', width: '100%', fontSize: '1.05rem' }} disabled={loadingMenu || !!menuError}>
                Proceed to Payment
              </button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ marginBottom: '0.25rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem' }}>
                Select Payment Method
              </h3>

              <label style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(62, 39, 35, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>UPI payment link</span>
              </label>

              <label style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(62, 39, 35, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>Cash on delivery</span>
              </label>

              {paymentMethod === 'upi' && (
                <div style={{ padding: '1rem', background: '#e8f5e9', borderRadius: 'var(--radius-md)', color: '#2e7d32' }}>
                  A secure Razorpay payment link will be generated for this order and attached to the order record.
                </div>
              )}

              {paymentError && (
                <div style={{ padding: '0.9rem 1rem', background: '#fff5f5', border: '1px solid rgba(211, 47, 47, 0.2)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                  {paymentError}
                </div>
              )}

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep('order')} style={{ flex: 1, padding: '1rem' }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1rem' }} disabled={submitting}>
                  {submitting ? 'Processing...' : `Place Order for Rs. ${total}`}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--accent-olive)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem' }}>
                OK
              </div>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.8rem', fontFamily: 'var(--font-heading)' }}>
                Order saved to the backend
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: '1.6' }}>
                Order ID: <strong style={{ color: 'var(--text-main)' }}>{orderId}</strong>
              </p>

              {paymentMethod === 'upi' && (
                <div style={{ marginBottom: '2rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.08)', padding: '1rem' }}>
                  <div style={{ fontWeight: '700', marginBottom: '0.45rem', color: 'var(--text-main)' }}>Payment Link</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {paymentLinkUrl ? 'The backend generated a payment link and attached it to your order.' : paymentError || 'Payment link is not available yet.'}
                  </div>
                  {paymentLinkUrl && (
                    <a href={paymentLinkUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                      Open payment link
                    </a>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { window.location.href = '/track'; }} className="btn btn-secondary glass" style={{ padding: '0.8rem 1.5rem' }}>
                  Track Order
                </button>
                <button onClick={resetOrder} className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                  Place Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
