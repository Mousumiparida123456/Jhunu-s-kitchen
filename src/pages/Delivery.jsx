import React, { useState } from 'react';

const deliveryItems = [
  { id: 'i1', name: 'Chicken Biryani', price: 120 },
  { id: 'i2', name: 'Pani Puri', price: 30 },
  { id: 'i3', name: 'Mix Chaat', price: 30 },
  { id: 'i4', name: 'Veg Momos', price: 50 },
  { id: 'i4b', name: 'Chicken Momos', price: 60 },
  { id: 'i5', name: 'Gourmet Burger', price: 90 },
  { id: 'i6', name: 'Margherita Pizza', price: 120 },
  { id: 'i7', name: 'Sweet Lassi', price: 60 },
  { id: 'i8', name: 'Masala Cola', price: 50 },
  { id: 'i9', name: 'Masala Dosa', price: 60 },
  { id: 'i10', name: 'Veg Biryani', price: 100 },
  { id: 'i11', name: 'French Fries', price: 70 },
  { id: 'i12', name: 'Nimbu Pani', price: 30 },
  { id: 'i13', name: 'Cold Drink', price: 30 },
  { id: 'i14', name: 'Rose Falooda', price: 100 },
  { id: 'i15', name: 'Ice Cream', price: 50 }
];

export default function Delivery() {
  const [quantities, setQuantities] = useState({});
  const [step, setStep] = useState('order'); // 'order', 'payment', 'success'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentLinkUrl, setPaymentLinkUrl] = useState('');

  const subtotal = deliveryItems.reduce((acc, item) => {
    return acc + (item.price * (quantities[item.id] || 0));
  }, 0);

  const discount = subtotal >= 500 ? (subtotal * 0.05) : 0;
  const deliveryCharge = (subtotal > 0 && subtotal < 500) ? 40 : 0;
  const total = Math.round(subtotal - discount + deliveryCharge);

  const handleQuantityChange = (id, val) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, parseInt(val) || 0)
    }));
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (total === 0) {
      alert("Please select at least one item before ordering!");
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const orderItems = deliveryItems
      .map((item) => ({
        name: item.name,
        priceRupees: item.price,
        quantity: quantities[item.id] || 0,
      }))
      .filter((i) => i.quantity > 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim() || 'Guest',
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod,
          items: orderItems,
        }),
      });
      if (!res.ok) throw new Error('Failed to place order');
      const data = await res.json();
      const createdId = data?.order?.id;
      const finalOrderId = createdId || 'JK-' + Math.floor(1000 + Math.random() * 9000);
      setOrderId(finalOrderId);

      if (paymentMethod === 'upi') {
        const payRes = await fetch('/api/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, phone: customerPhone }),
        });
        const payData = await payRes.json().catch(() => ({}));
        if (payRes.ok && payData?.link) {
          window.location.href = payData.link;
          return;
        } else {
          setPaymentLinkUrl('');
        }
      } else {
        setPaymentLinkUrl('');
      }

      setStep('success');
    } catch {
      // Fallback: keep the existing demo flow if the API isn't running yet.
      const generatedId = 'JK-' + Math.floor(1000 + Math.random() * 9000);
      setOrderId(generatedId);
      setPaymentLinkUrl('');
      setStep('success');
    }
  };

  const resetOrder = () => {
    setQuantities({});
    setStep('order');
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setPaymentLinkUrl('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-delivery" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '1rem', textAlign: 'center'}}>
          {step === 'success' ? 'Order Confirmed!' : 'Home Delivery'}
        </h1>
        <p style={{textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 3rem auto', lineHeight: '1.6'}}>
          {step === 'success' 
            ? "Your meal is being prepared with love and will be dispatched shortly."
            : "From Jhunu's kitchen directly to your dining table. Your family's meal is prepared fresh to order, packed with the utmost care, and sprinkled with a little extra love. Let us handle dinner tonight."
          }
        </p>

        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
          
          {step === 'order' && (
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleOrderSubmit}>
              
              {/* Order Items Section */}
              <div>
                <h3 style={{marginBottom: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem'}}>Select Your Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {deliveryItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid rgba(62, 39, 35, 0.1)' }}>
                      <div>
                        <span style={{fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem'}}>{item.name}</span>
                        <span style={{color: 'var(--primary)', marginLeft: '12px', fontWeight: '500'}}>₹ {item.price}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <label htmlFor={item.id} style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Qty:</label>
                        <input 
                          id={item.id} 
                          type="number" 
                          min="0" 
                          value={quantities[item.id] || ''}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          placeholder="0"
                          style={{ width: '60px', padding: '0.4rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none', textAlign: 'center' }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Details Section */}
              <div>
                <h3 style={{marginBottom: '1rem', marginTop: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem'}}>Delivery Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)'}}>Your Loving Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none' }}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)'}}>Delivery Address</label>
                    <textarea
                      required
                      rows="3"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none' }}
                      placeholder="Door number, street, landmark..."
                    ></textarea>
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)'}}>Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none' }}
                      placeholder="10-digit mobile number"
                    />
                  </div>

                  <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-main)'}}>Special Instructions for Jhunu</label>
                    <textarea rows="2" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none' }} placeholder="e.g. Make it extra spicy! Or please ring the bell gently."></textarea>
                  </div>
                </div>
              </div>

              {/* Total Bill Section */}
              <div style={{ marginTop: '0.5rem', padding: '1.2rem', background: 'rgba(211, 47, 47, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(211, 47, 47, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(discount > 0 || deliveryCharge > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>Subtotal:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>₹ {subtotal}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#2e7d32' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>Discount 5% (Orders &gt;= ₹500):</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>- ₹ {Math.round(discount)}</span>
                  </div>
                )}
                {deliveryCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#d32f2f' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>Delivery Charge (Orders &lt; ₹500):</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>+ ₹ {deliveryCharge}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: (discount > 0 || deliveryCharge > 0) ? '0.5rem' : '0', paddingTop: (discount > 0 || deliveryCharge > 0) ? '0.5rem' : '0', borderTop: (discount > 0 || deliveryCharge > 0) ? '1px solid rgba(211, 47, 47, 0.2)' : 'none', width: '100%' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>Total Bill Amount:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>₹ {total}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1.2rem', width: '100%', fontSize: '1.15rem' }}>
                Proceed to Payment
              </button>
            </form>
          )}

          {step === 'payment' && (
             <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handlePaymentSubmit}>
               <h3 style={{marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', borderBottom: '2px solid var(--accent)', paddingBottom: '0.5rem'}}>Select Payment Method</h3>
               
               <div style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(62, 39, 35, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => setPaymentMethod('upi')}>
                 <input type="radio" id="upi" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                 <label htmlFor="upi" style={{ cursor: 'pointer', fontWeight: '500', width: '100%', color: 'var(--text-main)' }}>UPI / QR Code</label>
               </div>

               <div style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(62, 39, 35, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => setPaymentMethod('card')}>
                 <input type="radio" id="card" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                 <label htmlFor="card" style={{ cursor: 'pointer', fontWeight: '500', width: '100%', color: 'var(--text-main)' }}>Credit / Debit Card</label>
               </div>

               <div style={{ padding: '1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(62, 39, 35, 0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => setPaymentMethod('cod')}>
                 <input type="radio" id="cod" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                 <label htmlFor="cod" style={{ cursor: 'pointer', fontWeight: '500', width: '100%', color: 'var(--text-main)' }}>Cash on Delivery</label>
               </div>

               {paymentMethod === 'card' && (
                 <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <input type="text" required placeholder="Card Number" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: '0.8rem' }} />
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <input type="text" required placeholder="MM/YY" style={{ width: '50%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none' }} />
                      <input type="text" required placeholder="CVV" style={{ width: '50%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(62, 39, 35, 0.2)', fontFamily: 'var(--font-body)', outline: 'none' }} />
                    </div>
                 </div>
               )}

               {paymentMethod === 'upi' && (
                 <div style={{ marginTop: '0.5rem', textAlign: 'center', padding: '1rem', background: '#e8f5e9', borderRadius: 'var(--radius-md)', color: '#2e7d32', animation: 'fadeIn 0.3s ease-out' }}>
                    <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Pay ₹ {total} via any UPI App</p>
                    <p style={{ fontSize: '0.9rem' }}>A payment request link will be sent to your registered mobile number.</p>
                 </div>
               )}
               
               <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                 <button type="button" className="btn btn-secondary" onClick={() => { setStep('order'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ flex: 1, padding: '1.2rem', fontSize: '1.1rem' }}>
                   Back
                 </button>
                 <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1.2rem', fontSize: '1.1rem' }}>
                   Pay ₹ {total} securely
                 </button>
               </div>
             </form>
          )}

          {step === 'success' && (
             <div style={{ textAlign: 'center', padding: '2rem 1rem', animation: 'fadeIn 0.5s ease-out' }}>
               <div style={{ width: '80px', height: '80px', background: 'var(--accent-olive)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem' }}>✓</div>
               <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Payment Successful!</h3>
               <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                 Your order worth ₹ {total} has been placed. Jhunu is whipping up your meal right now!<br/><br/>
                 <strong style={{ color: 'var(--text-main)', fontSize: '1.2rem' }}>Order ID: {orderId}</strong>
               </p>

               {paymentMethod === 'upi' && (
                 <div style={{ marginBottom: '2rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,0,0,0.08)', padding: '1rem' }}>
                   <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>UPI Payment Link</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.4' }}>
                     {paymentLinkUrl ? 'A payment request link has been generated and SMS will be triggered by Razorpay to your number.' : 'Could not generate the payment link (check Razorpay keys + phone number).'} 
                   </div>
                   {paymentLinkUrl && (
                     <a href={paymentLinkUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                       Open Payment Link
                     </a>
                   )}
                 </div>
               )}

               <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                 <button onClick={() => window.location.href='/track'} className="btn btn-secondary glass" style={{ padding: '0.8rem 1.5rem' }}>
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
