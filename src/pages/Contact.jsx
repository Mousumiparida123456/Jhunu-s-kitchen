import React from 'react';

export default function Contact() {
  return (
    <div className="page-contact" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '2rem', textAlign: 'center'}}>
          Reservations & Contact
        </h1>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
          <p style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--text-muted)'}}>
            To book a table, please call us directly or drop by. We look forward to hosting you!
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center'}}>
            <h3 style={{fontSize: '1.5rem', fontFamily: 'var(--font-heading)'}}>Phone</h3>
            <p style={{fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold'}}>(555) 123-4567</p>
            
            <h3 style={{fontSize: '1.5rem', fontFamily: 'var(--font-heading)', marginTop: '1rem'}}>Location</h3>
            <p style={{fontSize: '1.1rem', textAlign: 'center'}}>123 Via Roma<br/>Culinary District</p>
          </div>
        </div>
      </div>
    </div>
  );
}
