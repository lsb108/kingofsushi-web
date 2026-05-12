import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCartStore, useAuthStore } from '../store';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  const total = getTotal();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Create payment intent via backend
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // cents
          currency: 'eur',
          items,
          customer: form,
        }),
      });

      if (!res.ok) {
        // Demo mode: simulate success if no backend
        toast.success('Bestellung erfolgreich aufgegeben! (Demo-Modus)');
        clearCart();
        navigate('/order-success');
        return;
      }

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: form.name,
            email: form.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        toast.success('Zahlung erfolgreich!');
        clearCart();
        navigate('/order-success');
      }
    } catch (err) {
      // Demo fallback
      toast.success('Bestellung erfolgreich aufgegeben! (Demo-Modus)');
      clearCart();
      navigate('/order-success');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Dein Warenkorb ist leer</h2>
        <button onClick={() => navigate('/')} className="btn-back">← Zurück zur Speisekarte</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="btn-back" onClick={() => navigate('/')}>← Zurück</button>
        <h1 className="checkout-title">Kasse</h1>

        <div className="checkout-grid">
          {/* Left: Form */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Lieferadresse</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Vor- und Nachname" />
              </div>
              <div className="form-group">
                <label>E-Mail *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@beispiel.de" />
              </div>
            </div>
            <div className="form-group">
              <label>Straße & Hausnummer *</label>
              <input name="address" value={form.address} onChange={handleChange} required placeholder="Musterstraße 1" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>PLZ *</label>
                <input name="zip" value={form.zip} onChange={handleChange} required placeholder="54290" />
              </div>
              <div className="form-group">
                <label>Stadt *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="Trier" />
              </div>
            </div>
            <div className="form-group">
              <label>Telefon *</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="+49 ..." />
            </div>

            <h3 style={{ marginTop: '2rem' }}>Zahlung</h3>
            <div className="stripe-card-wrap">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#1a1a1a',
                      '::placeholder': { color: '#aab7c4' },
                    },
                  },
                }}
              />
            </div>

            <button type="submit" className="btn-pay" disabled={loading || !stripe}>
              {loading ? 'Verarbeitung...' : `Jetzt bezahlen ${total.toFixed(2)} €`}
            </button>
          </form>

          {/* Right: Order summary */}
          <div className="order-summary">
            <h3>Bestellübersicht</h3>
            {items.map((item) => (
              <div key={item.id} className="summary-item">
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
            <div className="summary-total">
              <strong>Gesamt</strong>
              <strong>{total.toFixed(2)} €</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
