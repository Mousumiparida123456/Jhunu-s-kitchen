import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
        
        <div className="footer-brand">
          <h2 className="footer-logo" style={{ color: '#ffb300' }}>Jhunu's Kitchen</h2>
          <p className="footer-description" style={{ color: '#ffffff', opacity: 0.9 }}>
            Bringing the authentic taste, warmth, and love of a mother's home-cooked meals to your table.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">TW</a>
          </div>
        </div>
        
        <div className="footer-links-container">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="/menu">Our Menu</a></li>
            <li><a href="/delivery">Order Delivery</a></li>
            <li><a href="/track">Track Order</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/admin">Dashboard</a></li>
          </ul>
        </div>

        <div className="footer-info">
          <h3>Contact & Location</h3>
          <ul className="info-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', color: '#ffffff' }}>
              <MapPin size={22} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} /> 
              <span style={{ lineHeight: '1.5' }}>MIG 67, Phase 2, Anant Bihar,<br/>Pokhariput, Bhubaneswar</span>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#ffffff' }}>
              <Phone size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} /> 
              <span>+91 7846935856</span>
            </li>
            <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', color: '#ffffff' }}>
              <Clock size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} /> 
              <span style={{ lineHeight: '1.5' }}>Mon-Sun: 11:00 AM - 10:30 PM<br/>Open Every Day</span>
            </li>
          </ul>
        </div>

      </div>
      
      <div className="footer-bottom text-center">
        <p>&copy; {new Date().getFullYear()} Jhunu's Kitchen. All rights reserved.</p>
      </div>
    </footer>
  );
}
