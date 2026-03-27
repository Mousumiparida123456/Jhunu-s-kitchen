import React from 'react';
import './Menu.css';

const menuItems = {
  'Street Food & Snacks': [
    { name: 'Pani Puri', price: '₹ 50', desc: 'Crispy hollow puris filled with spicy tangy water and potato mash.', image: '/img/panipuri.png' },
    { name: 'Mix Chaat', price: '₹ 70', desc: 'A delightful mix of crispy papdi, boiled potatoes, chickpeas, yogurt and chutneys.', image: '/img/mix_chaat.png' },
    { name: 'Momos', price: '₹ 120', desc: 'Steamed dumplings filled with savory minced filling, served with fiery red chutney.', image: '/img/momo.png' },
    { name: 'French Fries', price: '₹ 100', desc: 'Crispy golden potato fries seasoned with salt and spices.', image: '/img/french_fries.png' }
  ],
  'Mains': [
    { name: 'Chicken Biryani', price: '₹ 250', desc: 'Aromatic basmati rice cooked with tender meat, spices, and herbs.', image: '/img/biryani.png' },
    { name: 'Masala Dosa', price: '₹ 150', desc: 'Crispy, golden-brown fermented rice crepe served with savory sambar and fresh coconut chutney.', image: '/img/dosa.png' },
    { name: 'Margherita Pizza', price: '₹ 220', desc: 'Classic pizza with fresh tomato sauce, mozzarella cheese, and basil.', image: '/img/margherita_pizza.png' },
    { name: 'Gourmet Burger', price: '₹ 180', desc: 'Juicy patty inside a toasted bun with fresh lettuce, tomatoes, and cheese.', image: '/img/gourmet_burger.png' }
  ],
  'Drinks & Beverages': [
    { name: 'Masala Cola', price: '₹ 60', desc: 'Chilled cola infused with roasted cumin, black salt, and spices.', image: '/img/masala_cola.png' },
    { name: 'Sweet Lassi', price: '₹ 90', desc: 'Thick, creamy yogurt drink sweetened and garnished with dry fruits.', image: '/img/sweet_lassi.png' },
    { name: 'Nimbu Pani', price: '₹ 40', desc: 'Refreshing Indian lemonade made with fresh lemon juice and a hint of salt and sugar.', image: '/img/nimbu_pani.png' },
    { name: 'Cold Drink', price: '₹ 50', desc: 'Chilled carbonated beverage of your choice.', image: '/img/colddrink.png' }
  ],
  'Desserts': [
    { name: 'Rose Falooda', price: '₹ 150', desc: 'A rich dessert drink with rose syrup, vermicelli, sweet basil seeds, and ice cream.', image: '/img/rose_falooda.png' },
    { name: 'Ice Cream', price: '₹ 80', desc: 'A couple scoops of delicious frozen dessert.', image: '/img/icecream.png' }
  ]
};

export default function Menu() {
  return (
    <div className="page-menu">
      <div className="menu-header">
        <div className="header-overlay"></div>
        <div className="container header-content text-center animate-fade-in delay-100">
          <h1>Jhunu's Menu</h1>
          <p>A complete selection of our authentic Indian & Fusion recipes.</p>
        </div>
      </div>

      <div className="container menu-section">
        {Object.entries(menuItems).map(([category, items], i) => (
          <div key={category} className={`menu-category animate-fade-in delay-${(i+2)*100}`}>
            <h2 className="category-title">{category}</h2>
            <div className="divider mx-auto" style={{ margin: '0 auto 1.5rem auto' }}></div>
            <div className="menu-items-list">
              {items.map((item, idx) => (
                <div key={idx} className="menu-item glass" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                  <div style={{ flex: 1 }}>
                    <div className="item-header" style={{ borderBottom: 'none', marginBottom: '0.2rem', paddingBottom: 0 }}>
                      <h3 style={{ margin: 0 }}>{item.name}</h3>
                      <span className="item-price">{item.price}</span>
                    </div>
                    <p className="item-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="text-center dietary-section animate-fade-in delay-500">
          <p className="dietary-note">Many of our dishes can be made Gluten-Free or Vegan upon request.<br/>Please ask your server for details.</p>
        </div>
      </div>
    </div>
  );
}
