import React from 'react';

export default function About() {
  return (
    <div className="page-about" style={{ paddingTop: '120px', minHeight: '80vh', paddingBottom: '4rem' }}>
      <div className="container">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{fontSize: '3rem', fontFamily: 'var(--font-heading)', color: 'var(--primary)', marginBottom: '2rem'}}>
            Our Story
          </h1>
          <p style={{fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '1.5rem'}}>
            Jhunu's Kitchen was born out of a profound love for traditional, home-cooked food. What started as cooking for family gatherings has blossomed into a beloved local staple sharing our rich heritage.
          </p>
          <p style={{fontSize: '1.15rem', color: 'var(--text-main)', lineHeight: '1.8'}}>
            Every dish we serve is crafted with passion, using passed-down recipes and secret spice blends that make every bite feel like a warm hug from home. We invite you to our table to taste the difference that love makes.
          </p>
        </div>
      </div>
    </div>
  );
}
