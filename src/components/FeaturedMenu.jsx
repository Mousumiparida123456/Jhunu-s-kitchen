import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedMenu.css';

const menuItems = [
  {
    id: 1,
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken, exotic spices, and fresh herbs.',
    price: '₹ 120',
    image: '/img/biryani.png',
  },
  {
    id: 2,
    name: 'Pani Puri',
    description: 'Crispy hollow puris filled with spicy tangy water, sweet chutney, and potato mash.',
    price: '₹ 30',
    image: '/img/panipuri.png',
  },
  {
    id: 3,
    name: 'Sweet Lassi',
    description: 'Rich, thick, creamy yogurt drink elegantly garnished with saffron and pistachios.',
    price: '₹ 60',
    image: '/img/sweet_lassi.png',
  },
  {
    id: 4,
    name: 'Chicken Momos',
    description: 'Steamed delicate dumplings filled with juicy minced chicken, served with a fiery red chutney.',
    price: '₹ 60',
    image: '/img/momo.png',
  },
  {
    id: 5,
    name: 'Masala Dosa',
    description: 'Crispy, golden-brown fermented rice crepe served with savory sambar and fresh coconut chutney.',
    price: '₹ 60',
    image: '/img/dosa.png',
  }
];

export default function FeaturedMenu() {
  return (
    <section className="featured-menu" id="menu">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Our Signature Items</h2>
          <div className="divider"></div>
          <p className="section-subtitle">Crafted with passion, served with love.</p>
        </div>
        
        <div className="menu-grid">
          {menuItems.map(item => (
            <div className="menu-card glass" key={item.id}>
              <div className="menu-card-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="menu-card-content">
                <div className="menu-card-header">
                  <h3>{item.name}</h3>
                  <span className="price">{item.price}</span>
                </div>
                <p className="description">{item.description}</p>
                <div className="menu-card-footer">
                  <Link to="/delivery" className="btn-link">Order Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
