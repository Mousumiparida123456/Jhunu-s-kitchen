import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <Utensils className="logo-icon" />
          <span>Jhunu's Kitchen</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/about">Our Story</Link>
          <Link to="/delivery">Delivery</Link>
          <Link to="/track">Track Order</Link>
        </nav>
        
        <div className="nav-actions">
          <Link to="/delivery" className="btn btn-primary">Order Delivery</Link>
        </div>
      </div>
    </header>
  );
}
