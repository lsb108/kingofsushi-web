import { useState } from 'react';
import { useCartStore } from '../store';

export default function MenuItem({ item }) {
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [imgError, setImgError] = useState(false);

  const cartItem = cartItems.find((i) => i.id === item.id);
  const qty = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => addItem(item);

  return (
    <div className="menu-card">
      <div className="menu-card-body">
        <div className="menu-card-info">
          <div className="menu-card-top">
            <h4 className="menu-card-name">
              {item.name}
              <span className="info-icon" title={item.description}>ℹ</span>
            </h4>
            {qty === 0 ? (
              <button className="btn-add-item" onClick={handleAdd} aria-label={`${item.name} hinzufügen`}>
                +
              </button>
            ) : (
              <span className="qty-badge">{qty}</span>
            )}
          </div>
          <p className="menu-card-desc">{item.description}</p>
          <div className="menu-card-footer">
            <span className="menu-card-price">{item.price.toFixed(2)} €</span>
            <span className="menu-card-pieces">{item.pieces}</span>
          </div>
          {qty > 0 && (
            <div className="qty-controls-inline">
              <button className="qty-ctrl-sm" onClick={() => updateQuantity(item.id, -1)}>−</button>
              <span>{qty}</span>
              <button className="qty-ctrl-sm" onClick={() => updateQuantity(item.id, 1)}>+</button>
            </div>
          )}
        </div>
        <div className="menu-card-img-wrap">
          <img
            src={imgError ? item.imageFallback : item.image}
            alt={item.name}
            className="menu-card-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
