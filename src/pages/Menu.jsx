import React, { useEffect, useMemo, useState } from 'react';
import './Menu.css';

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('/api/menu');
        if (!res.ok) {
          let message = `Failed to load menu (HTTP ${res.status})`;
          try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const body = await res.json();
              if (body?.error) message = String(body.error);
            }
          } catch {
            // ignore
          }
          throw new Error(message);
        }
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const menuItems = useMemo(() => {
    const grouped = {};
    for (const item of items) {
      const category = item.category || 'Menu';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    }
    return grouped;
  }, [items]);

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
        {loading && (
          <div className="text-center" style={{ padding: '2rem 0', color: 'var(--text-muted)' }}>
            Loading menu...
          </div>
        )}

        {!loading && error && (
          <div className="text-center" style={{ padding: '2rem 0', color: 'var(--primary)' }}>
            {error} (is the API running?)
          </div>
        )}

        {!loading &&
          !error &&
          Object.entries(menuItems).map(([category, categoryItems], i) => (
            <div key={category} className={`menu-category animate-fade-in delay-${(i + 2) * 100}`}>
              <h2 className="category-title">{category}</h2>
              <div className="divider mx-auto" style={{ margin: '0 auto 1.5rem auto' }}></div>
              <div className="menu-items-list">
                {categoryItems.map((item) => (
                  <div key={item.id} className="menu-item glass" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <img src={item.imagePath} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />
                    <div style={{ flex: 1 }}>
                      <div className="item-header" style={{ borderBottom: 'none', marginBottom: '0.2rem', paddingBottom: 0 }}>
                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                        <span className="item-price">₹ {item.priceRupees}</span>
                      </div>
                      <p className="item-desc">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        <div className="text-center dietary-section animate-fade-in delay-500">
          <p className="dietary-note">
            Many of our dishes can be made Gluten-Free or Vegan upon request.
            <br />
            Please ask your server for details.
          </p>
        </div>
      </div>
    </div>
  );
}
