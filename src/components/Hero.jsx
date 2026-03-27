import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content container animate-fade-in delay-100">
        <h1>Taste the Love of Jhunu's Kitchen</h1>
        <p className="hero-subtitle">Authentic home-cooked meals, prepared with love, traditional recipes, and pure ingredients.</p>
        <div className="hero-buttons">
          <Link to="/menu" className="btn btn-primary">Explore Menu</Link>
          <Link to="/delivery" className="btn btn-secondary glass">Order Delivery</Link>
        </div>
      </div>
    </section>
  );
}
