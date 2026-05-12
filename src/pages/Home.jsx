import { useEffect } from "react";
import { useMenuStore } from "../store";
import { menuData as initialData } from "../data";
import MenuItem from "../components/MenuItem";
import CartSidebar from "../components/CartSidebar";

export default function Home() {
  const { menuData, setMenuData } = useMenuStore();
  useEffect(() => {
    if (menuData.length === 0) setMenuData(initialData);
  }, []);
  const data = menuData.length > 0 ? menuData : initialData;
  return (
    <div className="home-layout">
      <main className="main-content">
        <div className="hero-banner">
          <img
            src="https://static.lieferando.de/images/restaurants/de/N7Q3PRO/logo_465x320.png"
            alt="King of Sushi Trier"
            className="hero-banner-img"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1200&h=400"; }}
          />
          <div className="hero-banner-overlay">
            <div className="hero-banner-logo">
              <span className="hero-logo-king">KING OF</span>
              <span className="hero-logo-sushi">SUSHI</span>
              <span className="hero-logo-city">TRIER</span>
            </div>
            <p>Karl-Marx-Strasse 73 · 54290 Trier · +491702317212</p>
          </div>
        </div>
        {data.map((category, idx) => {
          const catId = category.category.toLowerCase().replace(/[^a-z0-9]/g, "-");
          return (
            <section key={idx} id={"cat-" + catId} className="menu-section">
              <h2 className="category-title">{category.category}</h2>
              <div className="menu-grid">
                {category.items.map((item) => (<MenuItem key={item.id} item={item} />))}
              </div>
            </section>
          );
        })}
      </main>
      <CartSidebar />
    </div>
  );
}