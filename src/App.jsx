import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useAuthStore } from './store';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Admin from './pages/Admin';

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  // Listen for Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        logout();
      }
    });
    return unsub;
  }, []);

  // Listen for custom event from CartSidebar
  useEffect(() => {
    const handler = () => setShowLogin(true);
    document.addEventListener('openLogin', handler);
    return () => document.removeEventListener('openLogin', handler);
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#fff', color: '#1a1a1a', fontFamily: 'Outfit, sans-serif' },
          success: { iconTheme: { primary: '#e63946', secondary: '#fff' } },
        }}
      />

      <Header onLoginClick={() => setShowLogin(true)} />

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-col">
            <div className="footer-logo">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e63946', letterSpacing: '1px' }}>KING OF</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#e63946', letterSpacing: '1px', lineHeight: 1 }}>SUSHI</span>
                <span style={{ fontSize: '0.6rem', color: '#999', letterSpacing: '3px' }}>TRIER</span>
              </div>
            </div>
            <p>Frisches Sushi direkt zu dir nach Hause. Authentisch. Schnell. Lecker.</p>
          </div>
          <div className="footer-col">
            <h4>Kontakt</h4>
            <p>📍 Karl-Marx-Straße 73, 54290 Trier</p>
            <p>📞 +491702317212</p>
            <p>✉ info@king-of-sushi.de</p>
            <p>🕐 Mo–So: 11:00 – 22:00 Uhr</p>
          </div>
          <div className="footer-col">
            <h4>Informationen</h4>
            <a href="#">Impressum</a>
            <a href="#">Datenschutzerklärung</a>
            <a href="#">AGB</a>
            <a href="#">Verwendung von Cookies</a>
            <a href="#">Allergene & Zusatzstoffe</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} KING OF SUSHI Trier. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}
