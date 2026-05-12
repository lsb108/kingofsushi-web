import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore, useCartStore } from "../store";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Sushi Menus",
  "Suppe, Vorspeisen & Salat",
  "Hauptgerichte",
  "Maki (6 Stk.)",
  "Futo Maki (5 Stk.)",
  "Temaki (1 Stk.)",
  "Inside Out (8 Stk.)",
  "Paniertes Sushi",
  "Sashimi",
  "Special Rolls",
  "Nigiri (2 Stk.)",
  "Gunkan Maki (2 Stk.)",
  "Dessert",
  "Extras",
  "Alkoholische Getränke",
];

export default function Header({ onLoginClick }) {
  const { user, isAdmin, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.getCount());
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    toast.success("Erfolgreich abgemeldet");
  };

  const scrollToCategory = (cat) => {
    const id = cat.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const el = document.getElementById(`cat-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Hamburger mobile */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Category nav */}
        <nav className={`cat-nav ${menuOpen ? "open" : ""}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="cat-nav-item"
              onClick={() => scrollToCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Logo - King of Sushi */}
        <Link to="/" className="header-logo">
          <div className="logo-circle">
            <span className="logo-king">KING OF</span>
            <span className="logo-sushi">SUSHI</span>
            <span className="logo-sub">TRIER</span>
          </div>
        </Link>

        {/* Right actions */}
        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.displayName || "U"
                  )}&background=e63946&color=fff`
                }
                alt={user.displayName}
                className="user-avatar"
              />
              <div className="user-dropdown">
                <span className="user-name">{user.displayName}</span>
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item admin-link">
                    ⚙ Admin Panel
                  </Link>
                )}
                <button className="dropdown-item" onClick={handleLogout}>
                  Abmelden
                </button>
              </div>
            </div>
          ) : (
            <button className="btn-anmelden" onClick={onLoginClick}>
              Anmelden
            </button>
          )}

          {/* Mobile cart badge */}
          <button
            className="mobile-cart-btn"
            onClick={() =>
              document.dispatchEvent(new CustomEvent("toggleMobileCart"))
            }
          >
            🛒{" "}
            {cartCount > 0 && (
              <span className="mobile-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
