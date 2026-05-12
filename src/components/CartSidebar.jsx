import { useState } from 'react';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const { items, updateQuantity, removeItem, couponCode, setCoupon, applyCoupon, couponApplied, couponDiscount, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const total = getTotal();
  const minOrder = 8.00;
  const isMinMet = subtotal >= minOrder;

  const handleApplyCoupon = () => {
    setCoupon(couponInput);
    const result = applyCoupon();
    if (!result.success) {
      setCouponError('Ungültiger Gutscheincode');
    } else {
      setCouponError('');
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <aside className="cart-sidebar">
      {/* Login prompt */}
      <div className="cart-login-prompt">
        <p>Noch nicht angemeldet?</p>
        <small>Melde dich an und genieße zahlreiche Vorteile!</small>
        <button className="btn-jetzt-anmelden" onClick={() => document.dispatchEvent(new CustomEvent('openLogin'))}>
          JETZT ANMELDEN
        </button>
      </div>

      {/* Cart */}
      <div className="cart-box">
        <h3 className="cart-title">Warenkorb</h3>

        {/* Coupon */}
        <div className="coupon-row">
          <p className="coupon-label">Hast du einen Gutschein?</p>
          <div className="coupon-input-row">
            <input
              type="text"
              placeholder="Gutscheincode"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value); setCouponError(''); }}
              className="coupon-input"
            />
            <button className="btn-einlosen" onClick={handleApplyCoupon}>EINLÖSEN</button>
          </div>
          {couponError && <p className="coupon-error">{couponError}</p>}
          {couponApplied && <p className="coupon-success">✓ {couponDiscount}% Rabatt angewendet!</p>}
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Dein Warenkorb ist leer</p>
          </div>
        ) : (
          <>
            <div className="cart-items-header">
              <span>Artikel</span>
              <span>Summe</span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-left">
                    <span className="cart-item-qty">{item.quantity}x</span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-thumb"
                      onError={(e) => { e.target.src = item.imageFallback || ''; }}
                    />
                    <span className="cart-item-name">{item.name}</span>
                  </div>
                  <span className="cart-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  <div className="cart-item-controls">
                    <button className="qty-ctrl" onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <button className="qty-ctrl" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    <button className="qty-ctrl remove" onClick={() => removeItem(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {couponApplied && (
              <div className="cart-discount-row">
                <span>Rabatt ({couponDiscount}%)</span>
                <span>−{(subtotal - total).toFixed(2)} €</span>
              </div>
            )}

            <div className="cart-total-row">
              <span>Gesamtbestellwert:</span>
              <div className="cart-total-right">
                <strong>{total.toFixed(2)} €</strong>
                <small>(inkl. MwSt.)</small>
              </div>
            </div>

            {!isMinMet && (
              <p className="cart-min-order">
                Mindestbestellwert ab {minOrder.toFixed(2)} € (Getränke zählen nicht zum Mindestbestellwert)
              </p>
            )}

            <button
              className="btn-zur-kasse"
              onClick={handleCheckout}
              disabled={!isMinMet}
            >
              ZUR KASSE
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
